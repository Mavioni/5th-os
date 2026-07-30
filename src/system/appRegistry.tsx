/**
 * App Registry — plugin-based app loading system.
 *
 * Replaces the 60-case switch statement in WindowManager.tsx.
 * Each app registers itself via `registerApp()` at the bottom of its file.
 * Apps are lazy-loaded via React.lazy on first open.
 *
 * Usage:
 *   // In your app component file:
 *   import { registerApp } from '../../system/appRegistry';
 *   registerApp('terminal', () => import('./TerminalApp'));
 *
 *   // In WindowManager:
 *   import { getAppComponent } from '../../system/appRegistry';
 *   const App = getAppComponent(appId);
 */

import React from 'react';

type AppLoader = () => Promise<{ default: React.ComponentType }>;

const registry = new Map<string, AppLoader>();

/** Register an app component for lazy loading */
export function registerApp(id: string, loader: AppLoader): void {
  registry.set(id, loader);
}

/** Get all registered app IDs */
export function getRegisteredApps(): string[] {
  return Array.from(registry.keys());
}

/** Check if an app is registered */
export function isAppRegistered(id: string): boolean {
  return registry.has(id);
}

/** Get a lazy-loaded React component for the given app ID */
export function getAppComponent(id: string): React.LazyExoticComponent<React.ComponentType> | null {
  const loader = registry.get(id);
  if (!loader) return null;
  return React.lazy(loader);
}

/**
 * Fallback component shown while an app is loading or if not found.
 */
export function AppFallback({ appId }: { appId: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: 40, textAlign: 'center',
      color: '#666', fontFamily: 'var(--font-sans)', fontSize: 13,
      flexDirection: 'column', gap: 10,
    }}>
      <div style={{ fontSize: 28, opacity: 0.3 }}>⊡</div>
      <div style={{ color: '#ccc', fontWeight: 600 }}>{appId}</div>
      <div style={{ color: '#555', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
        App registered — loading component
      </div>
    </div>
  );
}
