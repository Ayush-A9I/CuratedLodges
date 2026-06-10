'use client';

import React, { useEffect } from 'react';
import styles from './admin.module.css';

export interface ModalProps {
    /** Whether the modal is visible. */
    open: boolean;
    /** Called when the overlay or close button is clicked, or Escape pressed. */
    onClose: () => void;
    /** Header title text. */
    title?: string;
    children: React.ReactNode;
    /** Optional footer node (typically action buttons). */
    footer?: React.ReactNode;
    /** Max width of the dialog in px. Defaults to the CSS default (560). */
    maxWidth?: number;
}

/**
 * Overlay dialog used for create/edit forms. Closes on overlay click and on
 * Escape. Render its form inside `children` and actions inside `footer`.
 */
export function Modal({ open, onClose, title, children, footer, maxWidth }: ModalProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onMouseDown={onClose}>
            <div
                className={styles.modal}
                style={maxWidth ? { maxWidth } : undefined}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className={styles.modalHeader}>
                        <h3 className={styles.modalTitle}>{title}</h3>
                        <button className={styles.modalClose} onClick={onClose} aria-label="Close dialog">
                            ×
                        </button>
                    </div>
                )}
                <div className={styles.modalBody}>{children}</div>
                {footer && <div className={styles.modalFooter}>{footer}</div>}
            </div>
        </div>
    );
}

export default Modal;
