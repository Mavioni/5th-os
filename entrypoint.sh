#!/bin/bash
# ================================================================
# 5TH OS — DESKTOP ENTRYPOINT
# Starts Cinnamon desktop via Xvfb + x11vnc + noVNC
# Also starts 5th OS web dev server + code-server
# Auto-tracks Linux Mint Cinnamon via daily apt updates
# ================================================================

set -e

echo "========================================"
echo "  5TH OS · REVENANT DESKTOP"
echo "  Linux Mint Cinnamon · Tactical Grade"
echo "========================================"
echo ""

# ---- Apply 5th OS theme defaults --------------------------------
export GTK_THEME=RevenantOS
export GTK_ICON_THEME=RevenantOS

mkdir -p /root/.config/gtk-3.0
cat > /root/.config/gtk-3.0/settings.ini << 'GTKEOF'
[Settings]
gtk-theme-name=RevenantOS
gtk-icon-theme-name=RevenantOS
gtk-font-name=Noto Sans 10
gtk-cursor-theme-name=RevenantOS
gtk-application-prefer-dark-theme=1
GTKEOF

# ---- Generate solid wallpaper (if PNG missing) ------------------
if [ ! -f /usr/share/backgrounds/revenant-wallpaper.png ]; then
    echo "Generating Revenant wallpaper..."
    # Create a minimal valid PNG with #020408 background
    python3 -c "
import struct, zlib
def create_png(width, height, r, g, b):
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    raw = b''
    for y in range(height):
        raw += b'\x00' + bytes([r, g, b]) * width
    return (b'\x89PNG\r\n\x1a\n' +
            chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)) +
            chunk(b'IDAT', zlib.compress(raw)) +
            chunk(b'IEND', b''))
with open('/usr/share/backgrounds/revenant-wallpaper.png', 'wb') as f:
    f.write(create_png(1920, 1080, 2, 4, 8))
"
fi

# ---- Start cron for auto-updates --------------------------------
echo "[5thOS] Starting auto-update daemon (tracks Linux Mint Cinnamon)..."
cron

# ---- Start Xvfb (virtual framebuffer) ---------------------------
echo "[5thOS] Starting Xvfb on :1 ($RESOLUTION)..."
Xvfb :1 -screen 0 "${RESOLUTION}x24" +extension RANDR &
sleep 1

# ---- Start Cinnamon desktop -------------------------------------
echo "[5thOS] Starting Cinnamon desktop..."
export DISPLAY=:1
cinnamon-session &
sleep 2

# Apply RevenantOS theme via gsettings (if dbus is up)
if command -v gsettings &>/dev/null; then
    gsettings set org.cinnamon.desktop.interface gtk-theme 'RevenantOS' 2>/dev/null || true
    gsettings set org.cinnamon.desktop.interface icon-theme 'RevenantOS' 2>/dev/null || true
    gsettings set org.cinnamon.desktop.background picture-uri "file:///usr/share/backgrounds/revenant-wallpaper.png" 2>/dev/null || true
    gsettings set org.cinnamon.theme name 'RevenantOS' 2>/dev/null || true
fi

# ---- Start x11vnc -----------------------------------------------
echo "[5thOS] Starting VNC server on :1 (port 5901)..."
x11vnc -display :1 -forever -shared -passwd "${VNC_PW:-revenant}" -rfbport 5901 -quiet &
sleep 1

# ---- Start noVNC (browser access on port 6080) ------------------
echo "[5thOS] Starting noVNC web client on port 6080..."
websockify --web /usr/share/novnc 6080 localhost:5901 &
sleep 1

# ---- Start 5th OS web dev server (if source mounted) ------------
if [ -f /workspace/package.json ]; then
    echo "[5thOS] Starting 5th OS web layer on port 3000..."
    cd /workspace && npx vite --host 0.0.0.0 --port 3000 &
fi

# ---- Start code-server (VS Code in browser) ---------------------
echo "[5thOS] Starting code-server on port 8080..."
code-server --bind-addr 0.0.0.0:8080 --auth none /workspace 2>/dev/null &

# ---- Ready ------------------------------------------------------
CINN_VER=$(cinnamon --version 2>/dev/null || dpkg -l cinnamon 2>/dev/null | grep '^ii' | awk '{print $3}' || echo "latest")
echo ""
echo "========================================"
echo "  5TH OS DESKTOP READY"
echo "  Cinnamon: $CINN_VER"
echo "  Desktop:  http://localhost:6080/vnc.html"
echo "  5th OS:   http://localhost:3000/5th-os/"
echo "  Code:     http://localhost:8080/"
echo "  Theme:    RevenantOS (#020408 / #ef2137)"
echo "  Auto-sync: Mint Cinnamon (daily)"
echo "========================================"
echo ""

# Keep container alive
tail -f /dev/null
