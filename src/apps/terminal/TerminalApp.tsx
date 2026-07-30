import React from 'react';
import { useOSStore, APPS } from '../../system/osStore';
import {
  listDir, readFile, getCWD, setCWD,
  createDirectory, writeFile, deleteNode, searchFiles,
} from '../../system/vfs';

interface TermLine {
  type: 'sys' | 'cmd' | 'out' | 'error' | 'spacer';
  text?: string;
  tone?: string;
}

const TONE_COLORS: Record<string, string> = {
  mute: '#888', accent: '#ef2137', success: '#10b981',
  warn: '#f59e0b', error: '#f87171', label: '#e8e8e8',
  cyan: '#22dcff', green: '#10b981',
};

export function TerminalApp() {
  const [history, setHistory] = React.useState<TermLine[]>([
    { type: 'sys', text: '5th OS Terminal · Kernel 6.8.0-lelu-amd64 · Nemo Claw attached' },
    { type: 'sys', text: "Type 'help' for commands, 'apps' to list installed." },
    { type: 'spacer' },
  ]);
  const [input, setInput] = React.useState('');
  const [cmdHistory, setCmdHistory] = React.useState<string[]>([]);
  const [histIdx, setHistIdx] = React.useState(-1);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [history]);

  const out = (text: string, tone = 'mute'): TermLine => ({ type: 'out', text, tone });
  const err = (text: string): TermLine => ({ type: 'error', text, tone: 'error' });

  const handle = (cmd: string) => {
    const c = cmd.trim();
    const newLines: TermLine[] = [
      { type: 'cmd', text: `jordan@revenant ▸ ${c}` },
    ];

    // Add to command history
    if (c) {
      setCmdHistory((h) => [...h, c]);
      setHistIdx(-1);
    }

    const parts = c.split(/\s+/);
    const base = parts[0];
    const args = parts.slice(1);

    if (!c) {
      // empty
    } else if (base === 'help') {
      newLines.push(out('AVAILABLE COMMANDS', 'label'));
      newLines.push(out(''));
      newLines.push(out('  FILESYSTEM', 'accent'));
      newLines.push(out('  ls [path]         List directory contents'));
      newLines.push(out('  cd <path>         Change directory'));
      newLines.push(out('  pwd               Print working directory'));
      newLines.push(out('  cat <file>        Display file contents'));
      newLines.push(out('  mkdir <name>      Create directory'));
      newLines.push(out('  touch <name>      Create empty file'));
      newLines.push(out('  rm <name>         Delete file or empty directory'));
      newLines.push(out('  grep <pattern>    Search files for pattern'));
      newLines.push(out('  tree [path]       Display directory tree'));
      newLines.push(out('  find <name>       Find files by name'));
      newLines.push(out(''));
      newLines.push(out('  SYSTEM', 'accent'));
      newLines.push(out('  neofetch          System information'));
      newLines.push(out('  uptime            Kernel uptime'));
      newLines.push(out('  whoami            Current user'));
      newLines.push(out('  clear             Clear the terminal'));
      newLines.push(out('  date              Current date and time'));
      newLines.push(out(''));
      newLines.push(out('  APPS', 'accent'));
      newLines.push(out('  apps              List installed applications'));
      newLines.push(out('  launch <id>       Open an application'));
      newLines.push(out('  agent ls          List running Lelu agents'));

    } else if (base === 'clear') {
      setHistory([]);
      setInput('');
      return;

    } else if (base === 'ls') {
      const target = args[0] || getCWD();
      try {
        const items = listDir(target);
        if (items.length === 0) {
          newLines.push(out('(empty)', 'mute'));
        } else {
          items.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
            return a.name.localeCompare(b.name);
          }).forEach((it) => {
            const color = it.type === 'directory' ? 'accent' : 'mute';
            const suffix = it.type === 'directory' ? '/' : '';
            const sizeStr = it.type === 'file' ? ` ${fmtSize(it.size)}` : '';
            newLines.push(out(`  ${it.name}${suffix}${sizeStr}`, color));
          });
        }
      } catch {
        newLines.push(err(`ls: cannot access '${target}': No such directory`));
      }

    } else if (base === 'cd') {
      if (args.length === 0) {
        setCWD('/home/jordan');
        newLines.push(out(`  → /home/jordan`, 'success'));
      } else {
        const target = args[0];
        let newPath: string;
        if (target === '..') {
          newPath = getCWD().split('/').slice(0, -1).join('/') || '/';
        } else if (target.startsWith('/') || target.startsWith('~')) {
          newPath = target.startsWith('~') ? '/home/jordan' + target.slice(1) : target;
        } else {
          newPath = getCWD().replace(/\/$/, '') + '/' + target;
        }
        newPath = newPath.replace(/\/+/g, '/');
        if (setCWD(newPath)) {
          newLines.push(out(`  → ${getCWD()}`, 'success'));
        } else {
          newLines.push(err(`cd: '${target}': No such directory`));
        }
      }

    } else if (base === 'pwd') {
      newLines.push(out(getCWD()));

    } else if (base === 'cat') {
      if (args.length === 0) {
        newLines.push(err('cat: missing file operand'));
      } else {
        const target = args[0].startsWith('/') ? args[0] : getCWD().replace(/\/$/, '') + '/' + args[0];
        const content = readFile(target);
        if (content !== null) {
          content.split('\n').forEach((line) => {
            newLines.push(out(line, 'mute'));
          });
        } else {
          newLines.push(err(`cat: '${args[0]}': No such file`));
        }
      }

    } else if (base === 'mkdir') {
      if (args.length === 0) {
        newLines.push(err('mkdir: missing operand'));
      } else {
        const target = getCWD().replace(/\/$/, '') + '/' + args[0];
        if (createDirectory(target)) {
          newLines.push(out(`Created directory '${args[0]}'`, 'success'));
        } else {
          newLines.push(err(`mkdir: cannot create '${args[0]}': already exists`));
        }
      }

    } else if (base === 'touch') {
      if (args.length === 0) {
        newLines.push(err('touch: missing file operand'));
      } else {
        const target = getCWD().replace(/\/$/, '') + '/' + args[0];
        if (writeFile(target, '')) {
          newLines.push(out(`Created '${args[0]}'`, 'success'));
        } else {
          newLines.push(err(`touch: cannot create '${args[0]}'`));
        }
      }

    } else if (base === 'rm') {
      if (args.length === 0) {
        newLines.push(err('rm: missing operand'));
      } else {
        const target = getCWD().replace(/\/$/, '') + '/' + args[0];
        if (deleteNode(target)) {
          newLines.push(out(`Removed '${args[0]}'`, 'success'));
        } else {
          newLines.push(err(`rm: cannot remove '${args[0]}': not found or directory not empty`));
        }
      }

    } else if (base === 'grep') {
      if (args.length === 0) {
        newLines.push(err('grep: missing pattern'));
      } else {
        const pattern = args[0];
        const results = searchFiles(pattern, '/home/jordan');
        if (results.length === 0) {
          newLines.push(out(`No matches for "${pattern}"`, 'mute'));
        } else {
          results.slice(0, 20).forEach((r) => {
            const display = r.replace('/home/jordan', '~');
            newLines.push(out(`  ${display}`, 'success'));
          });
          if (results.length > 20) {
            newLines.push(out(`  ... and ${results.length - 20} more`, 'mute'));
          }
        }
      }

    } else if (base === 'find') {
      if (args.length === 0) {
        newLines.push(err('find: missing search term'));
      } else {
        const results = searchFiles(args[0], '/home/jordan');
        results.forEach((r) => {
          newLines.push(out(`  ${r.replace('/home/jordan', '~')}`, 'success'));
        });
        newLines.push(out(`${results.length} result(s)`));
      }

    } else if (base === 'tree') {
      const target = args[0] ? (args[0].startsWith('/') ? args[0] : getCWD().replace(/\/$/, '') + '/' + args[0]) : getCWD();
      // Walk and print tree
      const treeLines: string[] = [];
      function walk(path: string, prefix: string, depth: number) {
        if (depth > 4) { treeLines.push(`${prefix}...`); return; }
        const items = listDir(path);
        items.sort((a, b) => a.name.localeCompare(b.name));
        items.forEach((it, i) => {
          const isLast = i === items.length - 1;
          const connector = isLast ? '└── ' : '├── ';
          const childPrefix = isLast ? '    ' : '│   ';
          treeLines.push(`${prefix}${connector}${it.name}${it.type === 'directory' ? '/' : ''}`);
          if (it.type === 'directory') {
            walk(path + '/' + it.name, prefix + childPrefix, depth + 1);
          }
        });
      }
      treeLines.push(target.replace('/home/jordan', '~'));
      walk(target, '', 0);
      treeLines.forEach((l) => newLines.push(out(l, 'mute')));
    } else if (base === 'echo') {
      const text = args.join(' ');
      // Check for redirect
      const redirectIdx = args.indexOf('>');
      if (redirectIdx > 0 || args.some(a => a === '>')) {
        const gtIdx = args.indexOf('>');
        const content = args.slice(0, gtIdx).join(' ');
        const filename = args.slice(gtIdx + 1).join(' ');
        if (filename) {
          const target = getCWD().replace(/\/$/, '') + '/' + filename;
          if (writeFile(target, content)) {
            newLines.push(out(`Written to '${filename}'`, 'success'));
          } else {
            newLines.push(err(`echo: cannot write to '${filename}'`));
          }
        }
      } else {
        newLines.push(out(text));
      }

    } else if (base === 'whoami') {
      newLines.push(out('jordan'));

    } else if (base === 'uptime') {
      newLines.push(out(' 14:47:22  up 3 days  2:14,  1 user,  load average: 0.18, 0.22, 0.19'));

    } else if (base === 'date') {
      newLines.push(out(new Date().toString()));

    } else if (base === 'neofetch') {
      newLines.push(out('       ___          jordan@revenant', 'accent'));
      newLines.push(out("     /'___\\\\         ---------------", 'accent'));
      newLines.push(out('    /\\\\ \\\\ \\\\__/         OS      5th OS 1.0.2 (Lelu)', 'accent'));
      newLines.push(out('    \\\\\\\\ \\\\ \\\\ ,__\\\\        Kernel  6.8.0-lelu-amd64', 'accent'));
      newLines.push(out('     \\\\\\\\ \\\\ \\\\ \\\\_/        Shell   zsh 5.9', 'accent'));
      newLines.push(out('      \\\\\\\\ \\\\_\\\\         DE      Cinnamon 6.4-lelu', 'accent'));
      newLines.push(out('       \\\\/_/         WM      LeluWM (GPU composited)', 'accent'));
      newLines.push(out(''));
      newLines.push(out('  CPU     AMD Ryzen 9 7950X (32) @ 5.7GHz', 'mute'));
      newLines.push(out('  GPU     AMD Radeon RX 7900 XTX', 'mute'));
      newLines.push(out('  RAM     64 GB DDR5-6000', 'mute'));
      newLines.push(out('  DISK    Samsung 990 Pro 2TB NVMe', 'mute'));
      newLines.push(out(''));
      newLines.push(out('  SANDBOX Nemo Claw v2.4.1  ● attached', 'success'));
      newLines.push(out('  AGENTS  13 running · 2 paused', 'success'));
      newLines.push(out('  CWD     ' + getCWD(), 'mute'));

    } else if (base === 'apps') {
      APPS.slice(0, 12).forEach((a) =>
        newLines.push(out(`  ${a.id.padEnd(14)} ${a.name}`))
      );
      newLines.push(out(`  …and ${APPS.length - 12} more.`, 'mute'));
      newLines.push(out("  Run 'launch <id>' to open.", 'mute'));

    } else if (base === 'launch' && args[0]) {
      const app = APPS.find((a) => a.id === args[0]);
      if (app) {
        useOSStore.getState().launchApp(app.id);
        newLines.push(out(`▸ Launching ${app.name}…`, 'accent'));
      } else {
        newLines.push(err(`launch: no app '${args[0]}'. Run 'apps' to list.`));
      }

    } else if (base === 'agent' && args[0] === 'ls') {
      newLines.push(out('  ● billing-reconciler   running   claude-4.5-sonnet', 'success'));
      newLines.push(out('  ● inbox-triage         running   gpt-5', 'success'));
      newLines.push(out('  ○ launch-brief         paused    claude-4.5-sonnet', 'warn'));
      newLines.push(out('  ● meeting-notes        running   local-qwen-32b', 'success'));
      newLines.push(out('  ○ code-review          paused    deepseek-v4', 'warn'));

    } else if (base === 'agent') {
      newLines.push(out('agent: usage: agent ls', 'mute'));

    } else {
      newLines.push(err(`${base}: command not found`));
    }

    newLines.push({ type: 'spacer' });
    setHistory((h) => [...h, ...newLines]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIdx = histIdx === -1 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
        setHistIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx >= 0) {
        const newIdx = histIdx + 1;
        if (newIdx >= cmdHistory.length) {
          setHistIdx(-1);
          setInput('');
        } else {
          setHistIdx(newIdx);
          setInput(cmdHistory[newIdx]);
        }
      }
    } else if (e.key === 'Enter') {
      handle(input);
    }
  };

  return (
    <div style={{ height: '100%', background: '#020408', color: '#e8e8e8', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.55, padding: '14px 16px', overflow: 'auto' }}
      onClick={() => document.getElementById('__term_input')?.focus()}>
      {history.map((h, i) => {
        if (h.type === 'spacer') return <div key={i} style={{ height: 6 }} />;
        if (h.type === 'sys') return <div key={i} style={{ color: '#555' }}>{h.text}</div>;
        if (h.type === 'cmd') return <div key={i} style={{ color: '#e8e8e8' }}>{h.text}</div>;
        if (h.type === 'error') return <div key={i} style={{ color: '#f87171' }}>{h.text}</div>;
        return (
          <div key={i} style={{ color: TONE_COLORS[h.tone || 'mute'] || '#888', whiteSpace: 'pre-wrap' }}>
            {h.text}
          </div>
        );
      })}
      <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
        <span style={{ color: '#ef2137' }}>▸</span>
        <input id="__term_input" autoFocus value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e8e8e8', fontFamily: 'var(--font-mono)', fontSize: 12, marginLeft: 8, caretColor: '#ef2137' }} />
      </div>
      <div ref={endRef} />
    </div>
  );
}

function fmtSize(bytes?: number): string {
  if (bytes == null) return '';
  if (bytes > 1000000) return `${(bytes / 1000000).toFixed(1)}M`;
  if (bytes > 1000) return `${(bytes / 1000).toFixed(1)}K`;
  return `${bytes}B`;
}

import { registerApp } from '../../system/appRegistry';
registerApp('terminal', () => import('./TerminalApp.tsx').then(m => ({ default: m.TerminalApp })));
