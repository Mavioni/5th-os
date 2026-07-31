/**
 * AgentOutputCards — Floating result cards on the desktop.
 *
 * When agents finish executing, their results materialize as
 * dismissible cards on the desktop. No need to open AgentSwarm
 * or LeluHUD to see what agents did. The OS surface IS the agent interface.
 */

import React from 'react';
import { useOSStore } from '../../system/osStore';
import { agentRuntime } from '../../system/agentRuntime';
import { X, Maximize2 } from 'lucide-react';

interface CardState {
  id: string;
  agentId: string;
  label: string;
  icon: string;
  status: string;
  result: string;
  x: number;
  y: number;
  createdAt: number;
}

export function AgentOutputCards() {
  const tasks = useOSStore(s => s.tasks);
  const launchApp = useOSStore(s => s.launchApp);
  const [cards, setCards] = React.useState<CardState[]>([]);
  const seenRef = React.useRef<Set<string>>(new Set());

  // Watch for newly completed agents
  React.useEffect(() => {
    const completed = tasks.filter(t => t.status === 'done');
    for (const task of completed) {
      if (seenRef.current.has(task.id)) continue;
      seenRef.current.add(task.id);

      const agent = agentRuntime.get(task.id);
      if (!agent || !agent.result) continue;

      // Add a new floating card
      setCards(prev => {
        // Limit to 5 cards
        const next = prev.length >= 5 ? prev.slice(1) : prev;
        return [...next, {
          id: `card-${Date.now()}`,
          agentId: agent.id,
          label: agent.label,
          icon: agent.icon,
          status: agent.status,
          result: agent.result!,
          x: 40 + Math.random() * 200,
          y: 100 + (next.length * 140) + Math.random() * 40,
          createdAt: Date.now(),
        }];
      });
    }

    // Also catch errored agents by checking agentRuntime directly
    const allAgents = agentRuntime.list();
    for (const agent of allAgents) {
      if (agent.status !== 'error') continue;
      if (seenRef.current.has(agent.id)) continue;
      seenRef.current.add(agent.id);

      setCards(prev => {
        const next = prev.length >= 5 ? prev.slice(1) : prev;
        return [...next, {
          id: `card-${Date.now()}`,
          agentId: agent.id,
          label: agent.label,
          icon: agent.icon,
          status: 'error',
          result: agent.error || agent.result || 'Unknown error',
          x: 40 + Math.random() * 200,
          y: 100 + (next.length * 140) + Math.random() * 40,
          createdAt: Date.now(),
        }];
      });
    }
  }, [tasks]);

  // Auto-remove cards after 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - 30_000;
      setCards(prev => prev.filter(c => c.createdAt > cutoff));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const dismiss = (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  };

  if (cards.length === 0) return null;

  return (
    <>
      {cards.map((card, i) => (
        <div
          key={card.id}
          style={{
            position: 'absolute',
            left: card.x,
            top: card.y,
            width: 320,
            zIndex: 500 + i,
            background: card.status === 'error'
              ? 'rgba(248,113,113,0.06)'
              : 'rgba(2,4,8,0.92)',
            backdropFilter: 'blur(20px)',
            border: card.status === 'error'
              ? '1px solid rgba(248,113,113,0.3)'
              : '1px solid rgba(239,33,55,0.25)',
            borderRadius: 0,
            boxShadow: card.status === 'error'
              ? '0 10px 30px rgba(248,113,113,0.15)'
              : '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(239,33,55,0.1)',
            animation: 'fade-in 200ms var(--ease-out)',
            fontFamily: 'var(--font-sans)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px',
            background: card.status === 'error'
              ? 'rgba(248,113,113,0.1)'
              : 'rgba(239,33,55,0.06)',
            borderBottom: card.status === 'error'
              ? '1px solid rgba(248,113,113,0.15)'
              : '1px solid rgba(239,33,55,0.1)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
              color: card.status === 'error' ? '#f87171' : '#ef2137',
            }}>
              {card.status === 'error' ? 'AGENT ERROR' : 'AGENT COMPLETE'}
            </span>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#e8e8e8' }}>
              {card.label}
            </span>
            <span onClick={() => launchApp('swarm')}
              title="Open Agent Swarm"
              style={{ cursor: 'pointer', color: '#888', padding: '2px' }}>
              <Maximize2 size={12} />
            </span>
            <span onClick={() => dismiss(card.id)}
              title="Dismiss"
              style={{ cursor: 'pointer', color: '#888', padding: '2px' }}>
              <X size={12} />
            </span>
          </div>

          {/* Body */}
          <div style={{
            padding: '8px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#888',
            maxHeight: 100,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            lineHeight: 1.5,
          }}>
            {card.result}
          </div>

          {/* Footer */}
          <div style={{
            padding: '4px 12px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            fontFamily: 'var(--font-mono)', fontSize: 8, color: '#555',
          }}>
            {card.agentId} · {new Date(card.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </>
  );
}
