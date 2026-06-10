'use client';

import React from 'react';
import styles from './admin.module.css';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export interface AdminShellProps {
    children: React.ReactNode;
}

/**
 * The authenticated admin chrome: a fixed sidebar, a topbar with the admin's
 * identity + logout, and a scrollable content area. The `.theme` class scopes
 * the brand CSS variables used by all admin components.
 */
export function AdminShell({ children }: AdminShellProps) {
    return (
        <div className={`${styles.theme} ${styles.shell}`}>
            <Sidebar />
            <div className={styles.main}>
                <Topbar />
                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}

export default AdminShell;
