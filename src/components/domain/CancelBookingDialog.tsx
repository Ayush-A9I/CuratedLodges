'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { useApiMutation } from '@/hooks/useApiMutation';
import { api } from '@/lib/api';
import type { CancelBookingResponse } from '@/types/api';

import styles from './CancelBookingDialog.module.css';

export interface CancelBookingDialogProps {
    /** Whether the confirmation modal is rendered. */
    open: boolean;
    /** The booking identifier passed to `api.cancelBooking`. */
    bookingId: string;
    /** Closes the dialog without cancelling (the "keep booking" path). */
    onClose: () => void;
    /**
     * Invoked with the {@link CancelBookingResponse} after a successful cancel.
     * The page uses this to update the displayed status and refund message and
     * to remove the cancel affordance (Req 4.4).
     */
    onCancelled: (result: CancelBookingResponse) => void;
}

/**
 * Confirmation prompt for cancelling a booking (Req 4.2, 4.3, 4.5, 4.6, 4.7).
 *
 * The destructive `cancelBooking` call is issued only when the user explicitly
 * confirms (Req 4.2, 4.3). Submission goes through {@link useApiMutation}, which
 * provides the single-flight guard and the 30s timeout that re-enables the
 * confirm button (Req 4.5, 4.7). On failure the normalized Error_State message
 * is shown inline and the dialog stays open so the booking is left unchanged
 * (Req 4.6); on success the result is handed back to the page via
 * {@link CancelBookingDialogProps.onCancelled}.
 */
export default function CancelBookingDialog({
    open,
    bookingId,
    onClose,
    onCancelled,
}: CancelBookingDialogProps) {
    const { t } = useTranslation();

    const { submit, submitting, error, reset } = useApiMutation<void, CancelBookingResponse>(
        () => api.cancelBooking(bookingId) as Promise<CancelBookingResponse>,
        {
            onSuccess: (result) => {
                onCancelled(result);
            },
        },
    );

    if (!open) {
        return null;
    }

    const handleConfirm = () => {
        // Single-flight guard inside the hook ignores re-entrant clicks.
        void submit(undefined);
    };

    const handleClose = () => {
        // Keep the modal open while a cancel is in flight (Req 4.5).
        if (submitting) return;
        reset();
        onClose();
    };

    return (
        <div className={styles.backdrop} role="presentation" onClick={handleClose}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancelBookingTitle"
                aria-describedby="cancelBookingMessage"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 id="cancelBookingTitle" className={styles.title}>
                    {t('cancelBooking.title')}
                </h2>
                <p id="cancelBookingMessage" className={styles.message}>
                    {t('cancelBooking.message')}
                </p>

                {error && (
                    <p className={styles.error} role="alert">
                        {error.message}
                    </p>
                )}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.keepButton}
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        {t('cancelBooking.keep')}
                    </button>
                    <button
                        type="button"
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                        disabled={submitting}
                    >
                        {submitting ? t('cancelBooking.cancelling') : t('cancelBooking.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
