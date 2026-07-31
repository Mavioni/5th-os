import React from 'react';
import Icon from '../ui/Icon';
import { useOSStore, APPS, CATEGORIES, FAVORITES } from '../../system/osStore';

// ================================================================
// LELU WORDMARK
// ================================================================

function LeluMark() {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: '0.15em',
        color: '#e8e8e8',
        whiteSpace: 'nowrap',
      }}
    >
      LELU
      <span style={{ fontWeight: 300, opacity: 0.45, marginLeft: 2 }}>
        OS
      </span>
    </span>
  );
}

// ================================================================
// FAVORITE TILE (far-left column)
// ================================================================

function FavoriteTile({
  app,
  onLaunch,
}: {
  app: (typeof APPS)[0];
  onLaunch: (id: string) => void;
}) {
  const [h, setH] = React.useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={() => onLaunch(app.id)}
      title={app.name}
      style={{
        width: 44,
        height: 44,
        borderRadius: 'var(--r-control)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: h
          ? 'rgba(239,33,55,0.12)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${h ? 'rgba(239,33,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
        color: h ? '#ef2137' : '#c8c8c8',
        cursor: 'pointer',
        transition: 'all 120ms var(--ease-standard)',
        outline: 'none',
      }}
    >
      <Icon name={app.icon} size={20} />
    </button>
  );
}

// ================================================================
// SESSION BUTTON (lock, logout, shutdown)
// ================================================================

function SessionButton({
  icon,
  label,
  tone = 'default',
  onClick,
}: {
  icon: string;
  label: string;
  tone?: 'default' | 'danger';
  onClick: () => void;
}) {
  const [h, setH] = React.useState(false);
  const accent = tone === 'danger' ? '#f87171' : '#ef2137';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={label}
      style={{
        width: 44,
        height: 44,
        borderRadius: 'var(--r-control)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: h
          ? tone === 'danger'
            ? 'rgba(248,113,113,0.12)'
            : 'rgba(239,33,55,0.12)'
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${h ? accent + '4d' : 'rgba(255,255,255,0.06)'}`,
        color: h ? accent : '#888',
        cursor: 'pointer',
        transition: 'all 120ms var(--ease-standard)',
        outline: 'none',
      }}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

// ================================================================
// CATEGORY ROW (middle column)
// ================================================================

function CategoryRow({
  cat,
  selected,
  onSelect,
}: {
  cat: (typeof CATEGORIES)[0];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [h, setH] = React.useState(false);
  const active = selected === cat.id;
  return (
    <button
      onClick={() => onSelect(cat.id)}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '7px 14px',
        background: active
          ? 'rgba(239,33,55,0.1)'
          : h
            ? 'rgba(255,255,255,0.04)'
            : 'transparent',
        color: active ? '#e8e8e8' : '#bbb',
        border: 'none',
        borderLeft: `2px solid ${active ? '#ef2137' : 'transparent'}`,
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        textAlign: 'left' as const,
        transition: 'all 100ms var(--ease-standard)',
        outline: 'none',
      }}
    >
      <Icon name={cat.icon} size={15} />
      <span>{cat.name}</span>
    </button>
  );
}

// ================================================================
// APP ROW (right column)
// ================================================================

function AppRow({
  app,
  onLaunch,
  focused,
}: {
  app: (typeof APPS)[0];
  onLaunch: (id: string) => void;
  focused: boolean;
}) {
  const [h, setH] = React.useState(false);
  return (
    <button
      onClick={() => onLaunch(app.id)}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '8px 12px',
        borderRadius: 'var(--r-control)',
        background:
          h || focused
            ? 'rgba(239,33,55,0.1)'
            : 'transparent',
        border: `1px solid ${h || focused ? 'rgba(239,33,55,0.2)' : 'transparent'}`,
        cursor: 'pointer',
        textAlign: 'left' as const,
        color: '#e8e8e8',
        transition: 'all 100ms var(--ease-standard)',
        outline: 'none',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 'var(--r-control)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#c8c8c8',
          flexShrink: 0,
        }}
      >
        <Icon name={app.icon} size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ fontSize: 13, fontWeight: 500, color: '#e8e8e8' }}
        >
          {app.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#666',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {app.comment}
        </div>
      </div>
    </button>
  );
}

// ================================================================
// START MENU
// ================================================================

export function StartMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [cat, setCat] = React.useState('all');
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { launchApp, setLocked } = useOSStore();

  // Recently used apps (stored in localStorage)
  const getRecent = (): string[] => {
    try {
      const raw = localStorage.getItem('5th-os:recent-apps');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  };
  const [recent, setRecent] = React.useState<string[]>(getRecent);

  const trackRecent = (appId: string) => {
    const next = [appId, ...recent.filter(id => id !== appId)].slice(0, 5);
    setRecent(next);
    localStorage.setItem('5th-os:recent-apps', JSON.stringify(next));
  };

  // Sync recent on open
  React.useEffect(() => {
    if (open) setRecent(getRecent());
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setQ('');
      setCat('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const search = q.trim().toLowerCase();
  let visibleApps: typeof APPS;
  if (search) {
    visibleApps = APPS.filter(
      (a) =>
        a.name.toLowerCase().includes(search) ||
        a.comment.toLowerCase().includes(search) ||
        a.cat.includes(search),
    );
  } else if (cat === 'all') {
    visibleApps = APPS.slice().sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  } else if (cat === 'favorites') {
    visibleApps = FAVORITES.map((id) =>
      APPS.find((a) => a.id === id),
    ).filter(Boolean) as typeof APPS;
  } else {
    visibleApps = APPS.filter((a) => a.cat === cat);
  }
  const favApps = FAVORITES.map((id) =>
    APPS.find((a) => a.id === id),
  ).filter(Boolean) as typeof APPS;

  return (
    <>
      {/* Click-away layer */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'transparent',
        }}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: 8,
          bottom: 56,
          zIndex: 9999,
          width: 600,
          height: 520,
          display: 'flex',
          background: 'rgba(2,4,8,0.94)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(239,33,55,0.2)',
          borderRadius: 0,
          overflow: 'hidden',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(239,33,55,0.1), inset 0 0 0 1px rgba(255,255,255,0.03)',
          fontFamily: 'var(--font-sans)',
          animation: 'menu-in 160ms var(--ease-out)',
        }}
      >
        {/* Column 1 — Favorites rail + session */}
        <div
          style={{
            width: 64,
            display: 'flex',
            flexDirection: 'column',
            padding: '14px 10px',
            gap: 10,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.015)',
          }}
        >
          <div
            className="label-nano"
            style={{ color: '#555', textAlign: 'center', marginBottom: 2 }}
          >
            FAV
          </div>
          {favApps.map((a) => (
            <FavoriteTile
              key={a.id}
              app={a}
              onLaunch={(id) => {
                launchApp(id);
                trackRecent(id);
                onClose();
              }}
            />
          ))}
          <div style={{ flex: 1 }} />
          <div
            style={{
              height: 1,
              background: 'rgba(255,255,255,0.06)',
              margin: '0 -2px',
            }}
          />
          <SessionButton
            icon="Settings"
            label="Settings"
            onClick={() => {
              launchApp('settings');
              onClose();
            }}
          />
          <SessionButton
            icon="Lock"
            label="Lock"
            onClick={() => {
              setLocked(true);
              onClose();
            }}
          />
          <SessionButton
            icon="LogOut"
            label="Log out"
            onClick={() => {
              setLocked(true);
              onClose();
            }}
          />
          <SessionButton
            icon="Power"
            label="Shutdown"
            tone="danger"
            onClick={() => {
              setLocked(true);
              onClose();
            }}
          />
        </div>

        {/* Column 2 — Categories */}
        <div
          style={{
            width: 180,
            display: 'flex',
            flexDirection: 'column',
            padding: '14px 0',
            gap: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            className="label-nano"
            style={{
              padding: '0 14px 10px',
              color: '#555',
            }}
          >
            CATEGORIES
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {CATEGORIES.map((c) => (
              <CategoryRow
                key={c.id}
                cat={c}
                selected={cat}
                onSelect={(id) => {
                  setCat(id);
                  setQ('');
                }}
              />
            ))}
          </div>

          {/* Places (desktop quick access) */}
          <div
            style={{
              padding: '10px 14px 4px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#555',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            PLACES
          </div>
          {([
            { label: 'Home', icon: 'Home' },
            { label: 'Desktop', icon: 'Monitor' },
            { label: 'Trash', icon: 'Trash' },
          ] as const).map((p) => (
            <button
              key={p.label}
              onClick={() => {
                launchApp('files');
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '5px 14px',
                background: 'transparent',
                border: 'none',
                color: '#999',
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left' as const,
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  'rgba(255,255,255,0.04)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  'transparent')
              }
            >
              <Icon name={p.icon} size={13} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Column 3 — Apps + Search + Header */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header: user + search */}
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #ef2137, #8b1419)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: '0 0 12px rgba(239,33,55,0.5)',
                }}
              >
                JL
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: '#e8e8e8',
                    fontWeight: 500,
                  }}
                >
                  Jordan Lin
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: '#666',
                  }}
                >
                  jordan@revenant ·{' '}
                  <span style={{ color: '#10b981' }}>online</span>
                </div>
              </div>
              <LeluMark />
            </div>

            {/* Search bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 'var(--r-control)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Icon name="Search" size={14} style={{ color: '#666' }} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type to search applications…"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#e8e8e8',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: '#555',
                  padding: '2px 6px',
                  borderRadius: 'var(--r-control)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                ESC
              </span>
            </div>
          </div>

          {/* Apps list */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '10px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {visibleApps.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#666', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                no matches for "{q}"
              </div>
            )}

            {/* Recently used — shown when no search and no specific category */}
            {!search && cat === 'all' && recent.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div className="label-nano" style={{ padding: '2px 12px 6px', color: '#ef2137' }}>RECENT</div>
                {recent.slice(0, 3).map(id => {
                  const a = APPS.find(x => x.id === id);
                  if (!a) return null;
                  return (
                    <AppRow key={`recent-${a.id}`} app={a} focused={false}
                      onLaunch={(id) => { launchApp(id); trackRecent(id); onClose(); }} />
                  );
                })}
              </div>
            )}

            {visibleApps.map((a, i) => (
              <AppRow key={a.id} app={a} focused={i === 0 && !!search}
                onLaunch={(id) => { launchApp(id); trackRecent(id); onClose(); }} />
            ))}
          </div>

          {/* Footer: status */}
          <div
            style={{
              height: 28,
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#555',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <span>
              ${' '}
              {search
                ? `search "${q}"`
                : cat === 'all'
                  ? 'apps --all'
                  : `apps --cat=${cat}`}
            </span>
            <span style={{ flex: 1 }} />
            <span>
              {visibleApps.length} result
              {visibleApps.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
