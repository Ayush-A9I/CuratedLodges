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

// ─── Types (match prisma Amenity + admin.controller listAmenities → { amenities }) ───

interface Amenity {
    id: string;
    key: string;
    label: string;
    icon: string | null;
    category: string | null;
    sortOrder: number;
}

// Form state mirrors createAmenitySchema.
interface AmenityForm {
    key: string;
    label: string;
    icon: string;
    category: string;
    sortOrder: string; // kept as string for the number input; parsed on submit
}

const emptyForm = (): AmenityForm => ({
    key: '',
    label: '',
    icon: '',
    category: '',
    sortOrder: '0',
});

export default function AdminAmenitiesPage() {
    const toast = useToast();

    const [rows, setRows] = useState<Amenity[]>([]);
    const [loading, setLoading] = useState(true);

    // Create / edit modal state.
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Amenity | null>(null);
    const [form, setForm] = useState<AmenityForm>(emptyForm());
    const [errors, setErrors] = useState<{ key?: string; label?: string }>({});
    const [saving, setSaving] = useState(false);

    // Delete confirm state.
    const [deleteTarget, setDeleteTarget] = useState<Amenity | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadAmenities = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.amenities.list();
            // Controller returns { amenities }.
            setRows((data as { amenities: Amenity[] }).amenities ?? []);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load amenities.'
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadAmenities();
    }, [loadAmenities]);

    // ─── Modal open helpers ───

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm());
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (a: Amenity) => {
        setEditing(a);
        setForm({
            key: a.key ?? '',
            label: a.label ?? '',
            icon: a.icon ?? '',
            category: a.category ?? '',
            sortOrder: String(a.sortOrder ?? 0),
        });
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditing(null);
    };

    // ─── Submit ───

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const key = form.key.trim();
        const label = form.label.trim();

        const nextErrors: { key?: string; label?: string } = {};
        if (!key) nextErrors.key = 'Key is required.';
        if (!label) nextErrors.label = 'Label is required.';
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }
        setErrors({});

        const parsedSort = parseInt(form.sortOrder, 10);

        // Build payload per createAmenitySchema. updateAmenity is unvalidated
        // but accepts the same fields.
        const payload: Record<string, any> = {
            key,
            label,
            sortOrder: Number.isNaN(parsedSort) ? 0 : parsedSort,
        };
        const icon = form.icon.trim();
        const category = form.category.trim();
        if (icon) payload.icon = icon;
        if (category) payload.category = category;

        setSaving(true);
        try {
            if (editing) {
                await adminApi.amenities.update(editing.id, payload);
                toast.success('Amenity updated.');
            } else {
                await adminApi.amenities.create(payload);
                toast.success('Amenity created.');
            }
            setModalOpen(false);
            setEditing(null);
            await loadAmenities();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save amenity.'
            );
        } finally {
            setSaving(false);
        }
    };

    // ─── Delete ───

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminApi.amenities.remove(deleteTarget.id);
            toast.success('Amenity deleted.');
            setDeleteTarget(null);
            await loadAmenities();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to delete amenity.'
            );
        } finally {
            setDeleting(false);
        }
    };

    // ─── Columns ───

    const columns: DataTableColumn<Amenity>[] = [
        {
            key: 'label',
            header: 'Label',
            render: (a) => <span style={{ fontWeight: 600 }}>{a.label}</span>,
        },
        {
            key: 'key',
            header: 'Key',
            render: (a) => <span className={styles.badge}>{a.key}</span>,
        },
        { key: 'category', header: 'Category', render: (a) => a.category || '—' },
        { key: 'icon', header: 'Icon', render: (a) => a.icon || '—' },
        { key: 'sortOrder', header: 'Sort Order', align: 'right' },
    ];

    return (
        <div>
            <PageHeader
                title="Amenities"
                subtitle="Manage the amenities that can be assigned to lodges"
                actionLabel="Add Amenity"
                onAction={openCreate}
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    emptyMessage="No amenities yet. Add your first amenity to get started."
                    onEdit={openEdit}
                    onDelete={(a) => setDeleteTarget(a)}
                />
            </div>

            {/* Create / edit modal */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Amenity' : 'Add Amenity'}
                maxWidth={560}
                footer={
                    <>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={closeModal}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <SaveButton form="amenity-form" loading={saving}>
                            {editing ? 'Save Changes' : 'Create'}
                        </SaveButton>
                    </>
                }
            >
                <form id="amenity-form" onSubmit={handleSubmit}>
                    <AdminInput
                        label="Key"
                        name="key"
                        required
                        value={form.key}
                        placeholder="e.g. wifi"
                        onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
                        error={errors.key}
                    />
                    <AdminInput
                        label="Label"
                        name="label"
                        required
                        value={form.label}
                        placeholder="e.g. Wi-Fi"
                        onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                        error={errors.label}
                    />
                    <AdminInput
                        label="Icon"
                        name="icon"
                        value={form.icon}
                        placeholder="Optional — icon name or emoji"
                        onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    />
                    <AdminInput
                        label="Category"
                        name="category"
                        value={form.category}
                        placeholder="Optional — e.g. Connectivity"
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    />
                    <AdminInput
                        label="Sort Order"
                        name="sortOrder"
                        type="number"
                        value={form.sortOrder}
                        onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    />
                </form>
            </Modal>

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Amenity"
                message={
                    deleteTarget ? (
                        <>
                            Are you sure you want to delete{' '}
                            <strong>{deleteTarget.label}</strong>? This action cannot be undone.
                        </>
                    ) : (
                        ''
                    )
                }
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
