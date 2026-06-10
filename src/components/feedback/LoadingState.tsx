'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LoadingState.module.css';

export interface LoadingStateProps {
    /**
     * Pre-resolved loading message. When provided it is shown verbatim and
     * takes precedence over `messageKey`.
     */
    message?: string;
    /**
     * Translation key resolved through `react-i18next`. Defaults to
     * `common.loading`.
     */
    messageKey?: string;
    /** Visual variant: a centered spinner or a skeleton block placeholder. */
    variant?: 'spinner' | 'skeleton';
    /** Spinner size in pixels. Defaults to 32. Ignored for the skeleton variant. */
    size?: number;
    /** Number of skeleton lines to render for the skeleton variant. Defaults to 3. */
    lines?: number;
    /** Optional extra class names applied to the root element. */
    className?: string;
}

/**
 * Themed loading indicator used across awaited surfaces (Req 13.1).
 *
 * Renders either a brand-orange spinner with a translated label or a set of
 * shimmering skeleton lines. All text is resolved through the
 * Translation_System; the message defaults to the `common.loading` key.
 *
 * The root carries `role="status"` and `aria-live="polite"` so assistive
 * technology announces that content is loading.
 */
export default function LoadingState({
    message,
    messageKey = 'common.loading',
    variant = 'spinner',
    size = 32,
    lines = 3,
    className,
}: LoadingStateProps) {
    const { t } = useTranslation();
    const label = message ?? t(messageKey);
    const rootClasses = [styles.container, className].filter(Boolean).join(' ');

    if (variant === 'skeleton') {
        return (
            <div
                className={rootClasses}
                role="status"
                aria-live="polite"
                aria-label={label}
            >
                <div className={styles.skeleton} aria-hidden="true">
                    {Array.from({ length: Math.max(1, lines) }).map((_, index) => (
                        <span key={index} className={styles.skeletonLine} />
                    ))}
                </div>
                <span className={styles.srOnly}>{label}</span>
            </div>
        );
    }

    return (
        <div
            className={rootClasses}
            role="status"
            aria-live="polite"
            aria-label={label}
        >
            <span
                className={styles.spinner}
                style={{ width: size, height: size }}
                aria-hidden="true"
            />
            <p className={styles.message}>{label}</p>
        </div>
    );
}
