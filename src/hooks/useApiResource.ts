'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError, type NormalizedError } from '@/lib/errors';

/** Default timeout for a read request, in milliseconds (Req 13.3). */
const DEFAULT_TIMEOUT_MS = 30000;

/** The state surfaced by {@link useApiResource}. */
export interface ApiResourceState<T> {
    /** The fetched value, or `null` until a successful response arrives. */
    data: T | null;
    /** Whether a request is currently in flight. */
    loading: boolean;
    /** A normalized, translated error, or `null` when there is no error. */
    error: NormalizedError | null;
    /** Re-issue the request, swapping any error for a fresh loading state. */
    retry: () => void;
}

/** Options controlling {@link useApiResource}. */
export interface UseApiResourceOptions {
    /** Gate the call. When `false`, the fetcher is never invoked (Req 3.7). */
    enabled?: boolean;
    /** Timeout window before a {@link NormalizedError} of kind `timeout` is produced. Defaults to 30000. */
    timeoutMs?: number;
    /** Dependencies that, when changed, trigger a re-fetch. */
    deps?: unknown[];
}

/**
 * Build an error whose shape {@link normalizeError} maps to kind `timeout`.
 * Uses the `name: 'TimeoutError'` marker convention recognized by `lib/errors`.
 */
function createTimeoutError(): Error {
    const err = new Error('Request timed out');
    err.name = 'TimeoutError';
    return err;
}

/**
 * Read-only data-fetching hook (Req 13).
 *
 * Behavior:
 * - Sets `loading` true as soon as a request starts (well within 300 ms) and clears
 *   it on the terminal state — success or error (Req 13.1).
 * - Races the fetch against `timeoutMs` (default 30000). On timeout it ends loading and
 *   surfaces a `timeout`-kind error (Req 13.3).
 * - On failure, runs `normalizeError` to derive a translated, user-readable message (Req 13.6).
 * - Always exposes `retry()`; calling it re-issues the request and swaps the error for a
 *   loading state (Req 13.7).
 * - When `enabled` is `false`, the fetcher is never called (used for missing id/token, Req 3.7).
 * - Re-fetches when any value in `deps` changes.
 *
 * Late-result safety: each run carries a monotonically increasing id and a `settled`
 * latch, so a resolved-then-timeout (or timeout-then-resolved) race never double-sets
 * state, and results from a superseded or unmounted run are ignored.
 */
export function useApiResource<T>(
    fetcher: () => Promise<T>,
    options?: UseApiResourceOptions,
): ApiResourceState<T> {
    const { enabled = true, timeoutMs = DEFAULT_TIMEOUT_MS, deps = [] } = options ?? {};

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<NormalizedError | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Tracks whether the component is still mounted to guard against setState-after-unmount.
    const mountedRef = useRef(true);
    // Identifies the latest run so stale runs can be ignored.
    const runIdRef = useRef(0);
    // Always call the most recent fetcher without making it an effect dependency.
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const retry = useCallback(() => {
        setRetryCount((count) => count + 1);
    }, []);

    useEffect(() => {
        // Gated off: never call the fetcher; invalidate any in-flight run and stop loading.
        if (!enabled) {
            runIdRef.current += 1;
            setLoading(false);
            return;
        }

        const runId = ++runIdRef.current;
        let settled = false;
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

        // A run may update state only while mounted, current, and not already settled.
        const isCurrent = (): boolean =>
            mountedRef.current && runIdRef.current === runId && !settled;

        // Swap any error for a loading state immediately (Req 13.1, 13.7).
        setLoading(true);
        setError(null);

        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(() => {
                reject(createTimeoutError());
            }, timeoutMs);
        });

        Promise.race([fetcherRef.current(), timeoutPromise])
            .then((result) => {
                if (!isCurrent()) {
                    return;
                }
                settled = true;
                setData(result);
                setError(null);
                setLoading(false);
            })
            .catch((err: unknown) => {
                if (!isCurrent()) {
                    return;
                }
                settled = true;
                setError(normalizeError(err));
                setLoading(false);
            })
            .finally(() => {
                if (timeoutHandle !== undefined) {
                    clearTimeout(timeoutHandle);
                }
            });

        // On unmount or dependency change, latch this run as settled so late results are ignored.
        return () => {
            settled = true;
            if (timeoutHandle !== undefined) {
                clearTimeout(timeoutHandle);
            }
        };
        // `deps` is intentionally spread so consumer-provided dependencies drive re-fetching.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, timeoutMs, retryCount, ...deps]);

    return { data, loading, error, retry };
}
