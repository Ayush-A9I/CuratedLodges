'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import styles from './admin.module.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    /** Show a toast. Defaults to type 'info' and 4s duration. */
    showToast: (message: string, type?: ToastType, durationMs?: number) => void;
    /** Convenience: success toast. */
    success: (message: string) => void;
    /** Convenience: error toast. */
    error: (message: string) => void;
    /** Convenience: info toast. */
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const idRef = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', durationMs = 4000) => {
            const id = ++idRef.current;
            setToasts((prev) => [...prev, { id, message, type }]);
            if (durationMs > 0) {
                setTimeout(() => dismiss(id), durationMs);
            }
        },
        [dismiss]
    );

    const success = useCallback((m: string) => showToast(m, 'success'), [showToast]);
    const error = useCallback((m: string) => showToast(m, 'error'), [showToast]);
    const info = useCallback((m: string) => showToast(m, 'info'), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, info }}>
            {children}
            <div className={styles.toastViewport} aria-live="polite" aria-atomic="true">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`${styles.toast} ${t.type === 'success'
                                ? styles.toastSuccess
                                : t.type === 'error'
                                    ? styles.toastError
                                    : styles.toastInfo
                            }`}
                        role="status"
                    >
                        <span>{t.message}</span>
                        <button
                            className={styles.toastClose}
                            onClick={() => dismiss(t.id)}
                            aria-label="Dismiss notification"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return ctx;
}

export default ToastProvider;
