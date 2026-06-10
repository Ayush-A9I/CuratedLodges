'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, AdminApiError, DashboardStats } from '@/lib/adminApi';
import { PageHeader, DataTable, DataTableColumn } from '@/components/admin';
import { formatMoney } from '@/lib/money';
import styles from '@/components/admin/admin.module.css';

type RecentBooking = DashboardStats['recentBookings'][number];

const formatRevenue = (amount: number) => formatMoney(amount, 'INR');

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await adminApi.getDashboard();
                if (!cancelled) setStats(data);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof AdminApiError ? err.message : 'Failed to load dashboard stats.'
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const statCards = stats
        ? [
            { label: 'Total Bookings', value: stats.totalBookings.toLocaleString() },
            { label: 'Total Revenue', value: formatRevenue(stats.totalRevenue) },
            { label: 'Active Users', value: stats.activeUsers.toLocaleString() },
            { label: 'Active Lodges', value: stats.totalLodges.toLocaleString() },
        ]
        : [];

    const recentColumns: DataTableColumn<RecentBooking>[] = [
        {
            key: 'id',
            header: 'Booking',
            render: (b) => <span style={{ fontWeight: 600 }}>#{String(b.id).slice(0, 8)}</span>,
        },
        {
            key: 'lodge',
            header: 'Lodge',
            render: (b) => b.lodge?.name || '—',
        },
        {
            key: 'totalAmount',
            header: 'Amount',
            render: (b) => formatRevenue(b.totalAmount ?? 0),
        },
        {
            key: 'status',
            header: 'Status',
            render: (b) => <span className={styles.badge}>{b.status}</span>,
        },
        {
            key: 'createdAt',
            header: 'Date',
            render: (b) =>
                b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—',
        },
    ];

    const topLodgeColumns: DataTableColumn<DashboardStats['topLodges'][number]>[] = [
        { key: 'name', header: 'Lodge', render: (l) => <span style={{ fontWeight: 600 }}>{l.name}</span> },
        { key: 'bookings', header: 'Bookings', align: 'right', render: (l) => l.bookings.toLocaleString() },
        { key: 'revenue', header: 'Revenue', align: 'right', render: (l) => formatRevenue(l.revenue) },
    ];

    return (
        <div>
            <PageHeader title="Dashboard" subtitle="Overview of bookings, revenue, and activity" />

            {error && (
                <div className={styles.loginError} role="alert">
                    {error}
                </div>
            )}

            {/* Stat cards */}
            {loading && !stats ? (
                <div className={styles.statGrid}>
                    {[0, 1, 2, 3].map((i) => (
                        <div className={styles.statCard} key={i}>
                            <p className={styles.statLabel}>Loading…</p>
                            <p className={styles.statValue}>—</p>
                            <div className={styles.statAccent} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.statGrid}>
                    {statCards.map((card) => (
                        <div className={styles.statCard} key={card.label}>
                            <p className={styles.statLabel}>{card.label}</p>
                            <p className={styles.statValue}>{card.value}</p>
                            <div className={styles.statAccent} />
                        </div>
                    ))}
                </div>
            )}

            {/* Booking status breakdown */}
            {stats && Object.keys(stats.bookingStatusBreakdown || {}).length > 0 && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>Bookings by status</div>
                    <div className={styles.panelBody} style={{ padding: '16px 20px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {Object.entries(stats.bookingStatusBreakdown).map(([status, count]) => (
                            <span key={status} className={styles.badge}>
                                {status}: {count}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Top lodges */}
            <div className={styles.panel}>
                <div className={styles.panelHeader}>Top lodges</div>
                <DataTable
                    columns={topLodgeColumns}
                    rows={stats?.topLodges || []}
                    rowKey={(l, i) => `${l.name}-${i}`}
                    loading={loading && !stats}
                    emptyMessage="No lodge performance data yet."
                />
            </div>

            {/* Recent bookings */}
            <div className={styles.panel}>
                <div className={styles.panelHeader}>Recent bookings</div>
                <DataTable
                    columns={recentColumns}
                    rows={stats?.recentBookings || []}
                    loading={loading && !stats}
                    emptyMessage="No recent bookings."
                />
            </div>
        </div>
    );
}
