'use client';

import React, { useId, useRef, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { AdminLabel, FormRow } from './FormPrimitives';
import styles from './admin.module.css';

export interface ImageUploadProps {
    /** Field label shown above the control. */
    label?: string;
    /** Current image URL (controlled value). */
    value: string;
    /** Called with the resulting URL — after an upload or a manual URL edit. */
    onChange: (url: string) => void;
    /** Marks the label with a required asterisk. */
    required?: boolean;
    /** Validation/error message to show under the control. */
    error?: string;
    /** Logical S3 folder this image belongs to (e.g. "lodges", "parks"). */
    folder?: string;
    /** Preview thumbnail height in px. Defaults to 120. */
    previewHeight?: number;
    /** Placeholder for the URL text input. */
    placeholder?: string;
    /** Placeholder image shown in preview when no URL is set yet. */
    fallbackPreview?: string;
    /** Wrap the control in its own FormRow. Defaults to true. */
    wrapRow?: boolean;
    /** Called after a successful file upload (not manual URL edits). */
    onUploaded?: (url: string) => void;
}

const DEFAULT_ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/**
 * Admin image field with two ways to set a URL:
 *  1. Upload a file (browser → backend → S3 → public URL), or
 *  2. Paste/edit a URL directly (fallback that always works).
 *
 * The resulting URL is reported via `onChange` and saved through the existing
 * entity endpoints — this component never persists anything itself.
 */
export function ImageUpload({
    label,
    value,
    onChange,
    required,
    error,
    folder,
    previewHeight = 120,
    placeholder = 'https://… or upload a file',
    wrapRow = true,
    fallbackPreview,
    onUploaded,
}: ImageUploadProps) {
    const inputId = useId();
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null as string | null);
    const [previewFailed, setPreviewFailed] = useState(false);
    const [previewVersion, setPreviewVersion] = useState(0);

    const handlePick = () => {
        setUploadError(null);
        fileRef.current?.click();
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Reset the input so picking the same file again re-triggers change.
        e.target.value = '';
        if (!file) return;

        if (!DEFAULT_ALLOWED.includes(file.type)) {
            setUploadError(`Unsupported file type. Allowed: ${DEFAULT_ALLOWED.join(', ')}.`);
            return;
        }

        setUploading(true);
        setUploadError(null);
        try {
            const uploaded = await adminApi.uploads.upload(file, folder);
            setPreviewFailed(false);
            setPreviewVersion((v) => v + 1);
            onChange(uploaded.publicUrl);
            onUploaded?.(uploaded.publicUrl);
        } catch (err) {
            const msg =
                err instanceof AdminApiError
                    ? err.message
                    : err instanceof Error
                        ? err.message
                        : 'Upload failed.';
            setUploadError(msg);
        } finally {
            setUploading(false);
        }
    };

    const trimmed = value.trim();
    const previewBase = trimmed || fallbackPreview || '';
    const previewSrc =
        previewBase && previewVersion > 0 && trimmed
            ? `${previewBase}${previewBase.includes('?') ? '&' : '?'}v=${previewVersion}`
            : previewBase;
    const showError = error || uploadError || undefined;

    const control = (
        <>
            {label && (
                <AdminLabel htmlFor={inputId} required={required}>
                    {label}
                </AdminLabel>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input
                    id={inputId}
                    type="url"
                    inputMode="url"
                    className={`${styles.input} ${showError ? styles.inputError : ''}`.trim()}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        setPreviewFailed(false);
                        onChange(e.target.value);
                    }}
                />
                <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={handlePick}
                    disabled={uploading}
                >
                    {uploading && (
                        <span className={styles.spinner} style={{ width: 14, height: 14, margin: 0 }} />
                    )}
                    {uploading ? 'Uploading…' : 'Upload'}
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept={DEFAULT_ALLOWED.join(',')}
                    style={{ display: 'none' }}
                    onChange={handleFile}
                />
            </div>

            {showError && <div className={styles.fieldError}>{showError}</div>}

            {previewSrc && !previewFailed ? (
                <div style={{ marginTop: 8 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={previewSrc}
                        alt={trimmed ? 'Preview' : 'Placeholder preview'}
                        style={{
                            display: 'block',
                            maxWidth: '100%',
                            maxHeight: previewHeight,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '1px solid var(--cl-border)',
                            background: 'var(--cl-bg)',
                            opacity: trimmed ? 1 : 0.85,
                        }}
                        onError={() => setPreviewFailed(true)}
                    />
                    {!trimmed && fallbackPreview ? (
                        <p className={styles.pageHeaderSubtitle} style={{ marginTop: 6, marginBottom: 0 }}>
                            Placeholder preview — upload or paste a URL to replace.
                        </p>
                    ) : null}
                </div>
            ) : null}
        </>
    );

    return wrapRow ? <FormRow>{control}</FormRow> : control;
}

export default ImageUpload;
