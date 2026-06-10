'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    PageHeader,
    DataTable,
    DataTableColumn,
    Modal,
    ConfirmDialog,
    AdminInput,
    SaveButton,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

interface Region {
    id: string;
    name: string;
    slug: string;
    createdAt?: string;
    [key: string]: any;
}

interface RegionForm {
    name: string;
    slug: string;
}

const emptyForm: RegionForm = { name: '', slug: '' };

export default function AdminRegionsPage() {
    const toast = useToast();

    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);

    // Create / edit modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Region | null>(null);
    const [form, setForm] = useState<RegionForm>(emptyForm);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Delete confirmation
    const [deleting, setDeleting] = useState<Region | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const loadRegions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.regions.list();
            // Backend returns { regions: [...] }
            const list: Region[] = (data as any)?.regions ?? (Array.isArray(data) ? data : []);
            setRegions(list);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load regions.'
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadRegions();
    }, [loadRegions]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormError(null);
        setModalOpen(true);
    };

    const openEdit = (region: Region) => {
        setEditing(region);
        setForm({ name: region.name ?? '', slug: region.slug ?? '' });
        setFormError(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = form.name.trim();
        if (!name) {
            setFormError('Name is required.');
            return;
        }
        setFormError(null);
        setSaving(true);

        // slug is optional — only send when provided.
        const payload: Record<string, any> = { name };
        const slug = form.slug.trim();
        if (slug) payload.slug = slug;

        try {
            if (editing) {
                await adminApi.regions.update(editing.id, payload);
                toast.success('Region updated.');
            } else {
                await adminApi.regions.create(payload);
                toast.success('Region created.');
            }
            setModalOpen(false);
            await loadRegions();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save region.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setDeleteLoading(true);
        try {
            await adminApi.regions.remove(deleting.id);
            toast.success('Region deleted.');
            setDeleting(null);
            await loadRegions();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to delete region.'
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns: DataTableColumn<Region>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span>,
        },
        {
            key: 'slug',
            header: 'Slug',
            render: (r) => <span className={styles.badge}>{r.slug}</span>,
        },
        {
            key: 'createdAt',
            header: 'Created',
            render: (r) =>
                r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—',
        },
    ];

    return (
        <div>
            <PageHeader
                title="Regions"
                subtitle="Manage the geographic regions parks belong to"
                actionLabel="Add Region"
                onAction={openCreate}
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={regions}
                    loading={loading}
                    emptyMessage="No regions yet. Add your first region to get started."
                    onEdit={openEdit}
                    onDelete={(r) => setDeleting(r)}
                />
            </div>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Region' : 'Add Region'}
            >
                <form onSubmit={handleSubmit} id="region-form">
                    <AdminInput
                        label="Name"
                        name="name"
                        required
                        value={form.name}
                        placeholder="e.g. Central India"
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        error={formError ?? undefined}
                    />
                    <AdminInput
                        label="Slug"
                        name="slug"
                        value={form.slug}
                        placeholder="Optional — generated from name if left blank"
                        onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    />
                    <div className={styles.modalFooter} style={{ paddingRight: 0 }}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={closeModal}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <SaveButton loading={saving}>
                            {editing ? 'Save Changes' : 'Create Region'}
                        </SaveButton>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleting}
                title="Delete Region"
                message={
                    <>
                        Are you sure you want to delete{' '}
                        <strong>{deleting?.name}</strong>? This action cannot be undone.
                    </>
                }
                confirmLabel="Delete"
                loading={deleteLoading}
                onConfirm={handleDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}
