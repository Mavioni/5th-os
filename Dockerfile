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

# ---- Non-root dev user ------------------------------------------
RUN useradd --create-home --shell /bin/bash dev && \
    mkdir -p /workspace && chown dev:dev /workspace

# ---- Global tools -----------------------------------------------
RUN npm install -g npm@latest && \
    npm install -g oxlint typescript vite

# ---- Workspace --------------------------------------------------
WORKDIR /workspace

# Copy package files first for layer caching
COPY --chown=dev:dev package.json package-lock.json* ./

# Install deps (will be re-run on package changes)
RUN npm install

# Copy rest of source
COPY --chown=dev:dev . .

# ---- User -------------------------------------------------------
USER dev

# ---- Entrypoint: dev server -------------------------------------
EXPOSE 3000

# Default: start dev server with host binding for Docker networking
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]
