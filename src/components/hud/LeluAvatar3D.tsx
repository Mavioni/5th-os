interface Props {
  talking: boolean;
}

export function LeluAvatar3D({ talking }: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: 380,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0a0608 0%, #020408 100%)',
      }}
    >
      {/* Portrait image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/lelu-avatar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          filter: 'brightness(0.85) contrast(1.1)',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 35%, transparent 25%, rgba(2,4,8,0.5) 60%, #020408 95%)',
          pointerEvents: 'none',
        }}
      />

      {/* CRT scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          mixBlendMode: 'overlay' as const,
          background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(136,221,255,0.015) 2px, rgba(136,221,255,0.015) 3px)',
          zIndex: 1,
        }}
      />

      {/* Holographic frame */}
      <div
        style={{
          position: 'absolute',
          inset: 8,
          border: '1px solid rgba(136,221,255,0.12)',
          pointerEvents: 'none',
          zIndex: 2,
          boxShadow: 'inset 0 0 0 1px rgba(136,221,255,0.04)',
        }}
      />

      {/* Corner accents */}
      {[
        { top: 6, left: 6 },
        { top: 6, right: 6 },
        { bottom: 6, left: 6 },
        { bottom: 6, right: 6 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            width: 14,
            height: 14,
            borderTop: '1px solid rgba(136,221,255,0.25)',
            borderLeft: '1px solid rgba(136,221,255,0.25)',
            transform: `rotate(${i * 90}deg)`,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      ))}

      {/* Name overlay */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '0.25em',
            color: 'rgba(136,221,255,0.45)',
            textShadow: '0 0 8px rgba(136,221,255,0.2)',
          }}
        >
          SBJ·001
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#fafafa',
            letterSpacing: '0.06em',
            textShadow: '0 0 14px rgba(136,221,255,0.35)',
            marginTop: 2,
          }}
        >
          LELU
        </div>
      </div>

      {/* Status */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <span
          className="label-nano"
          style={{
            color: talking ? '#ef2137' : '#10b981',
            textShadow: talking ? '0 0 6px rgba(239,33,55,0.4)' : 'none',
          }}
        >
          {talking ? '● SPEAKING' : '● ONLINE'}
        </span>
      </div>
    </div>
  );
}
