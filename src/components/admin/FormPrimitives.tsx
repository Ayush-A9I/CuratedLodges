'use client';

import React from 'react';
import styles from './admin.module.css';

/* ─── AdminLabel ─── */
export interface AdminLabelProps {
    htmlFor?: string;
    children: React.ReactNode;
    required?: boolean;
}

export function AdminLabel({ htmlFor, children, required }: AdminLabelProps) {
    return (
        <label className={styles.label} htmlFor={htmlFor}>
            {children}
            {required && <span className={styles.required}>*</span>}
        </label>
    );
}

/* ─── FormRow ─── */
export interface FormRowProps {
    children: React.ReactNode;
    /** Lay children out side-by-side (collapses to stacked on mobile). */
    inline?: boolean;
    className?: string;
}

export function FormRow({ children, inline, className }: FormRowProps) {
    return (
        <div
            className={`${inline ? styles.formRowInline : styles.formRow} ${className || ''}`.trim()}
        >
            {children}
        </div>
    );
}

/* ─── AdminInput ─── */
export interface AdminInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    required?: boolean;
    /** Wrap the field in its own FormRow. Defaults to true. */
    wrapRow?: boolean;
}

export function AdminInput({
    label,
    error,
    required,
    wrapRow = true,
    id,
    className,
    ...rest
}: AdminInputProps) {
    const inputId = id || rest.name;
    const field = (
        <>
            {label && (
                <AdminLabel htmlFor={inputId} required={required}>
                    {label}
                </AdminLabel>
            )}
            <input
                id={inputId}
                className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`.trim()}
                {...rest}
            />
            {error && <div className={styles.fieldError}>{error}</div>}
        </>
    );
    return wrapRow ? <FormRow>{field}</FormRow> : field;
}

/* ─── AdminTextarea ─── */
export interface AdminTextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    required?: boolean;
    wrapRow?: boolean;
}

export function AdminTextarea({
    label,
    error,
    required,
    wrapRow = true,
    id,
    className,
    ...rest
}: AdminTextareaProps) {
    const inputId = id || rest.name;
    const field = (
        <>
            {label && (
                <AdminLabel htmlFor={inputId} required={required}>
                    {label}
                </AdminLabel>
            )}
            <textarea
                id={inputId}
                className={`${styles.textarea} ${error ? styles.inputError : ''} ${className || ''}`.trim()}
                {...rest}
            />
            {error && <div className={styles.fieldError}>{error}</div>}
        </>
    );
    return wrapRow ? <FormRow>{field}</FormRow> : field;
}

/* ─── AdminSelect ─── */
export interface AdminSelectOption {
    value: string;
    label: string;
}

export interface AdminSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    required?: boolean;
    options?: AdminSelectOption[];
    placeholder?: string;
    wrapRow?: boolean;
}

export function AdminSelect({
    label,
    error,
    required,
    options,
    placeholder,
    wrapRow = true,
    id,
    className,
    children,
    ...rest
}: AdminSelectProps) {
    const inputId = id || rest.name;
    const field = (
        <>
            {label && (
                <AdminLabel htmlFor={inputId} required={required}>
                    {label}
                </AdminLabel>
            )}
            <select
                id={inputId}
                className={`${styles.select} ${error ? styles.inputError : ''} ${className || ''}`.trim()}
                {...rest}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options
                    ? options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))
                    : children}
            </select>
            {error && <div className={styles.fieldError}>{error}</div>}
        </>
    );
    return wrapRow ? <FormRow>{field}</FormRow> : field;
}

/* ─── AdminCheckbox ─── */
export interface AdminCheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    wrapRow?: boolean;
}

export function AdminCheckbox({ label, wrapRow = true, id, className, ...rest }: AdminCheckboxProps) {
    const inputId = id || rest.name;
    const field = (
        <div className={styles.checkboxRow}>
            <input
                id={inputId}
                type="checkbox"
                className={`${styles.checkbox} ${className || ''}`.trim()}
                {...rest}
            />
            <label htmlFor={inputId} className={styles.checkboxLabel}>
                {label}
            </label>
        </div>
    );
    return wrapRow ? <FormRow>{field}</FormRow> : field;
}

/* ─── SaveButton ─── */
export interface SaveButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Shows a spinner + disables the button while true. */
    loading?: boolean;
    /** Button label. Defaults to "Save". */
    children?: React.ReactNode;
    /** Visual variant. Defaults to 'primary'. */
    variant?: 'primary' | 'secondary' | 'danger';
}

export function SaveButton({
    loading,
    children = 'Save',
    variant = 'primary',
    disabled,
    className,
    ...rest
}: SaveButtonProps) {
    const variantClass =
        variant === 'danger'
            ? styles.btnDanger
            : variant === 'secondary'
                ? styles.btnSecondary
                : styles.btnPrimary;
    return (
        <button
            type="submit"
            className={`${styles.btn} ${variantClass} ${className || ''}`.trim()}
            disabled={loading || disabled}
            {...rest}
        >
            {loading && <span className={styles.spinner} style={{ width: 16, height: 16, margin: 0 }} />}
            {children}
        </button>
    );
}
