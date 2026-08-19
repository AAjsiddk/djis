import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

const AUTH_KEY = 'sulm-auth-v1';
const PASSWORD = 'AAO818';

interface AuthState {
  isAuthed: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isAuthed) localStorage.setItem(AUTH_KEY, '1');
      else localStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
  }, [isAuthed]);

  const login = useCallback((password: string) => {
    const ok = password === PASSWORD;
    if (ok) setIsAuthed(true);
    return ok;
  }, []);

  const logout = useCallback(() => setIsAuthed(false), []);

  return (
    <AuthContext.Provider value={{ isAuthed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
