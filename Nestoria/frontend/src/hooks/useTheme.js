import { useEffect, useState } from 'react';

function getInitialTheme() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('nestoria-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch (_) {}
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);
  useEffect(() => {
    try {
      document.documentElement?.setAttribute('data-theme', theme);
    } catch (_) {}
    try {
      localStorage?.setItem('nestoria-theme', theme);
    } catch (_) {}
  }, [theme]);
  return [theme, setTheme];
}
