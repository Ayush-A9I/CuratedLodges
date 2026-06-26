'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import {
    estimateReadMinutes,
    hasArticleBody,
    sanitizeFieldNoteHtml,
} from '@/lib/fieldNoteContent';
import styles from './fieldNoteEditor.module.css';

export interface FieldNoteRichEditorProps {
    value: string;
    onChange: (html: string) => void;
    onReadTimeHint?: (minutes: number) => void;
    placeholder?: string;
}

function ToolButton({
    label,
    active,
    disabled,
    onClick,
}: {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={`${styles.toolBtn} ${active ? styles.toolBtnActive : ''}`.trim()}
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

export function FieldNoteRichEditor({
    value,
    onChange,
    onReadTimeHint,
    placeholder = 'Write your field note — headings, paragraphs, quotes, and images…',
}: FieldNoteRichEditorProps) {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const lastEmitted = useRef(value);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
            }),
            Image.configure({ inline: false, allowBase64: false }),
            Placeholder.configure({ placeholder }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: 'field-note-prosemirror',
            },
        },
        onUpdate: ({ editor: ed }) => {
            const html = sanitizeFieldNoteHtml(ed.getHTML());
            lastEmitted.current = html;
            onChange(html);
            onReadTimeHint?.(estimateReadMinutes(html));
        },
    });

    // Sync when parent loads existing note HTML (edit mode).
    useEffect(() => {
        if (!editor) return;
        const normalized = sanitizeFieldNoteHtml(value || '');
        if (normalized === lastEmitted.current) return;
        editor.commands.setContent(normalized || '<p></p>', { emitUpdate: false });
        lastEmitted.current = normalized;
    }, [editor, value]);

    const pickImage = useCallback(() => {
        setUploadError(null);
        fileRef.current?.click();
    }, []);

    const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !editor) return;

        setUploading(true);
        setUploadError(null);
        try {
            const uploaded = await adminApi.uploads.upload(file, 'field-notes');
            editor.chain().focus().setImage({ src: uploaded.publicUrl, alt: '' }).run();
        } catch (err) {
            setUploadError(err instanceof AdminApiError ? err.message : 'Image upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const setLink = () => {
        if (!editor) return;
        const previous = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Link URL', previous || 'https://');
        if (url === null) return;
        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    };

    if (!editor) {
        return <div className={styles.fieldNoteEditor}>Loading editor…</div>;
    }

    const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className={styles.fieldNoteEditor}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarGroup}>
                    <ToolButton
                        label="B"
                        active={editor.isActive('bold')}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    />
                    <ToolButton
                        label="I"
                        active={editor.isActive('italic')}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    />
                    <ToolButton
                        label="U"
                        active={editor.isActive('underline')}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    />
                </div>
                <div className={styles.toolbarGroup}>
                    <ToolButton
                        label="H2"
                        active={editor.isActive('heading', { level: 2 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    />
                    <ToolButton
                        label="H3"
                        active={editor.isActive('heading', { level: 3 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    />
                </div>
                <div className={styles.toolbarGroup}>
                    <ToolButton
                        label="• List"
                        active={editor.isActive('bulletList')}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    />
                    <ToolButton
                        label="1. List"
                        active={editor.isActive('orderedList')}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    />
                    <ToolButton
                        label="Quote"
                        active={editor.isActive('blockquote')}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    />
                </div>
                <div className={styles.toolbarGroup}>
                    <ToolButton label="Link" active={editor.isActive('link')} onClick={setLink} />
                    <ToolButton
                        label="Image"
                        disabled={uploading}
                        onClick={pickImage}
                    />
                    <ToolButton
                        label="—"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    />
                </div>
            </div>

            <div className={styles.editorSurface}>
                <EditorContent editor={editor} />
            </div>

            <div className={styles.footer}>
                <span>
                    {wordCount} words
                    {uploading ? <span className={styles.uploading}> · Uploading image…</span> : null}
                    {uploadError ? <span className={styles.error}> · {uploadError}</span> : null}
                </span>
                <span>{hasArticleBody(editor.getHTML()) ? `${estimateReadMinutes(editor.getHTML())} min read (est.)` : 'Start writing…'}</span>
            </div>

            <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                style={{ display: 'none' }}
                onChange={handleImageFile}
            />
        </div>
    );
}

export default FieldNoteRichEditor;
