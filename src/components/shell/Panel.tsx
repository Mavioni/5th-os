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
                  onContextMenu={(e) => {
                    e.preventDefault();
                    const state = useOSStore.getState();
                    state.setCtxMenu({
                      x: e.clientX, y: e.clientY,
                      items: [
                        { id: 'win-focus', label: 'Focus', icon: 'Monitor' },
                        { id: 'win-minimize', label: 'Minimize', icon: 'Minus' },
                        { id: 'win-maximize', label: w.maximized ? 'Restore' : 'Maximize', icon: 'Maximize' },
                        '---',
                        { id: 'win-close', label: 'Close', icon: 'X', tone: 'danger' },
                      ],
                    });
                  }}
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

      {/* System tray popovers */}
      {popover && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: 48, right: 8, width: 320, maxHeight: 400, overflow: 'auto', background: 'rgba(4,6,10,0.96)', backdropFilter: 'blur(20px)', border: '1px solid rgba(239,33,55,0.2)', borderRadius: 0, padding: 8, zIndex: 2000, boxShadow: '0 20px 50px rgba(0,0,0,0.7)', fontFamily: 'var(--font-sans)', color: '#e8e8e8', fontSize: 12 }}>
          {popover === 'notif' && <NotificationPopover />}
          {popover === 'clock' && <CalendarPopover />}
          {popover === 'sound' && <SoundPopover />}
          {popover === 'network' && <NetworkPopover />}
          {popover === 'power' && <PowerPopover />}
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════
// POPOVER COMPONENTS
// ═══════════════════════════════════════

function NotificationPopover() {
  const notifs = useOSStore((s) => s.notifications);
  return (
    <div>
      <div className="label-mono" style={{ marginBottom: 10 }}>NOTIFICATIONS</div>
      {notifs.length === 0 ? <div style={{ color: '#666', fontSize: 12 }}>No notifications</div> :
        notifs.slice(0, 5).map((n) => (
          <div key={n.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontWeight: 600, color: '#ccc', fontSize: 12 }}>{n.title}</div>
            <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{n.body}</div>
            <div style={{ color: '#555', fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{n.source} · {n.time}</div>
          </div>
        ))}
    </div>
  );
}

function CalendarPopover() {
  const now = new Date();
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells: (number|null)[] = Array.from({length: 42}, (_, i) => {
    const d = i - firstDay + 1;
    return d > 0 && d <= daysInMonth ? d : null;
  });

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>
        {now.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
        {days.map((d) => <div key={d} style={{ fontSize: 10, color: '#555', padding: 4 }}>{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} style={{
            padding: 6, fontSize: 11, borderRadius: 'var(--r-control)',
            color: d === now.getDate() ? '#ef2137' : d ? '#ccc' : '#333',
            background: d === now.getDate() ? 'rgba(239,33,55,0.15)' : 'transparent',
            fontWeight: d === now.getDate() ? 700 : 400,
          }}>{d}</div>
        ))}
      </div>
    </div>
  );
}

function SoundPopover() {
  const { volume, setVolume } = useOSStore();
  return (
    <div>
      <div className="label-mono" style={{ marginBottom: 10 }}>SOUND</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>🔊</span>
        <input type="range" min={0} max={100} value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#ef2137' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ccc', minWidth: 36 }}>{volume}%</span>
      </div>
    </div>
  );
}

function NetworkPopover() {
  return (
    <div>
      <div className="label-mono" style={{ marginBottom: 10 }}>NETWORK</div>
      <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ color: '#10b981', fontWeight: 600, fontSize: 12 }}>● Connected</div>
        <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>Wi-Fi · revenant-lab-5g</div>
        <div style={{ color: '#555', fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 2 }}>IP: 192.168.1.42 · 866 Mbps</div>
      </div>
    </div>
  );
}

function PowerPopover() {
  const setLocked = useOSStore((s) => s.setLocked);
  return (
    <div>
      <div className="label-mono" style={{ marginBottom: 10 }}>POWER</div>
      <div style={{ fontSize: 12, color: '#ccc', marginBottom: 8 }}>Battery: 87% · Charging</div>
      <button onClick={() => setLocked(true)}
        style={{ width: '100%', padding: '8px', borderRadius: 'var(--r-control)', background: 'rgba(239,33,55,0.1)', border: '1px solid rgba(239,33,55,0.2)', color: '#ef2137', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12 }}>
        Lock Screen
      </button>
    </div>
  );
}
