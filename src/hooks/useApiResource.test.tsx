import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import fc from 'fast-check';

import { useApiResource } from '@/hooks/useApiResource';

/**
 * Flush pending microtasks (and any React state updates they trigger) without
 * relying on `waitFor` polling, which is too slow across 100 property runs.
 * Several hops cover the `Promise.race(...).then(...).finally(...)` chain.
 */
async function flushMicrotasks(): Promise<void> {
    for (let i = 0; i < 4; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await act(async () => {
            await Promise.resolve();
        });
    }
}

/**
 * Property-based tests for {@link useApiResource}.
 *
 * Covers tasks 2.2–2.5 (design Properties 18–21). Each property uses fast-check
 * with `{ numRuns: 100 }` where it varies inputs. Timing-sensitive properties use
 * Vitest fake timers so the timeout race resolves instantly across all runs.
 */

afterEach(() => {
    cleanup();
});

describe('useApiResource', () => {
    // Feature: frontend-api-integration, Property 18: useApiResource shows then clears a single loading state
    it('enters loading and transitions to exactly one terminal state (Property 18)', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.boolean(),
                fc.anything(),
                async (shouldResolve, value) => {
                    const fetcher = () =>
                        shouldResolve
                            ? Promise.resolve(value)
                            : Promise.reject(new Error('boom'));

                    const { result, unmount } = renderHook(() =>
                        useApiResource(fetcher),
                    );

                    try {
                        // Loading is asserted as soon as the request is in flight (Req 13.1).
                        expect(result.current.loading).toBe(true);

                        await flushMicrotasks();
                        expect(result.current.loading).toBe(false);

                        const hasData = result.current.data !== null;
                        const hasError = result.current.error !== null;

                        if (shouldResolve && value !== null) {
                            // A resolved, non-null value lands in `data`, no error.
                            expect(hasData).toBe(true);
                            expect(hasError).toBe(false);
                        } else if (!shouldResolve) {
                            // A rejection lands in `error`, no data.
                            expect(hasError).toBe(true);
                            expect(hasData).toBe(false);
                        }

                        // Never loading simultaneously with a terminal result.
                        expect(
                            result.current.loading && (hasData || hasError),
                        ).toBe(false);
                    } finally {
                        unmount();
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: frontend-api-integration, Property 19: A non-responding request produces a timeout error after the configured timeout
    it('produces a timeout error once the configured timeout elapses (Property 19)', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 1, max: 60000 }),
                async (timeoutMs) => {
                    vi.useFakeTimers();
                    try {
                        // A fetcher that never settles forces the timeout race to win.
                        const fetcher = () => new Promise<unknown>(() => { });

                        const { result, unmount } = renderHook(() =>
                            useApiResource(fetcher, { timeoutMs }),
                        );

                        try {
                            expect(result.current.loading).toBe(true);

                            // Advance to the timeout boundary and flush the rejection.
                            await act(async () => {
                                vi.advanceTimersByTime(timeoutMs);
                            });

                            expect(result.current.loading).toBe(false);
                            expect(result.current.error).not.toBeNull();
                            expect(result.current.error?.kind).toBe('timeout');
                            expect(result.current.data).toBeNull();
                        } finally {
                            unmount();
                        }
                    } finally {
                        vi.useRealTimers();
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: frontend-api-integration, Property 20: Read errors expose a retry that re-issues the request
    it('exposes retry that swaps the error for loading and re-calls the fetcher (Property 20)', async () => {
        await fc.assert(
            fc.asyncProperty(fc.string(), async (message) => {
                let callCount = 0;
                const fetcher = vi.fn(() => {
                    callCount += 1;
                    if (callCount === 1) {
                        return Promise.reject(new Error(message));
                    }
                    // Subsequent calls stay pending so the loading state is observable.
                    return new Promise<unknown>(() => { });
                });

                const { result, unmount } = renderHook(() =>
                    useApiResource(fetcher),
                );

                try {
                    // Wait for the first failure to surface.
                    await flushMicrotasks();
                    expect(result.current.error).not.toBeNull();
                    expect(result.current.loading).toBe(false);
                    expect(fetcher).toHaveBeenCalledTimes(1);

                    // Invoking retry re-issues the request (synchronously in the effect).
                    act(() => {
                        result.current.retry();
                    });

                    expect(fetcher).toHaveBeenCalledTimes(2);

                    // The error is replaced by a fresh loading state.
                    expect(result.current.loading).toBe(true);
                    expect(result.current.error).toBeNull();
                } finally {
                    unmount();
                }
            }),
            { numRuns: 100 },
        );
    });

    // Feature: frontend-api-integration, Property 21: A disabled resource never calls its fetcher
    it('never calls the fetcher when enabled is false (Property 21)', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 1, max: 60000 }),
                fc.array(fc.anything(), { maxLength: 4 }),
                async (timeoutMs, deps) => {
                    const fetcher = vi.fn(() => Promise.resolve('value'));

                    const { result, unmount } = renderHook(() =>
                        useApiResource(fetcher, {
                            enabled: false,
                            timeoutMs,
                            deps,
                        }),
                    );

                    try {
                        // Give any (incorrectly scheduled) effect a chance to run.
                        await act(async () => {
                            await Promise.resolve();
                        });

                        expect(fetcher).not.toHaveBeenCalled();
                        expect(result.current.loading).toBe(false);
                    } finally {
                        unmount();
                    }
                },
            ),
            { numRuns: 100 },
        );
    });
});
