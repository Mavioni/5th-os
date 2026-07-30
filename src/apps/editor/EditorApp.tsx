import React from 'react';
import { readFile, writeFile } from '../../system/vfs';

export function EditorApp() {
  const [filePath, setFilePath] = React.useState<string | null>(null);
  const [txt, setTxt] = React.useState('');
  const [dirty, setDirty] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Open file from VFS — called both on mount and via event
  const openFile = React.useCallback((path: string) => {
    const content = readFile(path);
    if (content !== null) {
      setFilePath(path);
      setTxt(content);
      setDirty(false);
    }
  }, []);

  // Listen for file-open events from Files app (works even when already mounted)
  React.useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent).detail as string;
      if (path) openFile(path);
    };
    window.addEventListener('5th-os:open-file', handler);
    return () => window.removeEventListener('5th-os:open-file', handler);
  }, [openFile]);

  // On first mount, check sessionStorage for legacy file-open
  React.useEffect(() => {
    const path = sessionStorage.getItem('5th-os:editor-file');
    if (path) {
      sessionStorage.removeItem('5th-os:editor-file');
      openFile(path);
      return;
    }
    // Default content for new editor
    setTxt(`# 5th OS — Release Notes

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
  }, [openFile]);

  const handleSave = () => {
    if (filePath) {
      writeFile(filePath, txt);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      // Save as new file
      const name = prompt('Save as:', 'untitled.md');
      if (name) {
        const path = '/home/jordan/Documents/' + name;
        writeFile(path, txt);
        setFilePath(path);
        setDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }
  };

  const handleChange = (val: string) => {
    setTxt(val);
    setDirty(true);
  };

  // Keyboard shortcut: Ctrl+S to save
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [txt, filePath]);

  const lines = txt.split('\n');
  const fileName = filePath ? filePath.split('/').pop() || 'untitled' : 'untitled.md';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#020408', color: '#e8e8e8' }}>
      {/* Menu bar */}
      <div style={{ height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'var(--font-sans)', fontSize: 11, color: '#888' }}>
        {['File', 'Edit', 'View', 'Search', 'Tools', 'Help'].map((m) => (
          <span key={m} style={{ padding: '2px 8px', cursor: 'default' }}>{m}</span>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={handleSave}
          style={{
            padding: '3px 10px', fontSize: 10, fontFamily: 'var(--font-mono)',
            background: dirty ? 'rgba(239,33,55,0.2)' : saved ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${dirty ? 'rgba(239,33,55,0.4)' : saved ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 'var(--r-control)', color: dirty ? '#ef2137' : saved ? '#10b981' : '#888',
            cursor: 'pointer', letterSpacing: '0.1em',
          }}>
          {saved ? '✓ SAVED' : dirty ? '● SAVE' : 'SAVED'}
        </button>
      </div>

      {/* Editor body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Line numbers */}
        <div style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#555', textAlign: 'right' as const, userSelect: 'none' as const, background: 'rgba(255,255,255,0.015)', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          {lines.map((_, i) => (
            <div key={i} style={{ lineHeight: 1.55 }}>{i + 1}</div>
          ))}
        </div>

        {/* Text area */}
        <textarea value={txt} onChange={(e) => handleChange(e.target.value)}
          style={{ flex: 1, padding: 12, border: 'none', outline: 'none', background: 'transparent', color: '#e8e8e8', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.55, resize: 'none' as const }} />
      </div>

      {/* Status bar */}
      <div style={{ height: 24, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#666' }}>
        <span style={{ color: dirty ? '#ef2137' : '#10b981' }}>{dirty ? '● Modified' : '● Saved'}</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span style={{ flex: 1 }} />
        <span>{fileName} · {lines.length} lines · {txt.length} chars</span>
      </div>
    </div>
  );
}
