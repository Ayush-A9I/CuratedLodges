'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
    /**
     * Pre-resolved, user-readable empty message. Takes precedence over
     * `messageKey`.
     */
    message?: string;
    /**
     * Translation key resolved through `react-i18next` when no `message` is
     * provided. Defaults to the generic `common.empty` key.
     */
    messageKey?: string;
    /** Optional title rendered above the message. */
    title?: string;
    /** Translation key for the optional title. Used when `title` is absent. */
    titleKey?: string;
    /** Optional extra class names applied to the root element. */
    className?: string;
}

/**
 * Themed empty-state indicator shown when a successful response carries no
 * items (e.g. an empty bookings list, Req 5.5).
 *
 * Renders a translated message; all text is resolved through the
 * Translation_System with the message defaulting to the `common.empty` key.
 */
export default function EmptyState({
    message,
    messageKey = 'common.empty',
    title,
    titleKey,
    className,
}: EmptyStateProps) {
    const { t } = useTranslation();
    const text = message ?? t(messageKey);
    const heading = title ?? (titleKey ? t(titleKey) : undefined);
    const rootClasses = [styles.container, className].filter(Boolean).join(' ');

    return (
        <div className={rootClasses} role="status" aria-live="polite">
            {heading && <p className={styles.title}>{heading}</p>}
            <p className={styles.message}>{text}</p>
        </div>
    );
}
