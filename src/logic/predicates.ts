/**
 * Pure predicate helpers for UI decision logic.
 *
 * This module contains framework-agnostic predicates used by the SearchBox,
 * booking cancellation, and testimonials surfaces. Keeping them here lets the
 * logic be unit/property-tested independently of React.
 *
 * Requirements: 4.1, 9.6, 11.4, 11.5, 11.6
 */
import { BookingStatus, CANCELLABLE_STATUSES, Testimonial } from '@/types/api';

/**
 * Search submission is enabled if and only if both a region and a park are
 * non-empty selections.
 *
 * Requirement 9.6
 */
export function canSubmitSearch(
    region: string | null | undefined,
    park: string | null | undefined
): boolean {
    return isNonEmpty(region) && isNonEmpty(park);
}

/**
 * The cancel-booking action is offered if and only if the booking's status is
 * one of the cancellable statuses and the viewer is the booking's owner.
 *
 * Requirement 4.1
 */
export function canCancelBooking(status: BookingStatus, isOwner: boolean): boolean {
    return isOwner && (CANCELLABLE_STATUSES as readonly string[]).includes(status);
}

/**
 * The testimonials section is rendered if and only if there is no error and the
 * list contains at least one testimonial; otherwise it is omitted.
 *
 * Requirements 11.4, 11.5
 */
export function shouldRenderTestimonials(
    hasError: boolean,
    testimonials: Testimonial[] | null | undefined
): boolean {
    return !hasError && Array.isArray(testimonials) && testimonials.length > 0;
}

/**
 * Resolves the image to display for a testimonial. Returns the testimonial's
 * image when it is a non-empty value, otherwise the placeholder. The result is
 * always non-empty (assuming a non-empty placeholder).
 *
 * Requirement 11.6
 */
export function resolveTestimonialImage(testimonial: Testimonial, placeholder: string): string {
    return isNonEmpty(testimonial.image) ? testimonial.image : placeholder;
}

/**
 * A value is a non-empty selection when it is a string with at least one
 * non-whitespace character.
 */
function isNonEmpty(value: string | null | undefined): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}
