/**
 * Neural Command Bar — The primary interface for intent-driven computing.
 *
 * Ctrl+K opens this. Type what you want in natural language.
 * The OS routes your intent to agents, apps, or the filesystem.
 *
 * This replaces the traditional app-launcher paradigm.
 * You don't find apps. You express intent. The OS figures out the rest.
 */

import React from 'react';
import { useOSStore, APPS } from '../../system/osStore';
import { executeCommand } from '../../ai/aiosCommands';
import { searchFiles } from '../../system/vfs';

interface Suggestion {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: () => void;
  category: 'agent' | 'app' | 'intent' | 'file' | 'command';
}

export function NeuralCommand() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const [thinking, setThinking] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { launchApp, spawnAgent, tasks } = useOSStore();

  // Ctrl+K to open
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Focus input on open
  React.useEffect(() => {
    if (open) {
      setQuery('');
      setSuggestions(buildDefaultSuggestions());
      setSelectedIdx(0);
      setResult(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build suggestions as user types
  React.useEffect(() => {
    if (!open) return;
    const q = query.trim().toLowerCase();

    if (!q) {
      setSuggestions(buildDefaultSuggestions());
      setSelectedIdx(0);
      return;
    }

    const results: Suggestion[] = [];

    // App matches
    const appMatches = APPS.filter(a =>
      a.name.toLowerCase().includes(q) || a.comment.toLowerCase().includes(q) || a.cat.includes(q)
    ).slice(0, 4);
    for (const app of appMatches) {
      results.push({
        id: `app-${app.id}`,
        label: app.name,
        description: app.comment,
        icon: app.icon,
        action: () => { launchApp(app.id); setOpen(false); },
        category: 'app',
      });
    }

    // Agent spawn suggestions
    const agentTypes = [
      { type: 'researcher' as const, label: 'Research', desc: 'Search and analyze', icon: 'Search' },
      { type: 'coder' as const, label: 'Code', desc: 'Write and modify code', icon: 'Code' },
      { type: 'planner' as const, label: 'Plan', desc: 'Create execution plans', icon: 'Map' },
      { type: 'reviewer' as const, label: 'Review', desc: 'Review code quality', icon: 'Shield' },
      { type: 'executor' as const, label: 'Execute', desc: 'Run commands', icon: 'Terminal' },
    ];
    for (const at of agentTypes) {
      if (at.label.toLowerCase().includes(q) || 'spawn agent'.includes(q)) {
        results.push({
          id: `agent-${at.type}`,
          label: `Spawn ${at.label} agent`,
          description: `${at.desc}: "${query}"`,
          icon: at.icon,
          action: () => { spawnAgent(at.type, `${at.label}: ${query.slice(0, 30)}`, query); setOpen(false); },
          category: 'agent',
        });
      }
    }

    // File search
    if (q.length > 2) {
      const files = searchFiles(q);
      for (const file of files.slice(0, 3)) {
        results.push({
          id: `file-${file}`,
          label: file.split('/').pop() || file,
          description: file,
          icon: 'FileText',
          action: () => {
            launchApp('files');
            setOpen(false);
          },
          category: 'file',
        });
      }
    }

    // Intent matching
    const intents = [
      { pattern: /lock|sleep/i, label: 'Lock system', icon: 'Lock', desc: 'Lock the screen' },
      { pattern: /status|health|system info/i, label: 'System status', icon: 'Activity', desc: 'Show system health' },
      { pattern: /desktop|show desktop/i, label: 'Show desktop', icon: 'Monitor', desc: 'Minimize all windows' },
      { pattern: /workspace|switch to/i, label: 'Switch workspace', icon: 'Grid', desc: 'Change workspace' },
      { pattern: /notif|notification/i, label: 'Show notifications', icon: 'Bell', desc: 'View notifications' },
      { pattern: /volume/i, label: 'Set volume', icon: 'Volume', desc: 'Adjust volume' },
    ];
    for (const intent of intents) {
      if (intent.pattern.test(q)) {
        results.push({
          id: `intent-${intent.label}`,
          label: intent.label,
          description: intent.desc,
          icon: intent.icon,
          action: async () => {
            setThinking(true);
            const cmdResult = await executeCommand(query);
            setThinking(false);
            if (cmdResult?.executed) {
              setResult(cmdResult.description);
              setTimeout(() => setOpen(false), 1500);
            } else {
              // Try spawning a generic agent
              spawnAgent('executor', `Task: ${query.slice(0, 30)}`, query);
              setOpen(false);
            }
          },
          category: 'intent',
        });
        break; // Only one intent match
      }
    }

    // Direct command option — always available
    results.push({
      id: 'direct',
      label: `Execute: "${query}"`,
      description: 'Route through intent engine and agent system',
      icon: 'Cpu',
      action: async () => {
        setThinking(true);
        const cmdResult = await executeCommand(query);
        setThinking(false);
        if (cmdResult?.executed) {
          setResult(cmdResult.description);
          setTimeout(() => setOpen(false), 1500);
        } else {
          // Fallback: spawn executor agent
          spawnAgent('executor', `Task: ${query.slice(0, 30)}`, query);
          setOpen(false);
        }
      },
      category: 'command',
    });

    setSuggestions(results);
    setSelectedIdx(0);
  }, [query, open]);

  function buildDefaultSuggestions(): Suggestion[] {
    const runningAgents = tasks.filter(t => t.status === 'running');
    const results: Suggestion[] = [];

    // Quick actions
    results.push({
      id: 'quick-spawn',
      label: 'Spawn an agent',
      description: 'Researcher, coder, planner, reviewer, executor',
      icon: 'Cpu',
      action: () => {}, // type to refine
      category: 'agent',
    });
    results.push({
      id: 'quick-status',
      label: 'System status',
      description: `${tasks.length} agents · ${runningAgents.length} running`,
      icon: 'Activity',
      action: async () => {
        setThinking(true);
        const cmdResult = await executeCommand('system status');
        setThinking(false);
        setResult(cmdResult?.description || 'System operational.');
        setTimeout(() => setOpen(false), 2000);
      },
      category: 'command',
    });

    // Recent agents
    for (const agent of runningAgents.slice(0, 2)) {
      results.push({
        id: `agent-${agent.id}`,
        label: `Agent: ${agent.label}`,
        description: `Running — ${agent.steps.length} steps`,
        icon: agent.icon,
        action: () => { launchApp('swarm'); setOpen(false); },
        category: 'agent',
      });
    }

    return results;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[selectedIdx]) {
        suggestions[selectedIdx].action();
      }
    }
  };

  if (!open) return null;

  const categoryColors: Record<string, string> = {
    agent: '#ef2137',
    app: '#22dcff',
    intent: '#f59e0b',
    file: '#10b981',
    command: '#a855f7',
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={() => setOpen(false)} style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(2,4,8,0.6)', backdropFilter: 'blur(4px)',
      }} />

      {/* Command bar */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, maxHeight: 480, zIndex: 10001,
        background: 'rgba(2,4,8,0.96)', backdropFilter: 'blur(30px)',
        border: '1px solid rgba(239,33,55,0.3)',
        borderRadius: 0,
        boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(239,33,55,0.15)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'menu-in 120ms var(--ease-out)',
      }}>
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px',
          borderBottom: '1px solid rgba(239,33,55,0.15)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 18, color: '#ef2137',
            textShadow: '0 0 8px rgba(239,33,55,0.4)',
          }}>▸</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to do?"
            autoFocus
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#e8e8e8', fontFamily: 'var(--font-sans)', fontSize: 16,
              fontWeight: 300, letterSpacing: '-0.01em',
            }}
          />
          {thinking && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#ef2137' }}>THINKING…</span>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#555' }}>
            {suggestions.length} matches
          </span>
        </div>

        {/* Result feedback */}
        {result && (
          <div style={{
            padding: '10px 18px', borderBottom: '1px solid rgba(16,185,129,0.2)',
            background: 'rgba(16,185,129,0.05)', fontFamily: 'var(--font-mono)',
            fontSize: 11, color: '#10b981',
          }}>
            ✓ {result}
          </div>
        )}

        {/* Suggestions */}
        <div style={{ flex: 1, overflow: 'auto', padding: '6px 0' }}>
          {suggestions.length === 0 && !thinking && (
            <div style={{ padding: '20px 18px', textAlign: 'center', color: '#555', fontSize: 12 }}>
              No matches. Press Enter to execute as a command.
            </div>
          )}
          {suggestions.map((s, i) => (
            <div
              key={s.id}
              onClick={() => s.action()}
              onMouseEnter={() => setSelectedIdx(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 18px', cursor: 'pointer',
                background: i === selectedIdx ? 'rgba(239,33,55,0.08)' : 'transparent',
                borderLeft: i === selectedIdx ? '2px solid #ef2137' : '2px solid transparent',
                transition: 'all 80ms',
              }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em',
                color: categoryColors[s.category] || '#666', minWidth: 50,
              }}>
                {s.category.toUpperCase()}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e8e8e8', fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.description}</div>
              </div>
              {i === selectedIdx && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#ef2137' }}>↵</span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 18px', borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: 9, color: '#555',
        }}>
          <span>↑↓ navigate · ↵ execute · esc close</span>
          <span>NEURAL COMMAND</span>
        </div>
      </div>
    </>
  );
}
