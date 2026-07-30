import React from 'react';
import { useOSStore } from '../../system/osStore';

export function HoloUnit() {
  const { leluTalking } = useOSStore();
  const [t, setT] = React.useState(0);

  // Animation loop
  React.useEffect(() => {
    let raf: number;
    const tick = () => {
      setT((prev) => prev + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Simulated bio data
  const heartRate = 68 + Math.sin(t / 40) * 5;
  const sigPct = 78 + Math.sin(t / 30) * 10;
  const glowPulse = 0.5 + Math.sin(t / 50) * 0.3;

  const SX = 24;
  const SY = 38;
  const SW = 272;
  const SH = 320;

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 320,
        height: 420,
        zIndex: 50,
      }}
    >
      {/* Outer bezel */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 0,
          background: `
            linear-gradient(180deg, #1a0a0e 0%, #0a0303 50%, #1a0a0e 100%)
          `,
          border: '2px solid #2a0a10',
          boxShadow: `
            inset 0 0 0 1px rgba(239,33,55,0.15),
            inset 0 -2px 0 rgba(0,0,0,0.8),
            0 22px 60px rgba(0,0,0,0.85),
            0 0 0 1px rgba(0,0,0,0.9),
            0 0 32px rgba(239,33,55,${glowPulse * 0.18})
          `,
        }}
      />

      {/* Top vent grill */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          right: 14,
          top: 8,
          height: 18,
          background:
            'repeating-linear-gradient(90deg, transparent 0 2px, rgba(0,0,0,0.85) 2px 4px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.6)',
          opacity: 0.9,
        }}
      />

      {/* LED heartbeat */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 22,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: '#ef2137',
          boxShadow: `0 0 6px #ef2137, 0 0 12px rgba(239,33,55,${glowPulse})`,
          animation: 'lelu-led 1.1s steps(2) infinite',
        }}
      />

      {/* Stamped serial */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 18,
          fontFamily: 'var(--font-mono)',
          fontSize: 7,
          letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.28)',
        }}
      >
        RVNT—HOLO·UNIT—07
      </div>

      {/* Signal bars (left rail) */}
      <div
        style={{
          position: 'absolute',
          left: 5,
          top: SY,
          bottom: 56,
          width: 12,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '4px 0',
        }}
      >
        {[0.6, 0.8, 0.5, 0.9, 0.7, 0.3].map((v, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: `${20 + v * 22}%`,
              marginLeft: 4,
              background: 'linear-gradient(180deg, #ef2137, #8b1419)',
              boxShadow: `0 0 4px rgba(239,33,55,${v * 0.9})`,
              opacity: 0.45 + v * 0.55,
            }}
          />
        ))}
      </div>

      {/* Vertical readout (right rail) */}
      <div
        style={{
          position: 'absolute',
          right: 4,
          top: SY + 6,
          bottom: 60,
          width: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 7,
          letterSpacing: '0.2em',
          color: 'rgba(239,33,55,0.85)',
          writingMode: 'vertical-rl' as const,
          textOrientation: 'mixed' as const,
          textShadow: '0 0 4px rgba(239,33,55,0.6)',
        }}
      >
        <span>HOLO·CH 07</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
          SYNC {Math.round(sigPct)}%
        </span>
        <span>BIO·LK</span>
      </div>

      {/* Screen window */}
      <div
        style={{
          position: 'absolute',
          left: SX,
          top: SY,
          width: SW,
          height: SH,
          borderRadius: 0,
          overflow: 'hidden',
          background: '#020003',
          boxShadow: `
            inset 0 0 0 1px rgba(239,33,55,0.55),
            inset 0 0 1px 2px rgba(0,0,0,0.9),
            inset 0 0 60px rgba(0,0,0,0.9),
            inset 0 0 24px rgba(239,33,55,${glowPulse * 0.35})
          `,
        }}
      >
        {/* Vacuum void with floor grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse at 50% 70%, rgba(239,33,55,0.15) 0%, transparent 60%),
              linear-gradient(180deg, #0a0205 0%, #050103 100%)
            `,
          }}
        />
        {/* Perspective grid floor */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '38%',
            background: `
              linear-gradient(180deg, transparent 0%, rgba(239,33,55,0.18) 100%),
              repeating-linear-gradient(90deg, transparent 0 14px, rgba(239,33,55,0.35) 14px 15px),
              repeating-linear-gradient(0deg, transparent 0 6px, rgba(239,33,55,0.25) 6px 7px)
            `,
            transform: 'perspective(120px) rotateX(58deg)',
            transformOrigin: 'center bottom',
            opacity: 0.55,
            maskImage: 'linear-gradient(180deg, transparent, black 40%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent, black 40%)',
          }}
        />

        {/* Hologram layer — character silhouette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'rgba(239,33,55,0.3)',
            letterSpacing: '0.15em',
          }}
        >
          ◈ LELU ◈
        </div>
      </div>

      {/* Bottom dash */}
      <div
        style={{
          position: 'absolute',
          left: SX,
          right: 18,
          bottom: 18,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 8px',
          background: 'rgba(0,0,0,0.4)',
          borderTop: '1px solid rgba(239,33,55,0.2)',
          borderRadius: 0,
        }}
      >
        <span
          className="label-nano"
          style={{ color: '#ef2137' }}
        >
          HB·{Math.round(heartRate)}
        </span>
        <span style={{ color: '#666', fontSize: 9 }}>♥</span>
        <span className="label-nano">
          {String(Math.floor(t / 20) % 24).padStart(2, '0')}:
          {String(t % 60).padStart(2, '0')}
        </span>
        <div style={{ flex: 1 }} />
        {leluTalking ? (
          <span className="label-nano" style={{ color: '#ef2137' }}>
            ● SPEAKING
          </span>
        ) : (
          <span className="label-nano" style={{ color: '#10b981' }}>
            &gt; LISTENING
          </span>
        )}
      </div>
    </div>
  );
}
