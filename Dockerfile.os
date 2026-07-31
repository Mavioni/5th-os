# ================================================================
# 5TH OS — FULL DESKTOP LINUX CONTAINER
# Tracks Linux Mint Cinnamon via official Mint repos
# Ubuntu 24.04 base + Mint Cinnamon + VNC + noVNC + Hacking Tools
# Design: #020408 bg, #ef2137 accent, 0px radius, CRT scanlines
# Auto-maintained: daily apt updates track Mint Cinnamon releases
# ================================================================

FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=UTC \
    LANG=en_US.UTF-8 \
    DISPLAY=:1 \
    RESOLUTION=1920x1080 \
    USER=root \
    VNC_PW=revenant

# ---- Add Linux Mint Wilma (22) repository for Cinnamon ----------
# This ensures we track Mint's Cinnamon, not Ubuntu's older version
RUN apt-get update && apt-get install -y --no-install-recommends gnupg wget ca-certificates \
    && mkdir -p /etc/apt/keyrings \
    && wget -qO /etc/apt/keyrings/linuxmint.asc https://raw.githubusercontent.com/linuxmint/linuxmint/main/linuxmint.gpg 2>/dev/null || true \
    && rm -rf /var/lib/apt/lists/*

# Mint Wilma repos for latest Cinnamon
RUN echo "deb [signed-by=/etc/apt/keyrings/linuxmint.asc] http://packages.linuxmint.com wilma main upstream import backport" \
    > /etc/apt/sources.list.d/linuxmint.list \
    && echo "deb http://archive.ubuntu.com/ubuntu noble main restricted universe multiverse" \
    > /etc/apt/sources.list.d/ubuntu.list \
    && echo "deb http://archive.ubuntu.com/ubuntu noble-updates main restricted universe multiverse" \
    >> /etc/apt/sources.list.d/ubuntu.list \
    && echo "deb http://archive.ubuntu.com/ubuntu noble-security main restricted universe multiverse" \
    >> /etc/apt/sources.list.d/ubuntu.list \
    && echo -e 'Package: *\nPin: origin packages.linuxmint.com\nPin-Priority: 700' \
    > /etc/apt/preferences.d/linuxmint.pref

# ---- Base system + Cinnamon desktop (from Mint repos) -----------
RUN apt-get update && apt-get install -y --no-install-recommends \
    cinnamon \
    cinnamon-core \
    lightdm \
    dbus-x11 \
    x11-utils \
    x11-xserver-utils \
    xdg-utils \
    x11vnc \
    xvfb \
    xterm \
    novnc \
    websockify \
    fonts-jetbrains-mono \
    fonts-noto \
    fonts-noto-color-emoji \
    gtk2-engines-murrine \
    gtk2-engines-pixbuf \
    sudo \
    curl \
    wget \
    git \
    vim \
    nano \
    htop \
    neofetch \
    tree \
    jq \
    unzip \
    zip \
    openssh-client \
    bash-completion \
    locales \
    unattended-upgrades \
    cron \
    && locale-gen en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# ---- Node.js 22 (for 5th OS web layer) --------------------------
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# ---- Python 3 + pip ---------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv python3-dev \
    && rm -rf /var/lib/apt/lists/*

# ================================================================
# HACKING TOOLS
# ================================================================

RUN apt-get update && apt-get install -y --no-install-recommends \
    nmap \
    netcat-openbsd \
    tcpdump \
    wireshark \
    dnsutils \
    whois \
    traceroute \
    net-tools \
    sqlmap \
    dirb \
    gobuster \
    ffuf \
    wfuzz \
    nikto \
    john \
    hashcat \
    hydra \
    crunch \
    aircrack-ng \
    reaver \
    metasploit-framework \
    exploitdb \
    foremost \
    binwalk \
    steghide \
    exiftool \
    theharvester \
    dnsrecon \
    subfinder \
    amass \
    radare2 \
    gdb \
    ltrace \
    strace \
    xxd \
    proxychains4 \
    tor \
    torsocks \
    macchanger \
    && rm -rf /var/lib/apt/lists/*

# ---- Python hacking tools ---------------------------------------
RUN pip3 install --break-system-packages \
    impacket pwntools scapy requests beautifulsoup4 shodan censys pycryptodome

# ---- Go ---------------------------------------------------------
RUN curl -fsSL https://go.dev/dl/go1.22.5.linux-amd64.tar.gz | tar -C /usr/local -xz
ENV PATH="/usr/local/go/bin:${PATH}"

# ---- Rust -------------------------------------------------------
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# ---- Ruby -------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends ruby ruby-dev \
    && gem install wpscan \
    && rm -rf /var/lib/apt/lists/*

# ================================================================
# DEV TOOLS
# ================================================================

RUN npm install -g npm@latest oxlint typescript vite
RUN curl -fsSL https://code-server.dev/install.sh | sh

# ================================================================
# AUTO-UPDATE SYSTEM — tracks Linux Mint Cinnamon
# ================================================================

# unattended-upgrades for security patches
RUN echo 'unattended-upgrades unattended-upgrades/enable_auto_updates boolean true' \
    | debconf-set-selections \
    && echo 'APT::Periodic::Update-Package-Lists "1";\nAPT::Periodic::Unattended-Upgrade "1";\nAPT::Periodic::AutocleanInterval "7";' \
    > /etc/apt/apt.conf.d/20auto-upgrades

# Daily cron: full apt upgrade (tracks Mint Cinnamon releases)
RUN echo '0 4 * * * root apt-get update && apt-get upgrade -y && echo "$(date): Cinnamon $(cinnamon --version 2>/dev/null || dpkg -l cinnamon | tail -1 | awk "{print \$3}")" >> /var/log/5th-os-update.log' \
    > /etc/cron.d/5th-os-update \
    && chmod 644 /etc/cron.d/5th-os-update

# ================================================================
# 5TH OS DESKTOP THEME
# ================================================================

RUN mkdir -p /usr/share/themes/RevenantOS/gtk-3.0 \
    /usr/share/themes/RevenantOS/gtk-2.0 \
    /usr/share/themes/RevenantOS/cinnamon \
    /usr/share/icons/RevenantOS \
    /root/.cinnamon/configs

COPY theme/gtk.css /usr/share/themes/RevenantOS/gtk-3.0/gtk.css
COPY theme/cinnamon.css /usr/share/themes/RevenantOS/cinnamon/cinnamon.css
COPY theme/index.theme /usr/share/themes/RevenantOS/index.theme
COPY config/cinnamon-settings.json /root/.cinnamon/configs/

# ---- Wallpaper (solid #020408 with revenant red mark) -----------
COPY assets/wallpaper.png /usr/share/backgrounds/revenant-wallpaper.png

# ---- Desktop launchers ------------------------------------------
COPY launchers/ /usr/share/applications/

# ================================================================
# STARTUP
# ================================================================

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 6080 5901 3000 8080

ENTRYPOINT ["/entrypoint.sh"]
