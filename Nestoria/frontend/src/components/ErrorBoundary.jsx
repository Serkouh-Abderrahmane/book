import { Component } from 'react';
import { errorStore, isDev, getBrowserInfo } from '../lib/errorLogger.js';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
    background: '#f7f8fa',
    color: '#111827',
    fontFamily: "'Inter',system-ui,sans-serif",
    padding: 40,
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 24,
    marginBottom: 12,
    width: '100%',
    maxWidth: 760,
    textAlign: 'left',
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
  },
};

function ErrorCard({ label, children, color }) {
  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={{ fontSize: 14, color: color || '#111827', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
}

function DevOverlay({ error, info, onDismiss }) {
  const browserInfo = getBrowserInfo();
  const componentStack = info?.componentStack || '';
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  return (
    <div style={styles.overlay}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8, opacity: 0.5 }}>!</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
          Application Error
        </h1>
        <p style={{ color: '#6B7280', fontSize: 13, marginTop: 8 }}>
          {now} &middot; {typeof window !== 'undefined' ? window.location.href : '?'}
        </p>
      </div>

      <ErrorCard label="Error Message" color="#DC2626">
        {error?.message || String(error)}
      </ErrorCard>

      {componentStack && (
        <ErrorCard label="Component">
          <pre style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {componentStack.split('\n').slice(0, 8).join('\n')}
          </pre>
        </ErrorCard>
      )}

      <ErrorCard label="Route / Page">
        {typeof window !== 'undefined' ? window.location.pathname + (window.location.search || '') : '?'}
      </ErrorCard>

      <ErrorCard label="Browser">
        {browserInfo.browser} on {browserInfo.os}
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, wordBreak: 'break-all' }}>
          {browserInfo.ua}
        </div>
      </ErrorCard>

      <ErrorCard label="Screen">
        {typeof window !== 'undefined' ? `${window.innerWidth} × ${window.innerHeight}` : '?'}
      </ErrorCard>

      {error?.stack && (
        <div style={styles.card}>
          <div style={styles.label}>Stack Trace</div>
          <pre style={{
            fontSize: 11, color: '#e5e7eb', background: '#1f2937',
            padding: 16, borderRadius: 8, overflow: 'auto', maxHeight: 320,
            lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: 0,
          }}>
            {error.stack}
          </pre>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
        <button onClick={() => window.location.reload()}
          style={{
            padding: '14px 32px', fontSize: 15, fontWeight: 600,
            background: '#1a3a6b', color: '#fff', border: 0, borderRadius: 12,
            cursor: 'pointer',
          }}>
          Tải lại trang
        </button>
        {typeof onDismiss === 'function' && (
          <button onClick={onDismiss}
            style={{
              padding: '14px 32px', fontSize: 15, fontWeight: 600,
              background: '#f3f4f6', color: '#4B5563', border: '1px solid #e5e7eb',
              borderRadius: 12, cursor: 'pointer',
            }}>
            Bỏ qua & tiếp tục
          </button>
        )}
      </div>
    </div>
  );
}

function ProdFallback({ error, onDismiss }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 32, textAlign: 'center',
      fontFamily: "'Inter',system-ui,sans-serif", background: '#f7f8fa', color: '#111827',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>!</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Something went wrong
      </h1>
      <p style={{ color: '#6B7280', maxWidth: 420, marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
        An unexpected error occurred. Please try again.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => window.location.reload()}
          style={{
            padding: '12px 28px', fontSize: 14, fontWeight: 600,
            background: '#1a3a6b', color: '#fff', border: 0, borderRadius: 12,
            cursor: 'pointer',
          }}>
          Reload
        </button>
        {typeof onDismiss === 'function' && (
          <button onClick={onDismiss}
            style={{
              padding: '12px 28px', fontSize: 14, fontWeight: 600,
              background: '#f3f4f6', color: '#4B5563', border: '1px solid #e5e7eb',
              borderRadius: 12, cursor: 'pointer',
            }}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    errorStore.add(error);
    console.error('[Chi Vinh Land] Error boundary caught:', error, info?.componentStack || '');
  }

  handleDismiss = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    if (this.state.error) {
      if (isDev()) {
        return (
          <DevOverlay
            error={this.state.error}
            info={this.state.info}
            onDismiss={this.handleDismiss}
          />
        );
      }
      return (
        <ProdFallback
          error={this.state.error}
          onDismiss={this.handleDismiss}
        />
      );
    }
    return this.props.children;
  }
}
