/**
 * Zustand persistence middleware — localStorage-backed state survival
 *
 * Persists key state slices so the OS survives browser refresh:
 *   - Open windows and their positions
 *   - Chat history
 *   - Active workspace
 *   - UI preferences
 *   - Notifications
 *
 * Does NOT persist:
 *   - Ephemeral UI state (menu open, context menu, popovers)
 *   - leluThinking (transient)
 *   - Clock (recalculated on boot)
 */

const STORAGE_KEY = '5th-os:state';

interface PersistedSlice {
  windows: unknown[];
  focusedId: string | null;
  zTop: number;
  workspace: number;
  volume: number;
  chatLog: unknown[];
  tasks: unknown[];
  notifications: unknown[];
  sandboxStatus: string;
  locked: boolean;
}

const KEYS_TO_PERSIST = new Set([
  'windows', 'focusedId', 'zTop', 'workspace',
  'volume', 'chatLog', 'tasks', 'notifications',
  'sandboxStatus', 'locked',
]);

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function persistState(state: Record<string, unknown>): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const slice: Record<string, unknown> = {};
    for (const key of KEYS_TO_PERSIST) {
      if (key in state) slice[key] = state[key];
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
    } catch {
      // localStorage full or unavailable — silent fail
    }
  }, 250); // debounce: 250ms
}

export function restoreState(): Partial<PersistedSlice> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as Partial<PersistedSlice>;
  } catch {
    return null;
  }
}

/**
 * Zustand middleware that auto-persists on every state change.
 * Usage:
 *   const useStore = create(persistMiddleware((set, get) => ({ ... })));
 */
export function persistMiddleware<T extends Record<string, unknown>>(
  config: (set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void, get: () => T) => T,
) {
  return (set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void, get: () => T) => {
    const wrappedSet: typeof set = (partial, replace) => {
      set(partial, replace);
      // After every set, persist the relevant keys
      const state = get();
      persistState(state as unknown as Record<string, unknown>);
    };
    return config(wrappedSet, get);
  };
}
