/**
 * Virtual File System — localStorage-backed mock filesystem
 *
 * Powers the Files app, Terminal commands, and Text Editor.
 * Mirrors a Linux-like hierarchy under /home/jordan/.
 *
 * Structure:
 *   /home/jordan/
 *     Desktop/
 *     Documents/
 *       release-notes.md
 *       release-plan.md
 *       build.log
 *     Downloads/
 *     Pictures/
 *     projects/
 *       revenant/
 *         kernel/
 *           main.c
 *           Makefile
 *     .bashrc
 */

export interface VFSNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  size?: number;
  modified?: number; // timestamp
  children?: Record<string, VFSNode>;
}

const STORAGE_KEY = '5th-os:vfs';

// Default filesystem structure
function createDefaultFS(): VFSNode {
  return {
    name: '/',
    type: 'directory',
    children: {
      home: {
        name: 'home',
        type: 'directory',
        children: {
          jordan: {
            name: 'jordan',
            type: 'directory',
            children: {
              Desktop: {
                name: 'Desktop',
                type: 'directory',
                children: {
                  'trash.desktop': { name: 'trash.desktop', type: 'file', content: '[Desktop Entry]\nType=Application\nName=Trash\nIcon=user-trash', size: 72, modified: Date.now() - 86400000 },
                },
              },
              Documents: {
                name: 'Documents',
                type: 'directory',
                children: {
                  'release-notes.md': {
                    name: 'release-notes.md', type: 'file',
                    content: '# 5th OS 1.0.2 Release Notes\n\n## Changes\n- Panel flicker fixed on 120Hz displays (#1242)\n- Menu config migrated from XML to TOML\n- Kernel 6.8.0-lelu-amd64 shipped\n- Nemo Claw sandbox updated to v2.4.1\n- 13 agents loaded at boot\n\n## Known Issues\n- Terminal copy/paste uses Ctrl+Shift (not Ctrl+C/V)\n- Some GTK themes render borders incorrectly\n- Bluetooth audio latency > 40ms on some chipsets\n\n## Next\n- Wayland transition planned for 1.1\n- GPU-accelerated window compositing\n- Lelu voice synthesis pipeline',
                    size: 531, modified: Date.now() - 3600000,
                  },
                  'release-plan.md': {
                    name: 'release-plan.md', type: 'file',
                    content: '# 5th OS Roadmap\n\n## 1.1 — "Akina"\n- Wayland compositor\n- GPU window manager\n- Lelu TTS pipeline\n- Multi-monitor workspace awareness\n\n## 1.2 — "Multi-pass"\n- Agent swarm orchestration\n- Real-time collaborative terminal\n- GitNexus code intelligence integration\n- Cross-session memory persistence\n\n## 2.0 — "Big Ba-da-boom"\n- Full AI kernel integration\n- Self-modifying agent code\n- Neural architecture search for task optimization\n- Quantum-resistant sandbox isolation',
                    size: 514, modified: Date.now() - 7200000,
                  },
                  'build.log': {
                    name: 'build.log', type: 'file',
                    content: '[2026-07-30 14:03:22] BUILD START — kernel 6.8.0-lelu-amd64\n[2026-07-30 14:03:22] Config: x86_64_defconfig + lelu_patches\n[2026-07-30 14:03:24] CC      init/main.o\n[2026-07-30 14:03:26] CC      kernel/sched/core.o\n[2026-07-30 14:03:28] CC      kernel/sched/fair.o\n[2026-07-30 14:03:31] CC      kernel/sched/rt.o\n[2026-07-30 14:03:33] CC      drivers/gpu/drm/lelu/panel.o\n[2026-07-30 14:03:35] CC      drivers/gpu/drm/lelu/pageflip.o  ← #1242 fix\n[2026-07-30 14:03:37] LD      vmlinux\n[2026-07-30 14:03:38] MODPOST modules\n[2026-07-30 14:03:39] BUILD COMPLETE — 17s — 0 errors, 2 warnings\n[2026-07-30 14:03:39] Image: arch/x86/boot/bzImage — 12.4 MB\n[2026-07-30 14:03:39] Installed to /boot/vmlinuz-6.8.0-lelu-amd64',
                    size: 714, modified: Date.now() - 1800000,
                  },
                },
              },
              Downloads: { name: 'Downloads', type: 'directory', children: {} },
              Pictures: {
                name: 'Pictures',
                type: 'directory',
                children: {
                  'screenshot-2026-07-29.png': { name: 'screenshot-2026-07-29.png', type: 'file', content: '[BINARY IMAGE DATA — 2.4 MB]', size: 2400000, modified: Date.now() - 86400000 },
                },
              },
              projects: {
                name: 'projects',
                type: 'directory',
                children: {
                  revenant: {
                    name: 'revenant',
                    type: 'directory',
                    children: {
                      kernel: {
                        name: 'kernel',
                        type: 'directory',
                        children: {
                          'main.c': { name: 'main.c', type: 'file', content: '/* 5th OS Kernel — Revenant\n * Boot entry point\n */\n\n#include <lelu/kernel.h>\n#include <lelu/sandbox.h>\n\nvoid kernel_main(void) {\n    lelu_init();\n    sandbox_attach("nemo_claw");\n    agent_spawn("init", AGENT_PRIO_HIGH);\n    \n    printk(KERN_INFO "5th OS kernel loaded. Multi-pass.\\n");\n    \n    // Enter scheduler — never returns\n    schedule();\n}\n', size: 358, modified: Date.now() - 172800000 },
                          'Makefile': { name: 'Makefile', type: 'file', content: '# 5th OS Kernel Build\n\nARCH = x86_64\nCC = gcc\nCFLAGS = -O2 -Wall -mcmodel=kernel -ffreestanding\n\nobj-y += init/\nobj-y += kernel/\nobj-y += drivers/\nobj-y += sandbox/\n\nall: vmlinux\n\t@echo "Kernel built. Multi-pass."\n\nvmlinux: $(OBJS)\n\t$(LD) -T kernel.lds -o $@ $^\n\nclean:\n\trm -f vmlinux *.o\n', size: 326, modified: Date.now() - 172800000 },
                        },
                      },
                      README: {
                        name: 'README', type: 'file',
                        content: 'REVENANT KERNEL — 5th OS\n\nKernel tree for the 5th OS operating system.\nBuilt on Linux 6.8 with Lelu AIOS patches.\n\nBuild:\n  make defconfig\n  make -j$(nproc)\n\nInstall:\n  make modules_install\n  make install\n\nNemo Claw sandbox is compiled in.\nAgent runtime loads as a kernel module.\n\n— Jordan Lin <jordan@revenant>\n',
                        size: 298, modified: Date.now() - 172800000,
                      },
                    },
                  },
                },
              },
              '.bashrc': {
                name: '.bashrc', type: 'file',
                content: '# ~/.bashrc — Jordan\'s shell config\n\nexport PS1="\\[\\033[1;31m\\]╺\\[\\033[0m\\] \\[\\033[1;37m\\]\\u@revenant\\[\\033[0m\\] \\[\\033[1;31m\\]▸\\[\\033[0m\\] "\nexport EDITOR=vim\nexport PATH=$HOME/bin:$PATH\n\n# Lelu aliases\nalias lelu="lelu-cli chat"\nalias sandbox="nemo-claw exec"\nalias agents="lelu-cli agents ls"\nalias build="cd ~/projects/revenant/kernel && make -j8"\n\n# Git aliases\nalias gs="git status"\nalias gp="git push"\nalias gc="git commit -m"\n\n# Start Lelu agent daemon if not running\nif ! pgrep -x lelu-agentd > /dev/null; then\n    lelu-agentd --daemon &\nfi\n',
                size: 576, modified: Date.now() - 259200000,
              },
              '.config': {
                name: '.config', type: 'directory', children: {
                  'lelu': {
                    name: 'lelu', type: 'directory', children: {
                      'settings.json': {
                        name: 'settings.json', type: 'file',
                        content: JSON.stringify({
                          theme: 'tactical',
                          accentColor: '#ef2137',
                          fontSize: 12,
                          terminalFont: 'JetBrains Mono',
                          sandboxAutoAttach: true,
                          agentMaxConcurrent: 13,
                          notificationsEnabled: true,
                          workspaceCount: 4,
                        }, null, 2),
                        size: 211, modified: Date.now() - 86400000,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

// ================================================================
// VFS API
// ================================================================

let fsRoot: VFSNode | null = null;
let cwd = '/home/jordan';

function resolve(path: string): { node: VFSNode | null; parent: VFSNode | null; key: string } {
  if (!fsRoot) return { node: null, parent: null, key: '' };

  const parts = path.replace(/\/+/g, '/').replace(/\/$/, '').split('/').filter(Boolean);
  if (parts.length === 0) return { node: fsRoot, parent: null, key: '' };

  let current = fsRoot;
  let parent: VFSNode | null = null;
  let lastKey = '';

  for (let i = 0; i < parts.length; i++) {
    if (!current.children) return { node: null, parent: null, key: '' };
    parent = current;
    lastKey = parts[i];
    current = current.children[parts[i]];
    if (!current && i < parts.length - 1) return { node: null, parent: null, key: '' };
    if (!current) return { node: null, parent, key: lastKey };
  }

  return { node: current, parent, key: lastKey };
}

function resolvePath(input: string): string {
  if (input.startsWith('/')) return input;
  if (input === '~' || input.startsWith('~/')) {
    return '/home/jordan' + (input.length > 1 ? input.slice(1) : '');
  }
  return cwd + '/' + input;
}

export function initFS(): VFSNode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      fsRoot = JSON.parse(stored);
      return fsRoot!;
    } catch {
      // corrupt — rebuild
    }
  }
  fsRoot = createDefaultFS();
  saveFS();
  return fsRoot;
}

export function saveFS(): void {
  if (fsRoot) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fsRoot));
  }
}

export function getFS(): VFSNode {
  if (!fsRoot) return initFS();
  return fsRoot;
}

export function getCWD(): string {
  return cwd;
}

export function setCWD(path: string): boolean {
  const abs = resolvePath(path);
  const { node } = resolve(abs);
  if (node && node.type === 'directory') {
    cwd = abs;
    return true;
  }
  return false;
}

export function listDir(path?: string): { name: string; type: 'file' | 'directory'; size?: number; modified?: number }[] {
  const abs = path ? resolvePath(path) : cwd;
  const { node } = resolve(abs);
  if (!node || node.type !== 'directory' || !node.children) return [];
  return Object.values(node.children).map(c => ({
    name: c.name,
    type: c.type,
    size: c.size,
    modified: c.modified,
  }));
}

export function readFile(path: string): string | null {
  const abs = resolvePath(path);
  const { node } = resolve(abs);
  if (!node || node.type !== 'file') return null;
  return node.content ?? '';
}

export function writeFile(path: string, content: string): boolean {
  const abs = resolvePath(path);
  const { parent, key } = resolve(abs);
  if (!parent || !parent.children) return false;

  const existing = parent.children[key];
  if (existing && existing.type === 'directory') return false;

  parent.children[key] = {
    name: key,
    type: 'file',
    content,
    size: content.length,
    modified: Date.now(),
  };
  saveFS();
  return true;
}

export function createDirectory(path: string): boolean {
  const abs = resolvePath(path);
  const { parent, key } = resolve(abs);
  if (!parent || !parent.children) return false;
  if (parent.children[key]) return false; // already exists

  parent.children[key] = {
    name: key,
    type: 'directory',
    children: {},
  };
  saveFS();
  return true;
}

export function deleteNode(path: string): boolean {
  const abs = resolvePath(path);
  const { parent, key } = resolve(abs);
  if (!parent || !parent.children || !parent.children[key]) return false;
  if (parent.children[key].type === 'directory' && Object.keys(parent.children[key].children || {}).length > 0) {
    return false; // directory not empty
  }
  delete parent.children[key];
  saveFS();
  return true;
}

export function deleteRecursive(path: string): boolean {
  const abs = resolvePath(path);
  const { parent, key } = resolve(abs);
  if (!parent || !parent.children || !parent.children[key]) return false;
  delete parent.children[key];
  saveFS();
  return true;
}

export function exists(path: string): boolean {
  const abs = resolvePath(path);
  const { node } = resolve(abs);
  return node !== null;
}

export function isDirectory(path: string): boolean {
  const abs = resolvePath(path);
  const { node } = resolve(abs);
  return node?.type === 'directory';
}

export function getNode(path: string): VFSNode | null {
  const abs = resolvePath(path);
  const { node } = resolve(abs);
  return node;
}

export function searchFiles(query: string, rootPath?: string): string[] {
  const results: string[] = [];
  const searchPath = rootPath ? resolvePath(rootPath) : '/home/jordan';

  function walk(node: VFSNode, currentPath: string) {
    if (node.type === 'file' && (node.name.toLowerCase().includes(query.toLowerCase()) ||
        (node.content && node.content.toLowerCase().includes(query.toLowerCase())))) {
      results.push(currentPath + '/' + node.name);
    }
    if (node.children) {
      for (const [name, child] of Object.entries(node.children)) {
        walk(child, currentPath + '/' + name);
      }
    }
  }

  const { node } = resolve(searchPath);
  if (node) walk(node, searchPath);
  return results.map(p => p.replace(/\/+/g, '/'));
}

// Initialize on import
initFS();
