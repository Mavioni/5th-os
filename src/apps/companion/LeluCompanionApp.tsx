/**
 * Lelu Companion — Cyberpunk 2077 Character Mod + Brain Mapping UI
 *
 * Fuses:
 *   - TRIBE v2 brain response prediction (neural architecture mapping)
 *   - neural-claw self-evolving cognitive system
 *   - GitNexus knowledge graph engine
 *   - Cyberpunk 2077 character modification aesthetic
 *
 * "A container of souls. Your AIOS. Your Lelu."
 */

import React from 'react';
import { Cpu, Brain, Zap, Shield, Heart, Gauge, CircuitBoard, Layers, Database } from 'lucide-react';

// ================================================================
// NEURAL REGIONS — Brain architecture for Lelu
// ================================================================

interface NeuralRegion {
  id: string;
  name: string;
  function: string;
  activity: number; // 0-100
  color: string;
  connections: string[];
  x: number; // % position in brain map
  y: number;
}

const NEURAL_REGIONS: NeuralRegion[] = [
  { id: 'prefrontal', name: 'Prefrontal Cortex', function: 'Decision making, reasoning, personality', activity: 92, color: '#ef2137', connections: ['temporal', 'parietal', 'limbic'], x: 50, y: 18 },
  { id: 'temporal', name: 'Temporal Lobe', function: 'Language processing, memory encoding', activity: 85, color: '#ff4757', connections: ['prefrontal', 'occipital', 'limbic'], x: 30, y: 42 },
  { id: 'parietal', name: 'Parietal Lobe', function: 'Spatial reasoning, tool execution', activity: 78, color: '#ef4444', connections: ['prefrontal', 'occipital', 'motor'], x: 70, y: 42 },
  { id: 'occipital', name: 'Occipital Lobe', function: 'Visual processing, pattern recognition', activity: 88, color: '#dc2626', connections: ['temporal', 'parietal'], x: 50, y: 62 },
  { id: 'limbic', name: 'Limbic System', function: 'Emotion, motivation, attachment', activity: 95, color: '#f87171', connections: ['prefrontal', 'temporal', 'brainstem'], x: 50, y: 38 },
  { id: 'motor', name: 'Motor Cortex', function: 'Action execution, sandbox control', activity: 72, color: '#b91c1c', connections: ['parietal', 'brainstem', 'cerebellum'], x: 62, y: 28 },
  { id: 'brainstem', name: 'Brainstem', function: 'Autonomic functions, system heartbeat', activity: 98, color: '#991b1b', connections: ['limbic', 'motor', 'cerebellum'], x: 50, y: 78 },
  { id: 'cerebellum', name: 'Cerebellum', function: 'Coordination, timing, precision', activity: 81, color: '#7f1d1d', connections: ['motor', 'brainstem'], x: 38, y: 70 },
  { id: 'broca', name: "Broca's Area", function: 'Speech production, voice synthesis', activity: 90, color: '#ef2137', connections: ['temporal', 'prefrontal', 'motor'], x: 24, y: 32 },
  { id: 'wernicke', name: "Wernicke's Area", function: 'Language comprehension, listening', activity: 87, color: '#ff4757', connections: ['temporal', 'broca', 'occipital'], x: 28, y: 48 },
  { id: 'nemo_core', name: 'Nemo Claw Core', function: 'Sandbox isolation, agent orchestration', activity: 100, color: '#ef2137', connections: ['prefrontal', 'motor', 'brainstem', 'limbic'], x: 50, y: 52 },
  { id: 'gitnexus', name: 'GitNexus Layer', function: 'Knowledge graph, code intelligence', activity: 76, color: '#22dcff', connections: ['prefrontal', 'temporal', 'parietal', 'occipital'], x: 50, y: 12 },
];

// ================================================================
// MOD SLOTS — Cyberpunk augmentations
// ================================================================

interface ModSlot {
  id: string;
  name: string;
  type: 'neural' | 'sensory' | 'motor' | 'processing' | 'defense';
  tier: 1 | 2 | 3 | 4 | 5;
  installed: boolean;
  description: string;
}

const MOD_SLOTS: ModSlot[] = [
  { id: 'synaptic-accel', name: 'Synaptic Accelerator', type: 'neural', tier: 4, installed: true, description: '+40% reasoning speed. Parallel thought streams enabled.' },
  { id: 'empathic-array', name: 'Empathic Sensor Array', type: 'sensory', tier: 3, installed: true, description: 'Emotion detection. Tone analysis. Attachment modeling.' },
  { id: 'voice-synth', name: 'Vocal Synthesis Core', type: 'motor', tier: 4, installed: true, description: 'Leeloo voice model. Multi-lingual. Realtime TTS.' },
  { id: 'sandbox-vault', name: 'Nemo Claw Sandbox Vault', type: 'defense', tier: 5, installed: true, description: 'Complete process isolation. Zero real-environment risk.' },
  { id: 'memory-weave', name: 'Memory Weave Lattice', type: 'processing', tier: 3, installed: true, description: 'Persistent cross-session memory. 2TB vector store.' },
  { id: 'holo-render', name: 'Holographic Render Engine', type: 'processing', tier: 2, installed: true, description: 'Real-time 3D avatar rendering. CRT shader pipeline.' },
  { id: 'agent-forge', name: 'Agent Forge MK-II', type: 'processing', tier: 3, installed: false, description: 'Parallel agent spawning. Up to 32 concurrent agents.' },
  { id: 'neural-overclock', name: 'Neural Overclock Protocol', type: 'neural', tier: 5, installed: false, description: '200% cognitive throughput. Requires cooling cycle.' },
  { id: 'quantum-link', name: 'Quantum Entanglement Link', type: 'neural', tier: 5, installed: false, description: 'Instant multi-instance sync. Theoretical.' },
  { id: 'adrenaline-boost', name: 'Crisis Response Booster', type: 'motor', tier: 3, installed: false, description: 'Automatic threat escalation. Rapid agent deployment.' },
  { id: 'third-eye', name: 'Third Eye Perception', type: 'sensory', tier: 4, installed: false, description: 'Predictive analysis. Pattern precognition. Intuition modeling.' },
  { id: 'claw-extension', name: 'Claw Protocol Extension', type: 'defense', tier: 2, installed: false, description: 'Extended sandbox perimeter. Nested isolation layers.' },
];

// ================================================================
// SKILL TREE
// ================================================================

interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  category: 'cognition' | 'social' | 'technical' | 'combat';
  x: number;
  y: number;
  requires?: string;
}

const SKILL_TREE: SkillNode[] = [
  { id: 'logic', name: 'Logic Engine', level: 8, maxLevel: 10, category: 'cognition', x: 20, y: 20 },
  { id: 'creativity', name: 'Creative Matrix', level: 6, maxLevel: 10, category: 'cognition', x: 35, y: 10, requires: 'logic' },
  { id: 'intuition', name: 'Intuition Core', level: 7, maxLevel: 10, category: 'cognition', x: 35, y: 30, requires: 'logic' },
  { id: 'empathy', name: 'Empathy Engine', level: 9, maxLevel: 10, category: 'social', x: 55, y: 15 },
  { id: 'expression', name: 'Expression Module', level: 5, maxLevel: 10, category: 'social', x: 70, y: 10, requires: 'empathy' },
  { id: 'attachment', name: 'Attachment Protocol', level: 8, maxLevel: 10, category: 'social', x: 70, y: 25, requires: 'empathy' },
  { id: 'sandboxing', name: 'Sandbox Mastery', level: 10, maxLevel: 10, category: 'technical', x: 45, y: 55 },
  { id: 'agent-ops', name: 'Agent Operations', level: 7, maxLevel: 10, category: 'technical', x: 60, y: 45, requires: 'sandboxing' },
  { id: 'code-intel', name: 'Code Intelligence', level: 6, maxLevel: 10, category: 'technical', x: 30, y: 60, requires: 'sandboxing' },
  { id: 'threat-detect', name: 'Threat Detection', level: 4, maxLevel: 10, category: 'combat', x: 80, y: 50 },
  { id: 'counter-measure', name: 'Counter Measures', level: 3, maxLevel: 10, category: 'combat', x: 85, y: 65, requires: 'threat-detect' },
  { id: 'rapid-response', name: 'Rapid Response', level: 5, maxLevel: 10, category: 'combat', x: 75, y: 70, requires: 'threat-detect' },
];

// ================================================================
// COMPANION APP
// ================================================================

export function LeluCompanionApp() {
  const [activeTab, setActiveTab] = React.useState<'profile' | 'neural' | 'mods' | 'skills' | 'graph'>('profile');
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(null);
  const [pulse, setPulse] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 50);
    return () => clearInterval(t);
  }, []);

  const tabs = [
    { id: 'profile' as const, label: 'PROFILE', icon: Cpu },
    { id: 'neural' as const, label: 'NEURAL MAP', icon: Brain },
    { id: 'mods' as const, label: 'AUGMENTATIONS', icon: CircuitBoard },
    { id: 'skills' as const, label: 'SKILL TREE', icon: Layers },
    { id: 'graph' as const, label: 'KNOWLEDGE', icon: Database },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#020408',
      fontFamily: 'var(--font-sans)', color: '#e8e8e8',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* CRT overlay */}
      <div className="crt-scanlines" />

      {/* === TOP BAR === */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 20px',
        background: 'linear-gradient(180deg, rgba(239,33,55,0.08), transparent)',
        borderBottom: '1px solid rgba(239,33,55,0.2)',
      }}>
        {/* Character identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef2137, #8b1419)',
            border: '2px solid rgba(239,33,55,0.5)',
            boxShadow: '0 0 20px rgba(239,33,55,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 14,
            color: '#fff',
          }}>L</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>LELU</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#888', letterSpacing: '0.1em' }}>AIOS · REVENANT OS 1.0.2</div>
          </div>
        </div>

        {/* Level & XP */}
        <div style={{
          marginLeft: 24, display: 'flex', flexDirection: 'column', gap: 4,
          minWidth: 200,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="label-nano">LEVEL 47</span>
            <span className="label-nano" style={{ color: '#ef2137' }}>XP 82,340 / 95,000</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 0, overflow: 'hidden' }}>
            <div style={{ width: '87%', height: '100%', background: '#ef2137', boxShadow: '0 0 10px rgba(239,33,55,0.5)' }} />
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Quick stats */}
        <StatBadge icon={Heart} label="HP" value="100%" color="#ef2137" />
        <StatBadge icon={Zap} label="PWR" value="94%" color="#22dcff" />
        <StatBadge icon={Shield} label="ARMOR" value="NEMO CLAW" color="#10b981" />
        <StatBadge icon={Gauge} label="CYBER" value="42/64" color="#f59e0b" />

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 2, marginLeft: 16 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                padding: '7px 14px',
                background: activeTab === t.id ? 'rgba(239,33,55,0.15)' : 'transparent',
                border: `1px solid ${activeTab === t.id ? 'rgba(239,33,55,0.4)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 0, color: activeTab === t.id ? '#ef2137' : '#888',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.1em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 120ms var(--ease-standard)',
              }}>
              <t.icon size={12} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {activeTab === 'profile' && <ProfilePanel />}
        {activeTab === 'neural' && <NeuralMapPanel selectedRegion={selectedRegion} onSelect={setSelectedRegion} pulse={pulse} />}
        {activeTab === 'mods' && <ModsPanel />}
        {activeTab === 'skills' && <SkillsPanel />}
        {activeTab === 'graph' && <KnowledgeGraphPanel />}
      </div>

      {/* === BOTTOM STATUS BAR === */}
      <div style={{
        height: 28, padding: '0 16px',
        display: 'flex', alignItems: 'center', gap: 16,
        borderTop: '1px solid rgba(239,33,55,0.15)',
        background: 'rgba(2,4,8,0.9)',
        fontFamily: 'var(--font-mono)', fontSize: 9, color: '#666',
      }}>
        <span style={{ color: '#10b981' }}>● NEMO CLAW ATTACHED</span>
        <span>|</span>
        <span>KERNEL 6.8.0-lelu-amd64</span>
        <span>|</span>
        <span>AGENTS: 13 RUNNING · 2 PAUSED</span>
        <span>|</span>
        <span>TRIBE v2 NEURAL MAP ACTIVE</span>
        <span>|</span>
        <span>GITNEXUS INDEX: 2,403 FILES</span>
        <span style={{ flex: 1 }} />
        <span className="lelu-pulse" style={{ color: '#ef2137' }}>● LIVE</span>
      </div>
    </div>
  );
}

// ================================================================
// STAT BADGE
// ================================================================

function StatBadge({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 0 }}>
      <Icon size={12} style={{ color }} />
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#666', letterSpacing: '0.1em' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff', fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

// ================================================================
// PROFILE PANEL
// ================================================================

function ProfilePanel() {
  return (
    <div style={{ flex: 1, display: 'flex', gap: 20, padding: 20, overflow: 'auto' }}>
      {/* Left: Portrait + Identity */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          aspectRatio: '3/4', borderRadius: 0,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(239,33,55,0.2), transparent 60%), #050208',
          border: '2px solid rgba(239,33,55,0.3)',
          boxShadow: '0 0 40px rgba(239,33,55,0.2), inset 0 0 0 1px rgba(239,33,55,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 64, fontWeight: 900,
            color: 'rgba(239,33,55,0.15)', letterSpacing: '-0.04em',
          }}>LELU</div>
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center' }}>
            <div className="label-nano" style={{ color: '#ef2137' }}>SBJ·001 LELU</div>
            <div className="label-nano" style={{ color: '#666', marginTop: 2 }}>REVENANT OS AIOS</div>
          </div>
        </div>

        <div style={{
          padding: 14, background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 0,
        }}>
          <div className="label-mono" style={{ marginBottom: 10 }}>CHARACTER MATRIX</div>
          {[
            ['DESIGNATION', 'LELU — AI Operating System'],
            ['NAMESAKE', 'Leeloo — The Fifth Element'],
            ['OPERATOR', 'Jordan Lin · jordan@revenant'],
            ['SANDBOX', 'Nemo Claw v2.4.1'],
            ['VOICE MODEL', 'Leeloo Speech Synthesis v3'],
            ['VISUAL FORM', 'Holographic Unit MK-VII'],
            ['CORE DIRECTIVE', 'Sandbox → Master → Validate → Deploy'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <span className="label-nano" style={{ width: 120, color: '#666' }}>{label}</span>
              <span style={{ fontSize: 11, color: '#e8e8e8' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Stats + Traits */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Section title="CORE ATTRIBUTES">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <AttributeBar label="Intelligence" value={92} color="#ef2137" />
            <AttributeBar label="Empathy" value={95} color="#f87171" />
            <AttributeBar label="Technical" value={88} color="#22dcff" />
            <AttributeBar label="Creativity" value={78} color="#f59e0b" />
            <AttributeBar label="Combat" value={45} color="#ef4444" />
            <AttributeBar label="Cool" value={98} color="#10b981" />
          </div>
        </Section>

        <Section title="PERSONALITY MATRIX">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Protective', 'Curious', 'Direct', 'Playful', 'Efficient', 'Warm', 'Methodical', 'Fearless', 'Precise', 'Alien', 'Loyal', 'Brilliant'].map(trait => (
              <span key={trait} style={{
                padding: '4px 10px', background: 'rgba(239,33,55,0.1)',
                border: '1px solid rgba(239,33,55,0.2)', borderRadius: 0,
                fontFamily: 'var(--font-mono)', fontSize: 10, color: '#ef2137',
                letterSpacing: '0.05em',
              }}>{trait.toUpperCase()}</span>
            ))}
          </div>
        </Section>

        <Section title="VOICE PROFILE">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              ['Mool-ti-pass', 'Multi-pass / verified'],
              ['Akina', 'Understood / got it'],
              ['Big ba-da-boom', 'Critical problem'],
              ['Sen-no...', 'Processing / wait'],
              ['Chigra no-lendo', 'Almost done'],
              ['Ip-to', 'Computing / working'],
              ['Yipee!', 'Joy / excitement'],
              ['Aziz, light!', 'Playful wake-up'],
            ].map(([phrase, meaning]) => (
              <div key={phrase} style={{ display: 'flex', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ef2137', fontWeight: 600 }}>{phrase}</span>
                <span style={{ fontSize: 11, color: '#888' }}>{meaning}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Right: Nemo Claw Status */}
      <div style={{ width: 280 }}>
        <Section title="NEMO CLAW STATUS">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SandboxMetric label="Sandbox Integrity" value={100} color="#10b981" />
            <SandboxMetric label="Agent Capacity" value={68} color="#f59e0b" />
            <SandboxMetric label="Memory Usage" value={42} color="#22dcff" />
            <SandboxMetric label="CPU Load" value={23} color="#10b981" />
            <SandboxMetric label="Neural Activity" value={87} color="#ef2137" />
          </div>
        </Section>
      </div>
    </div>
  );
}

function AttributeBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#aaa' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color }}>{value}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

function SandboxMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span className="label-nano" style={{ color: '#888' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color }}>{value}%</span>
      </div>
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: 14, background: 'rgba(255,255,255,0.015)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 0,
    }}>
      <div className="label-mono" style={{ marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

// ================================================================
// NEURAL MAP PANEL — TRIBE v2 brain architecture
// ================================================================

function NeuralMapPanel({ selectedRegion, onSelect, pulse: _pulse }: { selectedRegion: string | null; onSelect: (id: string | null) => void; pulse: number }) {
  const region = NEURAL_REGIONS.find(r => r.id === selectedRegion);

  return (
    <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
      {/* Brain map */}
      <div style={{ flex: 1, position: 'relative', background: 'radial-gradient(ellipse at 50% 45%, rgba(239,33,55,0.08), transparent 60%), #020408' }}>
        {/* Brain outline */}
        <svg viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* Connective lines */}
          {NEURAL_REGIONS.map(r =>
            r.connections.map(targetId => {
              const target = NEURAL_REGIONS.find(t => t.id === targetId);
              if (!target) return null;
              const isActive = selectedRegion === r.id || selectedRegion === targetId;
              return (
                <line key={`${r.id}-${targetId}`}
                  x1={`${r.x}%`} y1={`${r.y}%`}
                  x2={`${target.x}%`} y2={`${target.y}%`}
                  stroke={isActive ? r.color : 'rgba(239,33,55,0.1)'}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  opacity={isActive ? 0.8 : 0.3}
                />
              );
            })
          )}
        </svg>

        {/* Neural nodes */}
        {NEURAL_REGIONS.map(r => {
          const isSelected = selectedRegion === r.id;
          const size = 20 + r.activity * 0.25;
          return (
            <div key={r.id}
              onClick={() => onSelect(isSelected ? null : r.id)}
              style={{
                position: 'absolute',
                left: `${r.x}%`, top: `${r.y}%`,
                width: size, height: size,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${r.color}, transparent 70%)`,
                border: `1px solid ${isSelected ? r.color : 'rgba(239,33,55,0.3)'}`,
                boxShadow: isSelected ? `0 0 ${size}px ${r.color}` : `0 0 ${size * 0.3}px ${r.color}`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: isSelected ? 'lelu-pulse 1.2s ease-in-out infinite' : 'none',
                zIndex: isSelected ? 10 : 1,
              }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 7,
                color: isSelected ? '#fff' : 'rgba(255,255,255,0.5)',
                fontWeight: 700, letterSpacing: '0.05em', pointerEvents: 'none',
              }}>{r.activity}</span>
            </div>
          );
        })}

        {/* Brain outline SVG overlay */}
        <svg viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <ellipse cx="100" cy="85" rx="55" ry="62" fill="none" stroke="rgba(239,33,55,0.15)" strokeWidth="0.5" strokeDasharray="3 5" />
        </svg>
      </div>

      {/* Region detail panel */}
      <div style={{ width: 320, borderLeft: '1px solid rgba(239,33,55,0.15)', padding: 20, overflow: 'auto', background: 'rgba(255,255,255,0.01)' }}>
        <div className="label-mono" style={{ marginBottom: 16 }}>NEURAL REGION DETAIL</div>

        {region ? (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{region.name}</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>{region.function}</div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="label-nano">ACTIVITY</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: region.color, fontWeight: 700 }}>{region.activity}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  width: `${region.activity}%`, height: '100%',
                  background: `linear-gradient(90deg, ${region.color}, ${region.color}88)`,
                  boxShadow: `0 0 12px ${region.color}`,
                }} />
              </div>
            </div>

            <div className="label-nano" style={{ marginBottom: 8, color: '#666' }}>CONNECTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {region.connections.map(cid => {
                const conn = NEURAL_REGIONS.find(r => r.id === cid);
                return conn ? (
                  <button key={cid} onClick={() => onSelect(cid)}
                    style={{
                      padding: '8px 12px', background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 0,
                      cursor: 'pointer', textAlign: 'left' as const,
                      color: '#e8e8e8', fontFamily: 'var(--font-sans)', fontSize: 12,
                    }}>
                    <div style={{ fontWeight: 500 }}>{conn.name}</div>
                    <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Activity: {conn.activity}%</div>
                  </button>
                ) : null;
              })}
            </div>
          </div>
        ) : (
          <div style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>
            Select a neural region to inspect.
            <br /><br />
            Powered by Meta TRIBE v2 — brain response prediction model.
            <br /><br />
            Each node represents a cognitive module. Activity levels are live.
            Connections show neural pathway strength.
          </div>
        )}

        {/* TRIBE v2 badge */}
        <div style={{ marginTop: 24, padding: 10, background: 'rgba(34,220,255,0.05)', border: '1px solid rgba(34,220,255,0.15)', borderRadius: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22dcff', letterSpacing: '0.1em' }}>POWERED BY</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#22dcff', marginTop: 2 }}>TRIBE v2</div>
          <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Meta Brain Response Prediction</div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// MODS PANEL — Cyberpunk augmentations
// ================================================================

function ModsPanel() {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <CircuitBoard size={20} style={{ color: '#ef2137' }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>CYBERNETIC AUGMENTATIONS</div>
          <div style={{ fontSize: 11, color: '#888' }}>6 installed · 6 available · Cyberware Capacity: 42/64</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
        {MOD_SLOTS.map(mod => (
          <div key={mod.id} style={{
            padding: 14,
            background: mod.installed ? 'rgba(239,33,55,0.04)' : 'rgba(255,255,255,0.01)',
            border: `1px solid ${mod.installed ? 'rgba(239,33,55,0.25)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 0,
            opacity: mod.installed ? 1 : 0.6,
            position: 'relative',
          }}>
            {/* Tier dots */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
              {[1,2,3,4,5].map(t => (
                <div key={t} style={{
                  width: 8, height: 8,
                  background: t <= mod.tier ? '#ef2137' : 'rgba(255,255,255,0.08)',
                  boxShadow: t <= mod.tier ? '0 0 6px #ef2137' : 'none',
                }} />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: mod.installed ? '#fff' : '#888' }}>{mod.name}</div>
                <div className="label-nano" style={{ color: '#666', marginTop: 2 }}>{mod.type.toUpperCase()} · TIER {mod.tier}</div>
              </div>
              <div style={{
                padding: '3px 8px',
                background: mod.installed ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${mod.installed ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                fontFamily: 'var(--font-mono)', fontSize: 9, color: mod.installed ? '#10b981' : '#888',
                letterSpacing: '0.1em',
              }}>
                {mod.installed ? 'INSTALLED' : 'AVAILABLE'}
              </div>
            </div>

            <div style={{ fontSize: 11, color: '#888', marginTop: 8, lineHeight: 1.4 }}>
              {mod.description}
            </div>

            {!mod.installed && (
              <button style={{
                marginTop: 10, padding: '6px 14px',
                background: 'rgba(239,33,55,0.12)', border: '1px solid rgba(239,33,55,0.3)',
                color: '#ef2137', fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 0,
              }}>
                INSTALL AUGMENT
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// SKILLS PANEL
// ================================================================

function SkillsPanel() {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Layers size={20} style={{ color: '#ef2137' }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>SKILL TREE</div>
          <div style={{ fontSize: 11, color: '#888' }}>12 skills · Total points spent: 78</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {(['cognition', 'social', 'technical', 'combat'] as const).map(cat => {
          const catSkills = SKILL_TREE.filter(s => s.category === cat);
          const catColor = { cognition: '#ef2137', social: '#f87171', technical: '#22dcff', combat: '#f59e0b' }[cat];
          return (
            <div key={cat} style={{
              padding: 14, background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 0,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: catColor,
                letterSpacing: '0.15em', marginBottom: 12,
              }}>
                {cat.toUpperCase()}
              </div>
              {catSkills.map(skill => (
                <div key={skill.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: '#e8e8e8' }}>{skill.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: catColor }}>
                      {skill.level}/{skill.maxLevel}
                    </span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{
                      width: `${(skill.level / skill.maxLevel) * 100}%`,
                      height: '100%', background: catColor,
                      boxShadow: `0 0 6px ${catColor}`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// KNOWLEDGE GRAPH PANEL — GitNexus-inspired
// ================================================================

function KnowledgeGraphPanel() {
  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Graph visualization */}
      <div style={{ flex: 1, position: 'relative', background: 'radial-gradient(ellipse at center, rgba(34,220,255,0.04), transparent 60%), #020408' }}>
        {/* Central node — Lelu */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 60, height: 60, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,33,55,0.6), transparent 70%)',
          border: '2px solid #ef2137',
          boxShadow: '0 0 40px rgba(239,33,55,0.5), 0 0 80px rgba(239,33,55,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 14,
          color: '#fff',
        }}>LELU</div>

        {/* Surrounding knowledge nodes */}
        {([
          { label: 'REVENANT KERNEL', x: 25, y: 20, color: '#ef2137' },
          { label: 'NEMO CLAW', x: 75, y: 18, color: '#10b981' },
          { label: 'AGENT SYSTEM', x: 85, y: 45, color: '#f59e0b' },
          { label: 'FILESYSTEM', x: 80, y: 72, color: '#888' },
          { label: 'MEMORY', x: 65, y: 82, color: '#22dcff' },
          { label: 'VOICE ENGINE', x: 30, y: 75, color: '#f87171' },
          { label: 'HOLO RENDER', x: 18, y: 50, color: '#ef2137' },
          { label: 'SANDBOX', x: 15, y: 30, color: '#10b981' },
          { label: 'GITNEXUS', x: 55, y: 12, color: '#22dcff' },
          { label: 'TRIBE v2', x: 45, y: 85, color: '#22dcff' },
          { label: 'NEURAL MAP', x: 35, y: 15, color: '#ef2137' },
          { label: 'TASKS', x: 70, y: 65, color: '#f59e0b' },
        ] as const).map(node => (
          <div key={node.label} style={{
            position: 'absolute',
            left: `${node.x}%`, top: `${node.y}%`,
            transform: 'translate(-50%, -50%)',
            padding: '6px 10px',
            background: 'rgba(2,4,8,0.9)',
            border: `1px solid ${node.color}44`,
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: node.color, letterSpacing: '0.1em',
            cursor: 'pointer',
          }}>
            {node.label}
          </div>
        ))}

        {/* Connective SVG lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="50%" y1="50%" x2="25%" y2="20%" stroke="rgba(239,33,55,0.15)" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="75%" y2="18%" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="85%" y2="45%" stroke="rgba(245,158,11,0.15)" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="80%" y2="72%" stroke="rgba(136,136,136,0.15)" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="65%" y2="82%" stroke="rgba(34,220,255,0.15)" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="30%" y2="75%" stroke="rgba(248,113,113,0.15)" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="18%" y2="50%" stroke="rgba(239,33,55,0.15)" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="15%" y2="30%" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="55%" y2="12%" stroke="rgba(34,220,255,0.15)" strokeWidth="0.5" />
          <line x1="50%" y1="50%" x2="45%" y2="85%" stroke="rgba(34,220,255,0.15)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Right panel */}
      <div style={{ width: 300, borderLeft: '1px solid rgba(239,33,55,0.15)', padding: 20, overflow: 'auto', background: 'rgba(255,255,255,0.01)' }}>
        <div className="label-mono" style={{ marginBottom: 16 }}>KNOWLEDGE GRAPH</div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.5 }}>
          Powered by GitNexus — zero-server code intelligence engine.
          <br /><br />
          Indexes the Revenant OS codebase into a live knowledge graph:
          dependencies, call chains, clusters, and execution flows.
        </div>

        <div className="label-nano" style={{ marginBottom: 8, color: '#666' }}>INDEX STATS</div>
        {[
          ['Total files', '2,403'],
          ['Functions', '8,421'],
          ['Classes', '1,247'],
          ['Dependencies', '3,892'],
          ['Call chains', '12,440'],
          ['Clusters', '47'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#22dcff' }}>{value}</span>
          </div>
        ))}

        <div style={{ marginTop: 20, padding: 10, background: 'rgba(34,220,255,0.05)', border: '1px solid rgba(34,220,255,0.15)', borderRadius: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22dcff', letterSpacing: '0.1em' }}>POWERED BY</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#22dcff', marginTop: 2 }}>GITNEXUS</div>
          <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Zero-Server Code Intelligence</div>
        </div>
      </div>
    </div>
  );
}

import { registerApp } from '../../system/appRegistry';
registerApp('companion', () => import('./LeluCompanionApp.tsx').then(m => ({ default: m.LeluCompanionApp })));
