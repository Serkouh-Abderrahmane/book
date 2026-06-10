import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { queryClient } from './lib/queryClient.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { initErrorLogger } from './lib/errorLogger.js';
import './styles/index.css';

initErrorLogger();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function renderApp() {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;padding:32px;text-align:center"><h1 style="font-size:24px;margin-bottom:8px">Không thể tải ứng dụng</h1><p style="color:#666;max-width:400px">Trang web bị thiếu cấu trúc cần thiết. Vui lòng tải lại hoặc liên hệ hỗ trợ.</p></div>';
    console.error('[Chi Vinh Land] Missing #root element');
    return;
  }
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <GoogleOAuthProvider clientId={googleClientId}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

try {
  renderApp();
} catch (err) {
  console.error('[Chi Vinh Land] Fatal startup error:', err);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;padding:32px;text-align:center"><h1 style="font-size:24px;margin-bottom:8px">Đã xảy ra lỗi</h1><p style="color:#666;max-width:400px;margin-bottom:16px">Ứng dụng không thể khởi động. Vui lòng tải lại trang.</p><button onclick="location.reload()" style="padding:12px 24px;font-size:14px;font-weight:600;background:#1a3a6b;color:white;border:0;border-radius:8px;cursor:pointer">Tải lại trang</button></div>';
  }
}
