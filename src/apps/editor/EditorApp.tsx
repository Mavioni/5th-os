import React from 'react';

export function EditorApp() {
  const [txt, setTxt] = React.useState(`# revenant-linux 1.0.2 — release notes

## Highlights
- Cinnamon 6.4-lelu: true-black theme, red accent system
- Lelu agent runtime integrated into the session manager
- Redesigned menu, panel, and system tray
- 13 built-in agents configurable from Settings → Agents

## System
- Kernel 6.8.0 with amdgpu improvements
- Mesa 25.0, PipeWire 1.2
- Firefox 132, LibreOffice 24.8

## Breaking
- /etc/cinnamon → /etc/lelu
- The old menu.xml layout is replaced by menu.toml

## Known issues
- Clock applet jitters on 120Hz displays (#1242)
- Software Manager pagination flickers (#1267)
`);

  const lines = txt.split('\n');

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#020408',
        color: '#e8e8e8',
      }}
    >
      {/* Menu bar */}
      <div
        style={{
          height: 32,
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          color: '#888',
        }}
      >
        {['File', 'Edit', 'View', 'Search', 'Tools', 'Documents', 'Help'].map(
          (m) => (
            <span key={m} style={{ padding: '2px 8px', cursor: 'default' }}>
              {m}
            </span>
          ),
        )}
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#555',
          }}
        >
          release-notes.md · markdown · {lines.length} lines
        </span>
      </div>

      {/* Editor body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Line numbers */}
        <div
          style={{
            padding: '12px 10px',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#555',
            textAlign: 'right' as const,
            userSelect: 'none' as const,
            background: 'rgba(255,255,255,0.015)',
            borderRight: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {lines.map((_, i) => (
            <div key={i} style={{ lineHeight: 1.55 }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text area */}
        <textarea
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          style={{
            flex: 1,
            padding: 12,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: '#e8e8e8',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            lineHeight: 1.55,
            resize: 'none' as const,
          }}
        />
      </div>

      {/* Status bar */}
      <div
        style={{
          height: 24,
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.3)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: '#666',
        }}
      >
        <span style={{ color: '#ef2137' }}>● Modified</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>Ln 1, Col 1</span>
        <span style={{ flex: 1 }} />
        <span>Tab size: 2</span>
      </div>
    </div>
  );
}
