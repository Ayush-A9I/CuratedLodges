'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { normalizeError, type NormalizedError } from '@/lib/errors';

/** Default timeout for a write request, in milliseconds (Req 2.7, 4.5). */
const DEFAULT_TIMEOUT_MS = 30000;

/** The state and actions surfaced by {@link useApiMutation}. */
export interface ApiMutationState<TArgs, TResult> {
    /**
     * Run the mutation. While a previous submit is in flight, re-entrant calls are
     * ignored and resolve to `undefined` (single-flight guard).
     */
    submit: (args: TArgs) => Promise<TResult | undefined>;
    /** Whether a mutation is currently in flight. */
    submitting: boolean;
    /** A normalized, translated error, or `null` when there is no error. */
    error: NormalizedError | null;
    /** Clear the error and submitting state. */
    reset: () => void;
}

/** Options controlling {@link useApiMutation}. */
export interface UseApiMutationOptions<TResult> {
    /** Timeout window before a {@link NormalizedError} of kind `timeout` is produced. Defaults to 30000. */
    timeoutMs?: number;
    /** Invoked with the result after a successful mutation. */
    onSuccess?: (result: TResult) => void;
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
 * Write hook for non-idempotent mutations (Req 2.7, 4.5, 6.5, 7.6, 8.6).
 *
 * Behavior:
 * - **Single-flight guard:** while `submitting` is true, further `submit` calls are
 *   ignored and resolve to `undefined`. A ref tracks the in-flight state so the guard
 *   holds even before the `submitting` state update flushes (Req 2.7, 4.5, 6.5, 7.6, 8.6).
 * - Applies the same `timeoutMs` race (default 30000); on timeout it surfaces a
 *   `timeout`-kind error and resolves to `undefined`.
 * - On failure, runs `normalizeError` to derive a translated, user-readable message;
 *   it does **not** auto-retry (mutations are not safely re-issuable).
 * - Holds no form state, so it never clears caller-entered values; pages retain their
 *   inputs on error.
 * - `reset()` clears the error and submitting state.
 *
 * setState-after-unmount is guarded by a mounted ref.
 */
export function useApiMutation<TArgs, TResult>(
    mutationFn: (args: TArgs) => Promise<TResult>,
    options?: UseApiMutationOptions<TResult>,
): ApiMutationState<TArgs, TResult> {
    const { timeoutMs = DEFAULT_TIMEOUT_MS, onSuccess } = options ?? {};

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<NormalizedError | null>(null);

    // Tracks whether the component is still mounted to guard against setState-after-unmount.
    const mountedRef = useRef(true);
    // Tracks the in-flight state synchronously so the single-flight guard works even
    // before the `submitting` state update has flushed.
    const inFlightRef = useRef(false);
    // Always call the most recent mutationFn/onSuccess without recreating `submit`.
    const mutationFnRef = useRef(mutationFn);
    mutationFnRef.current = mutationFn;
    const onSuccessRef = useRef(onSuccess);
    onSuccessRef.current = onSuccess;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const reset = useCallback(() => {
        if (!mountedRef.current) {
            return;
        }
        setError(null);
        setSubmitting(false);
    }, []);

    const submit = useCallback(
        async (args: TArgs): Promise<TResult | undefined> => {
            // Single-flight guard: ignore re-entrant submits while one is in flight.
            if (inFlightRef.current) {
                return undefined;
            }
            inFlightRef.current = true;

            if (mountedRef.current) {
                setSubmitting(true);
                setError(null);
            }

            let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutHandle = setTimeout(() => {
                    reject(createTimeoutError());
                }, timeoutMs);
            });

            try {
                const result = await Promise.race([
                    mutationFnRef.current(args),
                    timeoutPromise,
                ]);
                if (mountedRef.current) {
                    setSubmitting(false);
                }
                onSuccessRef.current?.(result);
                return result;
            } catch (err: unknown) {
                if (mountedRef.current) {
                    setError(normalizeError(err));
                    setSubmitting(false);
                }
                return undefined;
            } finally {
                if (timeoutHandle !== undefined) {
                    clearTimeout(timeoutHandle);
                }
                inFlightRef.current = false;
            }
        },
        [timeoutMs],
    );

    return { submit, submitting, error, reset };
}
