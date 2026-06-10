'use client';

import React from 'react';
import styles from './form.module.css';
import FieldError from './FieldError';

export interface FieldProps {
    /** Stable id for the control. The label's `htmlFor` points at this id. */
    id: string;
    /** Visible label text shown above the control. */
    label: string;
    /** Field-level validation message; renders below the control when present. */
    error?: string | null;
    /** Marks the field as required (adds a visual marker + `required` on input). */
    required?: boolean;
    /**
     * The form control. Typically a `TextInput`, but any input-like element
     * works. The element is cloned so `Field` can wire up accessibility props
     * (`id`, `aria-describedby`, `aria-invalid`, `required`) automatically.
     */
    children: React.ReactElement;
    /** Optional extra class on the field wrapper. */
    className?: string;
}

/**
 * A labelled form field wrapper.
 *
 * Reproduces the `.inputGroup` layout (label stacked above the control with a
 * 6px gap) from the sign-in and forgot-password pages, and adds accessible
 * label association plus aria wiring for validation messages.
 *
 * Accessibility:
 * - The label is associated with the control via `htmlFor`/`id`.
 * - When an error is present it is rendered with `role="alert"` and linked to
 *   the control through `aria-describedby`, and the control gets
 *   `aria-invalid="true"`.
 */
export default function Field({
    id,
    label,
    error,
    required = false,
    children,
    className,
}: FieldProps) {
    const errorId = `${id}-error`;
    const hasError = Boolean(error);

    const control = React.cloneElement(children, {
        id,
        required: children.props.required ?? required,
        hasError: children.props.hasError ?? hasError,
        'aria-describedby': hasError
            ? [children.props['aria-describedby'], errorId].filter(Boolean).join(' ')
            : children.props['aria-describedby'],
    });

    const wrapperClasses = [styles.field, className].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <label htmlFor={id} className={styles.label}>
                {label}
                {required && (
                    <span className={styles.required} aria-hidden="true">
                        *
                    </span>
                )}
            </label>
            {control}
            <FieldError id={errorId} message={error} />
        </div>
    );
}
