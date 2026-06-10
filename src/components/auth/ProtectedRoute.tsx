'use client';

import React from 'react';
import { LoadingState } from '@/components/feedback';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export interface ProtectedRouteProps {
    /** Protected content rendered only once auth resolves to a user. */
    children: React.ReactNode;
}

/**
 * Authentication guard for protected pages (Req 12).
 *
 * Delegates redirect logic to {@link useProtectedRoute}:
 * - While auth is being determined (`'loading'`) or a redirect is in progress
 *   (`'redirecting'`), renders a {@link LoadingState} and withholds children
 *   (Req 12.1). The hook handles the 10 second resolution ceiling (Req 12.6)
 *   and recording the intended path before redirecting to sign-in (Req 12.2).
 * - When auth resolves with a user (`'authenticated'`), renders children
 *   (Req 12.3).
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const status = useProtectedRoute();

    if (status === 'authenticated') {
        return <>{children}</>;
    }

    // 'loading' or 'redirecting': withhold protected content and show feedback.
    return <LoadingState />;
}
