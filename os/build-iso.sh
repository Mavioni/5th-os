#!/bin/bash
# 5th OS — Cinnamon Desktop ISO Builder
# Exports the Docker desktop container as a bootable live ISO.
# Usage: sudo ./build-iso.sh
set -e

CONTAINER="${1:-lelu-os-desktop}"
OUTPUT="${2:-./output/5th-os.iso}"
WORK="/tmp/5th-os-iso-build"
ROOTFS="$WORK/rootfs"
ISO_DIR="$WORK/iso"

echo "============================================"
echo "  5th OS — Cinnamon Desktop ISO Builder"
echo "  Source: Docker container '$CONTAINER'"
echo "  Output: $OUTPUT"
echo "============================================"

# === Stage 1: Export container filesystem =========================
echo "[1/6] Exporting container filesystem..."
rm -rf "$WORK"
mkdir -p "$ROOTFS"

docker export "$CONTAINER" | tar -xC "$ROOTFS" --exclude='dev/*' --exclude='proc/*' --exclude='sys/*' --exclude='workspace/node_modules'

# === Stage 2: Install kernel + boot deps in chroot ===============
echo "[2/6] Installing kernel and boot packages..."

mount -t proc none "$ROOTFS/proc" 2>/dev/null || true
mount -t sysfs none "$ROOTFS/sys" 2>/dev/null || true
mount -o bind /dev "$ROOTFS/dev" 2>/dev/null || true
mount -o bind /dev/pts "$ROOTFS/dev/pts" 2>/dev/null || true

chroot "$ROOTFS" apt-get update -q
chroot "$ROOTFS" apt-get install -y -q --no-install-recommends \
    linux-image-generic \
    initramfs-tools \
    casper \
    lupin-casper \
    discover \
    laptop-detect \
    os-prober \
    grub-pc-bin \
    grub-efi-amd64-bin \
    grub-efi-amd64-signed \
    isolinux \
    xorriso \
    && rm -rf "$ROOTFS/var/lib/apt/lists"/*

# === Stage 3: Configure system for live boot ======================
echo "[3/6] Configuring live system..."

echo "5th-os" > "$ROOTFS/etc/hostname"
cat > "$ROOTFS/etc/hosts" << 'EOF'
127.0.0.1 localhost
127.0.1.1 5th-os
EOF

# Keep the existing revenant user from Docker, ensure sudo access
chroot "$ROOTFS" usermod -aG sudo,audio,video,netdev,plugdev revenant 2>/dev/null || true

# Configure LightDM for Cinnamon auto-login
cat > "$ROOTFS/etc/lightdm/lightdm.conf" << 'EOF'
[Seat:*]
autologin-user=revenant
autologin-user-timeout=0
greeter-session=lightdm-gtk-greeter
user-session=cinnamon
EOF

# Set Cinnamon as default session
mkdir -p "$ROOTFS/var/lib/AccountsService/users"
cat > "$ROOTFS/var/lib/AccountsService/users/revenant" << 'EOF'
[User]
Session=cinnamon
XSession=cinnamon
SystemAccount=false
EOF

# Clean up Docker/workspace artifacts from the exported FS
rm -rf "$ROOTFS/workspace" 2>/dev/null || true
rm -f "$ROOTFS/entrypoint.sh" 2>/dev/null || true

# Enable services
chroot "$ROOTFS" systemctl enable NetworkManager 2>/dev/null || true
chroot "$ROOTFS" systemctl enable lightdm 2>/dev/null || true
chroot "$ROOTFS" systemctl set-default graphical.target 2>/dev/null || true

# === Stage 4: Create squashfs =====================================
echo "[4/6] Creating squashfs filesystem..."
SQUASHFS="$WORK/filesystem.squashfs"
mksquashfs "$ROOTFS" "$SQUASHFS" -comp xz -noappend -no-progress -wildcards \
    -e "proc/*" -e "sys/*" -e "dev/*" -e "run/*" -e "tmp/*" \
    -e "var/cache/apt/archives/*" \
    -e "root/.cache/*"

# === Stage 5: Setup ISO structure =================================
echo "[5/6] Assembling ISO..."

rm -rf "$ISO_DIR"
mkdir -p "$ISO_DIR/casper"

cp "$SQUASHFS" "$ISO_DIR/casper/filesystem.squashfs"

# Copy kernel + initrd
KVER=$(ls "$ROOTFS/boot/vmlinuz-"* 2>/dev/null | head -1)
if [ -n "$KVER" ]; then
    cp "$KVER" "$ISO_DIR/casper/vmlinuz"
    INITRD=$(ls "$ROOTFS/boot/initrd.img-"* 2>/dev/null | head -1)
    if [ -n "$INITRD" ]; then cp "$INITRD" "$ISO_DIR/casper/initrd.img"; fi
else
    echo "ERROR: No kernel found in rootfs!"
    exit 1
fi

# Create filesystem.manifest
chroot "$ROOTFS" dpkg-query -W --showformat='${Package} ${Version}\n' > "$ISO_DIR/casper/filesystem.manifest"
cp "$ISO_DIR/casper/filesystem.manifest" "$ISO_DIR/casper/filesystem.manifest-desktop"

# GRUB config
mkdir -p "$ISO_DIR/boot/grub"
cat > "$ISO_DIR/boot/grub/grub.cfg" << 'GRUBEOF'
set timeout=5
set default=0
set gfxmode=1920x1080
set gfxpayload=keep

menuentry "5th OS — Revenant Desktop (Cinnamon)" {
    linux /casper/vmlinuz boot=casper quiet splash nomodeset --
    initrd /casper/initrd.img
}

menuentry "5th OS — Safe Mode (no graphics)" {
    linux /casper/vmlinuz boot=casper quiet nomodeset 3 --
    initrd /casper/initrd.img
}

menuentry "5th OS — Memory Test" {
    linux /casper/vmlinuz boot=casper memtest=1 --
    initrd /casper/initrd.img
}
GRUBEOF

# === Stage 6: Build ISO ===========================================
echo "[6/6] Building bootable ISO..."

mkdir -p "$(dirname "$OUTPUT")"

xorriso -as mkisofs \
    -iso-level 3 \
    -full-iso9660-filenames \
    -volid "5TH_OS" \
    -appid "5th OS — Revenant Desktop" \
    -publisher "Mavioni" \
    -preparer "5th OS ISO Builder" \
    -eltorito-boot boot/grub/i386-pc/eltorito.img \
    -no-emul-boot -boot-load-size 4 -boot-info-table \
    -output "$OUTPUT" \
    "$ISO_DIR" 2>&1 || {
    # Fallback: simpler ISO without EFI
    echo "EFI boot failed, creating BIOS-only ISO..."
    xorriso -as mkisofs \
        -iso-level 3 \
        -volid "5TH_OS" \
        -output "$OUTPUT" \
        "$ISO_DIR"
}

# === Cleanup ======================================================
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
    echo "  Desktop:    Cinnamon 6.0"
    echo "  Theme:      RevenantOS (#020408 / #ef2137)"
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
