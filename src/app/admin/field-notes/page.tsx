'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    AdminLabel,
    FormRow,
    ImageUpload,
    SaveButton,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

// ─── Types (match prisma FieldNote + admin.controller listFieldNotesAdmin) ───

interface FieldNote {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string[];
    author: string;
    parkId: string | null;
    parkLabel: string;
    image: string;
    publishedDate: string;
    readTime: string;
    isPublished: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface ParkOption {
    id: string;
    name: string;
}

// Form state mirrors createFieldNoteSchema.
interface FieldNoteForm {
    title: string;
    slug: string;
    excerpt: string;
    content: string[];
    author: string;
    parkId: string;
    parkLabel: string;
    image: string;
    publishedDate: string;
    readTime: string;
    isPublished: boolean;
}

const emptyForm = (): FieldNoteForm => ({
    title: '',
    slug: '',
    excerpt: '',
    content: [''],
    author: '',
    parkId: '',
    parkLabel: '',
    image: '',
    publishedDate: new Date().toISOString().slice(0, 10),
    readTime: '',
    isPublished: false,
});

/** Normalizes an ISO/date string to the YYYY-MM-DD a date input expects. */
const toDateInput = (value?: string): string => {
    if (!value) return new Date().toISOString().slice(0, 10);
    // Already in YYYY-MM-DD form.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

export default function AdminFieldNotesPage() {
    const toast = useToast();

    const [rows, setRows] = useState<FieldNote[]>([]);
    const [parks, setParks] = useState<ParkOption[]>([]);
    const [loading, setLoading] = useState(true);

    // Create/edit modal state.
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FieldNote | null>(null);
    const [form, setForm] = useState<FieldNoteForm>(emptyForm());
    const [saving, setSaving] = useState(false);

    // Delete confirm state.
    const [deleteTarget, setDeleteTarget] = useState<FieldNote | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Track in-flight publish toggles by id.
    const [publishingId, setPublishingId] = useState<string | null>(null);

    const loadFieldNotes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.fieldNotes.list();
            // Controller returns { fieldNotes }.
            setRows((data as { fieldNotes: FieldNote[] }).fieldNotes ?? []);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load field notes.'
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const loadParks = useCallback(async () => {
        try {
            const data = await adminApi.parks.list();
            // Controller returns { parks }.
            setParks((data as { parks: ParkOption[] }).parks ?? []);
        } catch {
            // Park dropdown is optional — fail quietly.
            setParks([]);
        }
    }, []);

    useEffect(() => {
        loadFieldNotes();
        loadParks();
    }, [loadFieldNotes, loadParks]);

    const parkOptions = useMemo(
        () => parks.map((p) => ({ value: p.id, label: p.name })),
        [parks]
    );

    // ─── Modal open helpers ───

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm());
        setModalOpen(true);
    };

    const openEdit = (note: FieldNote) => {
        setEditing(note);
        setForm({
            title: note.title ?? '',
            slug: note.slug ?? '',
            excerpt: note.excerpt ?? '',
            content: note.content?.length ? [...note.content] : [''],
            author: note.author ?? '',
            parkId: note.parkId ?? '',
            parkLabel: note.parkLabel ?? '',
            image: note.image ?? '',
            publishedDate: toDateInput(note.publishedDate),
            readTime: note.readTime ?? '',
            isPublished: !!note.isPublished,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditing(null);
    };

    // ─── Content paragraph helpers ───

    const setContentAt = (index: number, value: string) =>
        setForm((f) => {
            const content = [...f.content];
            content[index] = value;
            return { ...f, content };
        });

    const addParagraph = () =>
        setForm((f) => ({ ...f, content: [...f.content, ''] }));

    const removeParagraph = (index: number) =>
        setForm((f) => {
            const content = f.content.filter((_, i) => i !== index);
            return { ...f, content: content.length ? content : [''] };
        });

    // ─── Submit ───

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const content = form.content.map((p) => p.trim()).filter(Boolean);

        // Build payload per createFieldNoteSchema.
        const payload: Record<string, any> = {
            title: form.title.trim(),
            excerpt: form.excerpt.trim(),
            content,
            author: form.author.trim(),
            parkLabel: form.parkLabel.trim(),
            image: form.image.trim(),
            publishedDate: form.publishedDate,
            readTime: form.readTime.trim(),
            isPublished: form.isPublished,
            // parkId is optional/nullable — send null when "none" selected.
            parkId: form.parkId ? form.parkId : null,
        };

        const slug = form.slug.trim();
        if (slug) payload.slug = slug;

        setSaving(true);
        try {
            if (editing) {
                await adminApi.fieldNotes.update(editing.id, payload);
                toast.success('Field note updated.');
            } else {
                await adminApi.fieldNotes.create(payload);
                toast.success('Field note created.');
            }
            setModalOpen(false);
            setEditing(null);
            await loadFieldNotes();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save field note.'
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

    // ─── Publish toggle ───

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

    // ─── Columns ───

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
            header: 'Published Date',
            render: (n) =>
                n.publishedDate ? new Date(n.publishedDate).toLocaleDateString() : '—',
        },
        {
            key: 'isPublished',
            header: 'Status',
            render: (n) => (
                <span className={styles.badge}>
                    {n.isPublished ? 'Published' : 'Draft'}
                </span>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Field Notes"
                subtitle="Manage editorial field notes and their publish state"
                actionLabel="Add Field Note"
                onAction={openCreate}
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    emptyMessage="No field notes yet."
                    onEdit={openEdit}
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

            {/* Create / edit modal */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Field Note' : 'Add Field Note'}
                maxWidth={680}
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
                        <SaveButton form="field-note-form" loading={saving}>
                            {editing ? 'Save Changes' : 'Create'}
                        </SaveButton>
                    </>
                }
            >
                <form id="field-note-form" onSubmit={handleSubmit}>
                    <AdminInput
                        label="Title"
                        name="title"
                        required
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    />

                    <AdminInput
                        label="Slug"
                        name="slug"
                        placeholder="Auto-generated from title if left blank"
                        value={form.slug}
                        onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    />

                    <AdminTextarea
                        label="Excerpt"
                        name="excerpt"
                        required
                        rows={2}
                        value={form.excerpt}
                        onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    />

                    {/* Repeatable content paragraphs */}
                    <FormRow>
                        <AdminLabel required>Content paragraphs</AdminLabel>
                        {form.content.map((para, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <textarea
                                    className={styles.textarea}
                                    rows={3}
                                    placeholder={`Paragraph ${i + 1}`}
                                    value={para}
                                    onChange={(e) => setContentAt(i, e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                    onClick={() => removeParagraph(i)}
                                    style={{ color: 'var(--cl-danger)' }}
                                    aria-label={`Remove paragraph ${i + 1}`}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                            onClick={addParagraph}
                        >
                            + Add paragraph
                        </button>
                    </FormRow>

                    <FormRow inline>
                        <AdminInput
                            label="Author"
                            name="author"
                            required
                            wrapRow={false}
                            value={form.author}
                            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                        />
                        <AdminInput
                            label="Read Time"
                            name="readTime"
                            placeholder="e.g. 5 min read"
                            required
                            wrapRow={false}
                            value={form.readTime}
                            onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
                        />
                    </FormRow>

                    <FormRow inline>
                        <AdminSelect
                            label="Park (optional)"
                            name="parkId"
                            wrapRow={false}
                            value={form.parkId}
                            onChange={(e) => setForm((f) => ({ ...f, parkId: e.target.value }))}
                        >
                            <option value="">None</option>
                            {parkOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </AdminSelect>
                        <AdminInput
                            label="Park Label"
                            name="parkLabel"
                            required
                            wrapRow={false}
                            value={form.parkLabel}
                            onChange={(e) => setForm((f) => ({ ...f, parkLabel: e.target.value }))}
                        />
                    </FormRow>

                    <ImageUpload
                        label="Image"
                        required
                        folder="field-notes"
                        value={form.image}
                        onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                    />

                    <AdminInput
                        label="Published Date"
                        name="publishedDate"
                        type="date"
                        required
                        value={form.publishedDate}
                        onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))}
                    />

                    <AdminCheckbox
                        label="Published"
                        name="isPublished"
                        checked={form.isPublished}
                        onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                    />
                </form>
            </Modal>

            {/* Delete confirm */}
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
