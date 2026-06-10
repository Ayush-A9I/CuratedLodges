'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setTokens, clearTokens, ApiError } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  /**
   * Apply an authentication result (e.g. from an OAuth exchange) directly to the
   * session: persists the tokens and sets the in-memory token/user (Req 8.4).
   */
  setSession: (authResult: { user: User; token: string; refreshToken: string }) => void;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('cl_token');
    if (storedToken) {
      setToken(storedToken);
      api.getMe()
        .then((data) => setUser(data.user || data))
        .catch(() => {
          clearTokens();
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await api.login(email, password);
      setTokens(data.token, data.refreshToken);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      const msg = err instanceof ApiError ? err.data?.error || err.message : 'Login failed';
      setError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    setError(null);
    try {
      const result = await api.register(data);
      setTokens(result.token, result.refreshToken);
      setToken(result.token);
      setUser(result.user);
    } catch (err) {
      const msg = err instanceof ApiError ? err.data?.error || err.message : 'Registration failed';
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore errors — clear local state regardless
    }
    clearTokens();
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const setSession = useCallback(
    (authResult: { user: User; token: string; refreshToken: string }) => {
      setTokens(authResult.token, authResult.refreshToken);
      setToken(authResult.token);
      setUser(authResult.user);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        setSession,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
