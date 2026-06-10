import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import i18n from '@/i18n/config';
import { normalizeError } from '@/lib/errors';
import { ApiError } from '@/lib/api';

/**
 * Property-based tests for `normalizeError`.
 *
 * Property 16 verifies that each kind of failure input is mapped to the right,
 * always non-empty, user-facing message:
 *  - an ApiError carrying a response `error`/`message` text yields that exact text,
 *  - an ApiError without any response message yields the generic server fallback,
 *  - a network/fetch failure (TypeError) yields the network message.
 */
describe('normalizeError (Property 16)', () => {
    // Free text that represents a server-supplied error/message string. We keep it
    // non-empty after trimming, since the implementation ignores blank strings.
    const serverText = fc
        .string({ minLength: 1, maxLength: 200 })
        .filter((s) => s.trim().length > 0);

    const status = fc.integer({ min: 400, max: 599 });

    it('ApiError with a response message yields that exact message', () => {
        // Feature: frontend-api-integration, Property 16: Error normalization derives the right message for each failure kind
        fc.assert(
            fc.property(
                serverText,
                status,
                fc.boolean(),
                (text, code, useErrorField) => {
                    const data = useErrorField
                        ? { error: text }
                        : { message: text };
                    const err = new ApiError('Request failed', code, data);

                    const result = normalizeError(err);

                    expect(result.kind).toBe('server');
                    expect(result.message).toBe(text);
                    expect(result.message.length).toBeGreaterThan(0);
                    expect(result.status).toBe(code);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('ApiError without any response message yields a non-empty generic fallback', () => {
        // Feature: frontend-api-integration, Property 16: Error normalization derives the right message for each failure kind
        const expectedFallback = i18n.t('errors.serverGeneric');
        // Bodies that carry no usable server message (absent, blank, or non-string).
        const emptyBody = fc.oneof(
            fc.constant(undefined),
            fc.constant(null),
            fc.constant({}),
            fc.record({ error: fc.constant('') }),
            fc.record({ message: fc.constant('   ') }),
            fc.record({ error: fc.integer() })
        );

        fc.assert(
            fc.property(status, emptyBody, (code, body) => {
                const err = new ApiError('Request failed', code, body);

                const result = normalizeError(err);

                expect(result.kind).toBe('server');
                expect(result.message).toBe(expectedFallback);
                expect(result.message.length).toBeGreaterThan(0);
            }),
            { numRuns: 100 }
        );
    });

    it('a network/fetch failure (TypeError) yields a non-empty network message', () => {
        // Feature: frontend-api-integration, Property 16: Error normalization derives the right message for each failure kind
        const expectedNetwork = i18n.t('errors.network');

        fc.assert(
            fc.property(
                fc.string({ maxLength: 100 }),
                (message) => {
                    const err = new TypeError(message);

                    const result = normalizeError(err);

                    expect(result.kind).toBe('network');
                    expect(result.message).toBe(expectedNetwork);
                    expect(result.message.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 100 }
        );
    });
});
