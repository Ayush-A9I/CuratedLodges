import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatMoney, getCurrencySymbol } from '@/lib/money';
import { SUPPORTED_CURRENCIES } from '@/logic/supported';

/**
 * Property-based tests for money formatting.
 *
 * Property 1 verifies that, for any non-negative amount, any supported currency,
 * and any non-negative exchange rate, `formatMoney`:
 *  - prefixes the result with that currency's symbol, and
 *  - encodes `amount * rate` rounded to a whole number.
 * With currency INR and rate 1, the encoded number equals the input amount.
 */
describe('formatMoney (Property 1)', () => {
    // Prices are whole-number base amounts (server-authoritative, in base currency).
    const amount = fc.nat({ max: 1_000_000 });
    const currency = fc.constantFrom(...SUPPORTED_CURRENCIES);
    // Non-negative exchange rate; 0 is a valid rate and is preserved by safeExchangeRate.
    const rate = fc.double({ min: 0, max: 10_000, noNaN: true });

    /** Strip the currency symbol prefix and grouping separators to recover the integer. */
    const encodedNumber = (formatted: string, symbol: string): number => {
        expect(formatted.startsWith(symbol)).toBe(true);
        const numericPart = formatted.slice(symbol.length).replace(/[^0-9]/g, '');
        return Number.parseInt(numericPart, 10);
    };

    it('prefixes the currency symbol and encodes amount*rate rounded to a whole number', () => {
        // Feature: frontend-api-integration, Property 1: Price formatting prefixes the currency symbol and scales by the exchange rate
        fc.assert(
            fc.property(amount, currency, rate, (price, code, exchangeRate) => {
                const symbol = getCurrencySymbol(code);
                const formatted = formatMoney(price, code, exchangeRate);

                // Begins with the currency's symbol.
                expect(formatted.startsWith(symbol)).toBe(true);

                // Encodes amount * rate rounded to a whole number.
                const expected = Math.round(price * exchangeRate);
                expect(encodedNumber(formatted, symbol)).toBe(expected);
            }),
            { numRuns: 100 }
        );
    });

    it('with currency INR and rate 1 the encoded number equals the input amount', () => {
        // Feature: frontend-api-integration, Property 1: Price formatting prefixes the currency symbol and scales by the exchange rate
        fc.assert(
            fc.property(amount, (price) => {
                const symbol = getCurrencySymbol('INR');
                const formatted = formatMoney(price, 'INR', 1);

                expect(formatted.startsWith(symbol)).toBe(true);
                expect(encodedNumber(formatted, symbol)).toBe(price);
            }),
            { numRuns: 100 }
        );
    });
});
