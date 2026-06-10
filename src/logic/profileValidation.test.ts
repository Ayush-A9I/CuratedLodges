import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import {
    displayValue,
    validateProfile,
    type ProfileField,
    type ProfileFormState,
    MAX_NAME_LENGTH,
    MIN_PHONE_DIGITS,
    MAX_PHONE_DIGITS,
} from '@/logic/profileValidation';
import {
    SUPPORTED_CURRENCIES,
    SUPPORTED_LANGUAGES,
} from '@/logic/supported';

/** Count the digit characters (0-9) in a string, independently of the SUT. */
function digitCount(value: string): number {
    return (value.match(/[0-9]/g) ?? []).length;
}

/** Compute the fields that violate the Req 6.12 rules, independently. */
function expectedViolations(profile: ProfileFormState): ProfileField[] {
    const violated: ProfileField[] = [];
    if (profile.firstName.length > MAX_NAME_LENGTH) violated.push('firstName');
    if (profile.lastName.length > MAX_NAME_LENGTH) violated.push('lastName');
    const digits = digitCount(profile.phone);
    if (digits < MIN_PHONE_DIGITS || digits > MAX_PHONE_DIGITS)
        violated.push('phone');
    if (!(SUPPORTED_LANGUAGES as readonly string[]).includes(profile.preferredLanguage))
        violated.push('preferredLanguage');
    if (!(SUPPORTED_CURRENCIES as readonly string[]).includes(profile.preferredCurrency))
        violated.push('preferredCurrency');
    return violated;
}

// A name arbitrary that covers both valid (≤100) and invalid (>100) lengths.
const nameArb = fc.oneof(
    fc.string({ maxLength: MAX_NAME_LENGTH }),
    fc.string({ minLength: MAX_NAME_LENGTH + 1, maxLength: 200 }),
);

const digitChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

// A phone arbitrary biased to exercise the 7..15 digit-count boundaries plus
// arbitrary strings where digits are interspersed with other characters.
const phoneArb = fc.oneof(
    fc.array(digitChar, { maxLength: 20 }).map((chars) => chars.join('')),
    fc.string({ maxLength: 25 }),
);

const languageArb = fc.oneof(
    fc.constantFrom(...SUPPORTED_LANGUAGES),
    fc.string({ maxLength: 8 }),
);

const currencyArb = fc.oneof(
    fc.constantFrom(...SUPPORTED_CURRENCIES),
    fc.string({ maxLength: 5 }),
);

const profileArb: fc.Arbitrary<ProfileFormState> = fc.record({
    firstName: nameArb,
    lastName: nameArb,
    phone: phoneArb,
    whatsappEnabled: fc.boolean(),
    preferredLanguage: languageArb,
    preferredCurrency: currencyArb,
});

describe('validateProfile', () => {
    // Feature: frontend-api-integration, Property 7: Profile validation accepts a profile if and only if all field rules hold
    it('reports valid exactly when every field rule holds, flagging precisely the violated fields', () => {
        fc.assert(
            fc.property(profileArb, (profile) => {
                const result = validateProfile(profile);
                const violated = expectedViolations(profile);

                // Validity holds iff there are no violations (Req 6.12).
                expect(result.isValid).toBe(violated.length === 0);

                // fieldErrors flags precisely the violated fields, each as true.
                const flagged = Object.keys(result.fieldErrors).sort();
                expect(flagged).toEqual([...violated].sort());
                for (const field of violated) {
                    expect(result.fieldErrors[field]).toBe(true);
                }
            }),
            { numRuns: 100 },
        );
    });
});

// Arbitrary field values: null, undefined, numbers, booleans, strings, arrays,
// and anything else. The exact strings "null"/"undefined" are excluded because
// they are legitimate user-supplied text rather than a leaked null/undefined
// value; Req 6.2 concerns the function never emitting those literals itself.
const fieldValueArb = fc
    .oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.integer(),
        fc.double(),
        fc.boolean(),
        fc.string(),
        fc.array(fc.oneof(fc.string(), fc.integer(), fc.constant(null))),
        fc.anything(),
    )
    .filter((v) => v !== 'null' && v !== 'undefined');

describe('displayValue', () => {
    // Feature: frontend-api-integration, Property 8: Display normalization never leaks null or undefined literals
    it('never returns the literal "null"/"undefined" and returns "" for null/undefined input', () => {
        fc.assert(
            fc.property(fieldValueArb, (value) => {
                const result = displayValue(value);

                // Always a string, never the forbidden literals (Req 6.2).
                expect(typeof result).toBe('string');
                expect(result).not.toBe('null');
                expect(result).not.toBe('undefined');

                // Null/undefined input collapses to the empty string.
                if (value === null || value === undefined) {
                    expect(result).toBe('');
                }
            }),
            { numRuns: 100 },
        );
    });
});
