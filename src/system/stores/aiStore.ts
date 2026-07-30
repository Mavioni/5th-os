/**
 * AI Store — domain store for Lelu AI state (chat, tasks, thinking).
 */
import { create } from 'zustand';

export interface ChatMessage {
  from: 'lelu' | 'user';
  t: string;
  text: string;
  system?: string;
  mono?: boolean;
}

export interface TaskStep {
  id: string;
  label: string;
  tool: string;
  arg: string;
  status: 'done' | 'running' | 'pending';
  ms?: number | null;
}

export interface AgentTask {
  id: string;
  label: string;
  status: 'running' | 'done' | 'idle';
  icon: string;
  steps: TaskStep[];
}

interface AIStore {
  chatLog: ChatMessage[];
  leluThinking: boolean;
  tasks: AgentTask[];
  sandboxStatus: string;
  leluTalking: boolean;

  setChatLog: (v: ChatMessage[]) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setLeluThinking: (v: boolean) => void;
  setTasks: (v: AgentTask[]) => void;
  setSandboxStatus: (v: string) => void;
  setLeluTalking: (v: boolean) => void;
}

export const useAIStore = create<AIStore>((set) => ({
  chatLog: [
    { from: 'lelu', t: '14:21', system: 'BOOT · NEMO CLAW', text: 'Multi-pass. Lelu online. Sandbox attach, good.' },
    { from: 'lelu', t: '14:21', text: 'I read release-notes.md. You fix panel flicker on 120Hz. Want me summarize?' },
    { from: 'user', t: '14:22', text: 'yes, two lines please' },
    { from: 'lelu', t: '14:22', text: 'Panel flicker — clock applet only, #1242. Fix on drm-fb pageflip. And menu.xml → menu.toml migration rolled in 1.0.2.' },
  ],
  leluThinking: false,
  tasks: [
    { id: 't1', label: "Summarize today's work", status: 'running', icon: 'Sparkles', steps: [
      { id: 's1', label: 'read', tool: 'file.read', arg: 'release-notes.md', status: 'done', ms: 42 },
      { id: 's2', label: 'read', tool: 'file.read', arg: 'release-plan.md', status: 'done', ms: 38 },
      { id: 's3', label: 'grep', tool: 'fs.grep', arg: 'TODO in src/**', status: 'done', ms: 120 },
      { id: 's4', label: 'synthesize', tool: 'llm.plan', arg: 'nemotron-3-super-120b', status: 'running', ms: null },
    ]},
    { id: 't2', label: 'Watch for notifications', status: 'idle', icon: 'Bell', steps: [{ id: 's1', label: 'subscribe', tool: 'notifd.sub', arg: '*', status: 'done' }] },
    { id: 't3', label: 'Pair on terminal', status: 'idle', icon: 'Terminal', steps: [{ id: 's1', label: 'attach', tool: 'pty.attach', arg: '/dev/pts/1', status: 'done' }] },
  ],
  sandboxStatus: 'Nemo Claw sandbox · Released April 18, 2026',
  leluTalking: false,

  setChatLog: (v) => set({ chatLog: v }),
  addChatMessage: (msg) => set(s => ({ chatLog: [...s.chatLog, msg] })),
  setLeluThinking: (v) => set({ leluThinking: v }),
  setTasks: (v) => set({ tasks: v }),
  setSandboxStatus: (v) => set({ sandboxStatus: v }),
  setLeluTalking: (v) => set({ leluTalking: v }),
}));
