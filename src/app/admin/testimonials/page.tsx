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
    AdminTextarea,
    AdminCheckbox,
    ImageUpload,
    SaveButton,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

// ─── Types (match prisma Testimonial + admin.controller listTestimonialsAdmin) ───

interface Testimonial {
    id: string;
    userId?: string | null;
    name: string;
    company: string | null;
    text: string;
    image: string;
    isActive: boolean;
    sortOrder: number;
}

// Form state mirrors createTestimonialSchema.
interface TestimonialForm {
    name: string;
    company: string;
    text: string;
    image: string;
    isActive: boolean;
    sortOrder: string; // kept as string for the number input; parsed on submit
}

const emptyForm = (): TestimonialForm => ({
    name: '',
    company: '',
    text: '',
    image: '',
    isActive: true,
    sortOrder: '0',
});

export default function AdminTestimonialsPage() {
    const toast = useToast();

    const [rows, setRows] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    // Create/edit modal state.
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Testimonial | null>(null);
    const [form, setForm] = useState<TestimonialForm>(emptyForm());
    const [saving, setSaving] = useState(false);

    // Delete confirm state.
    const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadTestimonials = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.testimonials.list();
            // Controller returns { testimonials }.
            setRows((data as { testimonials: Testimonial[] }).testimonials ?? []);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load testimonials.'
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadTestimonials();
    }, [loadTestimonials]);

    // ─── Modal open helpers ───

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm());
        setModalOpen(true);
    };

    const openEdit = (t: Testimonial) => {
        setEditing(t);
        setForm({
            name: t.name ?? '',
            company: t.company ?? '',
            text: t.text ?? '',
            image: t.image ?? '',
            isActive: !!t.isActive,
            sortOrder: String(t.sortOrder ?? 0),
        });
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

        const parsedSort = parseInt(form.sortOrder, 10);

        // Build payload per createTestimonialSchema.
        const payload: Record<string, any> = {
            name: form.name.trim(),
            text: form.text.trim(),
            image: form.image.trim(),
            isActive: form.isActive,
            sortOrder: Number.isNaN(parsedSort) ? 0 : parsedSort,
        };

        const company = form.company.trim();
        if (company) payload.company = company;

        setSaving(true);
        try {
            if (editing) {
                await adminApi.testimonials.update(editing.id, payload);
                toast.success('Testimonial updated.');
            } else {
                await adminApi.testimonials.create(payload);
                toast.success('Testimonial created.');
            }
            setModalOpen(false);
            setEditing(null);
            await loadTestimonials();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save testimonial.'
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
            await adminApi.testimonials.remove(deleteTarget.id);
            toast.success('Testimonial deleted.');
            setDeleteTarget(null);
            await loadTestimonials();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to delete testimonial.'
            );
        } finally {
            setDeleting(false);
        }
    };

    // ─── Columns ───

    const columns: DataTableColumn<Testimonial>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (t) => <span style={{ fontWeight: 600 }}>{t.name}</span>,
        },
        { key: 'company', header: 'Company', render: (t) => t.company || '—' },
        {
            key: 'isActive',
            header: 'Status',
            render: (t) => (
                <span className={styles.badge}>{t.isActive ? 'Active' : 'Inactive'}</span>
            ),
        },
        { key: 'sortOrder', header: 'Sort Order', align: 'right' },
    ];

    return (
        <div>
            <PageHeader
                title="Testimonials"
                subtitle="Manage customer testimonials shown on the site"
                actionLabel="Add Testimonial"
                onAction={openCreate}
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    emptyMessage="No testimonials yet."
                    onEdit={openEdit}
                    onDelete={(t) => setDeleteTarget(t)}
                />
            </div>

            {/* Create / edit modal */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Testimonial' : 'Add Testimonial'}
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
                        <SaveButton form="testimonial-form" loading={saving}>
                            {editing ? 'Save Changes' : 'Create'}
                        </SaveButton>
                    </>
                }
            >
                <form id="testimonial-form" onSubmit={handleSubmit}>
                    <FormInputs form={form} setForm={setForm} />
                </form>
            </Modal>

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Testimonial"
                message={
                    deleteTarget
                        ? `Delete the testimonial from "${deleteTarget.name}"? This cannot be undone.`
                        : ''
                }
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

/** Field block extracted to keep the page body readable. */
function FormInputs({
    form,
    setForm,
}: {
    form: TestimonialForm;
    setForm: React.Dispatch<React.SetStateAction<TestimonialForm>>;
}) {
    return (
        <>
            <AdminInput
                label="Name"
                name="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />

            <AdminInput
                label="Company"
                name="company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            />

            <AdminTextarea
                label="Testimonial"
                name="text"
                required
                rows={4}
                value={form.text}
                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            />

            <ImageUpload
                label="Image"
                required
                folder="testimonials"
                value={form.image}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            />

            <AdminInput
                label="Sort Order"
                name="sortOrder"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
            />

            <AdminCheckbox
                label="Active"
                name="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
        </>
    );
}
