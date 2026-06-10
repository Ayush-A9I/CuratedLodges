'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Field, TextInput, SubmitButton, FieldError } from '@/components/form';
import { ErrorState } from '@/components/feedback';
import NaturalistSessionPicker from '@/components/domain/NaturalistSessionPicker';
import BookingSummary from '@/components/domain/BookingSummary';

import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useApiMutation } from '@/hooks/useApiMutation';
import api from '@/lib/api';

import {
    validateCheckout,
    validateSessions,
    buildCreateBookingRequest,
    type CheckoutFormState,
    type CheckoutFieldKey,
} from '@/logic/checkoutValidation';
import type {
    Booking,
    CreateBookingRequest,
    LodgeDetail,
    NaturalistSessionInput,
} from '@/types/api';

import styles from './CheckoutForm.module.css';

export interface CheckoutFormProps {
    /** Lodge detail providing the room types and naturalists for this booking. */
    lodge: LodgeDetail;
    /** Room type pre-selected from the entry URL (`?room=`), if any. */
    initialRoomTypeId?: string;
}

/**
 * Checkout form body (Req 2).
 *
 * Collects room/dates/guests/sessions, pre-fills the guest identity from
 * `AuthContext` when authenticated (Req 2.10), validates through the pure
 * `checkoutValidation` logic before submit (Req 2.6/2.11/2.12), and submits the
 * documented `POST /bookings` body — carrying the active `currencyPaid` — through
 * the single-flight `useApiMutation` hook (Req 2.3/2.7/15.8). On success it
 * navigates to the booking confirmation page (Req 2.8); on error it surfaces a
 * themed error and retains every entered value (Req 2.9).
 */
export default function CheckoutForm({ lodge, initialRoomTypeId }: CheckoutFormProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuth();
    const { currency, convertPrice } = useLocalization();

    const roomTypes = lodge.roomTypes ?? [];
    const naturalists = lodge.naturalists ?? [];

    // ── Form state ────────────────────────────────────────────
    const [roomTypeId, setRoomTypeId] = useState<string>(() => {
        if (initialRoomTypeId && roomTypes.some((r) => r.id === initialRoomTypeId)) {
            return initialRoomTypeId;
        }
        return roomTypes[0]?.id ?? '';
    });
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    // Guest identity — pre-filled from AuthContext when authenticated (Req 2.10).
    const [firstName, setFirstName] = useState(user?.firstName ?? '');
    const [lastName, setLastName] = useState(user?.lastName ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [phone, setPhone] = useState('');
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [specialRequests, setSpecialRequests] = useState('');

    const [sessions, setSessions] = useState<NaturalistSessionInput[]>([]);

    // Validation output (populated on submit attempts).
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<CheckoutFieldKey, string>>
    >({});
    const [sessionsError, setSessionsError] = useState<string | null>(null);

    // ── Derived state ─────────────────────────────────────────
    const buildFormState = (): CheckoutFormState => ({
        lodgeId: lodge.id,
        roomTypeId,
        checkIn,
        checkOut,
        adults,
        children,
        guest: {
            firstName,
            lastName,
            email,
            phone,
            whatsappEnabled,
            specialRequests,
        },
        naturalistSessions: sessions,
    });

    const numNights = useMemo(() => {
        if (!checkIn || !checkOut || checkOut <= checkIn) {
            return 0;
        }
        const start = new Date(`${checkIn}T00:00:00Z`).getTime();
        const end = new Date(`${checkOut}T00:00:00Z`).getTime();
        const diff = Math.round((end - start) / 86_400_000);
        return diff > 0 ? diff : 0;
    }, [checkIn, checkOut]);

    const selectedRoom = roomTypes.find((r) => r.id === roomTypeId);

    // Client-side estimate, clearly labelled and never sent to the server.
    const estimate = useMemo(() => {
        const roomTotal = (selectedRoom?.price ?? 0) * numNights;
        const experienceTotal = sessions.reduce((sum, session) => {
            const naturalist = naturalists.find((n) => n.id === session.naturalistId);
            return sum + (naturalist?.pricePerSession ?? 0) * session.numSessions;
        }, 0);
        return { roomTotal, experienceTotal, total: roomTotal + experienceTotal };
    }, [selectedRoom, numNights, sessions, naturalists]);

    // ── Mutation ──────────────────────────────────────────────
    const { submit, submitting, error } = useApiMutation<CreateBookingRequest, Booking>(
        (body) => api.createBooking(body),
        {
            onSuccess: (result) => {
                const id = result.bookingId ?? result.id;
                if (id) {
                    router.push(`/booking/${id}`);
                }
            },
        },
    );

    // ── Submit handler ────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const form = buildFormState();
        const result = validateCheckout(form);
        const sessionsValid = validateSessions(sessions, checkIn, checkOut);

        setFieldErrors(result.fieldErrors);
        setSessionsError(sessionsValid ? null : t('checkout.sessionsLimit'));

        // Withhold the request on any invalid input (Req 2.6/2.11/2.12).
        if (!result.isValid || !sessionsValid) {
            return;
        }

        const body = buildCreateBookingRequest(form, currency);
        await submit(body);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.layout}>
                <div className={styles.main}>
                    {/* Accommodation */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>{t('checkout.accommodation')}</h2>
                        <div className={styles.field}>
                            <label htmlFor="roomType" className={styles.label}>
                                {t('checkout.accommodation')}
                                <span className={styles.required} aria-hidden="true">*</span>
                            </label>
                            <select
                                id="roomType"
                                className={`${styles.select} ${fieldErrors.roomTypeId ? styles.selectError : ''}`}
                                value={roomTypeId}
                                onChange={(e) => setRoomTypeId(e.target.value)}
                                aria-invalid={fieldErrors.roomTypeId ? true : undefined}
                            >
                                <option value="">—</option>
                                {roomTypes.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.name} — {convertPrice(room.price)}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={fieldErrors.roomTypeId} />
                        </div>
                    </section>

                    {/* Dates & guests */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>{t('checkout.datesGuests')}</h2>
                        <div className={styles.row}>
                            <Field
                                id="checkIn"
                                label={t('checkout.checkIn')}
                                error={fieldErrors.checkIn}
                                required
                            >
                                <TextInput
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                />
                            </Field>
                            <Field
                                id="checkOut"
                                label={t('checkout.checkOut')}
                                error={fieldErrors.checkOut}
                                required
                            >
                                <TextInput
                                    type="date"
                                    value={checkOut}
                                    min={checkIn || undefined}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                />
                            </Field>
                        </div>
                        <div className={styles.row}>
                            <Field
                                id="adults"
                                label={t('checkout.adults')}
                                error={fieldErrors.adults}
                                required
                            >
                                <TextInput
                                    type="number"
                                    inputMode="numeric"
                                    min={1}
                                    value={adults}
                                    onChange={(e) =>
                                        setAdults(
                                            Number.isFinite(e.target.valueAsNumber)
                                                ? e.target.valueAsNumber
                                                : 0,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                id="children"
                                label={t('checkout.children')}
                                error={fieldErrors.children}
                            >
                                <TextInput
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    value={children}
                                    onChange={(e) =>
                                        setChildren(
                                            Number.isFinite(e.target.valueAsNumber)
                                                ? e.target.valueAsNumber
                                                : -1,
                                        )
                                    }
                                />
                            </Field>
                        </div>
                    </section>

                    {/* Naturalist sessions (optional, 0–20) */}
                    <section className={styles.section}>
                        <NaturalistSessionPicker
                            naturalists={naturalists}
                            sessions={sessions}
                            onChange={setSessions}
                            checkIn={checkIn}
                            checkOut={checkOut}
                        />
                        <FieldError message={sessionsError} />
                    </section>

                    {/* Personal information */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            {t('checkout.personalInformation')}
                        </h2>
                        <div className={styles.row}>
                            <Field
                                id="firstName"
                                label={t('checkout.firstName')}
                                error={fieldErrors.firstName}
                                required
                            >
                                <TextInput
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </Field>
                            <Field
                                id="lastName"
                                label={t('checkout.lastName')}
                                error={fieldErrors.lastName}
                                required
                            >
                                <TextInput
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </Field>
                        </div>
                        <div className={styles.row}>
                            <Field
                                id="email"
                                label={t('checkout.email')}
                                error={fieldErrors.email}
                                required
                            >
                                <TextInput
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Field>
                            <Field
                                id="phone"
                                label={t('checkout.phone')}
                                error={fieldErrors.phone}
                                required
                            >
                                <TextInput
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </Field>
                        </div>
                    </section>

                    {/* Communication preferences */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            {t('checkout.communicationPreferences')}
                        </h2>
                        <label className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                checked={whatsappEnabled}
                                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                            />
                            <span>
                                <span className={styles.checkboxLabel}>
                                    {t('checkout.enableWhatsApp')}
                                </span>
                                <span className={styles.checkboxDesc}>
                                    {t('checkout.whatsAppDesc')}
                                </span>
                            </span>
                        </label>
                    </section>

                    {/* Special requests */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            {t('checkout.specialRequests')}
                        </h2>
                        <p className={styles.helpText}>{t('checkout.specialRequestsDesc')}</p>
                        <textarea
                            className={styles.textarea}
                            rows={3}
                            placeholder={t('checkout.specialRequestsPlaceholder')}
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                        />
                    </section>
                </div>

                {/* Summary rail */}
                <aside className={styles.summaryRail}>
                    <div className={styles.summaryCard}>
                        <h2 className={styles.summaryTitle}>{t('checkout.yourReservation')}</h2>
                        <p className={styles.lodgeName}>{lodge.name}</p>
                        {selectedRoom && (
                            <p className={styles.roomName}>{selectedRoom.name}</p>
                        )}

                        {/* Client estimate, clearly labelled; server totals are authoritative. */}
                        <BookingSummary
                            roomTotal={estimate.roomTotal}
                            experienceTotal={estimate.experienceTotal}
                            taxAmount={0}
                            totalAmount={estimate.total}
                            numNights={numNights || undefined}
                        />
                        <p className={styles.estimateNote}>{t('checkout.includesAll')}</p>

                        {error && (
                            <div className={styles.errorWrap}>
                                <ErrorState message={error.message} />
                            </div>
                        )}

                        <SubmitButton loading={submitting}>
                            {t('checkout.completeReservation')}
                        </SubmitButton>
                    </div>
                </aside>
            </div>
        </form>
    );
}
