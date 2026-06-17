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
    FormRow,
    AdminLabel,
    ImageUpload,
    SaveButton,
    useToast,
} from '@/components/admin';
import { FALLBACK_IMAGES } from '@/lib/fallbackImages';
import styles from '@/components/admin/admin.module.css';

interface Region {
    id: string;
    name: string;
    slug?: string;
}

interface ParkFeature {
    icon: string;
    name: string;
    sortOrder: number;
}

interface ParkFaq {
    question: string;
    answer: string;
    sortOrder: number;
}

interface Park {
    id: string;
    regionId: string;
    name: string;
    slug: string;
    description: string;
    heroImage: string;
    bestTime?: string | null;
    wildlife?: string | null;
    isActive: boolean;
    sortOrder: number;
    region?: { name: string } | null;
    features?: ParkFeature[];
    faqs?: ParkFaq[];
    [key: string]: any;
}

interface ParkForm {
    regionId: string;
    name: string;
    slug: string;
    description: string;
    heroImage: string;
    bestTime: string;
    wildlife: string;
    isActive: boolean;
    sortOrder: string;
    features: ParkFeature[];
    faqs: ParkFaq[];
}

const emptyForm: ParkForm = {
    regionId: '',
    name: '',
    slug: '',
    description: '',
    heroImage: '',
    bestTime: '',
    wildlife: '',
    isActive: true,
    sortOrder: '0',
    features: [],
    faqs: [],
};

type FieldErrors = Partial<Record<keyof ParkForm, string>>;

export default function AdminParksPage() {
    const toast = useToast();

    const [parks, setParks] = useState<Park[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);

    // Create / edit modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Park | null>(null);
    const [form, setForm] = useState<ParkForm>(emptyForm);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [saving, setSaving] = useState(false);

    // Delete confirmation
    const [deleting, setDeleting] = useState<Park | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const loadParks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.parks.list();
            // Backend returns { parks: [...] }
            const list: Park[] = (data as any)?.parks ?? (Array.isArray(data) ? data : []);
            setParks(list);
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to load parks.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const loadRegions = useCallback(async () => {
        try {
            const data = await adminApi.regions.list();
            const list: Region[] = (data as any)?.regions ?? (Array.isArray(data) ? data : []);
            setRegions(list);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load regions for the form.'
            );
        }
    }, [toast]);

    useEffect(() => {
        loadParks();
        loadRegions();
    }, [loadParks, loadRegions]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (park: Park) => {
        setEditing(park);
        setForm({
            regionId: park.regionId ?? '',
            name: park.name ?? '',
            slug: park.slug ?? '',
            description: park.description ?? '',
            heroImage: park.heroImage ?? '',
            bestTime: park.bestTime ?? '',
            wildlife: park.wildlife ?? '',
            isActive: park.isActive ?? true,
            sortOrder: String(park.sortOrder ?? 0),
            features: (park.features ?? []).map((f) => ({
                icon: f.icon ?? '',
                name: f.name ?? '',
                sortOrder: f.sortOrder ?? 0,
            })),
            faqs: (park.faqs ?? []).map((q) => ({
                question: q.question ?? '',
                answer: q.answer ?? '',
                sortOrder: q.sortOrder ?? 0,
            })),
        });
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
    };

    const set = <K extends keyof ParkForm>(key: K, value: ParkForm[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    // ─── Features editor ───
    const addFeature = () =>
        set('features', [...form.features, { icon: '', name: '', sortOrder: form.features.length }]);
    const updateFeature = (index: number, patch: Partial<ParkFeature>) =>
        set(
            'features',
            form.features.map((f, i) => (i === index ? { ...f, ...patch } : f))
        );
    const removeFeature = (index: number) =>
        set('features', form.features.filter((_, i) => i !== index));

    // ─── FAQs editor ───
    const addFaq = () =>
        set('faqs', [...form.faqs, { question: '', answer: '', sortOrder: form.faqs.length }]);
    const updateFaq = (index: number, patch: Partial<ParkFaq>) =>
        set(
            'faqs',
            form.faqs.map((q, i) => (i === index ? { ...q, ...patch } : q))
        );
    const removeFaq = (index: number) =>
        set('faqs', form.faqs.filter((_, i) => i !== index));

    const validate = (): FieldErrors => {
        const e: FieldErrors = {};
        if (!form.regionId) e.regionId = 'Region is required.';
        if (!form.name.trim()) e.name = 'Name is required.';
        if (!form.description.trim()) e.description = 'Description is required.';
        if (form.heroImage.trim()) {
            try {
                // eslint-disable-next-line no-new
                new URL(form.heroImage.trim());
            } catch {
                e.heroImage = 'Enter a valid URL.';
            }
        }
        return e;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        setSaving(true);

        const sortOrderNum = parseInt(form.sortOrder, 10);
        const payload: Record<string, any> = {
            regionId: form.regionId,
            name: form.name.trim(),
            description: form.description.trim(),
            heroImage: form.heroImage.trim(),
            isActive: form.isActive,
            sortOrder: Number.isFinite(sortOrderNum) ? sortOrderNum : 0,
            features: form.features
                .filter((f) => f.name.trim() || f.icon.trim())
                .map((f, i) => ({
                    icon: f.icon.trim(),
                    name: f.name.trim(),
                    sortOrder: Number.isFinite(f.sortOrder) ? f.sortOrder : i,
                })),
            faqs: form.faqs
                .filter((q) => q.question.trim() || q.answer.trim())
                .map((q, i) => ({
                    question: q.question.trim(),
                    answer: q.answer.trim(),
                    sortOrder: Number.isFinite(q.sortOrder) ? q.sortOrder : i,
                })),
        };

        // optional fields — only include when provided
        const slug = form.slug.trim();
        if (slug) payload.slug = slug;
        const bestTime = form.bestTime.trim();
        if (bestTime) payload.bestTime = bestTime;
        const wildlife = form.wildlife.trim();
        if (wildlife) payload.wildlife = wildlife;

        try {
            if (editing) {
                // updatePark ignores features/faqs on the backend, but sending them
                // is harmless; the create flow nests them.
                await adminApi.parks.update(editing.id, payload);
                toast.success('Park updated.');
            } else {
                await adminApi.parks.create(payload);
                toast.success('Park created.');
            }
            setModalOpen(false);
            await loadParks();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to save park.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setDeleteLoading(true);
        try {
            await adminApi.parks.remove(deleting.id);
            toast.success('Park deleted.');
            setDeleting(null);
            await loadParks();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to delete park.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns: DataTableColumn<Park>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (p) => <span style={{ fontWeight: 600 }}>{p.name}</span>,
        },
        {
            key: 'region',
            header: 'Region',
            render: (p) =>
                p.region?.name ||
                regions.find((r) => r.id === p.regionId)?.name ||
                '—',
        },
        {
            key: 'slug',
            header: 'Slug',
            render: (p) => <span className={styles.badge}>{p.slug}</span>,
        },
        {
            key: 'isActive',
            header: 'Active',
            align: 'center',
            render: (p) => (
                <span className={styles.badge}>{p.isActive ? 'Active' : 'Inactive'}</span>
            ),
        },
    ];

    const regionOptions = regions.map((r) => ({ value: r.id, label: r.name }));

    return (
        <div>
            <PageHeader
                title="Parks"
                subtitle="Manage national parks and reserves"
                actionLabel="Add Park"
                onAction={openCreate}
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={parks}
                    loading={loading}
                    emptyMessage="No parks yet. Add your first park to get started."
                    onEdit={openEdit}
                    onDelete={(p) => setDeleting(p)}
                />
            </div>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Park' : 'Add Park'}
                maxWidth={720}
            >
                <form onSubmit={handleSubmit}>
                    <AdminSelect
                        label="Region"
                        name="regionId"
                        required
                        value={form.regionId}
                        placeholder="Select a region"
                        options={regionOptions}
                        onChange={(e) => set('regionId', e.target.value)}
                        error={errors.regionId}
                    />

                    <FormRow inline>
                        <AdminInput
                            label="Name"
                            name="name"
                            required
                            wrapRow={false}
                            value={form.name}
                            placeholder="e.g. Kanha National Park"
                            onChange={(e) => set('name', e.target.value)}
                            error={errors.name}
                        />
                        <AdminInput
                            label="Slug"
                            name="slug"
                            wrapRow={false}
                            value={form.slug}
                            placeholder="Optional — generated from name"
                            onChange={(e) => set('slug', e.target.value)}
                        />
                    </FormRow>

                    <AdminTextarea
                        label="Description"
                        name="description"
                        required
                        rows={4}
                        value={form.description}
                        placeholder="Describe the park…"
                        onChange={(e) => set('description', e.target.value)}
                        error={errors.description}
                    />

                    <ImageUpload
                        label="Hero Image"
                        folder="parks"
                        value={form.heroImage}
                        fallbackPreview={FALLBACK_IMAGES.park}
                        onChange={(url) => set('heroImage', url)}
                        error={errors.heroImage}
                    />

                    <FormRow inline>
                        <AdminInput
                            label="Best Time to Visit"
                            name="bestTime"
                            wrapRow={false}
                            value={form.bestTime}
                            placeholder="e.g. October – June"
                            onChange={(e) => set('bestTime', e.target.value)}
                        />
                        <AdminInput
                            label="Wildlife"
                            name="wildlife"
                            wrapRow={false}
                            value={form.wildlife}
                            placeholder="e.g. Tiger, Leopard, Barasingha"
                            onChange={(e) => set('wildlife', e.target.value)}
                        />
                    </FormRow>

                    <FormRow inline>
                        <AdminInput
                            label="Sort Order"
                            name="sortOrder"
                            type="number"
                            wrapRow={false}
                            value={form.sortOrder}
                            onChange={(e) => set('sortOrder', e.target.value)}
                        />
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <AdminCheckbox
                                label="Active"
                                name="isActive"
                                wrapRow={false}
                                checked={form.isActive}
                                onChange={(e) => set('isActive', e.target.checked)}
                            />
                        </div>
                    </FormRow>

                    {/* ─── Features editor ─── */}
                    <div style={{ marginTop: 8, marginBottom: 16 }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 8,
                            }}
                        >
                            <AdminLabel>Features</AdminLabel>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                                onClick={addFeature}
                            >
                                + Add Feature
                            </button>
                        </div>
                        {form.features.length === 0 ? (
                            <p className={styles.pageHeaderSubtitle} style={{ margin: 0 }}>
                                No features added.
                            </p>
                        ) : (
                            form.features.map((f, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        alignItems: 'center',
                                        marginBottom: 8,
                                    }}
                                >
                                    <input
                                        className={styles.input}
                                        style={{ width: 70 }}
                                        placeholder="Icon"
                                        value={f.icon}
                                        onChange={(e) => updateFeature(i, { icon: e.target.value })}
                                    />
                                    <input
                                        className={styles.input}
                                        style={{ flex: 1 }}
                                        placeholder="Feature name"
                                        value={f.name}
                                        onChange={(e) => updateFeature(i, { name: e.target.value })}
                                    />
                                    <input
                                        className={styles.input}
                                        style={{ width: 90 }}
                                        type="number"
                                        placeholder="Order"
                                        value={f.sortOrder}
                                        onChange={(e) =>
                                            updateFeature(i, {
                                                sortOrder: parseInt(e.target.value, 10) || 0,
                                            })
                                        }
                                    />
                                    <button
                                        type="button"
                                        className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                        style={{ color: 'var(--cl-danger)' }}
                                        onClick={() => removeFeature(i)}
                                        aria-label="Remove feature"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ─── FAQs editor ─── */}
                    <div style={{ marginTop: 8, marginBottom: 16 }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 8,
                            }}
                        >
                            <AdminLabel>FAQs</AdminLabel>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                                onClick={addFaq}
                            >
                                + Add FAQ
                            </button>
                        </div>
                        {form.faqs.length === 0 ? (
                            <p className={styles.pageHeaderSubtitle} style={{ margin: 0 }}>
                                No FAQs added.
                            </p>
                        ) : (
                            form.faqs.map((q, i) => (
                                <div
                                    key={i}
                                    style={{
                                        border: '1px solid var(--cl-border)',
                                        borderRadius: 8,
                                        padding: 10,
                                        marginBottom: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: 8,
                                            alignItems: 'center',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <input
                                            className={styles.input}
                                            style={{ flex: 1 }}
                                            placeholder="Question"
                                            value={q.question}
                                            onChange={(e) => updateFaq(i, { question: e.target.value })}
                                        />
                                        <input
                                            className={styles.input}
                                            style={{ width: 90 }}
                                            type="number"
                                            placeholder="Order"
                                            value={q.sortOrder}
                                            onChange={(e) =>
                                                updateFaq(i, {
                                                    sortOrder: parseInt(e.target.value, 10) || 0,
                                                })
                                            }
                                        />
                                        <button
                                            type="button"
                                            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                            style={{ color: 'var(--cl-danger)' }}
                                            onClick={() => removeFaq(i)}
                                            aria-label="Remove FAQ"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <textarea
                                        className={styles.textarea}
                                        rows={2}
                                        placeholder="Answer"
                                        value={q.answer}
                                        onChange={(e) => updateFaq(i, { answer: e.target.value })}
                                    />
                                </div>
                            ))
                        )}
                    </div>

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
                            {editing ? 'Save Changes' : 'Create Park'}
                        </SaveButton>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleting}
                title="Delete Park"
                message={
                    <>
                        Are you sure you want to delete <strong>{deleting?.name}</strong>? This
                        action cannot be undone.
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
