'use client';

import React, { useMemo } from 'react';
import { resolveFieldNoteBodyHtml } from '@/lib/fieldNoteContent';
import styles from './articleBody.module.css';

export interface ArticleBodyProps {
    bodyHtml?: string | null;
    content?: string[] | null;
    className?: string;
}

/**
 * Renders sanitized field-note article HTML with editorial typography.
 */
export function ArticleBody({ bodyHtml, content, className }: ArticleBodyProps) {
    const html = useMemo(
        () => resolveFieldNoteBodyHtml({ bodyHtml, content }),
        [bodyHtml, content]
    );

    if (!html) return null;

    return (
        <div
            className={[styles.articleBody, className].filter(Boolean).join(' ')}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export default ArticleBody;
