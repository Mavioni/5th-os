import React, { useCallback, useRef } from 'react';
import Icon from '../../components/ui/Icon';
import { useOSStore } from '../../system/osStore';
import {
  listDir, getCWD, setCWD, exists, isDirectory, getNode,
  createDirectory, writeFile, deleteNode, deleteRecursive,
} from '../../system/vfs';

// ================================================================
// FORMAT HELPERS
// ================================================================

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
    png: 'Image', jpg: 'Image', jpeg: 'Image', svg: 'Image', gif: 'Image',
    json: 'Code', js: 'Code', ts: 'Code', tsx: 'Code', jsx: 'Code',
    py: 'Code', rs: 'Code', c: 'Code', h: 'Code', cpp: 'Code',
    css: 'Code', html: 'Code', toml: 'FileText', yaml: 'FileText', yml: 'FileText',
    lock: 'Lock', gitignore: 'GitBranch', sh: 'Terminal', bash: 'Terminal',
    ico: 'Image', desktop: 'Zap', xml: 'Code', cfg: 'Settings',
  };
  return iconMap[ext || ''] || 'FileText';
}

// ================================================================
// FILE TREE SIDEBAR
// ================================================================

interface TreeNode { name: string; type: 'file' | 'directory'; children?: TreeNode[]; }

function buildTree(path: string, depth = 0): TreeNode[] {
  if (depth > 3) return [];
  const items = listDir(path);
  return items
    .filter(i => i.type === 'directory')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(i => {
      const childPath = path.replace(/\/$/, '') + '/' + i.name;
      return {
        name: i.name,
        type: 'directory' as const,
        children: buildTree(childPath, depth + 1),
      };
    });
}

function FileTreeItem({ node, path, activePath, onNavigate, depth = 0 }: {
  node: TreeNode; path: string; activePath: string;
  onNavigate: (p: string) => void; depth?: number;
}) {
  const [expanded, setExpanded] = React.useState(depth < 1);
  const currentPath = path.replace(/\/$/, '') + '/' + node.name;
  const isActive = activePath === currentPath;
  const hasKids = node.children && node.children.length > 0;

  return (
    <div>
      <div
        onClick={() => {
          setExpanded(!expanded);
          onNavigate(currentPath);
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: `4px 6px 4px ${8 + depth * 16}px`,
          background: isActive ? 'rgba(239,33,55,0.12)' : 'transparent',
          color: isActive ? '#fff' : '#aaa', fontSize: 11,
          cursor: 'pointer', borderRadius: 'var(--r-control)',
          borderLeft: isActive ? '2px solid #ef2137' : '2px solid transparent',
        }}>
        <Icon name={expanded ? 'ChevronDown' : 'ChevronRight'} size={10}
          style={{ color: '#555', flexShrink: 0, opacity: hasKids ? 1 : 0 }} />
        <Icon name="Folder" size={12}
          style={{ color: isActive ? '#ef2137' : '#888', flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {node.name}
        </span>
      </div>
      {expanded && hasKids && node.children!.map(child => (
        <FileTreeItem key={child.name} node={child} path={currentPath}
          activePath={activePath} onNavigate={onNavigate} depth={depth + 1} />
      ))}
    </div>
  );
}

// ================================================================
// CONTEXT MENU
// ================================================================

interface CtxState {
  x: number; y: number; fileName: string; fileType: 'file' | 'directory';
}

// ================================================================
// MAIN FILES APP
// ================================================================

export function FilesApp() {
  const launchApp = useOSStore((s) => s.launchApp);
  const [cwd, setLocalCwd] = React.useState(getCWD());
  const [items, setItems] = React.useState(listDir(getCWD()));
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [lastClicked, setLastClicked] = React.useState<string | null>(null);
  const [view, setView] = React.useState<'list' | 'grid'>('list');
  const [search, setSearch] = React.useState('');
  const [renaming, setRenaming] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [ctxMenu, setCtxMenu] = React.useState<CtxState | null>(null);
  const [tree, setTree] = React.useState<TreeNode[]>(buildTree('/home/jordan'));
  const renameRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback((dir?: string) => {
    const d = dir || cwd;
    if (exists(d)) {
      setItems(listDir(d));
      setTree(buildTree('/home/jordan'));
    }
    setSelected(new Set());
    setLastClicked(null);
    setCtxMenu(null);
  }, [cwd]);

  const navigateTo = useCallback((absPath: string) => {
    if (exists(absPath) && isDirectory(absPath)) {
      setCWD(absPath);
      setLocalCwd(absPath);
      setItems(listDir(absPath));
      setSelected(new Set());
      setLastClicked(null);
      setCtxMenu(null);
      setSearch('');
    }
  }, []);

  const openFile = useCallback((name: string) => {
    const childPath = cwd.replace(/\/$/, '') + '/' + name;
    const node = getNode(childPath);
    if (!node) return;
    if (node.type === 'directory') {
      navigateTo(childPath);
    } else {
      window.dispatchEvent(new CustomEvent('5th-os:open-file', { detail: childPath }));
      launchApp('texteditor');
    }
  }, [cwd, navigateTo, launchApp]);

  const handleDelete = useCallback((names: string[]) => {
    let deleted = 0;
    for (const name of names) {
      const target = cwd.replace(/\/$/, '') + '/' + name;
      const node = getNode(target);
      if (!node) continue;
      if (node.type === 'directory') {
        if (deleteRecursive(target)) deleted++;
      } else {
        if (deleteNode(target)) deleted++;
      }
    }
    if (deleted > 0) refresh();
  }, [cwd, refresh]);

  const handleRename = useCallback((oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName.trim()) return;
    const oldPath = cwd.replace(/\/$/, '') + '/' + oldName;
    const newPath = cwd.replace(/\/$/, '') + '/' + newName.trim();
    const node = getNode(oldPath);
    if (!node || exists(newPath)) return;

    const content = node.content || '';
    deleteRecursive(oldPath); // remove old
    if (node.type === 'directory') {
      createDirectory(newPath);
    } else {
      writeFile(newPath, content);
    }
    refresh();
  }, [cwd, refresh]);

  const startRename = (name: string) => {
    setRenaming(name);
    setRenameValue(name);
    setTimeout(() => renameRef.current?.focus(), 50);
  };

  const commitRename = () => {
    if (renaming && renameValue.trim() && renaming !== renameValue.trim()) {
      handleRename(renaming, renameValue.trim());
    }
    setRenaming(null);
    setRenameValue('');
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if renaming or searching
      if (renaming) {
        if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
        if (e.key === 'Escape') { setRenaming(null); setRenameValue(''); }
        return;
      }
      if (document.activeElement?.tagName === 'INPUT') {
        if (e.key === 'Escape') (document.activeElement as HTMLInputElement).blur();
        return;
      }

      if (e.key === 'Delete' && selected.size > 0) {
        e.preventDefault();
        handleDelete(Array.from(selected));
      } else if (e.key === 'F2' && selected.size === 1) {
        e.preventDefault();
        startRename(Array.from(selected)[0]);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        const parent = cwd.split('/').slice(0, -1).join('/') || '/';
        if (exists(parent)) navigateTo(parent);
      } else if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setSelected(new Set(filtered.map(i => i.name)));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, handleDelete, renaming, renameValue, commitRename, startRename, cwd, navigateTo]);

  // Close context menu on outside click
  React.useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [ctxMenu]);

  // Filter + sort
  const filtered = search
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;
  const sorted = [...filtered].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  // Breadcrumb
  const breadParts = cwd.split('/').filter(Boolean);

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

  const handleItemClick = (name: string, e: React.MouseEvent) => {
    setCtxMenu(null);
    if (e.ctrlKey) {
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name); else next.add(name);
        return next;
      });
      setLastClicked(name);
    } else if (e.shiftKey && lastClicked) {
      const names = sorted.map(i => i.name);
      const a = names.indexOf(lastClicked);
      const b = names.indexOf(name);
      const [start, end] = a < b ? [a, b] : [b, a];
      setSelected(new Set(names.slice(start, end + 1)));
    } else {
      setSelected(new Set([name]));
      setLastClicked(name);
    }
  };

  const handleItemContext = (name: string, type: 'file' | 'directory', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, fileName: name, fileType: type });
    if (!selected.has(name)) {
      setSelected(new Set([name]));
      setLastClicked(name);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelected(new Set());
      setLastClicked(null);
      setCtxMenu(null);
    }
  };

  const handleContainerCtx = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelected(new Set());
    setLastClicked(null);
    setCtxMenu({ x: e.clientX, y: e.clientY, fileName: '', fileType: 'directory' });
  };

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div style={{ height: '100%', display: 'flex', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
      {/* === SIDEBAR === */}
      <div style={{ width: 200, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '8px 4px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Places */}
        <div className="label-nano" style={{ padding: '2px 8px 4px', color: '#666' }}>PLACES</div>
        {sidebarPlaces.map(s => {
          const active = cwd === s.path;
          return (
            <div key={s.path}
              onClick={() => navigateTo(s.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 8px', borderRadius: 'var(--r-control)',
                background: active ? 'rgba(239,33,55,0.12)' : 'transparent',
                color: active ? '#fff' : '#aaa', fontSize: 11, cursor: 'pointer',
                borderLeft: `2px solid ${active ? '#ef2137' : 'transparent'}`,
              }}>
              <Icon name={s.icon} size={12} style={{ color: active ? '#ef2137' : '#888', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
          );
        })}

        {/* File Tree */}
        <div className="label-nano" style={{ padding: '10px 8px 4px', color: '#666' }}>FILE SYSTEM</div>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {tree.map(node => (
            <FileTreeItem key={node.name} node={node} path="/home/jordan"
              activePath={cwd} onNavigate={navigateTo} />
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 4 }}>
          <div className="label-nano" style={{ padding: '2px 8px 4px', color: '#666' }}>ACTIONS</div>
          <div onClick={() => {
            const name = prompt('Folder name:');
            if (name?.trim()) {
              const newPath = cwd.replace(/\/$/, '') + '/' + name.trim();
              if (createDirectory(newPath)) refresh();
            }
          }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 'var(--r-control)', color: '#aaa', fontSize: 11, cursor: 'pointer' }}>
            <Icon name="FolderPlus" size={12} style={{ color: '#888' }} />
            New folder
          </div>
          <div onClick={() => {
            const name = prompt('File name:');
            if (name?.trim()) {
              const newPath = cwd.replace(/\/$/, '') + '/' + name.trim();
              if (writeFile(newPath, '')) refresh();
            }
          }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 'var(--r-control)', color: '#aaa', fontSize: 11, cursor: 'pointer' }}>
            <Icon name="FilePlus" size={12} style={{ color: '#888' }} />
            New file
          </div>
        </div>
      </div>

      {/* === MAIN === */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ height: 40, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button style={toolBtn} onClick={() => {
            const parent = cwd.split('/').slice(0, -1).join('/') || '/';
            if (exists(parent)) navigateTo(parent);
          }} title="Back">
            <Icon name="ChevronLeft" size={14} />
          </button>
          <button style={toolBtn} onClick={() => navigateTo(cwd)} title="Forward">
            <Icon name="ChevronRight" size={14} />
          </button>
          <button style={toolBtn} onClick={() => refresh()} title="Refresh">
            <Icon name="RefreshCw" size={14} />
          </button>

          {/* Breadcrumb */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 2,
            padding: '4px 10px', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--r-control)',
            fontFamily: 'var(--font-mono)', fontSize: 11, overflow: 'hidden',
          }}>
            <Icon name="Folder" size={12} style={{ color: '#ef2137', marginRight: 4 }} />
            {breadParts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: '#555' }}>/</span>}
                <span
                  onClick={() => {
                    const target = '/' + breadParts.slice(0, i + 1).join('/');
                    if (exists(target) && isDirectory(target)) navigateTo(target);
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
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filter..."
              style={{ width: 90, background: 'transparent', border: 'none', outline: 'none', color: '#e8e8e8', fontFamily: 'var(--font-sans)', fontSize: 11 }} />
            {search && (
              <span onClick={() => setSearch('')} style={{ cursor: 'pointer', display: 'flex' }}>
                <Icon name="X" size={10} style={{ color: '#666' }} />
              </span>
            )}
          </div>

          <button style={toolBtn} onClick={() => setView(view === 'list' ? 'grid' : 'list')} title="Toggle view">
            <Icon name={view === 'list' ? 'Grid3X3' : 'Menu'} size={14} />
          </button>

          {/* Selection actions */}
          {selected.size > 0 && (
            <button style={{ ...toolBtn, borderColor: 'rgba(239,33,55,0.3)', color: '#ef2137' }}
              onClick={() => handleDelete(Array.from(selected))} title="Delete selected">
              <Icon name="Trash2" size={13} />
            </button>
          )}
        </div>

        {/* Listing */}
        <div style={{ flex: 1, overflow: 'auto' }}
          onClick={handleContainerClick}
          onContextMenu={handleContainerCtx}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '24px 1fr 100px 140px',
            padding: '8px 12px', gap: 8,
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
            textTransform: 'uppercase' as const, color: '#555',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            position: 'sticky', top: 0, background: '#020408', zIndex: 2,
          }}>
            <span></span>
            <span>Name</span>
            <span>Size</span>
            <span>Modified</span>
          </div>

          {sorted.map(it => {
            const isSel = selected.has(it.name);
            const isRenaming = renaming === it.name;
            return (
              <div key={it.name}
                onClick={(e) => handleItemClick(it.name, e)}
                onDoubleClick={() => openFile(it.name)}
                onContextMenu={(e) => handleItemContext(it.name, it.type, e)}
                style={{
                  display: 'grid', gridTemplateColumns: '24px 1fr 100px 140px',
                  alignItems: 'center', gap: 8, padding: '5px 12px',
                  background: isSel ? 'rgba(239,33,55,0.10)' : 'transparent',
                  cursor: 'pointer', fontSize: 12, userSelect: 'none' as const,
                  borderLeft: `2px solid ${isSel ? '#ef2137' : 'transparent'}`,
                }}>
                {/* Check icon for selection */}
                <span style={{ display: 'flex', justifyContent: 'center' }}>
                  {isSel && <Icon name="Check" size={12} style={{ color: '#ef2137' }} />}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Icon name={getFileIcon(it.name, it.type)} size={14}
                    style={{ color: it.type === 'directory' ? '#ef2137' : '#888', flexShrink: 0 }} />
                  {isRenaming ? (
                    <input ref={renameRef} value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
                        if (e.key === 'Escape') { setRenaming(null); setRenameValue(''); }
                      }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        background: 'rgba(239,33,55,0.1)', border: '1px solid rgba(239,33,55,0.4)',
                        outline: 'none', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: 12,
                        padding: '1px 4px', borderRadius: 'var(--r-control)', width: '100%',
                      }} />
                  ) : (
                    <span style={{
                      color: isSel ? '#fff' : '#ddd',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{it.name}</span>
                  )}
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
        <div style={{
          height: 26, padding: '0 14px', display: 'flex', alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: 'var(--font-mono)',
          fontSize: 10, color: '#666', background: 'rgba(0,0,0,0.3)', flexShrink: 0,
        }}>
          <span>{sorted.length} item{sorted.length !== 1 ? 's' : ''}</span>
          {selected.size > 0 && (
            <span style={{ marginLeft: 12, color: '#ef2137' }}>
              · {selected.size} selected
            </span>
          )}
          <span style={{ flex: 1 }} />
          <span>{cwd.replace('/home/jordan', '~')}</span>
        </div>
      </div>

      {/* === CONTEXT MENU === */}
      {ctxMenu && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed', left: ctxMenu.x, top: ctxMenu.y, zIndex: 9000,
            background: 'rgba(8,10,16,0.97)', border: '1px solid rgba(239,33,55,0.2)',
            borderRadius: 0, padding: '4px 0', minWidth: 180,
            boxShadow: '0 12px 40px rgba(0,0,0,0.7), 0 0 20px rgba(239,33,55,0.08)',
            fontFamily: 'var(--font-sans)', fontSize: 12,
          }}>
          {ctxMenu.fileName ? (
            <>
              <CtxItem label="Open" icon="FileText" onClick={() => { openFile(ctxMenu.fileName); setCtxMenu(null); }} />
              <CtxItem label="Open in Terminal" icon="Terminal" onClick={() => {
                const target = cwd.replace(/\/$/, '') + '/' + ctxMenu.fileName;
                if (isDirectory(target)) { navigateTo(target); }
                setCtxMenu(null);
              }} />
              <CtxSep />
              <CtxItem label="Rename" icon="Pencil" kb="F2" onClick={() => { startRename(ctxMenu.fileName); setCtxMenu(null); }} />
              <CtxItem label="Delete" icon="Trash2" tone="danger" kb="Del" onClick={() => { handleDelete([ctxMenu.fileName]); setCtxMenu(null); }} />
              <CtxSep />
              <CtxItem label="Copy path" icon="Copy" onClick={() => {
                const target = cwd.replace(/\/$/, '') + '/' + ctxMenu.fileName;
                navigator.clipboard?.writeText(target);
                setCtxMenu(null);
              }} />
              <CtxItem label="Properties" icon="Info" onClick={() => setCtxMenu(null)} />
            </>
          ) : (
            <>
              <CtxItem label="New Folder" icon="FolderPlus" onClick={() => {
                setCtxMenu(null);
                const name = prompt('Folder name:');
                if (name?.trim()) {
                  const newPath = cwd.replace(/\/$/, '') + '/' + name.trim();
                  if (createDirectory(newPath)) refresh();
                }
              }} />
              <CtxItem label="New File" icon="FilePlus" onClick={() => {
                setCtxMenu(null);
                const name = prompt('File name:');
                if (name?.trim()) {
                  const newPath = cwd.replace(/\/$/, '') + '/' + name.trim();
                  if (writeFile(newPath, '')) refresh();
                }
              }} />
              <CtxSep />
              <CtxItem label="Paste" icon="Clipboard" onClick={() => setCtxMenu(null)} />
              <CtxItem label="Select All" icon="CheckSquare" kb="Ctrl+A" onClick={() => {
                setSelected(new Set(filtered.map(i => i.name)));
                setCtxMenu(null);
              }} />
              <CtxSep />
              <CtxItem label="Open in Terminal" icon="Terminal" onClick={() => {
                setCtxMenu(null);
                launchApp('terminal');
              }} />
              <CtxItem label="Properties" icon="Info" onClick={() => setCtxMenu(null)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ================================================================
// CONTEXT MENU COMPONENTS
// ================================================================

function CtxItem({ label, icon, kb, tone, onClick }: {
  label: string; icon?: string; kb?: string; tone?: 'danger'; onClick: () => void;
}) {
  return (
    <div onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 14px', cursor: 'pointer',
        color: tone === 'danger' ? '#f87171' : '#ddd',
        background: 'transparent',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = tone === 'danger' ? 'rgba(239,33,55,0.15)' : 'rgba(255,255,255,0.04)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {icon && <Icon name={icon} size={13} style={{ color: tone === 'danger' ? '#f87171' : '#888' }} />}
      <span style={{ flex: 1 }}>{label}</span>
      {kb && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#555' }}>{kb}</span>}
    </div>
  );
}

function CtxSep() {
  return <div style={{ height: 1, margin: '4px 8px', background: 'rgba(255,255,255,0.06)' }} />;
}

import { registerApp } from '../../system/appRegistry';
registerApp('files', () => import('./FilesApp.tsx').then(m => ({ default: m.FilesApp })));
