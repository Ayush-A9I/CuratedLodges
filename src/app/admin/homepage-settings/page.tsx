'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    PageHeader,
    AdminInput,
    AdminTextarea,
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

export default function AdminHomepageSettingsPage() {
    const toast = useToast();

    const [original, setOriginal] = useState<HomepageSetting[]>([]);
    const [items, setItems] = useState<SettingRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadSettings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.homepageSettings.get();
            // Controller returns { settings }.
            const settings = (data as { settings: HomepageSetting[] }).settings ?? [];
            setOriginal(settings);
            setItems(
                settings.map((s) => ({
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

    // Compute which rows changed (value differs, or brand new with a key).
    const changedRows = useMemo(() => {
        const byKey = new Map(original.map((s) => [s.key, s.value ?? '']));
        return items.filter((row) => {
            const key = row.key.trim();
            if (!key) return false;
            if (row.isNew) return true;
            return byKey.get(row.originalKey) !== row.value;
        });
    }, [items, original]);

    const updateRow = (index: number, patch: Partial<SettingRow>) => {
        setItems((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    };

    const addRow = () => {
        setItems((prev) => [...prev, { originalKey: '', key: '', value: '', isNew: true }]);
    };

    const removeRow = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (changedRows.length === 0) {
            toast.error('No changes to save.');
            return;
        }

        // Guard against duplicate keys in the form.
        const keys = changedRows.map((r) => r.key.trim());
        const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
        if (dupes.length > 0) {
            toast.error(`Duplicate key: ${dupes[0]}`);
            return;
        }

        setSaving(true);
        try {
            // updateHomepageSetting accepts a single { key, value } and upserts,
            // so save each changed pair sequentially.
            for (const row of changedRows) {
                await adminApi.homepageSettings.update({
                    key: row.key.trim(),
                    value: row.value,
                });
            }
            toast.success(
                changedRows.length === 1
                    ? 'Setting saved.'
                    : `${changedRows.length} settings saved.`
            );
            await loadSettings();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save homepage settings.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Homepage Settings"
                subtitle="Edit the key/value content blocks shown on the homepage"
                actionLabel="Add Setting"
                onAction={addRow}
            />

            <div className={styles.panel}>
                {loading ? (
                    <div className={styles.tableState}>
                        <div className={styles.spinner} />
                        Loading…
                    </div>
                ) : items.length === 0 ? (
                    <div className={styles.tableState}>
                        No settings yet. Add your first setting to get started.
                    </div>
                ) : (
                    <form id="homepage-settings-form" onSubmit={handleSubmit}>
                        {items.map((row, index) => (
                            <div
                                key={row.isNew ? `new-${index}` : row.originalKey}
                                style={{
                                    borderBottom: '1px solid var(--cl-border, #e5e7eb)',
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
                                    onChange={(e) => updateRow(index, { key: e.target.value })}
                                />
                                <AdminTextarea
                                    label="Value"
                                    name={`value-${index}`}
                                    rows={3}
                                    value={row.value}
                                    onChange={(e) => updateRow(index, { value: e.target.value })}
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
                            <SaveButton loading={saving} disabled={changedRows.length === 0}>
                                Save Changes
                            </SaveButton>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
