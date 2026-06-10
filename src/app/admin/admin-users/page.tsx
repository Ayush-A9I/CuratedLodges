'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import {
    PageHeader,
    DataTable,
    DataTableColumn,
    Modal,
    ConfirmDialog,
    AdminInput,
    AdminSelect,
    AdminCheckbox,
    SaveButton,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

/** An admin user row as returned by `GET /admin/admin-users`. */
interface AdminUserRow {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt?: string;
    lastLoginAt?: string | null;
}

interface AdminUserForm {
    email: string;
    password: string;
    name: string;
    role: string;
    isActive: boolean;
}

const ROLE_OPTIONS = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
];

const emptyForm: AdminUserForm = {
    email: '',
    password: '',
    name: '',
    role: 'editor',
    isActive: true,
};

const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : '—';

export default function AdminUsersPage() {
    const toast = useToast();
    const { admin } = useAdminAuth();
    const isSuperAdmin = admin?.role === 'super_admin';

    const [rows, setRows] = useState<AdminUserRow[]>([]);
    const [loading, setLoading] = useState(true);

    // Create / edit modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<AdminUserRow | null>(null);
    const [form, setForm] = useState<AdminUserForm>(emptyForm);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Delete confirmation
    const [deleting, setDeleting] = useState<AdminUserRow | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.adminUsers.list();
            // Backend returns { admins: [...] }; tolerate { adminUsers } too.
            const list: AdminUserRow[] =
                (data as any)?.admins ??
                (data as any)?.adminUsers ??
                (Array.isArray(data) ? data : []);
            setRows(list);
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to load admin users.'
            );
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        // Only fetch when authorized; the endpoint is super_admin-only.
        if (isSuperAdmin) {
            load();
        } else {
            setLoading(false);
        }
    }, [isSuperAdmin, load]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormError(null);
        setModalOpen(true);
    };

    const openEdit = (row: AdminUserRow) => {
        setEditing(row);
        setForm({
            email: row.email ?? '',
            password: '',
            name: row.name ?? '',
            role: row.role ?? 'editor',
            isActive: row.isActive ?? true,
        });
        setFormError(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const email = form.email.trim();
        const name = form.name.trim();
        const password = form.password;

        if (!email) {
            setFormError('Email is required.');
            return;
        }
        if (!name) {
            setFormError('Name is required.');
            return;
        }
        // Password is required on create, optional on edit.
        if (!editing && password.length < 8) {
            setFormError('Password must be at least 8 characters.');
            return;
        }
        if (editing && password && password.length < 8) {
            setFormError('Password must be at least 8 characters.');
            return;
        }

        setFormError(null);
        setSaving(true);

        try {
            if (editing) {
                // On edit: only send password when provided.
                const payload: Record<string, any> = {
                    email,
                    name,
                    role: form.role,
                    isActive: form.isActive,
                };
                if (password) payload.password = password;
                await adminApi.adminUsers.update(editing.id, payload);
                toast.success('Admin user updated.');
            } else {
                // On create: createAdminUserSchema → { email, password, name, role }.
                await adminApi.adminUsers.create({
                    email,
                    password,
                    name,
                    role: form.role,
                });
                toast.success('Admin user created.');
            }
            setModalOpen(false);
            await load();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to save admin user.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        setDeleteLoading(true);
        try {
            await adminApi.adminUsers.remove(deleting.id);
            toast.success('Admin user deleted.');
            setDeleting(null);
            await load();
        } catch (err) {
            toast.error(
                err instanceof AdminApiError ? err.message : 'Failed to delete admin user.'
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns: DataTableColumn<AdminUserRow>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (u) => <span style={{ fontWeight: 600 }}>{u.name || '—'}</span>,
        },
        { key: 'email', header: 'Email', render: (u) => u.email || '—' },
        {
            key: 'role',
            header: 'Role',
            render: (u) => <span className={styles.badge}>{u.role}</span>,
        },
        {
            key: 'isActive',
            header: 'Active',
            render: (u) => (
                <span className={styles.badge}>{u.isActive ? 'Active' : 'Inactive'}</span>
            ),
        },
        {
            key: 'lastLoginAt',
            header: 'Last Login',
            render: (u) => formatDateTime(u.lastLoginAt),
        },
    ];

    // Access gate: the API requires super_admin and would 403 otherwise.
    if (!isSuperAdmin) {
        return (
            <div>
                <PageHeader title="Admin Users" subtitle="Manage admin panel accounts" />
                <div className={styles.panel}>
                    <div className={styles.tableState}>
                        Access denied. Only super admins can manage admin users.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Admin Users"
                subtitle="Manage admin panel accounts"
                actionLabel="Add Admin User"
                onAction={openCreate}
            />

            <div className={styles.panel}>
                <DataTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    emptyMessage="No admin users yet. Add your first admin user to get started."
                    rowKey={(u) => u.id}
                    onEdit={openEdit}
                    onDelete={(u) => setDeleting(u)}
                />
            </div>

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Admin User' : 'Add Admin User'}
            >
                <form onSubmit={handleSubmit} id="admin-user-form">
                    <AdminInput
                        label="Name"
                        name="name"
                        required
                        value={form.name}
                        placeholder="e.g. Jane Doe"
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    <AdminInput
                        label="Email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        placeholder="admin@example.com"
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                    <AdminInput
                        label={editing ? 'Password' : 'Password'}
                        name="password"
                        type="password"
                        required={!editing}
                        value={form.password}
                        placeholder={
                            editing
                                ? 'Leave blank to keep current password'
                                : 'At least 8 characters'
                        }
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    />
                    <AdminSelect
                        label="Role"
                        name="role"
                        required
                        value={form.role}
                        options={ROLE_OPTIONS}
                        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    />
                    {editing && (
                        <AdminCheckbox
                            label="Active"
                            name="isActive"
                            checked={form.isActive}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, isActive: e.target.checked }))
                            }
                        />
                    )}
                    {formError && <div className={styles.fieldError}>{formError}</div>}
                    <div className={styles.modalFooter} style={{ paddingRight: 0 }}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={closeModal}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <SaveButton loading={saving}>
                            {editing ? 'Save Changes' : 'Create Admin User'}
                        </SaveButton>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleting}
                title="Delete Admin User"
                message={
                    <>
                        Are you sure you want to delete{' '}
                        <strong>{deleting?.name || deleting?.email}</strong>? This action
                        cannot be undone.
                    </>
                }
                confirmLabel="Delete"
                loading={deleteLoading}
                onConfirm={handleDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}
