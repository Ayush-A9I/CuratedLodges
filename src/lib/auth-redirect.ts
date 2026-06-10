/**
 * Post-login redirect helpers.
 *
 * When an unauthenticated user is bounced from a protected route to the sign-in
 * page, we remember where they were headed so we can send them back there once
 * they authenticate (Req 12.2 / 12.4).
 *
 * The destination is persisted in `sessionStorage` so it survives the redirect
 * navigation but does not leak across browser sessions. Every access is guarded
 * with a `typeof window` check so these helpers are safe to call during
 * server-side rendering, where `sessionStorage` is unavailable.
 *
 * Requirements: 12.2, 12.4
 */

/** Storage key used to persist the intended post-login destination. */
const STORAGE_KEY = 'postLoginRedirectPath';

/**
 * Default destination used when no intended path was stored. The app root is a
 * safe landing spot for an authenticated user.
 */
export const DEFAULT_POST_LOGIN_PATH = '/';

/**
 * Persist the path a user intended to visit before being redirected to sign-in.
 *
 * No-ops during SSR (no `window`) and when given an empty path, so callers can
 * pass through a route value without extra guarding.
 */
export function storePostLoginPath(path: string): void {
    if (typeof window === 'undefined') {
        return;
    }
    if (!path) {
        return;
    }
    try {
        window.sessionStorage.setItem(STORAGE_KEY, path);
    } catch {
        // sessionStorage can throw (private mode / quota); a failed store simply
        // means we fall back to the default destination after login.
    }
}

/**
 * Read the stored post-login destination and clear it in one step.
 *
 * Returns the previously stored path, or {@link DEFAULT_POST_LOGIN_PATH} when
 * nothing was stored (or during SSR). Clearing after read ensures a stored path
 * is consumed exactly once and does not affect a later, unrelated sign-in.
 */
export function consumePostLoginPath(): string {
    if (typeof window === 'undefined') {
        return DEFAULT_POST_LOGIN_PATH;
    }
    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        window.sessionStorage.removeItem(STORAGE_KEY);
        return stored || DEFAULT_POST_LOGIN_PATH;
    } catch {
        return DEFAULT_POST_LOGIN_PATH;
    }
}
