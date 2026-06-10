'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { StateBoundary } from '@/components/feedback';
import CheckoutForm from '@/components/domain/CheckoutForm';

import { useApiResource } from '@/hooks/useApiResource';
import api from '@/lib/api';
import type { LodgeDetail } from '@/types/api';

import styles from './checkout.module.css';

/**
 * Inner checkout content. Reads the entry query params (`?lodge=&room=`),
 * fetches the lodge detail to populate room types and naturalists, and renders
 * the checkout form once data is available (Req 2.1).
 */
function CheckoutContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const lodgeSlug = searchParams.get('lodge') ?? '';
    const roomTypeId = searchParams.get('room') ?? undefined;

    const { data, loading, error, retry } = useApiResource<LodgeDetail>(
        () => api.getLodgeBySlug(lodgeSlug),
        { enabled: Boolean(lodgeSlug), deps: [lodgeSlug] },
    );

    // No lodge in the URL — nothing to book.
    if (!lodgeSlug) {
        return (
            <StateBoundary
                loading={false}
                error={t('errors.unknown')}
                onRetry={undefined}
            >
                {null}
            </StateBoundary>
        );
    }

    return (
        <StateBoundary loading={loading} error={error} onRetry={retry}>
            {data && (
                <CheckoutForm lodge={data} initialRoomTypeId={roomTypeId} />
            )}
        </StateBoundary>
    );
}

/**
 * Checkout page (Req 2). Wraps the Header/Footer composition around the
 * client-side checkout flow. The content is rendered inside a Suspense boundary
 * because it reads search params via `useSearchParams`.
 */
export default function CheckoutPage() {
    const { t } = useTranslation();

    return (
        <div className={styles.page}>
            <Header forceVisible forceScrolled />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.heading}>
                        <Link href="/basecamps" className={styles.back}>
                            {t('checkout.back')}
                        </Link>
                        <h1 className={styles.title}>{t('checkout.configureStay')}</h1>
                    </div>

                    <Suspense fallback={null}>
                        <CheckoutContent />
                    </Suspense>
                </div>
            </main>

            <Footer />
        </div>
    );
}
