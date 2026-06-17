'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    PageHeader,
    AdminInput,
    AdminTextarea,
    ImageUpload,
    SaveButton,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

// ─── Types ───
// listHomepageSettings → { settings: [{ id, key, value, updatedAt }] }.
// updateHomepageSetting → PUT { key, value } (single, upsert) → setting.

interface HomepageSetting {
    id: string;
    key: string;
    value: string;
    updatedAt?: string;
    [key: string]: any;
}

interface SettingRow {
    /** Original key from the server (empty for newly added rows). */
    originalKey: string;
    key: string;
    value: string;
    isNew: boolean;
}

// Known homepage keys read by the homepage controller (settingsMap.get(...)).
// These always render in the Hero section, even before the backend seeds them.
const HERO_IMAGE_KEY = 'hero_image_url';
const HERO_VIDEO_KEY = 'hero_video_url';
const KNOWN_KEYS: string[] = [HERO_IMAGE_KEY, HERO_VIDEO_KEY];

export default function AdminHomepageSettingsPage() {
    const toast = useToast();

    const [loading, setLoading] = useState(true);

    // ─── Hero section state ───
    const [heroImageUrl, setHeroImageUrl] = useState('');
    const [heroVideoUrl, setHeroVideoUrl] = useState('');
    const [heroOriginal, setHeroOriginal] = useState({ image: '', video: '' });
    const [savingHero, setSavingHero] = useState(false);

    // ─── Other settings state ───
    const [otherOriginal, setOtherOriginal] = useState<HomepageSetting[]>([]);
    const [otherItems, setOtherItems] = useState<SettingRow[]>([]);
    const [savingOther, setSavingOther] = useState(false);

    const loadSettings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.homepageSettings.get();
            const settings = (data as { settings: HomepageSetting[] }).settings ?? [];

            const byKey = new Map(settings.map((s) => [s.key, s.value ?? '']));

            // Hero fields default to empty when not yet seeded.
            const image = byKey.get(HERO_IMAGE_KEY) ?? '';
            const video = byKey.get(HERO_VIDEO_KEY) ?? '';
            setHeroImageUrl(image);
            setHeroVideoUrl(video);
            setHeroOriginal({ image, video });

            // Everything else becomes an editable key/value row.
            const others = settings.filter((s) => !KNOWN_KEYS.includes(s.key));
            setOtherOriginal(others);
            setOtherItems(
                others.map((s) => ({
                    originalKey: s.key,
                    key: s.key,
                    value: s.value ?? '',
                    isNew: false,
                }))
            );
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load homepage settings.'
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    // ─── Hero save ───
    const heroDirty = useMemo(
        () => heroImageUrl !== heroOriginal.image || heroVideoUrl !== heroOriginal.video,
        [heroImageUrl, heroVideoUrl, heroOriginal]
    );

    const handleHeroSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!heroDirty) {
            toast.error('No changes to save.');
            return;
        }

        // Only persist the fields that actually changed.
        const changes: { key: string; value: string }[] = [];
        if (heroImageUrl !== heroOriginal.image) {
            changes.push({ key: HERO_IMAGE_KEY, value: heroImageUrl.trim() });
        }
        if (heroVideoUrl !== heroOriginal.video) {
            changes.push({ key: HERO_VIDEO_KEY, value: heroVideoUrl.trim() });
        }

        setSavingHero(true);
        try {
            for (const change of changes) {
                await adminApi.homepageSettings.update(change);
            }
            toast.success('Homepage hero saved.');
            await loadSettings();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save homepage hero.'
            );
        } finally {
            setSavingHero(false);
        }
    };

    // ─── Other settings ───
    const otherChangedRows = useMemo(() => {
        const byKey = new Map(otherOriginal.map((s) => [s.key, s.value ?? '']));
        return otherItems.filter((row) => {
            const key = row.key.trim();
            if (!key) return false;
            if (row.isNew) return true;
            return byKey.get(row.originalKey) !== row.value;
        });
    }, [otherItems, otherOriginal]);

    const updateRow = (index: number, patch: Partial<SettingRow>) => {
        setOtherItems((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    };

    const addRow = () => {
        setOtherItems((prev) => [...prev, { originalKey: '', key: '', value: '', isNew: true }]);
    };

    const removeRow = (index: number) => {
        setOtherItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleOtherSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otherChangedRows.length === 0) {
            toast.error('No changes to save.');
            return;
        }

        // Don't let custom keys collide with the managed hero keys.
        const reserved = otherChangedRows.find((r) => KNOWN_KEYS.includes(r.key.trim()));
        if (reserved) {
            toast.error(`"${reserved.key.trim()}" is managed in the Homepage Hero section above.`);
            return;
        }

        // Guard against duplicate keys in the form.
        const keys = otherChangedRows.map((r) => r.key.trim());
        const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
        if (dupes.length > 0) {
            toast.error(`Duplicate key: ${dupes[0]}`);
            return;
        }

        setSavingOther(true);
        try {
            // update() accepts a single { key, value } and upserts, so save each
            // changed pair sequentially.
            for (const row of otherChangedRows) {
                await adminApi.homepageSettings.update({
                    key: row.key.trim(),
                    value: row.value,
                });
            }
            toast.success(
                otherChangedRows.length === 1
                    ? 'Setting saved.'
                    : `${otherChangedRows.length} settings saved.`
            );
            await loadSettings();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save settings.'
            );
        } finally {
            setSavingOther(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Homepage Settings"
                subtitle="Manage the hero media and content blocks shown on the homepage"
            />

            {loading ? (
                <div className={styles.panel}>
                    <div className={styles.tableState}>
                        <div className={styles.spinner} />
                        Loading…
                    </div>
                </div>
            ) : (
                <>
                    {/* ─── Homepage Hero ─── */}
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>Homepage Hero</div>
                        <div className={styles.panelBody} style={{ padding: '16px 20px' }}>
                            <form id="hero-form" onSubmit={handleHeroSubmit}>
                                <ImageUpload
                                    label="Hero Image"
                                    folder="homepage"
                                    previewHeight={280}
                                    value={heroImageUrl}
                                    onChange={(url) => setHeroImageUrl(url)}
                                />

                                <AdminInput
                                    label="Hero Video URL"
                                    name="hero_video_url"
                                    type="url"
                                    inputMode="url"
                                    placeholder="https://example.com/hero.mp4 (optional — video pipeline deferred)"
                                    value={heroVideoUrl}
                                    onChange={(e) => setHeroVideoUrl(e.target.value)}
                                />

                                <div className={styles.modalFooter} style={{ paddingRight: 0 }}>
                                    <SaveButton loading={savingHero} disabled={!heroDirty}>
                                        Save Hero
                                    </SaveButton>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ─── Other settings ─── */}
                    <div className={styles.panel}>
                        <div
                            className={styles.panelHeader}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span>Other settings</span>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                                onClick={addRow}
                            >
                                Add custom setting
                            </button>
                        </div>
                        <div className={styles.panelBody} style={{ padding: '16px 20px' }}>
                            {otherItems.length === 0 ? (
                                <p
                                    style={{
                                        margin: '4px 0 16px',
                                        fontSize: 13,
                                        color: 'var(--cl-text-muted)',
                                    }}
                                >
                                    No additional settings. Use “Add custom setting” to create a new
                                    key/value pair.
                                </p>
                            ) : null}

                            <form id="other-settings-form" onSubmit={handleOtherSubmit}>
                                {otherItems.map((row, index) => (
                                    <div
                                        key={row.isNew ? `new-${index}` : row.originalKey}
                                        style={{
                                            borderBottom: '1px solid var(--cl-border)',
                                            paddingBottom: 12,
                                            marginBottom: 12,
                                        }}
                                    >
                                        <AdminInput
                                            label="Key"
                                            name={`key-${index}`}
                                            value={row.key}
                                            readOnly={!row.isNew}
                                            disabled={!row.isNew}
                                            placeholder="e.g. hero_title"
                                            onChange={(e) =>
                                                updateRow(index, { key: e.target.value })
                                            }
                                        />
                                        <AdminTextarea
                                            label="Value"
                                            name={`value-${index}`}
                                            rows={3}
                                            value={row.value}
                                            onChange={(e) =>
                                                updateRow(index, { value: e.target.value })
                                            }
                                        />
                                        {row.isNew && (
                                            <button
                                                type="button"
                                                className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                                                style={{ color: 'var(--cl-danger)' }}
                                                onClick={() => removeRow(index)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <div className={styles.modalFooter} style={{ paddingRight: 0 }}>
                                    <SaveButton
                                        loading={savingOther}
                                        disabled={otherChangedRows.length === 0}
                                    >
                                        Save Changes
                                    </SaveButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
