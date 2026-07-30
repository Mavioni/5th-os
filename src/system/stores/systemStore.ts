/**
 * System Store — domain store for clock, volume, notifications, lock state.
 */
import { create } from 'zustand';

export interface Notification {
  id: string;
  icon: string;
  tone: 'success' | 'warning' | 'error' | 'info';
  source: string;
  title: string;
  time: string;
  body: string;
}

interface SystemStore {
  clock: { time: string; date: string };
  volume: number;
  notifications: Notification[];
  locked: boolean;

  setVolume: (v: number) => void;
  setLocked: (v: boolean) => void;
  addNotification: (n: Notification) => void;
  clearNotifications: () => void;
}

function formatClock(d: Date) {
  return {
    time: d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: false }),
    date: d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase(),
  };
}

export const useSystemStore = create<SystemStore>((set) => ({
  clock: formatClock(new Date()),
  volume: 72,
  notifications: [
    { id: 'n1', icon: 'Sparkles', tone: 'info', source: 'Lelu agent runtime', title: 'billing-reconciler finished', time: '2m', body: 'Processed 42 invoices · 3 flagged for review.' },
    { id: 'n2', icon: 'Download', tone: 'warning', source: 'Update Manager', title: '8 updates available', time: '12m', body: '2 security, 1 kernel, 5 application. 304 MB total.' },
    { id: 'n3', icon: 'Mail', tone: 'success', source: 'Mail', title: 'Sam Park replied', time: '14m', body: 'Re: Kernel review — "Looks good, merging Monday."' },
    { id: 'n4', icon: 'Package', tone: 'info', source: 'Software Manager', title: 'Blender 4.2 installed', time: '1h', body: 'Added to Graphics menu.' },
  ],
  locked: false,

  setVolume: (v) => set({ volume: v }),
  setLocked: (v) => set({ locked: v }),
  addNotification: (n) => set(s => ({ notifications: [...s.notifications, n] })),
  clearNotifications: () => set({ notifications: [] }),
}));

// Start clock tick
setInterval(() => {
  useSystemStore.setState({ clock: formatClock(new Date()) });
}, 30000);
