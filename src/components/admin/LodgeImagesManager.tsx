'use client';

import React, { useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    DataTable,
    DataTableColumn,
    Modal,
    ConfirmDialog,
    AdminInput,
    ImageUpload,
    SaveButton,
    useToast,
} from '@/components/admin';
import styles from '@/components/admin/admin.module.css';

export interface LodgeImageRecord {
    id: string;
    url: string;
    altText?: string | null;
    sortOrder: number;
}

interface Props {
    lodgeId: string;
    images: LodgeImageRecord[];
    onChanged: () => void;
}

export function LodgeImagesManager({ lodgeId, images, onChanged }: Props) {
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [sortOrder, setSortOrder] = useState('0');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<LodgeImageRecord | null>(null);
    const [deleting, setDeleting] = useState(false);

    const openAdd = () => {
        setUrl('');
        setAltText('');
        setSortOrder('0');
        setError(null);
        setOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) {
            setError('Image URL is required.');
            return;
        }
        setSaving(true);
        try {
            // addLodgeImages reads `req.body.images` (array).
            await adminApi.lodges.addImage(lodgeId, {
                images: [
                    {
                        url: url.trim(),
                        altText: altText.trim() || undefined,
                        sortOrder: Number.parseInt(sortOrder || '0', 10) || 0,
                    },
                ],
            });
            toast.success('Image added.');
            setOpen(false);
            onChanged();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to add image.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminApi.lodges.removeImage(lodgeId, deleteTarget.id);
            toast.success('Image deleted.');
            setDeleteTarget(null);
            onChanged();
        } catch (err) {
            toast.error(err instanceof AdminApiError ? err.message : 'Failed to delete image.');
        } finally {
            setDeleting(false);
        }
    };

    const columns: DataTableColumn<LodgeImageRecord>[] = [
        {
            key: 'url',
            header: 'Preview',
            width: '90px',
            render: (img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={img.url}
                    alt={img.altText || 'Lodge image'}
                    style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                />
            ),
        },
        {
            key: 'urlText',
            header: 'URL',
            render: (img) => (
                <span style={{ wordBreak: 'break-all', fontSize: 13 }}>{img.url}</span>
            ),
        },
        { key: 'altText', header: 'Alt text', render: (img) => img.altText || '—' },
        { key: 'sortOrder', header: 'Order', align: 'right' },
    ];

    return (
        <div className={styles.panel}>
            <div
                className={styles.panelHeader}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <span>Images</span>
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} onClick={openAdd}>
                    + Add image
                </button>
            </div>
            <DataTable
                columns={columns}
                rows={images}
                emptyMessage="No images yet."
                onDelete={(img) => setDeleteTarget(img)}
            />

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Add image"
                maxWidth={560}
                footer={
                    <>
                        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setOpen(false)} disabled={saving}>
                            Cancel
                        </button>
                        <SaveButton loading={saving} onClick={handleSubmit as any}>
                            Add
                        </SaveButton>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <ImageUpload
                        label="Image"
                        required
                        folder="lodges"
                        value={url}
                        error={error || undefined}
                        onChange={(next) => setUrl(next)}
                    />
                    <AdminInput
                        label="Alt text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                    />
                    <AdminInput
                        label="Sort order"
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    />
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete image"
                message="Delete this image? This cannot be undone."
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

export default LodgeImagesManager;
