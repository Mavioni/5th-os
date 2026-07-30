import React from 'react';
import { writeFile } from '../../system/vfs';

// ================================================================
// SCREENSHOT — captures viewport to VFS
// ================================================================

export function ScreenshotApp() {
  const [captured, setCaptured] = React.useState(false);
  const [filename, setFilename] = React.useState('');

  const capture = () => {
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const name = `screenshot-${ts}.png`;
    // In a real OS this would use canvas/screen capture
    writeFile(`/home/jordan/Pictures/${name}`, '[SCREENSHOT CAPTURED]');
    setFilename(name);
    setCaptured(true);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)', gap: 16 }}>
      {captured ? (
        <>
          <div style={{ fontSize: 40 }}>📸</div>
          <div style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Screenshot captured</div>
          <div style={{ color: '#888', fontSize: 12, fontFamily: 'var(--font-mono)' }}>~/Pictures/{filename}</div>
          <button onClick={() => setCaptured(false)}
            style={{ padding: '8px 20px', borderRadius: 'var(--r-control)', background: 'rgba(239,33,55,0.1)', border: '1px solid rgba(239,33,55,0.2)', color: '#ef2137', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12 }}>
            Take another
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48, opacity: 0.5 }}>📷</div>
          <div style={{ color: '#888', fontSize: 13 }}>Press the button to capture your desktop</div>
          <button onClick={capture}
            style={{ padding: '12px 32px', borderRadius: 'var(--r-control)', background: '#ef2137', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, boxShadow: '0 0 24px rgba(239,33,55,0.4)' }}>
            Capture Screenshot
          </button>
          <div style={{ color: '#555', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 8 }}>Saved to ~/Pictures/</div>
        </>
      )}
    </div>
  );
}

// ================================================================
// CHARACTER MAP
// ================================================================

export function CharMapApp() {
  const [selected, setSelected] = React.useState('');
  const ranges = [
    { label: 'Latin', start: 0x21, end: 0x7E },
    { label: 'Latin Ext', start: 0xA0, end: 0xFF },
    { label: 'Arrows', start: 0x2190, end: 0x21FF },
    { label: 'Math', start: 0x2200, end: 0x22FF },
    { label: 'Blocks', start: 0x2580, end: 0x259F },
    { label: 'Symbols', start: 0x2600, end: 0x26FF },
    { label: 'Dingbats', start: 0x2700, end: 0x27BF },
  ];
  const [range, setRange] = React.useState(ranges[0]);

  const chars = Array.from({ length: 16 }, (_, row) =>
    Array.from({ length: 16 }, (_, col) => {
      const code = range.start + row * 16 + col;
      return code <= range.end ? String.fromCodePoint(code) : '';
    })
  );

  return (
    <div style={{ height: '100%', display: 'flex', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: 150, borderRight: '1px solid rgba(255,255,255,0.06)', padding: 10, overflow: 'auto' }}>
        {ranges.map(r => (
          <div key={r.label} onClick={() => setRange(r)}
            style={{
              padding: '6px 10px', cursor: 'pointer', borderRadius: 'var(--r-control)',
              background: range.label === r.label ? 'rgba(239,33,55,0.12)' : 'transparent',
              color: range.label === r.label ? '#fff' : '#888', fontSize: 12,
            }}>{r.label}</div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: 2 }}>
          {chars.flat().map((c, i) => c ? (
            <div key={i} onClick={() => { setSelected(c); navigator.clipboard?.writeText(c); }}
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: selected === c ? 'rgba(239,33,55,0.2)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selected === c ? 'rgba(239,33,55,0.4)' : 'rgba(255,255,255,0.04)'}`,
                cursor: 'pointer', fontSize: 16, borderRadius: 'var(--r-control)',
              }} title={`U+${(range.start + i).toString(16).toUpperCase()}`}>
              {c}
            </div>
          ) : <div key={i} style={{ width: 36, height: 36 }} />)}
        </div>
        {selected && (
          <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: '#888' }}>
            Selected: <span style={{ color: '#ef2137', fontSize: 20 }}>{selected}</span>
            <span style={{ marginLeft: 12, color: '#555' }}>
              U+{selected.codePointAt(0)?.toString(16).toUpperCase()}
            </span>
            <span style={{ marginLeft: 12, color: '#10b981', fontSize: 10 }}>Copied!</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================================
// DRAWING — simple canvas
// ================================================================

export function DrawApp() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = React.useState(false);
  const [color, setColor] = React.useState('#ef2137');
  const [size, setSize] = React.useState(3);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const start = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stop = () => setDrawing(false);
  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#020408' }}>
      <div style={{ height: 40, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {['#ef2137', '#22dcff', '#10b981', '#f59e0b', '#ffffff', '#888888', '#020408'].map(c => (
          <div key={c} onClick={() => setColor(c)}
            style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: color === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }} />
        ))}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
        {[1, 3, 5, 8, 12].map(s => (
          <div key={s} onClick={() => setSize(s)}
            style={{ width: s * 2, height: s * 2, borderRadius: '50%', background: size === s ? '#ef2137' : '#888', cursor: 'pointer' }} />
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={clear} style={{ padding: '4px 12px', borderRadius: 'var(--r-control)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 11 }}>Clear</button>
      </div>
      <canvas ref={canvasRef} width={800} height={500}
        onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
        style={{ flex: 1, background: '#020408', cursor: 'crosshair' }} />
    </div>
  );
}

// ================================================================
// BROWSER (Firefox) — working URL bar + iframe
// ================================================================

export function BrowserApp() {
  const [url, setUrl] = React.useState('https://mavioni.github.io/5th-os/');
  const [navUrl, setNavUrl] = React.useState(url);
  const [loading, setLoading] = React.useState(true);
  const [blocked, setBlocked] = React.useState(false);
  const [history, setHistory] = React.useState<string[]>([url]);
  const [histIdx, setHistIdx] = React.useState(0);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const blockedTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = (u: string) => {
    let target = u.trim();
    // If it looks like a search query (no dots, no protocol), search externally
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (!target.includes('.') || target.includes(' ')) {
        // Search query — open in external browser
        window.open('https://duckduckgo.com/?q=' + encodeURIComponent(target), '_blank', 'noopener,noreferrer');
        setUrl(target); // keep the query in the bar
        return;
      }
      target = 'https://' + target;
    }
    setUrl(target);
    setNavUrl(target);
    setLoading(true);
    setBlocked(false);
    if (blockedTimer.current) clearTimeout(blockedTimer.current);
    blockedTimer.current = setTimeout(() => {
      setLoading(false);
      setBlocked(true);
    }, 4000);
    const newHistory = history.slice(0, histIdx + 1);
    newHistory.push(target);
    setHistory(newHistory);
    setHistIdx(newHistory.length - 1);
  };

  const goBack = () => {
    if (histIdx > 0) {
      const newIdx = histIdx - 1;
      setHistIdx(newIdx);
      const prevUrl = history[newIdx];
      setUrl(prevUrl);
      setNavUrl(prevUrl);
      setLoading(true);
      setBlocked(false);
    }
  };

  const goForward = () => {
    if (histIdx < history.length - 1) {
      const newIdx = histIdx + 1;
      setHistIdx(newIdx);
      const nextUrl = history[newIdx];
      setUrl(nextUrl);
      setNavUrl(nextUrl);
      setLoading(true);
      setBlocked(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') navigate(url);
  };

  // Detect successful iframe load
  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      setLoading(false);
      if (blockedTimer.current) clearTimeout(blockedTimer.current);
      // Don't auto-clear blocked — let the timer handle it
    };
    iframe.addEventListener('load', onLoad);
    return () => {
      iframe.removeEventListener('load', onLoad);
      if (blockedTimer.current) clearTimeout(blockedTimer.current);
    };
  }, [navUrl]);

  const openExternally = () => {
    window.open(navUrl, '_blank', 'noopener,noreferrer');
    setBlocked(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#020408' }}>
      {/* Toolbar */}
      <div style={{ height: 40, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={goBack} disabled={histIdx <= 0}
          style={{ ...navBtn, opacity: histIdx <= 0 ? 0.3 : 1 }}>←</button>
        <button onClick={goForward} disabled={histIdx >= history.length - 1}
          style={{ ...navBtn, opacity: histIdx >= history.length - 1 ? 0.3 : 1 }}>→</button>
        <button onClick={() => navigate(url)} style={{ ...navBtn, color: '#10b981' }}>↻</button>

        {/* URL bar */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--r-control)', padding: '0 4px',
        }}>
          {loading && <span style={{ marginLeft: 6, fontSize: 10, color: '#f59e0b' }}>⟳</span>}
          {!loading && !blocked && <span style={{ marginLeft: 6, fontSize: 8, color: '#10b981' }}>●</span>}
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={handleKey}
            placeholder="Enter URL — search queries open externally"
            spellCheck={false}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#e8e8e8', fontFamily: 'var(--font-sans)', fontSize: 12,
              padding: '5px 6px',
            }} />
        </div>

        <button onClick={() => navigate(url)}
          style={{
            padding: '4px 12px', borderRadius: 'var(--r-control)', fontSize: 11,
            background: 'rgba(239,33,55,0.12)', border: '1px solid rgba(239,33,55,0.25)',
            color: '#ef2137', cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>Go</button>
      </div>

      {/* Bookmarks bar */}
      <div style={{ height: 28, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 11, fontFamily: 'var(--font-sans)' }}>
        {[
          { label: '5th OS', url: 'https://mavioni.github.io/5th-os/' },
          { label: 'GitHub', url: 'https://github.com' },
          { label: 'Wikipedia', url: 'https://en.m.wikipedia.org' },
        ].map(b => (
          <span key={b.label} onClick={() => navigate(b.url)}
            style={{ color: '#888', cursor: 'pointer' }}>{b.label}</span>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
        {blocked ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)', gap: 16, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 36, opacity: 0.4 }}>🚫</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc' }}>
              This page cannot be displayed in the 5th OS browser
            </div>
            <div style={{ fontSize: 12, color: '#888', maxWidth: 400, lineHeight: 1.5 }}>
              The site at <span style={{ fontFamily: 'var(--font-mono)', color: '#ef2137' }}>{navUrl}</span> blocks embedding for security reasons (Content-Security-Policy).
            </div>
            <button onClick={openExternally}
              style={{
                padding: '10px 28px', borderRadius: 'var(--r-control)', fontSize: 13,
                background: '#ef2137', border: 'none', color: '#fff', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontWeight: 600,
                boxShadow: '0 0 20px rgba(239,33,55,0.3)',
              }}>
              Open in External Browser ↗
            </button>
            <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)' }}>
              Or try a different URL — many sites allow embedding
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={navUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Browser"
          />
        )}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 'var(--r-control)',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#888', cursor: 'pointer', fontSize: 14, display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};

// ================================================================
// MAIL — inbox simulation
// ================================================================

export function MailApp() {
  const [selected, setSelected] = React.useState<number | null>(null);
  const emails = [
    { from: 'Sam Park', subject: 'Re: Kernel review — merging Monday', preview: 'Looks good overall. One nit on the scheduler patch regarding NUMA node balancing...', time: '14:22', unread: true },
    { from: 'GitHub', subject: '[5th-os] Build #47 passed', preview: 'Your workflow run completed successfully. Deploy to Pages took 28 seconds.', time: '13:45', unread: false },
    { from: 'Lelu Agent Runtime', subject: 'Agent "billing-reconciler" completed', preview: 'Processed 42 invoices. 3 flagged for review. Summary saved to Documents.', time: '12:10', unread: true },
    { from: 'Security Alert', subject: 'Failed login attempt from 192.168.1.44', preview: '5 failed SSH attempts detected. IP temporarily blocked by firewall.', time: '11:32', unread: false },
    { from: 'Jordan Lin', subject: 'Draft: 5th OS 1.1 roadmap', preview: 'Here\'s what I\'m thinking for the next release. Would love your input on...', time: '09:15', unread: false },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.06)', padding: 10 }}>
        <button style={{ width: '100%', padding: '8px', borderRadius: 'var(--r-control)', background: '#ef2137', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
          + Compose
        </button>
        {['Inbox (3)', 'Sent', 'Drafts', 'Trash'].map(f => (
          <div key={f} style={{ padding: '6px 10px', color: f.startsWith('Inbox') ? '#fff' : '#888', fontSize: 12, cursor: 'pointer', borderRadius: 'var(--r-control)', background: f.startsWith('Inbox') ? 'rgba(239,33,55,0.1)' : 'transparent' }}>
            {f}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {emails.map((e, i) => (
          <div key={i} onClick={() => setSelected(i)}
            style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selected === i ? 'rgba(239,33,55,0.08)' : 'transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: e.unread ? 700 : 400, color: e.unread ? '#fff' : '#ccc', fontSize: 13 }}>{e.from}</span>
              <span style={{ fontSize: 11, color: '#666', fontFamily: 'var(--font-mono)' }}>{e.time}</span>
            </div>
            <div style={{ fontWeight: e.unread ? 600 : 400, fontSize: 12, color: '#ddd', marginBottom: 2 }}>{e.subject}</div>
            <div style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.preview}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// CHAT (HexChat IRC)
// ================================================================

export function ChatApp() {
  const [msgs] = React.useState([
    { nick: 'jordan', text: 'kernel built clean. pushing to test.', time: '14:22' },
    { nick: 'sam', text: 'nice. did you fix the pageflip handler?', time: '14:23' },
    { nick: 'jordan', text: 'yeah, #1242 is resolved. testing on 120Hz now', time: '14:24' },
    { nick: 'lelu-bot', text: 'Build log confirmed. 0 errors, 2 warnings. Mool-ti-pass.', time: '14:24' },
    { nick: 'sam', text: 'beautiful. merge it', time: '14:25' },
  ]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ padding: '2px 0', lineHeight: 1.5 }}>
            <span style={{ color: '#555' }}>[{m.time}]</span>
            {' '}
            <span style={{ color: m.nick === 'jordan' ? '#ef2137' : m.nick === 'lelu-bot' ? '#10b981' : '#22dcff', fontWeight: 600 }}>
              &lt;{m.nick}&gt;
            </span>
            {' '}
            <span style={{ color: '#ccc' }}>{m.text}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
        <input placeholder="#revenant-kernel — 4 users"
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--r-control)', padding: '5px 10px', color: '#e8e8e8', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
      </div>
    </div>
  );
}

// ================================================================
// WRITER (LibreOffice Writer) — reuse editor
// ================================================================

export function WriterApp() {
  // Reuse the editor component
  const EditorApp = React.lazy(() => import('../editor/EditorApp').then(m => ({ default: m.EditorApp })));
  return (
    <React.Suspense fallback={<div style={{ padding: 40, color: '#888', textAlign: 'center' }}>Loading Writer...</div>}>
      <EditorApp />
    </React.Suspense>
  );
}

// ================================================================
// CALENDAR
// ================================================================

export function CalendarApp() {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth());
  const [selected, setSelected] = React.useState(now.getDate());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const cells: (number | null)[] = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
          style={calBtn}>←</button>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{monthNames[month]} {year}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
          style={calBtn}>→</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 12px', textAlign: 'center' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ padding: 8, fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px', flex: 1 }}>
        {cells.map((day, i) => (
          <div key={i} onClick={() => day && setSelected(day)}
            style={{
              padding: 8, textAlign: 'center', cursor: day ? 'pointer' : 'default', fontSize: 13,
              color: day === now.getDate() && month === now.getMonth() && year === now.getFullYear() ? '#ef2137' : day ? '#ccc' : '#333',
              background: day === selected ? 'rgba(239,33,55,0.15)' : 'transparent',
              borderRadius: 'var(--r-control)', fontWeight: day === selected ? 600 : 400,
            }}>
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

const calBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 'var(--r-control)', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', color: '#888', cursor: 'pointer', fontSize: 14,
};

// ================================================================
// MUSIC PLAYER
// ================================================================

export function MusicApp() {
  const [playing, setPlaying] = React.useState(false);
  const [track, setTrack] = React.useState(0);
  const tracks = [
    { title: 'Revenant Theme', artist: 'Lelu AIOS', duration: '3:42' },
    { title: 'Nemo Claw', artist: 'Jordan Lin', duration: '5:18' },
    { title: 'Kernel Panic', artist: 'Null Pointer', duration: '2:55' },
    { title: 'Fifth Element', artist: 'Eric Serra', duration: '4:28' },
    { title: 'Multi-pass', artist: 'Lelu AIOS', duration: '6:10' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ width: 160, height: 160, borderRadius: 0, background: 'linear-gradient(135deg, #1a0a0e, #0a0205)', border: '2px solid rgba(239,33,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(239,33,55,0.15)' }}>
          <span style={{ fontSize: 48, opacity: 0.5 }}>💿</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{tracks[track].title}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{tracks[track].artist} · {tracks[track].duration}</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button onClick={() => setTrack(t => (t - 1 + tracks.length) % tracks.length)} style={musicBtn}>⏮</button>
          <button onClick={() => setPlaying(!playing)}
            style={{ ...musicBtn, width: 48, height: 48, fontSize: 20, background: playing ? '#ef2137' : 'rgba(239,33,55,0.15)', borderColor: playing ? '#ef2137' : 'rgba(239,33,55,0.3)' }}>
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={() => setTrack(t => (t + 1) % tracks.length)} style={musicBtn}>⏭</button>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {tracks.map((t, i) => (
          <div key={i} onClick={() => setTrack(i)} onDoubleClick={() => setPlaying(true)}
            style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', background: i === track ? 'rgba(239,33,55,0.08)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 12 }}>
            <span style={{ color: i === track ? '#ef2137' : '#ccc' }}>{t.title}</span>
            <span style={{ color: '#666', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{t.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const musicBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', color: '#ccc', cursor: 'pointer',
  fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// ================================================================
// VIDEO PLAYER
// ================================================================

export function VideoApp() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#888', fontFamily: 'var(--font-sans)', gap: 12 }}>
      <div style={{ fontSize: 48, opacity: 0.3 }}>🎬</div>
      <div>No video loaded. Drag a file or use File → Open.</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button style={{ ...musicBtn, width: 40, height: 40 }}>⏮</button>
        <button style={{ ...musicBtn, width: 48, height: 48, fontSize: 18 }}>▶</button>
        <button style={{ ...musicBtn, width: 40, height: 40 }}>⏭</button>
      </div>
    </div>
  );
}

// ================================================================
// SOUND RECORDER
// ================================================================

export function MicApp() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)', gap: 16 }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(239,33,55,0.08)', border: '2px solid rgba(239,33,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 36, opacity: 0.6 }}>🎙</span>
      </div>
      <div style={{ fontSize: 14, color: '#ccc' }}>Sound Recorder</div>
      <div style={{ color: '#888', fontSize: 12, fontFamily: 'var(--font-mono)' }}>00:00 / --:--</div>
      <button style={{ width: 60, height: 60, borderRadius: '50%', background: '#ef2137', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20, boxShadow: '0 0 30px rgba(239,33,55,0.4)' }}>
        ●
      </button>
    </div>
  );
}

// ================================================================
// UPDATE MANAGER
// ================================================================

export function UpdateApp() {
  const updates = [
    { pkg: 'linux-image-6.8.0-52', from: '6.8.0-51', size: '124 MB', type: 'security' },
    { pkg: 'chromium-browser', from: '132.0', size: '98 MB', type: 'security' },
    { pkg: 'libreoffice-core', from: '24.8.2', size: '42 MB', type: 'update' },
    { pkg: 'lelu-agentd', from: '1.0.1', size: '8 MB', type: 'update' },
    { pkg: 'nemo-claw', from: '2.4.0', size: '12 MB', type: 'security' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
      <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 13, color: '#ccc' }}>{updates.length} updates available</div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Total: 284 MB · Last checked: Just now</div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {updates.map(u => (
          <div key={u.pkg} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 12 }}>
            <input type="checkbox" defaultChecked style={{ accentColor: '#ef2137' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ccc' }}>{u.pkg}</div>
              <div style={{ fontSize: 10, color: '#666' }}>{u.from} → latest</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#888' }}>{u.size}</span>
            <span style={{
              padding: '2px 6px', borderRadius: 'var(--r-control)', fontSize: 9, fontFamily: 'var(--font-mono)',
              background: u.type === 'security' ? 'rgba(239,33,55,0.1)' : 'rgba(34,220,255,0.1)',
              color: u.type === 'security' ? '#ef2137' : '#22dcff',
            }}>{u.type.toUpperCase()}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
        <button style={{ padding: '8px 24px', borderRadius: 'var(--r-control)', background: '#ef2137', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600 }}>Install Updates</button>
        <button style={{ padding: '8px 24px', borderRadius: 'var(--r-control)', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#888', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12 }}>Check Again</button>
      </div>
    </div>
  );
}

// ================================================================
// DISKS
// ================================================================

export function DisksApp() {
  return (
    <div style={{ height: '100%', background: '#020408', color: '#e8e8e8', padding: 20, fontFamily: 'var(--font-sans)', overflow: 'auto' }}>
      <div className="label-mono" style={{ marginBottom: 20 }}>DISKS & STORAGE</div>
      {[
        { dev: '/dev/nvme0n1', model: 'Samsung 990 Pro', size: '2.0 TB', used: '312 GB', free: '1.7 TB', pct: 15 },
        { dev: '/dev/sda', model: '5th OS USB', size: '122 GB', used: '2.1 GB', free: '120 GB', pct: 2 },
      ].map(d => (
        <div key={d.dev} style={{ marginBottom: 20, padding: 14, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#ccc' }}>{d.dev}</span>
            <span style={{ fontSize: 11, color: '#888' }}>{d.model}</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', marginBottom: 6 }}>
            <div style={{ width: `${d.pct}%`, height: '100%', background: d.pct > 90 ? '#ef2137' : '#22dcff', boxShadow: `0 0 8px ${d.pct > 90 ? '#ef2137' : '#22dcff'}` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666', fontFamily: 'var(--font-mono)' }}>
            <span>{d.used} used</span>
            <span>{d.free} free</span>
            <span>{d.size} total</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// USERS & GROUPS
// ================================================================

export function UsersApp() {
  return (
    <div style={{ height: '100%', background: '#020408', color: '#e8e8e8', padding: 20, fontFamily: 'var(--font-sans)' }}>
      <div className="label-mono" style={{ marginBottom: 20 }}>USERS & GROUPS</div>
      {[
        { user: 'jordan', full: 'Jordan Lin', groups: 'sudo, audio, video', shell: '/bin/zsh', avatar: 'J' },
        { user: 'lelu', full: 'Lelu AIOS', groups: 'lelu, sandbox', shell: '/bin/lelu', avatar: 'L' },
        { user: 'root', full: 'Superuser', groups: 'root', shell: '/bin/bash', avatar: '#' },
      ].map(u => (
        <div key={u.user} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #ef2137, #8b1419)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)' }}>
            {u.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#ccc', fontWeight: 600 }}>{u.full}</div>
            <div style={{ fontSize: 11, color: '#888', fontFamily: 'var(--font-mono)' }}>{u.user} · {u.groups}</div>
          </div>
          <span style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)' }}>{u.shell}</span>
        </div>
      ))}
      <button style={{ marginTop: 16, padding: '8px 20px', borderRadius: 'var(--r-control)', background: 'rgba(239,33,55,0.1)', border: '1px solid rgba(239,33,55,0.2)', color: '#ef2137', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12 }}>
        + Add User
      </button>
    </div>
  );
}

// ================================================================
// DRIVER MANAGER
// ================================================================

export function DriverApp() {
  return (
    <div style={{ height: '100%', background: '#020408', color: '#e8e8e8', padding: 20, fontFamily: 'var(--font-sans)', overflow: 'auto' }}>
      <div className="label-mono" style={{ marginBottom: 20 }}>DRIVER MANAGER</div>
      {[
        { dev: 'AMD Radeon RX 7900 XTX', driver: 'amdgpu', ver: '25.0.2', status: 'active' },
        { dev: 'Intel I225-V Ethernet', driver: 'igc', ver: '6.8.0', status: 'active' },
        { dev: 'Intel Wi-Fi 6E AX210', driver: 'iwlwifi', ver: '6.8.0', status: 'active' },
        { dev: 'Realtek ALC4080 Audio', driver: 'snd-usb-audio', ver: '6.8.0', status: 'active' },
        { dev: 'Nemo Claw Sandbox', driver: 'nemo-claw', ver: '2.4.1', status: 'active' },
        { dev: 'Lelu Agent Runtime', driver: 'lelu-agentd', ver: '1.0.2', status: 'active' },
      ].map(d => (
        <div key={d.dev} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
          <span style={{ color: '#ccc' }}>{d.dev}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#888' }}>{d.driver} v{d.ver}</span>
          <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: 10 }}>● {d.status}</span>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// THEMES
// ================================================================

export function ThemeApp() {
  const [theme, setTheme] = React.useState('tactical');
  const themes = [
    { id: 'tactical', name: 'Tactical Dark', desc: 'Default — military HUD aesthetic', bg: '#020408', accent: '#ef2137' },
    { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon synthwave', bg: '#0a0014', accent: '#ff00ff' },
    { id: 'arctic', name: 'Arctic Code', desc: 'Ice-blue terminal', bg: '#010a14', accent: '#22dcff' },
    { id: 'emerald', name: 'Emerald', desc: 'Matrix green', bg: '#010804', accent: '#10b981' },
    { id: 'amber', name: 'Amber CRT', desc: 'Retro monochrome', bg: '#080400', accent: '#f59e0b' },
  ];

  return (
    <div style={{ height: '100%', background: '#020408', color: '#e8e8e8', padding: 20, fontFamily: 'var(--font-sans)', overflow: 'auto' }}>
      <div className="label-mono" style={{ marginBottom: 20 }}>THEMES</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {themes.map(t => (
          <div key={t.id} onClick={() => setTheme(t.id)}
            style={{
              padding: 16, cursor: 'pointer', borderRadius: 0,
              background: t.bg, border: `2px solid ${theme === t.id ? t.accent : 'rgba(255,255,255,0.08)'}`,
              boxShadow: theme === t.id ? `0 0 24px ${t.accent}33` : 'none',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: t.accent, boxShadow: `0 0 10px ${t.accent}` }} />
              <span style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{t.name}</span>
            </div>
            <div style={{ fontSize: 11, color: '#888' }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// DISPLAY SETTINGS
// ================================================================

export function DisplayApp() {
  return (
    <div style={{ height: '100%', background: '#020408', color: '#e8e8e8', padding: 20, fontFamily: 'var(--font-sans)' }}>
      <div className="label-mono" style={{ marginBottom: 20 }}>DISPLAY</div>
      {[
        ['Resolution', '3840 × 2160 (4K)'],
        ['Refresh Rate', '144 Hz'],
        ['Scaling', '100%'],
        ['Orientation', 'Landscape'],
        ['HDR', 'Enabled (HDR10)'],
        ['Night Light', 'Off'],
      ].map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
          <span style={{ color: '#888' }}>{label}</span>
          <span style={{ color: '#ccc', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// PRIVACY
// ================================================================

export function PrivacyApp() {
  return (
    <div style={{ height: '100%', background: '#020408', color: '#e8e8e8', padding: 20, fontFamily: 'var(--font-sans)' }}>
      <div className="label-mono" style={{ marginBottom: 20 }}>PRIVACY & SECURITY</div>
      {[
        ['Location Services', 'Disabled'],
        ['Camera Access', 'Blocked'],
        ['Microphone Access', 'Blocked'],
        ['File System Access', 'Sandbox only (Nemo Claw)'],
        ['Network Access', 'Filtered'],
        ['Telemetry', 'Off'],
        ['AI Data Sharing', 'Never'],
      ].map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
          <span style={{ color: '#888' }}>{label}</span>
          <span style={{ color: value === 'Never' || value === 'Off' || value.startsWith('Blocked') ? '#10b981' : '#f59e0b', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// BLUETOOTH
// ================================================================

export function BluetoothApp() {
  return (
    <div style={{ height: '100%', background: '#020408', color: '#e8e8e8', padding: 20, fontFamily: 'var(--font-sans)' }}>
      <div className="label-mono" style={{ marginBottom: 20 }}>BLUETOOTH</div>
      <div style={{ padding: 14, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 16 }}>
        <span style={{ color: '#10b981' }}>●</span> Bluetooth is active — Discoverable as "5th-OS"
      </div>
      {[
        { name: 'AirPods Pro', type: 'Audio', paired: true, connected: true },
        { name: 'MX Master 3S', type: 'Mouse', paired: true, connected: true },
        { name: 'Keychron K8 Pro', type: 'Keyboard', paired: true, connected: false },
      ].map(d => (
        <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
          <div>
            <div style={{ color: '#ccc' }}>{d.name}</div>
            <div style={{ fontSize: 10, color: '#666' }}>{d.type}</div>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: d.connected ? '#10b981' : '#888',
          }}>
            {d.connected ? '● Connected' : 'Paired'}
          </span>
        </div>
      ))}
    </div>
  );
}
