'use client';

import React, { useMemo, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { AdminCheckbox, SaveButton, useToast } from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

export interface AmenityRecord {
    id: string;
    label: string;
    category?: string | null;
}

interface Props {
    lodgeId: string;
    allAmenities: AmenityRecord[];
    assignedAmenityIds: string[];
    onChanged: () => void;
}

export function LodgeAmenitiesManager({
    lodgeId,
    allAmenities,
    assignedAmenityIds,
    onChanged,
}: Props) {
    const toast = useToast();
    const [selected, setSelected] = useState<Set<string>>(() => new Set(assignedAmenityIds));
    const [saving, setSaving] = useState(false);

    const grouped = useMemo(() => {
        const map = new Map<string, AmenityRecord[]>();
        for (const a of allAmenities) {
            const cat = a.category || 'Other';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(a);
        }
        return Array.from(map.entries());
    }, [allAmenities]);

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const handleSave = async () => {
        setSaving(true);
        try {
            // assignAmenities replaces the full set of mappings for the lodge.
            await adminApi.lodges.addAmenities(lodgeId, Array.from(selected));
            toast.success('Amenities updated.');
            onChanged();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to update amenities.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>Amenities</div>
            <div style={{ padding: '16px 20px' }}>
                {allAmenities.length === 0 ? (
                    <p className={styles.pageHeaderSubtitle} style={{ margin: 0 }}>
                        No amenities defined yet. Create amenities first to assign them here.
                    </p>
                ) : (
                    <>
                        {grouped.map(([category, items]) => (
                            <div key={category} style={{ marginBottom: 16 }}>
                                <div className={styles.navGroupLabel} style={{ marginBottom: 6 }}>
                                    {category}
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: 4,
                                    }}
                                >
                                    {items.map((a) => (
                                        <AdminCheckbox
                                            key={a.id}
                                            label={a.label}
                                            wrapRow={false}
                                            checked={selected.has(a.id)}
                                            onChange={() => toggle(a.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <SaveButton loading={saving} onClick={handleSave as any} type="button">
                                Save amenities
                            </SaveButton>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default LodgeAmenitiesManager;
