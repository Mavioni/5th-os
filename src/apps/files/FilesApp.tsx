import React from 'react';
import Icon from '../../components/ui/Icon';
import { useOSStore } from '../../system/osStore';
import {
  listDir, getCWD, setCWD, exists, isDirectory,
  createDirectory, writeFile, getNode,
} from '../../system/vfs';

// Format a timestamp as a relative time string
function fmtTime(ts?: number): string {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  const d = new Date(ts);
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function fmtSize(bytes?: number): string {
  if (bytes == null) return '—';
  if (bytes > 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  if (bytes > 1000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
}

function getFileIcon(name: string, type: 'file' | 'directory'): string {
  if (type === 'directory') return 'Folder';
  const ext = name.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    md: 'FileText', txt: 'FileText', log: 'Terminal',
    png: 'Image', jpg: 'Image', jpeg: 'Image', svg: 'Image',
    json: 'Code', js: 'Code', ts: 'Code', tsx: 'Code',
    py: 'Code', rs: 'Code', c: 'Code', h: 'Code',
    css: 'Code', html: 'Code', toml: 'FileText', yaml: 'FileText',
    lock: 'Lock', gitignore: 'GitBranch',
    ico: 'Image', desktop: 'Zap',
  };
  return iconMap[ext || ''] || 'FileText';
}

export function FilesApp() {
  const launchApp = useOSStore((s) => s.launchApp);
  const [cwd, setLocalCwd] = React.useState(getCWD());
  const [items, setItems] = React.useState(listDir(cwd));
  const [sel, setSel] = React.useState<string | null>(null);
  const [view, setView] = React.useState<'grid' | 'list'>('list');
  const [search, setSearch] = React.useState('');

  // Refresh listing when cwd changes
  const refresh = (dir?: string) => {
    const d = dir || cwd;
    setItems(listDir(d));
    setSel(null);
  };

  const navigateTo = (absPath: string) => {
    if (exists(absPath) && isDirectory(absPath)) {
      setCWD(absPath);
      setLocalCwd(absPath);
      refresh(absPath);
    }
  };

  const handleItemClick = (name: string) => {
    setSel(name);
  };

  const handleItemDouble = (name: string) => {
    const childPath = cwd.replace(/\/$/, '') + '/' + name;
    const node = getNode(childPath);
    if (!node) return;
    if (node.type === 'directory') {
      navigateTo(childPath);
    } else {
      // Open in text editor
      launchApp('texteditor');
      // Store path for editor to read
      sessionStorage.setItem('5th-os:editor-file', childPath);
    }
  };

  // Breadcrumb parts
  const breadParts = cwd.split('/').filter(Boolean);
  if (breadParts[0] === 'home' && breadParts[1] === 'jordan') {
    breadParts[0] = '🏠';
    breadParts.splice(1, 0, 'jordan');
  }

  const handleCreateFolder = () => {
    const name = prompt('Folder name:');
    if (name && name.trim()) {
      const newPath = cwd.replace(/\/$/, '') + '/' + name.trim();
      if (createDirectory(newPath)) refresh();
    }
  };

  const handleCreateFile = () => {
    const name = prompt('File name:');
    if (name && name.trim()) {
      const newPath = cwd.replace(/\/$/, '') + '/' + name.trim();
      if (writeFile(newPath, '')) refresh();
    }
  };

  // Filter by search
  const filtered = search
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  // Sort: directories first, then alphabetical
  const sorted = [...filtered].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  // Sidebar places
  const sidebarPlaces = [
    { label: 'Home', path: '/home/jordan', icon: 'Home' },
    { label: 'Desktop', path: '/home/jordan/Desktop', icon: 'Monitor' },
    { label: 'Documents', path: '/home/jordan/Documents', icon: 'FileText' },
    { label: 'Downloads', path: '/home/jordan/Downloads', icon: 'Download' },
    { label: 'Pictures', path: '/home/jordan/Pictures', icon: 'Image' },
    { label: 'Projects', path: '/home/jordan/projects', icon: 'Folder' },
  ];

  const toolBtn: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 'var(--r-control)',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
    color: '#aaa', cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', outline: 'none',
  };

  return (
    <div style={{ height: '100%', display: 'flex', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '10px 6px', overflow: 'auto' }}>
        <div className="label-nano" style={{ padding: '4px 10px', marginBottom: 4 }}>PLACES</div>
        {sidebarPlaces.map((s) => {
          const active = cwd === s.path;
          return (
            <div key={s.path} onClick={() => navigateTo(s.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
                borderRadius: 'var(--r-control)', background: active ? 'rgba(239,33,55,0.12)' : 'transparent',
                color: active ? '#fff' : '#aaa', fontSize: 12, cursor: 'pointer',
              }}>
              <Icon name={s.icon} size={13} style={{ color: active ? '#ef2137' : '#888' }} />
              <span>{s.label}</span>
            </div>
          );
        })}

        {/* Quick actions */}
        <div className="label-nano" style={{ padding: '4px 10px', marginTop: 16, marginBottom: 4 }}>ACTIONS</div>
        <div onClick={handleCreateFolder} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 'var(--r-control)', color: '#aaa', fontSize: 12, cursor: 'pointer' }}>
          <Icon name="FolderPlus" size={13} style={{ color: '#888' }} />
          <span>New folder</span>
        </div>
        <div onClick={handleCreateFile} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 'var(--r-control)', color: '#aaa', fontSize: 12, cursor: 'pointer' }}>
          <Icon name="FilePlus" size={13} style={{ color: '#888' }} />
          <span>New file</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{ height: 40, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button style={toolBtn} onClick={() => {
            const parent = cwd.split('/').slice(0, -1).join('/') || '/';
            navigateTo(parent);
          }} title="Back">
            <Icon name="ChevronLeft" size={14} />
          </button>
          <button style={toolBtn} onClick={() => refresh()} title="Refresh">
            <Icon name="Refresh" size={14} />
          </button>

          {/* Breadcrumb */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--r-control)', fontFamily: 'var(--font-mono)', fontSize: 11, overflow: 'hidden' }}>
            {breadParts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: '#555' }}>/</span>}
                <span
                  onClick={() => {
                    const target = '/' + breadParts.slice(0, i + 1).join('/');
                    // Skip the 🏠 emoji
                    const clean = target.replace('🏠', 'home');
                    if (exists(clean) && isDirectory(clean)) navigateTo(clean);
                  }}
                  style={{
                    color: i === breadParts.length - 1 ? '#fff' : '#888',
                    cursor: i < breadParts.length - 1 ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                  }}>
                  {part}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--r-control)' }}>
            <Icon name="Search" size={12} style={{ color: '#666' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter..."
              style={{ width: 100, background: 'transparent', border: 'none', outline: 'none', color: '#e8e8e8', fontFamily: 'var(--font-sans)', fontSize: 11 }} />
          </div>

          <button style={toolBtn} onClick={() => setView(view === 'list' ? 'grid' : 'list')} title="Toggle view">
            <Icon name={view === 'list' ? 'Grid' : 'Menu'} size={14} />
          </button>
        </div>

        {/* Listing */}
        <div style={{ flex: 1, overflow: 'auto' }} onContextMenu={(e) => e.preventDefault()}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px', padding: '8px 14px', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#555', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span>Name</span>
            <span>Size</span>
            <span>Modified</span>
          </div>

          {sorted.map((it) => {
            const active = sel === it.name;
            return (
              <div key={it.name}
                onClick={() => handleItemClick(it.name)}
                onDoubleClick={() => handleItemDouble(it.name)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSel(it.name);
                }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 140px',
                  alignItems: 'center', gap: 8, padding: '6px 14px',
                  background: active ? 'rgba(239,33,55,0.12)' : 'transparent',
                  borderLeft: `2px solid ${active ? '#ef2137' : 'transparent'}`,
                  cursor: 'pointer', fontSize: 12, userSelect: 'none' as const,
                }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name={getFileIcon(it.name, it.type)} size={14}
                    style={{ color: it.type === 'directory' ? '#ef2137' : '#888' }} />
                  <span style={{ color: active ? '#fff' : '#ddd' }}>{it.name}</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888' }}>
                  {it.type === 'directory' ? '—' : fmtSize(it.size)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#666' }}>
                  {fmtTime(it.modified)}
                </span>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#555', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {search ? `No items matching "${search}"` : 'Empty directory'}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div style={{ height: 26, padding: '0 14px', display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#666', background: 'rgba(0,0,0,0.3)' }}>
          <span>{sorted.length} item{sorted.length !== 1 ? 's' : ''}</span>
          {sel && <span style={{ marginLeft: 12 }}>· Selected: {sel} ({fmtSize(items.find(i => i.name === sel)?.size)})</span>}
          <span style={{ flex: 1 }} />
          <span>{cwd}</span>
        </div>
      </div>
    </div>
  );
}
