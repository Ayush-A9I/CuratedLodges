'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { ProtectedRoute } from '@/components/auth';
import { StateBoundary } from '@/components/feedback';
import BookingCard from '@/components/domain/BookingCard';
import { useApiResource } from '@/hooks/useApiResource';
import { sortByCheckInDesc } from '@/logic/bookingsSort';
import api from '@/lib/api';
import type { Booking, MyBookingsResponse } from '@/types/api';
import styles from './mybookings.module.css';

/**
 * Inner content for the My_Bookings_Page (Req 5).
 *
 * Fetches the current user's bookings exactly once per load via
 * `useApiResource` (Req 5.1), orders them by check-in date descending
 * (Req 5.3), and renders each through {@link BookingCard} showing lodge name,
 * room type, dates, nights, total, status, and payment status (Req 5.2, 5.9).
 *
 * `StateBoundary` enforces a single visible state: a Loading_State while the
 * request is in flight (Req 5.4), a translated empty-state message when the
 * list is empty (Req 5.5), and an Error_State with a retry affordance — never a
 * partial list — when the request fails (Req 5.6). The 30 second timeout is
 * handled by `useApiResource`'s default (Req 5.7).
 *
 * Selecting a booking navigates to the Booking_Confirmation_Page using the
 * booking's identifier (Req 5.8).
 */
function MyBookingsContent() {
    const { t } = useTranslation();
    const router = useRouter();

    // Read-only retrieval: one call per page load, with uniform
    // loading/error/retry handling and the default 30s timeout (Req 5.1, 5.7).
    const { data, loading, error, retry } = useApiResource<MyBookingsResponse>(
        () => api.getMyBookings(),
    );

    // Order by check-in date descending without mutating the response (Req 5.3).
    const bookings = data ? sortByCheckInDesc(data.bookings) : [];

    const handleSelect = (booking: Booking) => {
        // Navigate to the confirmation page using the booking identifier (Req 5.8).
        router.push(`/booking/${booking.bookingId}`);
    };

    return (
        <main className={styles.main}>
            <section className={styles.heroSection}>
                <div className={styles.heroContainer}>
                    <p className={styles.heroLabel}>{t('myBookings.label')}</p>
                    <h1 className={styles.heroTitle}>{t('myBookings.title')}</h1>
                    <p className={styles.heroDescription}>{t('myBookings.subtitle')}</p>
                </div>
            </section>

            <section className={styles.listSection}>
                <div className={styles.listContainer}>
                    <StateBoundary
                        loading={loading}
                        error={error}
                        empty={bookings.length === 0}
                        onRetry={retry}
                        emptyMessageKey="myBookings.empty"
                    >
                        <div className={styles.bookingsList}>
                            {bookings.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onSelect={handleSelect}
                                />
                            ))}
                        </div>
                    </StateBoundary>
                </div>
            </section>
        </main>
    );
}

/**
 * My_Bookings_Page — an authenticated page listing the current user's bookings
 * (Req 5). Wrapped in {@link ProtectedRoute} so the content is withheld until
 * auth resolves to a user (Req 12). Renders the shared Header and Footer on this
 * full-page surface (Req 14.4).
 */
export default function MyBookingsPage() {
    return (
        <ProtectedRoute>
            <Header forceVisible={true} forceScrolled={true} />
            <MyBookingsContent />
            <Footer />
        </ProtectedRoute>
    );
}
