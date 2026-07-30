#!/bin/bash
# 5th OS — RootFS + ISO Builder
# Creates a bootable live USB image that boots directly into 5th OS
set -e

ROOTFS="/build/rootfs"
SQUASHFS="/build/filesystem.squashfs"
ISO_DIR="/build/iso"
OUTPUT="/output/5th-os.iso"
DIST="/build/dist"
OVERLAY="/build/overlay"

echo "============================================"
echo "  5th OS — Bootable OS Builder"
echo "  Target: Ubuntu 24.04 + 5th OS Desktop"
echo "============================================"

# ============================================
# Stage 1: Bootstrap Ubuntu 24.04 minimal
# ============================================
echo "[1/6] Bootstrapping Ubuntu 24.04 (Noble) minimal rootfs..."
debootstrap --arch=amd64 --variant=minbase noble "$ROOTFS" http://archive.ubuntu.com/ubuntu/

# ============================================
# Stage 2: Install required packages
# ============================================
echo "[2/6] Installing system packages..."

# Mount required filesystems for chroot
mount -t proc none "$ROOTFS/proc"
mount -t sysfs none "$ROOTFS/sys"
mount -o bind /dev "$ROOTFS/dev"
mount -o bind /dev/pts "$ROOTFS/dev/pts"

# Configure apt sources in chroot
cat > "$ROOTFS/etc/apt/sources.list" << 'EOF'
deb http://archive.ubuntu.com/ubuntu/ noble main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ noble-updates main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu/ noble-security main restricted universe multiverse
EOF

chroot "$ROOTFS" apt-get update

# Install minimal graphical stack + kiosk browser
chroot "$ROOTFS" apt-get install -y --no-install-recommends \
    linux-image-generic \
    linux-headers-generic \
    initramfs-tools \
    systemd \
    network-manager \
    wireless-tools \
    wpasupplicant \
    xorg \
    openbox \
    chromium-browser \
    lightdm \
    lightdm-gtk-greeter \
    xinit \
    x11-xserver-utils \
    pulseaudio \
    alsa-utils \
    sudo \
    bash \
    coreutils \
    nano \
    wget \
    curl \
    dbus \
    udev \
    locales \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Stage 3: Configure system
# ============================================

echo "[3/6] Configuring 5th OS system..."

# Set hostname
echo "5th-os" > "$ROOTFS/etc/hostname"
cat > "$ROOTFS/etc/hosts" << 'EOF'
127.0.0.1 localhost
127.0.1.1 5th-os
EOF

# Create revenant user
chroot "$ROOTFS" useradd -m -s /bin/bash -G sudo,audio,video revenant
echo "revenant:revenant" | chroot "$ROOTFS" chpasswd

# Set root password
echo "root:5th-os" | chroot "$ROOTFS" chpasswd

# Set locale
chroot "$ROOTFS" locale-gen en_US.UTF-8
echo "LANG=en_US.UTF-8" > "$ROOTFS/etc/default/locale"

# Set timezone to UTC
echo "Etc/UTC" > "$ROOTFS/etc/timezone"
chroot "$ROOTFS" ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime

# ============================================
# Stage 4: Install 5th OS web app
# ============================================
echo "[4/6] Installing 5th OS desktop..."

# Copy built React app to /opt/5th-os/
mkdir -p "$ROOTFS/opt/5th-os"
cp -r "$DIST"/* "$ROOTFS/opt/5th-os/"

# Create a minimal HTTP server script (Python-based, no install needed)
cat > "$ROOTFS/opt/5th-os/server.py" << 'PYEOF'
import http.server
import socketserver
import os

PORT = 5173
DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    httpd.serve_forever()
PYEOF

# ============================================
# Stage 5: Configure auto-login + kiosk mode
# ============================================

echo "[5/6] Configuring auto-login and kiosk mode..."

# LightDM auto-login
cat > "$ROOTFS/etc/lightdm/lightdm.conf" << 'EOF'
[Seat:*]
autologin-user=revenant
autologin-user-timeout=0
greeter-session=lightdm-gtk-greeter
user-session=openbox
EOF

# Openbox autostart — launches the web server + Chromium kiosk
mkdir -p "$ROOTFS/home/revenant/.config/openbox"
cat > "$ROOTFS/home/revenant/.config/openbox/autostart" << 'EOF'
#!/bin/bash
# 5th OS Kiosk Autostart

# Start the web server
python3 /opt/5th-os/server.py &

# Wait for server to be ready
sleep 1

# Launch Chromium in kiosk mode (fullscreen, no UI)
chromium-browser \
    --kiosk \
    --no-first-run \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --noerrdialogs \
    --disable-translate \
    --disable-features=TranslateUI \
    --overscroll-history-navigation=0 \
    --disable-pinch \
    http://127.0.0.1:5173/ &

# Keep session alive
wait
EOF
chmod +x "$ROOTFS/home/revenant/.config/openbox/autostart"

# Disable screen blanking
mkdir -p "$ROOTFS/home/revenant/.config/openbox"
cat > "$ROOTFS/home/revenant/.xinitrc" << 'EOF'
xset s off
xset -dpms
xset s noblank
exec openbox-session
EOF

# Fix permissions
chroot "$ROOTFS" chown -R revenant:revenant /home/revenant

# Enable NetworkManager
chroot "$ROOTFS" systemctl enable NetworkManager

# ============================================
# Stage 6: Create bootable ISO
# ============================================

echo "[6/6] Creating bootable ISO..."

# Create squashfs from rootfs
mksquashfs "$ROOTFS" "$SQUASHFS" -comp xz -noappend

# Setup ISO directory
mkdir -p "$ISO_DIR/live"
cp "$SQUASHFS" "$ISO_DIR/live/filesystem.squashfs"

# Copy kernel and initrd
KERNEL_VER=$(ls "$ROOTFS/boot/vmlinuz-"* | head -1 | sed 's/.*vmlinuz-//')
cp "$ROOTFS/boot/vmlinuz-$KERNEL_VER" "$ISO_DIR/live/vmlinuz"
cp "$ROOTFS/boot/initrd.img-$KERNEL_VER" "$ISO_DIR/live/initrd.img"

# Create GRUB config
mkdir -p "$ISO_DIR/boot/grub"
cat > "$ISO_DIR/boot/grub/grub.cfg" << 'GRUBEOF'
set timeout=3
set default=0

menuentry "5th OS — Lelu AIOS (Live)" {
    linux /live/vmlinuz boot=live quiet splash nomodeset
    initrd /live/initrd.img
}

menuentry "5th OS — Safe Mode (no graphics)" {
    linux /live/vmlinuz boot=live quiet nomodeset 3
    initrd /live/initrd.img
}
GRUBEOF

# Build ISO with GRUB2 (BIOS + UEFI)
grub-mkrescue -o "$OUTPUT" "$ISO_DIR" \
    --product-name="5th OS" \
    --volume-id="5TH_OS" \
    2>&1 || true

# Fallback: use xorriso directly if grub-mkrescue fails
if [ ! -f "$OUTPUT" ]; then
    echo "grub-mkrescue failed, trying xorriso..."
    xorriso -as mkisofs \
        -iso-level 3 \
        -full-iso9660-filenames \
        -volid "5TH_OS" \
        -output "$OUTPUT" \
        -eltorito-boot isolinux/isolinux.bin \
        -eltorito-catalog isolinux/boot.cat \
        -no-emul-boot -boot-load-size 4 -boot-info-table \
        "$ISO_DIR" 2>&1 || echo "ISO creation failed"
fi

# Cleanup
umount -l "$ROOTFS/proc" 2>/dev/null || true
umount -l "$ROOTFS/sys" 2>/dev/null || true
umount -l "$ROOTFS/dev/pts" 2>/dev/null || true
umount -l "$ROOTFS/dev" 2>/dev/null || true

if [ -f "$OUTPUT" ]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo ""
    echo "============================================"
    echo "  5th OS ISO BUILT SUCCESSFULLY"
    echo "  Output: /output/5th-os.iso"
    echo "  Size:   $SIZE"
    echo "============================================"
    echo ""
    echo "  Flash to USB:"
    echo "    Linux:  sudo dd if=5th-os.iso of=/dev/sdX bs=4M status=progress"
    echo "    Win:    Use Rufus or balenaEtcher"
    echo ""
    echo "  Boot from USB, and 5th OS will boot directly"
    echo "  into the Lelu desktop. No login required."
    echo "============================================"
else
    echo "ISO CREATION FAILED"
    exit 1
fi
