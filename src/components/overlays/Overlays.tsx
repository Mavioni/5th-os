import React from 'react';
import { useOSStore, APPS } from '../../system/osStore';

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
  const [input, setInput] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (runDialog) {
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [runDialog]);

  if (!runDialog) return null;

  const execute = () => {
    const cmd = input.trim();
    if (!cmd) { setRunDialog(false); return; }

    const state = useOSStore.getState();
    // Try to launch as an app first
    const app = APPS.find((a) => a.id === cmd || a.name.toLowerCase() === cmd.toLowerCase());
    if (app) {
      state.launchApp(app.id);
      setRunDialog(false);
      return;
    }
    // Try to open as a file
    import('../../system/vfs').then(({ exists }) => {
      if (exists(cmd) || exists('/home/jordan/' + cmd)) {
        const path = cmd.startsWith('/') ? cmd : '/home/jordan/' + cmd;
        window.dispatchEvent(new CustomEvent('5th-os:open-file', { detail: path }));
        state.launchApp('texteditor');
      }
    });
    setRunDialog(false);
  };

  return (
    <div
      onClick={() => setRunDialog(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', paddingTop: '22vh',
      }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: 460, borderRadius: 0,
          background: 'rgba(4,6,10,0.95)',
          border: '1px solid rgba(239,33,55,0.3)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(239,33,55,0.15)',
          padding: '14px 18px',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#ef2137', fontSize: 16, fontFamily: 'var(--font-mono)' }}>▸</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') execute();
              if (e.key === 'Escape') setRunDialog(false);
            }}
            placeholder="Type an app name, command, or file path..."
            spellCheck={false}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#e8e8e8', fontFamily: 'var(--font-mono)', fontSize: 14,
              caretColor: '#ef2137',
            }}
          />
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)' }}>
          Launch apps · Open files · Press Enter to run
        </div>
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

  const submit = async () => {
    // Hash the input and compare against stored hash (default: 'revenant')
    const stored = localStorage.getItem('5th-os:passhash') || 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
    const inputHash = await sha256(pw);
    if (inputHash === stored) { setLocked(false); }
    else { setErr(true); setPw(''); }
  };

  async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

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

  const handleAction = (id: string) => {
    setCtxMenu(null);
    const state = useOSStore.getState();
    
    switch (id) {
      case 'new-folder':
        import('../../system/vfs').then(({ createDirectory, getCWD }) => {
          const name = prompt('Folder name:');
          if (name) createDirectory(getCWD().replace(/\/$/, '') + '/' + name);
        });
        break;
      case 'new-file':
        import('../../system/vfs').then(({ writeFile, getCWD }) => {
          const name = prompt('File name:');
          if (name) writeFile(getCWD().replace(/\/$/, '') + '/' + name, '');
        });
        break;
      case 'terminal':  state.launchApp('terminal'); break;
      case 'settings':  state.launchApp('settings'); break;
      case 'wallpaper': state.launchApp('theme'); break;
      // Window actions
      case 'win-close':     if (state.focusedId) state.closeWin(state.focusedId); break;
      case 'win-minimize':  if (state.focusedId) state.minWin(state.focusedId); break;
      case 'win-maximize':  if (state.focusedId) state.maxWin(state.focusedId); break;
      case 'win-focus':     break; // already focused
      case 'select-all': break;
      case 'arrange':   break;
      case 'paste':     break;
    }
  };

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
              onClick={() => handleAction(it.id)}
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
