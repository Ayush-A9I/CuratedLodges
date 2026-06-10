'use client';

import React from 'react';
import styles from './form.module.css';

export interface FieldErrorProps {
    /** The validation message to display. When empty/undefined nothing renders. */
    message?: string | null;
    /**
     * The id used to associate this error with its input via `aria-describedby`.
     * Provided by `Field` so screen readers announce the error for the input.
     */
    id?: string;
}

/**
 * Renders a single field-level validation message.
 *
 * Reuses the validation-message styling conventions of the sign-in and
 * forgot-password forms. Returns null when there is no message so callers can
 * always render it unconditionally.
 *
 * The `role="alert"` ensures assistive technology announces the error when it
 * appears.
 */
export default function FieldError({ message, id }: FieldErrorProps) {
    if (!message) {
        return null;
    }

    return (
        <p id={id} className={styles.fieldError} role="alert">
            {message}
        </p>
    );
}
