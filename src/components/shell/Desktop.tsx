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
          OS &middot; LELU ONLINE
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
// DESKTOP ICON (draggable)
// ================================================================

interface DesktopIconData {
  icon: string;
  label: string;
  x: number;
  y: number;
  appId?: string;
}

function DesktopIcon({
  icon,
  label,
  x,
  y,
  selected,
  onDouble,
  onContext,
  onDragStart,
}: {
  icon: string;
  label: string;
  x: number;
  y: number;
  selected: boolean;
  onDouble: () => void;
  onContext: (e: React.MouseEvent) => void;
  onDragStart: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  return (
    <div
      onMouseDown={(e) => {
        if (e.button === 0) {
          onDragStart();
          setDragging(true);
          const onUp = () => { setDragging(false); window.removeEventListener('mouseup', onUp); };
          window.addEventListener('mouseup', onUp);
        }
      }}
      onDoubleClick={onDouble}
      onContextMenu={onContext}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
      }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 84,
        padding: '8px 4px',
        borderRadius: 'var(--r-control)',
        background: selected
          ? 'rgba(239,33,55,0.15)'
          : hover
            ? 'rgba(255,255,255,0.04)'
            : 'transparent',
        border: `1px solid ${selected ? 'rgba(239,33,55,0.4)' : 'transparent'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: dragging ? 'grabbing' : 'pointer',
        userSelect: 'none' as const,
        opacity: dragging ? 0.7 : 1,
        zIndex: dragging ? 10 : 1,
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
          boxShadow: selected ? '0 0 16px rgba(239,33,55,0.4)' : 'none',
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
          wordBreak: 'break-word',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ================================================================
// DRAG-SELECT LASSO
// ================================================================

interface LassoState {
  startX: number; startY: number;
  currentX: number; currentY: number;
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
// DEFAULT ICON POSITIONS
// ================================================================

const DEFAULT_ICONS: DesktopIconData[] = [
  { icon: 'Home', label: 'Home', x: 20, y: 20, appId: 'files' },
  { icon: 'Trash2', label: 'Trash', x: 20, y: 120, appId: 'files' },
  { icon: 'HardDrive', label: 'Data \u00b7 476 GB', x: 20, y: 220 },
  { icon: 'Folder', label: 'revenant-kernel', x: 20, y: 320, appId: 'files' },
  { icon: 'FileText', label: 'release-plan.md', x: 20, y: 420, appId: 'texteditor' },
];

// ================================================================
// DESKTOP
// ================================================================

export const Desktop = React.memo(function Desktop() {
  const launchApp = useOSStore((s) => s.launchApp);
  const setCtxMenu = useOSStore((s) => s.setCtxMenu);
  const [icons, setIcons] = React.useState<DesktopIconData[]>(() => {
    // Load icon positions from localStorage or use defaults
    try {
      const saved = localStorage.getItem('5th-os:icon-positions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ICONS;
  });
  const [selectedIcons, setSelectedIcons] = React.useState<Set<string>>(new Set());
  const [lasso, setLasso] = React.useState<LassoState | null>(null);
  const [draggingIcon, setDraggingIcon] = React.useState<string | null>(null);
  const desktopRef = React.useRef<HTMLDivElement>(null);

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
        { id: 'select-all', label: 'Select all', kb: '\u2318A' },
        '---',
        { id: 'wallpaper', label: 'Change wallpaper\u2026', icon: 'Image' },
        { id: 'arrange', label: 'Arrange icons' },
        '---',
        { id: 'terminal', label: 'Open terminal here', icon: 'Terminal', kb: '\u2318T' },
        { id: 'settings', label: 'Desktop settings', icon: 'Settings' },
      ],
    });
  };

  const handleIconDouble = (icon: DesktopIconData) => {
    if (icon.label === 'Trash') {
      // Open trash folder in VFS
      launchApp('files');
      setSelectedIcons(new Set());
    } else if (icon.appId) {
      launchApp(icon.appId);
      setSelectedIcons(new Set());
    } else if (icon.label === 'Data \u00b7 476 GB') {
      launchApp('files');
      setSelectedIcons(new Set());
    } else {
      launchApp('files');
      setSelectedIcons(new Set());
    }
  };

  // Lasso selection
  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    // Only start lasso on left button, on empty area
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    // Don't start lasso if clicking on an icon or interactive element
    if (target.closest('[data-desktop-icon]')) return;

    setSelectedIcons(new Set());
    setLasso({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });

    const onMove = (ev: MouseEvent) => {
      setLasso(prev => prev ? { ...prev, currentX: ev.clientX, currentY: ev.clientY } : null);
    };
    const onUp = () => {
      setLasso(prev => {
        if (prev) {
          // Check which icons are inside the lasso
          const left = Math.min(prev.startX, prev.currentX);
          const right = Math.max(prev.startX, prev.currentX);
          const top = Math.min(prev.startY, prev.currentY);
          const bottom = Math.max(prev.startY, prev.currentY);
          const newSelected = new Set<string>();

          icons.forEach(icon => {
            const iconLeft = icon.x;
            const iconTop = icon.y;
            const iconRight = icon.x + 84;
            const iconBottom = icon.y + 90;
            // Check overlap
            if (iconLeft < right && iconRight > left && iconTop < bottom && iconBottom > top) {
              newSelected.add(icon.label);
            }
          });
          setSelectedIcons(newSelected);
        }
        return null;
      });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Icon dragging
  const handleIconDragStart = (iconLabel: string) => {
    setDraggingIcon(iconLabel);
  };

  // Handle mouse move for dragging icons
  React.useEffect(() => {
    if (!draggingIcon) return;
    const onMove = (e: MouseEvent) => {
      setIcons(prev => {
        const next = prev.map(i => {
          if (i.label === draggingIcon) {
            // Move relative to mouse position
            return { ...i, x: Math.max(0, i.x + e.movementX), y: Math.max(0, i.y + e.movementY) };
          }
          return i;
        });
        return next;
      });
    };
    const onUp = () => {
      setDraggingIcon(null);
      // Save positions
      setIcons(prev => {
        localStorage.setItem('5th-os:icon-positions', JSON.stringify(prev));
        return prev;
      });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingIcon]);

  // Lasso rectangle style
  const lassoStyle: React.CSSProperties | undefined = lasso ? {
    position: 'fixed',
    left: Math.min(lasso.startX, lasso.currentX),
    top: Math.min(lasso.startY, lasso.currentY),
    width: Math.abs(lasso.currentX - lasso.startX),
    height: Math.abs(lasso.currentY - lasso.startY),
    background: 'rgba(239,33,55,0.08)',
    border: '1px solid rgba(239,33,55,0.3)',
    pointerEvents: 'none',
    zIndex: 9999,
  } : undefined;

  return (
    <>
      {/* Lasso overlay */}
      {lassoStyle && <div style={lassoStyle} />}

      <div
        ref={desktopRef}
        style={{ position: 'absolute', inset: 0 }}
        onContextMenu={openContextMenu}
        onMouseDown={handleDesktopMouseDown}
      >
        <Wallpaper />
        <HotCorner onTrigger={() => useOSStore.getState().setExpo(true)} />

        {/* Desktop icons */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {icons.map((d) => (
            <div key={d.label} data-desktop-icon>
              <DesktopIcon
                icon={d.icon}
                label={d.label}
                x={d.x}
                y={d.y}
                selected={selectedIcons.has(d.label) || draggingIcon === d.label}
                onDouble={() => handleIconDouble(d)}
                onContext={(e) => {
                  e.stopPropagation();
                  setSelectedIcons(new Set([d.label]));
                  openContextMenu(e);
                }}
                onDragStart={() => handleIconDragStart(d.label)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
