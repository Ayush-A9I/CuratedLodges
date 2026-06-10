/**
 * Supported localization options and defaults.
 *
 * Values are derived from the application's actual configuration:
 * - SUPPORTED_LANGUAGES mirror the locale keys registered in `src/i18n/config.ts`.
 * - SUPPORTED_CURRENCIES mirror the currency symbol map in
 *   `src/contexts/LocalizationContext.tsx`.
 *
 * Requirements: 6.12 (profile validation against supported options),
 * 15.6 (default language/currency fallbacks).
 */

export const SUPPORTED_LANGUAGES = [
    'en',
    'en-GB',
    'es',
    'es-MX',
    'fr',
    'de',
    'it',
    'pt',
    'pt-BR',
    'ja',
    'zh',
    'hi',
] as const;

export const SUPPORTED_CURRENCIES = [
    'INR',
    'USD',
    'EUR',
    'GBP',
    'AUD',
    'CAD',
    'JPY',
    'CNY',
    'CHF',
    'SGD',
    'AED',
    'THB',
    'MYR',
] as const;

export const DEFAULT_LANGUAGE = 'en'; // Req 15.6
export const DEFAULT_CURRENCY = 'INR'; // Req 15.6

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Resolves candidate language/currency preferences to values guaranteed to be
 * among the supported options.
 *
 * Pure function: for any candidate (including absent, null, or unsupported
 * values), it returns a language that is among SUPPORTED_LANGUAGES and a
 * currency that is among SUPPORTED_CURRENCIES, falling back to
 * DEFAULT_LANGUAGE ('en') and DEFAULT_CURRENCY ('INR') respectively.
 *
 * Requirements: 15.5, 15.6.
 */
export function resolvePreferences(
    candidateLanguage?: string | null,
    candidateCurrency?: string | null,
): { language: string; currency: string } {
    const language = SUPPORTED_LANGUAGES.includes(
        candidateLanguage as SupportedLanguage,
    )
        ? (candidateLanguage as SupportedLanguage)
        : DEFAULT_LANGUAGE;

    const currency = SUPPORTED_CURRENCIES.includes(
        candidateCurrency as SupportedCurrency,
    )
        ? (candidateCurrency as SupportedCurrency)
        : DEFAULT_CURRENCY;

    return { language, currency };
}
