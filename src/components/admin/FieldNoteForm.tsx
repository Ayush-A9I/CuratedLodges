'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
    AdminInput,
    AdminTextarea,
    AdminSelect,
    AdminCheckbox,
    AdminLabel,
    FormRow,
    ImageUpload,
    PageHeader,
    SaveButton,
    useToast,
} from '@/components/admin';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { FALLBACK_IMAGES } from '@/lib/fallbackImages';
import {
    formatReadTime,
    hasArticleBody,
    paragraphsToHtml,
    resolveFieldNoteBodyHtml,
    sanitizeFieldNoteHtml,
} from '@/lib/fieldNoteContent';
import styles from '@/components/admin/admin.module.css';

const FieldNoteRichEditor = dynamic(
    () =>
        import('@/components/admin/FieldNoteRichEditor').then((mod) => mod.FieldNoteRichEditor),
    {
        ssr: false,
        loading: () => (
            <div className={styles.tableState} style={{ minHeight: 420 }}>
                <div className={styles.spinner} />
                Loading editor…
            </div>
        ),
    }
);

export interface FieldNoteRecord {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string[];
    bodyHtml?: string | null;
    author: string;
    parkId: string | null;
    parkLabel: string;
    image: string;
    publishedDate: string;
    readTime: string;
    isPublished: boolean;
}

interface ParkOption {
    id: string;
    name: string;
}

interface FieldNoteFormProps {
    mode: 'create' | 'edit';
    initial?: FieldNoteRecord;
    parks: ParkOption[];
}

interface FormState {
    title: string;
    slug: string;
    excerpt: string;
    bodyHtml: string;
    author: string;
    parkId: string;
    parkLabel: string;
    image: string;
    publishedDate: string;
    readTime: string;
    isPublished: boolean;
}

const toDateInput = (value?: string): string => {
    if (!value) return new Date().toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

function buildInitialForm(initial?: FieldNoteRecord): FormState {
    const bodyHtml = initial
        ? resolveFieldNoteBodyHtml({
              bodyHtml: initial.bodyHtml,
              content: initial.content,
          })
        : paragraphsToHtml(['']);

    return {
        title: initial?.title ?? '',
        slug: initial?.slug ?? '',
        excerpt: initial?.excerpt ?? '',
        bodyHtml,
        author: initial?.author ?? '',
        parkId: initial?.parkId ?? '',
        parkLabel: initial?.parkLabel ?? '',
        image: initial?.image ?? '',
        publishedDate: toDateInput(initial?.publishedDate),
        readTime: initial?.readTime ?? '',
        isPublished: !!initial?.isPublished,
    };
}

export function FieldNoteForm({ mode, initial, parks }: FieldNoteFormProps) {
    const router = useRouter();
    const toast = useToast();
    const [form, setForm] = useState<FormState>(() => buildInitialForm(initial));
    const [submitting, setSubmitting] = useState(false);
    const [readTimeTouched, setReadTimeTouched] = useState(!!initial?.readTime);

    useEffect(() => {
        if (initial) setForm(buildInitialForm(initial));
    }, [initial?.id]);

    const parkOptions = useMemo(
        () => parks.map((p) => ({ value: p.id, label: p.name })),
        [parks]
    );

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const bodyHtml = sanitizeFieldNoteHtml(form.bodyHtml);
        if (!hasArticleBody(bodyHtml)) {
            toast.error('Write the article body before saving.');
            return;
        }

        const readTime = form.readTime.trim() || formatReadTime(bodyHtml);

        const payload: Record<string, unknown> = {
            title: form.title.trim(),
            excerpt: form.excerpt.trim(),
            bodyHtml,
            content: [],
            author: form.author.trim(),
            parkLabel: form.parkLabel.trim(),
            image: form.image.trim(),
            publishedDate: form.publishedDate,
            readTime,
            isPublished: form.isPublished,
            parkId: form.parkId ? form.parkId : null,
        };

        const slug = form.slug.trim();
        if (slug) payload.slug = slug;

        setSubmitting(true);
        try {
            if (mode === 'edit' && initial) {
                await adminApi.fieldNotes.update(initial.id, payload);
                toast.success('Field note saved.');
            } else {
                await adminApi.fieldNotes.create(payload);
                toast.success('Field note created.');
            }
            router.push('/admin/field-notes');
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to save field note.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <PageHeader
                title={mode === 'edit' ? 'Edit field note' : 'New field note'}
                subtitle="Write a full article with headings, images, and formatted text."
                action={
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={() => router.push('/admin/field-notes')}
                        disabled={submitting}
                    >
                        Back to list
                    </button>
                }
            />

            <div className={styles.panel}>
                <div className={styles.panelHeader}>Details</div>
                <div style={{ padding: 20 }}>
                    <FormRow inline>
                        <AdminInput
                            label="Title"
                            required
                            wrapRow={false}
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                        />
                        <AdminInput
                            label="Slug"
                            wrapRow={false}
                            placeholder="Auto-generated if blank"
                            value={form.slug}
                            onChange={(e) => set('slug', e.target.value)}
                        />
                    </FormRow>

                    <AdminTextarea
                        label="Excerpt"
                        required
                        rows={3}
                        value={form.excerpt}
                        onChange={(e) => set('excerpt', e.target.value)}
                    />

                    <FormRow inline>
                        <AdminInput
                            label="Author"
                            required
                            wrapRow={false}
                            value={form.author}
                            onChange={(e) => set('author', e.target.value)}
                        />
                        <AdminInput
                            label="Read time"
                            wrapRow={false}
                            placeholder="Auto-calculated from word count"
                            value={form.readTime}
                            onChange={(e) => {
                                setReadTimeTouched(true);
                                set('readTime', e.target.value);
                            }}
                        />
                    </FormRow>

                    <FormRow inline>
                        <AdminSelect
                            label="Park (optional)"
                            wrapRow={false}
                            value={form.parkId}
                            onChange={(e) => set('parkId', e.target.value)}
                        >
                            <option value="">None</option>
                            {parkOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </AdminSelect>
                        <AdminInput
                            label="Park label"
                            required
                            wrapRow={false}
                            value={form.parkLabel}
                            onChange={(e) => set('parkLabel', e.target.value)}
                        />
                    </FormRow>

                    <ImageUpload
                        label="Cover image"
                        folder="field-notes"
                        value={form.image}
                        previewHeight={200}
                        fallbackPreview={FALLBACK_IMAGES.fieldNote}
                        onChange={(url) => set('image', url)}
                    />

                    <FormRow inline>
                        <AdminInput
                            label="Published date"
                            type="date"
                            required
                            wrapRow={false}
                            value={form.publishedDate}
                            onChange={(e) => set('publishedDate', e.target.value)}
                        />
                        <AdminCheckbox
                            label="Published"
                            wrapRow={false}
                            checked={form.isPublished}
                            onChange={(e) => set('isPublished', e.target.checked)}
                        />
                    </FormRow>
                </div>
            </div>

            <div className={styles.panel} style={{ marginTop: 16 }}>
                <div className={styles.panelHeader}>Article body</div>
                <div style={{ padding: 20 }}>
                    <AdminLabel required>Content</AdminLabel>
                    <FieldNoteRichEditor
                        value={form.bodyHtml}
                        onChange={(html) => set('bodyHtml', html)}
                        onReadTimeHint={(minutes) => {
                            if (!readTimeTouched) {
                                set('readTime', `${minutes} min read`);
                            }
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => router.push('/admin/field-notes')}
                    disabled={submitting}
                >
                    Cancel
                </button>
                <SaveButton loading={submitting}>
                    {mode === 'edit' ? 'Save changes' : 'Create field note'}
                </SaveButton>
            </div>
        </form>
    );
}

export default FieldNoteForm;
