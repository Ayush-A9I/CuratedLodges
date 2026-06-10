import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
    validateResetPassword,
    MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH,
} from './passwordValidation';

/**
 * Property-based test for `validateResetPassword`.
 *
 * Property 9 verifies that a password-reset submission is accepted if and only
 * if the password length is within [MIN, MAX] inclusive AND the password equals
 * its confirmation; otherwise the violated rule(s) (`length` and/or `mismatch`)
 * are flagged precisely.
 */
describe('validateResetPassword (Property 9)', () => {
    it('is valid iff length in bounds and password matches confirmation', () => {
        // Feature: frontend-api-integration, Property 9: Password reset validation accepts a password if and only if length and confirmation rules hold
        // Validates: Requirements 7.4, 7.5
        fc.assert(
            fc.property(
                // Range spans below, within, and above the length bounds.
                fc.string({ maxLength: MAX_PASSWORD_LENGTH + 10 }),
                fc.string({ maxLength: MAX_PASSWORD_LENGTH + 10 }),
                (password, confirmation) => {
                    const result = validateResetPassword(password, confirmation);

                    const lengthOk =
                        password.length >= MIN_PASSWORD_LENGTH &&
                        password.length <= MAX_PASSWORD_LENGTH;
                    const matches = password === confirmation;

                    expect(result.isValid).toBe(lengthOk && matches);

                    // Violated rules are flagged precisely; satisfied rules absent.
                    expect(result.errors.length).toBe(lengthOk ? undefined : true);
                    expect(result.errors.mismatch).toBe(matches ? undefined : true);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('accepts any in-bounds password that equals its confirmation', () => {
        // Feature: frontend-api-integration, Property 9: Password reset validation accepts a password if and only if length and confirmation rules hold
        // Validates: Requirements 7.4, 7.5
        fc.assert(
            fc.property(
                fc.string({
                    minLength: MIN_PASSWORD_LENGTH,
                    maxLength: MAX_PASSWORD_LENGTH,
                }),
                (password) => {
                    const result = validateResetPassword(password, password);
                    expect(result.isValid).toBe(true);
                    expect(result.errors).toEqual({});
                }
            ),
            { numRuns: 100 }
        );
    });
});
