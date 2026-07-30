import React from 'react';
import Icon from '../../components/ui/Icon';
import { loadSettings, saveSettings, getDefaultSettings, loadDecryptedApiKey, chat, type AISettings, type ChatMessage } from '../../ai/hermesClient';

// ================================================================
// AI SETTINGS PANEL
// ================================================================

function AISettingsPanel() {
  const [settings, setSettings] = React.useState<AISettings>(loadSettings);
  const [apiKey, setApiKey] = React.useState(''); // decrypted, for display
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [testError, setTestError] = React.useState('');

  // Load decrypted API key on mount
  React.useEffect(() => {
    loadDecryptedApiKey().then(k => setApiKey(k));
  }, []);

  const update = async (patch: Partial<AISettings>) => {
    // If API key is being changed, update the decrypted version too
    if (patch.apiKey !== undefined) {
      setApiKey(patch.apiKey);
    }
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveSettings(next);
    setTestResult('idle');
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult('idle');
    try {
      const msgs: ChatMessage[] = [
        { role: 'user', content: 'Say "multi-pass" and nothing else.' },
      ];
      const response = await chat(msgs, settings);
      if (response.toLowerCase().includes('multi-pass') || response.length > 0) {
        setTestResult('success');
      } else {
        setTestResult('error');
        setTestError('Unexpected response');
      }
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

  const models = providerModels[settings.provider] || [];

  return (
    <div style={{ marginTop: 12 }}>
      {/* Status banner */}
      <div style={{
        padding: '12px 14px', marginBottom: 20,
        background: settings.apiKey
          ? testResult === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(34,220,255,0.05)'
          : 'rgba(239,33,55,0.08)',
        border: `1px solid ${
          settings.apiKey
            ? testResult === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(34,220,255,0.15)'
            : 'rgba(239,33,55,0.25)'
        }`,
        borderRadius: 0,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: settings.apiKey ? (testResult === 'success' ? '#10b981' : '#22dcff') : '#ef2137',
          boxShadow: settings.apiKey
            ? (testResult === 'success' ? '0 0 10px #10b981' : '0 0 8px #22dcff')
            : '0 0 10px #ef2137',
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
            {settings.apiKey
              ? testResult === 'success' ? 'AI Connected — Lelu is live'
              : 'API key configured — test to verify'
            : 'Mock mode — Lelu uses local responses'}
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
            {settings.apiKey
              ? `${settings.provider} · ${settings.model}`
              : 'Set an API key to enable real AI responses'}
          </div>
        </div>
        {settings.apiKey && (
          <button onClick={testConnection} disabled={testing}
            style={{
              padding: '6px 14px', fontSize: 11, fontFamily: 'var(--font-mono)',
              background: testResult === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(34,220,255,0.1)',
              border: `1px solid ${testResult === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(34,220,255,0.2)'}`,
              borderRadius: 'var(--r-control)', color: testResult === 'success' ? '#10b981' : '#22dcff',
              cursor: 'pointer', letterSpacing: '0.05em',
            }}>
            {testing ? 'TESTING...' : testResult === 'success' ? '✓ CONNECTED' : 'TEST CONNECTION'}
          </button>
        )}
      </div>

      {testResult === 'error' && (
        <div style={{
          padding: '10px 14px', marginBottom: 16,
          background: 'rgba(239,33,55,0.08)', border: '1px solid rgba(239,33,55,0.2)',
          borderRadius: 0, fontSize: 11, color: '#f87171', fontFamily: 'var(--font-mono)',
        }}>
          Connection failed: {testError}
        </div>
      )}

      <Row label="Provider">
        <select value={settings.provider}
          onChange={(e) => {
            const provider = e.target.value as AISettings['provider'];
            const defaultModel = providerModels[provider]?.[0] || '';
            update({ provider, model: defaultModel });
          }}
          style={selectStyle}>
          <option value="openai">OpenAI</option>
          <option value="openrouter">OpenRouter</option>
          <option value="anthropic">Anthropic</option>
          <option value="custom">Custom (OpenAI-compatible)</option>
        </select>
      </Row>

      <Row label="API Key" sub="Stored in your browser. Never sent to any server but the AI provider.">
        <input type="password" value={apiKey}
          onChange={(e) => update({ apiKey: e.target.value })}
          placeholder={settings.provider === 'openai' ? 'sk-...' : settings.provider === 'anthropic' ? 'sk-ant-...' : '...'}
          style={inputStyle} />
      </Row>

      <Row label="Model" sub="The AI model Lelu will use to think">
        {models.length > 0 ? (
          <select value={settings.model}
            onChange={(e) => update({ model: e.target.value })}
            style={selectStyle}>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
            <option value={settings.model}>{settings.model} (custom)</option>
          </select>
        ) : (
          <input value={settings.model}
            onChange={(e) => update({ model: e.target.value })}
            placeholder="Model name"
            style={inputStyle} />
        )}
      </Row>

      {settings.provider === 'custom' && (
        <Row label="Base URL" sub="OpenAI-compatible API endpoint">
          <input value={settings.baseUrl || ''}
            onChange={(e) => update({ baseUrl: e.target.value })}
            placeholder="https://api.openai.com/v1"
            style={inputStyle} />
        </Row>
      )}

      <Row label="System Prompt" sub="Defines Lelu's personality and behavior">
        <textarea value={settings.systemPrompt}
          onChange={(e) => update({ systemPrompt: e.target.value })}
          rows={4}
          style={{ ...inputStyle, width: '100%', height: 80, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 10 }} />
      </Row>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={async () => {
          const def = getDefaultSettings();
          setSettings(def);
          setApiKey('');
          await saveSettings(def);
          setTestResult('idle');
        }}
          style={{
            padding: '8px 16px', borderRadius: 'var(--r-control)',
            background: 'rgba(239,33,55,0.1)', border: '1px solid rgba(239,33,55,0.25)',
            color: '#ef2137', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12,
          }}>
          Reset to defaults
        </button>

        <button onClick={async () => {
          localStorage.removeItem('lelu-ai-settings');
          localStorage.removeItem('lelu-ai-keyhash');
          const def = getDefaultSettings();
          setSettings(def);
          setApiKey('');
          await saveSettings(def);
          setTestResult('idle');
        }}
          style={{
            padding: '8px 16px', borderRadius: 'var(--r-control)',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            color: '#888', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12,
          }}>
          Clear API key
        </button>
      </div>
    </div>
  );
}

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

// ================================================================
// SETTINGS APP
// ================================================================

interface SectionItem {
  id: string;
  label: string;
  icon: string;
  highlight?: boolean;
}

interface SectionGroup {
  group: string;
  items: SectionItem[];
}

export function SettingsApp() {
  const [section, setSection] = React.useState('ai');

  const sections: SectionGroup[] = [
    {
      group: 'LELU AI',
      items: [
        { id: 'ai', label: 'AI Configuration', icon: 'Sparkles', highlight: true },
      ],
    },
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
    <div style={{ height: '100%', display: 'flex', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <div style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.06)', padding: 10, overflow: 'auto', background: 'rgba(255,255,255,0.015)' }}>
        {sections.map((g) => (
          <div key={g.group} style={{ marginBottom: 10 }}>
            <div className="label-nano" style={{
              padding: '2px 10px 6px',
              color: g.group === 'LELU AI' ? '#ef2137' : undefined,
            }}>
              {g.group}
            </div>
            {g.items.map((it) => {
              const a = section === it.id;
              return (
                <button key={it.id} onClick={() => setSection(it.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '6px 10px',
                    borderRadius: 'var(--r-control)',
                    background: a
                      ? (it.highlight ? 'rgba(239,33,55,0.15)' : 'rgba(239,33,55,0.12)')
                      : 'transparent',
                    border: 'none',
                    color: a ? '#fff' : '#bbb',
                    cursor: 'pointer', textAlign: 'left' as const,
                    fontSize: 12,
                    borderLeft: `2px solid ${a ? '#ef2137' : 'transparent'}`,
                    fontFamily: 'var(--font-sans)', outline: 'none',
                  }}>
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
          {section === 'ai' ? 'LELU AI CONFIGURATION' : 'SYSTEM SETTINGS'}
        </div>
        <div style={{ fontSize: 24, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', marginBottom: 4 }}>
          {sections.flatMap(g => g.items).find(i => i.id === section)?.label || section}
        </div>

        {section === 'ai' && <AISettingsPanel />}
        {section !== 'ai' && (
          <div style={{ fontSize: 13, color: '#888', marginTop: 40 }}>
            Settings panel — full port in progress
          </div>
        )}
      </div>
    </div>
  );
}

import { registerApp } from '../../system/appRegistry';
registerApp('settings', () => import('./SettingsApp.tsx').then(m => ({ default: m.SettingsApp })));
