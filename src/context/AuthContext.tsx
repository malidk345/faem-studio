/**
 * AuthContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages customer authentication state.
 *
 * When VITE_MEDUSA_BACKEND_URL is set:
 *   • login()    → calls medusa.auth.authenticate() (real JWT/cookie session)
 *   • logout()   → calls medusa.auth.deleteSession()
 *   • On mount   → restores session via medusa.auth.getSession()
 *
 * When the backend is NOT configured (local dev / Cloudflare Pages preview):
 *   • Falls back to localStorage mock so the UI is fully interactive.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginCustomer,
  logoutCustomer,
  getSessionCustomer,
  registerCustomer,
  type MedusaCustomer,
} from '../lib/medusa-api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LOCAL_KEY = 'faem_user';

function customerToUser(c: MedusaCustomer): User {
  const nameParts = [c.first_name, c.last_name].filter(Boolean);
  return {
    id: c.id,
    name: nameParts.length ? nameParts.join(' ') : c.email.split('@')[0],
    email: c.email,
  };
}

function persistUser(u: User) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(u));
}
function clearPersistedUser() {
  localStorage.removeItem(LOCAL_KEY);
}
function getPersistedUser(): User | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount — try to restore session from Medusa, fallback to localStorage
  useEffect(() => {
    (async () => {
      try {
        const customer = await getSessionCustomer();
        if (customer) {
          const u = customerToUser(customer);
          setUser(u);
          persistUser(u);
        } else {
          // Backend not configured or no active session — use localStorage
          setUser(getPersistedUser());
        }
      } catch {
        setUser(getPersistedUser());
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const customer = await loginCustomer(email, password);
      const u = customerToUser(customer);
      setUser(u);
      persistUser(u);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Sign in failed. Please check your credentials.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const customer = await registerCustomer(email, password, firstName, lastName);
        const u = customerToUser(customer);
        setUser(u);
        persistUser(u);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          'Registration failed. Please try again.';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutCustomer();
    } finally {
      setUser(null);
      clearPersistedUser();
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
