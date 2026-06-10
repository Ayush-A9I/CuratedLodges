'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    DataTable,
    DataTableColumn,
    Modal,
    AdminInput,
    FormRow,
    SaveButton,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

/** A room-availability row as returned by the admin backend. */
export interface AvailabilityRecord {
    id: string;
    roomTypeId: string;
    /** ISO date-time string. */
    date: string;
    totalUnits: number;
    bookedUnits: number;
}

interface Props {
    /** Whether the modal is visible. */
    open: boolean;
    /** Called when the modal should close. */
    onClose: () => void;
    /** The room type whose availability is managed. */
    roomTypeId: string;
    /** The room type name, shown in the modal title. */
    roomTypeName: string;
    /** Default total-units value pre-filled in the "set availability" form. */
    defaultUnits?: number;
}

/** Coerce an ISO date-time string to the `YYYY-MM-DD` form `<input type="date">` expects. */
const toDateInput = (iso: string): string => (iso ? iso.slice(0, 10) : '');

/** Format an ISO date-time string for display as `YYYY-MM-DD`. */
const formatDate = (iso: string): string => toDateInput(iso) || '—';

/** Returns today's date as `YYYY-MM-DD`. */
const todayInput = (): string => new Date().toISOString().slice(0, 10);

/** Returns the date `days` from today as `YYYY-MM-DD`. */
const daysFromToday = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
};

/**
 * Modal that lists and edits per-date availability for a single room type.
 *
 * Availability rows only exist for dates that have been explicitly set or that
 * carry bookings; there is no row for every calendar day. The "Set availability
 * for a date" form upserts a row (create or override), and existing rows can be
 * edited inline. Booked units are read-only.
 */
export function AvailabilityModal({ open, onClose, roomTypeId, roomTypeName, defaultUnits }: Props) {
    const toast = useToast();

    const [rows, setRows] = useState<AvailabilityRecord[]>([]);
    const [loading, setLoading] = useState(false);

    // Date-range filter.
    const [from, setFrom] = useState<string>(todayInput());
    const [to, setTo] = useState<string>(daysFromToday(60));

    // "Set availability for a date" form.
    const [setDate, setSetDate] = useState<string>(todayInput());
    const [setUnits, setSetUnits] = useState<string>(
        defaultUnits != null ? String(defaultUnits) : ''
    );
    const [setErrors, setSetErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Inline edit state (which row + its draft total units).
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editUnits, setEditUnits] = useState<string>('');
    const [savingInline, setSavingInline] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.availability.listForRoomType(roomTypeId, from, to);
            setRows(((res as { availability?: AvailabilityRecord[] })?.availability) ?? []);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load availability.'
            );
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [roomTypeId, from, to, toast]);

    useEffect(() => {
        if (open) {
            setFrom(todayInput());
            setTo(daysFromToday(60));
            setSetDate(todayInput());
            setSetUnits(defaultUnits != null ? String(defaultUnits) : '');
            setSetErrors({});
            setEditingId(null);
        }
    }, [open, defaultUnits]);

    // Refetch whenever the modal is open and the range changes.
    useEffect(() => {
        if (open) void load();
    }, [open, load]);

    const handleSet = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!setDate) errs.date = 'Date is required.';
        const units = Number.parseInt(setUnits, 10);
        if (setUnits === '' || Number.isNaN(units) || units < 0)
            errs.totalUnits = 'Enter a valid number of units.';
        setSetErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSaving(true);
        try {
            await adminApi.availability.upsert(roomTypeId, { date: setDate, totalUnits: units });
            toast.success('Availability saved.');
            await load();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save availability.'
            );
        } finally {
            setSaving(false);
        }
    };

    const startInlineEdit = (row: AvailabilityRecord) => {
        setEditingId(row.id);
        setEditUnits(String(row.totalUnits ?? ''));
    };

    const cancelInlineEdit = () => {
        setEditingId(null);
        setEditUnits('');
    };

    const saveInlineEdit = async (row: AvailabilityRecord) => {
        const units = Number.parseInt(editUnits, 10);
        if (editUnits === '' || Number.isNaN(units) || units < 0) {
            toast.error('Enter a valid number of units.');
            return;
        }
        setSavingInline(true);
        try {
            await adminApi.availability.upsert(roomTypeId, {
                date: toDateInput(row.date),
                totalUnits: units,
            });
            toast.success('Availability updated.');
            setEditingId(null);
            await load();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to update availability.'
            );
        } finally {
            setSavingInline(false);
        }
    };

    const columns: DataTableColumn<AvailabilityRecord>[] = [
        { key: 'date', header: 'Date', render: (r) => <span style={{ fontWeight: 600 }}>{formatDate(r.date)}</span> },
        {
            key: 'totalUnits',
            header: 'Total units',
            align: 'right',
            render: (r) =>
                editingId === r.id ? (
                    <input
                        type="number"
                        min={0}
                        value={editUnits}
                        onChange={(e) => setEditUnits(e.target.value)}
                        className={styles.input}
                        style={{ width: 90, textAlign: 'right' }}
                    />
                ) : (
                    r.totalUnits
                ),
        },
        { key: 'bookedUnits', header: 'Booked units', align: 'right', render: (r) => r.bookedUnits },
        {
            key: 'available',
            header: 'Available',
            align: 'right',
            render: (r) => Math.max(0, (r.totalUnits ?? 0) - (r.bookedUnits ?? 0)),
        },
    ];

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Availability — ${roomTypeName}`}
            maxWidth={820}
            footer={
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                    Close
                </button>
            }
        >
            <p style={{ marginTop: 0, color: 'var(--cl-text-muted, #666)', fontSize: 13 }}>
                Rows only exist for dates that have been set here or that already carry bookings.
                Use the form below to set (create or override) availability for a specific date.
                Booked units are read-only.
            </p>

            {/* Date-range filter */}
            <FormRow inline>
                <AdminInput
                    label="From"
                    type="date"
                    wrapRow={false}
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                />
                <AdminInput
                    label="To"
                    type="date"
                    wrapRow={false}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                />
            </FormRow>

            {/* Set availability for a date */}
            <form onSubmit={handleSet} className={styles.panel} style={{ padding: 12, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Set availability for a date</div>
                <FormRow inline>
                    <AdminInput
                        label="Date"
                        required
                        type="date"
                        wrapRow={false}
                        value={setDate}
                        error={setErrors.date}
                        onChange={(e) => setSetDate(e.target.value)}
                    />
                    <AdminInput
                        label="Total units"
                        required
                        type="number"
                        min={0}
                        wrapRow={false}
                        value={setUnits}
                        error={setErrors.totalUnits}
                        onChange={(e) => setSetUnits(e.target.value)}
                    />
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                        <SaveButton loading={saving} onClick={handleSet as any}>
                            Set
                        </SaveButton>
                    </div>
                </FormRow>
            </form>

            <DataTable
                columns={columns}
                rows={rows}
                loading={loading}
                emptyMessage="No availability rows in this date range."
                renderActions={(r) =>
                    editingId === r.id ? (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                                onClick={() => void saveInlineEdit(r)}
                                disabled={savingInline}
                            >
                                Save
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                                onClick={cancelInlineEdit}
                                disabled={savingInline}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                            onClick={() => startInlineEdit(r)}
                        >
                            Edit units
                        </button>
                    )
                }
            />
        </Modal>
    );
}

export default AvailabilityModal;
