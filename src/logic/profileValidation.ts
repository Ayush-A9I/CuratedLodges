/**
 * Pure validation and display helpers for the Profile_Page.
 *
 * This module is intentionally free of React, i18n, and network concerns so
 * its rules can be exercised in isolation.
 *
 * Requirements:
 * - 6.2  `displayValue` never leaks the literal text "null" or "undefined".
 * - 6.12 `validateProfile` accepts a profile iff first/last name are each
 *        at most 100 characters, the phone contains between 7 and 15 digits
 *        inclusive, and the preferred language and currency are each among the
 *        supported options.
 */

import {
    SUPPORTED_CURRENCIES,
    SUPPORTED_LANGUAGES,
    type SupportedCurrency,
    type SupportedLanguage,
} from '@/logic/supported';

/** Maximum allowed length for first/last name (Req 6.12). */
export const MAX_NAME_LENGTH = 100;
/** Inclusive lower bound on the number of phone digits (Req 6.12). */
export const MIN_PHONE_DIGITS = 7;
/** Inclusive upper bound on the number of phone digits (Req 6.12). */
export const MAX_PHONE_DIGITS = 15;

/**
 * Editable profile form fields. Mirrors the subset of `UpdateMeRequest`
 * surfaced by the Profile_Page form.
 */
export interface ProfileFormState {
    firstName: string;
    lastName: string;
    phone: string;
    whatsappEnabled: boolean;
    preferredLanguage: string;
    preferredCurrency: string;
}

/** The fields `validateProfile` can flag as invalid. */
export type ProfileField =
    | 'firstName'
    | 'lastName'
    | 'phone'
    | 'preferredLanguage'
    | 'preferredCurrency';

/** Map of violated field → `true`. Only violated fields are present. */
export type ProfileFieldErrors = Partial<Record<ProfileField, boolean>>;

export interface ProfileValidationResult {
    isValid: boolean;
    fieldErrors: ProfileFieldErrors;
}

/** Count the number of digit characters (0-9) in a string. */
function countDigits(value: string): number {
    let count = 0;
    for (const char of value) {
        if (char >= '0' && char <= '9') {
            count += 1;
        }
    }
    return count;
}

function isSupportedLanguage(value: string): value is SupportedLanguage {
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

function isSupportedCurrency(value: string): value is SupportedCurrency {
    return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

/**
 * Validate a profile form submission against the Req 6.12 field rules.
 *
 * Reports `isValid = true` exactly when every rule holds; otherwise reports
 * `isValid = false` and flags precisely the violated fields in `fieldErrors`.
 */
export function validateProfile(
    profile: ProfileFormState,
): ProfileValidationResult {
    const fieldErrors: ProfileFieldErrors = {};

    if (profile.firstName.length > MAX_NAME_LENGTH) {
        fieldErrors.firstName = true;
    }

    if (profile.lastName.length > MAX_NAME_LENGTH) {
        fieldErrors.lastName = true;
    }

    const phoneDigits = countDigits(profile.phone);
    if (phoneDigits < MIN_PHONE_DIGITS || phoneDigits > MAX_PHONE_DIGITS) {
        fieldErrors.phone = true;
    }

    if (!isSupportedLanguage(profile.preferredLanguage)) {
        fieldErrors.preferredLanguage = true;
    }

    if (!isSupportedCurrency(profile.preferredCurrency)) {
        fieldErrors.preferredCurrency = true;
    }

    return {
        isValid: Object.keys(fieldErrors).length === 0,
        fieldErrors,
    };
}

/**
 * Produce a safe display string for a value that may be `null`/`undefined`.
 *
 * Returns `''` when the input is `null` or `undefined`; otherwise returns a
 * string representation that is never the literal `"null"` or `"undefined"`
 * (Req 6.2).
 */
export function displayValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    const stringified = String(value);

    // Guard against any representation that would surface the forbidden
    // literals (e.g. an array containing null/undefined elements).
    if (stringified === 'null' || stringified === 'undefined') {
        return '';
    }

    return stringified;
}
