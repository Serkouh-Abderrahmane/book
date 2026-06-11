const LOG_PREFIX = '[Chi Vinh Land]';

export const errorStore = {
  errors: [],
  lastError: null,
  apiErrors: [],

  add(error) {
    const entry = {
      message: error?.message || String(error),
      stack: error?.stack || '',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };
    this.errors.push(entry);
    if (this.errors.length > 50) this.errors.shift();
    this.lastError = entry;
    return entry;
  },

  addApiError(url, status, data) {
    const entry = { url, status, data, timestamp: new Date().toISOString() };
    this.apiErrors.push(entry);
    if (this.apiErrors.length > 20) this.apiErrors.shift();
    return entry;
  },

  clear() {
    this.errors = [];
    this.lastError = null;
    this.apiErrors = [];
  },
};

function isDev() {
  if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
    if (import.meta.env.DEV) return true;
  }
  if (typeof location === 'undefined') return false;
  const host = location.hostname;
  // Only treat as dev if explicitly localhost/127.0.0.1, NOT tunnelmole/ngrok URLs
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
}

function getComponentStack(error) {
  if (!error || !error.stack) return '';
  const lines = error.stack.split('\n');
  const reactLines = lines.filter(l => l.includes('/src/') || l.includes('\\src\\'));
  return reactLines.length ? reactLines.join('\n') : lines.slice(1, 5).join('\n');
}

export function renderInlineError(rootEl, error) {
  if (!rootEl) return;
  const entry = errorStore.add(error);
  const isDevMode = isDev();
  rootEl.innerHTML = `
<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:'Inter',system-ui,sans-serif;padding:32px;background:#f7f8fa;color:#111827;text-align:center">
  <div style="font-size:48px;margin-bottom:16px;opacity:0.6">!</div>
  <h1 style="font-size:24px;font-weight:700;margin-bottom:8px">${isDevMode ? 'Application Error' : 'Đã xảy ra lỗi'}</h1>
  <p style="color:#6B7280;max-width:420px;margin-bottom:24px;font-size:14px;line-height:1.6">
    ${isDevMode ? 'Ứng dụng không thể khởi động. Xem chi tiết bên dưới.' : 'Ứng dụng không thể khởi động. Vui lòng tải lại trang.'}
  </p>
  <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:24px">
    <button onclick="location.reload()" style="padding:12px 28px;font-size:14px;font-weight:600;background:#1a3a6b;color:#fff;border:0;border-radius:12px;cursor:pointer">Tải lại trang</button>
  </div>
  ${isDevMode ? `
    <div style="max-width:800px;width:100%;text-align:left">
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:12px">
        <div style="font-size:12px;color:#6B7280;margin-bottom:4px">Error Message</div>
        <div style="font-size:16px;font-weight:600;color:#DC2626;word-break:break-word">${escapeHtml(entry.message)}</div>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:12px">
        <div style="font-size:12px;color:#6B7280;margin-bottom:4px">Route</div>
        <div style="font-size:14px;font-weight:500;color:#111827">${escapeHtml(entry.url)}</div>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:12px">
        <div style="font-size:12px;color:#6B7280;margin-bottom:4px">Browser</div>
        <div style="font-size:13px;color:#374151;word-break:break-word">${escapeHtml(entry.userAgent)}</div>
      </div>
      ${entry.stack ? `
        <div style="background:#1f2937;border:1px solid #374151;border-radius:12px;padding:20px;margin-bottom:12px">
          <div style="font-size:12px;color:#9CA3AF;margin-bottom:8px">Stack Trace</div>
          <pre style="font-size:11px;color:#e5e7eb;margin:0;overflow:auto;max-height:300px;line-height:1.5;white-space:pre-wrap">${escapeHtml(entry.stack)}</pre>
        </div>
      ` : ''}
    </div>
  ` : ''}
</div>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function initErrorLogger() {
  if (typeof window === 'undefined') return;

  window.onerror = function (msg, source, line, col, error) {
    errorStore.add(error || new Error(msg));
    console.error(`${LOG_PREFIX} Runtime error:`, { message: msg, source, line, col, error, url: window.location.href });
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    const err = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    errorStore.add(err);
    console.error(`${LOG_PREFIX} Unhandled promise rejection:`, { reason: event.reason, stack: event.reason?.stack, url: window.location.href });
  });

  const origAddEventListener = window.addEventListener.bind(window);
  window.addEventListener = function (type, listener, options) {
    if (type === 'error' && typeof listener === 'function') {
      const wrapped = function (event) {
        try {
          if (event instanceof Event && event.target) {
            const tag = event.target.tagName || '';
            const src = event.target.src || event.target.href || '';
            if (tag && src) {
              errorStore.addApiError(src, 0, { tag, type: 'asset_load_failed' });
              console.warn(`${LOG_PREFIX} Failed to load asset:`, { tag, src, type });
            }
          }
        } catch (_) {}
        return listener.apply(this, arguments);
      };
      return origAddEventListener(type, wrapped, options);
    }
    return origAddEventListener(type, listener, options);
  };

  console.log(`${LOG_PREFIX} Error logger initialized`);
}

export function logError(context, error) {
  errorStore.add(error);
  console.error(`${LOG_PREFIX} [${context}]:`, { error: error?.message || error, stack: error?.stack, timestamp: new Date().toISOString() });
}

export function getErrorHistory() {
  return { errors: errorStore.errors, apiErrors: errorStore.apiErrors, lastError: errorStore.lastError };
}

export function getBrowserInfo() {
  if (typeof navigator === 'undefined') return { browser: 'unknown', os: 'unknown' };
  const ua = navigator.userAgent;
  const browser = /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : /Edge/i.test(ua) ? 'Edge' : 'Unknown';
  const os = /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : 'Unknown';
  return { browser, os, ua };
}

export { isDev };
