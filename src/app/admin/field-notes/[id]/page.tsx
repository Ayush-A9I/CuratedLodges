'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FieldNoteForm, FieldNoteRecord } from '@/components/admin/FieldNoteForm';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { useToast } from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

interface ParkOption {
    id: string;
    name: string;
}

export default function EditFieldNotePage() {
    const toast = useToast();
    const params = useParams<{ id: string }>();
    const id = params?.id as string;

    const [note, setNote] = useState<FieldNoteRecord | null>(null);
    const [parks, setParks] = useState<ParkOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [notesRes, parksRes] = await Promise.all([
                adminApi.fieldNotes.list(),
                adminApi.parks.list(),
            ]);
            const rows = (notesRes as { fieldNotes: FieldNoteRecord[] }).fieldNotes ?? [];
            const found = rows.find((n) => n.id === id);
            if (!found) {
                setError('Field note not found.');
                setNote(null);
            } else {
                setNote(found);
            }
            setParks((parksRes as { parks?: ParkOption[] }).parks ?? []);
        } catch (err) {
            setError(err instanceof AdminApiError ? err.message : 'Failed to load field note.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) load();
    }, [id, load]);

    if (loading) {
        return (
            <div className={styles.tableState}>
                <div className={styles.spinner} />
                Loading…
            </div>
        );
    }

    if (error || !note) {
        return <div className={styles.loginError}>{error || 'Field note not found.'}</div>;
    }

    return <FieldNoteForm mode="edit" initial={note} parks={parks} />;
}
