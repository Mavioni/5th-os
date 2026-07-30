<p align="center">
  <img src="public/revenant-logo.ico" width="64" alt="5th OS" />
</p>

<h1 align="center">5th OS</h1>
<p align="center"><strong>LELU — The Fifth Element. Your AI Operating System.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.2-%23ef2137" alt="Version" />
  <img src="https://img.shields.io/badge/react-19-%23087ea4" alt="React" />
  <img src="https://img.shields.io/badge/typescript-6.0-%233178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-8.2-%23646cff" alt="Vite" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## What Is This?

5th OS is a web-based **AI Operating System** — not a chatbot in a sidebar, not a wrapper around an LLM API. It is a full desktop environment where the AI *is* the OS. Lelu (named after Leeloo from The Fifth Element) runs the system: she launches apps, manages windows, monitors agents, and executes commands through natural language.

Every operation flows through a strict chain: **SANDBOX → MASTER → VALIDATE → DEPLOY**. Nothing touches the real environment until verified in Nemo Claw, her isolated execution sandbox.

It runs entirely in the browser. No backend. No database. No server. Deploy to GitHub Pages and go.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    5th OS  SHELL                        │
│                                                         │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐ │
│  │   Desktop    │  │  Windows   │  │   Lelu HUD      │ │
│  │  wallpaper   │  │  drag/resize│  │  chat · tasks   │ │
│  │  icons       │  │  min/max   │  │  sandbox · mem  │ │
│  │  hot corners │  │  z-order   │  │  AI sidebar     │ │
│  └──────────────┘  └────────────┘  └─────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  Panel / Taskbar                  │   │
│  │  [L] menu · pinned apps · window list · tray     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Overlays: LockScreen · Workspace Expo · Run · Context  │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    AIOS  COMMAND  BUS                    │
│                                                         │
│  Natural language ──► Command routing ──► OS actions     │
│  "open terminal"      regex patterns      launchApp()    │
│  "switch to ws 2"     intent matching     setWorkspace() │
│  "system status"      fallback to AI      closeWin()     │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  HERMES  CLIENT  (optional)              │
│                                                         │
│  API key ──► full LLM chat ──► Lelu responds naturally  │
│  No key? ──► mock responses with Leeloo voice           │
│  System state injected as context for grounded replies  │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### Desktop Shell
- **Wallpaper** with CRT scanlines, phosphor grid overlay, and vignette
- **Desktop icons** with selection states, double-click to launch apps
- **Hot corner** (top-left) triggers Workspace Expo
- **Right-click context menu** — new folder, paste, terminal here, settings
- **4 workspaces** — Main, Code, Comms, Agents — switch via Expo or keyboard

### Window Manager
- Drag to move, edge-resize, minimize, maximize, close
- Z-ordering with focus tracking
- Per-workspace window isolation
- Window chrome with title bar, icon, and controls

### Lelu HUD (AI Sidebar)
- **Chat tab** — talk to Lelu, she responds. AI-powered with system state context or mock fallback
- **Tasks tab** — live agent task list with step-by-step progress tracking
- **Sandbox tab** — Nemo Claw status, isolation integrity, agent capacity
- **Memory tab** — knowledge store stats, GitNexus index
- Collapsible to a slim edge tab, re-expand on click

### Panel (Taskbar)
- Menu button with app launcher
- Pinned apps (Firefox, Files, Terminal, Editor, Settings)
- Running window list with focus indicators
- System tray: notifications, network, sound, battery, clock, show-desktop

### Applications
| App | Status | Description |
|-----|--------|-------------|
| **Terminal** | Functional | neofetch, ls, launch, agent ls, help, clear |
| **Files** | Stub | File browser placeholder |
| **Settings** | Stub | System settings panel |
| **Text Editor** | Stub | Plain text editing surface |
| **Lelu Companion** | Rich | Character profile, neural map, augmentations, skill tree, knowledge graph |

### Overlays
- **Lock Screen** — clock, password gate ("lelu" / "revenant"), CRT aesthetic
- **Workspace Expo** — ⌘⇧E or hot corner, 4-workspace grid
- **Run Dialog** — F2 / Alt+F2 launcher
- **Error Boundary** — "BIG BA-DA-BOOM" crash screen with reboot button

### AI Integration
- **Command routing** — natural language phrases map to OS actions via regex patterns
- **Hermes client** — full LLM chat pipeline with system state context injection
- **Mock fallback** — Leeloo-character responses when no API key configured
- **Proactive monitoring** — agent stall detection, memory pressure warnings

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 6.0 |
| Build | Vite 8.2 |
| State | Zustand 5 |
| Icons | Lucide React |
| Lint | Oxlint |
| Deploy | GitHub Pages (static) |

Zero backend. Zero database. Zero server dependencies. The entire OS runs in your browser and stores state in memory via Zustand.

---

## Getting Started

```bash
# Clone
git clone https://github.com/Mavioni/5th-os.git
cd 5th-os

# Install
npm install

# Develop
npm run dev          # → http://localhost:5173

# Build
npm run build        # → dist/

# Lint
npm run lint
```

### AI Chat Setup (optional)

To enable real AI responses from Lelu, set an API key in the Settings app or in your browser's localStorage:

```
localStorage.setItem('hermes_api_key', 'your-key-here')
```

Without a key, Lelu uses character-based mock responses — still fun, but not intelligent.

---

## Project Structure

```
src/
├── ai/                    # AI integration layer
│   ├── aiosCommands.ts    # Natural language → OS action routing
│   └── hermesClient.ts    # LLM chat client
├── apps/                  # Applications
│   ├── companion/         # Lelu Companion (character editor)
│   ├── editor/            # Text Editor
│   ├── files/             # File Browser
│   ├── settings/          # System Settings
│   └── terminal/          # Terminal emulator
├── components/
│   ├── hud/               # Lelu sidebar (HUD, avatar, holo unit)
│   ├── overlays/          # Lock screen, expo, run dialog, context menu
│   ├── shell/             # Desktop, panel, start menu
│   ├── ui/                # Shared UI (Icon, ErrorBoundary)
│   └── windows/           # Window manager
├── styles/                # CSS tokens and animations
├── system/                # Zustand store (all OS state)
├── App.tsx                # Root component
└── main.tsx               # Entry point
```

---

## Design Language

5th OS follows a tactical dark aesthetic inspired by military HUDs and cyberpunk interfaces:

- **Background** — deep void: `#020408`
- **Accent** — revenant red: `#ef2137`
- **Secondary** — cyan data: `#22dcff`
- **Success** — emerald: `#10b981`
- **Typography** — system sans-serif for UI, monospace for code/data/readouts
- **Corners** — square (0px radius) — no rounded edges, military-grade
- **Effects** — CRT scanlines, phosphor glow, vignette, holographic frames, scanline overlays
- **Motion** — 120ms standard transitions, 200-280ms for panels, ease-standard curve

The visual language says: *this is a tool, not a toy. This is an OS, not a website.*

---

## Core Directive

```
SANDBOX → MASTER → VALIDATE → DEPLOY
```

Every Lelu operation follows this chain. She never acts directly. She plans in sandbox, commits to master only after validation, and deploys through controlled gates. Nemo Claw is her isolation layer — a container that ensures nothing escapes until proven safe.

---

## Roadmap

- [ ] GitHub Pages deploy with Actions
- [ ] File system browser (mock VFS with localStorage persistence)
- [ ] Settings panel (theme, accounts, privacy)
- [ ] Terminal: more commands, pipe support, script execution
- [ ] Companion: mod installation, skill progression, KG visualization
- [ ] Multi-window snap layouts
- [ ] Notification center with history
- [ ] Real-time agent monitoring dashboard
- [ ] Voice synthesis (Leeloo TTS)

---

<p align="center">
  <sub>Built with ❤️‍🔥 by <a href="https://github.com/Mavioni">Mavioni</a> · "Mool-ti-pass." — Lelu</sub>
</p>
