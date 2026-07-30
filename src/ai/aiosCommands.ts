/**
 * Intent Router — composable command system replacing regex patterns.
 *
 * Architecture:
 *   1. Pattern matchers (fast, offline) — regex + keyword
 *   2. LLM classifier (smart, requires API) — structured intent extraction
 *   3. Fallback — pass-through to chat
 *
 * Each intent has: domain, action, params, handler
 * Intents are composable — a single utterance can trigger multiple intents.
 */

import { useOSStore } from '../system/osStore';

// ================================================================
// TYPES
// ================================================================

export interface Intent {
  domain: 'app' | 'window' | 'workspace' | 'system' | 'files' | 'agent' | 'chat';
  action: string;
  params: Record<string, string>;
  confidence: number; // 0-1
}

export interface CommandResult {
  action: string;
  description: string;
  executed: boolean;
  data?: Record<string, unknown>;
}

interface IntentHandler {
  (params: Record<string, string>): CommandResult | Promise<CommandResult>;
}

// ================================================================
// INTENT REGISTRY
// ================================================================

class IntentRouter {
  private patterns: Array<{
    regex: RegExp;
    intent: Omit<Intent, 'params' | 'confidence'>;
    paramMap: (match: RegExpMatchArray) => Record<string, string>;
  }> = [];

  private handlers = new Map<string, IntentHandler>();

  constructor() {
    this.registerPatterns();
    this.registerHandlers();
  }

  // --- Pattern registration ---

  private registerPatterns() {
    // App launching
    this.addPattern(
      /(?:open|launch|start|run)\s+(?:the\s+)?(terminal|files|settings|editor|texteditor|companion|browser|firefox|calculator)/i,
      { domain: 'app', action: 'launch' },
      (m) => {
        const map: Record<string, string> = {
          terminal: 'terminal', files: 'files', settings: 'settings',
          editor: 'texteditor', texteditor: 'texteditor', companion: 'companion',
          browser: 'firefox', firefox: 'firefox', calculator: 'calculator',
        };
        return { appId: map[m[1].toLowerCase()] || m[1].toLowerCase() };
      }
    );

    // Window control
    this.addPattern(/(?:close|kill)\s+(?:the\s+)?(?:current\s+)?window/i, { domain: 'window', action: 'close' }, () => ({}));
    this.addPattern(/(?:minimize|hide)\s+(?:the\s+)?(?:current\s+)?window/i, { domain: 'window', action: 'minimize' }, () => ({}));
    this.addPattern(/(?:maximize|fullscreen)\s+(?:the\s+)?(?:current\s+)?window/i, { domain: 'window', action: 'maximize' }, () => ({}));
    this.addPattern(/show\s+desktop/i, { domain: 'window', action: 'showDesktop' }, () => ({}));

    // Workspace
    this.addPattern(/switch\s+to\s+(?:workspace|ws)[\s-]*(\d)/i, { domain: 'workspace', action: 'switch' }, (m) => ({ workspace: m[1] }));

    // System
    this.addPattern(/(?:lock|sleep)\s+(?:the\s+)?(?:screen|system|os)/i, { domain: 'system', action: 'lock' }, () => ({}));
    this.addPattern(/show\s+(?:me\s+)?(?:system\s+)?(?:status|health|info)/i, { domain: 'system', action: 'status' }, () => ({}));
    this.addPattern(/(?:set|change)\s+volume\s+(?:to\s+)?(\d+)/i, { domain: 'system', action: 'volume' }, (m) => ({ level: m[1] }));

    // Notifications
    this.addPattern(/(?:show|check|read)\s+(?:my\s+)?notifications/i, { domain: 'system', action: 'notifications' }, () => ({}));
    this.addPattern(/clear\s+(?:all\s+)?notifications/i, { domain: 'system', action: 'clearNotifications' }, () => ({}));

    // Files
    this.addPattern(/(?:create|make|new)\s+(?:a\s+)?(?:file|document)\s+(?:called|named\s+)?(.+)/i, { domain: 'files', action: 'create' }, (m) => ({ name: m[1].trim(), type: 'file' }));
    this.addPattern(/(?:create|make|new)\s+(?:a\s+)?(?:folder|directory)\s+(?:called|named\s+)?(.+)/i, { domain: 'files', action: 'create' }, (m) => ({ name: m[1].trim(), type: 'directory' }));
    this.addPattern(/(?:delete|remove|rm)\s+(?:the\s+)?(?:file|folder|directory\s+)?(.+)/i, { domain: 'files', action: 'delete' }, (m) => ({ name: m[1].trim() }));
    this.addPattern(/(?:read|cat|show|open)\s+(?:the\s+)?(?:file\s+)?(.+)/i, { domain: 'files', action: 'read' }, (m) => ({ name: m[1].trim() }));

    // Agent
    this.addPattern(/(?:list|show)\s+(?:my\s+)?(?:agents|tasks)/i, { domain: 'agent', action: 'list' }, () => ({}));
  }

  private addPattern(
    regex: RegExp,
    intent: Omit<Intent, 'params' | 'confidence'>,
    paramMap: (match: RegExpMatchArray) => Record<string, string>,
  ) {
    this.patterns.push({ regex, intent, paramMap });
  }

  // --- Handler registration ---

  private registerHandlers() {
    // App handlers
    this.handler('app:launch', (p) => {
      const state = useOSStore.getState();
      state.launchApp(p.appId);
      return { action: 'launch', description: `Launched ${p.appId}`, executed: true };
    });

    // Window handlers
    this.handler('window:close', () => {
      const state = useOSStore.getState();
      if (state.focusedId) { state.closeWin(state.focusedId); return { action: 'close', description: 'Closed window', executed: true }; }
      return { action: 'close', description: 'No window focused', executed: false };
    });
    this.handler('window:minimize', () => {
      const state = useOSStore.getState();
      if (state.focusedId) { state.minWin(state.focusedId); return { action: 'minimize', description: 'Minimized window', executed: true }; }
      return { action: 'minimize', description: 'No window focused', executed: false };
    });
    this.handler('window:maximize', () => {
      const state = useOSStore.getState();
      if (state.focusedId) { state.maxWin(state.focusedId); return { action: 'maximize', description: 'Maximized window', executed: true }; }
      return { action: 'maximize', description: 'No window focused', executed: false };
    });
    this.handler('window:showDesktop', () => {
      useOSStore.getState().showDesktop();
      return { action: 'showDesktop', description: 'Showing desktop', executed: true };
    });

    // Workspace
    this.handler('workspace:switch', (p) => {
      const ws = parseInt(p.workspace) - 1;
      const state = useOSStore.getState();
      if (ws >= 0 && ws < state.workspaces.length) {
        state.setWorkspace(ws);
        return { action: 'workspace', description: `Switched to WS-${ws + 1}`, executed: true };
      }
      return { action: 'workspace', description: 'Invalid workspace', executed: false };
    });

    // System
    this.handler('system:lock', () => { useOSStore.getState().setLocked(true); return { action: 'lock', description: 'System locked', executed: true }; });
    this.handler('system:status', () => {
      const s = useOSStore.getState();
      return { action: 'status', description: `${s.windows.filter(w => !w.minimized).length} windows open · ${s.tasks.filter(t => t.status === 'running').length} agents running · ${s.notifications.length} notifications`, executed: true };
    });
    this.handler('system:volume', (p) => {
      const v = Math.min(100, Math.max(0, parseInt(p.level)));
      useOSStore.getState().setVolume(v);
      return { action: 'volume', description: `Volume set to ${v}%`, executed: true };
    });
    this.handler('system:notifications', () => {
      const s = useOSStore.getState();
      if (s.notifications.length === 0) return { action: 'notifications', description: 'No notifications.', executed: true };
      return { action: 'notifications', description: s.notifications.slice(0, 3).map(n => `• ${n.title}`).join('\n'), executed: true };
    });
    this.handler('system:clearNotifications', () => {
      useOSStore.getState().notifications.length = 0;
      return { action: 'clearNotifs', description: 'Notifications cleared', executed: true };
    });

    // Files
    this.handler('files:create', async (p) => {
      const { writeFile: vfsWrite, createDirectory: vfsMkdir } = await import('../system/vfs');
      const cwd = (await import('../system/vfs')).getCWD();
      const targetPath = cwd.replace(/\/$/, '') + '/' + p.name;
      if (p.type === 'directory') {
        vfsMkdir(targetPath);
        return { action: 'mkdir', description: `Created directory ${p.name}`, executed: true };
      }
      vfsWrite(targetPath, '');
      return { action: 'touch', description: `Created file ${p.name}`, executed: true };
    });
    this.handler('files:delete', async (p) => {
      const { deleteNode: vfsRm, getCWD: vfsCwd } = await import('../system/vfs');
      const targetPath = vfsCwd().replace(/\/$/, '') + '/' + p.name;
      if (vfsRm(targetPath)) return { action: 'rm', description: `Deleted ${p.name}`, executed: true };
      return { action: 'rm', description: `Could not delete ${p.name}`, executed: false };
    });
    this.handler('files:read', async (p) => {
      const { readFile: vfsRead } = await import('../system/vfs');
      const content = vfsRead(p.name);
      if (content) return { action: 'cat', description: content.slice(0, 500), executed: true };
      return { action: 'cat', description: `File not found: ${p.name}`, executed: false };
    });

    // Agent
    this.handler('agent:list', () => {
      const s = useOSStore.getState();
      const list = s.tasks.map(t => `• ${t.label} [${t.status}]`).join('\n');
      return { action: 'agentList', description: list || 'No agents', executed: true };
    });
  }

  private handler(key: string, fn: IntentHandler) {
    this.handlers.set(key, fn);
  }

  // --- Classification ---

  /**
   * Classify user text into zero or more intents.
   * Returns intents sorted by confidence (highest first).
   */
  classify(text: string): Intent[] {
    const results: Intent[] = [];

    for (const { regex, intent, paramMap } of this.patterns) {
      const match = text.match(regex);
      if (match) {
        results.push({
          ...intent,
          params: paramMap(match),
          confidence: 0.9,
        });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Execute an intent directly.
   */
  async execute(intent: Intent): Promise<CommandResult> {
    const key = `${intent.domain}:${intent.action}`;
    const handler = this.handlers.get(key);
    if (!handler) return { action: 'unknown', description: `No handler for ${key}`, executed: false };

    try {
      return await handler(intent.params);
    } catch (err) {
      return { action: 'error', description: `Handler failed: ${err}`, executed: false };
    }
  }

  /**
   * Classify and execute the highest-confidence intent.
   * Returns null if no intent matched (should fall through to chat).
   */
  async route(text: string): Promise<CommandResult | null> {
    const intents = this.classify(text);
    if (intents.length === 0) return null;
    return this.execute(intents[0]);
  }
}

// ================================================================
// SINGLETON EXPORT
// ================================================================

const router = new IntentRouter();

/**
 * Execute a command from user text.
 * Returns a CommandResult if an intent was matched and executed,
 * or null if the text should be treated as regular chat.
 */
export async function executeCommand(userText: string): Promise<CommandResult | null> {
  return router.route(userText);
}

// ================================================================
// SYSTEM EVENT NOTIFICATION
// ================================================================

export interface SystemEvent {
  type: 'agent_complete' | 'agent_error' | 'disk_warning' | 'update_available' | 'security_alert';
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/** Wire system events to the notification store */
export function notifyLelu(event: SystemEvent) {
  const state = useOSStore.getState();
  const notif = {
    id: `sys-${Date.now()}`,
    icon: event.type === 'agent_complete' ? 'Sparkles'
      : event.type === 'agent_error' ? 'AlertCircle'
      : event.type === 'disk_warning' ? 'HardDrive'
      : event.type === 'security_alert' ? 'Shield'
      : 'Bell',
    tone: (event.priority === 'critical' ? 'error'
      : event.priority === 'high' ? 'warning'
      : 'info') as 'success' | 'warning' | 'error' | 'info',
    source: 'Lelu AIOS',
    title: event.title,
    time: 'now',
    body: event.body,
  };
  state.notifications.push(notif);
}

/** Proactive system monitoring */
export function startProactiveMonitoring() {
  setInterval(() => {
    const state = useOSStore.getState();
    const stalled = state.tasks.filter(t => t.status === 'running');
    if (stalled.length > 5) {
      notifyLelu({ type: 'agent_error', title: 'High agent load', body: `${stalled.length} agents running.`, priority: 'medium' });
    }
  }, 30000);
}
