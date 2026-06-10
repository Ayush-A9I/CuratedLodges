'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    DataTable,
    DataTableColumn,
    Modal,
    ConfirmDialog,
    AdminInput,
    AdminCheckbox,
    FormRow,
    SaveButton,
    useToast,
} from '@/components/admin';
import { formatMoney } from '@/lib/money';
import styles from '@/components/admin/admin.module.css';

/** A seasonal rate as returned by the admin backend. */
export interface SeasonalRateRecord {
    id: string;
    roomTypeId: string;
    name: string;
    /** ISO date-time string. */
    startDate: string;
    /** ISO date-time string. */
    endDate: string;
    price: number;
    isActive: boolean;
}

interface Props {
    /** Whether the modal is visible. */
    open: boolean;
    /** Called when the modal should close. */
    onClose: () => void;
    /** The room type whose seasonal rates are managed. */
    roomTypeId: string;
    /** The room type name, shown in the modal title. */
    roomTypeName: string;
}

interface FormState {
    name: string;
    startDate: string;
    endDate: string;
    price: string;
    isActive: boolean;
}

const emptyForm: FormState = {
    name: '',
    startDate: '',
    endDate: '',
    price: '',
    isActive: true,
};

/** Coerce an ISO date-time string to the `YYYY-MM-DD` form `<input type="date">` expects. */
const toDateInput = (iso: string): string => (iso ? iso.slice(0, 10) : '');

/** Format an ISO date-time string for display as `YYYY-MM-DD`. */
const formatDate = (iso: string): string => toDateInput(iso) || '—';

/**
 * Modal that lists, creates, edits, and deletes the seasonal rates for a single
 * room type. Fetches via `adminApi.seasonalRates.listForRoomType` whenever it
 * opens, and refetches after each mutation.
 */
export function SeasonalRatesModal({ open, onClose, roomTypeId, roomTypeName }: Props) {
    const toast = useToast();

    const [rates, setRates] = useState<SeasonalRateRecord[]>([]);
    const [loading, setLoading] = useState(false);

    // Create / edit form state.
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<SeasonalRateRecord | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Delete state.
    const [deleteTarget, setDeleteTarget] = useState<SeasonalRateRecord | null>(null);
    const [deleting, setDeleting] = useState(false);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm((p) => ({ ...p, [k]: v }));

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.seasonalRates.listForRoomType(roomTypeId);
            setRates(((res as { rates?: SeasonalRateRecord[] })?.rates) ?? []);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load seasonal rates.'
            );
            setRates([]);
        } finally {
            setLoading(false);
        }
    }, [roomTypeId, toast]);

    useEffect(() => {
        if (open) {
            setFormOpen(false);
            setEditing(null);
            void load();
        }
    }, [open, load]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setErrors({});
        setFormOpen(true);
    };

    const openEdit = (rate: SeasonalRateRecord) => {
        setEditing(rate);
        setForm({
            name: rate.name ?? '',
            startDate: toDateInput(rate.startDate),
            endDate: toDateInput(rate.endDate),
            price: String(rate.price ?? ''),
            isActive: rate.isActive ?? true,
        });
        setErrors({});
        setFormOpen(true);
    };

    const validate = (): Record<string, any> | null => {
        const errs: Record<string, string> = {};
        const name = form.name.trim();
        if (!name || name.length > 100) errs.name = 'Name is required (max 100 chars).';
        if (!form.startDate) errs.startDate = 'Start date is required.';
        if (!form.endDate) errs.endDate = 'End date is required.';
        if (form.startDate && form.endDate && form.endDate < form.startDate)
            errs.endDate = 'End date must not be before start date.';
        const price = Number.parseInt(form.price, 10);
        if (form.price === '' || Number.isNaN(price) || price < 0)
            errs.price = 'Enter a valid price.';

        setErrors(errs);
        if (Object.keys(errs).length > 0) return null;

        return {
            name,
            startDate: form.startDate,
            endDate: form.endDate,
            price,
            isActive: form.isActive,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = validate();
        if (!payload) return;
        setSaving(true);
        try {
            if (editing) {
                await adminApi.seasonalRates.update(editing.id, payload);
                toast.success('Seasonal rate updated.');
            } else {
                await adminApi.seasonalRates.create(roomTypeId, payload);
                toast.success('Seasonal rate added.');
            }
            setFormOpen(false);
            await load();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save seasonal rate.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminApi.seasonalRates.remove(deleteTarget.id);
            toast.success('Seasonal rate deleted.');
            setDeleteTarget(null);
            await load();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to delete seasonal rate.'
            );
        } finally {
            setDeleting(false);
        }
    };

    const columns: DataTableColumn<SeasonalRateRecord>[] = [
        { key: 'name', header: 'Name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { key: 'startDate', header: 'Start', render: (r) => formatDate(r.startDate) },
        { key: 'endDate', header: 'End', render: (r) => formatDate(r.endDate) },
        { key: 'price', header: 'Price', align: 'right', render: (r) => formatMoney(r.price ?? 0, 'INR') },
        { key: 'isActive', header: 'Active', align: 'center', render: (r) => (r.isActive ? 'Yes' : 'No') },
    ];

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                title={`Seasonal rates — ${roomTypeName}`}
                maxWidth={760}
                footer={
                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                        Close
                    </button>
                }
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: 12,
                    }}
                >
                    <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                        onClick={openCreate}
                    >
                        + Add seasonal rate
                    </button>
                </div>
                <DataTable
                    columns={columns}
                    rows={rates}
                    loading={loading}
                    emptyMessage="No seasonal rates yet."
                    onEdit={openEdit}
                    onDelete={(r) => setDeleteTarget(r)}
                />
            </Modal>

            <Modal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                title={editing ? 'Edit seasonal rate' : 'Add seasonal rate'}
                maxWidth={560}
                footer={
                    <>
                        <button
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={() => setFormOpen(false)}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <SaveButton loading={saving} onClick={handleSubmit as any}>
                            {editing ? 'Save' : 'Add'}
                        </SaveButton>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <AdminInput
                        label="Name"
                        required
                        maxLength={100}
                        value={form.name}
                        error={errors.name}
                        onChange={(e) => set('name', e.target.value)}
                    />
                    <FormRow inline>
                        <AdminInput
                            label="Start date"
                            required
                            type="date"
                            wrapRow={false}
                            value={form.startDate}
                            error={errors.startDate}
                            onChange={(e) => set('startDate', e.target.value)}
                        />
                        <AdminInput
                            label="End date"
                            required
                            type="date"
                            wrapRow={false}
                            value={form.endDate}
                            error={errors.endDate}
                            onChange={(e) => set('endDate', e.target.value)}
                        />
                    </FormRow>
                    <AdminInput
                        label="Price (₹)"
                        required
                        type="number"
                        min={0}
                        value={form.price}
                        error={errors.price}
                        onChange={(e) => set('price', e.target.value)}
                    />
                    <AdminCheckbox
                        label="Active"
                        checked={form.isActive}
                        onChange={(e) => set('isActive', e.target.checked)}
                    />
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete seasonal rate"
                message={<>Delete <strong>{deleteTarget?.name}</strong>?</>}
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    );
}

export default SeasonalRatesModal;
