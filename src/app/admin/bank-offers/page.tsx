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
    AdminSelect,
    AdminCheckbox,
    AdminSelectOption,
    SaveButton,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

// ─── Types (match prisma BankOffer + admin.controller listBankOffers) ───
// listBankOffers returns { offers } with lodge: { name } included.

interface BankOffer {
    id: string;
    lodgeId?: string | null;
    title: string;
    shortDescription: string;
    fullDescription: string;
    termsAndConditions: string;
    image?: string | null;
    isActive: boolean;
    validFrom?: string | null;
    validUntil?: string | null;
    sortOrder: number;
    lodge?: { name: string } | null;
}

interface LodgeOption {
    id: string;
    name: string;
}

// Form state mirrors createBankOfferSchema. lodgeId '' means Global (null).
interface BankOfferForm {
    lodgeId: string;
    title: string;
    shortDescription: string;
    fullDescription: string;
    termsAndConditions: string;
    image: string;
    isActive: boolean;
    validFrom: string;
    validUntil: string;
    sortOrder: string; // kept as string for the number input; parsed on submit
}

const emptyForm = (): BankOfferForm => ({
    lodgeId: '',
    title: '',
    shortDescription: '',
    fullDescription: '',
    termsAndConditions: '',
    image: '',
    isActive: true,
    validFrom: '',
    validUntil: '',
    sortOrder: '0',
});

/** Convert an ISO/date string to the yyyy-mm-dd value a date input expects. */
const toDateInput = (value?: string | null): string =>
    value ? new Date(value).toISOString().slice(0, 10) : '';

/** Format a date for display in the table. */
const formatDate = (value?: string | null): string =>
    value ? new Date(value).toLocaleDateString() : '—';

export default function AdminBankOffersPage() {
    const toast = useToast();

    const [rows, setRows] = useState<BankOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [lodges, setLodges] = useState<LodgeOption[]>([]);

    // Create/edit modal state.
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<BankOffer | null>(null);
    const [form, setForm] = useState<BankOfferForm>(emptyForm());
    const [saving, setSaving] = useState(false);

    // Delete confirm state.
    const [deleteTarget, setDeleteTarget] = useState<BankOffer | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadOffers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.bankOffers.list();
            // Controller returns { offers }.
            setRows((data as { offers: BankOffer[] }).offers ?? []);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load bank offers.'
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const loadLodges = useCallback(async () => {
        try {
            const data = await adminApi.lodges.list();
            // Controller returns { lodges }.
            setLodges((data as { lodges: LodgeOption[] }).lodges ?? []);
        } catch {
            // A missing lodge list shouldn't break the page — the dropdown just
            // falls back to Global-only.
        }
    }, []);

    useEffect(() => {
        loadOffers();
        loadLodges();
    }, [loadOffers, loadLodges]);

    // ─── Modal open helpers ───

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm());
        setModalOpen(true);
    };

    const openEdit = (o: BankOffer) => {
        setEditing(o);
        setForm({
            lodgeId: o.lodgeId ?? '',
            title: o.title ?? '',
            shortDescription: o.shortDescription ?? '',
            fullDescription: o.fullDescription ?? '',
            termsAndConditions: o.termsAndConditions ?? '',
            image: o.image ?? '',
            isActive: !!o.isActive,
            validFrom: toDateInput(o.validFrom),
            validUntil: toDateInput(o.validUntil),
            sortOrder: String(o.sortOrder ?? 0),
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

        // Build payload per createBankOfferSchema.
        const payload: Record<string, any> = {
            // lodgeId is optional/nullable — '' means Global (all lodges).
            lodgeId: form.lodgeId ? form.lodgeId : null,
            title: form.title.trim(),
            shortDescription: form.shortDescription.trim(),
            fullDescription: form.fullDescription.trim(),
            termsAndConditions: form.termsAndConditions.trim(),
            isActive: form.isActive,
            sortOrder: Number.isNaN(parsedSort) ? 0 : parsedSort,
        };

        const image = form.image.trim();
        if (image) payload.image = image;

        if (form.validFrom) payload.validFrom = form.validFrom;
        if (form.validUntil) payload.validUntil = form.validUntil;

        setSaving(true);
        try {
            if (editing) {
                await adminApi.bankOffers.update(editing.id, payload);
                toast.success('Bank offer updated.');
            } else {
                await adminApi.bankOffers.create(payload);
                toast.success('Bank offer created.');
            }
            setModalOpen(false);
            setEditing(null);
            await loadOffers();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save bank offer.'
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
            await adminApi.bankOffers.remove(deleteTarget.id);
            toast.success('Bank offer deleted.');
            setDeleteTarget(null);
            await loadOffers();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to delete bank offer.'
            );
        } finally {
            setDeleting(false);
        }
    };

    // ─── Columns ───

    const columns: DataTableColumn<BankOffer>[] = [
        {
            key: 'title',
            header: 'Title',
            render: (o) => <span style={{ fontWeight: 600 }}>{o.title}</span>,
        },
        {
            key: 'lodge',
            header: 'Lodge',
            render: (o) =>
                o.lodgeId ? o.lodge?.name ?? '—' : <span className={styles.badge}>Global</span>,
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (o) => (
                <span className={styles.badge}>{o.isActive ? 'Active' : 'Inactive'}</span>
            ),
        },
        { key: 'validFrom', header: 'Valid From', render: (o) => formatDate(o.validFrom) },
        { key: 'validUntil', header: 'Valid Until', render: (o) => formatDate(o.validUntil) },
        { key: 'sortOrder', header: 'Sort Order', align: 'right' },
    ];

    const lodgeOptions: AdminSelectOption[] = [
        { value: '', label: 'Global (all lodges)' },
        ...lodges.map((l) => ({ value: l.id, label: l.name })),
    ];

    return (
        <div>
            <PageHeader
                title="Bank Offers"
                subtitle="Manage bank and card offers shown on the site"
                actionLabel="Add Bank Offer"
                onAction={openCreate}
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    emptyMessage="No bank offers yet. Add your first offer to get started."
                    onEdit={openEdit}
                    onDelete={(o) => setDeleteTarget(o)}
                />
            </div>

            {/* Create / edit modal */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Bank Offer' : 'Add Bank Offer'}
                maxWidth={620}
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
                        <SaveButton form="bank-offer-form" loading={saving}>
                            {editing ? 'Save Changes' : 'Create'}
                        </SaveButton>
                    </>
                }
            >
                <form id="bank-offer-form" onSubmit={handleSubmit}>
                    <FormInputs form={form} setForm={setForm} lodgeOptions={lodgeOptions} />
                </form>
            </Modal>

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Bank Offer"
                message={
                    <>
                        Are you sure you want to delete{' '}
                        <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
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

/** Field block extracted to keep the page body readable. */
function FormInputs({
    form,
    setForm,
    lodgeOptions,
}: {
    form: BankOfferForm;
    setForm: React.Dispatch<React.SetStateAction<BankOfferForm>>;
    lodgeOptions: AdminSelectOption[];
}) {
    return (
        <>
            <AdminSelect
                label="Lodge"
                name="lodgeId"
                options={lodgeOptions}
                value={form.lodgeId}
                onChange={(e) => setForm((f) => ({ ...f, lodgeId: e.target.value }))}
            />

            <AdminInput
                label="Title"
                name="title"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />

            <AdminTextarea
                label="Short Description"
                name="shortDescription"
                required
                rows={2}
                value={form.shortDescription}
                onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
            />

            <AdminTextarea
                label="Full Description"
                name="fullDescription"
                required
                rows={4}
                value={form.fullDescription}
                onChange={(e) => setForm((f) => ({ ...f, fullDescription: e.target.value }))}
            />

            <AdminTextarea
                label="Terms and Conditions"
                name="termsAndConditions"
                required
                rows={4}
                value={form.termsAndConditions}
                onChange={(e) => setForm((f) => ({ ...f, termsAndConditions: e.target.value }))}
            />

            <AdminInput
                label="Image URL"
                name="image"
                type="url"
                placeholder="https://…"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            />

            <AdminInput
                label="Valid From"
                name="validFrom"
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
            />

            <AdminInput
                label="Valid Until"
                name="validUntil"
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
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
