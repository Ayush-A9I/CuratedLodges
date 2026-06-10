'use client';

import React from 'react';
import styles from './admin.module.css';

export interface PageHeaderProps {
    /** Page title. */
    title: string;
    /** Optional subtitle / description shown under the title. */
    subtitle?: string;
    /** Label for the primary action button. */
    actionLabel?: string;
    /** Click handler for the primary action button. */
    onAction?: () => void;
    /** Render a fully custom action node instead of the default button. */
    action?: React.ReactNode;
}

/** Standard admin page header: title + optional primary action. */
export function PageHeader({ title, subtitle, actionLabel, onAction, action }: PageHeaderProps) {
    return (
        <div className={styles.pageHeader}>
            <div>
                <h1 className={styles.pageHeaderTitle}>{title}</h1>
                {subtitle && <p className={styles.pageHeaderSubtitle}>{subtitle}</p>}
            </div>
            {action
                ? action
                : actionLabel && onAction && (
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onAction}>
                        {actionLabel}
                    </button>
                )}
        </div>
    );
}

export default PageHeader;
