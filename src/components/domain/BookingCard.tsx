'use client'

import { useTranslation } from 'react-i18next'
import { useLocalization } from '@/contexts/LocalizationContext'
import type { Booking, BookingStatus, PaymentStatus } from '@/types/api'
import styles from './BookingCard.module.css'

interface BookingCardProps {
    /** The booking to summarize. */
    booking: Booking
    /** Invoked when the card is activated (click / keyboard). */
    onSelect?: (booking: Booking) => void
}

/**
 * Maps a booking status to its CSS-module status-badge class. Unknown values
 * fall back to a neutral style so the badge always renders.
 */
const statusClassName: Record<BookingStatus, string> = {
    held: styles.statusHeld,
    pending: styles.statusPending,
    confirmed: styles.statusConfirmed,
    cancelled: styles.statusCancelled,
    completed: styles.statusCompleted,
    no_show: styles.statusNoShow,
}

/**
 * Maps a payment status to its CSS-module badge class.
 */
const paymentClassName: Record<PaymentStatus, string> = {
    pending: styles.paymentPending,
    paid: styles.paymentPaid,
    partially_paid: styles.paymentPartial,
    refunded: styles.paymentRefunded,
    failed: styles.paymentFailed,
}

/**
 * Formats an ISO date string (e.g. "2025-03-14") for display. Falls back to the
 * raw value if it cannot be parsed.
 */
function formatDate(value: string, locale: string): string {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

/**
 * Presentational card showing a single booking summary for the My_Bookings_Page.
 *
 * Displays the lodge name, room type, check-in/check-out dates, number of
 * nights, total amount, booking status, and payment status (Req 5.2). The total
 * amount is rendered through the LocalizationContext `convertPrice`, so it is
 * formatted in the active currency (Req 5.9). The whole card is an accessible
 * button that invokes `onSelect` on click or keyboard activation.
 */
export default function BookingCard({ booking, onSelect }: BookingCardProps) {
    const { t, i18n } = useTranslation()
    const { convertPrice } = useLocalization()

    const handleActivate = () => {
        onSelect?.(booking)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!onSelect) return
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect(booking)
        }
    }

    const isInteractive = Boolean(onSelect)

    return (
        <div
            className={styles.card}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onClick={isInteractive ? handleActivate : undefined}
            onKeyDown={isInteractive ? handleKeyDown : undefined}
            aria-label={
                isInteractive
                    ? `${booking.lodge.name} — ${t('bookings.viewDetails')}`
                    : undefined
            }
            style={{ cursor: isInteractive ? 'pointer' : 'default' }}
        >
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h3 className={styles.lodgeName}>{booking.lodge.name}</h3>
                    <p className={styles.roomType}>{booking.roomType.name}</p>
                </div>
                <div className={styles.badges}>
                    <span
                        className={`${styles.badge} ${statusClassName[booking.status] ?? ''
                            }`}
                    >
                        {t(`bookings.statusLabel.${booking.status}`)}
                    </span>
                    <span
                        className={`${styles.badge} ${paymentClassName[booking.paymentStatus] ?? ''
                            }`}
                    >
                        {t(`bookings.paymentLabel.${booking.paymentStatus}`)}
                    </span>
                </div>
            </div>

            <div className={styles.dates}>
                <div className={styles.dateBlock}>
                    <span className={styles.dateLabel}>{t('bookings.checkIn')}</span>
                    <span className={styles.dateValue}>
                        {formatDate(booking.checkIn, i18n.language)}
                    </span>
                </div>
                <div className={styles.dateArrow} aria-hidden="true">
                    →
                </div>
                <div className={styles.dateBlock}>
                    <span className={styles.dateLabel}>{t('bookings.checkOut')}</span>
                    <span className={styles.dateValue}>
                        {formatDate(booking.checkOut, i18n.language)}
                    </span>
                </div>
                <div className={styles.nights}>
                    {booking.numNights}{' '}
                    {booking.numNights === 1
                        ? t('bookings.night')
                        : t('bookings.nights')}
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.totalBlock}>
                    <span className={styles.totalLabel}>{t('bookings.total')}</span>
                    <span className={styles.totalValue}>
                        {convertPrice(booking.totalAmount)}
                    </span>
                </div>
                {isInteractive && (
                    <span className={styles.viewDetails}>
                        {t('bookings.viewDetails')} →
                    </span>
                )}
            </div>
        </div>
    )
}
