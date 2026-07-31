/**
 * AgentSwarm — Visual agent orchestration dashboard.
 *
 * This is the control center of the AIOS. Every agent, its status,
 * its steps, and its output — visible and controllable in real-time.
 * No display stubs. No mock data. Every agent shown here is alive.
 */

import React from 'react';
import { Cpu, Search, Code, Map, Shield, Terminal, Play, Square, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useOSStore } from '../../system/osStore';
import { agentRuntime } from '../../system/agentRuntime';
import type { AgentType } from '../../system/agentRuntime';

// ================================================================
// TYPE ICONS & COLORS
// ================================================================

const TYPE_CONFIG: Record<AgentType, { icon: React.ComponentType<{ size?: number }>; color: string; label: string }> = {
  researcher:    { icon: Search, color: '#22dcff', label: 'Researcher' },
  coder:         { icon: Code, color: '#ef2137', label: 'Coder' },
  planner:       { icon: Map, color: '#f59e0b', label: 'Planner' },
  reviewer:      { icon: Shield, color: '#a855f7', label: 'Reviewer' },
  executor:      { icon: Terminal, color: '#10b981', label: 'Executor' },
  orchestrator:  { icon: Cpu, color: '#ef2137', label: 'Orchestrator' },
};

// ================================================================
// AGENT CARD
// ================================================================

function AgentCard({ agentId }: { agentId: string }) {
  const task = useOSStore(s => s.tasks.find(t => t.id === agentId));
  const agent = agentRuntime.get(agentId);
  const [expanded, setExpanded] = React.useState(true);

  if (!task) return null;

  const config = TYPE_CONFIG[agent?.type || 'executor'] || TYPE_CONFIG.executor;
  const Icon = config.icon;
  const isRunning = task.status === 'running';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${isRunning ? 'rgba(239,33,55,0.25)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 0,
      marginBottom: 8,
      overflow: 'hidden',
      transition: 'border-color 150ms',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', cursor: 'pointer',
          background: isRunning ? 'rgba(239,33,55,0.04)' : 'transparent',
          borderBottom: expanded ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <span style={{ color: config.color, display: 'inline-flex', flexShrink: 0 }}>
          <Icon size={14} />
        </span>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: '#e8e8e8', fontFamily: 'var(--font-sans)' }}>
          {task.label}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          padding: '2px 6px', borderRadius: 0,
          background: isRunning ? 'rgba(239,33,55,0.12)' : task.status === 'done' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
          color: isRunning ? '#ef2137' : task.status === 'done' ? '#10b981' : '#888',
          letterSpacing: '0.1em',
        }}>
          {task.status.toUpperCase()}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#555' }}>
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        {isRunning && (
          <span onClick={(e) => { e.stopPropagation(); useOSStore.getState().killAgent(agentId); }}
            style={{ cursor: 'pointer', color: '#ef2137', padding: '2px 4px' }}
            title="Kill agent">
            <Square size={12} />
          </span>
        )}
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: '8px 14px 12px' }}>
          {/* Type badge */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#555', marginBottom: 8 }}>
            {config.label} · {agentId} · {agent?.workspace || ''}
          </div>

          {/* Steps */}
          {task.steps.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {task.steps.map((s) => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                }}>
                  <span style={{ color: s.status === 'running' ? '#ef2137' : s.status === 'done' ? '#10b981' : '#555', width: 12, textAlign: 'center' }}>
                    {s.status === 'running' ? '▸' : s.status === 'done' ? '✓' : '○'}
                  </span>
                  <span style={{ color: s.status === 'pending' ? '#555' : '#ccc', minWidth: 80 }}>{s.tool}</span>
                  <span style={{ color: '#888', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.arg}</span>
                  {s.ms != null && <span style={{ color: '#555', fontSize: 9 }}>{s.ms}ms</span>}
                  {s.status === 'running' && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ef2137', boxShadow: '0 0 4px #ef2137', animation: 'pulse 1s infinite' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Result */}
          {agent?.result && (
            <div style={{
              padding: '6px 10px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'var(--font-mono)', fontSize: 10, color: '#888',
              maxHeight: 120, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {agent.result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ================================================================
// SPAWN FORM
// ================================================================

function SpawnForm() {
  const [type, setType] = React.useState<AgentType>('executor');
  const [label, setLabel] = React.useState('');
  const [goal, setGoal] = React.useState('');

  const handleSpawn = () => {
    if (!label.trim()) return;
    useOSStore.getState().spawnAgent(type, label.trim(), goal.trim() || undefined);
    setLabel('');
    setGoal('');
  };

  return (
    <div style={{
      padding: 14, background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(239,33,55,0.15)', marginBottom: 16,
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#ef2137', letterSpacing: '0.1em', marginBottom: 10 }}>
        SPAWN AGENT
      </div>

      {/* Type selector */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
        {(Object.entries(TYPE_CONFIG) as [AgentType, typeof TYPE_CONFIG[AgentType]][]).filter(([t]) => t !== 'orchestrator').map(([t, cfg]) => {
          const Ico = cfg.icon;
          return (
            <button key={t} onClick={() => setType(t)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 8px', border: `1px solid ${type === t ? cfg.color : 'rgba(255,255,255,0.08)'}`,
                background: type === t ? `${cfg.color}15` : 'transparent',
                color: type === t ? cfg.color : '#888',
                fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer',
                borderRadius: 0, transition: 'all 120ms',
              }}>
              <Ico size={10} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={label} onChange={e => setLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSpawn(); }}
          placeholder="Agent label (e.g. 'Index files')"
          style={{
            flex: 1, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)', padding: '5px 10px',
            color: '#e8e8e8', fontFamily: 'var(--font-sans)', fontSize: 11, outline: 'none',
          }} />
        <button onClick={handleSpawn}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 12px', background: 'rgba(239,33,55,0.12)',
            border: '1px solid rgba(239,33,55,0.3)', color: '#ef2137',
            fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer',
            boxShadow: '0 0 6px rgba(239,33,55,0.15)',
          }}>
          <Play size={10} /> SPAWN
        </button>
      </div>
      <input value={goal} onChange={e => setGoal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSpawn(); }}
        placeholder="Goal / task description (optional)"
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)', padding: '5px 10px',
          color: '#e8e8e8', fontFamily: 'var(--font-sans)', fontSize: 11, outline: 'none',
        }} />
    </div>
  );
}

// ================================================================
// AGENT STATS
// ================================================================

function AgentStats() {
  const tasks = useOSStore(s => s.tasks);
  const running = tasks.filter(t => t.status === 'running').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;

  return (
    <div style={{
      display: 'flex', gap: 16, marginBottom: 16, padding: '0 2px',
      fontFamily: 'var(--font-mono)', fontSize: 10,
    }}>
      <Stat label="TOTAL" value={total} color="#e8e8e8" />
      <Stat label="RUNNING" value={running} color="#ef2137" pulse={running > 0} />
      <Stat label="DONE" value={done} color="#10b981" />
    </div>
  );
}

function Stat({ label, value, color, pulse }: { label: string; value: number; color: string; pulse?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {pulse && <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, animation: 'pulse 1s infinite' }} />}
      <span style={{ color: '#666', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ color, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

// ================================================================
// MAIN
// ================================================================

export function AgentSwarmApp() {
  const tasks = useOSStore(s => s.tasks);

  return (
    <div style={{
      height: '100%', background: '#020408', color: '#e8e8e8',
      fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid rgba(239,33,55,0.12)',
        background: 'rgba(239,33,55,0.02)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ef2137', letterSpacing: '0.1em' }}>
          AGENT SWARM
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tasks.length > 0 && (
            <button onClick={() => useOSStore.getState().killAllAgents()}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', background: 'rgba(239,33,55,0.08)',
                border: '1px solid rgba(239,33,55,0.2)', color: '#ef2137',
                fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer',
              }}>
              <Trash2 size={10} /> KILL ALL
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
        <AgentStats />
        <SpawnForm />

        {/* Agent list */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#666', letterSpacing: '0.1em', marginBottom: 8 }}>
          {tasks.length > 0 ? `LIVE AGENTS (${tasks.length})` : 'NO ACTIVE AGENTS'}
        </div>
        {tasks.map(t => (
          <AgentCard key={t.id} agentId={t.id} />
        ))}
        {tasks.length === 0 && (
          <div style={{
            padding: 40, textAlign: 'center', color: '#555',
            fontFamily: 'var(--font-sans)', fontSize: 12,
          }}>
            No agents running. Spawn one above or type "spawn agent" in Lelu chat.
          </div>
        )}
      </div>
    </div>
  );
}
