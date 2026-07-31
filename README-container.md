# 5TH OS — QUICK START

## Running Containers

| Service | Container | URL |
|---------|-----------|-----|
| **Desktop OS** | `lelu-os-test` | http://localhost:6080/vnc.html |
| **5th OS Web** | `lelu-os-dev` | http://localhost:3000/5th-os/ |
| **VS Code** | (inside desktop) | http://localhost:8080/ |

## Start Commands

```bash
# Full desktop OS (default)
docker compose up -d desktop

# Web dev only (5th OS web app)
docker compose --profile dev up -d dev

# Production build (nginx serve)
docker compose --profile prod up -d prod
```

## Access

- **noVNC Desktop**: http://localhost:6080/vnc.html (password: `revenant`)
- **VNC Direct**: localhost:5901
- **5th OS Web**: http://localhost:3000/5th-os/
- **VS Code Server**: http://localhost:8080/ (no auth)

## What's Inside

- Ubuntu 24.04 + Cinnamon 6.0.4
- 5th OS Revenant theme (#020408 / #ef2137)
- Node.js 22, Python 3.12, Go, Rust, Ruby
- Hacking tools: nmap, metasploit, hydra, john, wireshark, aircrack-ng, sqlmap, exploitdb, radare2, pwntools, impacket, and more
- Daily auto-updates via cron (tracks Cinnamon releases)
- code-server (VS Code in browser)
- 5th OS web app (Vite hot-reload on port 3000)
