import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { errorStore } from '../lib/errorLogger.js';

export default function GlobalErrorCapture({ children }) {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const root = document.getElementById('root');
        if (!root || root.children.length === 0) {
          console.warn('[Chi Vinh Land] Root element has no children after route change');
        }
      }, 500);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
      const originalTitle = document.title;
      const observer = new MutationObserver(() => {
        if (!document.getElementById('root')?.children.length) {
          errorStore.add(new Error('Root element went empty during rendering'));
        }
      });
      const root = document.getElementById('root');
      if (root) observer.observe(root, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [location.pathname]);

  return children;
}
