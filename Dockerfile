# ================================================================
# 5TH OS — DEV WORKSPACE CONTAINER
# Node 22 + full dev toolchain for building Lelu AIOS
# ================================================================

FROM node:22-bookworm-slim

# ---- System deps -------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    wget \
    vim \
    nano \
    htop \
    tree \
    jq \
    bash-completion \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---- Global tools -----------------------------------------------
RUN npm install -g npm@latest && \
    npm install -g oxlint typescript vite

# ---- Workspace --------------------------------------------------
WORKDIR /workspace

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

# Install deps (will be re-run on package changes)
RUN npm install

# Copy rest of source
COPY . .

# ---- Expose + Entrypoint: dev server ----------------------------
EXPOSE 3000

# Default: start dev server with host binding for Docker networking
# Run as root in dev — avoids Windows bind-mount permission issues
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]
