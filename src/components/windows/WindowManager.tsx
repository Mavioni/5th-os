import React from 'react';
import Icon from '../ui/Icon';
import { useOSStore, type WindowState } from '../../system/osStore';

const MIN_W = 280;
const MIN_H = 180;
const SNAP_THRESHOLD = 60; // px from edge to trigger snap
const TASKBAR_H = 48;

// ================================================================
// TRAFFIC LIGHTS
// ================================================================

function TrafficLight({ onClose, onMin, onMax }: { onClose?: () => void; onMin?: () => void; onMax?: () => void; }) {
  const [hovered, setHovered] = React.useState<string | null>(null);
  const btn = (color: string, symbol: string): React.CSSProperties => ({
    width: 14, height: 14, borderRadius: '50%',
    background: hovered === symbol ? color : `${color}88`,
    border: `1px solid ${hovered === symbol ? color : 'rgba(0,0,0,0.2)'}`,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 8,
    color: hovered === symbol ? 'rgba(0,0,0,0.7)' : 'transparent',
    fontWeight: 700, transition: 'all 120ms var(--ease-standard)',
    boxShadow: hovered === symbol ? `0 0 8px ${color}` : 'none',
  });
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span title="Close" onClick={e => { e.stopPropagation(); onClose?.(); }} onMouseEnter={() => setHovered('close')} onMouseLeave={() => setHovered(null)} style={btn('#ff5f57', 'close')}>&times;</span>
      <span title="Minimize" onClick={e => { e.stopPropagation(); onMin?.(); }} onMouseEnter={() => setHovered('min')} onMouseLeave={() => setHovered(null)} style={btn('#febc2e', 'min')}>&minus;</span>
      <span title="Maximize" onClick={e => { e.stopPropagation(); onMax?.(); }} onMouseEnter={() => setHovered('max')} onMouseLeave={() => setHovered(null)} style={btn('#28c840', 'max')}>+</span>
    </div>
  );
}

// ================================================================
// RESIZE
// ================================================================

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const RESIZE_CURSORS: Record<ResizeDir, string> = {
  n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
  ne: 'ne-resize', nw: 'nw-resize', se: 'se-resize', sw: 'sw-resize',
};
const HANDLE_SIZE = 8;

function ResizeHandle({ dir, onResizeStart }: { dir: ResizeDir; onResizeStart: (e: React.MouseEvent, dir: ResizeDir) => void }) {
  const isCorner = dir.length === 2;
  const sz = isCorner ? HANDLE_SIZE + 4 : HANDLE_SIZE;
  const posStyle: React.CSSProperties = {};
  if (dir.includes('n')) posStyle.top = -sz / 2;
  if (dir.includes('s')) posStyle.bottom = -sz / 2;
  if (dir.includes('e')) posStyle.right = -sz / 2;
  if (dir.includes('w')) posStyle.left = -sz / 2;
  if (dir === 'n' || dir === 's') { posStyle.left = HANDLE_SIZE; posStyle.right = HANDLE_SIZE; posStyle.height = sz; }
  if (dir === 'e' || dir === 'w') { posStyle.top = HANDLE_SIZE; posStyle.bottom = HANDLE_SIZE; posStyle.width = sz; }
  if (isCorner) { posStyle.width = sz; posStyle.height = sz; }
  return <div onMouseDown={e => { e.stopPropagation(); onResizeStart(e, dir); }} style={{ position: 'absolute', zIndex: 10, cursor: RESIZE_CURSORS[dir], ...posStyle }} />;
}

// ================================================================
// WINDOW FRAME
// ================================================================

type SnapTarget = null | 'left-half' | 'right-half' | 'maximize';

function AppWindow({ win, focused, onFocus, onClose, onMin, onMax, onMove, onResize, children }: {
  win: WindowState; focused: boolean; onFocus: () => void; onClose: () => void;
  onMin: () => void; onMax: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, x: number, y: number, w: number, h: number) => void;
  children: React.ReactNode;
}) {
  const startPos = React.useRef({ x: 0, y: 0, wx: 0, wy: 0, ww: 0, wh: 0 });
  const [snapTarget, setSnapTarget] = React.useState<SnapTarget>(null);
  const [animState, setAnimState] = React.useState<'enter' | 'idle' | 'exit'>('enter');
  const [exiting, setExiting] = React.useState(false);

  // Enter animation on mount
  React.useEffect(() => {
    const t = setTimeout(() => setAnimState('idle'), 150);
    return () => clearTimeout(t);
  }, []);

  // If exiting, hide after animation
  if (exiting) {
    if (win.minimized) return null;
    return (
      <div style={{
        position: 'absolute' as const, left: win.x, top: win.y,
        width: win.w, height: win.h, zIndex: win.z,
        background: '#020408', border: '1px solid rgba(239,33,55,0.3)',
        borderRadius: 0, overflow: 'hidden',
        opacity: 0, transform: 'scale(0.9)',
        transition: 'opacity 120ms var(--ease-standard), transform 120ms var(--ease-standard)',
        pointerEvents: 'none',
      }}/>
    );
  }

  const onDragStart = (e: React.MouseEvent) => {
    onFocus();
    const state = useOSStore.getState();
    startPos.current = { x: e.clientX, y: e.clientY, wx: win.x, wy: win.y, ww: 0, wh: 0 };

    const mm = (ev: MouseEvent) => {
      let nx = Math.max(0, startPos.current.wx + ev.clientX - startPos.current.x);
      let ny = Math.max(28, startPos.current.wy + ev.clientY - startPos.current.y);

      // Edge snap detection
      const vw = window.innerWidth;
      let snap: SnapTarget = null;

      if (ev.clientY < 8) {
        snap = 'maximize';
      } else if (ev.clientX < SNAP_THRESHOLD) {
        snap = 'left-half';
      } else if (ev.clientX > vw - SNAP_THRESHOLD) {
        snap = 'right-half';
      }
      setSnapTarget(snap);

      onMove(win.id, nx, ny);
    };

    const mu = () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      setSnapTarget(null);

      // Check final position for snap
      const stored = useOSStore.getState().windows.find(w => w.id === win.id);
      if (!stored) return;

      const wx = stored.x;
      const wy = stored.y;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (wy < 8) {
        // Snap to maximize
        state.resizeWin(win.id, 0, 28, vw, vh - 28 - TASKBAR_H);
        state.maxWin(win.id);
      } else if (wx < SNAP_THRESHOLD && wx < SNAP_THRESHOLD) {
        // Snap to left half
        state.resizeWin(win.id, 0, 28, vw / 2, vh - 28 - TASKBAR_H);
      } else if (wx > vw - win.w - SNAP_THRESHOLD) {
        // Snap to right half
        state.resizeWin(win.id, vw / 2, 28, vw / 2, vh - 28 - TASKBAR_H);
      }
    };
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
  };

  const onResizeStart = (e: React.MouseEvent, dir: ResizeDir) => {
    onFocus();
    startPos.current = { x: e.clientX, y: e.clientY, wx: win.x, wy: win.y, ww: win.w, wh: win.h };
    const mm = (ev: MouseEvent) => {
      const dx = ev.clientX - startPos.current.x, dy = ev.clientY - startPos.current.y;
      let nx = win.x, ny = win.y, nw = win.w, nh = win.h;
      if (dir.includes('e')) nw = Math.max(MIN_W, startPos.current.ww + dx);
      if (dir.includes('w')) { nw = Math.max(MIN_W, startPos.current.ww - dx); nx = startPos.current.wx + dx; }
      if (dir.includes('s')) nh = Math.max(MIN_H, startPos.current.wh + dy);
      if (dir.includes('n')) { nh = Math.max(MIN_H, startPos.current.wh - dy); ny = startPos.current.wy + dy; }
      onResize(win.id, nx, ny, nw, nh);
    };
    const mu = () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
    window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu);
  };

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onClose(), 120);
  };

  const handleMin = () => {
    setExiting(true);
    setTimeout(() => onMin(), 120);
  };

  const maxed = win.maximized;
  const pos: React.CSSProperties = maxed
    ? { position: 'absolute' as const, left: 0, top: 28, right: 0, bottom: 48, width: 'auto', height: 'auto' }
    : { position: 'absolute' as const, left: win.x, top: win.y, width: win.w, height: win.h };
  const dirs: ResizeDir[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  const enterStyle: React.CSSProperties = animState === 'enter'
    ? { opacity: 0, transform: 'scale(0.92)', transition: 'opacity 150ms var(--ease-out), transform 150ms var(--ease-out)' }
    : { opacity: 1, transform: 'scale(1)', transition: 'opacity 150ms var(--ease-out), transform 150ms var(--ease-out)' };

  // Snap preview overlay
  const snapOverlay = snapTarget ? (
    <div style={{
      position: 'fixed',
      left: snapTarget === 'right-half' ? '50%' : 0,
      top: 28,
      width: snapTarget === 'maximize' ? '100%' : '50%',
      height: `calc(100% - ${28 + TASKBAR_H}px)`,
      background: 'rgba(239,33,55,0.08)',
      border: '2px dashed rgba(239,33,55,0.3)',
      zIndex: win.z + 1,
      pointerEvents: 'none',
      transition: 'opacity 100ms',
    }}/>
  ) : null;

  return (
    <>
      {snapOverlay}
      <div onMouseDown={() => onFocus()} style={{ ...pos, ...enterStyle, zIndex: win.z, background: '#020408', border: `1px solid ${focused ? 'rgba(239,33,55,0.45)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: focused ? '0 24px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(239,33,55,0.15), 0 0 40px rgba(239,33,55,0.08)' : '0 10px 40px rgba(0,0,0,0.55)', transition: 'box-shadow 160ms var(--ease-standard), border-color 160ms var(--ease-standard), opacity 150ms var(--ease-out), transform 150ms var(--ease-out)' }}>
        <div onMouseDown={onDragStart} onDoubleClick={onMax} style={{ height: 38, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, background: focused ? 'rgba(239,33,55,0.06)' : '#141416', borderBottom: `1px solid ${focused ? 'rgba(239,33,55,0.2)' : 'rgba(255,255,255,0.07)'}`, cursor: 'grab', userSelect: 'none' as const }}>
          <TrafficLight onClose={handleClose} onMin={handleMin} onMax={onMax} />
          <Icon name={win.icon} size={14} style={{ color: focused ? '#ef2137' : '#888', flexShrink: 0 }} />
          <div style={{ flex: 1, textAlign: 'center' as const, fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: focused ? '#e8e8e8' : '#888' }}>{win.title}</div>
          <div style={{ width: 54 }} />
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: '#020408' }} className="no-drag">
          {children}
        </div>
        {!maxed && focused && dirs.map(d => <ResizeHandle key={d} dir={d} onResizeStart={onResizeStart} />)}
      </div>
    </>
  );
}

// ================================================================
// WINDOW MANAGER
// ================================================================

export const WindowManager = React.memo(function WindowManager() {
  const { windows, focusedId, workspace, bringToFront, closeWin, minWin, maxWin, moveWin, resizeWin } = useOSStore();
  const visible = React.useMemo(
    () => windows.filter((w) => w.workspace === workspace),
    [windows, workspace],
  );

  return (
    <>
      {visible.map(w => (
        <AppWindow key={w.id} win={w}
          focused={w.id === focusedId && !w.minimized}
          onFocus={() => bringToFront(w.id)} onClose={() => closeWin(w.id)}
          onMin={() => minWin(w.id)} onMax={() => maxWin(w.id)}
          onMove={moveWin} onResize={resizeWin}>
          <AppContent appId={w.appId} />
        </AppWindow>
      ))}
    </>
  );
});

// App components are imported directly for registration + rendering
import { TerminalApp } from '../../apps/terminal/TerminalApp';
import { FilesApp } from '../../apps/files/FilesApp';
import { SettingsApp } from '../../apps/settings/SettingsApp';
import { EditorApp } from '../../apps/editor/EditorApp';
import { LeluCompanionApp as CompanionApp } from '../../apps/companion/LeluCompanionApp';
import { BrowserApp } from '../../apps/browser/BrowserApp';
import {
  CalculatorApp, SystemMonitorApp as MonitorApp,
  ImageViewerApp, SoftwareManagerApp as SoftwareApp, FirewallApp,
} from '../../apps/stubs/PlaceholderApps';
import {
  ScreenshotApp, CharMapApp, DrawApp, MailApp, ChatApp,
  WriterApp, CalendarApp, MusicApp, VideoApp, MicApp,
  UpdateApp, DisksApp, UsersApp, DriverApp,
  ThemeApp, DisplayApp, PrivacyApp, BluetoothApp,
} from '../../apps/stubs/SystemApps';

// Legacy app router — direct imports, no lazy loading
function AppContent({ appId }: { appId: string }) {
  switch (appId) {
    case 'terminal':   return <TerminalApp />;
    case 'files':      return <FilesApp />;
    case 'settings':   return <SettingsApp />;
    case 'texteditor': return <EditorApp />;
    case 'companion':  return <CompanionApp />;
    case 'firefox':    return <BrowserApp />;
    case 'calculator': return <CalculatorApp />;
    case 'screenshot': return <ScreenshotApp />;
    case 'charmap':    return <CharMapApp />;
    case 'images':     return <ImageViewerApp />;
    case 'draw':       return <DrawApp />;
    case 'mail':       return <MailApp />;
    case 'chat':       return <ChatApp />;
    case 'writer':     return <WriterApp />;
    case 'calendar':   return <CalendarApp />;
    case 'music':      return <MusicApp />;
    case 'video':      return <VideoApp />;
    case 'mic':        return <MicApp />;
    case 'software':   return <SoftwareApp />;
    case 'update':     return <UpdateApp />;
    case 'monitor':    return <MonitorApp />;
    case 'disks':      return <DisksApp />;
    case 'users':      return <UsersApp />;
    case 'firewall':   return <FirewallApp />;
    case 'driver':     return <DriverApp />;
    case 'theme':      return <ThemeApp />;
    case 'display':    return <DisplayApp />;
    case 'privacy':    return <PrivacyApp />;
    case 'bluetooth':  return <BluetoothApp />;
    default:           return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#666',fontSize:13}}>{appId}</div>;
  }
}
