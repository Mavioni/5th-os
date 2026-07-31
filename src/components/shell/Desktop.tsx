import React from 'react';
import Icon from '../ui/Icon';
import { useOSStore } from '../../system/osStore';
import { agentRuntime } from '../../system/agentRuntime';

// ================================================================
// AGENT SWARM WALLPAPER — living canvas showing agent neural activity
// ================================================================

interface AgentDot {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: string;
  status: string;
}

interface PulseRing {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  agentId: string;
}

function AgentWallpaper() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animRef = React.useRef<number>(0);
  const agentsRef = React.useRef<AgentDot[]>([]);
  const pulsesRef = React.useRef<PulseRing[]>([]);

  // Canvas animation loop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Get live agents
      const liveAgents = agentRuntime.list().filter(a => a.status !== 'killed');

      // Seed or sync agent dots
      const existingIds = new Set(agentsRef.current.map(a => a.id));
      const currentIds = new Set(liveAgents.map(a => a.id));

      // Remove dead agents
      agentsRef.current = agentsRef.current.filter(a => currentIds.has(a.id));

      // Add new agents
      for (const agent of liveAgents) {
        if (!existingIds.has(agent.id)) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 100 + Math.random() * Math.min(w, h) * 0.35;
          agentsRef.current.push({
            id: agent.id,
            x: w * 0.5 + Math.cos(angle) * dist,
            y: h * 0.4 + Math.sin(angle) * dist * 0.6,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: 2 + Math.random() * 2,
            type: agent.type,
            status: agent.status,
          });
          pulsesRef.current.push({
            x: w * 0.5, y: h * 0.4, radius: 0, opacity: 1, agentId: agent.id,
          });
        }
      }

      // Generate pulse rings for running agents
      if (frame % 60 === 0) {
        for (const agent of liveAgents) {
          if (agent.status === 'running') {
            const dot = agentsRef.current.find(d => d.id === agent.id);
            if (dot) {
              pulsesRef.current.push({
                x: dot.x, y: dot.y, radius: 0, opacity: 0.6, agentId: agent.id,
              });
            }
          }
        }
      }

      // Update dots
      for (const dot of agentsRef.current) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 30) { dot.x = 30; dot.vx *= -1; }
        if (dot.x > w - 30) { dot.x = w - 30; dot.vx *= -1; }
        if (dot.y < 40) { dot.y = 40; dot.vy *= -1; }
        if (dot.y > h - 60) { dot.y = h - 60; dot.vy *= -1; }
        dot.vx += (Math.random() - 0.5) * 0.05;
        dot.vy += (Math.random() - 0.5) * 0.05;
        dot.vx *= 0.995;
        dot.vy *= 0.995;
      }

      // Update pulse rings
      pulsesRef.current = pulsesRef.current.filter(p => p.opacity > 0.01);
      for (const pulse of pulsesRef.current) {
        pulse.radius += 0.8;
        pulse.opacity -= 0.008;
      }

      // Draw comms lines between agents
      for (let i = 0; i < agentsRef.current.length; i++) {
        for (let j = i + 1; j < agentsRef.current.length; j++) {
          const a = agentsRef.current[i];
          const b = agentsRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            const alpha = (1 - dist / 250) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(239, 33, 55, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw pulse rings
      for (const pulse of pulsesRef.current) {
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 33, 55, ${pulse.opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw agent dots
      for (const dot of agentsRef.current) {
        const agent = liveAgents.find(a => a.id === dot.id);
        const running = agent?.status === 'running';
        const color = dot.type === 'researcher' ? '#22dcff'
          : dot.type === 'coder' ? '#ef2137'
          : dot.type === 'planner' ? '#f59e0b'
          : dot.type === 'reviewer' ? '#a855f7'
          : '#10b981';

        // Outer glow (running agents)
        if (running) {
          const glowGrad = ctx.createRadialGradient(dot.x, dot.y, dot.size, dot.x, dot.y, dot.size * 6);
          glowGrad.addColorStop(0, `${color}40`);
          glowGrad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size * 6, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Pulse animation for running agents
        if (running && frame % 20 < 10) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `${color}20`;
          ctx.fill();
        }
      }

      // Central Lelu core
      const coreX = w * 0.5;
      const coreY = h * 0.5;
      const corePulse = Math.sin(frame * 0.02) * 0.5 + 0.5;
      const coreGrad = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, 30 + corePulse * 10);
      coreGrad.addColorStop(0, `rgba(239, 33, 55, ${0.08 + corePulse * 0.04})`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(coreX, coreY, 30 + corePulse * 10, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Grid
      ctx.strokeStyle = 'rgba(239, 33, 55, 0.025)';
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = gridSize; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = gridSize; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      background: '#020408', opacity: 0.85,
    }} />
  );
}

// ================================================================
// AGENT ACTIVITY FEED
// ================================================================

function AgentActivityFeed() {
  const tasks = useOSStore(s => s.tasks);
  const runningAgents = React.useMemo(() => tasks.filter(t => t.status === 'running'), [tasks]);
  const [visible, setVisible] = React.useState(true);

  if (runningAgents.length === 0 || !visible) return null;

  return (
    <div style={{
      position: 'absolute', bottom: 60, left: 12, zIndex: 20, maxWidth: 320,
      background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(239,33,55,0.15)', borderRadius: 0, padding: '8px 12px',
      fontFamily: 'var(--font-mono)', fontSize: 9,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: '#ef2137', letterSpacing: '0.1em' }}>
          ● NEURAL ACTIVITY ({runningAgents.length})
        </span>
        <span onClick={() => setVisible(false)} style={{ color: '#555', cursor: 'pointer', fontSize: 11 }}>×</span>
      </div>
      {runningAgents.slice(0, 3).map(agent => (
        <div key={agent.id} style={{
          padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ color: '#666' }}>▸</span>
          <span style={{ color: '#ccc' }}>{agent.label}</span>
          <span style={{ color: '#ef2137', marginLeft: 'auto' }}>RUNNING</span>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// AGENT STATUS BAR
// ================================================================

function AgentStatusBar() {
  const tasks = useOSStore(s => s.tasks);
  const running = tasks.filter(t => t.status === 'running').length;
  const total = tasks.length;

  return (
    <div style={{
      position: 'absolute', bottom: 60, right: 20, zIndex: 20,
      display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#555',
    }}>
      <span>AGENTS: <span style={{ color: running > 0 ? '#ef2137' : '#666' }}>{total}</span></span>
      <span>RUNNING: <span style={{ color: running > 0 ? '#ef2137' : '#666' }}>{running}</span></span>
      <span>KERNEL: <span style={{ color: '#10b981' }}>6.8.0-lelu</span></span>
    </div>
  );
}

// ================================================================
// DESKTOP ICON
// ================================================================

interface DesktopIconData {
  icon: string; label: string; x: number; y: number; appId?: string;
}

function DesktopIcon({ icon, label, x, y, selected, onDouble, onContext, onDragStart }: {
  icon: string; label: string; x: number; y: number;
  selected: boolean; onDouble: () => void;
  onContext: (e: React.MouseEvent) => void;
  onDragStart: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  return (
    <div
      onMouseDown={(e) => {
        if (e.button === 0) { onDragStart(); setDragging(true);
          const onUp = () => { setDragging(false); window.removeEventListener('mouseup', onUp); };
          window.addEventListener('mouseup', onUp); }
      }}
      onDoubleClick={onDouble} onContextMenu={onContext}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute', left: x, top: y, width: 84, padding: '8px 4px',
        borderRadius: 'var(--r-control)',
        background: selected ? 'rgba(239,33,55,0.15)' : hover ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: `1px solid ${selected ? 'rgba(239,33,55,0.4)' : 'transparent'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        cursor: dragging ? 'grabbing' : 'pointer', userSelect: 'none' as const,
        opacity: dragging ? 0.7 : 1, zIndex: dragging ? 10 : 1,
      }}>
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--r-control)',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c8c8c8',
        boxShadow: selected ? '0 0 16px rgba(239,33,55,0.4)' : 'none',
      }}>
        <Icon name={icon} size={22} />
      </div>
      <span style={{
        fontSize: 11, color: '#e8e8e8', textAlign: 'center', lineHeight: 1.2,
        textShadow: '0 1px 2px rgba(0,0,0,0.8)', wordBreak: 'break-word',
      }}>{label}</span>
    </div>
  );
}

// ================================================================
// LASSO
// ================================================================

interface LassoState { startX: number; startY: number; currentX: number; currentY: number; }

// ================================================================
// DESKTOP
// ================================================================

const DEFAULT_ICONS: DesktopIconData[] = [
  { icon: 'Home', label: 'Home', x: 20, y: 20, appId: 'files' },
  { icon: 'Cpu', label: 'Agent Swarm', x: 20, y: 120, appId: 'swarm' },
  { icon: 'Folder', label: 'revenant-kernel', x: 20, y: 220, appId: 'files' },
  { icon: 'Trash2', label: 'Trash', x: 20, y: 320, appId: 'files' },
  { icon: 'HardDrive', label: 'Data \u00b7 476 GB', x: 20, y: 420 },
  { icon: 'FileText', label: 'release-plan.md', x: 20, y: 520, appId: 'texteditor' },
];

export const Desktop = React.memo(function Desktop() {
  const launchApp = useOSStore((s) => s.launchApp);
  const setCtxMenu = useOSStore((s) => s.setCtxMenu);
  const [icons, setIcons] = React.useState<DesktopIconData[]>(() => {
    try { const saved = localStorage.getItem('5th-os:icon-positions'); if (saved) return JSON.parse(saved); } catch {}
    return DEFAULT_ICONS;
  });
  const [selectedIcons, setSelectedIcons] = React.useState<Set<string>>(new Set());
  const [lasso, setLasso] = React.useState<LassoState | null>(null);
  const [draggingIcon, setDraggingIcon] = React.useState<string | null>(null);

  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY,
      items: [
        { id: 'new-folder', label: 'New folder', icon: 'Folder' },
        { id: 'new-file', label: 'New document', icon: 'FileText' },
        '---',
        { id: 'spawn-agent', label: 'Spawn agent here', icon: 'Cpu' },
        '---',
        { id: 'paste', label: 'Paste' }, { id: 'select-all', label: 'Select all', kb: '\u2318A' },
        '---',
        { id: 'wallpaper', label: 'Change wallpaper\u2026', icon: 'Image' },
        { id: 'arrange', label: 'Arrange icons' },
        '---',
        { id: 'terminal', label: 'Open terminal here', icon: 'Terminal', kb: '\u2318T' },
        { id: 'settings', label: 'Desktop settings', icon: 'Settings' },
      ],
    });
  };

  const handleIconDouble = (icon: DesktopIconData) => {
    if (icon.appId) { launchApp(icon.appId); setSelectedIcons(new Set()); }
    else { launchApp('files'); setSelectedIcons(new Set()); }
  };

  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-desktop-icon]')) return;
    setSelectedIcons(new Set());
    setLasso({ startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY });
    const onMove = (ev: MouseEvent) => setLasso(prev => prev ? { ...prev, currentX: ev.clientX, currentY: ev.clientY } : null);
    const onUp = () => {
      setLasso(prev => {
        if (prev) {
          const left = Math.min(prev.startX, prev.currentX);
          const right = Math.max(prev.startX, prev.currentX);
          const top = Math.min(prev.startY, prev.currentY);
          const bottom = Math.max(prev.startY, prev.currentY);
          const newSelected = new Set<string>();
          icons.forEach(icon => {
            if (icon.x < right && icon.x + 84 > left && icon.y < bottom && icon.y + 90 > top) newSelected.add(icon.label);
          });
          setSelectedIcons(newSelected);
        }
        return null;
      });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleIconDragStart = (label: string) => setDraggingIcon(label);

  React.useEffect(() => {
    if (!draggingIcon) return;
    const onMove = (e: MouseEvent) => {
      setIcons(prev => prev.map(i => i.label === draggingIcon ? { ...i, x: Math.max(0, i.x + e.movementX), y: Math.max(0, i.y + e.movementY) } : i));
    };
    const onUp = () => {
      setDraggingIcon(null);
      setIcons(prev => { localStorage.setItem('5th-os:icon-positions', JSON.stringify(prev)); return prev; });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [draggingIcon]);

  const lassoStyle: React.CSSProperties | undefined = lasso ? {
    position: 'fixed', left: Math.min(lasso.startX, lasso.currentX), top: Math.min(lasso.startY, lasso.currentY),
    width: Math.abs(lasso.currentX - lasso.startX), height: Math.abs(lasso.currentY - lasso.startY),
    background: 'rgba(239,33,55,0.08)', border: '1px solid rgba(239,33,55,0.3)', pointerEvents: 'none', zIndex: 9999,
  } : undefined;

  return (
    <>
      {lassoStyle && <div style={lassoStyle} />}
      <div style={{ position: 'absolute', inset: 0 }}
        onContextMenu={openContextMenu} onMouseDown={handleDesktopMouseDown}>
        <AgentWallpaper />
        <div className="crt-scanlines" />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
        <div style={{ position: 'absolute', right: 40, bottom: 80, fontFamily: 'var(--font-mono)', fontSize: 140,
          fontWeight: 900, letterSpacing: '-0.04em', color: 'rgba(239,33,55,0.02)', pointerEvents: 'none',
          lineHeight: 0.9, textAlign: 'right' }}>
          REVENANT<br />
          <span style={{ fontSize: 50, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.015)' }}>OS · LELU ONLINE</span>
        </div>
        <div style={{ position: 'absolute', inset: 0 }}>
          {icons.map((d) => (
            <div key={d.label} data-desktop-icon>
              <DesktopIcon icon={d.icon} label={d.label} x={d.x} y={d.y}
                selected={selectedIcons.has(d.label) || draggingIcon === d.label}
                onDouble={() => handleIconDouble(d)}
                onContext={(e) => { e.stopPropagation(); setSelectedIcons(new Set([d.label])); openContextMenu(e); }}
                onDragStart={() => handleIconDragStart(d.label)} />
            </div>
          ))}
        </div>
        <AgentActivityFeed />
        <AgentStatusBar />
      </div>
    </>
  );
});
