/**
 * osStore.ts — UNIFIED STORE (backward-compatible)
 *
 * After P0 decomposition, domain stores exist at:
 *   stores/windowStore.ts, stores/uiStore.ts,
 *   stores/aiStore.ts, stores/systemStore.ts
 *
 * This file keeps the original Zustand create() API so all
 * existing `useOSStore((s) => s.x)` and `useOSStore.getState()`
 * calls continue to work. New code should import domain stores directly.
 */

import { create } from 'zustand';

// ================================================================
// TYPES
// ================================================================

export interface AppDefinition {
  id: string; name: string; cat: string; icon: string; comment: string; exec?: string;
}

export interface WindowState {
  id: string; appId: string; title: string; icon: string;
  x: number; y: number; w: number; h: number; z: number;
  minimized: boolean; maximized: boolean; workspace: number;
}

export interface Notification {
  id: string; icon: string; tone: 'success' | 'warning' | 'error' | 'info';
  source: string; title: string; time: string; body: string;
}

export interface ChatMessage {
  from: 'lelu' | 'user'; t: string; text: string;
  system?: string; mono?: boolean;
}

export interface AgentTask {
  id: string; label: string; status: 'running' | 'done' | 'idle';
  icon: string; steps: TaskStep[];
}

export interface TaskStep {
  id: string; label: string; tool: string; arg: string;
  status: 'done' | 'running' | 'pending'; ms?: number | null;
}

export interface CtxMenuItem {
  id: string; label: string; icon?: string; kb?: string; tone?: 'danger';
}

export interface CtxMenu {
  x: number; y: number; items: (CtxMenuItem | '---')[];
}

interface OSState {
  windows: WindowState[]; focusedId: string | null; zTop: number;
  workspace: number; workspaces: { name: string }[];
  menuOpen: boolean; popover: string | null; expo: boolean;
  runDialog: boolean; locked: boolean; ctxMenu: CtxMenu | null;
  altTab: number | null;
  clock: { time: string; date: string }; volume: number;
  notifications: Notification[];
  chatLog: ChatMessage[]; leluThinking: boolean;
  tasks: AgentTask[]; sandboxStatus: string; leluTalking: boolean;
  launchApp: (appId: string) => void;
  closeWin: (id: string) => void; minWin: (id: string) => void;
  maxWin: (id: string) => void;
  moveWin: (id: string, x: number, y: number) => void;
  resizeWin: (id: string, x: number, y: number, w: number, h: number) => void;
  bringToFront: (id: string) => void; showDesktop: () => void;
  setMenuOpen: (v: boolean) => void; setPopover: (v: string | null) => void;
  setExpo: (v: boolean) => void; toggleExpo: () => void;
  setRunDialog: (v: boolean) => void; setLocked: (v: boolean) => void;
  setCtxMenu: (v: CtxMenu | null) => void;
  setWorkspace: (i: number) => void; setVolume: (v: number) => void;
  closeAll: () => void;
  sendChat: (text: string) => void;
  setLeluTalking: (v: boolean) => void;
}

// ================================================================
// APP CATALOG
// ================================================================

export const APPS: AppDefinition[] = [
  { id: 'calculator', name: 'Calculator', cat: 'accessories', icon: 'Grid', comment: 'Arithmetic and scientific calculations' },
  { id: 'texteditor', name: 'Text Editor', cat: 'accessories', icon: 'FileText', comment: 'Edit plain text files', exec: 'texteditor' },
  { id: 'screenshot', name: 'Screenshot', cat: 'accessories', icon: 'Camera', comment: 'Capture the screen' },
  { id: 'charmap', name: 'Character Map', cat: 'accessories', icon: 'Command', comment: 'Insert Unicode characters' },
  { id: 'images', name: 'Image Viewer', cat: 'graphics', icon: 'Image', comment: 'View image files' },
  { id: 'draw', name: 'Drawing', cat: 'graphics', icon: 'PenTool', comment: 'Vector drawing tool' },
  { id: 'firefox', name: 'Firefox', cat: 'internet', icon: 'Globe', comment: 'Browse the web' },
  { id: 'mail', name: 'Mail', cat: 'internet', icon: 'Mail', comment: 'Read and send email' },
  { id: 'chat', name: 'HexChat', cat: 'internet', icon: 'Send', comment: 'IRC chat client' },
  { id: 'writer', name: 'LibreOffice Writer', cat: 'office', icon: 'FileText', comment: 'Word processor' },
  { id: 'calendar', name: 'Calendar', cat: 'office', icon: 'Calendar', comment: 'Manage events and schedules' },
  { id: 'music', name: 'Music', cat: 'sound', icon: 'Music', comment: 'Play your music library' },
  { id: 'video', name: 'Video', cat: 'sound', icon: 'Play', comment: 'Play video files' },
  { id: 'mic', name: 'Sound Recorder', cat: 'sound', icon: 'Mic', comment: 'Record audio' },
  { id: 'terminal', name: 'Terminal', cat: 'system', icon: 'Terminal', comment: 'Use the command line', exec: 'terminal' },
  { id: 'files', name: 'Files', cat: 'system', icon: 'Folder', comment: 'Browse the filesystem', exec: 'files' },
  { id: 'settings', name: 'System Settings', cat: 'system', icon: 'Settings', comment: 'Change system preferences', exec: 'settings' },
  { id: 'software', name: 'Software Manager', cat: 'system', icon: 'Package', comment: 'Install applications' },
  { id: 'update', name: 'Update Manager', cat: 'system', icon: 'Download', comment: 'Install system updates' },
  { id: 'monitor', name: 'System Monitor', cat: 'system', icon: 'Activity', comment: 'Inspect running processes' },
  { id: 'disks', name: 'Disks', cat: 'system', icon: 'HardDrive', comment: 'Manage disks and partitions' },
  { id: 'users', name: 'Users & Groups', cat: 'admin', icon: 'Users', comment: 'Manage users' },
  { id: 'firewall', name: 'Firewall', cat: 'admin', icon: 'Shield', comment: 'Configure firewall rules' },
  { id: 'driver', name: 'Driver Manager', cat: 'admin', icon: 'Wrench', comment: 'Install hardware drivers' },
  { id: 'theme', name: 'Themes', cat: 'prefs', icon: 'Droplet', comment: 'Customize desktop look' },
  { id: 'display', name: 'Display', cat: 'prefs', icon: 'Monitor', comment: 'Configure monitors' },
  { id: 'privacy', name: 'Privacy', cat: 'prefs', icon: 'Eye', comment: 'Control what is shared' },
  { id: 'bluetooth', name: 'Bluetooth', cat: 'prefs', icon: 'Bluetooth', comment: 'Pair Bluetooth devices' },
  { id: 'companion', name: 'Lelu Companion', cat: 'system', icon: 'CircuitBoard', comment: 'Character mod, neural map', exec: 'companion' },
];

export const CATEGORIES = [
  { id: 'all', name: 'All applications', icon: 'Grid' },
  { id: 'favorites', name: 'Favorites', icon: 'Star' },
  { id: 'accessories', name: 'Accessories', icon: 'Wrench' },
  { id: 'graphics', name: 'Graphics', icon: 'Image' },
  { id: 'internet', name: 'Internet', icon: 'Globe' },
  { id: 'office', name: 'Office', icon: 'FileText' },
  { id: 'sound', name: 'Sound & Video', icon: 'Music' },
  { id: 'system', name: 'System', icon: 'Cpu' },
  { id: 'admin', name: 'Administration', icon: 'Shield' },
  { id: 'prefs', name: 'Preferences', icon: 'Settings' },
];

export const FAVORITES = ['firefox', 'terminal', 'files', 'settings', 'software'];
export const PANEL_PINNED = ['firefox', 'files', 'terminal', 'texteditor', 'settings'];

export const DEFAULT_WIN: Record<string, { w: number; h: number; x: number; y: number }> = {
  terminal: { w: 780, h: 480, x: 90, y: 80 },
  files: { w: 820, h: 520, x: 140, y: 120 },
  settings: { w: 880, h: 580, x: 180, y: 90 },
  texteditor: { w: 720, h: 520, x: 160, y: 110 },
  software: { w: 820, h: 560, x: 130, y: 80 },
  update: { w: 780, h: 520, x: 170, y: 110 },
};

// ================================================================
// HELPERS
// ================================================================

function formatClock(d: Date) {
  return {
    time: d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: false }),
    date: d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase(),
  };
}

const LELU_FALLBACK = [
  'Mool-ti-pass. Lelu online. Nemo Claw attached. All systems green.',
  'Done. Easy. Mool-ti-pass verified. Next?',
  'Akina. Lelu finish. Is good?',
  'Chigra no-lendo... done. Verified.',
  'File open. Read for you. Want me act on it?',
];

// ================================================================
// STORE
// ================================================================

let winIdCounter = 1;
const nextWinId = () => `w${winIdCounter++}`;

export const useOSStore = create<OSState>((set, get) => ({
  windows: [],
  focusedId: null,
  zTop: 100,
  workspace: 0,
  workspaces: [
    { name: 'Main' }, { name: 'Code' }, { name: 'Comms' }, { name: 'Agents' },
  ],
  menuOpen: false,
  popover: null,
  expo: false,
  runDialog: false,
  locked: false,
  ctxMenu: null,
  altTab: null,
  clock: formatClock(new Date()),
  volume: 72,
  notifications: [
    { id: 'n1', icon: 'Sparkles', tone: 'info', source: 'Lelu agent runtime', title: 'billing-reconciler finished', time: '2m', body: 'Processed 42 invoices · 3 flagged for review.' },
    { id: 'n2', icon: 'Download', tone: 'warning', source: 'Update Manager', title: '8 updates available', time: '12m', body: '2 security, 1 kernel, 5 application. 304 MB total.' },
    { id: 'n3', icon: 'Mail', tone: 'success', source: 'Mail', title: 'Sam Park replied', time: '14m', body: 'Re: Kernel review — "Looks good, merging Monday."' },
    { id: 'n4', icon: 'Package', tone: 'info', source: 'Software Manager', title: 'Blender 4.2 installed', time: '1h', body: 'Added to Graphics menu.' },
  ],
  chatLog: [
    { from: 'lelu', t: '14:21', system: 'BOOT · NEMO CLAW', text: 'Multi-pass. Lelu online. Sandbox attach, good.' },
    { from: 'lelu', t: '14:21', text: 'I read release-notes.md. You fix panel flicker on 120Hz. Want me summarize?' },
    { from: 'user', t: '14:22', text: 'yes, two lines please' },
    { from: 'lelu', t: '14:22', text: 'Panel flicker — clock applet only, #1242. Fix on drm-fb pageflip. And menu.xml → menu.toml migration rolled in 1.0.2.' },
  ],
  leluThinking: false,
  tasks: [
    { id: 't1', label: "Summarize today's work", status: 'running', icon: 'Sparkles', steps: [
      { id: 's1', label: 'read', tool: 'file.read', arg: 'release-notes.md', status: 'done', ms: 42 },
      { id: 's2', label: 'read', tool: 'file.read', arg: 'release-plan.md', status: 'done', ms: 38 },
      { id: 's3', label: 'grep', tool: 'fs.grep', arg: 'TODO in src/**', status: 'done', ms: 120 },
      { id: 's4', label: 'synthesize', tool: 'llm.plan', arg: 'nemotron-3-super-120b', status: 'running', ms: null },
    ]},
    { id: 't2', label: 'Watch for notifications', status: 'idle', icon: 'Bell', steps: [{ id: 's1', label: 'subscribe', tool: 'notifd.sub', arg: '*', status: 'done' }] },
    { id: 't3', label: 'Pair on terminal', status: 'idle', icon: 'Terminal', steps: [{ id: 's1', label: 'attach', tool: 'pty.attach', arg: '/dev/pts/1', status: 'done' }] },
  ],
  sandboxStatus: 'Nemo Claw sandbox · Released April 18, 2026',
  leluTalking: false,

  // Window actions
  launchApp: (appId) => {
    const state = get();
    const app = APPS.find(a => a.id === appId);
    if (!app) return;
    const existing = state.windows.find(w => w.appId === appId && !w.minimized);
    if (existing) { get().bringToFront(existing.id); return; }
    const def = DEFAULT_WIN[appId] || { w: 720, h: 480, x: 120 + state.windows.length * 24, y: 90 + state.windows.length * 22 };
    const id = nextWinId();
    const newZ = state.zTop + 1;
    set(s => ({
      zTop: newZ,
      windows: [...s.windows, {
        id, appId, title: app.name, icon: app.icon,
        x: def.x, y: def.y, w: def.w, h: def.h,
        z: newZ, minimized: false, maximized: false, workspace: s.workspace,
      }],
      focusedId: id,
    }));
  },

  closeWin: (id) => set(s => ({
    windows: s.windows.filter(w => w.id !== id),
    focusedId: s.focusedId === id ? null : s.focusedId,
  })),

  minWin: (id) => set(s => ({
    windows: s.windows.map(w => w.id === id ? { ...w, minimized: true } : w),
  })),

  maxWin: (id) => set(s => ({
    windows: s.windows.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w),
  })),

  moveWin: (id, x, y) => set(s => ({
    windows: s.windows.map(w => w.id === id ? { ...w, x, y } : w),
  })),

  resizeWin: (id, x, y, w, h) => set(s => ({
    windows: s.windows.map(win => win.id === id ? { ...win, x, y, w, h } : win),
  })),

  bringToFront: (id) => set(s => {
    const newZ = s.zTop + 1;
    return {
      zTop: newZ,
      windows: s.windows.map(w => w.id === id ? { ...w, z: newZ, minimized: false } : w),
      focusedId: id,
    };
  }),

  showDesktop: () => set(s => ({
    windows: s.windows.map(w => ({ ...w, minimized: true })),
  })),

  // UI actions
  setMenuOpen: (v) => set({ menuOpen: v }),
  setPopover: (v) => set({ popover: v }),
  setExpo: (v) => set({ expo: v }),
  toggleExpo: () => set(s => ({ expo: !s.expo })),
  setRunDialog: (v) => set({ runDialog: v }),
  setLocked: (v) => set({ locked: v }),
  setCtxMenu: (v) => set({ ctxMenu: v }),
  setWorkspace: (i) => set({ workspace: i }),
  setVolume: (v) => set({ volume: v }),

  closeAll: () => set({
    menuOpen: false, popover: null, expo: false,
    runDialog: false, ctxMenu: null,
  }),

  // Lelu actions
  sendChat: async (text) => {
    const now = new Date();
    const t = now.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: false });
    set(s => ({
      chatLog: [...s.chatLog, { from: 'user' as const, t, text }],
      leluThinking: true,
    }));

    try {
      const { executeCommand } = await import('../ai/aiosCommands');
      const cmdResult = await executeCommand(text);
      if (cmdResult?.executed) {
        const rt = new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: false });
        set(s => ({
          chatLog: [...s.chatLog, { from: 'lelu' as const, t: rt, text: `Akina. ${cmdResult.description}`, system: `AIOS · ${cmdResult.action}` }],
          leluThinking: false,
        }));
        return;
      }
    } catch {}

    try {
      const { loadSettings, chat } = await import('../ai/hermesClient');
      const settings = loadSettings();
      if (settings.apiKey) {
        const state = get();
        const openApps = state.windows.filter(w => w.workspace === state.workspace && !w.minimized).map(w => w.title).join(', ') || 'none';
        const runningAgents = state.tasks.filter(t => t.status === 'running').map(t => t.label).join(', ') || 'none';
        const workspaceName = state.workspaces[state.workspace]?.name || 'Main';
        const systemCtx = `\n\n[SYSTEM STATE]\nWorkspace: ${workspaceName} (WS-${state.workspace + 1})\nOpen windows: ${openApps}\nRunning agents: ${runningAgents}\nClock: ${state.clock.time} ${state.clock.date}\nKernel: 6.8.0-lelu-amd64 | Sandbox: Nemo Claw\n[/SYSTEM STATE]`;

        const msgs = [
          { role: 'system' as const, content: settings.systemPrompt + systemCtx },
          ...state.chatLog.slice(-15).map(m => ({
            role: (m.from === 'lelu' ? 'assistant' : 'user') as 'assistant' | 'user',
            content: m.text,
          })),
        ];

        const response = await chat(msgs, settings);
        const rt = new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: false });
        set(s => ({
          chatLog: [...s.chatLog, { from: 'lelu' as const, t: rt, text: response }],
          leluThinking: false,
        }));
        return;
      }
    } catch (err) {
      console.warn('Lelu AI call failed:', err);
    }

    setTimeout(() => {
      const rt = new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: false });
      set(s => ({
        chatLog: [...s.chatLog, { from: 'lelu' as const, t: rt, text: LELU_FALLBACK[Math.floor(Math.random() * LELU_FALLBACK.length)] }],
        leluThinking: false,
      }));
    }, 800 + Math.random() * 1200);
  },

  setLeluTalking: (v) => set({ leluTalking: v }),
}));

// Clock tick
setInterval(() => {
  useOSStore.setState({ clock: formatClock(new Date()) });
}, 30000);

// Persistence subscription
import { persistState } from './persistence';
useOSStore.subscribe((state) => {
  persistState({
    windows: state.windows, focusedId: state.focusedId, zTop: state.zTop,
    workspace: state.workspace, volume: state.volume,
    chatLog: state.chatLog, tasks: state.tasks,
    sandboxStatus: state.sandboxStatus, locked: state.locked,
    notifications: state.notifications,
  });
});
