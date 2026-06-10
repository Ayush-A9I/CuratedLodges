import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { sortByCheckInDesc } from './bookingsSort';
import type { Booking } from '@/types/api';

/**
 * Property-based test for `sortByCheckInDesc`.
 *
 * Property 5 verifies that the sort returns a permutation of the input (same
 * multiset of bookings) ordered so each booking's `checkIn` is >= the next
 * (descending), and that the input array is not mutated.
 */

/** A YYYY-MM-DD date string that sorts chronologically under string comparison. */
const checkInArb = fc
    .date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })
    .map((d) => d.toISOString().slice(0, 10));

/** Minimal-but-complete Booking generator; only `checkIn` affects ordering. */
const bookingArb = (index: number): fc.Arbitrary<Booking> =>
    checkInArb.map((checkIn) => ({
        id: `id-${index}`,
        bookingId: `JL${index}`,
        lodge: { name: 'Lodge' },
        roomType: { name: 'Room' },
        checkIn,
        checkOut: checkIn,
        numNights: 1,
        adults: 1,
        children: 0,
        roomTotal: 0,
        experienceTotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        status: 'confirmed',
        paymentStatus: 'paid',
    }));

const bookingsArb = fc
    .integer({ min: 0, max: 20 })
    .chain((n) =>
        fc.tuple(...Array.from({ length: n }, (_, i) => bookingArb(i)))
    )
    .map((arr) => arr as Booking[]);

describe('sortByCheckInDesc (Property 5)', () => {
    it('returns a non-mutating descending permutation by checkIn', () => {
        // Feature: frontend-api-integration, Property 5: My Bookings sort is a descending permutation by check-in date
        // Validates: Requirements 5.3
        fc.assert(
            fc.property(bookingsArb, (bookings) => {
                const snapshot = bookings.slice();
                const result = sortByCheckInDesc(bookings);

                // Input is not mutated (same elements in same order).
                expect(bookings).toEqual(snapshot);

                // Result is a permutation of the input (same multiset by reference).
                expect(result).toHaveLength(bookings.length);
                const sortRefs = (xs: Booking[]) =>
                    [...xs].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
                expect(sortRefs(result)).toEqual(sortRefs(bookings));
                result.forEach((b) => expect(bookings).toContain(b));

                // Ordering: each checkIn >= the next (descending).
                for (let i = 0; i + 1 < result.length; i++) {
                    expect(
                        result[i].checkIn >= result[i + 1].checkIn
                    ).toBe(true);
                }
            }),
            { numRuns: 100 }
        );
    });
});
