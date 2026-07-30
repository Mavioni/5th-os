/**
 * Virtual File System — localStorage-backed mock filesystem.
 *
 * VFS class encapsulates all state and operations. A singleton is exported
 * for backward compatibility with existing function-based API.
 *
 * Structure: Linux-like hierarchy under /home/jordan/
 */

export interface VFSNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  size?: number;
  modified?: number;
  children?: Record<string, VFSNode>;
}

const STORAGE_KEY = '5th-os:vfs';

// ================================================================
// VFS CLASS
// ================================================================

export class VirtualFileSystem {
  private root: VFSNode;
  private cwd: string;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.root = JSON.parse(stored);
        this.cwd = '/home/jordan';
        return;
      } catch { /* corrupt — rebuild */ }
    }
    this.root = VirtualFileSystem.createDefaultFS();
    this.cwd = '/home/jordan';
    this.save();
  }

  /** Get the raw root node (for serialization / debugging) */
  getRoot(): VFSNode { return this.root; }

  /** Get the current working directory */
  getCWD(): string { return this.cwd; }

  // --- Persistence ---

  save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.root));
  }

  // --- Path resolution ---

  private resolvePath(input: string): string {
    if (input.startsWith('/')) return input;
    if (input === '~' || input.startsWith('~/')) {
      return '/home/jordan' + (input.length > 1 ? input.slice(1) : '');
    }
    return this.cwd + '/' + input;
  }

  private resolve(path: string): { node: VFSNode | null; parent: VFSNode | null; key: string } {
    const parts = path.replace(/\/+/g, '/').replace(/\/$/, '').split('/').filter(Boolean);
    if (parts.length === 0) return { node: this.root, parent: null, key: '' };

    let current: VFSNode = this.root;
    let parent: VFSNode | null = null;
    let lastKey = '';

    for (let i = 0; i < parts.length; i++) {
      if (!current.children) return { node: null, parent: null, key: '' };
      parent = current;
      lastKey = parts[i];
      const next = current.children[parts[i]];
      if (!next) {
        // Path doesn't exist
        return { node: null, parent: i < parts.length - 1 ? null : parent, key: lastKey };
      }
      current = next;
    }
    return { node: current, parent, key: lastKey };
  }

  // --- Navigation ---

  exists(path: string): boolean {
    const abs = this.resolvePath(path);
    const { node } = this.resolve(abs);
    return node !== null;
  }

  isDirectory(path: string): boolean {
    const abs = this.resolvePath(path);
    const { node } = this.resolve(abs);
    return node?.type === 'directory';
  }

  cd(path: string): boolean {
    const abs = this.resolvePath(path);
    const { node } = this.resolve(abs);
    if (node && node.type === 'directory') {
      this.cwd = abs.replace(/\/+/g, '/');
      return true;
    }
    return false;
  }

  // --- Listing ---

  ls(path?: string): { name: string; type: 'file' | 'directory'; size?: number; modified?: number }[] {
    const abs = path ? this.resolvePath(path) : this.cwd;
    const { node } = this.resolve(abs);
    if (!node || node.type !== 'directory' || !node.children) return [];
    return Object.values(node.children).map(c => ({
      name: c.name,
      type: c.type,
      size: c.size,
      modified: c.modified,
    }));
  }

  // --- Read / Write ---

  read(path: string): string | null {
    const abs = this.resolvePath(path);
    const { node } = this.resolve(abs);
    if (!node || node.type !== 'file') return null;
    return node.content ?? '';
  }

  write(path: string, content: string): boolean {
    const abs = this.resolvePath(path);
    const parts = abs.replace(/\/+/g, '/').replace(/\/$/, '').split('/').filter(Boolean);
    if (parts.length === 0) return false;

    // Walk to parent, creating directories as needed
    let current = this.root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current.children) current.children = {};
      if (!current.children[parts[i]]) {
        current.children[parts[i]] = { name: parts[i], type: 'directory', children: {} };
      }
      current = current.children[parts[i]];
    }

    const name = parts[parts.length - 1];
    if (!current.children) current.children = {};
    const existing = current.children[name];
    if (existing && existing.type === 'directory') return false;

    current.children[name] = {
      name, type: 'file', content, size: content.length, modified: Date.now(),
    };
    this.save();
    return true;
  }

  // --- Create / Delete ---

  mkdir(path: string): boolean {
    const abs = this.resolvePath(path);
    const parts = abs.replace(/\/+/g, '/').replace(/\/$/, '').split('/').filter(Boolean);
    if (parts.length === 0) return false;

    let current = this.root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current.children) current.children = {};
      if (!current.children[parts[i]]) return false; // parent must exist
      current = current.children[parts[i]];
      if (current.type !== 'directory') return false;
    }

    const name = parts[parts.length - 1];
    if (!current.children) current.children = {};
    if (current.children[name]) return false;

    current.children[name] = { name, type: 'directory', children: {} };
    this.save();
    return true;
  }

  rm(path: string): boolean {
    const abs = this.resolvePath(path);
    const { parent, key } = this.resolve(abs);
    if (!parent || !parent.children || !parent.children[key]) return false;
    if (parent.children[key].type === 'directory' &&
        Object.keys(parent.children[key].children || {}).length > 0) {
      return false; // directory not empty
    }
    delete parent.children[key];
    this.save();
    return true;
  }

  rmrf(path: string): boolean {
    const abs = this.resolvePath(path);
    const { parent, key } = this.resolve(abs);
    if (!parent || !parent.children || !parent.children[key]) return false;
    delete parent.children[key];
    this.save();
    return true;
  }

  getNode(path: string): VFSNode | null {
    const abs = this.resolvePath(path);
    const { node } = this.resolve(abs);
    return node;
  }

  // --- Search ---

  search(query: string, rootPath?: string): string[] {
    const results: string[] = [];
    const startPath = rootPath ? this.resolvePath(rootPath) : '/home/jordan';
    const { node: start } = this.resolve(startPath);
    if (!start) return results;

    const q = query.toLowerCase();
    const walk = (node: VFSNode, currentPath: string) => {
      if (node.type === 'file' &&
          (node.name.toLowerCase().includes(q) || (node.content && node.content.toLowerCase().includes(q)))) {
        results.push((currentPath + '/' + node.name).replace(/\/+/g, '/'));
      }
      if (node.children) {
        for (const [name, child] of Object.entries(node.children)) {
          walk(child, currentPath + '/' + name);
        }
      }
    };
    walk(start, startPath);
    return results;
  }

  // --- Default filesystem ---

  private static createDefaultFS(): VFSNode {
    return {
      name: '/', type: 'directory', children: {
        home: { name: 'home', type: 'directory', children: {
          jordan: { name: 'jordan', type: 'directory', children: {
            Desktop: { name: 'Desktop', type: 'directory', children: {
              'trash.desktop': { name: 'trash.desktop', type: 'file', content: '[Desktop Entry]\nType=Application\nName=Trash', size: 54, modified: Date.now() - 86400000 },
            }},
            Documents: { name: 'Documents', type: 'directory', children: {
              'release-notes.md': { name: 'release-notes.md', type: 'file', content: '# 5th OS 1.0.2 Release Notes\n\n## Changes\n- Panel flicker fixed on 120Hz displays (#1242)\n- Menu config migrated from XML to TOML\n- Kernel 6.8.0-lelu-amd64 shipped\n- Nemo Claw sandbox updated to v2.4.1\n\n## Known Issues\n- Terminal copy/paste uses Ctrl+Shift\n- Some GTK themes render borders incorrectly', size: 370, modified: Date.now() - 3600000 },
              'release-plan.md': { name: 'release-plan.md', type: 'file', content: '# 5th OS Roadmap\n\n## 1.1 — "Akina"\n- Wayland compositor\n- GPU window manager\n- Lelu TTS pipeline\n\n## 1.2 — "Multi-pass"\n- Agent swarm orchestration\n- Real-time collaborative terminal\n\n## 2.0 — "Big Ba-da-boom"\n- Full AI kernel integration\n- Self-modifying agent code', size: 310, modified: Date.now() - 7200000 },
              'build.log': { name: 'build.log', type: 'file', content: '[2026-07-30 14:03:22] BUILD START — kernel 6.8.0-lelu-amd64\n[2026-07-30 14:03:24] CC init/main.o\n[2026-07-30 14:03:26] CC kernel/sched/core.o\n[2026-07-30 14:03:35] CC drivers/gpu/drm/lelu/pageflip.o  ← #1242 fix\n[2026-07-30 14:03:39] BUILD COMPLETE — 0 errors, 2 warnings', size: 320, modified: Date.now() - 1800000 },
            }},
            Downloads: { name: 'Downloads', type: 'directory', children: {} },
            Pictures: { name: 'Pictures', type: 'directory', children: {
              'screenshot-2026-07-29.png': { name: 'screenshot-2026-07-29.png', type: 'file', content: '[BINARY IMAGE DATA — 2.4 MB]', size: 2400000, modified: Date.now() - 86400000 },
            }},
            projects: { name: 'projects', type: 'directory', children: {
              revenant: { name: 'revenant', type: 'directory', children: {
                kernel: { name: 'kernel', type: 'directory', children: {
                  'main.c': { name: 'main.c', type: 'file', content: '/* 5th OS Kernel — Revenant\n * Boot entry point\n */\n\n#include <lelu/kernel.h>\n#include <lelu/sandbox.h>\n\nvoid kernel_main(void) {\n    lelu_init();\n    sandbox_attach("nemo_claw");\n    agent_spawn("init", AGENT_PRIO_HIGH);\n    printk(KERN_INFO "5th OS kernel loaded. Multi-pass.\\n");\n    schedule();\n}', size: 290, modified: Date.now() - 172800000 },
                }},
                README: { name: 'README', type: 'file', content: 'REVENANT KERNEL — 5th OS\n\nKernel tree for the 5th OS operating system.\nBuilt on Linux 6.8 with Lelu AIOS patches.\n\nBuild:\n  make defconfig && make -j$(nproc)\n\n— Jordan Lin <jordan@revenant>', size: 210, modified: Date.now() - 172800000 },
              }},
            }},
            '.bashrc': { name: '.bashrc', type: 'file', content: '# ~/.bashrc\nexport PS1="╺ \\u@revenant ▸ "\nexport EDITOR=vim\nalias lelu="lelu-cli chat"\nalias sandbox="nemo-claw exec"\nalias gs="git status"\nalias gp="git push"', size: 180, modified: Date.now() - 259200000 },
          }},
        }},
      },
    };
  }
}

// ================================================================
// SINGLETON — backward-compatible function exports
// ================================================================

const vfs = new VirtualFileSystem();

export function initFS(): VFSNode { return vfs.getRoot(); }
export function saveFS(): void { vfs.save(); }
export function getFS(): VFSNode { return vfs.getRoot(); }
export function getCWD(): string { return vfs.getCWD(); }
export function setCWD(path: string): boolean { return vfs.cd(path); }
export function listDir(path?: string) { return vfs.ls(path); }
export function readFile(path: string) { return vfs.read(path); }
export function writeFile(path: string, content: string) { return vfs.write(path, content); }
export function createDirectory(path: string) { return vfs.mkdir(path); }
export function deleteNode(path: string) { return vfs.rm(path); }
export function deleteRecursive(path: string) { return vfs.rmrf(path); }
export function exists(path: string) { return vfs.exists(path); }
export function isDirectory(path: string) { return vfs.isDirectory(path); }
export function getNode(path: string) { return vfs.getNode(path); }
export function searchFiles(query: string, rootPath?: string) { return vfs.search(query, rootPath); }

// Export the singleton for new code that wants direct access
export { vfs };
