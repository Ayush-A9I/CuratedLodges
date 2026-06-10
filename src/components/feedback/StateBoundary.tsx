'use client';

import React from 'react';
import { LoadingState, ErrorState, EmptyState } from './';
import type { NormalizedError } from '@/lib/errors';

export interface StateBoundaryProps {
    /** Whether the awaited request is currently in flight. */
    loading: boolean;
    /**
     * The active error, if any. Accepts a {@link NormalizedError} (whose
     * `.message` is shown) or a pre-resolved string. `null` means no error.
     */
    error: NormalizedError | string | null;
    /**
     * Whether a successful response carried no items. Only consulted when not
     * loading and no error is present.
     */
    empty?: boolean;
    /**
     * Optional retry handler forwarded to the {@link ErrorState}. Read-only
     * retrievals supply this; mutations omit it.
     */
    onRetry?: () => void;
    /** Translation key for the empty-state message. */
    emptyMessageKey?: string;
    /** Pre-resolved empty-state message. Takes precedence over `emptyMessageKey`. */
    emptyMessage?: string;
    /** The data content, rendered only when not loading, no error, and not empty. */
    children: React.ReactNode;
}

/**
 * Presentational wrapper that renders exactly ONE of the loading, error, empty,
 * or data states for an awaited surface, guaranteeing uniform UX states and
 * that partial/placeholder data is never shown alongside an error
 * (Req 1.4, 5.6, 10.7).
 *
 * Precedence: loading > error > empty > data. Error always takes precedence over
 * data, so data children are never rendered while an error is present.
 */
export default function StateBoundary({
    loading,
    error,
    empty = false,
    onRetry,
    emptyMessageKey,
    emptyMessage,
    children,
}: StateBoundaryProps) {
    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        const message = typeof error === 'string' ? error : error.message;
        return <ErrorState message={message} onRetry={onRetry} />;
    }

    if (empty) {
        return <EmptyState message={emptyMessage} messageKey={emptyMessageKey} />;
    }

    return <>{children}</>;
}
