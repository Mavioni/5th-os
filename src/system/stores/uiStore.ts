/**
 * UI Store — domain store for UI state (menus, popovers, overlays).
 */
import { create } from 'zustand';

export interface CtxMenuItem {
  id: string;
  label: string;
  icon?: string;
  kb?: string;
  tone?: 'danger';
}

export interface CtxMenu {
  x: number;
  y: number;
  items: (CtxMenuItem | '---')[];
}

interface UIStore {
  menuOpen: boolean;
  popover: string | null;
  expo: boolean;
  runDialog: boolean;
  ctxMenu: CtxMenu | null;
  altTab: number | null;

  setMenuOpen: (v: boolean) => void;
  setPopover: (v: string | null) => void;
  setExpo: (v: boolean) => void;
  toggleExpo: () => void;
  setRunDialog: (v: boolean) => void;
  setCtxMenu: (v: CtxMenu | null) => void;
  setAltTab: (v: number | null) => void;
  closeAll: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  menuOpen: false,
  popover: null,
  expo: false,
  runDialog: false,
  ctxMenu: null,
  altTab: null,

  setMenuOpen: (v) => set({ menuOpen: v }),
  setPopover: (v) => set({ popover: v }),
  setExpo: (v) => set({ expo: v }),
  toggleExpo: () => set(s => ({ expo: !s.expo })),
  setRunDialog: (v) => set({ runDialog: v }),
  setCtxMenu: (v) => set({ ctxMenu: v }),
  setAltTab: (v) => set({ altTab: v }),

  closeAll: () => set({
    menuOpen: false, popover: null, expo: false,
    runDialog: false, ctxMenu: null,
  }),
}));
