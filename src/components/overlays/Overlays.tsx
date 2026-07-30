import React from 'react';
import { useOSStore } from '../../system/osStore';

export function WorkspaceExpo() {
  const { expo, workspaces, workspace, setWorkspace, setExpo } =
    useOSStore();
  if (!expo) return null;

  return (
    <div
      onClick={() => setExpo(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(5,5,8,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        animation: 'expo-in 200ms var(--ease-out)',
      }}
    >
      <div
        className="label-mono"
        style={{ color: '#666', marginBottom: 24 }}
      >
        WORKSPACES · ⌘⇧E to toggle
      </div>
      <div
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {workspaces.map((w, i) => {
          const active = i === workspace;
          return (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setWorkspace(i);
                setExpo(false);
              }}
              style={{
                width: 280,
                height: 175,
                borderRadius: 0,
                cursor: 'pointer',
                background:
                  'radial-gradient(ellipse at 30% 20%, rgba(239,33,55,0.15), transparent 60%), #050810',
                border: `2px solid ${active ? '#ef2137' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: active
                  ? '0 0 30px rgba(239,33,55,0.4)'
                  : '0 10px 30px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 180ms var(--ease-standard)',
              }}
            >
              <div
                className="label-nano"
                style={{
                  position: 'absolute',
                  left: 10,
                  bottom: 10,
                  color: active ? '#ef2137' : '#666',
                }}
              >
                WS-{i + 1} · {w.name.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RunDialog() {
  const { runDialog, setRunDialog } = useOSStore();
  if (!runDialog) return null;

  return (
    <div
      onClick={() => setRunDialog(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '22vh',
        animation: 'fade-in 120ms var(--ease-out)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          borderRadius: 0,
          background: 'rgba(4,6,10,0.95)',
          border: '1px solid rgba(239,33,55,0.3)',
          boxShadow:
            '0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(239,33,55,0.15)',
          padding: 20,
          color: '#888',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          textAlign: 'center',
        }}
      >
        Run Dialog — port in progress
      </div>
    </div>
  );
}

export function LockScreen() {
  const { locked, setLocked } = useOSStore();
  const [pw, setPw] = React.useState('');
  const [err, setErr] = React.useState(false);

  React.useEffect(() => { if (locked) { setPw(''); setErr(false); } }, [locked]);
  if (!locked) return null;

  const submit = () => {
    if (pw === 'lelu' || pw === 'revenant') { setLocked(false); }
    else { setErr(true); setPw(''); }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 11000,
        background: 'radial-gradient(ellipse at center, #0a0e1a 0%, #020408 70%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 200, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
        {new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#666', letterSpacing: '0.1em', marginBottom: 32 }}>
        {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
      </div>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 'var(--r-control)',
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${err ? '#f87171' : 'rgba(239,33,55,0.3)'}`,
          boxShadow: err ? '0 0 20px rgba(248,113,113,0.3)' : '0 0 20px rgba(239,33,55,0.15)',
          width: 280,
        }}
      >
        <span style={{ color: err ? '#f87171' : '#ef2137', fontSize: 14 }}>&#x1f512;</span>
        <input
          autoFocus
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder={err ? 'Wrong password. Try again.' : 'Enter password to unlock'}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontFamily: 'var(--font-sans)', fontSize: 13,
          }}
        />
        <button
          onClick={submit}
          style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: '#ef2137', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 10px rgba(239,33,55,0.4)',
          }}
        >→</button>
      </div>
      <div style={{ position: 'absolute', bottom: 30, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#444', letterSpacing: '0.1em' }}>
        REVENANT OS 1.0.2 · LELU OS
      </div>
    </div>
  );
}

export function ContextMenu() {
  const { ctxMenu, setCtxMenu } = useOSStore();
  if (!ctxMenu) return null;

  return (
    <>
      <div
        onClick={() => setCtxMenu(null)}
        onContextMenu={(e) => {
          e.preventDefault();
          setCtxMenu(null);
        }}
        style={{ position: 'fixed', inset: 0, zIndex: 10500 }}
      />
      <div
        style={{
          position: 'absolute',
          left: ctxMenu.x,
          top: ctxMenu.y,
          zIndex: 10501,
          minWidth: 220,
          padding: 4,
          background: 'rgba(4,6,10,0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 0,
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.03)',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: '#e8e8e8',
          animation: 'ctx-in 120ms var(--ease-out)',
        }}
      >
        {ctxMenu.items.map((it, i) => {
          if (it === '---')
            return (
              <div
                key={i}
                style={{
                  height: 1,
                  background: 'rgba(255,255,255,0.06)',
                  margin: '4px 0',
                }}
              />
            );
          return (
            <button
              key={i}
              onClick={() => setCtxMenu(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--r-control)',
                background: 'transparent',
                border: 'none',
                color: '#ddd',
                cursor: 'pointer',
                textAlign: 'left' as const,
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  'rgba(239,33,55,0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.kb && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: '#555',
                  }}
                >
                  {it.kb}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
