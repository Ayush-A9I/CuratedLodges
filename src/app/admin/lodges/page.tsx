'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    PageHeader,
    DataTable,
    DataTableColumn,
    ConfirmDialog,
    useToast,
} from '@/components/admin';
import { formatMoney } from '@/lib/money';
import styles from '@/components/admin/admin.module.css';

/** Row shape returned by GET /admin/lodges (listLodges) → `{ lodges }`. */
interface LodgeRow {
    id: string;
    name: string;
    location: string;
    pricePerNight: number;
    isActive: boolean;
    isFeatured: boolean;
    park?: { name: string } | null;
    [key: string]: any;
}

export default function AdminLodgesPage() {
    const router = useRouter();
    const toast = useToast();

    const [rows, setRows] = useState<LodgeRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<LodgeRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // listLodges responds with { lodges }
            const data = await adminApi.lodges.list();
            const lodges = (data as { lodges?: LodgeRow[] })?.lodges ?? [];
            setRows(lodges);
        } catch (err) {
            setError(err instanceof AdminApiError ? err.message : 'Failed to load lodges.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminApi.lodges.remove(deleteTarget.id);
            toast.success(`Deleted "${deleteTarget.name}"`);
            setDeleteTarget(null);
            await load();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to delete lodge.');
        } finally {
            setDeleting(false);
        }
    };

    const columns: DataTableColumn<LodgeRow>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (l) => <span style={{ fontWeight: 600 }}>{l.name}</span>,
        },
        {
            key: 'park',
            header: 'Park',
            render: (l) => l.park?.name || '—',
        },
        {
            key: 'location',
            header: 'Location',
            render: (l) => l.location || '—',
        },
        {
            key: 'pricePerNight',
            header: 'Price / night',
            align: 'right',
            render: (l) => formatMoney(l.pricePerNight ?? 0, 'INR'),
        },
        {
            key: 'isActive',
            header: 'Active',
            align: 'center',
            render: (l) => (
                <span className={styles.badge}>{l.isActive ? 'Active' : 'Inactive'}</span>
            ),
        },
        {
            key: 'isFeatured',
            header: 'Featured',
            align: 'center',
            render: (l) => (l.isFeatured ? <span className={styles.badge}>Featured</span> : '—'),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Lodges"
                subtitle="Manage lodges, room types, naturalists, images, and amenities"
                actionLabel="Add Lodge"
                onAction={() => router.push('/admin/lodges/new')}
            />

            {error && (
                <div className={styles.loginError} role="alert">
                    {error}
                </div>
            )}

            <DataTable
                columns={columns}
                rows={rows}
                loading={loading}
                emptyMessage="No lodges yet. Click “Add Lodge” to create one."
                onEdit={(l) => router.push(`/admin/lodges/${l.id}`)}
                onDelete={(l) => setDeleteTarget(l)}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete lodge"
                message={
                    <>
                        Delete <strong>{deleteTarget?.name}</strong>? This also removes its room
                        types, naturalists, images, and amenity assignments. This cannot be undone.
                    </>
                }
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
