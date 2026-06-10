/**
 * Pure My-Bookings sorting logic.
 *
 * This module contains no React or I/O. It orders a list of bookings by their
 * check-in date in descending order without mutating the input.
 *
 * Requirements:
 * - 5.3 My Bookings are ordered by check-in date descending; the result is a
 *       permutation of the input (same multiset of bookings).
 */

import type { Booking } from '@/types/api';

/**
 * Returns a NEW array containing the same bookings as `bookings`, ordered so
 * that each booking's `checkIn` date is greater than or equal to the next
 * booking's `checkIn` (descending).
 *
 * The input array is not mutated. `checkIn` is a `YYYY-MM-DD` string, which
 * sorts chronologically under lexicographic string comparison. The sort is
 * stable, so bookings sharing the same `checkIn` retain their relative order.
 */
export function sortByCheckInDesc(bookings: Booking[]): Booking[] {
    return bookings
        .slice()
        .sort((a, b) => (a.checkIn < b.checkIn ? 1 : a.checkIn > b.checkIn ? -1 : 0));
}
