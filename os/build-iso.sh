#!/bin/bash
# 5th OS — Bootable Live ISO Builder
# Run on Ubuntu 24.04 with root. Creates a USB-bootable ISO.
# Usage: sudo ./build-iso.sh
set -e

ROOTFS="/tmp/5th-os-rootfs"
SQUASHFS="/tmp/5th-os.squashfs"
ISO_DIR="/tmp/5th-os-iso"
DIST="${1:-./dist}"
OUTPUT="${2:-./output/5th-os.iso}"

echo "============================================"
echo "  5th OS — Bootable ISO Builder"
echo "  Target: Ubuntu 24.04 Minimal + 5th OS Desktop"
echo "============================================"

# Stage 1: Bootstrap Ubuntu 24.04 minimal
echo "[1/5] Bootstrapping Ubuntu 24.04 minimal rootfs..."
if [ -d "$ROOTFS" ]; then rm -rf "$ROOTFS"; fi
debootstrap --arch=amd64 --variant=minbase noble "$ROOTFS" http://archive.ubuntu.com/ubuntu/

# Stage 2: Install packages in chroot
echo "[2/5] Installing system packages..."

mount -t proc none "$ROOTFS/proc" 2>/dev/null || true
mount -t sysfs none "$ROOTFS/sys" 2>/dev/null || true
mount -o bind /dev "$ROOTFS/dev" 2>/dev/null || true
mount -o bind /dev/pts "$ROOTFS/dev/pts" 2>/dev/null || true

cat > "$ROOTFS/etc/apt/sources.list" << 'EOF'
deb http://archive.ubuntu.com/ubuntu/ noble main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ noble-updates main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu/ noble-security main restricted universe multiverse
EOF

chroot "$ROOTFS" apt-get update -q
chroot "$ROOTFS" apt-get install -y -q --no-install-recommends \
    linux-image-generic \
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
    python3 \
    casper \
    discover \
    laptop-detect \
    os-prober \
    && rm -rf "$ROOTFS/var/lib/apt/lists"/*

# Stage 3: Configure 5th OS
echo "[3/5] Configuring 5th OS..."

echo "5th-os" > "$ROOTFS/etc/hostname"
cat > "$ROOTFS/etc/hosts" << EOF
127.0.0.1 localhost
127.0.1.1 5th-os
EOF

chroot "$ROOTFS" useradd -m -s /bin/bash -G sudo,audio,video revenant
echo "revenant:revenant" | chroot "$ROOTFS" chpasswd
echo "root:5th-os" | chroot "$ROOTFS" chpasswd

chroot "$ROOTFS" locale-gen en_US.UTF-8
echo "LANG=en_US.UTF-8" > "$ROOTFS/etc/default/locale"
echo "Etc/UTC" > "$ROOTFS/etc/timezone"

# Auto-login
mkdir -p "$ROOTFS/etc/lightdm"
cat > "$ROOTFS/etc/lightdm/lightdm.conf" << EOF
[Seat:*]
autologin-user=revenant
autologin-user-timeout=0
greeter-session=lightdm-gtk-greeter
user-session=openbox
EOF

# Install 5th OS web app
mkdir -p "$ROOTFS/opt/5th-os"
cp -r "$DIST"/* "$ROOTFS/opt/5th-os/"

# Web server for static files
cat > "$ROOTFS/opt/5th-os/server.py" << 'PYEOF'
import http.server, socketserver, os, sys
PORT = 5173
DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    def log_message(self, format, *args):
        pass

with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    httpd.serve_forever()
PYEOF

# Kiosk autostart
mkdir -p "$ROOTFS/home/revenant/.config/openbox"
cat > "$ROOTFS/home/revenant/.config/openbox/autostart" << 'EOF'
#!/bin/bash
# 5th OS Kiosk — boot straight into the OS

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Start web server
python3 /opt/5th-os/server.py &

# Wait for server
sleep 1

# Launch Chromium in full kiosk mode
chromium-browser \
    --kiosk \
    --no-first-run \
    --disable-infobars \
    --noerrdialogs \
    --disable-translate \
    --disable-restore-session-state \
    --disable-session-crashed-bubble \
    --overscroll-history-navigation=0 \
    --disable-pinch \
    http://127.0.0.1:5173/ &

wait
EOF
chmod +x "$ROOTFS/home/revenant/.config/openbox/autostart"

chroot "$ROOTFS" chown -R revenant:revenant /home/revenant

# Enable services
chroot "$ROOTFS" systemctl enable NetworkManager 2>/dev/null || true

# Stage 4: Create squashfs
echo "[4/5] Creating squashfs..."
rm -f "$SQUASHFS"
mksquashfs "$ROOTFS" "$SQUASHFS" -comp xz -noappend -no-progress

# Stage 5: Build ISO
echo "[5/5] Building bootable ISO..."
rm -rf "$ISO_DIR"
mkdir -p "$ISO_DIR/casper"

# Copy squashfs, kernel, initrd
cp "$SQUASHFS" "$ISO_DIR/casper/filesystem.squashfs"
KVER=$(ls "$ROOTFS/boot/vmlinuz-"* 2>/dev/null | head -1)
if [ -n "$KVER" ]; then
    cp "$KVER" "$ISO_DIR/casper/vmlinuz"
    INITRD=$(ls "$ROOTFS/boot/initrd.img-"* 2>/dev/null | head -1)
    if [ -n "$INITRD" ]; then cp "$INITRD" "$ISO_DIR/casper/initrd.img"; fi
fi

# GRUB config
mkdir -p "$ISO_DIR/boot/grub"
cat > "$ISO_DIR/boot/grub/grub.cfg" << 'GRUBEOF'
set timeout=5
set default=0
set gfxmode=1920x1080

menuentry "5th OS — Lelu AIOS" {
    linux /casper/vmlinuz boot=casper quiet splash nomodeset ---
    initrd /casper/initrd.img
}

menuentry "5th OS — Safe Mode (terminal)" {
    linux /casper/vmlinuz boot=casper 3 nomodeset ---
    initrd /casper/initrd.img
}
GRUBEOF

mkdir -p "$OUTPUT_DIR"
OUTPUT_DIR=$(dirname "$OUTPUT")
mkdir -p "$OUTPUT_DIR"

# Build ISO with xorriso
xorriso -as mkisofs \
    -iso-level 3 \
    -full-iso9660-filenames \
    -volid "5TH_OS" \
    -appid "5th OS — Lelu AIOS" \
    -publisher "Mavioni" \
    -preparer "5th OS Builder" \
    -eltorito-boot boot/grub/i386-pc/eltorito.img \
    -no-emul-boot -boot-load-size 4 -boot-info-table \
    -eltorito-alt-boot -e EFI/BOOT/BOOTx64.EFI \
    -no-emul-boot \
    -output "$OUTPUT" \
    "$ISO_DIR" 2>&1 || {
    # Fallback: simpler ISO
    xorriso -as mkisofs \
        -iso-level 3 \
        -volid "5TH_OS" \
        -output "$OUTPUT" \
        "$ISO_DIR"
}

# Cleanup
umount -l "$ROOTFS/proc" 2>/dev/null || true
umount -l "$ROOTFS/sys" 2>/dev/null || true
umount -l "$ROOTFS/dev/pts" 2>/dev/null || true
umount -l "$ROOTFS/dev" 2>/dev/null || true

if [ -f "$OUTPUT" ]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo ""
    echo "============================================"
    echo "  5th OS ISO: $OUTPUT"
    echo "  Size:       $SIZE"
    echo "============================================"
    echo "  Flash to USB:"
    echo "    Linux:  sudo dd if=$OUTPUT of=/dev/sdX bs=4M status=progress"
    echo "    Win:    Use Rufus or balenaEtcher"
    echo "    Mac:    sudo dd if=$OUTPUT of=/dev/rdiskX bs=4m"
    echo "============================================"
else
    echo "ISO BUILD FAILED"
    exit 1
fi
