import React from 'react';
import { useOSStore, APPS } from '../../system/osStore';

export function TerminalApp() {
  const [history, setHistory] = React.useState<
    Array<{ type: string; text?: string; tone?: string }>
  >([
    {
      type: 'sys',
      text: 'Revenant Linux 1.0.2 · Lelu OS · Cinnamon 6.4-lelu',
    },
    {
      type: 'sys',
      text: 'Last login: Sat Apr 18 14:42:03 on tty1 · 13 agents loaded',
    },
    {
      type: 'sys',
      text: "Type 'help' for available commands, 'apps' to list installed.",
    },
    { type: 'spacer' },
  ]);
  const [input, setInput] = React.useState('');
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [history]);

  const handle = (cmd: string) => {
    const c = cmd.trim();
    const newItems: typeof history = [{ type: 'cmd', text: c }];
    const parts = c.split(/\s+/);
    const base = parts[0];

    const out = (t: string, tone = 'mute') =>
      newItems.push({ type: 'out', text: t, tone });

    if (!c) {
      // empty
    } else if (base === 'help') {
      out('available commands:', 'label');
      out('  help         show this help');
      out('  clear        clear the terminal');
      out('  ls / pwd     filesystem basics');
      out('  neofetch     system info');
      out('  apps         list installed applications');
      out('  launch <id>  open an application');
      out('  agent ls     list running Lelu agents');
      out('  uptime       kernel uptime');
      out('  whoami       current user');
    } else if (base === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (base === 'ls') {
      out(
        'Desktop/   Documents/   Downloads/   Pictures/   Videos/',
        'mute',
      );
      out(
        'lelu/      projects/    revenant/    .config/    .bashrc',
        'mute',
      );
    } else if (base === 'pwd') {
      out('/home/jordan');
    } else if (base === 'whoami') {
      out('jordan');
    } else if (base === 'uptime') {
      out(
        ' 14:47:22  up 3 days  2:14,  1 user,  load average: 0.18, 0.22, 0.19',
      );
    } else if (base === 'neofetch') {
      out('       ___          jordan@revenant', 'accent');
      out("     /'___\\         ---------------", 'accent');
      out('    /\\ \\ \\__/         OS      Revenant Linux 1.0.2 (Lelu)', 'accent');
      out('    \\\\ \\ \\ ,__\\        Kernel  6.8.0-lelu-amd64', 'accent');
      out('     \\\\ \\ \\ \\_/        DE      Cinnamon 6.4-lelu', 'accent');
      out('      \\\\ \\_\\         Shell   zsh 5.9', 'accent');
      out('       \\/_/         Agents  13 running · 2 paused', 'accent');
    } else if (base === 'apps') {
      APPS.slice(0, 10).forEach((a) =>
        out(`  ${a.id.padEnd(12)} ${a.name}`),
      );
      out(
        `  …and ${APPS.length - 10} more. Run 'apps --all' to see everything.`,
        'mute',
      );
    } else if (base === 'launch' && parts[1]) {
      const app = APPS.find((a) => a.id === parts[1]);
      if (app) {
        useOSStore.getState().launchApp(app.id);
        out(`▸ launching ${app.name}…`, 'accent');
      } else {
        out(`launch: no app '${parts[1]}'`, 'error');
      }
    } else if (base === 'agent') {
      if (parts[1] === 'ls') {
        out(
          '  ● billing-reconciler   running   claude-4.5-sonnet',
          'success',
        );
        out('  ● inbox-triage         running   gpt-5', 'success');
        out(
          '  ○ launch-brief         paused    claude-4.5-sonnet',
          'warn',
        );
        out(
          '  ● meeting-notes        running   local-qwen-32b',
          'success',
        );
      } else {
        out('agent: usage: agent ls');
      }
    } else {
      out(`${base}: command not found`, 'error');
    }

    newItems.push({ type: 'spacer' });
    setHistory((h) => [...h, ...newItems]);
    setInput('');
  };

  const toneColor: Record<string, string> = {
    mute: '#888',
    accent: '#ef2137',
    success: '#10b981',
    warn: '#f59e0b',
    error: '#f87171',
    label: '#e8e8e8',
  };

  return (
    <div
      style={{
        height: '100%',
        background: '#020408',
        color: '#e8e8e8',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        lineHeight: 1.55,
        padding: '14px 16px',
        overflow: 'auto',
      }}
      onClick={() => document.getElementById('__term_input')?.focus()}
    >
      {history.map((h, i) => {
        if (h.type === 'spacer')
          return <div key={i} style={{ height: 6 }} />;
        if (h.type === 'sys')
          return (
            <div key={i} style={{ color: '#555' }}>
              {h.text}
            </div>
          );
        if (h.type === 'cmd')
          return (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#555' }}>jordan@revenant</span>
              <span style={{ color: '#ef2137' }}>▸</span>
              <span style={{ color: '#e8e8e8' }}>{h.text}</span>
            </div>
          );
        return (
          <div
            key={i}
            style={{
              color: toneColor[h.tone || 'mute'],
              whiteSpace: 'pre',
            }}
          >
            {h.text}
          </div>
        );
      })}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#555' }}>jordan@revenant</span>
        <span style={{ color: '#ef2137' }}>▸</span>
        <input
          id="__term_input"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handle(input);
          }}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#e8e8e8',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            caretColor: '#ef2137',
          }}
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}
