import React from 'react';
import Icon from '../ui/Icon';
import { useOSStore } from '../../system/osStore';

// ================================================================
// WALLPAPER
// ================================================================

export function Wallpaper() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 22% 18%, rgba(239,33,55,0.14) 0%, transparent 55%),
          radial-gradient(ellipse 80% 70% at 85% 92%, rgba(139,20,25,0.10) 0%, transparent 60%),
          radial-gradient(ellipse at center, #0e0606 0%, #070303 50%, #020408 100%)
        `,
        overflow: 'hidden',
      }}
    >
      {/* CRT scanline grid */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.5,
        }}
      >
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M48 0 L0 0 0 48"
              fill="none"
              stroke="rgba(239,33,55,0.04)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Wordmark watermark */}
      <div
        style={{
          position: 'absolute',
          right: 40,
          bottom: 80,
          fontFamily: 'var(--font-mono)',
          fontSize: 140,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: 'rgba(239,33,55,0.025)',
          pointerEvents: 'none',
          lineHeight: 0.9,
          textAlign: 'right',
        }}
      >
        REVENANT
        <br />
        <span
          style={{
            fontSize: 50,
            letterSpacing: '0.25em',
            color: 'rgba(255,255,255,0.020)',
          }}
        >
          OS · LELU ONLINE
        </span>
      </div>

      {/* Phosphor scanlines */}
      <div className="crt-scanlines" />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </div>
  );
}

// ================================================================
// DESKTOP ICON
// ================================================================

function DesktopIcon({
  icon,
  label,
  x,
  y,
  onDouble,
  onContext,
}: {
  icon: string;
  label: string;
  x: number;
  y: number;
  onDouble: () => void;
  onContext: (e: React.MouseEvent) => void;
}) {
  const [hover, setHover] = React.useState(false);
  const [sel, setSel] = React.useState(false);

  return (
    <div
      onClick={() => setSel(true)}
      onDoubleClick={onDouble}
      onContextMenu={onContext}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setSel(false);
      }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 84,
        padding: '8px 4px',
        borderRadius: 'var(--r-control)',
        background: sel
          ? 'rgba(239,33,55,0.15)'
          : hover
            ? 'rgba(255,255,255,0.04)'
            : 'transparent',
        border: `1px solid ${sel ? 'rgba(239,33,55,0.4)' : 'transparent'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        userSelect: 'none' as const,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--r-control)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c8c8c8',
          boxShadow: sel ? '0 0 16px rgba(239,33,55,0.4)' : 'none',
        }}
      >
        <Icon name={icon} size={22} />
      </div>
      <span
        style={{
          fontSize: 11,
          color: '#e8e8e8',
          textAlign: 'center',
          lineHeight: 1.2,
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ================================================================
// HOT CORNER
// ================================================================

function HotCorner({ onTrigger }: { onTrigger: () => void }) {
  const [glow, setGlow] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setGlow(true)}
      onMouseLeave={() => setGlow(false)}
      onClick={onTrigger}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 14,
        height: 14,
        zIndex: 500,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          borderRadius: '0 0 14px 0',
          background: glow ? 'rgba(239,33,55,0.35)' : 'transparent',
          transition: 'background 150ms',
        }}
      />
    </div>
  );
}

// ================================================================
// DESKTOP
// ================================================================

export const Desktop = React.memo(function Desktop() {
  const launchApp = useOSStore((s) => s.launchApp);
  const setCtxMenu = useOSStore((s) => s.setCtxMenu);

  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { id: 'new-folder', label: 'New folder', icon: 'Folder' },
        { id: 'new-file', label: 'New document', icon: 'FileText' },
        '---',
        { id: 'paste', label: 'Paste' },
        { id: 'select-all', label: 'Select all', kb: '⌘A' },
        '---',
        { id: 'wallpaper', label: 'Change wallpaper…', icon: 'Image' },
        { id: 'arrange', label: 'Arrange icons' },
        '---',
        { id: 'terminal', label: 'Open terminal here', icon: 'Terminal', kb: '⌘T' },
        { id: 'settings', label: 'Desktop settings', icon: 'Settings' },
      ],
    });
  };

  return (
    <div
      style={{ position: 'absolute', inset: 0 }}
      onContextMenu={openContextMenu}
    >
      <Wallpaper />
      <HotCorner onTrigger={() => useOSStore.getState().setExpo(true)} />

      {/* Desktop icons */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          {([
            { icon: 'Home', label: 'Home', x: 20, y: 20 },
            { icon: 'Trash', label: 'Trash', x: 20, y: 120 },
            { icon: 'HardDrive', label: 'Data · 476 GB', x: 20, y: 220 },
            { icon: 'Folder', label: 'revenant-kernel', x: 20, y: 320 },
            { icon: 'FileText', label: 'release-plan.md', x: 20, y: 420 },
          ] as const).map((d) => (
            <DesktopIcon
              key={d.label}
              {...d}
              onDouble={() => {
                if (
                  d.label === 'Home' ||
                  d.label.startsWith('Data') ||
                  d.label === 'Trash' ||
                  d.label.startsWith('revenant')
                )
                  launchApp('files');
                else launchApp('texteditor');
              }}
              onContext={(e) => {
                e.stopPropagation();
                openContextMenu(e);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
