'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/auth';
import { LoadingState, ErrorState } from '@/components/feedback';
import BookingSummary from '@/components/domain/BookingSummary';
import CancelBookingDialog from '@/components/domain/CancelBookingDialog';
import { useApiResource } from '@/hooks/useApiResource';
import { api } from '@/lib/api';
import { canCancelBooking } from '@/logic/predicates';
import type { Booking, BookingStatus, CancelBookingResponse, PaymentStatus } from '@/types/api';

import styles from './booking.module.css';

/**
 * Maps a booking status to its CSS-module badge class. Unknown values fall back
 * to a neutral style so the badge always renders.
 */
const statusClassName: Record<BookingStatus, string> = {
    held: styles.statusHeld,
    pending: styles.statusPending,
    confirmed: styles.statusConfirmed,
    cancelled: styles.statusCancelled,
    completed: styles.statusCompleted,
    no_show: styles.statusNoShow,
};

/**
 * Maps a payment status to its CSS-module badge class.
 */
const paymentClassName: Record<PaymentStatus, string> = {
    pending: styles.paymentPending,
    paid: styles.paymentPaid,
    partially_paid: styles.paymentPartial,
    refunded: styles.paymentRefunded,
    failed: styles.paymentFailed,
};

/**
 * Formats an ISO date string (e.g. "2025-03-14") for display. Falls back to the
 * raw value if it cannot be parsed.
 */
function formatDate(value: string, locale: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Inner content of the Booking_Confirmation_Page (Req 3).
 *
 * Reads the `bookingId` from the route. When it is absent the `getBooking` call
 * is withheld and an Error_State is shown (Req 3.7). Otherwise it fetches the
 * booking via {@link useApiResource}, showing a Loading_State while in flight
 * (Req 3.3) and an Error_State with a retry affordance on failure (Req 3.4).
 * Every monetary amount is rendered through BookingSummary's `convertPrice`
 * formatting (Req 3.6).
 */
function BookingConfirmationContent() {
    const { t, i18n } = useTranslation();
    const params = useParams();

    const rawId = params?.bookingId;
    const bookingId = Array.isArray(rawId) ? rawId[0] : rawId ?? '';

    const { data, loading, error, retry } = useApiResource<Booking>(
        () => api.getBooking(bookingId),
        { enabled: Boolean(bookingId), deps: [bookingId] },
    );

    // Cancellation UI state (Req 4). `cancelResult` holds the server's response
    // after a successful cancel so the displayed status, refund message, and
    // cancel affordance reflect the new state without a refetch (Req 4.4).
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [cancelResult, setCancelResult] = React.useState<CancelBookingResponse | null>(null);

    let body: React.ReactNode;

    if (!bookingId) {
        // No identifier in the URL: withhold the call and explain (Req 3.7).
        body = <ErrorState message={t('booking.notFound')} />;
    } else if (loading) {
        body = <LoadingState messageKey="common.loading" />;
    } else if (error) {
        body = <ErrorState message={error.message} onRetry={retry} />;
    } else if (data) {
        const booking = data;
        // The displayed status reflects a successful cancel when one occurred,
        // otherwise the fetched status (Req 4.4).
        const displayStatus: BookingStatus = cancelResult ? cancelResult.status : booking.status;
        // The page is behind ProtectedRoute and getBooking is user-scoped, so the
        // authenticated viewer is treated as the owner (Req 4.1).
        const canCancel = canCancelBooking(displayStatus, true);
        body = (
            <article className={styles.card}>
                <header className={styles.cardHeader}>
                    <div className={styles.titleBlock}>
                        <span className={styles.eyebrow}>
                            {t('booking.confirmationTitle')}
                        </span>
                        <h2 className={styles.lodgeName}>{booking.lodge.name}</h2>
                        <p className={styles.roomType}>{booking.roomType.name}</p>
                    </div>
                    <div className={styles.badges}>
                        <span
                            className={`${styles.badge} ${statusClassName[displayStatus] ?? ''}`}
                        >
                            {t(`bookings.statusLabel.${displayStatus}`)}
                        </span>
                        <span
                            className={`${styles.badge} ${paymentClassName[booking.paymentStatus] ?? ''}`}
                        >
                            {t(`bookings.paymentLabel.${booking.paymentStatus}`)}
                        </span>
                    </div>
                </header>

                {displayStatus === 'held' && (
                    <div className={styles.heldNotice} role="status">
                        {t('booking.heldNotice', {
                            payment: t(`bookings.paymentLabel.${booking.paymentStatus}`),
                        })}
                    </div>
                )}

                <div className={styles.idRow}>
                    <span className={styles.idLabel}>{t('booking.bookingId')}</span>
                    <span className={styles.idValue}>{booking.bookingId}</span>
                </div>

                <div className={styles.detailGrid}>
                    <div className={styles.detailBlock}>
                        <span className={styles.detailLabel}>{t('booking.checkIn')}</span>
                        <span className={styles.detailValue}>
                            {formatDate(booking.checkIn, i18n.language)}
                        </span>
                    </div>
                    <div className={styles.detailBlock}>
                        <span className={styles.detailLabel}>{t('booking.checkOut')}</span>
                        <span className={styles.detailValue}>
                            {formatDate(booking.checkOut, i18n.language)}
                        </span>
                    </div>
                    <div className={styles.detailBlock}>
                        <span className={styles.detailLabel}>{t('booking.nights')}</span>
                        <span className={styles.detailValue}>{booking.numNights}</span>
                    </div>
                    <div className={styles.detailBlock}>
                        <span className={styles.detailLabel}>{t('booking.guests')}</span>
                        <span className={styles.detailValue}>
                            {t('booking.adultsCount', { count: booking.adults })}
                            {booking.children > 0 &&
                                `, ${t('booking.childrenCount', { count: booking.children })}`}
                        </span>
                    </div>
                </div>

                <div className={styles.summaryWrapper}>
                    <h3 className={styles.summaryHeading}>{t('booking.priceSummary')}</h3>
                    <BookingSummary
                        roomTotal={booking.roomTotal}
                        experienceTotal={booking.experienceTotal}
                        taxAmount={booking.taxAmount}
                        totalAmount={booking.totalAmount}
                        numNights={booking.numNights}
                    />
                </div>

                <div className={styles.statusGrid}>
                    <div className={styles.detailBlock}>
                        <span className={styles.detailLabel}>{t('booking.status')}</span>
                        <span className={styles.detailValue}>
                            {t(`bookings.statusLabel.${displayStatus}`)}
                        </span>
                    </div>
                    <div className={styles.detailBlock}>
                        <span className={styles.detailLabel}>{t('booking.payment')}</span>
                        <span className={styles.detailValue}>
                            {t(`bookings.paymentLabel.${booking.paymentStatus}`)}
                        </span>
                    </div>
                </div>

                {cancelResult && (
                    <div className={styles.heldNotice} role="status">
                        {cancelResult.message}
                    </div>
                )}

                {canCancel && (
                    <div className={styles.cancelRow}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => setDialogOpen(true)}
                        >
                            {t('cancelBooking.action')}
                        </button>
                    </div>
                )}

                <CancelBookingDialog
                    open={dialogOpen}
                    bookingId={bookingId}
                    onClose={() => setDialogOpen(false)}
                    onCancelled={(result) => {
                        setCancelResult(result);
                        setDialogOpen(false);
                    }}
                />
            </article>
        );
    }

    return (
        <>
            <Header darkMode={false} />
            <main className={styles.pageContainer}>
                <div className={styles.content}>
                    <h1 className={styles.pageTitle}>{t('booking.confirmationTitle')}</h1>
                    {body}
                </div>
            </main>
            <Footer />
        </>
    );
}

/**
 * Booking_Confirmation_Page route. Guarded by {@link ProtectedRoute} so only an
 * authenticated user can view a booking's details (Req 3, Req 12).
 */
export default function BookingConfirmationPage() {
    return (
        <ProtectedRoute>
            <BookingConfirmationContent />
        </ProtectedRoute>
    );
}
