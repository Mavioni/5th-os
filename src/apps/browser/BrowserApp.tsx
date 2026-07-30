import React from 'react';

// ================================================================
// BROWSER — working URL bar + native search + external fallback
// ================================================================

export function BrowserApp() {
  const [url, setUrl] = React.useState('');
  const [viewUrl, setViewUrl] = React.useState('https://mavioni.github.io/5th-os/');
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState<string[]>(['https://mavioni.github.io/5th-os/']);
  const [histIdx, setHistIdx] = React.useState(0);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const navigate = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Search query (no dots, or has spaces, or no protocol)
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      if (!trimmed.includes('.') || trimmed.includes(' ')) {
        window.open('https://duckduckgo.com/?q=' + encodeURIComponent(trimmed), '_blank', 'noopener,noreferrer');
        return;
      }
    }

    let target = trimmed;
    if (!target.startsWith('http')) target = 'https://' + target;

    setUrl(target);
    setViewUrl(target);
    setLoading(true);

    const newHistory = history.slice(0, histIdx + 1);
    newHistory.push(target);
    setHistory(newHistory);
    setHistIdx(newHistory.length - 1);
  };

  const goBack = () => {
    if (histIdx > 0) {
      const idx = histIdx - 1;
      setHistIdx(idx);
      const u = history[idx];
      setUrl(u);
      setViewUrl(u);
      setLoading(true);
    }
  };

  const goForward = () => {
    if (histIdx < history.length - 1) {
      const idx = histIdx + 1;
      setHistIdx(idx);
      const u = history[idx];
      setUrl(u);
      setViewUrl(u);
      setLoading(true);
    }
  };

  const reload = () => {
    setLoading(true);
    setViewUrl(v => v); // trigger re-render for iframe reload
    if (iframeRef.current) {
      iframeRef.current.src = viewUrl;
    }
  };

  const openExternal = () => {
    window.open(viewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') navigate(url || viewUrl);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#020408' }}>
      {/* Toolbar */}
      <div style={{ height: 42, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={goBack} disabled={histIdx <= 0}
          style={{ ...navBtn, opacity: histIdx <= 0 ? 0.3 : 1, fontSize: 16 }}>←</button>
        <button onClick={goForward} disabled={histIdx >= history.length - 1}
          style={{ ...navBtn, opacity: histIdx >= history.length - 1 ? 0.3 : 1, fontSize: 16 }}>→</button>
        <button onClick={reload} style={navBtn}>↻</button>

        {/* URL bar */}
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search or enter URL"
          spellCheck={false}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--r-control)',
            padding: '6px 10px', color: '#e8e8e8',
            fontFamily: 'var(--font-sans)', fontSize: 12, outline: 'none',
          }}
        />

        <button onClick={() => navigate(url || viewUrl)}
          style={{
            padding: '4px 14px', borderRadius: 'var(--r-control)', fontSize: 11,
            background: 'rgba(239,33,55,0.12)', border: '1px solid rgba(239,33,55,0.25)',
            color: '#ef2137', cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>Go</button>

        <button onClick={openExternal}
          title="Open in external browser"
          style={{
            padding: '4px 10px', borderRadius: 'var(--r-control)', fontSize: 13,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            color: '#888', cursor: 'pointer',
          }}>↗</button>
      </div>

      {/* Bookmarks */}
      <div style={{ height: 28, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 11, fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>
        <span style={{ color: '#555', fontSize: 10, fontFamily: 'var(--font-mono)' }}>BOOKMARKS</span>
        {[
          { label: '5th OS', url: 'https://mavioni.github.io/5th-os/' },
          { label: 'Wikipedia', url: 'https://en.m.wikipedia.org' },
        ].map(b => (
          <span key={b.label} onClick={() => navigate(b.url)}
            style={{ color: '#888', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {b.label}
          </span>
        ))}
        <span style={{ flex: 1 }} />
        {loading && <span style={{ fontSize: 10, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>Loading...</span>}
      </div>

      {/* Content */}
      <iframe
        ref={iframeRef}
        src={viewUrl}
        style={{ flex: 1, border: 'none', background: '#fff' }}
        title="Browser"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 'var(--r-control)',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#aaa', cursor: 'pointer', fontSize: 13, display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};

import { registerApp } from '../../system/appRegistry';
registerApp('firefox', () => import('./BrowserApp.tsx').then(m => ({ default: m.BrowserApp })));
