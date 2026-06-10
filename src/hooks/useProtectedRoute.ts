'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { storePostLoginPath } from '@/lib/auth-redirect';

/**
 * Resolved status of a protected route guard.
 *
 * - `loading`      — auth state is still being determined; content must be
 *                    withheld and a Loading_State shown (Req 12.1).
 * - `authenticated`— auth resolved with a user present; content may render
 *                    (Req 12.3).
 * - `redirecting`  — auth resolved (or timed out) with no user; the guard has
 *                    recorded the intended path and is navigating to sign-in
 *                    (Req 12.2 / 12.6). Content must stay withheld.
 */
export type ProtectedRouteStatus = 'loading' | 'authenticated' | 'redirecting';

/** Destination for unauthenticated users. */
const SIGN_IN_PATH = '/signin';

/**
 * Maximum time (ms) we wait for the Auth_Context to resolve before treating the
 * user as unauthenticated and redirecting (Req 12.6).
 */
const AUTH_RESOLUTION_CEILING_MS = 10_000;

/**
 * Encapsulates the redirect logic for an authentication-protected route.
 *
 * Behavior (Req 12.1, 12.2, 12.3, 12.6):
 * - While the Auth_Context is still determining state (`isLoading`), returns
 *   `'loading'` so callers withhold protected content and show a Loading_State.
 * - Applies a 10 second ceiling: if auth has not resolved within that window,
 *   the user is treated as unauthenticated and redirected to sign-in.
 * - When auth resolves with no user, the current path is recorded via
 *   {@link storePostLoginPath} (so the sign-in flow can return the user there —
 *   Req 12.4) and `router.replace('/signin')` is issued.
 * - When auth resolves with a user present, returns `'authenticated'`.
 *
 * Note on Req 12.5 (clear user on post-refresh 401): the token refresh +
 * 401-clearing is handled by `api.ts` and `AuthContext`. Once the context user
 * is cleared, this guard observes "no user" and performs the redirect — its
 * job here is redirect-on-no-user, not token management.
 */
export function useProtectedRoute(): ProtectedRouteStatus {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Tracks whether the 10s ceiling has elapsed without auth resolving.
    const [timedOut, setTimedOut] = useState(false);
    // Guards against issuing more than one redirect.
    const hasRedirected = useRef(false);

    // Start (and clean up) the 10s resolution ceiling while auth is loading.
    useEffect(() => {
        if (!isLoading) {
            return;
        }
        const timer = setTimeout(() => {
            setTimedOut(true);
        }, AUTH_RESOLUTION_CEILING_MS);
        return () => clearTimeout(timer);
    }, [isLoading]);

    // Still determining auth state and the ceiling has not elapsed.
    const stillResolving = isLoading && !timedOut;

    useEffect(() => {
        if (stillResolving) {
            return;
        }
        if (user) {
            return;
        }
        // Resolved (or timed out) with no user: record the intended path and
        // redirect to sign-in exactly once (Req 12.2 / 12.6).
        if (hasRedirected.current) {
            return;
        }
        hasRedirected.current = true;
        if (pathname) {
            storePostLoginPath(pathname);
        }
        router.replace(SIGN_IN_PATH);
    }, [stillResolving, user, pathname, router]);

    if (stillResolving) {
        return 'loading';
    }
    if (user) {
        return 'authenticated';
    }
    return 'redirecting';
}

export default useProtectedRoute;
