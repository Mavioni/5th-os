import React from 'react';
import Icon from '../../components/ui/Icon';

export function FilesApp() {
  const [path, setPath] = React.useState(['Home']);
  const [sel, setSel] = React.useState('notes.md');

  const sidebar = [
    { label: 'Home', icon: 'Home', group: 'places' },
    { label: 'Desktop', icon: 'Monitor', group: 'places' },
    { label: 'Documents', icon: 'FileText', group: 'places' },
    { label: 'Downloads', icon: 'Download', group: 'places' },
    { label: 'Pictures', icon: 'Image', group: 'places' },
    { label: 'Music', icon: 'Music', group: 'places' },
    { label: 'Videos', icon: 'Play', group: 'places' },
    { label: 'Trash', icon: 'Trash', group: 'places' },
    { label: 'Root', icon: 'HardDrive', group: 'devices' },
    { label: 'Data (476 GB)', icon: 'HardDrive', group: 'devices' },
    { label: 'revenant-lab', icon: 'Globe', group: 'network' },
  ];

  const items = [
    { name: 'Desktop', type: 'folder', count: 4, modified: 'Today 14:22' },
    { name: 'Documents', type: 'folder', count: 47, modified: 'Today 11:40' },
    { name: 'Downloads', type: 'folder', count: 12, modified: 'Yesterday' },
    { name: 'Pictures', type: 'folder', count: 214, modified: 'Apr 12' },
    { name: 'Music', type: 'folder', count: 28, modified: 'Apr 08' },
    { name: 'Videos', type: 'folder', count: 6, modified: 'Apr 01' },
    { name: 'projects', type: 'folder', count: 9, modified: 'Today 13:12' },
    { name: 'revenant-kernel', type: 'folder', count: 2403, modified: '2m ago' },
    { name: 'notes.md', type: 'file', ext: 'md', size: '4.2 KB', modified: 'Today 14:44' },
    { name: 'release-plan.md', type: 'file', ext: 'md', size: '12.8 KB', modified: 'Today 12:01' },
    { name: 'build.log', type: 'file', ext: 'log', size: '287 KB', modified: 'Today 09:33' },
    { name: 'screenshot.png', type: 'file', ext: 'png', size: '1.4 MB', modified: 'Today 14:36' },
  ];

  const toolBtn: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 'var(--r-control)',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#aaa',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        background: '#020408',
        color: '#e8e8e8',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 200,
          background: 'rgba(255,255,255,0.02)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '10px 6px',
          overflow: 'auto',
        }}
      >
        {(['places', 'devices', 'network'] as const).map((g) => (
          <div key={g} style={{ marginBottom: 10 }}>
            <div
              className="label-nano"
              style={{ padding: '4px 10px' }}
            >
              {g}
            </div>
            {sidebar
              .filter((s) => s.group === g)
              .map((s) => {
                const active = s.label === path[0];
                return (
                  <div
                    key={s.label}
                    onClick={() => setPath([s.label])}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '5px 10px',
                      borderRadius: 'var(--r-control)',
                      background: active
                        ? 'rgba(239,33,55,0.12)'
                        : 'transparent',
                      color: active ? '#fff' : '#aaa',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon
                      name={s.icon}
                      size={13}
                      style={{
                        color: active ? '#ef2137' : '#888',
                      }}
                    />
                    <span>{s.label}</span>
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            height: 40,
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button style={toolBtn}>
            <Icon name="Chevron" size={14} />
          </button>
          <button style={toolBtn}>
            <Icon name="Chevron" size={14} />
          </button>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--r-control)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#ccc',
            }}
          >
            <Icon name="Home" size={12} style={{ color: '#ef2137' }} />
            <span style={{ color: '#555' }}>/</span>
            <span>home</span>
            <span style={{ color: '#555' }}>/</span>
            <span>jordan</span>
          </div>
          <button style={toolBtn}>
            <Icon name="Grid" size={14} />
          </button>
          <button style={toolBtn}>
            <Icon name="Menu" size={14} />
          </button>
          <button style={toolBtn}>
            <Icon name="Search" size={14} />
          </button>
        </div>

        {/* Listing */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 140px',
              padding: '8px 14px',
              gap: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#555',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span>Name</span>
            <span>Size</span>
            <span>Modified</span>
          </div>
          {items.map((it) => {
            const itemIcon =
              it.type === 'folder'
                ? 'Folder'
                : it.ext === 'png'
                  ? 'Image'
                  : it.ext === 'log'
                    ? 'Terminal'
                    : 'FileText';
            const active = sel === it.name;
            return (
              <div
                key={it.name}
                onClick={() => setSel(it.name)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 140px',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  background: active
                    ? 'rgba(239,33,55,0.12)'
                    : 'transparent',
                  borderLeft: `2px solid ${active ? '#ef2137' : 'transparent'}`,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Icon
                    name={itemIcon}
                    size={14}
                    style={{
                      color:
                        it.type === 'folder' ? '#ef2137' : '#888',
                    }}
                  />
                  <span
                    style={{
                      color: active ? '#fff' : '#ddd',
                    }}
                  >
                    {it.name}
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: '#888',
                  }}
                >
                  {it.type === 'folder'
                    ? `${it.count} items`
                    : it.size}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: '#666',
                  }}
                >
                  {it.modified}
                </span>
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div
          style={{
            height: 26,
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#666',
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          <span>
            {items.length} items · 1 selected (
            {items.find((i) => i.name === sel)?.size || '—'})
          </span>
          <span style={{ flex: 1 }} />
          <span>Data · 312 GB / 476 GB free</span>
        </div>
      </div>
    </div>
  );
}
