import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface the error in the console for debugging without crashing the page.
    if (typeof console !== 'undefined') {
      console.error('Unhandled UI error:', error, info);
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: '#0b0f1a',
            color: '#e7ecf5',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '32rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Something went wrong
            </h1>
            <p style={{ opacity: 0.75, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We hit an unexpected problem loading this page. Please refresh to try again. If the
              problem continues, please let us know.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.06)',
                color: '#e7ecf5',
                padding: '0.6rem 1.4rem',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
