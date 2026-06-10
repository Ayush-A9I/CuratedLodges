import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
    canSubmitSearch,
    canCancelBooking,
    shouldRenderTestimonials,
    resolveTestimonialImage,
} from './predicates';
import { CANCELLABLE_STATUSES } from '@/types/api';
import type { BookingStatus, Testimonial } from '@/types/api';

const ALL_STATUSES: BookingStatus[] = [
    'held',
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'no_show',
];

/** A value that may be a meaningful string, a blank/whitespace string, null, or undefined. */
const selectionArb = fc.oneof(
    fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    fc.constantFrom('', '   ', '\t', '\n'),
    fc.constant(null),
    fc.constant(undefined)
);

const isNonEmpty = (v: string | null | undefined): boolean =>
    typeof v === 'string' && v.trim().length > 0;

describe('canSubmitSearch (Property 12)', () => {
    it('is true iff both region and park are non-empty selections', () => {
        // Feature: frontend-api-integration, Property 12: Search submission is enabled if and only if both region and park are selected
        // Validates: Requirements 9.6
        fc.assert(
            fc.property(selectionArb, selectionArb, (region, park) => {
                expect(canSubmitSearch(region, park)).toBe(
                    isNonEmpty(region) && isNonEmpty(park)
                );
            }),
            { numRuns: 100 }
        );
    });
});

describe('canCancelBooking (Property 13)', () => {
    it('is true iff status is cancellable and the viewer is the owner', () => {
        // Feature: frontend-api-integration, Property 13: Booking cancel is offered if and only if status is cancellable and the viewer is the owner
        // Validates: Requirements 4.1
        fc.assert(
            fc.property(
                fc.constantFrom(...ALL_STATUSES),
                fc.boolean(),
                (status, isOwner) => {
                    const cancellable = (
                        CANCELLABLE_STATUSES as readonly string[]
                    ).includes(status);
                    expect(canCancelBooking(status, isOwner)).toBe(
                        cancellable && isOwner
                    );
                }
            ),
            { numRuns: 100 }
        );
    });
});

describe('shouldRenderTestimonials (Property 14)', () => {
    const testimonialArb: fc.Arbitrary<Testimonial> = fc.record({
        id: fc.string(),
        name: fc.string(),
        text: fc.string(),
    });

    const listArb = fc.oneof(
        fc.array(testimonialArb, { maxLength: 5 }),
        fc.constant(null),
        fc.constant(undefined)
    );

    it('is true iff there is no error and the list has at least one item', () => {
        // Feature: frontend-api-integration, Property 14: Testimonials section visibility depends only on success and non-empty data
        // Validates: Requirements 11.4, 11.5
        fc.assert(
            fc.property(fc.boolean(), listArb, (hasError, list) => {
                const expected =
                    !hasError && Array.isArray(list) && list.length > 0;
                expect(shouldRenderTestimonials(hasError, list)).toBe(expected);
            }),
            { numRuns: 100 }
        );
    });
});

describe('resolveTestimonialImage (Property 15)', () => {
    const testimonialArb: fc.Arbitrary<Testimonial> = fc.record(
        {
            id: fc.string(),
            name: fc.string(),
            text: fc.string(),
            image: fc.oneof(
                fc.string(),
                fc.constantFrom('', '   '),
                fc.constant(undefined)
            ),
        },
        { requiredKeys: ['id', 'name', 'text'] }
    );

    it('always returns a non-empty string (placeholder when no image)', () => {
        // Feature: frontend-api-integration, Property 15: Testimonial image resolution is always non-empty
        // Validates: Requirements 11.6
        fc.assert(
            fc.property(
                testimonialArb,
                fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
                (testimonial, placeholder) => {
                    const result = resolveTestimonialImage(testimonial, placeholder);
                    expect(typeof result).toBe('string');
                    expect(result.length).toBeGreaterThan(0);
                    // When the testimonial has no usable image, the placeholder is used.
                    if (!isNonEmpty(testimonial.image)) {
                        expect(result).toBe(placeholder);
                    } else {
                        expect(result).toBe(testimonial.image);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});
