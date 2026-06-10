import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { isDev, getBrowserInfo, getErrorHistory } from '../lib/errorLogger.js';

const panelStyle = {
  position: 'fixed',
  bottom: 60,
  right: 20,
  zIndex: 99999,
  background: '#1f2937',
  border: '1px solid #374151',
  borderRadius: 12,
  color: '#e5e7eb',
  fontFamily: "'SF Mono','Fira Code','Courier New',monospace",
  fontSize: 12,
  lineHeight: 1.6,
  padding: 16,
  maxWidth: 420,
  width: '100%',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  overflow: 'auto',
  maxHeight: '80vh',
};

const btnStyle = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 99999,
  background: '#1f2937',
  color: '#e5e7eb',
  border: '1px solid #374151',
  borderRadius: 8,
  padding: '8px 14px',
  fontFamily: "'SF Mono','Fira Code',monospace",
  fontSize: 11,
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
};

function Row({ label, value, color }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
      <span style={{ color: '#9CA3AF', flexShrink: 0 }}>{label}:</span>
      <span style={{ color: color || '#e5e7eb', wordBreak: 'break-all' }}>{value || '—'}</span>
    </div>
  );
}

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          cursor: 'pointer', fontWeight: 600, color: '#F59E0B',
          marginBottom: open ? 4 : 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}
      >
        {open ? '▾' : '▸'} {title}
      </div>
      {open && <div style={{ paddingLeft: 4 }}>{children}</div>}
    </div>
  );
}

export default function DebugPanel() {
  const [open, setOpen] = useState(true);
  const [info, setInfo] = useState(() => {
    const browser = getBrowserInfo();
    const history = getErrorHistory();
    return {
      browser,
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
      errorCount: history.errors.length,
      apiErrorCount: history.apiErrors.length,
      lastError: history.lastError,
    };
  });
  const location = useLocation();

  const refresh = useCallback(() => {
    const browser = getBrowserInfo();
    const history = getErrorHistory();
    setInfo({
      browser,
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
      errorCount: history.errors.length,
      apiErrorCount: history.apiErrors.length,
      lastError: history.lastError,
    });
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    window.addEventListener('resize', refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', refresh);
    };
  }, [refresh]);

  if (!isDev()) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={btnStyle}
        title="Toggle Debug Panel"
      >
        {open ? '✕ Debug' : `⚙ Debug (${info.errorCount + info.apiErrorCount})`}
      </button>
      {open && (
        <div style={panelStyle}>
          <Section title="System">
            <Row label="Browser" value={`${info.browser.browser} on ${info.browser.os}`} />
            <Row label="Screen" value={`${info.width} × ${info.height}`} />
            <Row label="Route" value={location.pathname} />
          </Section>

          <Section title="Errors">
            <Row label="Total" value={String(info.errorCount)} color={info.errorCount > 0 ? '#EF4444' : '#22C55E'} />
            <Row label="API fails" value={String(info.apiErrorCount)} color={info.apiErrorCount > 0 ? '#F59E0B' : '#22C55E'} />
            {info.lastError && (
              <>
                <Row label="Last" value={info.lastError.message.length > 60 ? info.lastError.message.slice(0, 60) + '…' : info.lastError.message} color="#EF4444" />
                <Row label="Time" value={info.lastError.timestamp?.slice(11, 19) || '?'} color="#9CA3AF" />
              </>
            )}
          </Section>
        </div>
      )}
    </>
  );
}
