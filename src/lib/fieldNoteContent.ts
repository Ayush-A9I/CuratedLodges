import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: [
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
    ],
    allowedAttributes: {
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
};

/** Strip unsafe HTML before storing or rendering field note bodies. */
export function sanitizeFieldNoteHtml(html: string): string {
    return sanitizeHtml(html, SANITIZE_OPTIONS);
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

/** True when a string looks like HTML from the rich editor. */
export function looksLikeHtml(text: string): boolean {
    return /<\/?[a-z][^>]*>/i.test(text.trim());
}

/** Pick the best HTML body from API data (prefers rich HTML, falls back to paragraphs). */
export function resolveFieldNoteBodyHtml(data: {
    bodyHtml?: string | null;
    content?: string[] | null;
}): string {
    const raw = (data.bodyHtml || '').trim();
    if (raw) return sanitizeFieldNoteHtml(raw);

    const items = Array.isArray(data.content)
        ? data.content.map((p) => (typeof p === 'string' ? p.trim() : '')).filter(Boolean)
        : [];
    if (items.length === 0) return '';

    // Rich article stored as a single HTML blob in content[0] (production compat).
    if (items.length === 1 && looksLikeHtml(items[0])) {
        return sanitizeFieldNoteHtml(items[0]);
    }
    if (items.length > 1 && items.every(looksLikeHtml)) {
        return sanitizeFieldNoteHtml(items.join(''));
    }

    return sanitizeFieldNoteHtml(paragraphsToHtml(items));
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
