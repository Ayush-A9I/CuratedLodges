'use client'

import { useTranslation } from 'react-i18next'
import { useLocalization } from '@/contexts/LocalizationContext'
import styles from './BookingSummary.module.css'

interface BookingSummaryProps {
    /** Server-returned room subtotal (authoritative). */
    roomTotal: number
    /** Server-returned naturalist/experience subtotal (authoritative). */
    experienceTotal: number
    /** Server-returned tax amount (authoritative). */
    taxAmount: number
    /** Server-returned grand total (authoritative). */
    totalAmount: number
    /** Optional line-item context: number of nights for the stay. */
    numNights?: number
}

/**
 * Presentational summary of a booking's monetary totals.
 *
 * The amounts are returned by the backend (`createBooking`/`getBooking`) and are
 * treated as authoritative — this component never recalculates them, it only
 * formats them for display (Req 2.4). Every amount is rendered through the
 * LocalizationContext `convertPrice`, which prefixes the active currency symbol
 * and scales by the active exchange rate, so values are correct even when the
 * active currency is not INR (Req 2.5).
 */
export default function BookingSummary({
    roomTotal,
    experienceTotal,
    taxAmount,
    totalAmount,
    numNights,
}: BookingSummaryProps) {
    const { t } = useTranslation()
    const { convertPrice } = useLocalization()

    return (
        <div className={styles.summary}>
            {typeof numNights === 'number' && (
                <div className={styles.nights}>
                    {numNights} {t('checkout.nights')}
                </div>
            )}

            <div className={styles.lineItem}>
                <span className={styles.label}>{t('checkout.roomTotal')}</span>
                <span className={styles.value}>{convertPrice(roomTotal)}</span>
            </div>

            <div className={styles.lineItem}>
                <span className={styles.label}>{t('checkout.experiences')}</span>
                <span className={styles.value}>{convertPrice(experienceTotal)}</span>
            </div>

            <div className={styles.lineItem}>
                <span className={styles.label}>{t('checkout.taxes')}</span>
                <span className={styles.value}>{convertPrice(taxAmount)}</span>
            </div>

            <div className={styles.divider} />

            <div className={`${styles.lineItem} ${styles.totalRow}`}>
                <span className={styles.totalLabel}>{t('checkout.totalPayable')}</span>
                <span className={styles.totalValue}>{convertPrice(totalAmount)}</span>
            </div>

            <p className={styles.note}>{t('checkout.includesAll')}</p>
        </div>
    )
}
