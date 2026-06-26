import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
    'p',
    'h2',
    'h3',
    'h4',
    'strong',
    'em',
    'u',
    's',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'hr',
    'br',
    'img',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel'];

/** Strip unsafe HTML before storing or rendering field note bodies. */
export function sanitizeFieldNoteHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
    });
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Legacy plain paragraphs → HTML for the editor or display fallback. */
export function paragraphsToHtml(paragraphs: string[]): string {
    return paragraphs
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join('');
}

/** Pick the best HTML body from API data (prefers rich HTML, falls back to paragraphs). */
export function resolveFieldNoteBodyHtml(data: {
    bodyHtml?: string | null;
    content?: string[] | null;
}): string {
    const raw = (data.bodyHtml || '').trim();
    if (raw) return sanitizeFieldNoteHtml(raw);
    const paragraphs = Array.isArray(data.content) ? data.content : [];
    if (paragraphs.length === 0) return '';
    return sanitizeFieldNoteHtml(paragraphsToHtml(paragraphs));
}

/** Rough word count for read-time hints in admin. */
export function estimateReadMinutes(html: string): number {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 0;
    return Math.max(1, Math.ceil(words / 200));
}

/** Default read time label from HTML body. */
export function formatReadTime(html: string): string {
    return `${estimateReadMinutes(html)} min read`;
}

/** True when the editor/document has meaningful text. */
export function hasArticleBody(html: string): boolean {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 0;
}
