'use client';

import React, { useEffect, useState } from 'react';
import { AdminInput, AdminLabel, AdminCheckbox, FormRow, ImageUpload } from '@/components/admin';
import styles from '@/components/admin/admin.module.css';
import { LODGE_HERO_QUOTE_MAX } from '@/lib/lodgeDisplayLimits';
import {
    DEFAULT_SECTION_TITLES,
    SECTION_TITLE_FIELD_META,
    type SectionTitleKey,
} from '@/lib/lodgeSectionTitles';
import {
    defaultSectionImageConfig,
    readSectionImages,
    SECTION_IMAGE_FIELD_META,
    serializeSectionImages,
    type SectionImageKey,
    type SectionImagesMap,
} from '@/lib/lodgeSectionImages';
import { FALLBACK_IMAGES } from '@/lib/fallbackImages';

/* ───────────────────────── Types ───────────────────────── */

export interface LodgeContentEditorProps {
    /** Current content object. May be null/undefined or any shape. */
    value: any;
    /** Called with the next (cleaned) content object whenever it changes. */
    onChange: (next: any) => void;
    /** Lodge thumbnail from core details — used when a section follows the thumbnail. */
    thumbnailUrl?: string;
}

type Dict = Record<string, any>;

/* ─────────────────────── Constants ─────────────────────── */

/** Paragraph-style string[] sections the friendly editor manages directly. */
const PARAGRAPH_KEYS = [
    'originStory',
    'natureBlend',
    'naturalistPhilosophy',
    'afterSafariVibe',
] as const;

const CONSERVATION_SUBS: Array<{ key: string; label: string }> = [
    { key: 'intro', label: 'Intro' },
    { key: 'wildlifeEcosystem', label: 'Wildlife & Ecosystem' },
    { key: 'indigenousCommunities', label: 'Indigenous & Local Communities' },
];

const CONTACT_FIELDS: Array<{ key: string; label: string; type?: string }> = [
    { key: 'owner', label: 'Owner' },
    { key: 'person', label: 'Contact Person' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone' },
];

const PAYMENT_FIELDS: Array<{ key: string; label: string }> = [
    { key: 'bank', label: 'Bank' },
    { key: 'accountName', label: 'Account Name' },
    { key: 'accountNo', label: 'Account No.' },
    { key: 'ifsc', label: 'IFSC' },
    { key: 'upi', label: 'UPI' },
];

const CANCELLATION_SUBS: Array<{ key: string; label: string }> = [
    { key: 'cancellation', label: 'Cancellation Terms' },
    { key: 'dateModifications', label: 'Date Modifications' },
];

/** Every key the friendly editor knows about. Anything else is preserved verbatim. */
const MANAGED_KEYS = new Set<string>([
    ...PARAGRAPH_KEYS,
    'sectionTitles',
    'sectionImages',
    'conservation',
    'usps',
    'contact',
    'paymentInfo',
    'cancellationPolicy',
    'mediaLink',
]);

/* ─────────────────────── Helpers ───────────────────────── */

function isPlainObject(v: unknown): v is Dict {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asStringArray(v: unknown): string[] {
    return Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : String(x ?? ''))) : [];
}

function asString(v: unknown): string {
    return typeof v === 'string' ? v : '';
}

/** Drop empty/whitespace-only entries, keeping the rest as typed. */
function cleanStringArray(v: unknown): string[] {
    return asStringArray(v).filter((s) => s.trim() !== '');
}

/** Pick the given keys from an object, keeping only non-empty string values. */
function cleanStringFields(obj: unknown, keys: string[]): Dict {
    const src = isPlainObject(obj) ? obj : {};
    const out: Dict = {};
    for (const k of keys) {
        const val = asString(src[k]);
        if (val.trim() !== '') out[k] = val;
    }
    return out;
}

function prettyJson(value: unknown): string {
    try {
        return JSON.stringify(value ?? {}, null, 2);
    } catch {
        return '{}';
    }
}

/**
 * Produce the persisted content object from the working draft:
 *  - omits empty strings from arrays
 *  - drops sections that are entirely empty
 *  - PRESERVES any keys the friendly editor does not manage (e.g. onboardingDate
 *    or hotel-specific keys) exactly as-is, so nothing is lost.
 */
function serialize(draft: Dict): Dict {
    const out: Dict = {};

    // 1. Preserve unknown / unmanaged keys verbatim.
    for (const k of Object.keys(draft)) {
        if (!MANAGED_KEYS.has(k)) out[k] = draft[k];
    }

    // 2. Paragraph string[] sections.
    for (const key of PARAGRAPH_KEYS) {
        const arr = cleanStringArray(draft[key]);
        if (arr.length > 0) out[key] = arr;
    }

    // 3. Conservation (object of string[] sub-sections).
    const conservation: Dict = {};
    const consSrc = isPlainObject(draft.conservation) ? draft.conservation : {};
    for (const { key } of CONSERVATION_SUBS) {
        const arr = cleanStringArray(consSrc[key]);
        if (arr.length > 0) conservation[key] = arr;
    }
    if (Object.keys(conservation).length > 0) out.conservation = conservation;

    // 3b. Section titles (optional overrides for lodge page headings).
    const sectionTitles = cleanStringFields(
        draft.sectionTitles,
        SECTION_TITLE_FIELD_META.map((f) => f.key)
    );
    if (Object.keys(sectionTitles).length > 0) out.sectionTitles = sectionTitles;

    // 3c. Section hero images (optional overrides per narrative block).
    const sectionImages = serializeSectionImages(readSectionImages(draft.sectionImages));
    if (sectionImages) out.sectionImages = sectionImages;

    // 4. USPs ({ title, text }[]).
    const usps = (Array.isArray(draft.usps) ? draft.usps : [])
        .map((u: any) => ({ title: asString(u?.title), text: asString(u?.text) }))
        .filter((u: { title: string; text: string }) => u.title.trim() !== '' || u.text.trim() !== '');
    if (usps.length > 0) out.usps = usps;

    // 5. Contact.
    const contact = cleanStringFields(draft.contact, CONTACT_FIELDS.map((f) => f.key));
    if (Object.keys(contact).length > 0) out.contact = contact;

    // 6. Payment info.
    const paymentInfo = cleanStringFields(draft.paymentInfo, PAYMENT_FIELDS.map((f) => f.key));
    if (Object.keys(paymentInfo).length > 0) out.paymentInfo = paymentInfo;

    // 7. Cancellation policy (object of string[] sub-sections).
    const cancellationPolicy: Dict = {};
    const cpSrc = isPlainObject(draft.cancellationPolicy) ? draft.cancellationPolicy : {};
    for (const { key } of CANCELLATION_SUBS) {
        const arr = cleanStringArray(cpSrc[key]);
        if (arr.length > 0) cancellationPolicy[key] = arr;
    }
    if (Object.keys(cancellationPolicy).length > 0) out.cancellationPolicy = cancellationPolicy;

    // 8. Media link.
    const mediaLink = asString(draft.mediaLink);
    if (mediaLink.trim() !== '') out.mediaLink = mediaLink;

    return out;
}

/* ──────────────────── Reusable sub-editors ──────────────────── */

interface ListEditorProps {
    items: string[];
    onChange: (next: string[]) => void;
    addLabel: string;
    placeholder?: string;
    /** When set, the first paragraph is capped (hero quote on the lodge page). */
    firstItemMaxLength?: number;
    firstItemHint?: string;
}

/** Repeatable list of multi-line paragraph textareas. */
function ParagraphListEditor({
    items,
    onChange,
    addLabel,
    placeholder,
    firstItemMaxLength,
    firstItemHint,
}: ListEditorProps) {
    const update = (i: number, val: string) => {
        const next = [...items];
        next[i] = val;
        onChange(next);
    };
    const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
    const add = () => onChange([...items, '']);

    return (
        <>
            {firstItemHint && (
                <p className={styles.pageHeaderSubtitle} style={{ marginTop: 0 }}>
                    {firstItemHint}
                </p>
            )}
            {items.map((para, i) => (
                <FormRow key={i}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <textarea
                                className={styles.textarea}
                                value={para}
                                placeholder={placeholder}
                                maxLength={i === 0 ? firstItemMaxLength : undefined}
                                onChange={(e) => update(i, e.target.value)}
                            />
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                onClick={() => remove(i)}
                                aria-label="Remove paragraph"
                            >
                                Remove
                            </button>
                        </div>
                        {i === 0 && firstItemMaxLength ? (
                            <span
                                className={styles.pageHeaderSubtitle}
                                style={{
                                    margin: 0,
                                    color:
                                        para.length >= firstItemMaxLength
                                            ? 'var(--cl-danger, #c0392b)'
                                            : undefined,
                                }}
                            >
                                {para.length}/{firstItemMaxLength} characters
                            </span>
                        ) : null}
                    </div>
                </FormRow>
            ))}
            <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                onClick={add}
            >
                {addLabel}
            </button>
        </>
    );
}

/** Repeatable list of single-line text inputs (one "key" / short line each). */
function KeyListEditor({ items, onChange, addLabel, placeholder }: ListEditorProps) {
    const update = (i: number, val: string) => {
        const next = [...items];
        next[i] = val;
        onChange(next);
    };
    const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
    const add = () => onChange([...items, '']);

    return (
        <>
            {items.map((line, i) => (
                <FormRow key={i}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <input
                            className={styles.input}
                            value={line}
                            placeholder={placeholder ?? `Item ${i + 1}`}
                            onChange={(e) => update(i, e.target.value)}
                        />
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                            onClick={() => remove(i)}
                            aria-label="Remove item"
                        >
                            Remove
                        </button>
                    </div>
                </FormRow>
            ))}
            <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                onClick={add}
            >
                {addLabel}
            </button>
        </>
    );
}

/** A visually-grouped section panel with a header. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>{title}</div>
            <div style={{ padding: '20px' }}>{children}</div>
        </div>
    );
}

/** A labelled sub-group inside a section. */
function SubGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <AdminLabel>{label}</AdminLabel>
            {children}
        </div>
    );
}

interface SectionImageFieldProps {
    meta: (typeof SECTION_IMAGE_FIELD_META)[number];
    config: SectionImageConfig;
    thumbnailUrl: string;
    onChange: (next: SectionImageConfig) => void;
}

type SectionImageConfig = { useThumbnail?: boolean; url?: string };

/** Per-section image: follow lodge thumbnail or upload a custom hero. */
function SectionImageField({ meta, config, thumbnailUrl, onChange }: SectionImageFieldProps) {
    const useThumbnail = config.useThumbnail !== false;
    const previewSrc = useThumbnail
        ? thumbnailUrl.trim() || FALLBACK_IMAGES.lodge
        : config.url?.trim() || '';

    return (
        <div
            style={{
                border: '1px solid var(--cl-border)',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
            }}
        >
            <AdminLabel>{meta.label}</AdminLabel>
            <p className={styles.pageHeaderSubtitle} style={{ marginTop: 4, marginBottom: 12 }}>
                Shown in &ldquo;{meta.publicLabel}&rdquo; on the public lodge page.
            </p>
            <AdminCheckbox
                label="Use lodge thumbnail"
                wrapRow={false}
                checked={useThumbnail}
                onChange={(e) =>
                    onChange({
                        useThumbnail: e.target.checked,
                        url: e.target.checked ? '' : config.url || '',
                    })
                }
            />
            {!useThumbnail ? (
                <ImageUpload
                    label="Custom image"
                    folder="lodges"
                    wrapRow={false}
                    value={config.url || ''}
                    fallbackPreview={FALLBACK_IMAGES.lodge}
                    onChange={(url) => onChange({ useThumbnail: false, url })}
                />
            ) : previewSrc ? (
                <div style={{ marginTop: 8 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={previewSrc}
                        alt={`${meta.label} preview`}
                        style={{
                            display: 'block',
                            maxWidth: '100%',
                            maxHeight: 120,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: '1px solid var(--cl-border)',
                        }}
                    />
                    <p className={styles.pageHeaderSubtitle} style={{ marginTop: 6, marginBottom: 0 }}>
                        {thumbnailUrl.trim()
                            ? 'Uses the thumbnail from Core details above.'
                            : 'Upload a thumbnail in Core details, or switch to a custom image.'}
                    </p>
                </div>
            ) : null}
        </div>
    );
}

/* ─────────────────────── Component ─────────────────────── */

export function LodgeContentEditor({ value, onChange, thumbnailUrl = '' }: LodgeContentEditorProps) {
    // Working copy of the full content object. Unmanaged keys live here too.
    const [draft, setDraft] = useState<Dict>(() => (isPlainObject(value) ? { ...value } : {}));
    const [rawText, setRawText] = useState<string>(() =>
        prettyJson(serialize(isPlainObject(value) ? value : {}))
    );
    const [rawError, setRawError] = useState<string | null>(null);
    const [advancedOpen, setAdvancedOpen] = useState(false);

    /** Apply a friendly-field edit: store draft, emit cleaned object, keep raw in sync. */
    const apply = (next: Dict) => {
        setDraft(next);
        const cleaned = serialize(next);
        onChange(cleaned);
        setRawText(prettyJson(cleaned));
        setRawError(null);
    };

    /** Set a single top-level key on the draft. */
    const setKey = (key: string, val: any) => apply({ ...draft, [key]: val });

    /** Set a nested sub-key (one level deep) on the draft. */
    const setNested = (parent: string, sub: string, val: any) => {
        const parentObj = isPlainObject(draft[parent]) ? draft[parent] : {};
        apply({ ...draft, [parent]: { ...parentObj, [sub]: val } });
    };

    const sectionImages = readSectionImages(draft.sectionImages);

    const setSectionImage = (key: SectionImageKey, cfg: SectionImageConfig) => {
        apply({
            ...draft,
            sectionImages: { ...sectionImages, [key]: cfg },
        });
    };

    /* ── USP helpers ── */
    const usps: Array<{ title: string; text: string }> = Array.isArray(draft.usps)
        ? draft.usps.map((u: any) => ({ title: asString(u?.title), text: asString(u?.text) }))
        : [];

    const updateUsp = (i: number, field: 'title' | 'text', val: string) => {
        const next = usps.map((u, idx) => (idx === i ? { ...u, [field]: val } : u));
        setKey('usps', next);
    };
    const addUsp = () => setKey('usps', [...usps, { title: '', text: '' }]);
    const removeUsp = (i: number) =>
        setKey('usps', usps.filter((_, idx) => idx !== i));

    /* ── Raw JSON editing ── */
    const onRawChange = (text: string) => {
        setRawText(text);
        try {
            const parsed = JSON.parse(text);
            if (!isPlainObject(parsed)) {
                setRawError('Content must be a JSON object (e.g. { "originStory": [ … ] }).');
                return;
            }
            setRawError(null);
            setDraft(parsed);
            onChange(serialize(parsed));
        } catch (err) {
            setRawError(
                'Invalid JSON. Check for trailing commas, unquoted keys, or missing brackets.'
            );
        }
    };

    const conservation = isPlainObject(draft.conservation) ? draft.conservation : {};
    const cancellationPolicy = isPlainObject(draft.cancellationPolicy)
        ? draft.cancellationPolicy
        : {};
    const sectionTitles = isPlainObject(draft.sectionTitles) ? draft.sectionTitles : {};

    return (
        <div>
            {/* Section headings */}
            <Section title="Section headings (optional)">
                <p className={styles.pageHeaderSubtitle} style={{ marginTop: 0 }}>
                    Override the large headings on the public lodge page. Leave blank to use the
                    default styled titles.
                </p>
                {SECTION_TITLE_FIELD_META.map(({ key, label, description }) => (
                    <AdminInput
                        key={key}
                        label={label}
                        wrapRow={false}
                        placeholder={DEFAULT_SECTION_TITLES[key as SectionTitleKey].title}
                        value={asString(sectionTitles[key])}
                        onChange={(e) => setNested('sectionTitles', key, e.target.value)}
                    />
                ))}
                <p className={styles.pageHeaderSubtitle} style={{ marginBottom: 0 }}>
                    Custom headings render as plain text. Default headings keep their accent styling
                    (e.g. &ldquo;call home.&rdquo;, &ldquo;Rhythm.&rdquo;).
                </p>
            </Section>

            {/* Section images */}
            <Section title="Section images">
                <p className={styles.pageHeaderSubtitle} style={{ marginTop: 0 }}>
                    Each narrative block on the lodge page can use the lodge thumbnail or its own
                    image. Origin Story uses up to four gallery images when following the thumbnail;
                    upload extra images in the Images section below for a varied grid.
                </p>
                {SECTION_IMAGE_FIELD_META.map((meta) => (
                    <SectionImageField
                        key={meta.key}
                        meta={meta}
                        thumbnailUrl={thumbnailUrl}
                        config={sectionImages[meta.key] || defaultSectionImageConfig()}
                        onChange={(next) => setSectionImage(meta.key, next)}
                    />
                ))}
            </Section>

            {/* Origin Story */}
            <Section title="Origin Story">
                <ParagraphListEditor
                    items={asStringArray(draft.originStory)}
                    onChange={(next) => setKey('originStory', next)}
                    addLabel="+ Add paragraph"
                    placeholder="Tell the lodge's origin story…"
                />
            </Section>

            {/* Nature Blend */}
            <Section title="Nature Blend">
                <ParagraphListEditor
                    items={asStringArray(draft.natureBlend)}
                    onChange={(next) => setKey('natureBlend', next)}
                    addLabel="+ Add paragraph"
                    placeholder="How the lodge blends with nature…"
                    firstItemMaxLength={LODGE_HERO_QUOTE_MAX}
                    firstItemHint={`Paragraph 1 is the large hero quote on the lodge page (max ${LODGE_HERO_QUOTE_MAX} characters). Put longer copy in paragraph 2 and beyond.`}
                />
            </Section>

            {/* Naturalist Philosophy */}
            <Section title="Naturalist Philosophy">
                <ParagraphListEditor
                    items={asStringArray(draft.naturalistPhilosophy)}
                    onChange={(next) => setKey('naturalistPhilosophy', next)}
                    addLabel="+ Add paragraph"
                    placeholder="The naturalist philosophy…"
                    firstItemMaxLength={LODGE_HERO_QUOTE_MAX}
                    firstItemHint={`Paragraph 1 is the pull quote in The Philosophy section (max ${LODGE_HERO_QUOTE_MAX} characters).`}
                />
            </Section>

            {/* After-Safari Vibe */}
            <Section title="After-Safari Vibe">
                <ParagraphListEditor
                    items={asStringArray(draft.afterSafariVibe)}
                    onChange={(next) => setKey('afterSafariVibe', next)}
                    addLabel="+ Add paragraph"
                    placeholder="The vibe after a day on safari…"
                />
            </Section>

            {/* Conservation */}
            <Section title="Conservation">
                {CONSERVATION_SUBS.map(({ key, label }) => (
                    <SubGroup key={key} label={label}>
                        <ParagraphListEditor
                            items={asStringArray(conservation[key])}
                            onChange={(next) => setNested('conservation', key, next)}
                            addLabel="+ Add paragraph"
                        />
                    </SubGroup>
                ))}
            </Section>

            {/* Unique Selling Points */}
            <Section title="Unique Selling Points">
                {usps.map((usp, i) => (
                    <div
                        key={i}
                        style={{
                            border: '1px solid var(--cl-border)',
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 16,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 8,
                            }}
                        >
                            <AdminLabel>USP {i + 1}</AdminLabel>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                onClick={() => removeUsp(i)}
                                aria-label="Remove USP"
                            >
                                Remove
                            </button>
                        </div>
                        <AdminInput
                            label="Title"
                            wrapRow={false}
                            value={usp.title}
                            onChange={(e) => updateUsp(i, 'title', e.target.value)}
                        />
                        <FormRow>
                            <AdminLabel>Text</AdminLabel>
                            <textarea
                                className={styles.textarea}
                                value={usp.text}
                                onChange={(e) => updateUsp(i, 'text', e.target.value)}
                            />
                        </FormRow>
                    </div>
                ))}
                <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                    onClick={addUsp}
                >
                    + Add USP
                </button>
            </Section>

            {/* Contact */}
            <Section title="Contact">
                <FormRow inline>
                    {CONTACT_FIELDS.slice(0, 2).map(({ key, label, type }) => (
                        <AdminInput
                            key={key}
                            label={label}
                            type={type}
                            wrapRow={false}
                            value={asString((isPlainObject(draft.contact) ? draft.contact : {})[key])}
                            onChange={(e) => setNested('contact', key, e.target.value)}
                        />
                    ))}
                </FormRow>
                <FormRow inline>
                    {CONTACT_FIELDS.slice(2).map(({ key, label, type }) => (
                        <AdminInput
                            key={key}
                            label={label}
                            type={type}
                            wrapRow={false}
                            value={asString((isPlainObject(draft.contact) ? draft.contact : {})[key])}
                            onChange={(e) => setNested('contact', key, e.target.value)}
                        />
                    ))}
                </FormRow>
            </Section>

            {/* Payment Info */}
            <Section title="Payment Info">
                {PAYMENT_FIELDS.map(({ key, label }) => (
                    <AdminInput
                        key={key}
                        label={label}
                        value={asString((isPlainObject(draft.paymentInfo) ? draft.paymentInfo : {})[key])}
                        onChange={(e) => setNested('paymentInfo', key, e.target.value)}
                    />
                ))}
            </Section>

            {/* Cancellation Policy */}
            <Section title="Cancellation Policy">
                {CANCELLATION_SUBS.map(({ key, label }) => (
                    <SubGroup key={key} label={label}>
                        <KeyListEditor
                            items={asStringArray(cancellationPolicy[key])}
                            onChange={(next) => setNested('cancellationPolicy', key, next)}
                            addLabel="+ Add line"
                        />
                    </SubGroup>
                ))}
            </Section>

            {/* Media Link */}
            <Section title="Media Link">
                <AdminInput
                    label="Media link"
                    type="url"
                    placeholder="https://…"
                    wrapRow={false}
                    value={asString(draft.mediaLink)}
                    onChange={(e) => setKey('mediaLink', e.target.value)}
                />
            </Section>

            {/* Advanced (raw JSON) */}
            <div className={styles.panel}>
                <button
                    type="button"
                    className={styles.panelHeader}
                    onClick={() => setAdvancedOpen((o) => !o)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        font: 'inherit',
                    }}
                    aria-expanded={advancedOpen}
                >
                    <span>{advancedOpen ? '▾' : '▸'}</span>
                    Advanced (raw JSON)
                </button>
                {advancedOpen && (
                    <div style={{ padding: '20px' }}>
                        <p className={styles.pageHeaderSubtitle} style={{ marginTop: 0 }}>
                            The full content object. Edit any field — including keys not covered by
                            the friendly sections above — and the friendly editor will stay in sync.
                            Must be a valid JSON object.
                        </p>
                        <textarea
                            className={`${styles.textarea} ${rawError ? styles.inputError : ''}`.trim()}
                            rows={16}
                            spellCheck={false}
                            style={{
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                minHeight: 260,
                            }}
                            value={rawText}
                            onChange={(e) => onRawChange(e.target.value)}
                        />
                        {rawError && <div className={styles.fieldError}>{rawError}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LodgeContentEditor;
