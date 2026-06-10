'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    PageHeader,
    DataTable,
    DataTableColumn,
    ConfirmDialog,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

// ─── Types (match prisma Review + admin.controller listReviews) ───
// listReviews returns { reviews } with user, lodge and booking relations
// included, plus an isApproved flag.

interface ReviewUser {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
}

interface Review {
    id: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
    isApproved: boolean;
    createdAt?: string | null;
    user?: ReviewUser | null;
    lodge?: { name: string } | null;
    booking?: { bookingId: string } | null;
}

/** Build a display name from the related user, falling back gracefully. */
const userName = (u?: ReviewUser | null): string => {
    if (!u) return '—';
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return name || u.email || '—';
};

export default function AdminReviewsPage() {
    const toast = useToast();

    const [rows, setRows] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Approve action state (tracks the id currently being approved).
    const [approvingId, setApprovingId] = useState<string | null>(null);

    // Delete confirm state.
    const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.reviews.list();
            // Controller returns { reviews }. Reviews may be a future feature, so
            // default to an empty list rather than crashing on an unexpected shape.
            setRows((data as { reviews?: Review[] })?.reviews ?? []);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load reviews.'
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    // ─── Approve ───

    const handleApprove = async (review: Review) => {
        setApprovingId(review.id);
        try {
            await adminApi.reviews.approve(review.id);
            toast.success('Review approved.');
            await loadReviews();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to approve review.'
            );
        } finally {
            setApprovingId(null);
        }
    };

    // ─── Delete ───

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminApi.reviews.remove(deleteTarget.id);
            toast.success('Review deleted.');
            setDeleteTarget(null);
            await loadReviews();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to delete review.'
            );
        } finally {
            setDeleting(false);
        }
    };

    // ─── Columns ───

    const columns: DataTableColumn<Review>[] = [
        {
            key: 'lodge',
            header: 'Lodge',
            render: (r) => <span style={{ fontWeight: 600 }}>{r.lodge?.name ?? '—'}</span>,
        },
        { key: 'user', header: 'User', render: (r) => userName(r.user) },
        { key: 'rating', header: 'Rating', align: 'right', render: (r) => `${r.rating} ★` },
        { key: 'title', header: 'Title', render: (r) => r.title || '—' },
        {
            key: 'isApproved',
            header: 'Status',
            render: (r) => (
                <span className={styles.badge}>{r.isApproved ? 'Approved' : 'Pending'}</span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created',
            render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Reviews"
                subtitle="Moderate guest reviews before they appear on the site"
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    emptyMessage="No reviews to moderate yet."
                    onDelete={(r) => setDeleteTarget(r)}
                    renderActions={(r) =>
                        !r.isApproved ? (
                            <button
                                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                                onClick={() => handleApprove(r)}
                                disabled={approvingId === r.id}
                            >
                                {approvingId === r.id ? 'Approving…' : 'Approve'}
                            </button>
                        ) : null
                    }
                />
            </div>

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Review"
                message={
                    <>
                        Are you sure you want to delete this review
                        {deleteTarget?.lodge?.name ? (
                            <>
                                {' '}for <strong>{deleteTarget.lodge.name}</strong>
                            </>
                        ) : null}
                        ? This action cannot be undone.
                    </>
                }
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
