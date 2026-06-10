'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    PageHeader,
    DataTable,
    DataTableColumn,
    AdminSelect,
    useToast,
} from '@/components/admin';
import { formatMoney } from '@/lib/money';
import styles from '@/components/admin/admin.module.css';

/** A booking row as returned by `GET /admin/bookings` (list shape). */
interface BookingRow {
    id: string;
    bookingId: string;
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    lodge?: { name: string } | null;
    roomType?: { name: string } | null;
}

/** Pagination meta returned alongside the list (utils/pagination.ts). */
interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface BookingListResponse {
    bookings: BookingRow[];
    pagination: PaginationMeta;
}

const inr = (amount: number) => formatMoney(amount ?? 0, 'INR');

const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString() : '—';

/**
 * Status filter options. Includes the lifecycle statuses a booking may carry
 * (`held` is the schema default; the rest match the update-status enum).
 */
const STATUS_FILTER_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'held', label: 'Held' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
    { value: 'no_show', label: 'No show' },
];

export default function AdminBookingsPage() {
    const router = useRouter();
    const toast = useToast();

    const [rows, setRows] = useState<BookingRow[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 20 };
            if (status) params.status = status;
            const data = (await adminApi.bookings.list(params)) as BookingListResponse;
            setRows(data.bookings || []);
            setPagination(data.pagination || null);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load bookings.'
            );
            setRows([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [page, status, toast]);

    useEffect(() => {
        load();
    }, [load]);

    const goToDetail = (row: BookingRow) => router.push(`/admin/bookings/${row.id}`);

    const columns: DataTableColumn<BookingRow>[] = [
        {
            key: 'bookingId',
            header: 'Booking',
            render: (b) => <span style={{ fontWeight: 600 }}>{b.bookingId}</span>,
        },
        {
            key: 'guest',
            header: 'Guest',
            render: (b) => (
                <div>
                    <div style={{ fontWeight: 500 }}>
                        {`${b.guestFirstName || ''} ${b.guestLastName || ''}`.trim() || '—'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--cl-text-muted)' }}>{b.guestEmail}</div>
                </div>
            ),
        },
        { key: 'lodge', header: 'Lodge', render: (b) => b.lodge?.name || '—' },
        { key: 'checkIn', header: 'Check-in', render: (b) => formatDate(b.checkIn) },
        { key: 'checkOut', header: 'Check-out', render: (b) => formatDate(b.checkOut) },
        {
            key: 'totalAmount',
            header: 'Total',
            align: 'right',
            render: (b) => inr(b.totalAmount),
        },
        {
            key: 'status',
            header: 'Status',
            render: (b) => <span className={styles.badge}>{b.status}</span>,
        },
        {
            key: 'paymentStatus',
            header: 'Payment',
            render: (b) => <span className={styles.badge}>{b.paymentStatus}</span>,
        },
        { key: 'createdAt', header: 'Created', render: (b) => formatDate(b.createdAt) },
    ];

    return (
        <div>
            <PageHeader title="Bookings" subtitle="View and manage guest bookings" />

            {/* Filters */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 16,
                    marginBottom: 16,
                    maxWidth: 280,
                }}
            >
                <AdminSelect
                    label="Filter by status"
                    value={status}
                    options={STATUS_FILTER_OPTIONS}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    wrapRow={false}
                />
            </div>

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    emptyMessage="No bookings found."
                    rowKey={(b) => b.id}
                    renderActions={(b) => (
                        <button
                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                            onClick={() => goToDetail(b)}
                        >
                            View
                        </button>
                    )}
                />
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 12,
                        marginTop: 4,
                    }}
                >
                    <span style={{ fontSize: 13, color: 'var(--cl-text-muted)' }}>
                        Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                    </span>
                    <button
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                        disabled={loading || pagination.page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>
                    <button
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                        disabled={loading || pagination.page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
