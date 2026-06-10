'use client';

import React from 'react';
import styles from './form.module.css';

export interface SubmitButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * When true the button shows a spinner, is disabled, and exposes
     * `aria-busy` so assistive technology announces the in-progress state.
     */
    loading?: boolean;
    /** Optional text to show while loading (defaults to the children). */
    loadingText?: string;
}

/**
 * Themed submit button that reproduces the `.submitButton` look of the sign-in
 * and forgot-password pages (DM Sans, orange fill, 8px radius, lift on hover).
 *
 * Supports a loading/disabled state: while `loading` is true (or `disabled` is
 * set) the button is non-interactive, and a spinner plus optional
 * `loadingText` are shown.
 */
const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
    function SubmitButton(
        {
            loading = false,
            loadingText,
            disabled,
            type = 'submit',
            className,
            children,
            ...rest
        },
        ref
    ) {
        const isDisabled = loading || disabled;
        const classes = [styles.submitButton, className].filter(Boolean).join(' ');

        return (
            <button
                ref={ref}
                type={type}
                className={classes}
                disabled={isDisabled}
                aria-busy={loading || undefined}
                {...rest}
            >
                {loading && <span className={styles.spinner} aria-hidden="true" />}
                {loading ? loadingText ?? children : children}
            </button>
        );
    }
);

export default SubmitButton;
