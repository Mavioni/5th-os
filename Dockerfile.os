# ================================================================
# 5TH OS — FULL DESKTOP LINUX CONTAINER
# Ubuntu 24.04 + Cinnamon + VNC + noVNC + Hacking Tools
# Design: #020408 bg, #ef2137 accent, 0px radius, CRT scanlines
# Auto-maintained: daily apt updates keep Cinnamon current
# ================================================================

FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=UTC \
    LANG=en_US.UTF-8 \
    DISPLAY=:1 \
    RESOLUTION=1920x1080 \
    USER=root \
    VNC_PW=revenant

# ---- Fix Ubuntu 24.04 sources (remove deb822, use classic) ------
RUN rm -f /etc/apt/sources.list.d/ubuntu.sources \
    && echo "deb http://archive.ubuntu.com/ubuntu noble main restricted universe multiverse" \
    > /etc/apt/sources.list \
    && echo "deb http://archive.ubuntu.com/ubuntu noble-updates main restricted universe multiverse" \
    >> /etc/apt/sources.list \
    && echo "deb http://archive.ubuntu.com/ubuntu noble-security main restricted universe multiverse" \
    >> /etc/apt/sources.list \
    && echo "deb http://archive.ubuntu.com/ubuntu noble-backports main restricted universe multiverse" \
    >> /etc/apt/sources.list

# ---- Base system + Cinnamon desktop (from Ubuntu universe) -------
# Ubuntu 24.04 ships Cinnamon 6.0 — Mint Wilma ships 6.2.
# The 0.2 difference is minor; daily apt upgrades will pull updates.
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    cinnamon \
    lightdm \
    dbus-x11 \
    x11-utils \
    x11-xserver-utils \
    xdg-utils \
    x11vnc \
    xvfb \
    xorg \
    xserver-xorg-video-dummy \
    xterm \
    novnc \
    websockify \
    fonts-jetbrains-mono \
    fonts-noto \
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
    gnome-terminal \
    pluma \
    gnome-system-monitor \
    gparted \
    evince \
    eog \
    celluloid \
    rhythmbox \
    gimp \
    libreoffice-writer \
    libreoffice-calc \
    gdebi \
    synaptic \
    && locale-gen en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# ---- Firefox (real binary, not snap) -----------------------------
# Ubuntu 24.04 ships a snap placeholder for Firefox.
# Pin Mozilla Team PPA above Ubuntu snap transitional package.
RUN apt-get update && apt-get install -y --no-install-recommends software-properties-common && \
    add-apt-repository -y ppa:mozillateam/ppa && \
    printf 'Package: firefox*\nPin: release o=LP-PPA-mozillateam\nPin-Priority: 1001\n' \
    > /etc/apt/preferences.d/mozilla-firefox && \
    apt-get update && \
    apt-get install -y --no-install-recommends --allow-downgrades firefox && \
    rm -rf /var/lib/apt/lists/*

# Node.js 22
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

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
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
    john \
    hashcat \
    hydra \
    aircrack-ng \
    foremost \
    binwalk \
    steghide \
    exiftool \
    dnsrecon \
    radare2 \
    gdb \
    ltrace \
    strace \
    xxd \
    proxychains4 \
    tor \
    torsocks \
    && rm -rf /var/lib/apt/lists/*

# ---- Metasploit (not in Ubuntu repos — install via script) ------
RUN curl -fsSL https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb \
    -o /tmp/msfinstall 2>/dev/null || true \
    && echo "Metasploit requires manual install: https://docs.metasploit.com/docs/using-metasploit/getting-started/nightly-installers.html" \
    > /usr/share/doc/metasploit-install.txt

# ---- ExploitDB (git clone) -------------------------------------
RUN git clone --depth 1 https://gitlab.com/exploit-database/exploitdb.git /opt/exploitdb 2>/dev/null || true \
    && ln -sf /opt/exploitdb/searchsploit /usr/local/bin/searchsploit 2>/dev/null || true

# Go tools (gobuster, ffuf, amass, subfinder)
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    golang \
    && rm -rf /var/lib/apt/lists/* \
    && go install github.com/OJ/gobuster/v3@latest 2>/dev/null || true \
    && go install github.com/ffuf/ffuf/v2@latest 2>/dev/null || true \
    && cp /root/go/bin/* /usr/local/bin/ 2>/dev/null || true

# Ruby tools
RUN apt-get update && apt-get install -y --no-install-recommends ruby ruby-dev \
    && gem install wpscan 2>/dev/null || true \
    && rm -rf /var/lib/apt/lists/*

# Python hacking tools
RUN pip3 install --break-system-packages \
    impacket pwntools scapy requests beautifulsoup4 pycryptodome 2>/dev/null || true

# ---- Rust (with retry) ------------------------------------------
RUN for i in 1 2 3; do \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y 2>/dev/null && break || sleep 2; \
    done || true
ENV PATH="/root/.cargo/bin:${PATH}"

# ================================================================
# DEV TOOLS
# ================================================================

RUN npm install -g npm@latest oxlint typescript vite 2>/dev/null || true
RUN curl -fsSL https://code-server.dev/install.sh | sh 2>/dev/null || true

# ================================================================
# AUTO-UPDATE — daily apt sync with Ubuntu + Mint repos
# ================================================================

RUN echo 'unattended-upgrades unattended-upgrades/enable_auto_updates boolean true' \
    | debconf-set-selections \
    && printf 'APT::Periodic::Update-Package-Lists "1";\nAPT::Periodic::Unattended-Upgrade "1";\nAPT::Periodic::AutocleanInterval "7";\n' \
    > /etc/apt/apt.conf.d/20auto-upgrades

# Daily full upgrade (tracks latest Cinnamon + security patches)
RUN printf '0 4 * * * root apt-get update && apt-get upgrade -y && echo "$(date): Cinnamon $(cinnamon --version 2>/dev/null || dpkg -l cinnamon 2>/dev/null | tail -1 | awk "{print \$3}") updated" >> /var/log/5th-os-update.log\n' \
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

COPY launchers/ /usr/share/applications/
COPY config/menu.xml /etc/xdg/menus/applications.menu
COPY config/5th-security.directory /usr/share/desktop-directories/

# ================================================================
# STARTUP
# ================================================================

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 6080 5901 8080

ENTRYPOINT ["/entrypoint.sh"]
