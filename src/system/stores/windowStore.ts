/**
 * Window Store — domain store for window management.
 * Extracted from osStore.ts as part of the P0 decomposition.
 */
import { create } from 'zustand';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  workspace: number;
}

interface WindowStore {
  windows: WindowState[];
  focusedId: string | null;
  zTop: number;
  workspace: number;
  workspaces: { name: string }[];

  launchApp: (appId: string, appName: string, appIcon: string, defaultWin?: { w: number; h: number; x: number; y: number }) => string | null;
  closeWin: (id: string) => void;
  minWin: (id: string) => void;
  maxWin: (id: string) => void;
  moveWin: (id: string, x: number, y: number) => void;
  resizeWin: (id: string, x: number, y: number, w: number, h: number) => void;
  bringToFront: (id: string) => void;
  showDesktop: () => void;
  setWorkspace: (i: number) => void;
}

let winIdCounter = 1;

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedId: null,
  zTop: 100,
  workspace: 0,
  workspaces: [
    { name: 'Main' }, { name: 'Code' }, { name: 'Comms' }, { name: 'Agents' },
  ],

  launchApp: (appId, appName, appIcon, defaultWin) => {
    const state = get();
    const existing = state.windows.find(w => w.appId === appId && !w.minimized);
    if (existing) {
      get().bringToFront(existing.id);
      return existing.id;
    }
    const def = defaultWin || { w: 720, h: 480, x: 120 + state.windows.length * 24, y: 90 + state.windows.length * 22 };
    const id = `w${winIdCounter++}`;
    const newZ = state.zTop + 1;
    set(s => ({
      zTop: newZ,
      windows: [...s.windows, {
        id, appId, title: appName, icon: appIcon,
        x: def.x, y: def.y, w: def.w, h: def.h,
        z: newZ, minimized: false, maximized: false, workspace: s.workspace,
      }],
      focusedId: id,
    }));
    return id;
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

  bringToFront: (id) => {
    set(s => {
      const newZ = s.zTop + 1;
      return {
        zTop: newZ,
        windows: s.windows.map(w => w.id === id ? { ...w, z: newZ, minimized: false } : w),
        focusedId: id,
      };
    });
  },

  showDesktop: () => set(s => ({
    windows: s.windows.map(w => ({ ...w, minimized: true })),
  })),

  setWorkspace: (i) => set({ workspace: i }),
}));
