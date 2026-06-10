'use client';

import React, { useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    DataTable,
    DataTableColumn,
    Modal,
    ConfirmDialog,
    AdminInput,
    AdminTextarea,
    AdminCheckbox,
    FormRow,
    SaveButton,
    useToast,
} from '@/components/admin';
import { formatMoney } from '@/lib/money';
import { SeasonalRatesModal } from '@/components/admin/SeasonalRatesModal';
import styles from '@/components/admin/admin.module.css';

export interface RoomTypeRecord {
    id: string;
    name: string;
    basePrice: number;
    totalUnits: number;
    image: string;
    description?: string | null;
    amenities?: string[];
    maxOccupancy: number;
    isActive: boolean;
    sortOrder: number;
}

interface Props {
    lodgeId: string;
    roomTypes: RoomTypeRecord[];
    onChanged: () => void;
}

interface FormState {
    name: string;
    basePrice: string;
    totalUnits: string;
    image: string;
    description: string;
    amenities: string;
    maxOccupancy: string;
    isActive: boolean;
    sortOrder: string;
}

const emptyForm: FormState = {
    name: '',
    basePrice: '',
    totalUnits: '1',
    image: '',
    description: '',
    amenities: '',
    maxOccupancy: '2',
    isActive: true,
    sortOrder: '0',
};

const splitList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export function RoomTypesManager({ lodgeId, roomTypes, onChanged }: Props) {
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<RoomTypeRecord | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<RoomTypeRecord | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [ratesTarget, setRatesTarget] = useState<RoomTypeRecord | null>(null);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm((p) => ({ ...p, [k]: v }));

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setErrors({});
        setOpen(true);
    };

    const openEdit = (rt: RoomTypeRecord) => {
        setEditing(rt);
        setForm({
            name: rt.name ?? '',
            basePrice: String(rt.basePrice ?? ''),
            totalUnits: String(rt.totalUnits ?? '1'),
            image: rt.image ?? '',
            description: rt.description ?? '',
            amenities: (rt.amenities ?? []).join(', '),
            maxOccupancy: String(rt.maxOccupancy ?? '2'),
            isActive: rt.isActive ?? true,
            sortOrder: String(rt.sortOrder ?? '0'),
        });
        setErrors({});
        setOpen(true);
    };

    const validate = (): Record<string, any> | null => {
        const errs: Record<string, string> = {};
        if (!form.name.trim()) errs.name = 'Name is required.';
        if (!form.image.trim()) errs.image = 'Image URL is required.';
        const basePrice = Number.parseInt(form.basePrice, 10);
        if (form.basePrice === '' || Number.isNaN(basePrice) || basePrice < 0)
            errs.basePrice = 'Enter a valid base price.';
        const totalUnits = Number.parseInt(form.totalUnits, 10);
        if (Number.isNaN(totalUnits) || totalUnits < 1) errs.totalUnits = 'At least 1 unit.';
        const maxOccupancy = Number.parseInt(form.maxOccupancy, 10);
        if (Number.isNaN(maxOccupancy) || maxOccupancy < 1) errs.maxOccupancy = 'At least 1.';
        const sortOrder = Number.parseInt(form.sortOrder || '0', 10);
        if (Number.isNaN(sortOrder)) errs.sortOrder = 'Must be a number.';

        setErrors(errs);
        if (Object.keys(errs).length > 0) return null;

        const payload: Record<string, any> = {
            name: form.name.trim(),
            basePrice,
            totalUnits,
            image: form.image.trim(),
            amenities: splitList(form.amenities),
            maxOccupancy,
            isActive: form.isActive,
            sortOrder,
        };
        const desc = form.description.trim();
        if (desc) payload.description = desc;
        return payload;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = validate();
        if (!payload) return;
        setSaving(true);
        try {
            if (editing) {
                await adminApi.roomTypes.update(editing.id, payload);
                toast.success('Room type updated.');
            } else {
                await adminApi.lodges.createRoomType(lodgeId, payload);
                toast.success('Room type added.');
            }
            setOpen(false);
            onChanged();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to save room type.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminApi.roomTypes.remove(deleteTarget.id);
            toast.success('Room type deleted.');
            setDeleteTarget(null);
            onChanged();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to delete room type.');
        } finally {
            setDeleting(false);
        }
    };

    const columns: DataTableColumn<RoomTypeRecord>[] = [
        { key: 'name', header: 'Name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { key: 'basePrice', header: 'Base price', align: 'right', render: (r) => formatMoney(r.basePrice ?? 0, 'INR') },
        { key: 'totalUnits', header: 'Units', align: 'right' },
        { key: 'maxOccupancy', header: 'Max occ.', align: 'right' },
        { key: 'isActive', header: 'Active', align: 'center', render: (r) => (r.isActive ? 'Yes' : 'No') },
    ];

    return (
        <div className={styles.panel}>
            <div
                className={styles.panelHeader}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <span>Room types</span>
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} onClick={openCreate}>
                    + Add room type
                </button>
            </div>
            <DataTable
                columns={columns}
                rows={roomTypes}
                emptyMessage="No room types yet."
                onEdit={openEdit}
                onDelete={(r) => setDeleteTarget(r)}
                renderActions={(r) => (
                    <button
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                        onClick={() => setRatesTarget(r)}
                    >
                        Rates
                    </button>
                )}
            />

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={editing ? 'Edit room type' : 'Add room type'}
                maxWidth={620}
                footer={
                    <>
                        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setOpen(false)} disabled={saving}>
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
                        value={form.name}
                        error={errors.name}
                        onChange={(e) => set('name', e.target.value)}
                    />
                    <FormRow inline>
                        <AdminInput
                            label="Base price (₹)"
                            required
                            type="number"
                            min={0}
                            wrapRow={false}
                            value={form.basePrice}
                            error={errors.basePrice}
                            onChange={(e) => set('basePrice', e.target.value)}
                        />
                        <AdminInput
                            label="Total units"
                            required
                            type="number"
                            min={1}
                            wrapRow={false}
                            value={form.totalUnits}
                            error={errors.totalUnits}
                            onChange={(e) => set('totalUnits', e.target.value)}
                        />
                    </FormRow>
                    <FormRow inline>
                        <AdminInput
                            label="Max occupancy"
                            type="number"
                            min={1}
                            wrapRow={false}
                            value={form.maxOccupancy}
                            error={errors.maxOccupancy}
                            onChange={(e) => set('maxOccupancy', e.target.value)}
                        />
                        <AdminInput
                            label="Sort order"
                            type="number"
                            wrapRow={false}
                            value={form.sortOrder}
                            error={errors.sortOrder}
                            onChange={(e) => set('sortOrder', e.target.value)}
                        />
                    </FormRow>
                    <AdminInput
                        label="Image URL"
                        required
                        type="url"
                        value={form.image}
                        error={errors.image}
                        onChange={(e) => set('image', e.target.value)}
                    />
                    <AdminInput
                        label="Amenities (comma-separated)"
                        value={form.amenities}
                        onChange={(e) => set('amenities', e.target.value)}
                    />
                    <AdminTextarea
                        label="Description"
                        value={form.description}
                        onChange={(e) => set('description', e.target.value)}
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
                title="Delete room type"
                message={<>Delete <strong>{deleteTarget?.name}</strong>?</>}
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {ratesTarget && (
                <SeasonalRatesModal
                    open={!!ratesTarget}
                    onClose={() => setRatesTarget(null)}
                    roomTypeId={ratesTarget.id}
                    roomTypeName={ratesTarget.name}
                />
            )}
        </div>
    );
}

export default RoomTypesManager;
