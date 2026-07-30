import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#020408',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-sans)',
            color: '#e8e8e8',
            padding: 40,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 200, color: '#ef2137', marginBottom: 16 }}>
            BIG BA-DA-BOOM
          </div>
          <div style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>
            Revenant OS encountered a critical error.
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#555',
              maxWidth: 500,
              marginBottom: 24,
              padding: 12,
              background: 'rgba(239,33,55,0.06)',
              border: '1px solid rgba(239,33,55,0.2)',
            }}
          >
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: '10px 24px',
              background: '#ef2137',
              border: 'none',
              borderRadius: 'var(--r-control)',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(239,33,55,0.4)',
            }}
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
