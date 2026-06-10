'use client';

import React from 'react';
import styles from './admin.module.css';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
    /** Whether the dialog is visible. */
    open: boolean;
    /** Dialog title. Defaults to "Confirm". */
    title?: string;
    /** Body message — string or custom node. */
    message: React.ReactNode;
    /** Confirm button label. Defaults to "Delete". */
    confirmLabel?: string;
    /** Cancel button label. Defaults to "Cancel". */
    cancelLabel?: string;
    /** Whether the confirm action is destructive (red button). Defaults true. */
    destructive?: boolean;
    /** Disables the confirm button + shows spinner. */
    loading?: boolean;
    /** Called when the user confirms. */
    onConfirm: () => void;
    /** Called when the user cancels / dismisses. */
    onCancel: () => void;
}

/** Confirmation dialog, typically used before delete actions. */
export function ConfirmDialog({
    open,
    title = 'Confirm',
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    destructive = true,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            onClose={onCancel}
            title={title}
            maxWidth={420}
            footer={
                <>
                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </button>
                    <button
                        className={`${styles.btn} ${destructive ? styles.btnDanger : styles.btnPrimary}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && (
                            <span className={styles.spinner} style={{ width: 16, height: 16, margin: 0 }} />
                        )}
                        {confirmLabel}
                    </button>
                </>
            }
        >
            <div className={styles.confirmMessage}>{message}</div>
        </Modal>
    );
}

export default ConfirmDialog;
