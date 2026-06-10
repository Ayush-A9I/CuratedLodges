import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import {
    validateCheckout,
    validateSessions,
    buildCreateBookingRequest,
    MAX_SESSIONS,
    type CheckoutFormState,
    type CheckoutFieldKey,
} from './checkoutValidation';
import type { NaturalistSessionInput } from '@/types/api';

// ── Shared date helpers ─────────────────────────────────────────
// Day numbers are whole days since the Unix epoch; multiplying by the number of
// milliseconds in a day yields a UTC-midnight Date, so the resulting YYYY-MM-DD
// strings are always well-formed and compare chronologically.
const MS_PER_DAY = 86_400_000;

function dayNumToStr(dayNum: number): string {
    const d = new Date(dayNum * MS_PER_DAY);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

const lettersGen = fc
    .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), {
        minLength: 1,
        maxLength: 6,
    })
    .map((cs) => cs.join(''));

// ════════════════════════════════════════════════════════════════
// Property 2 — validateCheckout
// ════════════════════════════════════════════════════════════════

// Each field generator yields the value to place in the form together with
// whether that value is, by construction, a violation. The expected set of
// flagged fields is then the union of all violated flags, and the form is valid
// exactly when no field is violated.
interface FieldOutcome<T> {
    value: T;
    violated: boolean;
}

const blankGen = fc.constantFrom('', '   ', '\t');
const filledGen = lettersGen.map((s) => `a${s}`);

const requiredStrField: fc.Arbitrary<FieldOutcome<string>> = fc.oneof(
    filledGen.map((value) => ({ value, violated: false })),
    blankGen.map((value) => ({ value, violated: true })),
);

const validEmailGen = fc
    .tuple(lettersGen, lettersGen, lettersGen)
    .map(([a, b, c]) => ({ value: `${a}@${b}.${c}`, violated: false }));
const invalidEmailGen = fc
    .constantFrom('', '   ', 'noat', 'a@nodot', 'a b@c.com', '@b.com', 'a@b.')
    .map((value) => ({ value, violated: true }));
const emailField = fc.oneof(validEmailGen, invalidEmailGen);

const adultsField: fc.Arbitrary<FieldOutcome<number>> = fc.oneof(
    fc.integer({ min: 1, max: 10 }).map((value) => ({ value, violated: false })),
    fc.integer({ min: -5, max: 0 }).map((value) => ({ value, violated: true })),
);

const childrenField: fc.Arbitrary<FieldOutcome<number>> = fc.oneof(
    fc.integer({ min: 0, max: 10 }).map((value) => ({ value, violated: false })),
    fc.integer({ min: -5, max: -1 }).map((value) => ({ value, violated: true })),
);

// Generates check-in / check-out strings plus an injectable `today`, modelling
// the coupled date rules: check-in must not be before today, and check-out must
// be strictly after check-in (the after-check is only meaningful when check-in
// is present).
const dateBlockGen = fc
    .record({
        todayDayNum: fc.integer({ min: 15_000, max: 25_000 }),
        ciKind: fc.constantFrom('blank', 'past', 'today', 'future'),
        ciOffset: fc.integer({ min: 1, max: 30 }),
        coKind: fc.constantFrom('blank', 'before', 'same', 'after'),
        coOffset: fc.integer({ min: 1, max: 30 }),
    })
    .map((cfg) => {
        const { todayDayNum, ciKind, ciOffset, coKind, coOffset } = cfg;
        const today = new Date(todayDayNum * MS_PER_DAY);

        const ciPresent = ciKind !== 'blank';
        let ciDayNum = todayDayNum;
        let checkIn = '';
        let checkInViolated = false;
        if (ciKind === 'blank') {
            checkInViolated = true;
        } else if (ciKind === 'past') {
            ciDayNum = todayDayNum - ciOffset;
            checkInViolated = true;
            checkIn = dayNumToStr(ciDayNum);
        } else if (ciKind === 'today') {
            ciDayNum = todayDayNum;
            checkIn = dayNumToStr(ciDayNum);
        } else {
            ciDayNum = todayDayNum + ciOffset;
            checkIn = dayNumToStr(ciDayNum);
        }

        const base = ciPresent ? ciDayNum : todayDayNum;
        let checkOut = '';
        let checkOutViolated = false;
        if (coKind === 'blank') {
            checkOutViolated = true;
        } else {
            let coDayNum = base;
            if (coKind === 'before') coDayNum = base - coOffset;
            else if (coKind === 'after') coDayNum = base + coOffset;
            checkOut = dayNumToStr(coDayNum);
            // Check-out is only flagged when check-in is present and check-out
            // is not strictly after it.
            checkOutViolated = ciPresent && coDayNum <= ciDayNum;
        }

        return { today, checkIn, checkOut, checkInViolated, checkOutViolated };
    });

const checkoutCaseGen = fc
    .record({
        lodgeId: filledGen,
        roomTypeId: requiredStrField,
        firstName: requiredStrField,
        lastName: requiredStrField,
        phone: requiredStrField,
        email: emailField,
        adults: adultsField,
        children: childrenField,
        dates: dateBlockGen,
    })
    .map((r) => {
        const form: CheckoutFormState = {
            lodgeId: r.lodgeId,
            roomTypeId: r.roomTypeId.value,
            checkIn: r.dates.checkIn,
            checkOut: r.dates.checkOut,
            adults: r.adults.value,
            children: r.children.value,
            guest: {
                firstName: r.firstName.value,
                lastName: r.lastName.value,
                email: r.email.value,
                phone: r.phone.value,
            },
        };

        const expected: CheckoutFieldKey[] = [];
        if (r.roomTypeId.violated) expected.push('roomTypeId');
        if (r.dates.checkInViolated) expected.push('checkIn');
        if (r.dates.checkOutViolated) expected.push('checkOut');
        if (r.adults.violated) expected.push('adults');
        if (r.children.violated) expected.push('children');
        if (r.firstName.violated) expected.push('firstName');
        if (r.lastName.violated) expected.push('lastName');
        if (r.email.violated) expected.push('email');
        if (r.phone.violated) expected.push('phone');

        return { form, today: r.dates.today, expected: expected.sort() };
    });

describe('validateCheckout', () => {
    // Feature: frontend-api-integration, Property 2: Checkout validation accepts a form state if and only if all field rules hold
    it('accepts a form state iff all field rules hold and flags exactly the violated fields', () => {
        fc.assert(
            fc.property(checkoutCaseGen, ({ form, today, expected }) => {
                const result = validateCheckout(form, today);
                const actual = Object.keys(result.fieldErrors).sort();

                expect(actual).toEqual(expected);
                expect(result.isValid).toBe(expected.length === 0);
            }),
            { numRuns: 100 },
        );
    });
});

// ════════════════════════════════════════════════════════════════
// Property 3 — validateSessions
// ════════════════════════════════════════════════════════════════

// Build a session whose date is inside or outside [checkIn, checkOut] and whose
// count is inside or outside [1, 20], tracking the expected validity.
const sessionCaseGen = (ciDayNum: number, coDayNum: number) =>
    fc
        .record({
            naturalistId: filledGen,
            dateKind: fc.constantFrom('inRange', 'before', 'after'),
            inOffset: fc.integer({ min: 0, max: Math.max(0, coDayNum - ciDayNum) }),
            outOffset: fc.integer({ min: 1, max: 30 }),
            countKind: fc.constantFrom('ok', 'tooLow', 'tooHigh', 'nonInteger'),
            okCount: fc.integer({ min: 1, max: 20 }),
            lowCount: fc.constantFrom(0, -1, -5),
            highCount: fc.constantFrom(21, 30, 100),
            fracCount: fc
                .double({ min: 1.1, max: 19.9, noNaN: true })
                .filter((x) => !Number.isInteger(x)),
        })
        .map((s) => {
            let dateDayNum: number;
            let dateOk: boolean;
            if (s.dateKind === 'inRange') {
                dateDayNum = ciDayNum + s.inOffset;
                dateOk = true;
            } else if (s.dateKind === 'before') {
                dateDayNum = ciDayNum - s.outOffset;
                dateOk = false;
            } else {
                dateDayNum = coDayNum + s.outOffset;
                dateOk = false;
            }

            let numSessions: number;
            let countOk: boolean;
            if (s.countKind === 'ok') {
                numSessions = s.okCount;
                countOk = true;
            } else if (s.countKind === 'tooLow') {
                numSessions = s.lowCount;
                countOk = false;
            } else if (s.countKind === 'tooHigh') {
                numSessions = s.highCount;
                countOk = false;
            } else {
                numSessions = s.fracCount;
                countOk = false;
            }

            const session: NaturalistSessionInput = {
                naturalistId: s.naturalistId,
                sessionDate: dayNumToStr(dateDayNum),
                numSessions,
            };
            return { session, valid: dateOk && countOk };
        });

const sessionsCaseGen = fc
    .record({
        ciDayNum: fc.integer({ min: 15_000, max: 25_000 }),
        rangeLen: fc.integer({ min: 0, max: 30 }),
    })
    .chain(({ ciDayNum, rangeLen }) => {
        const coDayNum = ciDayNum + rangeLen;
        // Lengths up to MAX_SESSIONS + 5 so the over-limit case is exercised.
        return fc
            .array(sessionCaseGen(ciDayNum, coDayNum), {
                minLength: 0,
                maxLength: MAX_SESSIONS + 5,
            })
            .map((cases) => ({
                sessions: cases.map((c) => c.session),
                checkIn: dayNumToStr(ciDayNum),
                checkOut: dayNumToStr(coDayNum),
                expectedValid:
                    cases.length <= MAX_SESSIONS && cases.every((c) => c.valid),
            }));
    });

describe('validateSessions', () => {
    // Feature: frontend-api-integration, Property 3: Naturalist sessions validate against count and date-range bounds
    it('accepts iff length 0..20 and every session date is within range and count is 1..20', () => {
        fc.assert(
            fc.property(sessionsCaseGen, ({ sessions, checkIn, checkOut, expectedValid }) => {
                expect(validateSessions(sessions, checkIn, checkOut)).toBe(expectedValid);
            }),
            { numRuns: 100 },
        );
    });
});

// ════════════════════════════════════════════════════════════════
// Property 4 — buildCreateBookingRequest
// ════════════════════════════════════════════════════════════════

const naturalistSessionGen: fc.Arbitrary<NaturalistSessionInput> = fc.record({
    naturalistId: filledGen,
    sessionDate: fc.integer({ min: 15_000, max: 25_000 }).map(dayNumToStr),
    numSessions: fc.integer({ min: 1, max: 20 }),
});

const buildCaseGen = fc.record({
    lodgeId: filledGen,
    roomTypeId: filledGen,
    checkIn: fc.integer({ min: 15_000, max: 25_000 }).map(dayNumToStr),
    checkOut: fc.integer({ min: 15_000, max: 25_000 }).map(dayNumToStr),
    adults: fc.integer({ min: 1, max: 10 }),
    children: fc.integer({ min: 0, max: 10 }),
    guest: fc.record({
        firstName: filledGen,
        lastName: filledGen,
        email: validEmailGen.map((e) => e.value),
        phone: filledGen,
        whatsappEnabled: fc.option(fc.boolean(), { nil: undefined }),
        specialRequests: fc.option(filledGen, { nil: undefined }),
    }),
    naturalistSessions: fc.option(
        fc.array(naturalistSessionGen, { minLength: 0, maxLength: 20 }),
        { nil: undefined },
    ),
    currencyPaid: fc.constantFrom('INR', 'USD', 'EUR', 'GBP', 'JPY'),
});

const DOCUMENTED_KEYS = [
    'lodgeId',
    'roomTypeId',
    'checkIn',
    'checkOut',
    'adults',
    'children',
    'guest',
    'currencyPaid',
];

describe('buildCreateBookingRequest', () => {
    // Feature: frontend-api-integration, Property 4: The createBooking request body is well-formed and carries the active currency
    it('produces exactly the documented keys, carries the active currency, and preserves guest fields', () => {
        fc.assert(
            fc.property(buildCaseGen, (c) => {
                const form: CheckoutFormState = {
                    lodgeId: c.lodgeId,
                    roomTypeId: c.roomTypeId,
                    checkIn: c.checkIn,
                    checkOut: c.checkOut,
                    adults: c.adults,
                    children: c.children,
                    guest: {
                        firstName: c.guest.firstName,
                        lastName: c.guest.lastName,
                        email: c.guest.email,
                        phone: c.guest.phone,
                        whatsappEnabled: c.guest.whatsappEnabled,
                        specialRequests: c.guest.specialRequests,
                    },
                    naturalistSessions: c.naturalistSessions,
                };

                const req = buildCreateBookingRequest(form, c.currencyPaid);

                // Top-level keys: documented base set, plus naturalistSessions
                // only when a non-empty list was provided.
                const expectedKeys = [...DOCUMENTED_KEYS];
                const sessionsIncluded =
                    Array.isArray(c.naturalistSessions) && c.naturalistSessions.length > 0;
                if (sessionsIncluded) expectedKeys.push('naturalistSessions');
                expect(Object.keys(req).sort()).toEqual(expectedKeys.sort());

                // Active currency carried through verbatim.
                expect(req.currencyPaid).toBe(c.currencyPaid);

                // Scalar fields preserved.
                expect(req.lodgeId).toBe(c.lodgeId);
                expect(req.roomTypeId).toBe(c.roomTypeId);
                expect(req.checkIn).toBe(c.checkIn);
                expect(req.checkOut).toBe(c.checkOut);
                expect(req.adults).toBe(c.adults);
                expect(req.children).toBe(c.children);

                // Guest carries the entered fields; optional keys only when set.
                expect(req.guest.firstName).toBe(c.guest.firstName);
                expect(req.guest.lastName).toBe(c.guest.lastName);
                expect(req.guest.email).toBe(c.guest.email);
                expect(req.guest.phone).toBe(c.guest.phone);

                const expectedGuestKeys = ['firstName', 'lastName', 'email', 'phone'];
                if (c.guest.whatsappEnabled !== undefined)
                    expectedGuestKeys.push('whatsappEnabled');
                if (c.guest.specialRequests !== undefined)
                    expectedGuestKeys.push('specialRequests');
                expect(Object.keys(req.guest).sort()).toEqual(expectedGuestKeys.sort());

                if (sessionsIncluded) {
                    expect(req.naturalistSessions).toEqual(c.naturalistSessions);
                }
            }),
            { numRuns: 100 },
        );
    });
});
