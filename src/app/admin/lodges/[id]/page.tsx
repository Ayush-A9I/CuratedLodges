'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi, AdminApiError, request } from '@/lib/adminApi';
import { PageHeader, useToast } from '@/components/admin';
import { LodgeForm, LodgeRecord, ParkOption } from '@/components/admin/LodgeForm';
import { RoomTypesManager, RoomTypeRecord } from '@/components/admin/RoomTypesManager';
import { NaturalistsManager, NaturalistRecord } from '@/components/admin/NaturalistsManager';
import { LodgeImagesManager, LodgeImageRecord } from '@/components/admin/LodgeImagesManager';
import { LodgeAmenitiesManager, AmenityRecord } from '@/components/admin/LodgeAmenitiesManager';
import styles from '@/components/admin/admin.module.css';

/** Full lodge record from GET /admin/lodges/:id. */
interface FullLodge extends LodgeRecord {
    id: string;
    images?: LodgeImageRecord[];
    roomTypes?: RoomTypeRecord[];
    naturalists?: NaturalistRecord[];
    lodgeAmenities?: Array<{ id: string; amenityId: string; amenity?: AmenityRecord }>;
}

export default function EditLodgePage() {
    const router = useRouter();
    const toast = useToast();
    const params = useParams<{ id: string }>();
    const id = params?.id as string;

    const [lodge, setLodge] = useState<FullLodge | null>(null);
    const [parks, setParks] = useState<ParkOption[]>([]);
    const [amenities, setAmenities] = useState<AmenityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const loadLodge = useCallback(async () => {
        // Single source of truth: the admin single-lodge endpoint returns the
        // full record with relation IDs and includes inactive children.
        const full = await request<FullLodge>(`/admin/lodges/${id}`);
        setLodge(full);
    }, [id]);

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [, parksRes, amenRes] = await Promise.all([
                loadLodge(),
                adminApi.parks.list(),
                adminApi.amenities.list(),
            ]);
            setParks((parksRes as { parks?: ParkOption[] })?.parks ?? []);
            setAmenities((amenRes as { amenities?: AmenityRecord[] })?.amenities ?? []);
        } catch (err) {
            setError(err instanceof AdminApiError ? err.message : 'Failed to load lodge.');
        } finally {
            setLoading(false);
        }
    }, [loadLodge]);

    useEffect(() => {
        if (id) loadAll();
    }, [id, loadAll]);

    // Re-fetch only the lodge (used by relation sub-managers).
    const refreshLodge = useCallback(async () => {
        try {
            await loadLodge();
            setRefreshKey((k) => k + 1);
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to refresh lodge.');
        }
    }, [loadLodge, toast]);

    const handleSubmit = useCallback(
        async (payload: Record<string, any>) => {
            setSubmitting(true);
            try {
                await adminApi.lodges.update(id, payload);
                toast.success('Lodge saved.');
                await loadLodge();
            } catch (err) {
                toast.error(err instanceof AdminApiError ? err.message : 'Failed to save lodge.');
            } finally {
                setSubmitting(false);
            }
        },
        [id, loadLodge, toast]
    );

    const assignedAmenityIds = (lodge?.lodgeAmenities ?? []).map((la) => la.amenityId);

    return (
        <div>
            <PageHeader
                title={lodge ? `Edit: ${lodge.name}` : 'Edit lodge'}
                subtitle="Update core details, then manage room types, naturalists, images, and amenities."
                action={
                    <button
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={() => router.push('/admin/lodges')}
                    >
                        Back to lodges
                    </button>
                }
            />

            {error && (
                <div className={styles.loginError} role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className={styles.tableState}>
                    <div className={styles.spinner} />
                    Loading…
                </div>
            ) : lodge ? (
                <>
                    <LodgeForm
                        mode="edit"
                        parks={parks}
                        initial={lodge}
                        submitting={submitting}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push('/admin/lodges')}
                    />

                    <div style={{ height: 8 }} />

                    <RoomTypesManager
                        lodgeId={id}
                        roomTypes={lodge.roomTypes ?? []}
                        onChanged={refreshLodge}
                    />

                    <NaturalistsManager
                        lodgeId={id}
                        naturalists={lodge.naturalists ?? []}
                        onChanged={refreshLodge}
                    />

                    <LodgeImagesManager
                        lodgeId={id}
                        images={lodge.images ?? []}
                        onChanged={refreshLodge}
                    />

                    <LodgeAmenitiesManager
                        key={`amen-${refreshKey}`}
                        lodgeId={id}
                        allAmenities={amenities}
                        assignedAmenityIds={assignedAmenityIds}
                        onChanged={refreshLodge}
                    />
                </>
            ) : (
                !error && <div className={styles.tableState}>Lodge not found.</div>
            )}
        </div>
    );
}
