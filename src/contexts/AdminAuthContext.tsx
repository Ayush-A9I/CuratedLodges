'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    adminApi,
    AdminApiError,
    AdminUser,
    setAdminToken,
    clearAdminToken,
    getAdminToken,
    getStoredAdmin,
} from '@/lib/adminApi';

interface AdminAuthContextValue {
    /** The authenticated admin, or null when logged out. */
    admin: AdminUser | null;
    /** The current admin JWT, or null when logged out. */
    token: string | null;
    /** True while hydrating from localStorage on first mount. */
    isLoading: boolean;
    /** Convenience flag: true when an admin is authenticated. */
    isAuthenticated: boolean;
    /** Last login error message, or null. */
    error: string | null;
    /** Authenticate with email + password. Persists token + admin on success. */
    login: (email: string, password: string) => Promise<void>;
    /** Clear the session (token + admin) from memory and localStorage. */
    logout: () => void;
    /** Reset the error state. */
    clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hydrate from localStorage on mount.
    useEffect(() => {
        const storedToken = getAdminToken();
        const storedAdmin = getStoredAdmin();
        if (storedToken && storedAdmin) {
            setToken(storedToken);
            setAdmin(storedAdmin);
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        try {
            const { token: newToken, admin: newAdmin } = await adminApi.login(email, password);
            setAdminToken(newToken, newAdmin);
            setToken(newToken);
            setAdmin(newAdmin);
        } catch (err) {
            const msg =
                err instanceof AdminApiError
                    ? err.data?.error || err.data?.message || err.message
                    : 'Login failed. Please try again.';
            setError(msg);
            throw err;
        }
    }, []);

    const logout = useCallback(() => {
        clearAdminToken();
        setToken(null);
        setAdmin(null);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                token,
                isLoading,
                isAuthenticated: !!token && !!admin,
                error,
                login,
                logout,
                clearError,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth(): AdminAuthContextValue {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return ctx;
}

export default AdminAuthContext;
