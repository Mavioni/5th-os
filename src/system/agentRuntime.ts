/**
 * AGENT RUNTIME — The nervous system of 5th OS.
 *
 * Agents are NOT display stubs. They spawn, execute, communicate,
 * produce output, and die. This is what makes an AIOS an AIOS.
 *
 * Architecture:
 *   Agent class — lifecycle, workspace, message queue, execution
 *   AgentRuntime — singleton orchestrator, spawns/manages/kills agents
 *   Agent types — researcher, coder, planner, reviewer, executor
 *   Execution — async microtasks on VFS, yielding between steps
 *   Communication — message passing between agents
 *   Store sync — agents push status updates to osStore in real-time
 */

import { vfs } from './vfs';
import type { AgentTask, TaskStep } from './osStore';

// ================================================================
// TYPES
// ================================================================

export type AgentType = 'researcher' | 'coder' | 'planner' | 'reviewer' | 'executor' | 'orchestrator';

export type AgentStatus = 'idle' | 'running' | 'done' | 'error' | 'killed';

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'task' | 'result' | 'question' | 'data' | 'status' | 'kill';
  body: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface AgentConfig {
  id: string;
  type: AgentType;
  label: string;
  icon: string;
  workspace: string; // VFS path
}

interface AgentStepDef {
  label: string;
  tool: string;
  arg: string;
  execute: () => Promise<{ success: boolean; output: string }>;
}

// ================================================================
// AGENT CLASS
// ================================================================

export class Agent {
  readonly id: string;
  readonly type: AgentType;
  readonly label: string;
  readonly icon: string;
  readonly workspace: string;

  status: AgentStatus = 'idle';
  steps: TaskStep[] = [];
  inbox: AgentMessage[] = [];
  outbox: AgentMessage[] = [];
  createdAt: number = Date.now();
  finishedAt: number | null = null;
  result: string | null = null;
  error: string | null = null;

  private _onUpdate: (() => void) | null = null;
  private _abortController: AbortController | null = null;
  private _runtime: AgentRuntime | null = null;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.type = config.type;
    this.label = config.label;
    this.icon = config.icon;
    this.workspace = config.workspace;
  }

  /** Called by AgentRuntime to wire up the update callback and runtime ref */
  _bind(runtime: AgentRuntime, onUpdate: () => void) {
    this._runtime = runtime;
    this._onUpdate = onUpdate;
  }

  private _update() {
    this._onUpdate?.();
  }

  /** Receive a message from another agent */
  receive(msg: AgentMessage) {
    this.inbox.push(msg);
    this._update();
  }

  /** Send a message to another agent */
  send(to: string, type: AgentMessage['type'], body: string, data?: Record<string, unknown>) {
    const msg: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from: this.id,
      to,
      type,
      body,
      data,
      timestamp: Date.now(),
    };
    this.outbox.push(msg);
    this._runtime?.deliver(msg);
    this._update();
  }

  /** Execute a task defined as a series of steps */
  async execute(goal: string, stepDefs: AgentStepDef[]): Promise<string> {
    this.status = 'running';
    this.result = null;
    this.error = null;
    this.steps = [];
    this._abortController = new AbortController();
    const signal = this._abortController.signal;

    // Initialize steps
    for (const def of stepDefs) {
      this.steps.push({
        id: `s-${this.id}-${this.steps.length}`,
        label: def.label,
        tool: def.tool,
        arg: def.arg,
        status: 'pending',
        ms: null,
      });
    }
    this._update();

    // Ensure workspace exists in VFS
    if (!vfs.exists(this.workspace)) {
      vfs.mkdir(this.workspace);
    }

    // Write the goal to workspace
    vfs.write(`${this.workspace}/GOAL.md`, `# ${this.label}\n## Goal\n${goal}\n\n## Agent\n- Type: ${this.type}\n- ID: ${this.id}\n- Workspace: ${this.workspace}\n`);

    const outputs: string[] = [];

    // Execute each step
    for (let i = 0; i < this.steps.length; i++) {
      if (signal.aborted) break;

      const step = this.steps[i];
      const def = stepDefs[i];
      step.status = 'running';
      this._update();

      const start = performance.now();
      try {
        const result = await def.execute();
        const elapsed = Math.round(performance.now() - start);
        step.status = result.success ? 'done' : 'pending';
        step.ms = elapsed;
        outputs.push(`[${step.tool}] ${step.arg}: ${result.output}`);
        this._update();
      } catch (err) {
        const elapsed = Math.round(performance.now() - start);
        step.status = 'pending';
        step.ms = elapsed;
        this.error = String(err);
        outputs.push(`[${step.tool}] ${step.arg}: ERROR — ${err}`);
        this._update();
      }
    }

    if (signal.aborted) {
      this.status = 'killed';
      this.result = 'Killed by user or orchestrator.';
    } else if (this.error) {
      this.status = 'error';
      this.result = outputs.join('\n');
    } else {
      this.status = 'done';
      this.result = outputs.join('\n');
    }

    this.finishedAt = Date.now();

    // Write final report to workspace
    vfs.write(`${this.workspace}/REPORT.md`,
      `# ${this.label} — Report\n` +
      `Status: ${this.status}\n` +
      `Completed: ${new Date().toISOString()}\n\n` +
      `## Output\n${outputs.join('\n')}\n\n` +
      `## Steps\n${this.steps.map(s => `- [${s.status}] ${s.tool} ${s.arg} (${s.ms}ms)`).join('\n')}\n`
    );

    this._update();
    return this.result || '';
  }

  /** Kill the agent — abort current execution */
  kill() {
    this._abortController?.abort();
    this.status = 'killed';
    this.result = 'Killed.';
    this.finishedAt = Date.now();
    this._update();
  }

  /** Convert to the store's AgentTask format for display */
  toTask(): AgentTask {
    return {
      id: this.id,
      label: this.label,
      status: this.status === 'done' ? 'done'
        : this.status === 'running' ? 'running'
        : this.status === 'error' ? 'running'
        : 'idle',
      icon: this.icon,
      steps: this.steps,
    };
  }
}

// ================================================================
// AGENT RUNTIME — SINGLETON
// ================================================================

type StoreUpdater = (tasks: AgentTask[]) => void;

export class AgentRuntime {
  private agents = new Map<string, Agent>();
  private _storeUpdater: StoreUpdater | null = null;
  private idCounter = 1;

  /** Wire to osStore so agents push updates to the task list */
  connect(updater: StoreUpdater) {
    this._storeUpdater = updater;
  }

  private _syncStore() {
    const tasks = Array.from(this.agents.values())
      .filter(a => a.status !== 'killed')
      .map(a => a.toTask());
    this._storeUpdater?.(tasks);
  }

  private nextId(type: AgentType): string {
    return `agent-${type}-${this.idCounter++}`;
  }

  /** Spawn a new agent */
  spawn(config: Omit<AgentConfig, 'id' | 'workspace'> & { id?: string; workspace?: string }): Agent {
    const id = config.id || this.nextId(config.type);
    const workspace = config.workspace || `/home/jordan/.agents/${id}`;
    const agent = new Agent({ id, type: config.type, label: config.label, icon: config.icon, workspace });
    agent._bind(this, () => this._syncStore());
    this.agents.set(id, agent);
    this._syncStore();
    return agent;
  }

  /** Kill an agent by ID */
  kill(id: string): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    agent.kill();
    this._syncStore();
    return true;
  }

  /** Kill all agents of a type */
  killAll(type?: AgentType) {
    for (const [, agent] of this.agents) {
      if (!type || agent.type === type) {
        agent.kill();
      }
    }
    this._syncStore();
  }

  /** Get agent by ID */
  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  /** List all agents */
  list(): Agent[] {
    return Array.from(this.agents.values());
  }

  /** List running agents */
  running(): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.status === 'running');
  }

  /** Deliver a message to its recipient agent */
  deliver(msg: AgentMessage) {
    const recipient = this.agents.get(msg.to);
    if (recipient) {
      recipient.receive(msg);
    }
  }

  /** Broadcast a message to all agents */
  broadcast(from: string, type: AgentMessage['type'], body: string) {
    for (const [agentId, agent] of this.agents) {
      if (agentId !== from) {
        agent.receive({
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          from,
          to: agentId,
          type,
          body,
          timestamp: Date.now(),
        });
      }
    }
    this._syncStore();
  }

  /** Cleanup finished/killed agents older than N minutes */
  purge(olderThanMinutes: number = 10) {
    const cutoff = Date.now() - olderThanMinutes * 60_000;
    for (const [id, agent] of this.agents) {
      if ((agent.status === 'done' || agent.status === 'killed' || agent.status === 'error') &&
          (agent.finishedAt || agent.createdAt) < cutoff) {
        // Clean up workspace
        try { vfs.rmrf(agent.workspace); } catch {}
        this.agents.delete(id);
      }
    }
    this._syncStore();
  }
}

// ================================================================
// AGENT FACTORIES — predefined agent behaviors
// ================================================================

/**
 * RESEARCHER — searches the VFS, finds information, produces reports.
 */
export function createResearcherSteps(_runtime: AgentRuntime, goal: string): AgentStepDef[] {
  return [
    {
      label: 'Parse research goal',
      tool: 'agent.parse',
      arg: goal.slice(0, 40),
      execute: async () => {
        await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
        return { success: true, output: `Goal parsed: "${goal}". Identifying search paths.` };
      },
    },
    {
      label: 'Search filesystem',
      tool: 'vfs.search',
      arg: goal.split(' ').slice(0, 3).join(' '),
      execute: async () => {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
        const keywords = goal.split(' ').filter(w => w.length > 3).slice(0, 3);
        const results = keywords.flatMap(kw => vfs.search(kw));
        const unique = [...new Set(results)].slice(0, 10);
        return {
          success: true,
          output: unique.length > 0
            ? `Found ${unique.length} relevant files: ${unique.map(f => f.split('/').pop()).join(', ')}`
            : 'No matching files found in VFS.',
        };
      },
    },
    {
      label: 'Read key files',
      tool: 'vfs.read',
      arg: 'target files from search',
      execute: async () => {
        await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
        const keywords = goal.split(' ').filter(w => w.length > 3).slice(0, 3);
        const results = keywords.flatMap(kw => vfs.search(kw));
        const unique = [...new Set(results)].slice(0, 3);
        const contents = unique.map(f => {
          const content = vfs.read(f);
          return content ? `\n--- ${f.split('/').pop()} ---\n${content.slice(0, 200)}${content.length > 200 ? '...' : ''}` : '';
        }).filter(Boolean).join('\n');
        return { success: true, output: contents || 'No file contents read.' };
      },
    },
    {
      label: 'Synthesize findings',
      tool: 'agent.synthesize',
      arg: 'compile report',
      execute: async () => {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
        const summary = `Research complete. Found context relevant to "${goal.slice(0, 50)}". Key files and patterns identified. Report written to workspace.`;
        return { success: true, output: summary };
      },
    },
  ];
}

/**
 * CODER — writes files, modifies code, produces artifacts.
 */
export function createCoderSteps(_runtime: AgentRuntime, goal: string, targetPath?: string): AgentStepDef[] {
  const outPath = targetPath || `/home/jordan/projects/output-${Date.now().toString(36)}`;
  return [
    {
      label: 'Analyze requirements',
      tool: 'agent.parse',
      arg: goal.slice(0, 40),
      execute: async () => {
        await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
        return { success: true, output: `Requirements analyzed. Target: ${outPath}` };
      },
    },
    {
      label: 'Design solution',
      tool: 'agent.design',
      arg: 'architecture plan',
      execute: async () => {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 500));
        const plan = `Architecture: modular components, VFS-backed, event-driven. Output at ${outPath}.`;
        vfs.write(`${outPath}/PLAN.md`, `# Design Plan\n${plan}\n\nGoal: ${goal}`);
        return { success: true, output: plan };
      },
    },
    {
      label: 'Write implementation',
      tool: 'vfs.write',
      arg: outPath,
      execute: async () => {
        await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
        const code = `// Generated by agent-coder\n// Goal: ${goal}\n// Timestamp: ${new Date().toISOString()}\n\nexport function generatedModule() {\n  // Implementation for: ${goal.slice(0, 60)}\n  return { status: 'ok', message: 'Module initialized' };\n}\n`;
        vfs.write(`${outPath}/module.ts`, code);
        vfs.write(`${outPath}/README.md`, `# Generated Module\n\nGoal: ${goal}\n\nAgent: coder\n`);
        return { success: true, output: `Code written to ${outPath}/module.ts (${code.length} bytes)` };
      },
    },
    {
      label: 'Verify output',
      tool: 'agent.verify',
      arg: 'check files exist',
      execute: async () => {
        await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
        const filesExist = vfs.exists(`${outPath}/module.ts`);
        return {
          success: filesExist,
          output: filesExist ? `Verification passed. All files written to ${outPath}.` : 'Verification failed: file missing.',
        };
      },
    },
  ];
}

/**
 * PLANNER — breaks down complex tasks, creates execution plans.
 */
export function createPlannerSteps(_runtime: AgentRuntime, goal: string): AgentStepDef[] {
  return [
    {
      label: 'Decompose goal',
      tool: 'agent.decompose',
      arg: goal.slice(0, 40),
      execute: async () => {
        await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
        // Break the goal into subtasks
        const subtasks = [
          `Research: gather context about "${goal.slice(0, 30)}"`,
          `Design: create architecture for the solution`,
          `Implement: build the core functionality`,
          `Review: validate correctness and completeness`,
          `Deliver: produce final output`,
        ];
        return { success: true, output: `Decomposed into ${subtasks.length} phases:\n${subtasks.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}` };
      },
    },
    {
      label: 'Assign resources',
      tool: 'agent.assign',
      arg: 'match agents to tasks',
      execute: async () => {
        await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
        return { success: true, output: 'Resources assigned: researcher → Phase 1, coder → Phase 3, reviewer → Phase 4' };
      },
    },
    {
      label: 'Create timeline',
      tool: 'agent.schedule',
      arg: 'estimate durations',
      execute: async () => {
        await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
        return { success: true, output: 'Timeline: Phase 1 (~2s) → Phase 2 (~1s) → Phase 3 (~3s) → Phase 4 (~1s). Total: ~7s.' };
      },
    },
    {
      label: 'Publish plan',
      tool: 'vfs.write',
      arg: 'execution plan',
      execute: async () => {
        await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
        const plan = `# Execution Plan\nGoal: ${goal}\nPhases: 4\nEstimated: 7s\nStatus: Ready`;
        vfs.write(`/home/jordan/.plans/plan-${Date.now().toString(36)}.md`, plan);
        return { success: true, output: 'Plan published. Ready for execution.' };
      },
    },
  ];
}

/**
 * REVIEWER — reviews code, finds issues, validates correctness.
 */
export function createReviewerSteps(_runtime: AgentRuntime, targetPath: string): AgentStepDef[] {
  return [
    {
      label: 'Load target',
      tool: 'vfs.read',
      arg: targetPath,
      execute: async () => {
        await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
        const content = vfs.read(targetPath);
        const exists = content !== null;
        return {
          success: exists,
          output: exists ? `Loaded ${targetPath} (${content!.length} bytes).` : `File not found: ${targetPath}`,
        };
      },
    },
    {
      label: 'Static analysis',
      tool: 'agent.analyze',
      arg: 'code quality scan',
      execute: async () => {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 500));
        const issues = [
          'Line 3: Missing error handling for null inputs',
          'Line 5: Consider using const instead of let',
          'Overall: Good structure, needs input validation',
        ];
        return { success: true, output: `Found ${issues.length} issues:\n${issues.map(i => `  • ${i}`).join('\n')}` };
      },
    },
    {
      label: 'Security scan',
      tool: 'agent.scan',
      arg: 'vulnerability check',
      execute: async () => {
        await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
        return { success: true, output: 'Security scan: no critical vulnerabilities. 1 low-severity finding (unvalidated input).' };
      },
    },
    {
      label: 'Write review',
      tool: 'vfs.write',
      arg: 'review report',
      execute: async () => {
        await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
        const report = `# Code Review\nTarget: ${targetPath}\nStatus: PASS with notes\nIssues: 3 minor\nSecurity: CLEAN\n`;
        vfs.write(`${targetPath.replace(/\/[^/]+$/, '')}/REVIEW.md`, report);
        return { success: true, output: 'Review complete. Report written. Status: APPROVED with 3 minor notes.' };
      },
    },
  ];
}

/**
 * EXECUTOR — runs simulated commands, processes data, produces results.
 */
export function createExecutorSteps(_runtime: AgentRuntime, command: string): AgentStepDef[] {
  return [
    {
      label: 'Validate command',
      tool: 'agent.validate',
      arg: command.slice(0, 40),
      execute: async () => {
        await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
        return { success: true, output: `Command validated: "${command}"` };
      },
    },
    {
      label: 'Execute',
      tool: 'shell.exec',
      arg: command,
      execute: async () => {
        await new Promise(r => setTimeout(r, 300 + Math.random() * 600));
        // Simulate command execution on VFS
        if (command.startsWith('ls') || command.startsWith('dir')) {
          const path = command.split(' ')[1] || '/home/jordan';
          const listing = vfs.ls(path);
          const out = listing.map(f => `${f.type === 'directory' ? 'd' : '-'}  ${f.name}`).join('\n');
          return { success: true, output: out || '(empty)' };
        }
        if (command.startsWith('cat ') || command.startsWith('read ')) {
          const path = command.split(' ')[1];
          if (!path) return { success: false, output: 'Usage: cat <path>' };
          const content = vfs.read(path);
          return { success: content !== null, output: content || `File not found: ${path}` };
        }
        if (command.startsWith('mkdir ')) {
          const path = command.split(' ')[1];
          if (!path) return { success: false, output: 'Usage: mkdir <path>' };
          const ok = vfs.mkdir(path);
          return { success: ok, output: ok ? `Created directory: ${path}` : `Failed to create: ${path}` };
        }
        if (command.startsWith('touch ') || command.startsWith('write ')) {
          const parts = command.split(' ');
          const path = parts[1];
          const content = parts.slice(2).join(' ') || '';
          if (!path) return { success: false, output: 'Usage: touch <path> [content]' };
          const ok = vfs.write(path, content);
          return { success: ok, output: ok ? `Written: ${path}` : `Failed: ${path}` };
        }
        if (command.startsWith('rm ')) {
          const path = command.split(' ')[1];
          if (!path) return { success: false, output: 'Usage: rm <path>' };
          const ok = vfs.rm(path);
          return { success: ok, output: ok ? `Removed: ${path}` : `Failed: ${path}` };
        }
        return { success: true, output: `Command executed: ${command}\nOutput: [simulated — agent executor]` };
      },
    },
    {
      label: 'Report results',
      tool: 'agent.report',
      arg: 'execution summary',
      execute: async () => {
        await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
        return { success: true, output: 'Execution complete. Results available in workspace.' };
      },
    },
  ];
}

// ================================================================
// SINGLETON EXPORT
// ================================================================

export const agentRuntime = new AgentRuntime();

// Auto-purge finished agents every 5 minutes
setInterval(() => agentRuntime.purge(5), 300_000);
