import React from 'react';
import Icon from '../ui/Icon';
import { useOSStore, APPS, PANEL_PINNED } from '../../system/osStore';

function PanelButton({
  active,
  onClick,
  title,
  children,
  glow,
  id,
}: {
  active?: boolean;
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
  glow?: boolean;
  id?: string;
}) {
  const [h, setH] = React.useState(false);
  return (
    <button
      data-panel-id={id}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={title}
      style={{
        height: 34,
        minWidth: 34,
        padding: '0 8px',
        borderRadius: 'var(--r-control)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        background: active
          ? 'rgba(239,33,55,0.15)'
          : h
            ? 'rgba(255,255,255,0.06)'
            : 'transparent',
        border: `1px solid ${active ? 'rgba(239,33,55,0.35)' : 'transparent'}`,
        color: active ? '#ef2137' : '#c8c8c8',
        cursor: 'pointer',
        transition: 'all 120ms var(--ease-standard)',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        boxShadow: glow && active ? '0 0 12px rgba(239,33,55,0.35)' : 'none',
        position: 'relative',
        outline: 'none',
      }}
    >
      {children}
    </button>
  );
}

export const Panel = React.memo(function Panel() {
  const {
    menuOpen,
    setMenuOpen,
    popover,
    setPopover,
    windows,
    focusedId,
    launchApp,
    bringToFront,
    workspace,
    showDesktop,
    notifications,
    clock,
  } = useOSStore();

  const pinnedApps = PANEL_PINNED.map((id) => APPS.find((a) => a.id === id)).filter(
    Boolean,
  );

  // Group windows by app
  const winsByApp: Record<string, typeof windows> = {};
  for (const w of windows) {
    if (w.workspace !== workspace) continue;
    if (!winsByApp[w.appId]) winsByApp[w.appId] = [];
    winsByApp[w.appId].push(w);
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 48,
        background: 'rgba(2,4,8,0.85)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        gap: 4,
        zIndex: 1000,
        boxShadow:
          '0 -1px 0 rgba(239,33,55,0.08), 0 -20px 40px rgba(0,0,0,0.3)',
      }}
    >
      {/* Menu button */}
      <PanelButton
        active={menuOpen}
        onClick={() => {
          setMenuOpen(!menuOpen);
          setPopover(null);
        }}
        title="Applications"
        glow
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 'var(--r-control)',
            background: menuOpen ? '#ef2137' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: menuOpen ? '#fff' : '#020408',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: 11,
            transition: 'all 150ms var(--ease-standard)',
            boxShadow: menuOpen
              ? '0 0 12px rgba(239,33,55,0.6)'
              : '0 0 0 rgba(0,0,0,0)',
          }}
        >
          L
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '0.1em',
            color: menuOpen ? '#ef2137' : '#ccc',
          }}
        >
          MENU
        </span>
      </PanelButton>

      <div
        style={{
          width: 1,
          height: 20,
          background: 'rgba(255,255,255,0.08)',
          margin: '0 4px',
        }}
      />

      {/* Pinned apps */}
      {pinnedApps.map((app) => {
        if (!app) return null;
        const running = !!winsByApp[app.id]?.length;
        const focused = winsByApp[app.id]?.some(
          (w) => w.id === focusedId,
        );
        return (
          <PanelButton
            key={app.id}
            active={focused}
            onClick={() => {
              const wins = winsByApp[app.id] || [];
              if (wins.length) bringToFront(wins[0].id);
              else launchApp(app.id);
            }}
            title={app.name}
          >
            <Icon name={app.icon} size={18} />
            {running && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: focused ? 12 : 4,
                  height: 2,
                  borderRadius: 1,
                  background: focused ? '#ef2137' : '#666',
                  boxShadow: focused ? '0 0 6px #ef2137' : 'none',
                  transition: 'all 150ms var(--ease-standard)',
                }}
              />
            )}
          </PanelButton>
        );
      })}

      <div
        style={{
          width: 1,
          height: 20,
          background: 'rgba(255,255,255,0.08)',
          margin: '0 4px',
        }}
      />

      {/* Window list (non-pinned running) */}
      <div style={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
        {Object.entries(winsByApp)
          .filter(([id]) => !PANEL_PINNED.includes(id))
          .map(([appId, wins]) => {
            const app = APPS.find((a) => a.id === appId);
            if (!app) return null;
            return wins.map((w) => {
              const focused = w.id === focusedId && !w.minimized;
              return (
                <button
                  key={w.id}
                  onClick={() => bringToFront(w.id)}
                  style={{
                    height: 34,
                    padding: '0 10px',
                    borderRadius: 'var(--r-control)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: focused
                      ? 'rgba(239,33,55,0.12)'
                      : w.minimized
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${focused ? 'rgba(239,33,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    color: focused ? '#fff' : '#bbb',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    maxWidth: 180,
                    minWidth: 100,
                    transition: 'all 120ms var(--ease-standard)',
                    outline: 'none',
                  }}
                >
                  <Icon name={app.icon} size={14} />
                  <span
                    style={{
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'left' as const,
                      opacity: w.minimized ? 0.5 : 1,
                    }}
                  >
                    {w.title}
                  </span>
                  {focused && (
                    <span
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: '50%',
                        background: '#ef2137',
                        boxShadow: '0 0 4px #ef2137',
                      }}
                    />
                  )}
                </button>
              );
            });
          })}
      </div>

      {/* System tray */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <PanelButton
          id="notif"
          active={popover === 'notif'}
          onClick={() => setPopover(popover === 'notif' ? null : 'notif')}
          title="Notifications"
        >
          <Icon name="Bell" size={16} />
          {notifications.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ef2137',
                boxShadow: '0 0 6px #ef2137',
              }}
            />
          )}
        </PanelButton>
        <PanelButton
          id="network"
          active={popover === 'network'}
          onClick={() => setPopover(popover === 'network' ? null : 'network')}
          title="Network"
        >
          <Icon name="Wifi" size={16} />
        </PanelButton>
        <PanelButton
          id="sound"
          active={popover === 'sound'}
          onClick={() => setPopover(popover === 'sound' ? null : 'sound')}
          title="Sound"
        >
          <Icon name="Volume" size={16} />
        </PanelButton>
        <PanelButton
          id="power"
          active={popover === 'power'}
          onClick={() => setPopover(popover === 'power' ? null : 'power')}
          title="Battery"
        >
          <Icon name="Battery" size={16} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#888',
            }}
          >
            87%
          </span>
        </PanelButton>

        <div
          style={{
            width: 1,
            height: 20,
            background: 'rgba(255,255,255,0.08)',
            margin: '0 4px',
          }}
        />

        <PanelButton
          id="clock"
          active={popover === 'clock'}
          onClick={() => setPopover(popover === 'clock' ? null : 'clock')}
          title="Calendar"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              lineHeight: 1.15,
              padding: '0 4px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: '#fff',
                fontWeight: 500,
              }}
            >
              {clock.time}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: '#666',
                letterSpacing: '0.05em',
              }}
            >
              {clock.date}
            </span>
          </div>
        </PanelButton>

        <PanelButton
          title="Show desktop"
          onClick={() => showDesktop()}
        >
          <div
            style={{
              width: 3,
              height: 18,
              background: 'rgba(239,33,55,0.4)',
              borderRadius: 1,
            }}
          />
        </PanelButton>
      </div>
    </div>
  );
});
