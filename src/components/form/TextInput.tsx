'use client';

import React from 'react';
import styles from './form.module.css';

export interface TextInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /** When true, applies the error styling and is reflected via `aria-invalid`. */
    hasError?: boolean;
}

/**
 * Themed text input that reproduces the `.input` look of the sign-in and
 * forgot-password pages (DM Sans, 1.5px border, 8px radius, orange focus ring).
 *
 * Accepts all standard input props (`type`, `value`, `onChange`, `placeholder`,
 * `required`, `disabled`, etc.) and forwards a ref so it can be focused or
 * measured by parent forms.
 */
const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
    function TextInput({ hasError = false, className, ...rest }, ref) {
        const classes = [styles.input, hasError ? styles.inputError : '', className]
            .filter(Boolean)
            .join(' ');

        return (
            <input
                ref={ref}
                className={classes}
                aria-invalid={hasError || undefined}
                {...rest}
            />
        );
    }
);

export default TextInput;
