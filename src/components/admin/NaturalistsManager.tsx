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
    ImageUpload,
    SaveButton,
    useToast,
} from '@/components/admin';
import { formatMoney } from '@/lib/money';
import { FALLBACK_IMAGES } from '@/lib/fallbackImages';
import styles from '@/components/admin/admin.module.css';

export interface NaturalistRecord {
    id: string;
    name: string;
    role: string;
    experience?: string | null;
    specialty?: string | null;
    pricePerSession: number;
    image?: string | null;
    isActive: boolean;
}

interface Props {
    lodgeId: string;
    naturalists: NaturalistRecord[];
    onChanged: () => void;
}

interface FormState {
    name: string;
    role: string;
    experience: string;
    specialty: string;
    pricePerSession: string;
    image: string;
    isActive: boolean;
}

const emptyForm: FormState = {
    name: '',
    role: '',
    experience: '',
    specialty: '',
    pricePerSession: '',
    image: '',
    isActive: true,
};

export function NaturalistsManager({ lodgeId, naturalists, onChanged }: Props) {
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<NaturalistRecord | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<NaturalistRecord | null>(null);
    const [deleting, setDeleting] = useState(false);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm((p) => ({ ...p, [k]: v }));

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setErrors({});
        setOpen(true);
    };

    const openEdit = (n: NaturalistRecord) => {
        setEditing(n);
        setForm({
            name: n.name ?? '',
            role: n.role ?? '',
            experience: n.experience ?? '',
            specialty: n.specialty ?? '',
            pricePerSession: String(n.pricePerSession ?? ''),
            image: n.image ?? '',
            isActive: n.isActive ?? true,
        });
        setErrors({});
        setOpen(true);
    };

    const validate = (): Record<string, any> | null => {
        const errs: Record<string, string> = {};
        if (!form.name.trim()) errs.name = 'Name is required.';
        if (!form.role.trim()) errs.role = 'Role is required.';
        const price = Number.parseInt(form.pricePerSession, 10);
        if (form.pricePerSession === '' || Number.isNaN(price) || price < 0)
            errs.pricePerSession = 'Enter a valid price.';

        setErrors(errs);
        if (Object.keys(errs).length > 0) return null;

        const payload: Record<string, any> = {
            name: form.name.trim(),
            role: form.role.trim(),
            pricePerSession: price,
            isActive: form.isActive,
        };
        if (form.experience.trim()) payload.experience = form.experience.trim();
        if (form.specialty.trim()) payload.specialty = form.specialty.trim();
        if (form.image.trim()) payload.image = form.image.trim();
        return payload;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = validate();
        if (!payload) return;
        setSaving(true);
        try {
            if (editing) {
                await adminApi.naturalists.update(editing.id, payload);
                toast.success('Naturalist updated.');
            } else {
                await adminApi.lodges.createNaturalist(lodgeId, payload);
                toast.success('Naturalist added.');
            }
            setOpen(false);
            onChanged();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to save naturalist.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminApi.naturalists.remove(deleteTarget.id);
            toast.success('Naturalist deleted.');
            setDeleteTarget(null);
            onChanged();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to delete naturalist.');
        } finally {
            setDeleting(false);
        }
    };

    const columns: DataTableColumn<NaturalistRecord>[] = [
        { key: 'name', header: 'Name', render: (n) => <span style={{ fontWeight: 600 }}>{n.name}</span> },
        { key: 'role', header: 'Role' },
        { key: 'specialty', header: 'Specialty', render: (n) => n.specialty || '—' },
        {
            key: 'pricePerSession',
            header: 'Per session',
            align: 'right',
            render: (n) => formatMoney(n.pricePerSession ?? 0, 'INR'),
        },
        { key: 'isActive', header: 'Active', align: 'center', render: (n) => (n.isActive ? 'Yes' : 'No') },
    ];

    return (
        <div className={styles.panel}>
            <div
                className={styles.panelHeader}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <span>Naturalists</span>
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} onClick={openCreate}>
                    + Add naturalist
                </button>
            </div>
            <DataTable
                columns={columns}
                rows={naturalists}
                emptyMessage="No naturalists yet."
                onEdit={openEdit}
                onDelete={(n) => setDeleteTarget(n)}
            />

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={editing ? 'Edit naturalist' : 'Add naturalist'}
                maxWidth={640}
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
                    <FormRow inline>
                        <AdminInput
                            label="Name"
                            required
                            wrapRow={false}
                            value={form.name}
                            error={errors.name}
                            onChange={(e) => set('name', e.target.value)}
                        />
                        <AdminInput
                            label="Role"
                            required
                            wrapRow={false}
                            value={form.role}
                            error={errors.role}
                            onChange={(e) => set('role', e.target.value)}
                        />
                    </FormRow>
                    <AdminInput
                        label="Price per session (₹)"
                        required
                        type="number"
                        min={0}
                        value={form.pricePerSession}
                        error={errors.pricePerSession}
                        onChange={(e) => set('pricePerSession', e.target.value)}
                    />
                    <AdminTextarea
                        label="Experience / bio"
                        placeholder="Years of experience, background, notable projects…"
                        rows={8}
                        value={form.experience}
                        onChange={(e) => set('experience', e.target.value)}
                    />
                    <AdminInput
                        label="Specialty"
                        value={form.specialty}
                        onChange={(e) => set('specialty', e.target.value)}
                    />
                    <ImageUpload
                        label="Image"
                        folder="naturalists"
                        value={form.image}
                        fallbackPreview={FALLBACK_IMAGES.naturalist}
                        onChange={(url) => set('image', url)}
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
                title="Delete naturalist"
                message={<>Delete <strong>{deleteTarget?.name}</strong>?</>}
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

export default NaturalistsManager;
