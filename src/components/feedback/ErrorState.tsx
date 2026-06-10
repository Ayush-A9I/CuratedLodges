'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ErrorState.module.css';

export interface ErrorStateProps {
    /**
     * Pre-resolved, user-readable error message (e.g. from `normalizeError`).
     * Takes precedence over `messageKey`.
     */
    message?: string;
    /**
     * Translation key resolved through `react-i18next` when no `message` is
     * provided. Defaults to the generic `errors.unknown` fallback.
     */
    messageKey?: string;
    /**
     * Optional retry handler. When provided, a brand-styled retry button is
     * rendered. Read-only retrievals supply this; mutations omit it.
     */
    onRetry?: () => void;
    /** Pre-resolved label for the retry button. Overrides `retryLabelKey`. */
    retryLabel?: string;
    /** Translation key for the retry button label. Defaults to `common.retry`. */
    retryLabelKey?: string;
    /** Optional extra class names applied to the root element. */
    className?: string;
}

/**
 * Themed error indicator used across awaited surfaces (Req 13.2/13.4/13.5/13.8).
 *
 * Shows a user-readable message and, optionally, a retry button styled with the
 * brand orange treatment. All text is resolved through the Translation_System;
 * the message defaults to the `errors.unknown` key and the retry label to
 * `common.retry`.
 *
 * The root carries `role="alert"` so assistive technology announces the error.
 */
export default function ErrorState({
    message,
    messageKey = 'errors.unknown',
    onRetry,
    retryLabel,
    retryLabelKey = 'common.retry',
    className,
}: ErrorStateProps) {
    const { t } = useTranslation();
    const text = message ?? t(messageKey);
    const buttonLabel = retryLabel ?? t(retryLabelKey);
    const rootClasses = [styles.container, className].filter(Boolean).join(' ');

    return (
        <div className={rootClasses} role="alert">
            <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className={styles.message}>{text}</p>
            {onRetry && (
                <button
                    type="button"
                    className={styles.retryButton}
                    onClick={onRetry}
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    );
}
