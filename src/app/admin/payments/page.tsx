'use client';

import React, { useCallback, useEffect, useState } from 'react';
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

/** A payment row as returned by `GET /admin/payments` (list shape). */
interface PaymentRow {
    id: string;
    bookingId: string;
    gateway: string;
    gatewayTransactionId?: string | null;
    gatewayOrderId?: string | null;
    type: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    booking?: { bookingId: string } | null;
}

/** Pagination meta returned alongside the list (utils/pagination.ts). */
interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface PaymentListResponse {
    payments: PaymentRow[];
    pagination: PaginationMeta;
}

const inr = (amount: number) => formatMoney(amount ?? 0, 'INR');

const formatDateTime = (value?: string) =>
    value ? new Date(value).toLocaleString() : '—';

/**
 * Payment status filter options. Covers the common gateway lifecycle states.
 * Left intentionally generic since payment records are produced by the gateway
 * integration, which may not be wired up yet.
 */
const STATUS_FILTER_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
];

export default function AdminPaymentsPage() {
    const toast = useToast();

    const [rows, setRows] = useState<PaymentRow[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 20 };
            if (status) params.status = status;
            const data = (await adminApi.payments.list(params)) as PaymentListResponse;
            setRows(data.payments || []);
            setPagination(data.pagination || null);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load payments.'
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

    const columns: DataTableColumn<PaymentRow>[] = [
        {
            key: 'booking',
            header: 'Booking',
            render: (p) => (
                <span style={{ fontWeight: 600 }}>
                    {p.booking?.bookingId || p.bookingId || '—'}
                </span>
            ),
        },
        {
            key: 'gateway',
            header: 'Gateway',
            render: (p) => p.gateway || '—',
        },
        {
            key: 'type',
            header: 'Type',
            render: (p) => <span className={styles.badge}>{p.type}</span>,
        },
        {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            render: (p) => inr(p.amount),
        },
        {
            key: 'currency',
            header: 'Currency',
            render: (p) => p.currency || '—',
        },
        {
            key: 'status',
            header: 'Status',
            render: (p) => <span className={styles.badge}>{p.status}</span>,
        },
        {
            key: 'createdAt',
            header: 'Created',
            render: (p) => formatDateTime(p.createdAt),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Payments"
                subtitle="Read-only ledger of gateway transactions"
            />

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
                    emptyMessage="No payments yet. Payment records appear here once the payment gateway integration records transactions."
                    rowKey={(p) => p.id}
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
