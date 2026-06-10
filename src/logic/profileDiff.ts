/**
 * Pure changed-fields diff helper for the Profile_Page.
 *
 * Computes the subset of editable profile fields whose edited value differs
 * from the original, so the caller can send only the changed fields to
 * `updateMe` (and withhold the request entirely when nothing changed).
 *
 * Requirements:
 * - 6.3 Submitting profile changes sends only the fields that changed.
 * - 6.4 When no field changed, no update request is issued (empty diff).
 */

import { type ProfileFormState } from '@/logic/profileValidation';
import { type UpdateMeRequest } from '@/types/api';

/** The editable fields surfaced by the Profile_Page form (Req 6.3, 6.4). */
const EDITABLE_FIELDS = [
    'firstName',
    'lastName',
    'phone',
    'whatsappEnabled',
    'preferredLanguage',
    'preferredCurrency',
] as const satisfies readonly (keyof ProfileFormState)[];

/**
 * Compute the changed editable fields between two profile form states.
 *
 * Returns an object whose keys are exactly the editable fields whose `edited`
 * value differs from the `original` value, with each value equal to the edited
 * value. When nothing differs, returns an empty object (Req 6.3, 6.4).
 */
export function diffProfile(
    original: ProfileFormState,
    edited: ProfileFormState,
): Partial<UpdateMeRequest> {
    const diff: Partial<UpdateMeRequest> = {};

    for (const field of EDITABLE_FIELDS) {
        if (edited[field] !== original[field]) {
            // Each editable field's type is assignable to its `UpdateMeRequest`
            // counterpart, so the assignment is type-safe per field.
            (diff[field] as ProfileFormState[typeof field]) = edited[field];
        }
    }

    return diff;
}
