'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    PageHeader,
    AdminSelect,
    SaveButton,
    ConfirmDialog,
    useToast,
} from '@/components/admin';
import { formatMoney } from '@/lib/money';
import styles from '@/components/admin/admin.module.css';
import detail from '../bookingDetail.module.css';

/** Naturalist session attached to a booking. */
interface NaturalistSession {
    id: string;
    sessionDate: string;
    numSessions: number;
    pricePerSession: number;
    naturalist?: { name: string } | null;
}

/** Payment attached to a booking. */
interface Payment {
    id: string;
    gateway: string;
    gatewayTransactionId?: string | null;
    gatewayOrderId?: string | null;
    type: string;
    amount: number;
    currency: string;
    status: string;
    failureReason?: string | null;
    createdAt: string;
}

/** Full booking detail as returned by `GET /admin/bookings/:id`. */
interface BookingDetail {
    id: string;
    bookingId: string;
    checkIn: string;
    checkOut: string;
    numNights: number;
    adults: number;
    children: number;
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests?: string | null;
    roomTotal: number;
    experienceTotal: number;
    taxAmount: number;
    totalAmount: number;
    currencyPaid: string;
    status: string;
    paymentStatus: string;
    createdAt: string;
    lodge?: { name: string } | null;
    roomType?: { name: string } | null;
    user?: { email: string; firstName: string; lastName: string } | null;
    naturalistSessions?: NaturalistSession[];
    payments?: Payment[];
}

const inr = (amount: number) => formatMoney(amount ?? 0, 'INR');

const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString() : '—';

const formatDateTime = (value?: string) =>
    value ? new Date(value).toLocaleString() : '—';

/** Statuses allowed by the backend updateBookingStatusSchema. */
const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
    { value: 'no_show', label: 'No show' },
];

export default function AdminBookingDetailPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id as string;
    const router = useRouter();
    const toast = useToast();

    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statusDraft, setStatusDraft] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = (await adminApi.bookings.get(id)) as BookingDetail;
            setBooking(data);
            setStatusDraft(data.status);

            // The detail endpoint includes payments, but fetch the dedicated
            // payments endpoint as the source of truth and fall back to the
            // embedded list if the request returns nothing.
            try {
                const res = (await adminApi.bookings.payments(id)) as { payments: Payment[] };
                setPayments(res?.payments ?? data.payments ?? []);
            } catch {
                setPayments(data.payments ?? []);
            }
        } catch (err) {
            setError(
                err instanceof AdminApiError ? err.message : 'Failed to load booking.'
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) load();
    }, [id, load]);

    const handleSaveStatus = async () => {
        setSaving(true);
        try {
            await adminApi.bookings.updateStatus(id, statusDraft);
            toast.success('Booking status updated.');
            setConfirmOpen(false);
            await load();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to update status.'
            );
        } finally {
            setSaving(false);
        }
    };

    const guestName = booking
        ? `${booking.guestFirstName || ''} ${booking.guestLastName || ''}`.trim() || '—'
        : '';

    const statusDirty = !!booking && statusDraft !== booking.status;

    return (
        <div>
            <button className={detail.backLink} onClick={() => router.push('/admin/bookings')}>
                ← Back to bookings
            </button>

            <PageHeader
                title={booking ? `Booking ${booking.bookingId}` : 'Booking'}
                subtitle={booking ? `Created ${formatDateTime(booking.createdAt)}` : undefined}
            />

            {error && (
                <div className={styles.loginError} role="alert">
                    {error}
                </div>
            )}

            {loading && !booking ? (
                <div className={styles.panel}>
                    <div style={{ padding: '32px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className={styles.spinner} />
                        Loading booking…
                    </div>
                </div>
            ) : booking ? (
                <div className={detail.grid}>
                    {/* Left column */}
                    <div className={detail.col}>
                        {/* Guest */}
                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>Guest</div>
                            <dl className={detail.dl}>
                                <dt className={detail.dt}>Name</dt>
                                <dd className={detail.dd}>{guestName}</dd>
                                <dt className={detail.dt}>Email</dt>
                                <dd className={detail.dd}>{booking.guestEmail || '—'}</dd>
                                <dt className={detail.dt}>Phone</dt>
                                <dd className={detail.dd}>{booking.guestPhone || '—'}</dd>
                                <dt className={detail.dt}>Account</dt>
                                <dd className={detail.dd}>
                                    {booking.user
                                        ? `${booking.user.firstName} ${booking.user.lastName} (${booking.user.email})`
                                        : 'Guest checkout'}
                                </dd>
                                {booking.specialRequests && (
                                    <>
                                        <dt className={detail.dt}>Special requests</dt>
                                        <dd className={detail.dd}>{booking.specialRequests}</dd>
                                    </>
                                )}
                            </dl>
                        </div>

                        {/* Stay */}
                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>Stay</div>
                            <dl className={detail.dl}>
                                <dt className={detail.dt}>Lodge</dt>
                                <dd className={detail.dd}>{booking.lodge?.name || '—'}</dd>
                                <dt className={detail.dt}>Room type</dt>
                                <dd className={detail.dd}>{booking.roomType?.name || '—'}</dd>
                                <dt className={detail.dt}>Check-in</dt>
                                <dd className={detail.dd}>{formatDate(booking.checkIn)}</dd>
                                <dt className={detail.dt}>Check-out</dt>
                                <dd className={detail.dd}>{formatDate(booking.checkOut)}</dd>
                                <dt className={detail.dt}>Nights</dt>
                                <dd className={detail.dd}>{booking.numNights}</dd>
                                <dt className={detail.dt}>Guests</dt>
                                <dd className={detail.dd}>
                                    {booking.adults} {booking.adults === 1 ? 'adult' : 'adults'}
                                    {booking.children > 0 &&
                                        `, ${booking.children} ${booking.children === 1 ? 'child' : 'children'}`}
                                </dd>
                            </dl>
                        </div>

                        {/* Naturalist sessions */}
                        {booking.naturalistSessions && booking.naturalistSessions.length > 0 && (
                            <div className={styles.panel}>
                                <div className={styles.panelHeader}>Naturalist sessions</div>
                                {booking.naturalistSessions.map((s) => (
                                    <div className={detail.lineItem} key={s.id}>
                                        <div className={detail.lineItemTop}>
                                            <span style={{ fontWeight: 600 }}>
                                                {s.naturalist?.name || 'Naturalist'}
                                            </span>
                                            <span className={detail.costValue}>
                                                {inr(s.numSessions * s.pricePerSession)}
                                            </span>
                                        </div>
                                        <div className={detail.lineItemMeta}>
                                            {formatDate(s.sessionDate)} · {s.numSessions}{' '}
                                            {s.numSessions === 1 ? 'session' : 'sessions'} ·{' '}
                                            {inr(s.pricePerSession)} each
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Payments */}
                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>Payments</div>
                            {payments.length === 0 ? (
                                <div className={detail.emptyState}>No payments recorded.</div>
                            ) : (
                                payments.map((p) => (
                                    <div className={detail.lineItem} key={p.id}>
                                        <div className={detail.lineItemTop}>
                                            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                                {p.type} · {p.gateway}
                                            </span>
                                            <span className={detail.costValue}>
                                                {formatMoney(p.amount, p.currency || 'INR')}
                                            </span>
                                        </div>
                                        <div className={detail.lineItemMeta}>
                                            <span className={styles.badge}>{p.status}</span>{' '}
                                            {formatDateTime(p.createdAt)}
                                            {p.gatewayTransactionId && ` · Txn ${p.gatewayTransactionId}`}
                                            {p.failureReason && ` · ${p.failureReason}`}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className={detail.col}>
                        {/* Status + payment status */}
                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>Status</div>
                            <dl className={detail.dl}>
                                <dt className={detail.dt}>Booking status</dt>
                                <dd className={detail.dd}>
                                    <span className={styles.badge}>{booking.status}</span>
                                </dd>
                                <dt className={detail.dt}>Payment status</dt>
                                <dd className={detail.dd}>
                                    <span className={styles.badge}>{booking.paymentStatus}</span>
                                </dd>
                            </dl>
                            <div className={detail.statusControl}>
                                <AdminSelect
                                    label="Update booking status"
                                    value={statusDraft}
                                    options={STATUS_OPTIONS}
                                    onChange={(e) => setStatusDraft(e.target.value)}
                                    wrapRow={false}
                                />
                                <div className={detail.statusActions}>
                                    <SaveButton
                                        type="button"
                                        disabled={!statusDirty || saving}
                                        loading={saving}
                                        onClick={() => setConfirmOpen(true)}
                                    >
                                        Save status
                                    </SaveButton>
                                </div>
                            </div>
                        </div>

                        {/* Cost breakdown */}
                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>Cost breakdown</div>
                            <div className={detail.costRows}>
                                <div className={detail.costRow}>
                                    <span className={detail.costLabel}>Room total</span>
                                    <span className={detail.costValue}>{inr(booking.roomTotal)}</span>
                                </div>
                                <div className={detail.costRow}>
                                    <span className={detail.costLabel}>Experience total</span>
                                    <span className={detail.costValue}>{inr(booking.experienceTotal)}</span>
                                </div>
                                <div className={detail.costRow}>
                                    <span className={detail.costLabel}>Tax</span>
                                    <span className={detail.costValue}>{inr(booking.taxAmount)}</span>
                                </div>
                                <div className={`${detail.costRow} ${detail.costTotal}`}>
                                    <span>Total</span>
                                    <span className={detail.costValue}>{inr(booking.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <ConfirmDialog
                open={confirmOpen}
                title="Update booking status"
                message={
                    booking
                        ? `Change booking ${booking.bookingId} status from "${booking.status}" to "${statusDraft}"?`
                        : ''
                }
                confirmLabel="Update"
                destructive={false}
                loading={saving}
                onConfirm={handleSaveStatus}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
}
