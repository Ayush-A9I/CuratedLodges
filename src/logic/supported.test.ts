import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
    resolvePreferences,
    SUPPORTED_LANGUAGES,
    SUPPORTED_CURRENCIES,
    DEFAULT_LANGUAGE,
    DEFAULT_CURRENCY,
} from './supported';

/**
 * Property-based test for `resolvePreferences`.
 *
 * Property 10 verifies that for any candidate language/currency (including
 * absent, null, or unsupported values) the resolved values are always among the
 * supported options, falling back to 'en'/'INR' when the candidate is not
 * supported.
 */
describe('resolvePreferences (Property 10)', () => {
    // Candidates spanning supported values, unsupported strings, null, undefined.
    const langCandidate = fc.oneof(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        fc.string(),
        fc.constant(null),
        fc.constant(undefined)
    );
    const currencyCandidate = fc.oneof(
        fc.constantFrom(...SUPPORTED_CURRENCIES),
        fc.string(),
        fc.constant(null),
        fc.constant(undefined)
    );

    it('always yields a supported language and currency with correct fallback', () => {
        // Feature: frontend-api-integration, Property 10: Preference resolution always yields a supported language and currency
        // Validates: Requirements 15.5, 15.6
        fc.assert(
            fc.property(langCandidate, currencyCandidate, (lang, currency) => {
                const result = resolvePreferences(lang, currency);

                // Result is always among the supported options.
                expect(
                    (SUPPORTED_LANGUAGES as readonly string[]).includes(
                        result.language
                    )
                ).toBe(true);
                expect(
                    (SUPPORTED_CURRENCIES as readonly string[]).includes(
                        result.currency
                    )
                ).toBe(true);

                // Supported candidates are preserved; others fall back to defaults.
                const langSupported = (
                    SUPPORTED_LANGUAGES as readonly string[]
                ).includes(lang as string);
                expect(result.language).toBe(langSupported ? lang : DEFAULT_LANGUAGE);

                const currencySupported = (
                    SUPPORTED_CURRENCIES as readonly string[]
                ).includes(currency as string);
                expect(result.currency).toBe(
                    currencySupported ? currency : DEFAULT_CURRENCY
                );
            }),
            { numRuns: 100 }
        );
    });
});
