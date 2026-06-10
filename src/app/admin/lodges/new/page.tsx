'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { PageHeader, useToast } from '@/components/admin';
import { LodgeForm, ParkOption } from '@/components/admin/LodgeForm';
import styles from '@/components/admin/admin.module.css';

export default function NewLodgePage() {
    const router = useRouter();
    const toast = useToast();

    const [parks, setParks] = useState<ParkOption[]>([]);
    const [loadingParks, setLoadingParks] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await adminApi.parks.list();
                const list = (data as { parks?: ParkOption[] })?.parks ?? [];
                if (!cancelled) setParks(list);
            } catch (err) {
                if (!cancelled) {
                    toast.error(
                        err instanceof AdminApiError ? err.message : 'Failed to load parks.'
                    );
                }
            } finally {
                if (!cancelled) setLoadingParks(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [toast]);

    const handleSubmit = useCallback(
        async (payload: Record<string, any>) => {
            setSubmitting(true);
            try {
                // createLodge responds with the created lodge record.
                const created = (await adminApi.lodges.create(payload)) as { id: string };
                toast.success('Lodge created.');
                router.push(`/admin/lodges/${created.id}`);
            } catch (err) {
                toast.error(err instanceof AdminApiError ? err.message : 'Failed to create lodge.');
                setSubmitting(false);
            }
        },
        [router, toast]
    );

    return (
        <div>
            <PageHeader
                title="Add Lodge"
                subtitle="Create a new lodge. Room types, naturalists, images, and amenities can be added after saving."
                action={
                    <button
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={() => router.push('/admin/lodges')}
                    >
                        Back to lodges
                    </button>
                }
            />

            {loadingParks ? (
                <div className={styles.tableState}>
                    <div className={styles.spinner} />
                    Loading…
                </div>
            ) : (
                <LodgeForm
                    mode="create"
                    parks={parks}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => router.push('/admin/lodges')}
                />
            )}
        </div>
    );
}
