'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminShell, ToastProvider } from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

const LOGIN_PATH = '/admin/login';

/**
 * Guards authenticated /admin routes. While hydrating, shows a loader. When
 * unauthenticated, redirects to the login page. Otherwise renders the
 * AdminShell (sidebar + topbar) around the page content.
 */
function AdminGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(LOGIN_PATH);
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className={styles.pageLoader}>
                <div className={styles.spinner} />
                Loading admin…
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect is in flight; render the loader to avoid a flash of content.
        return (
            <div className={styles.pageLoader}>
                <div className={styles.spinner} />
                Redirecting…
            </div>
        );
    }

    return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginRoute = pathname === LOGIN_PATH;

    return (
        <AdminAuthProvider>
            <ToastProvider>
                {isLoginRoute ? children : <AdminGuard>{children}</AdminGuard>}
            </ToastProvider>
        </AdminAuthProvider>
    );
}
