import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100dvh', padding: 32, textAlign: 'center', background: 'var(--bg)',
        }}>
          <h1 style={{ fontSize: 32, marginBottom: 8, color: 'var(--ink)' }}>Có lỗi xảy ra</h1>
          <p style={{ color: 'var(--ink-muted)', maxWidth: 400, marginBottom: 24 }}>
            Rất tiếc, đã có lỗi không mong muốn. Bạn vui lòng tải lại trang nhé.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
