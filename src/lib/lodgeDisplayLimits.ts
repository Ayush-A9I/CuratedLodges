/** Max characters for the large hero quote in the Nature Blend section. */
export const LODGE_HERO_QUOTE_MAX = 250;

/** Max characters for teaser paragraphs beneath hero quotes. */
export const LODGE_TEASER_MAX = 300;

/** Max characters for conservation card snippets. */
export const LODGE_CONSERVATION_CARD_MAX = 200;

export function truncateForDisplay(text: string | undefined | null, max: number): string {
    if (!text) return '';
    if (text.length <= max) return text;
    return `${text.slice(0, max).trimEnd()}...`;
}

export function exceedsDisplayLimit(text: string | undefined | null, max: number): boolean {
    return Boolean(text && text.length > max);
}
