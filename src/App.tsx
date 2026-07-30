import React from 'react';
import { Desktop } from './components/shell/Desktop';
import { Panel } from './components/shell/Panel';
import { StartMenu } from './components/shell/StartMenu';
import { WindowManager } from './components/windows/WindowManager';
import { LeluHUD } from './components/hud/LeluHUD';
import { WorkspaceExpo, RunDialog, LockScreen, ContextMenu } from './components/overlays/Overlays';
import { useOSStore } from './system/osStore';
import { APPS } from './system/osStore';

export default function App() {
  const {
    menuOpen, setMenuOpen, popover, setPopover,
    ctxMenu, workspace,
  } = useOSStore();

  // Alt+Tab state
  const [altTabOpen, setAltTabOpen] = React.useState(false);
  const [altTabIdx, setAltTabIdx] = React.useState(0);
  const altTabWindows = useOSStore((s) => s.windows.filter(w => w.workspace === s.workspace));

  // Toast notifications
  const [toasts, setToasts] = React.useState<Array<{ id: string; title: string; body: string; tone: string }>>([]);
  const lastNotifCount = React.useRef(useOSStore.getState().notifications.length);

  React.useEffect(() => {
    const unsub = useOSStore.subscribe((s) => {
      if (s.notifications.length > lastNotifCount.current) {
        const latest = s.notifications[s.notifications.length - 1];
        const id = 't' + Date.now();
        setToasts(t => [...t.slice(-4), { id, title: latest.title, body: latest.body, tone: latest.tone }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
      }
      lastNotifCount.current = s.notifications.length;
    });
    return unsub;
  }, []);

  // Global keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Alt+Tab
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        if (!altTabOpen) {
          setAltTabOpen(true);
          setAltTabIdx(0);
        } else {
          setAltTabIdx(i => (i + 1) % Math.max(1, altTabWindows.length));
        }
        return;
      }
      if (e.key === 'F2' || (e.altKey && e.key === 'F2')) {
        e.preventDefault();
        useOSStore.getState().setRunDialog(true);
      } else if (e.key === 'Escape') {
        if (altTabOpen) { setAltTabOpen(false); return; }
        useOSStore.getState().closeAll();
      } else if (e.metaKey && e.key === 'l') {
        e.preventDefault();
        useOSStore.getState().setLocked(true);
      } else if (e.metaKey && e.shiftKey && e.key === 'e') {
        e.preventDefault();
        useOSStore.getState().toggleExpo();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && altTabOpen) {
        const target = altTabWindows[altTabIdx];
        if (target) useOSStore.getState().bringToFront(target.id);
        setAltTabOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [altTabOpen, altTabIdx, altTabWindows]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: '#020408', fontFamily: 'var(--font-sans)', color: '#e8e8e8',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => {
        if (popover) setPopover(null);
        if (ctxMenu) useOSStore.getState().setCtxMenu(null);
      }}
    >
      <Desktop />
      <WindowManager />
      <LeluHUD />
      <StartMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Panel />
      <WorkspaceExpo />
      <RunDialog />
      <LockScreen />
      <ContextMenu />

      {/* Alt+Tab switcher */}
      {altTabOpen && altTabWindows.length > 0 && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 12000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)',
        }}>
          <div style={{
            background: 'rgba(4,6,10,0.95)', border: '1px solid rgba(239,33,55,0.3)',
            borderRadius: 0, padding: '16px 24px', minWidth: 300,
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}>
            {altTabWindows.map((w, i) => {
              const app = APPS.find(a => a.id === w.appId);
              return (
                <div key={w.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                  color: i === altTabIdx ? '#ef2137' : '#888',
                  fontFamily: i === altTabIdx ? 'var(--font-sans)' : 'var(--font-sans)',
                  fontWeight: i === altTabIdx ? 600 : 400,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#555' }}>{i + 1}</span>
                  <span>{app?.icon || '📄'} {w.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: 12, right: 380, zIndex: 11000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '10px 14px', borderRadius: 0, minWidth: 280, maxWidth: 360,
            background: 'rgba(4,6,10,0.95)', border: '1px solid rgba(239,33,55,0.25)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)', fontFamily: 'var(--font-sans)',
            animation: 'fade-in 150ms var(--ease-out)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{t.title}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{t.body}</div>
          </div>
        ))}
      </div>

      {/* Corner badge */}
      <div style={{
        position: 'absolute', top: 8, right: 10, zIndex: 400,
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em',
        pointerEvents: 'none' as const,
      }}>
        <span>WS-{workspace + 1}</span>
        <span>·</span>
        <span>REVENANT OS 1.0.2</span>
      </div>
    </div>
  );
}
