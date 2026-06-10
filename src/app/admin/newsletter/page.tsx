'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { adminApi, AdminApiError, getAdminToken } from '@/lib/adminApi';
import {
    PageHeader,
    DataTable,
    DataTableColumn,
    ConfirmDialog,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

// ─── Types ───
// listSubscribers → { subscribers, pagination }.
// Each subscriber: id, email, isActive, subscribedAt.

interface Subscriber {
    id: string;
    email: string;
    isActive: boolean;
    subscribedAt: string;
    [key: string]: any;
}

export default function AdminNewsletterPage() {
    const toast = useToast();

    const [rows, setRows] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Delete (unsubscribe) confirm state.
    const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadSubscribers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.newsletter.list();
            // Controller returns { subscribers, pagination }.
            setRows((data as { subscribers: Subscriber[] }).subscribers ?? []);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load subscribers.'
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadSubscribers();
    }, [loadSubscribers]);

    // ─── Export CSV ───
    // The export endpoint requires the admin Bearer token, so fetch it with an
    // authenticated request and download the response as a blob.
    const handleExport = async () => {
        const token = getAdminToken();
        if (!token) {
            toast.error('Not authenticated. Please sign in again.');
            return;
        }
        setExporting(true);
        try {
            const res = await fetch(adminApi.newsletter.exportUrl(), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error(`Export failed (${res.status})`);
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'newsletter_subscribers.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Export downloaded.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to export subscribers.');
        } finally {
            setExporting(false);
        }
    };

    // ─── Delete (unsubscribe) ───

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminApi.newsletter.remove(deleteTarget.id);
            toast.success('Subscriber removed.');
            setDeleteTarget(null);
            await loadSubscribers();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to remove subscriber.'
            );
        } finally {
            setDeleting(false);
        }
    };

    // ─── Columns ───

    const columns: DataTableColumn<Subscriber>[] = [
        {
            key: 'email',
            header: 'Email',
            render: (s) => <span style={{ fontWeight: 600 }}>{s.email}</span>,
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (s) => (
                <span className={styles.badge}>{s.isActive ? 'Active' : 'Inactive'}</span>
            ),
        },
        {
            key: 'subscribedAt',
            header: 'Subscribed',
            render: (s) =>
                s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : '—',
        },
    ];

    return (
        <div>
            <PageHeader
                title="Newsletter"
                subtitle="Manage newsletter subscribers"
                action={
                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        {exporting && (
                            <span
                                className={styles.spinner}
                                style={{ width: 16, height: 16, margin: 0 }}
                            />
                        )}
                        {exporting ? 'Exporting…' : 'Export CSV'}
                    </button>
                }
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    emptyMessage="No subscribers yet."
                    onDelete={(s) => setDeleteTarget(s)}
                />
            </div>

            {/* Delete (unsubscribe) confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Remove Subscriber"
                message={
                    deleteTarget ? (
                        <>
                            Remove <strong>{deleteTarget.email}</strong> from the newsletter? This
                            action cannot be undone.
                        </>
                    ) : (
                        ''
                    )
                }
                confirmLabel="Remove"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
