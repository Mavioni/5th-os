import React from 'react';
import { Cpu, HardDrive, Wifi } from 'lucide-react';

/**
 * Placeholder apps for unimplemented app IDs.
 * Each provides a functional stub instead of "not yet ported."
 */

// ================================================================
// CALCULATOR
// ================================================================

export function CalculatorApp() {
  const [display, setDisplay] = React.useState('0');
  const [memory, setMemory] = React.useState<number | null>(null);
  const [operator, setOperator] = React.useState<string | null>(null);
  const [fresh, setFresh] = React.useState(true);

  const press = (key: string) => {
    if (key >= '0' && key <= '9' || key === '.') {
      if (fresh) { setDisplay(key); setFresh(false); }
      else setDisplay(d => d === '0' && key !== '.' ? key : d + key);
    } else if (key === 'C') {
      setDisplay('0'); setMemory(null); setOperator(null); setFresh(true);
    } else if (key === '±') {
      setDisplay(d => d.startsWith('-') ? d.slice(1) : '-' + d);
    } else if (key === '%') {
      setDisplay(d => String(parseFloat(d) / 100));
    } else if (['+', '-', '×', '÷'].includes(key)) {
      setMemory(parseFloat(display));
      setOperator(key);
      setFresh(true);
    } else if (key === '=') {
      if (memory != null && operator) {
        const b = parseFloat(display);
        let result = memory;
        if (operator === '+') result += b;
        else if (operator === '-') result -= b;
        else if (operator === '×') result *= b;
        else if (operator === '÷') result = b !== 0 ? result / b : NaN;
        setDisplay(isFinite(result) ? String(result) : 'Error');
        setMemory(null); setOperator(null); setFresh(true);
      }
    }
  };

  const keys = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#020408', fontFamily: 'var(--font-mono)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '16px 20px', fontSize: 36, color: '#fff', fontWeight: 300, letterSpacing: '-0.01em' }}>
        {display}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, padding: 1 }}>
        {keys.flat().map((k) => (
          <button key={k} onClick={() => press(k)}
            style={{
              padding: '16px 0', fontSize: 16, border: 'none', outline: 'none', cursor: 'pointer',
              background: ['÷', '×', '-', '+', '='].includes(k) ? 'rgba(239,33,55,0.15)' : 'rgba(255,255,255,0.03)',
              color: ['÷', '×', '-', '+', '='].includes(k) ? '#ef2137' : '#e8e8e8',
              fontFamily: 'var(--font-mono)', fontWeight: 500,
              gridColumn: k === '=' ? 'span 1' : undefined,
            }}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// SYSTEM MONITOR
// ================================================================

export function SystemMonitorApp() {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 2000); return () => clearInterval(i); }, []);

  const cpu = 12 + Math.sin(tick / 5) * 8;
  const ram = 38 + Math.sin(tick / 7) * 6;
  const disk = 34;
  const netDown = (2.4 + Math.random() * 3).toFixed(1);
  const netUp = (0.8 + Math.random() * 1.5).toFixed(1);

  return (
    <div style={{ height: '100%', background: '#020408', color: '#e8e8e8', padding: 20, fontFamily: 'var(--font-sans)', overflow: 'auto' }}>
      <div className="label-mono" style={{ marginBottom: 20 }}>SYSTEM MONITOR</div>

      <Metric icon={Cpu} label="CPU" value={`${cpu.toFixed(1)}%`} bar={cpu} color="#ef2137" />
      <Metric icon={Cpu} label="RAM" value={`${ram.toFixed(1)}%`} bar={ram} sub="64 GB DDR5" color="#22dcff" />
      <Metric icon={HardDrive} label="Disk" value={`${disk}%`} bar={disk} sub="312 GB / 476 GB free" color="#f59e0b" />
      <Metric icon={Wifi} label="Network ↓" value={`${netDown} MB/s`} bar={0} color="#10b981" />
      <Metric icon={Wifi} label="Network ↑" value={`${netUp} MB/s`} bar={0} color="#10b981" />

      <div className="label-mono" style={{ marginTop: 24, marginBottom: 12 }}>PROCESSES</div>
      {[
        ['chromium', '842 MB', '12%'],
        ['lelu-agentd', '124 MB', '3%'],
        ['Xorg', '186 MB', '5%'],
        ['pulseaudio', '22 MB', '0.5%'],
        ['systemd', '18 MB', '0.2%'],
      ].map(([name, mem, cpu]) => (
        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
          <span style={{ color: '#ccc', fontFamily: 'var(--font-mono)' }}>{name}</span>
          <span style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{mem} · {cpu}</span>
        </div>
      ))}
    </div>
  );
}

function Metric({ icon: Icon, label, value, bar, sub, color }: { icon: React.ComponentType<{size?: number; style?: React.CSSProperties}>; label: string; value: string; bar: number; sub?: string; color: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} style={{ color }} />
          <span style={{ fontSize: 12, color: '#ccc' }}>{label}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color }}>{value}</span>
      </div>
      {bar > 0 && <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}><div style={{ width: `${bar}%`, height: '100%', background: color, boxShadow: `0 0 5px ${color}` }} /></div>}
      {sub && <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ================================================================
// IMAGE VIEWER
// ================================================================

export function ImageViewerApp() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020408', color: '#666', fontFamily: 'var(--font-mono)', fontSize: 12, flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 120, height: 120, borderRadius: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 40, opacity: 0.3 }}>🖼</span>
      </div>
      <span>No image selected. Drag an image here or use File → Open.</span>
    </div>
  );
}

// ================================================================
// SOFTWARE MANAGER
// ================================================================

export function SoftwareManagerApp() {
  const [filter, setFilter] = React.useState('');
  const packages = [
    { name: 'chromium', desc: 'Web browser', installed: true, version: '132.0' },
    { name: 'firefox', desc: 'Mozilla Firefox browser', installed: true, version: '132.0' },
    { name: 'libreoffice-writer', desc: 'Word processor', installed: true, version: '24.8' },
    { name: 'libreoffice-calc', desc: 'Spreadsheet', installed: false, version: '24.8' },
    { name: 'gimp', desc: 'Image editor', installed: false, version: '2.10' },
    { name: 'blender', desc: '3D creation suite', installed: true, version: '4.2' },
    { name: 'vlc', desc: 'Media player', installed: true, version: '3.0' },
    { name: 'git', desc: 'Version control', installed: true, version: '2.48' },
    { name: 'docker-ce', desc: 'Container runtime', installed: true, version: '29.6' },
    { name: 'neovim', desc: 'Text editor', installed: true, version: '0.10' },
    { name: 'nodejs', desc: 'JavaScript runtime', installed: true, version: '22.23' },
    { name: 'python3', desc: 'Python interpreter', installed: true, version: '3.12' },
    { name: 'rustc', desc: 'Rust compiler', installed: false, version: '1.85' },
    { name: 'lelu-agentd', desc: 'Lelu AI agent daemon', installed: true, version: '1.0.2' },
    { name: 'nemo-claw', desc: 'Sandbox runtime', installed: true, version: '2.4.1' },
  ];

  const filtered = filter ? packages.filter(p => p.name.includes(filter.toLowerCase())) : packages;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search packages..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--r-control)', padding: '5px 10px', color: '#e8e8e8', fontFamily: 'var(--font-sans)', fontSize: 12, outline: 'none' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#666' }}>{filtered.length} packages</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {filtered.map(p => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
            <div>
              <div style={{ color: '#ccc', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.name}</div>
              <div style={{ color: '#666', fontSize: 11, marginTop: 1 }}>{p.desc}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#555' }}>v{p.version}</span>
              {p.installed ? (
                <span style={{ padding: '2px 8px', borderRadius: 'var(--r-control)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: 10 }}>INSTALLED</span>
              ) : (
                <button style={{ padding: '3px 10px', borderRadius: 'var(--r-control)', background: 'rgba(239,33,55,0.1)', border: '1px solid rgba(239,33,55,0.2)', color: '#ef2137', fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer' }}>INSTALL</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// FIREWALL
// ================================================================

export function FirewallApp() {
  return (
    <div style={{ height: '100%', background: '#020408', color: '#e8e8e8', padding: 20, fontFamily: 'var(--font-sans)' }}>
      <div className="label-mono" style={{ marginBottom: 16 }}>FIREWALL CONFIGURATION</div>
      <div style={{ padding: 14, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 0, marginBottom: 16, fontSize: 12 }}>
        <span style={{ color: '#10b981' }}>●</span> Firewall is active — 47 rules loaded
      </div>
      {[
        ['SSH (22)', 'ALLOW', '192.168.1.0/24'],
        ['HTTP (80)', 'ALLOW', 'any'],
        ['HTTPS (443)', 'ALLOW', 'any'],
        ['Lelu Agent (9090)', 'ALLOW', '127.0.0.1'],
        ['Nemo Claw (9091)', 'ALLOW', '127.0.0.1'],
        ['MySQL (3306)', 'DENY', 'any'],
        ['RDP (3389)', 'DENY', 'any'],
      ].map(([svc, action, from]) => (
        <div key={svc} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#ccc' }}>{svc}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: action === 'ALLOW' ? '#10b981' : '#ef2137' }}>{action}</span>
          <span style={{ color: '#666', fontSize: 11 }}>{from}</span>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// GENERIC PLACEHOLDER — shows a useful stub instead of dead text
// ================================================================

export function GenericStub({ appId, title, icon }: { appId: string; title: string; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center', color: '#888', fontFamily: 'var(--font-sans)', fontSize: 13, flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 40, opacity: 0.3 }}>{icon}</div>
      <div style={{ color: '#ccc', fontWeight: 600 }}>{title}</div>
      <div style={{ color: '#666', fontSize: 11, maxWidth: 280, lineHeight: 1.6 }}>
        This application is scheduled for porting in a future 5th OS release. The component architecture is in place — implementation pending.
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#555' }}>
        App ID: {appId}
      </div>
    </div>
  );
}
