import React from 'react';
import { Desktop } from './components/shell/Desktop';
import { Panel } from './components/shell/Panel';
import { StartMenu } from './components/shell/StartMenu';
import { WindowManager } from './components/windows/WindowManager';
import { LeluHUD } from './components/hud/LeluHUD';
import { WorkspaceExpo } from './components/overlays/Overlays';
import { RunDialog } from './components/overlays/Overlays';
import { LockScreen } from './components/overlays/Overlays';
import { ContextMenu } from './components/overlays/Overlays';
import { useOSStore } from './system/osStore';

export default function App() {
  const {
    menuOpen,
    setMenuOpen,
    popover,
    setPopover,
    ctxMenu,
    workspace,
  } = useOSStore();

  // Global keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F2' || (e.altKey && e.key === 'F2')) {
        e.preventDefault();
        useOSStore.getState().setRunDialog(true);
      } else if (e.key === 'Escape') {
        useOSStore.getState().closeAll();
      } else if (e.metaKey && e.key === 'l') {
        e.preventDefault();
        useOSStore.getState().setLocked(true);
      } else if (e.metaKey && e.shiftKey && e.key === 'e') {
        e.preventDefault();
        useOSStore.getState().toggleExpo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#020408',
        fontFamily: 'var(--font-sans)',
        color: '#e8e8e8',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => {
        if (popover) setPopover(null);
        if (ctxMenu) useOSStore.getState().setCtxMenu(null);
      }}
    >
      {/* Desktop layer */}
      <Desktop />

      {/* Windows */}
      <WindowManager />

      {/* Lelu AI sidebar (right) */}
      <LeluHUD />

      {/* Start menu */}
      <StartMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* Bottom panel */}
      <Panel />

      {/* Overlays */}
      <WorkspaceExpo />
      <RunDialog />
      <LockScreen />
      <ContextMenu />

      {/* Corner badge */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 10,
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.1em',
          pointerEvents: 'none' as const,
        }}
      >
        <span>WS-{workspace + 1}</span>
        <span>·</span>
        <span>REVENANT OS 1.0.2</span>
      </div>
    </div>
  );
}
