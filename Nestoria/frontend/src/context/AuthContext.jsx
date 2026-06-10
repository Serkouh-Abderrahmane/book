import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

function read() {
  try {
    const token = localStorage.getItem('nestoria-token');
    const user  = JSON.parse(localStorage.getItem('nestoria-user') || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(read);

  useEffect(() => {
    const onStorage = () => setState(read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (token, user) => {
    try { localStorage?.setItem('nestoria-token', token); } catch (_) {}
    try { localStorage?.setItem('nestoria-user', JSON.stringify(user)); } catch (_) {}
    setState({ token, user });
  };

  const logout = () => {
    try { localStorage?.removeItem('nestoria-token'); } catch (_) {}
    try { localStorage?.removeItem('nestoria-user'); } catch (_) {}
    setState({ token: null, user: null });
  };

  const setUser = (user) => {
    try { localStorage?.setItem('nestoria-user', JSON.stringify(user)); } catch (_) {}
    setState((s) => ({ ...s, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
