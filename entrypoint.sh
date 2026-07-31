#!/bin/bash
# ================================================================
# 5TH OS — DESKTOP ENTRYPOINT
# Starts Cinnamon desktop via Xvfb + x11vnc + noVNC
# Also starts 5th OS web dev server + code-server
# ================================================================

set -e

echo "========================================"
echo "  5TH OS · REVENANT DESKTOP"
echo "  Ubuntu 24.04 · Cinnamon · Tactical"
echo "========================================"
echo ""

# ---- Theme defaults ---------------------------------------------
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

# ---- Wallpaper ---------------------------------------------------
if [ ! -f /usr/share/backgrounds/revenant-wallpaper.png ]; then
    echo "[5thOS] Generating Revenant wallpaper..."
    python3 -c "
import struct, zlib
def create_png(w, h, r, g, b):
    def chunk(ct, data):
        c = ct + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    raw = b''
    for y in range(h):
        raw += b'\x00' + bytes([r, g, b]) * w
    return (b'\x89PNG\r\n\x1a\n' +
            chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) +
            chunk(b'IDAT', zlib.compress(raw)) +
            chunk(b'IEND', b''))
with open('/usr/share/backgrounds/revenant-wallpaper.png', 'wb') as f:
    f.write(create_png(1920, 1080, 2, 4, 8))
"
fi

# ---- Cron for auto-updates --------------------------------------
echo "[5thOS] Starting cron (daily apt updates)..."
cron

# ---- Xvfb with proper monitor EDID ---------------------------------
echo "[5thOS] Starting Xvfb on :1 (${RESOLUTION})..."
# Generate a modeline for the resolution to give Mutter valid refresh rate
Xvfb :1 -screen 0 "${RESOLUTION}x24" \
    +extension RANDR \
    +extension GLX \
    +extension COMPOSITE \
    +extension RENDER \
    -dpi 96 \
    -ac \
    &
sleep 1

export DISPLAY=:1

# Set session environment so Cinnamon doesn't reject us
export XDG_SESSION_TYPE=x11
export XDG_CURRENT_DESKTOP=Cinnamon
export XDG_SESSION_CLASS=user
export GDK_BACKEND=x11
export QT_QPA_PLATFORM=xcb

# ---- D-Bus session bus (CRITICAL for Cinnamon) ------------------
echo "[5thOS] Starting D-Bus session bus..."
if [ -z "$DBUS_SESSION_BUS_ADDRESS" ]; then
    eval "$(dbus-launch --sh-syntax --exit-with-session)"
    export DBUS_SESSION_BUS_ADDRESS
    echo "[5thOS] D-Bus session bus: $DBUS_SESSION_BUS_ADDRESS"
fi

# ---- Cinnamon desktop -------------------------------------------
echo "[5thOS] Starting Cinnamon session daemon..."
XDG_SESSION_TYPE=x11 XDG_CURRENT_DESKTOP=Cinnamon XDG_SESSION_CLASS=user \
    cinnamon-session &
sleep 2

echo "[5thOS] Starting Cinnamon window manager + panel..."
# Export these so cinnamon can find the session type
export XDG_SESSION_TYPE=x11
export XDG_CURRENT_DESKTOP=Cinnamon
export XDG_SESSION_CLASS=user
export GDK_BACKEND=x11
# Start cinnamon directly — the session daemon won't auto-spawn it in Docker
cinnamon --replace &
sleep 4

# Verify cinnamon is running
if pgrep -x cinnamon > /dev/null; then
    echo "[5thOS] Cinnamon WM running — panel + desktop active."
else
    echo "[5thOS] WARNING: Cinnamon WM failed. Checking logs..."
    cat /root/.xsession-errors 2>/dev/null | tail -20 || true
fi

# ---- Apply theme + panel config via dconf ------------------------
echo "[5thOS] Applying RevenantOS desktop configuration..."
export DISPLAY=:1

# Wait for Cinnamon to fully initialize
sleep 2

if command -v gsettings &>/dev/null; then
    gsettings set org.cinnamon.desktop.interface gtk-theme 'RevenantOS' 2>/dev/null || true
    gsettings set org.cinnamon.desktop.interface icon-theme 'RevenantOS' 2>/dev/null || true
    gsettings set org.cinnamon.desktop.background picture-uri "file:///usr/share/backgrounds/revenant-wallpaper.png" 2>/dev/null || true
    gsettings set org.cinnamon.desktop.background picture-options 'zoom' 2>/dev/null || true
    gsettings set org.cinnamon.desktop.interface cursor-theme 'RevenantOS' 2>/dev/null || true
    gsettings set org.cinnamon.theme name 'RevenantOS' 2>/dev/null || true
    gsettings set org.cinnamon panels-height "['1:48']" 2>/dev/null || true
    gsettings set org.cinnamon enabled-applets "['panel1:left:0:menu@cinnamon.org', 'panel1:left:1:panel-launchers@cinnamon.org', 'panel1:left:2:window-list@cinnamon.org', 'panel1:right:0:systray@cinnamon.org', 'panel1:right:1:network@cinnamon.org', 'panel1:right:2:sound@cinnamon.org', 'panel1:right:3:calendar@cinnamon.org']" 2>/dev/null || true
    gsettings set org.cinnamon favorite-apps "['firefox.desktop', 'nemo.desktop', 'gnome-terminal.desktop', 'pluma.desktop', 'cinnamon-settings.desktop']" 2>/dev/null || true
    echo "[5thOS] Desktop configuration applied."
else
    echo "[5thOS] WARNING: gsettings not available, skipping theme config."
fi

# ---- x11vnc -----------------------------------------------------
echo "[5thOS] Starting VNC server on :1 (port 5901)..."
x11vnc -display :1 -forever -shared -passwd "${VNC_PW:-revenant}" -rfbport 5901 -quiet &
sleep 1

# ---- noVNC -------------------------------------------------------
echo "[5thOS] Starting noVNC on port 6080..."
websockify --web /usr/share/novnc 6080 localhost:5901 &
sleep 1

# ---- 5th OS web layer -------------------------------------------
if [ -f /workspace/package.json ]; then
    echo "[5thOS] Starting 5th OS web layer on port 3000..."
    cd /workspace && npx vite --host 0.0.0.0 --port 3000 &
fi

# ---- code-server ------------------------------------------------
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
echo "  VNC PW:   ${VNC_PW:-revenant}"
echo "  Theme:    RevenantOS (#020408 / #ef2137)"
echo "========================================"
echo ""

# Keep container alive
tail -f /dev/null
