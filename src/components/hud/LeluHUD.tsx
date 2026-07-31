import React from 'react';
import Icon from '../ui/Icon';
import { LeluAvatar3D } from './LeluAvatar3D';
import { useOSStore } from '../../system/osStore';
import { loadSettings } from '../../ai/hermesClient';
import { Play, Square, Cpu } from 'lucide-react';

export const LeluHUD = React.memo(function LeluHUD() {
  const {
    chatLog, leluThinking, sandboxStatus,
    sendChat, leluTalking, setLeluTalking,
  } = useOSStore();
  const [input, setInput] = React.useState('');
  const [tab, setTab] = React.useState<'chat' | 'tasks' | 'sandbox' | 'memory'>('chat');
  const [minimized, setMinimized] = React.useState(false);
  const [tabHovered, setTabHovered] = React.useState(false);

  React.useEffect(() => {
    if (leluThinking) setLeluTalking(true);
    else {
      const t = setTimeout(() => setLeluTalking(false), 800);
      return () => clearTimeout(t);
    }
  }, [leluThinking, setLeluTalking]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendChat(input.trim());
    setInput('');
  };

  const tabs: Array<{ id: typeof tab; label: string }> = [
    { id: 'chat', label: 'CHAT' },
    { id: 'tasks', label: 'TASKS' },
    { id: 'sandbox', label: 'SANDBOX' },
    { id: 'memory', label: 'MEMORY' },
  ];

  return (
    <>
      {/* === FLOATING RESTORE TAB (visible when minimized) === */}
      <div
        onMouseEnter={() => setTabHovered(true)}
        onMouseLeave={() => setTabHovered(false)}
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: minimized
            ? 'translateY(-50%) translateX(0)'
            : 'translateY(-50%) translateX(100%)',
          width: tabHovered ? 32 : 8,
          height: tabHovered ? 80 : 60,
          background: tabHovered
            ? 'rgba(239,33,55,0.15)'
            : 'rgba(239,33,55,0.06)',
          border: `1px solid rgba(239,33,55,${tabHovered ? 0.35 : 0.12})`,
          borderRight: 'none',
          borderRadius: '4px 0 0 4px',
          cursor: 'pointer',
          zIndex: 860,
          transition: 'all 200ms var(--ease-standard)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: tabHovered
            ? '0 0 16px rgba(239,33,55,0.3), -4px 0 12px rgba(0,0,0,0.4)'
            : 'none',
        }}
      >
        {tabHovered && (
          <div
            style={{
              writingMode: 'vertical-rl' as const,
              textOrientation: 'mixed' as const,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.15em',
              color: '#ef2137',
              textShadow: '0 0 8px rgba(239,33,55,0.4)',
              userSelect: 'none',
            }}
          >
            LELU
          </div>
        )}
        {!tabHovered && (
          <div
            style={{
              width: 2,
              height: 20,
              background: 'rgba(239,33,55,0.5)',
              borderRadius: 1,
              boxShadow: '0 0 6px rgba(239,33,55,0.4)',
            }}
          />
        )}
      </div>

      {/* === MAIN SIDEBAR === */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: minimized ? -370 : 0,
          bottom: 48,
          width: 360,
          background:
            'linear-gradient(180deg, #050208 0%, #020408 40%, #020408 100%)',
          borderLeft: '1px solid rgba(239,33,55,0.20)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 850,
          boxShadow: minimized
            ? 'none'
            : '-20px 0 40px rgba(0,0,0,0.5), inset 1px 0 0 rgba(239,33,55,0.05)',
          fontFamily: 'var(--font-sans)',
          transition: 'right 280ms var(--ease-standard)',
        }}
      >
        {/* CRT scanlines overlay */}
        <div className="crt-scanlines" />

        {/* === MINIMIZE BUTTON (top-left) === */}
        <button
          onClick={() => setMinimized(true)}
          title="Minimize Lelu"
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--r-control)',
            color: '#888',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 120ms var(--ease-standard)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef2137';
            e.currentTarget.style.borderColor = 'rgba(239,33,55,0.3)';
            e.currentTarget.style.background = 'rgba(239,33,55,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#888';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14" />
          </svg>
        </button>

        {/* === AVATAR SECTION === */}
        <div
          style={{
            position: 'relative',
            height: 380,
            borderBottom: '1px solid rgba(239,33,55,0.2)',
            overflow: 'hidden',
          }}
        >
          <LeluAvatar3D talking={leluTalking} />
        </div>

        {/* === TABS === */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(239,33,55,0.1)',
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                borderBottom:
                  tab === t.id
                    ? '2px solid #ef2137'
                    : '2px solid transparent',
                color: tab === t.id ? '#ef2137' : '#666',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: tab === t.id ? 600 : 400,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 120ms var(--ease-standard)',
                outline: 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* === CONTENT === */}
        {tab === 'chat' && (
          <ChatLog messages={chatLog} thinking={leluThinking} />
        )}
        {tab === 'tasks' && (
          <TasksPanel />
        )}
        {tab === 'sandbox' && (
          <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
            <div className="label-mono" style={{ marginBottom: 8 }}>NEMO CLAW SANDBOX</div>
            <div style={{ padding: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#10b981', letterSpacing: '0.1em', marginBottom: 4 }}>● ATTACHED</div>
              <div style={{ fontSize: 12, color: '#e8e8e8' }}>{sandboxStatus}</div>
            </div>
            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>
              All Lelu operations execute here first. Nothing touches the real environment until validated in Nemo Claw.
              <br /><br />
              <strong>SANDBOX → MASTER → VALIDATE → DEPLOY</strong>
            </div>
          </div>
        )}
        {tab === 'memory' && (
          <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
            <div className="label-mono" style={{ marginBottom: 12 }}>KNOWLEDGE STORE</div>
            <div style={{ padding: 12, background: 'rgba(34,220,255,0.05)', border: '1px solid rgba(34,220,255,0.15)', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22dcff', letterSpacing: '0.1em', marginBottom: 4 }}>GITNEXUS ACTIVE</div>
              <div style={{ fontSize: 11, color: '#e8e8e8' }}>2,403 files indexed · 47 clusters · 12,440 call chains</div>
            </div>
            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>
              Cross-session memory stores conversation history, user preferences, and learned patterns.
            </div>
          </div>
        )}

        {/* === INPUT BAR (chat only) === */}
        {tab === 'chat' && (
          <>
            {/* AI status indicator */}
            <AIBadge />

            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(239,33,55,0.1)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Talk to Lelu. She hears you."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--r-control)', padding: '6px 10px',
                  color: '#e8e8e8', fontFamily: 'var(--font-sans)',
                  fontSize: 12, outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  width: 31, height: 31, borderRadius: 'var(--r-control)',
                  background: leluThinking ? 'rgba(239,33,55,0.2)' : '#ef2137',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: leluThinking ? 'none' : '0 0 8px rgba(239,33,55,0.3)',
                  transition: 'all 120ms var(--ease-standard)',
                }}
              >
                ↵
              </button>
            </div>
            <div style={{ padding: '6px 10px 10px', display: 'flex', flexWrap: 'wrap', gap: 4, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              {['Open terminal', 'System status', 'Summarize', 'Search web'].map((label) => (
                <button key={label} onClick={() => sendChat(label.toLowerCase())}
                  style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--r-control)', color: '#888', fontFamily: 'var(--font-sans)', fontSize: 10, cursor: 'pointer', outline: 'none' }}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
});

// ═══════════════════════════════════════
// CHAT LOG
// ═══════════════════════════════════════

function ChatLog({
  messages,
  thinking,
}: {
  messages: Array<{ from: string; t: string; text: string; system?: string; mono?: boolean }>;
  thinking: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);

  return (
    <div ref={ref} style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 14px' }}>
      {messages.map((m, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'lelu' ? 'flex-start' : 'flex-end' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#666', letterSpacing: '0.1em', marginBottom: 3 }}>
            {m.from === 'lelu' ? 'LELU' : 'YOU'} · {m.t}
          </div>
          <div style={{
            maxWidth: '85%',
            background: m.from === 'lelu' ? 'rgba(239,33,55,0.08)' : 'rgba(255,255,255,0.04)',
            border: m.from === 'lelu' ? '1px solid rgba(239,33,55,0.3)' : '1px solid rgba(255,255,255,0.08)',
            padding: '7px 10px', borderRadius: 0, fontSize: 12, color: '#e8e8e8', lineHeight: 1.4,
            fontFamily: m.mono ? 'var(--font-mono)' : 'var(--font-sans)',
          }}>
            {m.system && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#ef2137', marginBottom: 3, letterSpacing: '0.1em' }}>{m.system}</div>}
            {m.text}
          </div>
        </div>
      ))}
      {thinking && <div style={{ color: '#ef2137', fontSize: 11, fontStyle: 'italic' }} className="lelu-pulse">Lelu is thinking...</div>}
    </div>
  );
}

// ═══════════════════════════════════════
// AI STATUS BADGE
// ═══════════════════════════════════════

function AIBadge() {
  const [hasKey, setHasKey] = React.useState(false);
  const [model, setModel] = React.useState('');

  React.useEffect(() => {
    const s = loadSettings();
    setHasKey(!!s.apiKey);
    setModel(s.model || '');
  }, []);

  return (
    <div style={{
      padding: '6px 12px', borderTop: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: hasKey ? '#10b981' : '#ef2137',
        boxShadow: hasKey ? '0 0 6px #10b981' : '0 0 6px #ef2137',
      }} />
      <span style={{ color: '#666' }}>
        {hasKey ? `AI ACTIVE · ${model}` : 'MOCK MODE'}
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ color: '#555', cursor: 'pointer' }}
        onClick={() => {
          const store = useOSStore.getState();
          store.launchApp('settings');
        }}
        title="Configure AI">
        ⚙
      </span>
    </div>
  );
}

// ═══════════════════════════════════════
// TASKS PANEL — live agent display
// ═══════════════════════════════════════

function TasksPanel() {
  const { tasks, spawnAgent, killAgent, killAllAgents, launchApp } = useOSStore();

  const runningCount = tasks.filter(t => t.status === 'running').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid rgba(239,33,55,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cpu size={12} style={{ color: runningCount > 0 ? '#ef2137' : '#666' }} />
          <span className="label-mono" style={{ marginBottom: 0 }}>AGENTS</span>
          {runningCount > 0 && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 5px',
              background: 'rgba(239,33,55,0.12)', color: '#ef2137',
            }}>{runningCount} RUNNING</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => launchApp('swarm')}
            title="Open Agent Swarm"
            style={{
              padding: '3px 8px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#888',
              fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer',
            }}>
            FULL VIEW
          </button>
          {tasks.length > 0 && (
            <button
              onClick={() => killAllAgents()}
              title="Kill all agents"
              style={{
                padding: '3px 8px', background: 'rgba(239,33,55,0.06)',
                border: '1px solid rgba(239,33,55,0.15)', color: '#ef2137',
                fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer',
              }}>
              KILL ALL
            </button>
          )}
        </div>
      </div>

      {/* Quick spawn */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            { type: 'researcher' as const, label: 'Research' },
            { type: 'coder' as const, label: 'Code' },
            { type: 'planner' as const, label: 'Plan' },
          ].map(({ type, label }) => (
            <button key={type} onClick={() => {
              const goal = prompt(`Goal for ${label} agent?`);
              if (goal) spawnAgent(type, `${label}: ${goal.slice(0, 40)}`, goal);
            }}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: '3px 8px', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)', color: '#888',
                fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer',
                transition: 'all 120ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef2137'; e.currentTarget.style.color = '#ef2137'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#888'; }}
            >
              <Play size={8} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Agent list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 14px' }}>
        {tasks.length === 0 && (
          <div style={{ padding: 30, textAlign: 'center', color: '#555', fontSize: 11, fontFamily: 'var(--font-sans)' }}>
            No agents running. Agents spawn automatically on boot, or spawn one above.
          </div>
        )}
        {tasks.map(t => (
          <div key={t.id} style={{
            padding: '8px 10px', marginBottom: 4,
            background: t.status === 'running' ? 'rgba(239,33,55,0.03)' : 'rgba(255,255,255,0.01)',
            borderLeft: `2px solid ${t.status === 'running' ? '#ef2137' : t.status === 'done' ? '#10b981' : '#666'}`,
            transition: 'all 150ms',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name={t.icon} size={10} style={{ color: t.status === 'running' ? '#ef2137' : '#888' }} />
              <span style={{ flex: 1, fontSize: 11, color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>{t.label}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em',
                color: t.status === 'running' ? '#ef2137' : t.status === 'done' ? '#10b981' : '#666',
              }}>
                {t.status.toUpperCase()}
              </span>
              {t.status === 'running' && (
                <span onClick={() => killAgent(t.id)}
                  style={{ cursor: 'pointer', color: '#ef2137', padding: '0 2px' }}
                  title="Kill">
                  <Square size={10} />
                </span>
              )}
            </div>
            {t.steps.length > 0 && (
              <div style={{ marginTop: 4, marginLeft: 16, fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                {t.steps.slice(-3).map(s => (
                  <div key={s.id} style={{
                    color: s.status === 'running' ? '#ef2137' : s.status === 'done' ? '#666' : '#444',
                    padding: '1px 0',
                  }}>
                    {s.status === 'done' ? '✓' : s.status === 'running' ? '▸' : '○'} {s.tool} {s.arg.slice(0, 30)}
                    {s.ms != null && <span style={{ color: '#555' }}> {s.ms}ms</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
