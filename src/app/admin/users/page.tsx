'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    PageHeader,
    DataTable,
    DataTableColumn,
    Modal,
    AdminInput,
    AdminCheckbox,
    FormRow,
    AdminLabel,
    SaveButton,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

// ─── Types ───
// listUsers → { users, pagination }. The list `select` only returns
// id, email, firstName, lastName, isActive, createdAt, _count.bookings.
// getUserDetail → full user (minus passwordHash), including phone,
// whatsappEnabled, preferredLanguage, preferredCurrency, emailVerified.

interface UserRow {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    preferredCurrency?: string;
    preferredLanguage?: string;
    whatsappEnabled?: boolean;
    emailVerified?: boolean;
    isActive?: boolean;
    createdAt?: string;
    [key: string]: any;
}

// Form mirrors updateUserSchema (all optional).
interface UserForm {
    firstName: string;
    lastName: string;
    phone: string;
    whatsappEnabled: boolean;
    preferredLanguage: string;
    preferredCurrency: string;
}

const emptyForm = (): UserForm => ({
    firstName: '',
    lastName: '',
    phone: '',
    whatsappEnabled: false,
    preferredLanguage: 'en',
    preferredCurrency: 'INR',
});

export default function AdminUsersPage() {
    const toast = useToast();

    const [rows, setRows] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit modal state.
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<UserRow | null>(null);
    const [form, setForm] = useState<UserForm>(emptyForm());
    const [detailLoading, setDetailLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.users.list();
            // Controller returns { users, pagination }.
            setRows((data as { users: UserRow[] }).users ?? []);
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // ─── Open modal: fetch full detail so all editable fields are populated ───

    const openView = async (u: UserRow) => {
        setEditing(u);
        setForm({
            firstName: u.firstName ?? '',
            lastName: u.lastName ?? '',
            phone: u.phone ?? '',
            whatsappEnabled: !!u.whatsappEnabled,
            preferredLanguage: u.preferredLanguage ?? 'en',
            preferredCurrency: u.preferredCurrency ?? 'INR',
        });
        setModalOpen(true);
        setDetailLoading(true);
        try {
            const detail = (await adminApi.users.get(u.id)) as UserRow;
            setEditing(detail);
            setForm({
                firstName: detail.firstName ?? '',
                lastName: detail.lastName ?? '',
                phone: detail.phone ?? '',
                whatsappEnabled: !!detail.whatsappEnabled,
                preferredLanguage: detail.preferredLanguage ?? 'en',
                preferredCurrency: detail.preferredCurrency ?? 'INR',
            });
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load user details.'
            );
        } finally {
            setDetailLoading(false);
        }
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditing(null);
    };

    // ─── Submit (PATCH /admin/users/:id) ───

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;

        // Send only updateUserSchema fields.
        const payload: Record<string, any> = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            whatsappEnabled: form.whatsappEnabled,
            preferredLanguage: form.preferredLanguage.trim() || 'en',
            preferredCurrency: form.preferredCurrency.trim() || 'INR',
        };
        const phone = form.phone.trim();
        if (phone) payload.phone = phone;

        setSaving(true);
        try {
            await adminApi.users.update(editing.id, payload);
            toast.success('User updated.');
            setModalOpen(false);
            setEditing(null);
            await loadUsers();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to update user.');
        } finally {
            setSaving(false);
        }
    };

    // ─── Columns ───

    const columns: DataTableColumn<UserRow>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (u) => (
                <span style={{ fontWeight: 600 }}>
                    {`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—'}
                </span>
            ),
        },
        { key: 'email', header: 'Email', render: (u) => u.email || '—' },
        { key: 'phone', header: 'Phone', render: (u) => u.phone || '—' },
        {
            key: 'preferredCurrency',
            header: 'Currency',
            render: (u) =>
                u.preferredCurrency ? (
                    <span className={styles.badge}>{u.preferredCurrency}</span>
                ) : (
                    '—'
                ),
        },
        {
            key: 'emailVerified',
            header: 'Verified',
            render: (u) =>
                u.emailVerified === undefined ? (
                    '—'
                ) : (
                    <span className={styles.badge}>{u.emailVerified ? 'Yes' : 'No'}</span>
                ),
        },
        {
            key: 'createdAt',
            header: 'Joined',
            render: (u) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Users"
                subtitle="View and edit registered customer accounts"
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    emptyMessage="No users yet."
                    renderActions={(u) => (
                        <button
                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                            onClick={() => openView(u)}
                        >
                            View
                        </button>
                    )}
                />
            </div>

            {/* Edit modal */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                title="Edit User"
                maxWidth={560}
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
                        <SaveButton form="user-form" loading={saving} disabled={detailLoading}>
                            Save Changes
                        </SaveButton>
                    </>
                }
            >
                <form id="user-form" onSubmit={handleSubmit}>
                    {/* Read-only identity fields */}
                    <FormRow>
                        <AdminLabel>Email</AdminLabel>
                        <input
                            className={styles.input}
                            value={editing?.email ?? ''}
                            readOnly
                            disabled
                        />
                    </FormRow>

                    <FormRow inline>
                        <AdminInput
                            label="First Name"
                            name="firstName"
                            wrapRow={false}
                            value={form.firstName}
                            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        />
                        <AdminInput
                            label="Last Name"
                            name="lastName"
                            wrapRow={false}
                            value={form.lastName}
                            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        />
                    </FormRow>

                    <AdminInput
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        placeholder="Optional"
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />

                    <FormRow inline>
                        <AdminInput
                            label="Preferred Language"
                            name="preferredLanguage"
                            wrapRow={false}
                            value={form.preferredLanguage}
                            placeholder="e.g. en"
                            onChange={(e) =>
                                setForm((f) => ({ ...f, preferredLanguage: e.target.value }))
                            }
                        />
                        <AdminInput
                            label="Preferred Currency"
                            name="preferredCurrency"
                            wrapRow={false}
                            value={form.preferredCurrency}
                            placeholder="e.g. INR"
                            onChange={(e) =>
                                setForm((f) => ({ ...f, preferredCurrency: e.target.value }))
                            }
                        />
                    </FormRow>

                    <AdminCheckbox
                        label="WhatsApp enabled"
                        name="whatsappEnabled"
                        checked={form.whatsappEnabled}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, whatsappEnabled: e.target.checked }))
                        }
                    />
                </form>
            </Modal>
        </div>
    );
}
