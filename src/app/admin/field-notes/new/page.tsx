'use client';

import React, { useEffect, useState } from 'react';
import { FieldNoteForm } from '@/components/admin/FieldNoteForm';
import { adminApi } from '@/lib/adminApi';
import styles from '@/components/admin/admin.module.css';

interface ParkOption {
    id: string;
    name: string;
}

export default function NewFieldNotePage() {
    const [parks, setParks] = useState<ParkOption[]>([]);

    useEffect(() => {
        adminApi.parks
            .list()
            .then((data) => setParks((data as { parks?: ParkOption[] }).parks ?? []))
            .catch(() => setParks([]));
    }, []);

    return (
        <div>
            <FieldNoteForm mode="create" parks={parks} />
        </div>
    );
}
