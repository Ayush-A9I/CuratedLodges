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
import styles from '@/components/admin/admin.module.css';

interface FieldNote {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    author: string;
    parkLabel: string;
    publishedDate: string;
    isPublished: boolean;
}

export default function AdminFieldNotesPage() {
    const router = useRouter();
    const toast = useToast();

    const [rows, setRows] = useState<FieldNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<FieldNote | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [publishingId, setPublishingId] = useState<string | null>(null);

    const loadFieldNotes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.fieldNotes.list();
            setRows((data as { fieldNotes: FieldNote[] }).fieldNotes ?? []);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load field notes.'
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadFieldNotes();
    }, [loadFieldNotes]);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminApi.fieldNotes.remove(deleteTarget.id);
            toast.success('Field note deleted.');
            setDeleteTarget(null);
            await loadFieldNotes();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to delete field note.'
            );
        } finally {
            setDeleting(false);
        }
    };

    const togglePublish = async (note: FieldNote) => {
        setPublishingId(note.id);
        try {
            await adminApi.fieldNotes.publish(note.id);
            toast.success(note.isPublished ? 'Field note unpublished.' : 'Field note published.');
            await loadFieldNotes();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to update publish state.'
            );
        } finally {
            setPublishingId(null);
        }
    };

    const columns: DataTableColumn<FieldNote>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (n) => <span style={{ fontWeight: 600 }}>{n.title}</span>,
        },
        { key: 'author', header: 'Author' },
        { key: 'parkLabel', header: 'Park', render: (n) => n.parkLabel || '—' },
        {
            key: 'publishedDate',
            header: 'Published',
            render: (n) =>
                n.publishedDate ? new Date(n.publishedDate).toLocaleDateString() : '—',
        },
        {
            key: 'isPublished',
            header: 'Status',
            render: (n) => (
                <span className={styles.badge}>{n.isPublished ? 'Published' : 'Draft'}</span>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Field Notes"
                subtitle="Editorial articles — write with headings, images, and rich formatting"
                actionLabel="New field note"
                onAction={() => router.push('/admin/field-notes/new')}
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    emptyMessage="No field notes yet."
                    onEdit={(n) => router.push(`/admin/field-notes/${n.id}`)}
                    onDelete={(n) => setDeleteTarget(n)}
                    renderActions={(n) => (
                        <button
                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                            onClick={() => togglePublish(n)}
                            disabled={publishingId === n.id}
                        >
                            {publishingId === n.id
                                ? '…'
                                : n.isPublished
                                  ? 'Unpublish'
                                  : 'Publish'}
                        </button>
                    )}
                />
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Field Note"
                message={
                    deleteTarget
                        ? `Delete "${deleteTarget.title}"? This cannot be undone.`
                        : ''
                }
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
