/**
 * Pure checkout validation and request-building logic.
 *
 * This module contains no React or I/O. It validates the checkout form state,
 * validates naturalist sessions against count/date-range bounds, and builds the
 * `POST /bookings` request body carrying the active currency.
 *
 * Requirements:
 * - 2.2  Naturalist sessions: 0–20 entries, each with a date within
 *        [checkIn, checkOut] and a count between 1 and 20.
 * - 2.3  createBooking request body matches the POST /bookings contract.
 * - 2.6  Required fields non-empty; adults ≥ 1; children ≥ 0.
 * - 2.11 Check-in not before today; check-out strictly after check-in.
 * - 2.12 Guest email must be a valid email address format.
 * - 15.8 Request includes the active `currencyPaid`.
 */

import type { CreateBookingRequest, NaturalistSessionInput } from '@/types/api';

// ─── Form state ───────────────────────────────────────────────

/**
 * Typed input for the checkout validators and request builder.
 *
 * Dates are ISO calendar dates in `YYYY-MM-DD` form. `adults` and `children`
 * are numeric counts (an empty numeric field should be modelled by the UI as a
 * value that violates the bounds, e.g. `0` for adults).
 */
export interface CheckoutGuestState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsappEnabled?: boolean;
    specialRequests?: string;
}

export interface CheckoutFormState {
    lodgeId: string;
    roomTypeId: string;
    checkIn: string; // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD
    adults: number; // must be >= 1
    children: number; // must be >= 0
    guest: CheckoutGuestState;
    naturalistSessions?: NaturalistSessionInput[]; // 0..20
}

/**
 * Field keys that may carry a validation error. Mirrors the user-editable
 * fields collected by the checkout form (Req 2.6, 2.11, 2.12).
 */
export type CheckoutFieldKey =
    | 'roomTypeId'
    | 'checkIn'
    | 'checkOut'
    | 'adults'
    | 'children'
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone';

export interface CheckoutValidationResult {
    isValid: boolean;
    fieldErrors: Partial<Record<CheckoutFieldKey, string>>;
}

// ─── Constants ────────────────────────────────────────────────

export const MIN_ADULTS = 1;
export const MIN_CHILDREN = 0;
export const MAX_SESSIONS = 20;
export const MIN_SESSION_COUNT = 1;
export const MAX_SESSION_COUNT = 20;

/**
 * Pragmatic email format check: a non-empty local part, an `@`, a domain with
 * at least one dot, and no whitespace. Intentionally conservative rather than
 * RFC-exhaustive.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Helpers ──────────────────────────────────────────────────

function isBlank(value: string | undefined | null): boolean {
    return value === undefined || value === null || value.trim() === '';
}

/**
 * Validates that a string is a well-formed `YYYY-MM-DD` calendar date.
 * `YYYY-MM-DD` strings compare lexicographically in chronological order, so
 * callers can use plain string comparison once a value passes this check.
 */
function isValidDateString(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

/** Formats a Date to a `YYYY-MM-DD` calendar string in UTC. */
function toDateString(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ─── validateCheckout ─────────────────────────────────────────

/**
 * Validates the checkout form state.
 *
 * The form is valid if and only if every required field (room type, check-in,
 * check-out, guest first name, last name, email, phone) is non-empty, the
 * number of adults is at least 1, the number of children is at least 0, the
 * email matches a valid email format, the check-in date is not before today,
 * and the check-out date is strictly after the check-in date. Each violated
 * field is flagged precisely in `fieldErrors`.
 *
 * `today` is injectable for deterministic testing; it defaults to the current
 * date. Only its calendar day (UTC) is used for the check-in comparison.
 *
 * Requirements: 2.6, 2.11, 2.12.
 */
export function validateCheckout(
    form: CheckoutFormState,
    today: Date = new Date(),
): CheckoutValidationResult {
    const fieldErrors: Partial<Record<CheckoutFieldKey, string>> = {};

    // Required, non-empty fields (Req 2.6).
    if (isBlank(form.roomTypeId)) {
        fieldErrors.roomTypeId = 'Room type is required.';
    }
    if (isBlank(form.guest.firstName)) {
        fieldErrors.firstName = 'First name is required.';
    }
    if (isBlank(form.guest.lastName)) {
        fieldErrors.lastName = 'Last name is required.';
    }
    if (isBlank(form.guest.phone)) {
        fieldErrors.phone = 'Phone number is required.';
    }

    // Email: required and valid format (Req 2.6, 2.12).
    if (isBlank(form.guest.email)) {
        fieldErrors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(form.guest.email.trim())) {
        fieldErrors.email = 'Email must be a valid email address.';
    }

    // Occupancy bounds (Req 2.6).
    if (!Number.isFinite(form.adults) || form.adults < MIN_ADULTS) {
        fieldErrors.adults = `At least ${MIN_ADULTS} adult is required.`;
    }
    if (!Number.isFinite(form.children) || form.children < MIN_CHILDREN) {
        fieldErrors.children = 'Number of children cannot be negative.';
    }

    // Dates: presence, format, and range rules (Req 2.6, 2.11).
    const checkInBlank = isBlank(form.checkIn);
    const checkOutBlank = isBlank(form.checkOut);
    const checkInValid = !checkInBlank && isValidDateString(form.checkIn);
    const checkOutValid = !checkOutBlank && isValidDateString(form.checkOut);

    if (checkInBlank) {
        fieldErrors.checkIn = 'Check-in date is required.';
    } else if (!checkInValid) {
        fieldErrors.checkIn = 'Check-in date is invalid.';
    } else if (form.checkIn < toDateString(today)) {
        // Check-in must not be before today (Req 2.11).
        fieldErrors.checkIn = 'Check-in date cannot be in the past.';
    }

    if (checkOutBlank) {
        fieldErrors.checkOut = 'Check-out date is required.';
    } else if (!checkOutValid) {
        fieldErrors.checkOut = 'Check-out date is invalid.';
    } else if (checkInValid && form.checkOut <= form.checkIn) {
        // Check-out must be strictly after check-in (Req 2.11).
        fieldErrors.checkOut = 'Check-out date must be after check-in date.';
    }

    return { isValid: Object.keys(fieldErrors).length === 0, fieldErrors };
}

// ─── validateSessions ─────────────────────────────────────────

/**
 * Validates a list of naturalist sessions against count and date-range bounds.
 *
 * The list is valid if and only if its length is between 0 and 20 inclusive and
 * every session has a session date within `[checkIn, checkOut]` and a session
 * count between 1 and 20 inclusive.
 *
 * Dates are compared as `YYYY-MM-DD` strings, which order chronologically.
 *
 * Requirements: 2.2.
 */
export function validateSessions(
    sessions: NaturalistSessionInput[],
    checkIn: string,
    checkOut: string,
): boolean {
    if (sessions.length > MAX_SESSIONS) {
        return false;
    }

    return sessions.every((session) => {
        const countOk =
            Number.isInteger(session.numSessions) &&
            session.numSessions >= MIN_SESSION_COUNT &&
            session.numSessions <= MAX_SESSION_COUNT;

        const dateOk =
            isValidDateString(session.sessionDate) &&
            session.sessionDate >= checkIn &&
            session.sessionDate <= checkOut;

        return countOk && dateOk;
    });
}

// ─── buildCreateBookingRequest ────────────────────────────────

/**
 * Builds the `POST /bookings` request body from a checkout form state and the
 * active currency code.
 *
 * Produces an object containing exactly the documented keys: `lodgeId`,
 * `roomTypeId`, `checkIn`, `checkOut`, `adults`, `children`, `guest`, optional
 * `naturalistSessions`, and `currencyPaid`. `currencyPaid` equals the passed
 * active currency code. Optional guest fields (`whatsappEnabled`,
 * `specialRequests`) and `naturalistSessions` are included only when present.
 *
 * Requirements: 2.3, 15.8.
 */
export function buildCreateBookingRequest(
    form: CheckoutFormState,
    currencyPaid: string,
): CreateBookingRequest {
    const guest: CreateBookingRequest['guest'] = {
        firstName: form.guest.firstName,
        lastName: form.guest.lastName,
        email: form.guest.email,
        phone: form.guest.phone,
    };

    if (form.guest.whatsappEnabled !== undefined) {
        guest.whatsappEnabled = form.guest.whatsappEnabled;
    }
    if (form.guest.specialRequests !== undefined) {
        guest.specialRequests = form.guest.specialRequests;
    }

    const request: CreateBookingRequest = {
        lodgeId: form.lodgeId,
        roomTypeId: form.roomTypeId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: form.adults,
        children: form.children,
        guest,
        currencyPaid,
    };

    if (form.naturalistSessions && form.naturalistSessions.length > 0) {
        request.naturalistSessions = form.naturalistSessions;
    }

    return request;
}
