# 5th OS — Bootable OS Builder
# Builds a minimal Ubuntu 24.04 rootfs that boots directly into 5th OS
# Run: docker build -t 5th-os-builder . && docker run --privileged -v $(pwd)/output:/output 5th-os-builder

FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Install build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    debootstrap \
    squashfs-tools \
    xorriso \
    isolinux \
    grub-pc-bin \
    grub-efi-amd64-bin \
    grub-efi-amd64-signed \
    mtools \
    dosfstools \
    cpio \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY overlay/ /build/overlay/
COPY dist/ /build/dist/

# Build script
COPY build-rootfs.sh /build/
RUN chmod +x /build/build-rootfs.sh

CMD ["/build/build-rootfs.sh"]
