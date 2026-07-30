import React from 'react';
import Icon from '../../components/ui/Icon';
import { loadSettings, saveSettings, getDefaultSettings, type AISettings } from '../../ai/hermesClient';

function AISettingsPanel() {
  const [settings, setSettings] = React.useState<AISettings>(loadSettings);
  const [saved, setSaved] = React.useState(false);

  const update = (patch: Partial<AISettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 12, color: '#10b981', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
        {saved ? '● Settings saved' : 'Configure Lelu AI backend'}
      </div>

      <Row label="AI Provider">
        <select
          value={settings.provider}
          onChange={(e) => update({ provider: e.target.value as AISettings['provider'] })}
          style={selectStyle}
        >
          <option value="openai">OpenAI</option>
          <option value="openrouter">OpenRouter</option>
          <option value="anthropic">Anthropic</option>
          <option value="custom">Custom (OpenAI-compatible)</option>
        </select>
      </Row>

      <Row label="API Key" sub="Stored locally in your browser">
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => update({ apiKey: e.target.value })}
          placeholder="sk-..."
          style={inputStyle}
        />
      </Row>

      <Row label="Model" sub={settings.provider === 'openai' ? 'e.g. gpt-4o, gpt-4o-mini' : 'e.g. claude-sonnet-4-20250514'}>
        <input
          value={settings.model}
          onChange={(e) => update({ model: e.target.value })}
          placeholder="gpt-4o-mini"
          style={inputStyle}
        />
      </Row>

      {settings.provider === 'custom' && (
        <Row label="Base URL" sub="OpenAI-compatible endpoint">
          <input
            value={settings.baseUrl || ''}
            onChange={(e) => update({ baseUrl: e.target.value })}
            placeholder="https://api.openai.com/v1"
            style={inputStyle}
          />
        </Row>
      )}

      <button
        onClick={() => {
          const def = getDefaultSettings();
          setSettings(def);
          saveSettings(def);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        style={{
          marginTop: 12,
          padding: '8px 16px',
          borderRadius: 'var(--r-control)',
          background: 'rgba(239,33,55,0.12)',
          border: '1px solid rgba(239,33,55,0.3)',
          color: '#ef2137',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
        }}
      >
        Reset to defaults
      </button>
    </div>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#e8e8e8', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>{sub}</div>}
      </div>
      <div>{children}</div>
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
  width: 200,
  cursor: 'pointer',
};

export function SettingsApp() {
  const [section, setSection] = React.useState('appearance');

  const sections = [
    {
      group: 'APPEARANCE',
      items: [
        { id: 'appearance', label: 'Themes', icon: 'Droplet' },
        { id: 'desktop', label: 'Desktop', icon: 'Monitor' },
        { id: 'wallpaper', label: 'Backgrounds', icon: 'Image' },
        { id: 'fonts', label: 'Fonts', icon: 'FileText' },
      ],
    },
    {
      group: 'PREFERENCES',
      items: [
        { id: 'applets', label: 'Applets', icon: 'Grid' },
        { id: 'agents', label: 'Lelu agents', icon: 'Sparkles' },
        { id: 'notifications', label: 'Notifications', icon: 'Bell' },
        { id: 'keyboard', label: 'Keyboard', icon: 'Command' },
      ],
    },
    {
      group: 'HARDWARE',
      items: [
        { id: 'display', label: 'Display', icon: 'Monitor' },
        { id: 'sound', label: 'Sound', icon: 'Volume' },
        { id: 'network', label: 'Network', icon: 'Wifi' },
        { id: 'bluetooth', label: 'Bluetooth', icon: 'Bluetooth' },
        { id: 'power', label: 'Power', icon: 'Power' },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'users', label: 'Users', icon: 'Users' },
        { id: 'updates', label: 'Updates', icon: 'Download' },
        { id: 'about', label: 'About', icon: 'Info' },
      ],
    },
  ];

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
          width: 220,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: 10,
          overflow: 'auto',
          background: 'rgba(255,255,255,0.015)',
        }}
      >
        <div
          style={{
            padding: '4px 8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#888',
          }}
        >
          <Icon name="Search" size={12} />
          <span>Search settings…</span>
        </div>
        {sections.map((g) => (
          <div key={g.group} style={{ marginBottom: 10 }}>
            <div className="label-nano" style={{ padding: '2px 10px 6px' }}>
              {g.group}
            </div>
            {g.items.map((it) => {
              const a = section === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setSection(it.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 'var(--r-control)',
                    background: a ? 'rgba(239,33,55,0.12)' : 'transparent',
                    border: 'none',
                    color: a ? '#fff' : '#bbb',
                    cursor: 'pointer',
                    textAlign: 'left' as const,
                    fontSize: 12,
                    borderLeft: `2px solid ${a ? '#ef2137' : 'transparent'}`,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                >
                  <Icon name={it.icon} size={13} style={{ color: a ? '#ef2137' : '#888' }} />
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
          SYSTEM SETTINGS
        </div>
        <div style={{ fontSize: 24, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', marginBottom: 4 }}>
          {sections.flatMap(g => g.items).find(i => i.id === section)?.label || section}
        </div>

        {section === 'agents' && <AISettingsPanel />}
        {section !== 'agents' && (
          <div style={{ fontSize: 13, color: '#888', marginTop: 40 }}>
            Settings panel — full port in progress
          </div>
        )}
      </div>
    </div>
  );
}
