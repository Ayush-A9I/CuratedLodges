import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import { diffProfile } from '@/logic/profileDiff';
import { type ProfileFormState } from '@/logic/profileValidation';

// The editable fields surfaced by the Profile_Page form (Req 6.3, 6.4).
const EDITABLE_FIELDS = [
    'firstName',
    'lastName',
    'phone',
    'whatsappEnabled',
    'preferredLanguage',
    'preferredCurrency',
] as const satisfies readonly (keyof ProfileFormState)[];

// Small per-field domains so that equality between original and edited values
// occurs frequently, exercising both changed and unchanged branches.
const profileArb: fc.Arbitrary<ProfileFormState> = fc.record({
    firstName: fc.constantFrom('Ada', 'Grace', 'Alan', ''),
    lastName: fc.constantFrom('Lovelace', 'Hopper', 'Turing', ''),
    phone: fc.constantFrom('1234567', '987654321', '', '+1 555 000'),
    whatsappEnabled: fc.boolean(),
    preferredLanguage: fc.constantFrom('en', 'es', 'fr', 'xx'),
    preferredCurrency: fc.constantFrom('USD', 'INR', 'EUR', '??'),
});

/** Compute the expected changed-fields diff independently of the SUT. */
function expectedDiff(
    original: ProfileFormState,
    edited: ProfileFormState,
): Partial<ProfileFormState> {
    const diff: Partial<ProfileFormState> = {};
    for (const field of EDITABLE_FIELDS) {
        if (edited[field] !== original[field]) {
            (diff[field] as ProfileFormState[typeof field]) = edited[field];
        }
    }
    return diff;
}

describe('diffProfile', () => {
    // Feature: frontend-api-integration, Property 6: Profile diff yields exactly the changed fields
    it('returns an object keyed by exactly the changed fields with edited values', () => {
        fc.assert(
            fc.property(profileArb, profileArb, (original, edited) => {
                const result = diffProfile(original, edited);

                // Keys/values are exactly the changed editable fields (Req 6.3).
                expect(result).toEqual(expectedDiff(original, edited));

                // Empty diff exactly when nothing changed (Req 6.4).
                const changed = EDITABLE_FIELDS.some(
                    (field) => edited[field] !== original[field],
                );
                expect(Object.keys(result).length === 0).toBe(!changed);
            }),
            { numRuns: 100 },
        );
    });

    // Feature: frontend-api-integration, Property 6: Profile diff yields exactly the changed fields
    it('returns an empty diff when original and edited are identical', () => {
        fc.assert(
            fc.property(profileArb, (profile) => {
                expect(diffProfile(profile, { ...profile })).toEqual({});
            }),
            { numRuns: 100 },
        );
    });
});
