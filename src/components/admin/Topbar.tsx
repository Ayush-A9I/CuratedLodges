'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ADMIN_NAV } from './Sidebar';

/** Resolve a human-friendly page title from the current pathname. */
function titleForPath(pathname: string | null): string {
    if (!pathname) return 'Admin';
    for (const group of ADMIN_NAV) {
        for (const item of group.items) {
            if (item.href === '/admin' && pathname === '/admin') return item.label;
            if (item.href !== '/admin' && (pathname === item.href || pathname.startsWith(`${item.href}/`))) {
                return item.label;
            }
        }
    }
    return 'Admin';
}

function initials(name?: string): string {
    if (!name) return 'A';
    return name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function Topbar() {
    const pathname = usePathname();
    const { admin, logout } = useAdminAuth();

    return (
        <header className={styles.topbar}>
            <div className={styles.topbarTitle}>{titleForPath(pathname)}</div>
            <div className={styles.topbarRight}>
                <div className={styles.adminMeta}>
                    <div className={styles.adminName}>{admin?.name || 'Admin'}</div>
                    {admin?.role && <div className={styles.adminRole}>{admin.role.replace('_', ' ')}</div>}
                </div>
                <div className={styles.avatar} aria-hidden>
                    {initials(admin?.name)}
                </div>
                <button className={styles.logoutBtn} onClick={logout}>
                    Log out
                </button>
            </div>
        </header>
    );
}

export default Topbar;
