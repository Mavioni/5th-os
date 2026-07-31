# 5th OS — Revenant Desktop

Linux Mint Cinnamon fork. Tactical, dark, angular. Built for real hardware via live USB ISO.

```
#020408 bg  |  #ef2137 accent  |  0px radius  |  Cinnamon 6.0
```

## What It Is

A custom Ubuntu 24.04-based OS with the Cinnamon desktop, heavily themed in the Revenant design language. Ships with a full hacking/security toolkit, dev toolchain, and code-server for browser-based development.

**NOT a web app.** This is a real Linux distribution that boots from USB or runs in Docker.

## Quick Start

### Docker (Instant)

```bash
docker compose up -d desktop
```

| Service | URL |
|---------|-----|
| Desktop (noVNC) | http://localhost:6080/vnc.html |
| Code Server | http://localhost:8080/ |

VNC password: `revenant`

### Build ISO (for USB flash)

```bash
# Start and verify the desktop container first
docker compose up -d desktop

# Build the ISO from the running container
sudo ./os/build-iso.sh lelu-os-desktop ./output/5th-os.iso

# Flash to USB
sudo dd if=./output/5th-os.iso of=/dev/sdX bs=4M status=progress
```

## What's Inside

### Desktop
- **Cinnamon 6.0** window manager with RevenantOS theme
- Firefox, Nemo file manager, gnome-terminal, Pluma text editor
- System Monitor, GParted, GIMP, LibreOffice
- Dark theme: #020408 background, #ef2137 accents, 0px border radius

### Hacking Toolkit
```
nmap · wireshark · tcpdump · hydra · john · hashcat
aircrack-ng · sqlmap · radare2 · binwalk · exploitdb
gobuster · ffuf · tor · proxychains · metasploit (manual)
impacket · pwntools · scapy
```

### Dev Toolchain
- Node.js 22, Python 3.12, Go, Rust, Ruby
- code-server (VS Code in browser)
- git, vim, neofetch, jq, htop, tree

### Auto-Maintenance
- Daily unattended-upgrades track Cinnamon and security patches
- Kernel updates pulled automatically
- Cron-based apt sync every 24h

## Architecture

```
5th-os/
├── Dockerfile.os       # Container build (Ubuntu 24.04 + Cinnamon + tools)
├── docker-compose.yml  # Single-service: lelu-os-desktop
├── entrypoint.sh       # Xvfb + D-Bus + Cinnamon + VNC startup
├── os/
│   └── build-iso.sh    # ISO builder (exports container as live USB image)
├── theme/
│   ├── gtk.css         # RevenantOS GTK3 theme
│   ├── cinnamon.css    # RevenantOS Cinnamon shell theme
│   └── index.theme     # Theme manifest
├── launchers/          # .desktop entries for all tools
└── config/
    └── cinnamon-settings.json
```

## Access

| Service | Port | Auth |
|---------|------|------|
| noVNC Desktop | 6080 | password: revenant |
| VNC Direct | 5901 | password: revenant |
| Code Server | 8080 | none |

## ISO Deployment

1. Build the ISO: `sudo ./os/build-iso.sh`
2. Flash to USB (8GB+ recommended): `sudo dd if=./output/5th-os.iso of=/dev/sdX bs=4M status=progress`
3. Boot from USB — auto-login into Cinnamon as user `revenant`
4. Passwords: `revenant` (user), `5th-os` (root)

## Design Language

- **Background:** #020408 (deep void black-blue)
- **Accent:** #ef2137 (crimson red)
- **Borders:** 0px radius, clean angular edges
- **Fonts:** Noto Sans (UI), JetBrains Mono (terminal/code)
- **Panel:** 48px height, rgba(2,4,8,0.88)
- **Windows:** Dark titlebar with red focus glow

## Status

Cinnamon desktop container: **running**  
ISO builder: **ready**  
Web app: **removed** — replaced by real Cinnamon desktop
