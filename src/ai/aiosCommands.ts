/**
 * AIOS Command System — Lelu's bridge between natural language and OS actions.
 *
 * When Lelu says "open terminal" or "create a file", this system routes
 * her intent to actual OS functions. This is what makes Lelu an AIOS
 * rather than just a chatbot sidebar.
 */

import { useOSStore } from '../system/osStore';

// ================================================================
// COMMAND PATTERNS — Natural language → OS action
// ================================================================

interface CommandPattern {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, state: ReturnType<typeof useOSStore.getState>) => CommandResult;
}

interface CommandResult {
  action: string;
  description: string;
  executed: boolean;
  data?: Record<string, unknown>;
}

const COMMANDS: CommandPattern[] = [
  // === APP LAUNCHING ===
  {
    pattern: /(?:open|launch|start|run)\s+(?:the\s+)?(terminal|files|settings|editor|texteditor|companion|browser|firefox|calculator)/i,
    handler: (m, state) => {
      const appMap: Record<string, string> = {
        terminal: 'terminal', files: 'files', settings: 'settings',
        editor: 'texteditor', texteditor: 'texteditor',
        companion: 'companion', browser: 'firefox', firefox: 'firefox',
        calculator: 'calculator',
      };
      const appId = appMap[m[1].toLowerCase()];
      if (appId) {
        state.launchApp(appId);
        return { action: 'launch', description: `Launched ${m[1]}`, executed: true };
      }
      return { action: 'launch', description: `App not found: ${m[1]}`, executed: false };
    },
  },

  // === WINDOW CONTROL ===
  {
    pattern: /(?:close|kill)\s+(?:the\s+)?(?:current\s+)?window/i,
    handler: (_m, state) => {
      if (state.focusedId) {
        state.closeWin(state.focusedId);
        return { action: 'close', description: 'Closed focused window', executed: true };
      }
      return { action: 'close', description: 'No window focused', executed: false };
    },
  },
  {
    pattern: /(?:minimize|hide)\s+(?:the\s+)?(?:current\s+)?window/i,
    handler: (_m, state) => {
      if (state.focusedId) {
        state.minWin(state.focusedId);
        return { action: 'minimize', description: 'Minimized window', executed: true };
      }
      return { action: 'minimize', description: 'No window focused', executed: false };
    },
  },
  {
    pattern: /(?:maximize|fullscreen)\s+(?:the\s+)?(?:current\s+)?window/i,
    handler: (_m, state) => {
      if (state.focusedId) {
        state.maxWin(state.focusedId);
        return { action: 'maximize', description: 'Maximized window', executed: true };
      }
      return { action: 'maximize', description: 'No window focused', executed: false };
    },
  },
  {
    pattern: /show\s+desktop/i,
    handler: (_m, state) => {
      state.showDesktop();
      return { action: 'showDesktop', description: 'Showing desktop', executed: true };
    },
  },

  // === WORKSPACE ===
  {
    pattern: /switch\s+to\s+(?:workspace|ws)[\s-]*(\d)/i,
    handler: (m, state) => {
      const ws = parseInt(m[1]) - 1;
      if (ws >= 0 && ws < state.workspaces.length) {
        state.setWorkspace(ws);
        return { action: 'workspace', description: `Switched to workspace ${ws + 1}`, executed: true };
      }
      return { action: 'workspace', description: 'Invalid workspace', executed: false };
    },
  },

  // === SYSTEM ===
  {
    pattern: /(?:lock|sleep)\s+(?:the\s+)?(?:screen|system|os)/i,
    handler: (_m, state) => {
      state.setLocked(true);
      return { action: 'lock', description: 'System locked', executed: true };
    },
  },
  {
    pattern: /show\s+(?:me\s+)?(?:system\s+)?(?:status|health|info)/i,
    handler: (_m, state) => {
      const openApps = state.windows.filter(w => !w.minimized).map(w => w.title);
      const runningAgents = state.tasks.filter(t => t.status === 'running');
      return {
        action: 'status',
        description: `System status: ${openApps.length} windows open, ${runningAgents.length} agents running, ${state.notifications.length} notifications pending`,
        executed: true,
        data: { openApps, runningAgents, notifications: state.notifications.length },
      };
    },
  },

  // === NOTIFICATIONS ===
  {
    pattern: /(?:show|check|read)\s+(?:my\s+)?notifications/i,
    handler: (_m, state) => {
      if (state.notifications.length === 0) {
        return { action: 'notifications', description: 'No new notifications.', executed: true };
      }
      const list = state.notifications.slice(0, 3).map(n => `• ${n.title}: ${n.body}`).join('\n');
      return { action: 'notifications', description: list, executed: true };
    },
  },
  {
    pattern: /clear\s+(?:all\s+)?notifications/i,
    handler: (_m, state) => {
      state.notifications.length = 0;
      return { action: 'clearNotifs', description: 'Notifications cleared.', executed: true };
    },
  },

  // === SETTINGS ===
  {
    pattern: /(?:set|change)\s+volume\s+(?:to\s+)?(\d+)/i,
    handler: (m, state) => {
      const vol = Math.min(100, Math.max(0, parseInt(m[1])));
      state.setVolume(vol);
      return { action: 'volume', description: `Volume set to ${vol}%`, executed: true };
    },
  },
];

// ================================================================
// COMMAND EXECUTOR
// ================================================================

export function executeCommand(userText: string): CommandResult | null {
  const state = useOSStore.getState();

  for (const cmd of COMMANDS) {
    const match = userText.match(cmd.pattern);
    if (match) {
      try {
        const result = cmd.handler(match, state);
        return result;
      } catch (err) {
        console.warn('Command execution failed:', err);
        return { action: 'error', description: 'Command failed to execute.', executed: false };
      }
    }
  }

  return null; // No command matched — treat as regular chat
}

// ================================================================
// SYSTEM EVENT → Lelu Notification
// ================================================================

export interface SystemEvent {
  type: 'agent_complete' | 'agent_error' | 'disk_warning' | 'update_available' | 'security_alert';
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export function notifyLelu(event: SystemEvent) {
  // TODO: wire into actual notification system
  void event;
}

// ================================================================
// PROACTIVE MONITORING
// ================================================================

export function startProactiveMonitoring() {
  // Check system health every 30 seconds
  setInterval(() => {
    const state = useOSStore.getState();

    // Check for stalled agents
    const stalled = state.tasks.filter(t => t.status === 'running');
    if (stalled.length > 5) {
      notifyLelu({
        type: 'agent_error',
        title: 'High agent load',
        body: `${stalled.length} agents running. Consider pausing some.`,
        priority: 'medium',
      });
    }

    // Memory pressure warning (simulated)
    const totalWindows = state.windows.length;
    if (totalWindows > 8) {
      notifyLelu({
        type: 'disk_warning',
        title: 'Many windows open',
        body: `${totalWindows} windows active. Memory pressure increasing.`,
        priority: 'low',
      });
    }
  }, 30000);
}
