'use client';

import React, { useMemo, useState } from 'react';
import {
    AdminInput,
    AdminTextarea,
    AdminSelect,
    AdminCheckbox,
    AdminLabel,
    FormRow,
    SaveButton,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

/* ─── Types ─── */

export interface ParkOption {
    id: string;
    name: string;
}

/** The full lodge record as returned by GET /admin/lodges/:id. */
export interface LodgeRecord {
    id?: string;
    parkId?: string;
    name?: string;
    slug?: string | null;
    thumbnail?: string;
    rating?: number | string;
    pricePerNight?: number;
    location?: string;
    nearestGates?: string[];
    ecoCertified?: boolean;
    externalLink?: string | null;
    category?: string | null;
    mealPlans?: string[];
    bestSeason?: string | null;
    aboutDescription?: string[];
    jungloreStoryReasons?: string[];
    jungloreStoryHighlights?: unknown;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
    [key: string]: any;
}

interface LodgeFormProps {
    mode: 'create' | 'edit';
    parks: ParkOption[];
    initial?: LodgeRecord;
    submitting?: boolean;
    onSubmit: (payload: Record<string, any>) => void;
    onCancel?: () => void;
}

/* ─── Internal form state ─── */

interface FormState {
    parkId: string;
    name: string;
    slug: string;
    thumbnail: string;
    rating: string;
    pricePerNight: string;
    location: string;
    nearestGates: string; // comma-separated
    ecoCertified: boolean;
    externalLink: string;
    category: string;
    mealPlans: string; // comma-separated
    bestSeason: string;
    aboutDescription: string[]; // repeatable paragraphs
    jungloreStoryReasons: string[]; // repeatable reasons
    jungloreStoryHighlights: string; // raw JSON text
    isActive: boolean;
    isFeatured: boolean;
    sortOrder: string;
}

function prettyJson(value: unknown): string {
    if (value === null || value === undefined || value === '') return '';
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return '';
    }
}

function buildInitialState(initial?: LodgeRecord): FormState {
    return {
        parkId: initial?.parkId ?? '',
        name: initial?.name ?? '',
        slug: initial?.slug ?? '',
        thumbnail: initial?.thumbnail ?? '',
        rating: initial?.rating !== undefined && initial?.rating !== null ? String(initial.rating) : '0',
        pricePerNight:
            initial?.pricePerNight !== undefined && initial?.pricePerNight !== null
                ? String(initial.pricePerNight)
                : '',
        location: initial?.location ?? '',
        nearestGates: (initial?.nearestGates ?? []).join(', '),
        ecoCertified: initial?.ecoCertified ?? false,
        externalLink: initial?.externalLink ?? '',
        category: initial?.category ?? '',
        mealPlans: (initial?.mealPlans ?? []).join(', '),
        bestSeason: initial?.bestSeason ?? '',
        aboutDescription:
            initial?.aboutDescription && initial.aboutDescription.length > 0
                ? [...initial.aboutDescription]
                : [''],
        jungloreStoryReasons:
            initial?.jungloreStoryReasons && initial.jungloreStoryReasons.length > 0
                ? [...initial.jungloreStoryReasons]
                : [''],
        jungloreStoryHighlights: prettyJson(initial?.jungloreStoryHighlights),
        isActive: initial?.isActive ?? true,
        isFeatured: initial?.isFeatured ?? false,
        sortOrder:
            initial?.sortOrder !== undefined && initial?.sortOrder !== null
                ? String(initial.sortOrder)
                : '0',
    };
}

const splitList = (s: string): string[] =>
    s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

/* ─── Component ─── */

export function LodgeForm({
    mode,
    parks,
    initial,
    submitting,
    onSubmit,
    onCancel,
}: LodgeFormProps) {
    const [form, setForm] = useState<FormState>(() => buildInitialState(initial));
    const [errors, setErrors] = useState<Record<string, string>>({});

    const parkOptions = useMemo(
        () => parks.map((p) => ({ value: p.id, label: p.name })),
        [parks]
    );

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    /* ── repeatable list helpers ── */
    const updateListItem = (key: 'aboutDescription' | 'jungloreStoryReasons', i: number, value: string) =>
        setForm((prev) => {
            const next = [...prev[key]];
            next[i] = value;
            return { ...prev, [key]: next };
        });

    const addListItem = (key: 'aboutDescription' | 'jungloreStoryReasons') =>
        setForm((prev) => ({ ...prev, [key]: [...prev[key], ''] }));

    const removeListItem = (key: 'aboutDescription' | 'jungloreStoryReasons', i: number) =>
        setForm((prev) => {
            const next = prev[key].filter((_, idx) => idx !== i);
            return { ...prev, [key]: next.length > 0 ? next : [''] };
        });

    /* ── validation + submit ── */
    const validate = (): { ok: boolean; payload?: Record<string, any> } => {
        const errs: Record<string, string> = {};

        if (!form.parkId) errs.parkId = 'Park is required.';
        if (!form.name.trim()) errs.name = 'Name is required.';
        if (!form.thumbnail.trim()) errs.thumbnail = 'Thumbnail URL is required.';
        if (!form.location.trim()) errs.location = 'Location is required.';

        const price = Number.parseInt(form.pricePerNight, 10);
        if (form.pricePerNight === '' || Number.isNaN(price) || price < 0) {
            errs.pricePerNight = 'Enter a valid price (whole number ≥ 0).';
        }

        const rating = Number.parseFloat(form.rating || '0');
        if (Number.isNaN(rating) || rating < 0 || rating > 5) {
            errs.rating = 'Rating must be between 0 and 5.';
        }

        const sortOrder = Number.parseInt(form.sortOrder || '0', 10);
        if (Number.isNaN(sortOrder)) errs.sortOrder = 'Sort order must be a number.';

        // jungloreStoryHighlights must be valid JSON when provided.
        let highlights: unknown = undefined;
        const raw = form.jungloreStoryHighlights.trim();
        if (raw) {
            try {
                highlights = JSON.parse(raw);
            } catch {
                errs.jungloreStoryHighlights =
                    'Flexible content must be valid JSON. Check for trailing commas or unquoted keys.';
            }
        }

        setErrors(errs);
        if (Object.keys(errs).length > 0) return { ok: false };

        const payload: Record<string, any> = {
            parkId: form.parkId,
            name: form.name.trim(),
            thumbnail: form.thumbnail.trim(),
            rating,
            pricePerNight: price,
            location: form.location.trim(),
            nearestGates: splitList(form.nearestGates),
            ecoCertified: form.ecoCertified,
            aboutDescription: form.aboutDescription.map((p) => p.trim()).filter(Boolean),
            jungloreStoryReasons: form.jungloreStoryReasons.map((r) => r.trim()).filter(Boolean),
            isActive: form.isActive,
            isFeatured: form.isFeatured,
            sortOrder,
            // Extra fields — stripped by createLodgeSchema on create, persisted on update.
            category: form.category.trim() || null,
            mealPlans: splitList(form.mealPlans),
            bestSeason: form.bestSeason.trim() || null,
        };

        // Optional fields: only include when present (schema fields are .optional()).
        if (form.slug.trim()) payload.slug = form.slug.trim();
        if (form.externalLink.trim()) payload.externalLink = form.externalLink.trim();
        if (raw) {
            payload.jungloreStoryHighlights = highlights;
        } else if (mode === 'edit') {
            // Allow clearing the flexible content on edit.
            payload.jungloreStoryHighlights = null;
        }

        return { ok: true, payload };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { ok, payload } = validate();
        if (ok && payload) onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className={styles.panel}>
                <div className={styles.panelHeader}>Core details</div>
                <div style={{ padding: '20px' }}>
                    <FormRow inline>
                        <AdminSelect
                            label="Park"
                            required
                            wrapRow={false}
                            placeholder="Select a park…"
                            options={parkOptions}
                            value={form.parkId}
                            error={errors.parkId}
                            onChange={(e) => set('parkId', e.target.value)}
                        />
                        <AdminInput
                            label="Name"
                            required
                            wrapRow={false}
                            value={form.name}
                            error={errors.name}
                            onChange={(e) => set('name', e.target.value)}
                        />
                    </FormRow>

                    <FormRow inline>
                        <AdminInput
                            label="Slug"
                            wrapRow={false}
                            placeholder="auto-generated from name if blank"
                            value={form.slug}
                            onChange={(e) => set('slug', e.target.value)}
                        />
                        <AdminInput
                            label="Location"
                            required
                            wrapRow={false}
                            value={form.location}
                            error={errors.location}
                            onChange={(e) => set('location', e.target.value)}
                        />
                    </FormRow>

                    <AdminInput
                        label="Thumbnail URL"
                        required
                        type="url"
                        placeholder="https://…"
                        value={form.thumbnail}
                        error={errors.thumbnail}
                        onChange={(e) => set('thumbnail', e.target.value)}
                    />

                    <FormRow inline>
                        <AdminInput
                            label="Price per night (₹)"
                            required
                            type="number"
                            min={0}
                            step={1}
                            wrapRow={false}
                            value={form.pricePerNight}
                            error={errors.pricePerNight}
                            onChange={(e) => set('pricePerNight', e.target.value)}
                        />
                        <AdminInput
                            label="Rating (0–5)"
                            type="number"
                            min={0}
                            max={5}
                            step={0.1}
                            wrapRow={false}
                            value={form.rating}
                            error={errors.rating}
                            onChange={(e) => set('rating', e.target.value)}
                        />
                        <AdminInput
                            label="Sort order"
                            type="number"
                            step={1}
                            wrapRow={false}
                            value={form.sortOrder}
                            error={errors.sortOrder}
                            onChange={(e) => set('sortOrder', e.target.value)}
                        />
                    </FormRow>

                    <AdminInput
                        label="External link"
                        type="url"
                        placeholder="https://…"
                        value={form.externalLink}
                        onChange={(e) => set('externalLink', e.target.value)}
                    />

                    <AdminInput
                        label="Nearest gates (comma-separated)"
                        placeholder="Tala Gate, Magadhi Gate"
                        value={form.nearestGates}
                        onChange={(e) => set('nearestGates', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>Categorization</div>
                <div style={{ padding: '20px' }}>
                    <FormRow inline>
                        <AdminInput
                            label="Category"
                            wrapRow={false}
                            placeholder="e.g. Luxury, Boutique"
                            value={form.category}
                            onChange={(e) => set('category', e.target.value)}
                        />
                        <AdminInput
                            label="Best season"
                            wrapRow={false}
                            placeholder="e.g. Oct–Jun"
                            value={form.bestSeason}
                            onChange={(e) => set('bestSeason', e.target.value)}
                        />
                    </FormRow>
                    <AdminInput
                        label="Meal plans (comma-separated)"
                        placeholder="Breakfast, All meals, Jungle plan"
                        value={form.mealPlans}
                        onChange={(e) => set('mealPlans', e.target.value)}
                    />
                    <FormRow inline>
                        <AdminCheckbox
                            label="Eco certified"
                            wrapRow={false}
                            checked={form.ecoCertified}
                            onChange={(e) => set('ecoCertified', e.target.checked)}
                        />
                        <AdminCheckbox
                            label="Active"
                            wrapRow={false}
                            checked={form.isActive}
                            onChange={(e) => set('isActive', e.target.checked)}
                        />
                        <AdminCheckbox
                            label="Featured"
                            wrapRow={false}
                            checked={form.isFeatured}
                            onChange={(e) => set('isFeatured', e.target.checked)}
                        />
                    </FormRow>
                </div>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>About (paragraphs)</div>
                <div style={{ padding: '20px' }}>
                    {form.aboutDescription.map((para, i) => (
                        <FormRow key={`about-${i}`}>
                            <AdminLabel>Paragraph {i + 1}</AdminLabel>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <textarea
                                    className={styles.textarea}
                                    value={para}
                                    onChange={(e) => updateListItem('aboutDescription', i, e.target.value)}
                                />
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                    onClick={() => removeListItem('aboutDescription', i)}
                                    aria-label="Remove paragraph"
                                >
                                    Remove
                                </button>
                            </div>
                        </FormRow>
                    ))}
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                        onClick={() => addListItem('aboutDescription')}
                    >
                        + Add paragraph
                    </button>
                </div>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>Junglore story — reasons</div>
                <div style={{ padding: '20px' }}>
                    {form.jungloreStoryReasons.map((reason, i) => (
                        <FormRow key={`reason-${i}`}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <input
                                    className={styles.input}
                                    value={reason}
                                    placeholder={`Reason ${i + 1}`}
                                    onChange={(e) => updateListItem('jungloreStoryReasons', i, e.target.value)}
                                />
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                    onClick={() => removeListItem('jungloreStoryReasons', i)}
                                    aria-label="Remove reason"
                                >
                                    Remove
                                </button>
                            </div>
                        </FormRow>
                    ))}
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                        onClick={() => addListItem('jungloreStoryReasons')}
                    >
                        + Add reason
                    </button>
                </div>
            </div>

            <div className={styles.panel}>
                <div className={styles.panelHeader}>Flexible content (JSON)</div>
                <div style={{ padding: '20px' }}>
                    <AdminTextarea
                        label="jungloreStoryHighlights"
                        wrapRow={false}
                        rows={14}
                        spellCheck={false}
                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', minHeight: 220 }}
                        placeholder={
                            '{\n  "natureBlend": "…",\n  "naturalistPhilosophy": "…",\n  "afterSafariVibe": "…",\n  "conservation": "…",\n  "usps": [],\n  "contact": {},\n  "paymentInfo": "…",\n  "cancellationPolicy": "…",\n  "originStory": "…"\n}'
                        }
                        value={form.jungloreStoryHighlights}
                        error={errors.jungloreStoryHighlights}
                        onChange={(e) => set('jungloreStoryHighlights', e.target.value)}
                    />
                    <p className={styles.pageHeaderSubtitle} style={{ marginTop: 0 }}>
                        Per-hotel rich content (natureBlend, naturalistPhilosophy, afterSafariVibe,
                        conservation, usps, contact, paymentInfo, cancellationPolicy, originStory…).
                        Must be valid JSON. Leave blank to clear.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                {onCancel && (
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                )}
                <SaveButton loading={submitting}>
                    {mode === 'create' ? 'Create Lodge' : 'Save Changes'}
                </SaveButton>
            </div>
        </form>
    );
}

export default LodgeForm;
