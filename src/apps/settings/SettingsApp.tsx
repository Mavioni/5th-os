import React from 'react';
import Icon from '../../components/ui/Icon';
import { useOSStore } from '../../system/osStore';
import { loadSettings, saveSettings, getDefaultSettings, loadDecryptedApiKey, chat, type AISettings, type ChatMessage } from '../../ai/hermesClient';

// ================================================================
// SHARED COMPONENTS
// ================================================================

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#e8e8e8', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ minWidth: 260 }}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--r-control)',
  padding: '6px 10px',
  color: '#e8e8e8',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  outline: 'none',
  width: 260,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  width: 260,
  cursor: 'pointer',
};

const btnStyle: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 'var(--r-control)',
  background: 'rgba(239,33,55,0.1)', border: '1px solid rgba(239,33,55,0.25)',
  color: '#ef2137', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 11,
};

const btnSec: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 'var(--r-control)',
  background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
  color: '#888', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 11,
};

// ================================================================
// SECTION: AI CONFIGURATION
// ================================================================

function AISettingsPanel() {
  const [settings, setSettings] = React.useState<AISettings>(loadSettings);
  const [apiKey, setApiKey] = React.useState('');
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [testError, setTestError] = React.useState('');

  React.useEffect(() => { loadDecryptedApiKey().then(k => setApiKey(k)); }, []);

  const update = async (patch: Partial<AISettings>) => {
    if (patch.apiKey !== undefined) setApiKey(patch.apiKey);
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveSettings(next);
    setTestResult('idle');
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult('idle');
    try {
      const msgs: ChatMessage[] = [{ role: 'user', content: 'Say "multi-pass" and nothing else.' }];
      const response = await chat(msgs, settings);
      setTestResult(response.toLowerCase().includes('multi-pass') || response.length > 0 ? 'success' : 'error');
    } catch (err) {
      setTestResult('error');
      setTestError(err instanceof Error ? err.message : 'Connection failed');
    }
    setTesting(false);
  };

  const providerModels: Record<string, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o3-mini', 'o4-mini'],
    openrouter: ['openai/gpt-4o', 'anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'meta-llama/llama-4-maverick', 'deepseek/deepseek-chat'],
    anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    custom: [],
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{
        padding: '12px 14px', marginBottom: 20,
        background: settings.apiKey ? (testResult === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(34,220,255,0.05)') : 'rgba(239,33,55,0.08)',
        border: `1px solid ${settings.apiKey ? (testResult === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(34,220,255,0.15)') : 'rgba(239,33,55,0.25)'}`,
        borderRadius: 0, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: settings.apiKey ? (testResult === 'success' ? '#10b981' : '#22dcff') : '#ef2137',
          boxShadow: settings.apiKey ? (testResult === 'success' ? '0 0 10px #10b981' : '0 0 8px #22dcff') : '0 0 10px #ef2137',
        }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
            {settings.apiKey ? (testResult === 'success' ? 'AI Connected — Lelu is live' : 'API key configured — test to verify') : 'Mock mode — Lelu uses local responses'}
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
            {settings.apiKey ? `${settings.provider} · ${settings.model}` : 'Set an API key to enable real AI responses'}
          </div>
        </div>
        {settings.apiKey && (
          <button onClick={testConnection} disabled={testing} style={{
            padding: '6px 14px', fontSize: 11, fontFamily: 'var(--font-mono)',
            background: testResult === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(34,220,255,0.1)',
            border: `1px solid ${testResult === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(34,220,255,0.2)'}`,
            borderRadius: 'var(--r-control)', color: testResult === 'success' ? '#10b981' : '#22dcff',
            cursor: 'pointer', letterSpacing: '0.05em',
          }}>{testing ? 'TESTING...' : testResult === 'success' ? '\u2713 CONNECTED' : 'TEST CONNECTION'}</button>
        )}
      </div>

      {testResult === 'error' && (
        <div style={{ padding: '10px 14px', marginBottom: 16, background: 'rgba(239,33,55,0.08)', border: '1px solid rgba(239,33,55,0.2)', borderRadius: 0, fontSize: 11, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
          Connection failed: {testError}
        </div>
      )}

      <Row label="Provider">
        <select value={settings.provider} onChange={(e) => update({ provider: e.target.value as AISettings['provider'], model: providerModels[e.target.value]?.[0] || '' })} style={selectStyle}>
          <option value="openai">OpenAI</option>
          <option value="openrouter">OpenRouter</option>
          <option value="anthropic">Anthropic</option>
          <option value="custom">Custom (OpenAI-compatible)</option>
        </select>
      </Row>

      <Row label="API Key" sub="Stored in your browser. Never sent to any server but the AI provider.">
        <input type="password" value={apiKey} onChange={(e) => update({ apiKey: e.target.value })} placeholder={settings.provider === 'openai' ? 'sk-...' : '...'} style={inputStyle}/>
      </Row>

      <Row label="Model">
        {providerModels[settings.provider]?.length ? (
          <select value={settings.model} onChange={(e) => update({ model: e.target.value })} style={selectStyle}>
            {providerModels[settings.provider].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        ) : (
          <input value={settings.model} onChange={(e) => update({ model: e.target.value })} placeholder="Model name" style={inputStyle}/>
        )}
      </Row>

      {settings.provider === 'custom' && (
        <Row label="Base URL" sub="OpenAI-compatible API endpoint">
          <input value={settings.baseUrl || ''} onChange={(e) => update({ baseUrl: e.target.value })} placeholder="https://api.openai.com/v1" style={inputStyle}/>
        </Row>
      )}

      <Row label="System Prompt" sub="Defines Lelu's personality and behavior">
        <textarea value={settings.systemPrompt} onChange={(e) => update({ systemPrompt: e.target.value })} rows={4}
          style={{ ...inputStyle, width: '100%', height: 80, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 10 }}/>
      </Row>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={async () => { const def = getDefaultSettings(); setSettings(def); setApiKey(''); await saveSettings(def); setTestResult('idle'); }} style={btnStyle}>Reset to defaults</button>
        <button onClick={async () => { localStorage.removeItem('lelu-ai-settings'); localStorage.removeItem('lelu-ai-keyhash'); const def = getDefaultSettings(); setSettings(def); setApiKey(''); await saveSettings(def); setTestResult('idle'); }} style={btnSec}>Clear API key</button>
      </div>
    </div>
  );
}

// ================================================================
// SECTION: APPEARANCE
// ================================================================

function AppearancePanel() {
  const [accent, setAccent] = React.useState('#ef2137');
  const [crt, setCrt] = React.useState(true);
  const accents = ['#ef2137', '#22dcff', '#10b981', '#f59e0b', '#a855f7', '#ec4899', '#ffffff'];

  return (
    <div style={{ marginTop: 12 }}>
      <Row label="Accent Color" sub="Defines the system highlight color">
        <div style={{ display: 'flex', gap: 8 }}>
          {accents.map(c => (
            <div key={c} onClick={() => setAccent(c)} style={{
              width: 28, height: 28, borderRadius: 'var(--r-control)',
              background: c, cursor: 'pointer',
              border: accent === c ? '2px solid #fff' : '2px solid transparent',
              boxShadow: accent === c ? `0 0 12px ${c}88` : 'none',
            }}/>
          ))}
        </div>
      </Row>

      <Row label="CRT Scanlines" sub="Phosphor grid overlay on desktop">
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={crt} onChange={e => setCrt(e.target.checked)}
            style={{ accentColor: '#ef2137' }}/>
          <span style={{ fontSize: 12, color: '#aaa' }}>Enabled</span>
        </label>
      </Row>

      <Row label="Wallpaper" sub="Desktop background image">
        <div style={{ display: 'flex', gap: 8 }}>
          {['#020408', '#0a0a0f', '#050510', '#0d0606'].map(c => (
            <div key={c} style={{ width: 40, height: 28, background: c, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r-control)', cursor: 'pointer' }}/>
          ))}
        </div>
      </Row>

      <Row label="Icon Size">
        <select style={selectStyle}>
          <option>Small</option>
          <option selected>Medium</option>
          <option>Large</option>
        </select>
      </Row>

      <Row label="Font">
        <select style={selectStyle}>
          <option>System Default (Inter)</option>
          <option>JetBrains Mono</option>
        </select>
      </Row>
    </div>
  );
}

// ================================================================
// SECTION: NOTIFICATIONS
// ================================================================

function NotificationsPanel() {
  const notifications = useOSStore(s => s.notifications);
  const [dnd, setDnd] = React.useState(false);

  return (
    <div style={{ marginTop: 12 }}>
      <Row label="Do Not Disturb">
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={dnd} onChange={e => setDnd(e.target.checked)} style={{ accentColor: '#ef2137' }}/>
          <span style={{ fontSize: 12, color: '#aaa' }}>{dnd ? 'Silenced' : 'Active'}</span>
        </label>
      </Row>

      <Row label="Notification History" sub={`${notifications.length} notifications in queue`}>
        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {notifications.slice(0, 5).map(n => (
            <div key={n.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 11,
            }}>
              <Icon name={n.icon} size={12} style={{ color: n.tone === 'error' ? '#f87171' : n.tone === 'warning' ? '#f59e0b' : '#10b981', marginTop: 1 }}/>
              <div>
                <div style={{ color: '#ddd' }}>{n.title}</div>
                <div style={{ color: '#666', marginTop: 1 }}>{n.body?.slice(0, 80)}{(n.body?.length || 0) > 80 ? '...' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </Row>
    </div>
  );
}

// ================================================================
// SECTION: KEYBOARD
// ================================================================

function KeyboardPanel() {
  const shortcuts = [
    { keys: 'Alt + Tab', action: 'Switch windows' },
    { keys: 'F2 / Alt+F2', action: 'Run dialog' },
    { keys: 'Cmd + Shift + E', action: 'Workspace Expo' },
    { keys: 'Cmd + L', action: 'Lock screen' },
    { keys: 'Escape', action: 'Close all popups' },
  ];

  return (
    <div style={{ marginTop: 12 }}>
      <Row label="Keyboard Shortcuts" sub="Global system shortcuts">
        <div style={{ width: '100%' }}>
          {shortcuts.map(s => (
            <div key={s.keys} style={{
              display: 'flex', justifyContent: 'space-between', padding: '5px 0',
              borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 11,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#ef2137' }}>{s.keys}</span>
              <span style={{ color: '#aaa' }}>{s.action}</span>
            </div>
          ))}
        </div>
      </Row>
    </div>
  );
}

// ================================================================
// SECTION: SOUND
// ================================================================

function SoundPanel() {
  const { volume, setVolume } = useOSStore();

  return (
    <div style={{ marginTop: 12 }}>
      <Row label="Output Volume" sub={`${volume}%`}>
        <input type="range" min={0} max={100} value={volume}
          onChange={e => setVolume(parseInt(e.target.value))}
          style={{ width: 260, accentColor: '#ef2137' }}/>
      </Row>
      <Row label="Output Device">
        <select style={selectStyle}>
          <option>Speakers (Realtek Audio)</option>
          <option>Headphones (Bluetooth)</option>
        </select>
      </Row>
      <Row label="System Sounds">
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked style={{ accentColor: '#ef2137' }}/>
          <span style={{ fontSize: 12, color: '#aaa' }}>Play alert sounds</span>
        </label>
      </Row>
    </div>
  );
}

// ================================================================
// SECTION: NETWORK
// ================================================================

function NetworkPanel() {
  return (
    <div style={{ marginTop: 12 }}>
      <Row label="Connection" sub="Wi-Fi · Connected">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}/>
          <span style={{ fontSize: 12, color: '#10b981' }}>Connected</span>
        </div>
      </Row>
      <Row label="Network Name">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ddd' }}>NemoNet-5G</span>
      </Row>
      <Row label="IP Address">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#888' }}>192.168.1.42</span>
      </Row>
      <Row label="MAC Address">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#666' }}>aa:bb:cc:11:22:33</span>
      </Row>
    </div>
  );
}

// ================================================================
// SECTION: DISPLAY
// ================================================================

function DisplayPanel() {
  return (
    <div style={{ marginTop: 12 }}>
      <Row label="Resolution">
        <select style={selectStyle}>
          <option>2560 × 1440 (Recommended)</option>
          <option>1920 × 1080</option>
          <option>3840 × 2160</option>
        </select>
      </Row>
      <Row label="Refresh Rate">
        <select style={selectStyle}>
          <option>165 Hz</option>
          <option>120 Hz</option>
          <option>60 Hz</option>
        </select>
      </Row>
      <Row label="Scaling">
        <select style={selectStyle}>
          <option>100%</option>
          <option>125%</option>
          <option>150%</option>
        </select>
      </Row>
      <Row label="Monitor">
        <span style={{ fontSize: 12, color: '#aaa' }}>DELL S2721DGF · 27" · AMD Radeon RX 7900 XTX</span>
      </Row>
    </div>
  );
}

// ================================================================
// SECTION: POWER
// ================================================================

function PowerPanel() {
  return (
    <div style={{ marginTop: 12 }}>
      <Row label="Power Mode">
        <select style={selectStyle}>
          <option>Performance</option>
          <option selected>Balanced</option>
          <option>Power Saver</option>
        </select>
      </Row>
      <Row label="Screen Timeout">
        <select style={selectStyle}>
          <option>5 minutes</option>
          <option selected>15 minutes</option>
          <option>Never</option>
        </select>
      </Row>
      <Row label="Battery">
        <span style={{ fontSize: 12, color: '#10b981' }}>Plugged in · 100%</span>
      </Row>
    </div>
  );
}

// ================================================================
// SECTION: ABOUT
// ================================================================

function AboutPanel() {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ padding: '20px 0', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>5th OS</div>
        <div style={{ fontSize: 14, color: '#ef2137', fontFamily: 'var(--font-mono)', marginTop: 4 }}>LELU — The Fifth Element</div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>Version 1.0.2 · Build 2026.07.30-lelu</div>
      </div>

      <Row label="OS">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ddd' }}>5th OS 1.0.2 (Lelu)</span>
      </Row>
      <Row label="Kernel">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#888' }}>6.8.0-lelu-amd64</span>
      </Row>
      <Row label="Desktop">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#888' }}>Cinnamon 6.4-lelu</span>
      </Row>
      <Row label="Window Manager">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#888' }}>LeluWM (GPU composited)</span>
      </Row>
      <Row label="Sandbox">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#10b981' }}>Nemo Claw v2.4.1 ● attached</span>
      </Row>
      <Row label="CPU">
        <span style={{ fontSize: 12, color: '#aaa' }}>AMD Ryzen 9 7950X (32) @ 5.7GHz</span>
      </Row>
      <Row label="GPU">
        <span style={{ fontSize: 12, color: '#aaa' }}>AMD Radeon RX 7900 XTX · 24 GB</span>
      </Row>
      <Row label="RAM">
        <span style={{ fontSize: 12, color: '#aaa' }}>64 GB DDR5-6000</span>
      </Row>
      <Row label="Disk">
        <span style={{ fontSize: 12, color: '#aaa' }}>Samsung 990 Pro 2TB NVMe · 476 GB free</span>
      </Row>
      <Row label="Agents">
        <span style={{ fontSize: 12, color: '#aaa' }}>13 running · 2 paused</span>
      </Row>

      <div style={{ marginTop: 20, padding: 16, background: 'rgba(239,33,55,0.05)', border: '1px solid rgba(239,33,55,0.15)', borderRadius: 0, fontSize: 12, color: '#aaa', lineHeight: 1.6 }}>
        <div style={{ color: '#ef2137', fontWeight: 600, marginBottom: 4 }}>Core Directive</div>
        SANDBOX → MASTER → VALIDATE → DEPLOY<br/>
        Every operation flows through Nemo Claw isolation. Nothing touches the real environment until proven safe.
      </div>
    </div>
  );
}

// ================================================================
// SECTION: SECURITY
// ================================================================

function SecurityPanel() {
  const { setLocked } = useOSStore();

  return (
    <div style={{ marginTop: 12 }}>
      <Row label="Lock Screen Password" sub="SHA-256 hashed — never stored as plaintext">
        <button onClick={() => {
          const pw = prompt('Enter new lock screen password:');
          if (pw) {
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw))
              .then(hash => {
                const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
                localStorage.setItem('5th-os:passhash', hex);
              });
          }
        }} style={btnStyle}>Change Password</button>
      </Row>

      <Row label="API Key Storage" sub="AES-GCM encrypted via Web Crypto (PBKDF2, 100k iterations)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}/>
          <span style={{ fontSize: 12, color: '#10b981' }}>Encrypted</span>
        </div>
      </Row>

      <Row label="Screen Lock">
        <button onClick={() => setLocked(true)} style={btnStyle}>Lock Now (Cmd+L)</button>
      </Row>

      <Row label="Sandbox Status">
        <span style={{ fontSize: 12, color: '#10b981', fontFamily: 'var(--font-mono)' }}>Nemo Claw v2.4.1 · Active</span>
      </Row>
    </div>
  );
}

// ================================================================
// MAIN SETTINGS APP
// ================================================================

interface SectionItem { id: string; label: string; icon: string; highlight?: boolean; }
interface SectionGroup { group: string; items: SectionItem[]; }

export function SettingsApp() {
  const [section, setSection] = React.useState('ai');

  const sections: SectionGroup[] = [
    { group: 'LELU AI', items: [
      { id: 'ai', label: 'AI Configuration', icon: 'Sparkles', highlight: true },
      { id: 'security', label: 'Security', icon: 'Shield' },
    ]},
    { group: 'APPEARANCE', items: [
      { id: 'appearance', label: 'Themes', icon: 'Droplet' },
    ]},
    { group: 'PREFERENCES', items: [
      { id: 'notifications', label: 'Notifications', icon: 'Bell' },
      { id: 'keyboard', label: 'Keyboard', icon: 'Command' },
    ]},
    { group: 'HARDWARE', items: [
      { id: 'display', label: 'Display', icon: 'Monitor' },
      { id: 'sound', label: 'Sound', icon: 'Volume2' },
      { id: 'network', label: 'Network', icon: 'Wifi' },
      { id: 'power', label: 'Power', icon: 'BatteryCharging' },
    ]},
    { group: 'SYSTEM', items: [
      { id: 'about', label: 'About', icon: 'Info' },
    ]},
  ];

  const sectionLabels: Record<string, string> = {
    ai: 'AI Configuration', security: 'Security',
    appearance: 'Themes', notifications: 'Notifications',
    keyboard: 'Keyboard', display: 'Display',
    sound: 'Sound', network: 'Network',
    power: 'Power', about: 'About',
  };

  return (
    <div style={{ height: '100%', display: 'flex', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <div style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.06)', padding: 10, overflow: 'auto', background: 'rgba(255,255,255,0.015)' }}>
        {sections.map(g => (
          <div key={g.group} style={{ marginBottom: 10 }}>
            <div className="label-nano" style={{ padding: '2px 10px 6px', color: g.group === 'LELU AI' ? '#ef2137' : '#666' }}>{g.group}</div>
            {g.items.map(it => {
              const active = section === it.id;
              return (
                <button key={it.id} onClick={() => setSection(it.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '6px 10px',
                  borderRadius: 'var(--r-control)',
                  background: active ? (it.highlight ? 'rgba(239,33,55,0.15)' : 'rgba(239,33,55,0.12)') : 'transparent',
                  border: 'none',
                  color: active ? '#fff' : '#bbb',
                  cursor: 'pointer', textAlign: 'left' as const,
                  fontSize: 12,
                  borderLeft: `2px solid ${active ? '#ef2137' : 'transparent'}`,
                  fontFamily: 'var(--font-sans)', outline: 'none',
                }}>
                  <Icon name={it.icon} size={13} style={{ color: active ? '#ef2137' : '#888' }}/>
                  {it.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        <div className="label-mono" style={{ marginBottom: 22 }}>
          {section === 'ai' ? 'LELU AI CONFIGURATION' : 'SYSTEM SETTINGS'}
        </div>
        <div style={{ fontSize: 24, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', marginBottom: 4 }}>
          {sectionLabels[section] || section}
        </div>

        {section === 'ai' && <AISettingsPanel />}
        {section === 'security' && <SecurityPanel />}
        {section === 'appearance' && <AppearancePanel />}
        {section === 'notifications' && <NotificationsPanel />}
        {section === 'keyboard' && <KeyboardPanel />}
        {section === 'display' && <DisplayPanel />}
        {section === 'sound' && <SoundPanel />}
        {section === 'network' && <NetworkPanel />}
        {section === 'power' && <PowerPanel />}
        {section === 'about' && <AboutPanel />}
      </div>
    </div>
  );
}

import { registerApp } from '../../system/appRegistry';
registerApp('settings', () => import('./SettingsApp.tsx').then(m => ({ default: m.SettingsApp })));
