/**
 * Money formatting helpers.
 *
 * These are pure, reusable helpers that mirror the formatting logic of
 * `LocalizationContext.convertPrice`, so components and the LocalizationContext
 * can share a single source of truth for how monetary amounts are rendered.
 *
 * Formatting rule (matches the existing `convertPrice`):
 *   active currency symbol  +  (amount * exchangeRate) rounded to a whole number
 *
 * The helpers are defensive: a missing or invalid exchange rate falls back to a
 * rate of 1 so callers never render `NaN`/`Infinity`.
 *
 * Requirements: 1.7, 2.5, 15.1
 */

/**
 * Currency symbol map. Kept in sync with `LocalizationContext.getCurrencySymbol`
 * so formatting is identical across the app.
 */
export const CURRENCY_SYMBOLS: { [code: string]: string } = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
    JPY: '¥',
    CNY: '¥',
    CHF: 'Fr',
    SGD: 'S$',
    AED: 'AED ',
    THB: '฿',
    MYR: 'RM',
};

/**
 * Locale map used for number grouping. Mirrors `LocalizationContext.getLocale`.
 */
export const LOCALE_BY_LANGUAGE: { [language: string]: string } = {
    en: 'en-US',
    'en-GB': 'en-GB',
    es: 'es-ES',
    'es-MX': 'es-MX',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-PT',
    'pt-BR': 'pt-BR',
    ja: 'ja-JP',
    zh: 'zh-CN',
    hi: 'hi-IN',
};

const DEFAULT_LOCALE = 'en-US';

/**
 * Resolve the display symbol for a currency.
 *
 * Accepts either a currency code (e.g. `"USD"`) or an already-resolved symbol
 * (e.g. `"$"`). Unknown codes fall back to the code followed by a space, which
 * matches the existing `LocalizationContext` behavior.
 */
export function getCurrencySymbol(currencyCodeOrSymbol: string): string {
    if (!currencyCodeOrSymbol) {
        return '';
    }
    const known = CURRENCY_SYMBOLS[currencyCodeOrSymbol];
    if (known) {
        return known;
    }
    // If the caller already passed a symbol (not a known code), use it as-is.
    if (Object.values(CURRENCY_SYMBOLS).includes(currencyCodeOrSymbol)) {
        return currencyCodeOrSymbol;
    }
    return `${currencyCodeOrSymbol} `;
}

/**
 * Resolve the grouping locale for a language code.
 */
export function getLocale(language?: string): string {
    if (!language) {
        return DEFAULT_LOCALE;
    }
    return LOCALE_BY_LANGUAGE[language] || DEFAULT_LOCALE;
}

/**
 * Coerce an exchange rate to a safe, usable number.
 *
 * Missing, non-numeric, non-finite, or negative rates fall back to `1` so a
 * monetary amount is always rendered at its base value rather than `NaN`.
 * A rate of exactly `0` is preserved (it is a valid non-negative rate).
 */
export function safeExchangeRate(rate: unknown): number {
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate < 0) {
        return 1;
    }
    return rate;
}

/**
 * Format a monetary amount for display.
 *
 * Returns the active currency symbol as a prefix followed by
 * `amount * exchangeRate` rounded to a whole number. This matches the existing
 * `LocalizationContext.convertPrice` formatting so audited and new surfaces
 * render identically.
 *
 * @param amount    Base amount in the platform's base currency (INR).
 * @param currency  Currency code (e.g. `"USD"`) or symbol (e.g. `"$"`).
 * @param exchangeRate  Conversion rate from the base currency; invalid values
 *                      fall back to `1`.
 * @param language  Optional language code used to pick number grouping locale.
 */
export function formatMoney(
    amount: number,
    currency: string,
    exchangeRate?: number,
    language?: string
): string {
    const rate = safeExchangeRate(exchangeRate);
    const safeAmount = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
    const converted = safeAmount * rate;
    const formattedNumber = converted.toLocaleString(getLocale(language), {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return `${getCurrencySymbol(currency)}${formattedNumber}`;
}
