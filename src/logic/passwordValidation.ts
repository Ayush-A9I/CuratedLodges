/**
 * Pure validation logic for the Reset_Password_Page.
 *
 * This module contains no React, i18n, or network concerns so its rules can be
 * exercised in isolation.
 *
 * Requirements:
 * - 7.4 A new password must be at least 8 and at most 128 characters; otherwise
 *       the submission is withheld.
 * - 7.5 The password and its confirmation entry must match; otherwise the
 *       submission is withheld.
 */

/** Inclusive lower bound on the new password length (Req 7.4). */
export const MIN_PASSWORD_LENGTH = 8;
/** Inclusive upper bound on the new password length (Req 7.4). */
export const MAX_PASSWORD_LENGTH = 128;

/**
 * The rules `validateResetPassword` can flag as violated. Only violated rules
 * are present and set to `true`.
 *
 * - `length`   the password is shorter than 8 or longer than 128 characters.
 * - `mismatch` the password and its confirmation entry are not identical.
 */
export interface ResetPasswordErrors {
    length?: boolean;
    mismatch?: boolean;
}

export interface ResetPasswordValidationResult {
    isValid: boolean;
    errors: ResetPasswordErrors;
}

/**
 * Validate a password-reset submission.
 *
 * Reports `isValid = true` exactly when the password length is between
 * {@link MIN_PASSWORD_LENGTH} and {@link MAX_PASSWORD_LENGTH} inclusive AND the
 * password is identical to its confirmation entry. Otherwise reports
 * `isValid = false` and flags precisely the violated rule(s): `length` for a
 * length-bound violation and `mismatch` for a confirmation mismatch.
 *
 * Requirements: 7.4, 7.5.
 */
export function validateResetPassword(
    password: string,
    confirmation: string,
): ResetPasswordValidationResult {
    const errors: ResetPasswordErrors = {};

    if (
        password.length < MIN_PASSWORD_LENGTH ||
        password.length > MAX_PASSWORD_LENGTH
    ) {
        errors.length = true;
    }

    if (password !== confirmation) {
        errors.mismatch = true;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}
