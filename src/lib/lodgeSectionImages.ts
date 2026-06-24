import { resolveImageUrl } from '@/lib/fallbackImages';

/** Keys for lodge page narrative sections that can have their own hero image. */
export type SectionImageKey =
    | 'originStory'
    | 'natureBlend'
    | 'naturalistPhilosophy'
    | 'afterSafariVibe';

export interface SectionImageConfig {
    /** When true (default), the lodge thumbnail is used for this section. */
    useThumbnail?: boolean;
    /** Custom image URL when `useThumbnail` is false. */
    url?: string;
}

export type SectionImagesMap = Partial<Record<SectionImageKey, SectionImageConfig>>;

export const SECTION_IMAGE_FIELD_META: Array<{
    key: SectionImageKey;
    label: string;
    publicLabel: string;
}> = [
    { key: 'originStory', label: 'Origin Story', publicLabel: 'The Origin Story' },
    { key: 'natureBlend', label: 'Blurring the Lines', publicLabel: 'Blurring the Lines' },
    { key: 'naturalistPhilosophy', label: 'The Philosophy', publicLabel: 'The Philosophy' },
    {
        key: 'afterSafariVibe',
        label: 'The After-Safari Rhythm',
        publicLabel: 'The Evenings',
    },
];

export function defaultSectionImageConfig(): SectionImageConfig {
    return { useThumbnail: true, url: '' };
}

export function readSectionImages(raw: unknown): SectionImagesMap {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const src = raw as Record<string, unknown>;
    const out: SectionImagesMap = {};
    for (const { key } of SECTION_IMAGE_FIELD_META) {
        const item = src[key];
        if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
        const cfg = item as SectionImageConfig;
        out[key] = {
            useThumbnail: cfg.useThumbnail !== false,
            url: typeof cfg.url === 'string' ? cfg.url : '',
        };
    }
    return out;
}

/** Persist only non-default / in-progress custom entries. */
export function serializeSectionImages(draft: SectionImagesMap): SectionImagesMap | undefined {
    const out: SectionImagesMap = {};
    for (const { key } of SECTION_IMAGE_FIELD_META) {
        const cfg = draft[key];
        if (!cfg) continue;
        const useThumbnail = cfg.useThumbnail !== false;
        const url = (cfg.url || '').trim();
        if (!useThumbnail) {
            out[key] = { useThumbnail: false, ...(url ? { url } : {}) };
        }
    }
    return Object.keys(out).length > 0 ? out : undefined;
}

export function usesLodgeThumbnail(key: SectionImageKey, map: SectionImagesMap): boolean {
    return map[key]?.useThumbnail !== false;
}

type MediaItem = { src: string; alt: string };

function resolveCustomOrThumbnail(
    key: SectionImageKey,
    sectionImages: SectionImagesMap | undefined,
    thumbnail: string,
    alt: string
): string {
    const cfg = sectionImages?.[key];
    if (cfg && cfg.useThumbnail === false && cfg.url?.trim()) {
        return resolveImageUrl(cfg.url.trim(), 'lodgeGallery');
    }
    return resolveImageUrl(thumbnail, 'lodge');
}

/** Single hero image for a narrative section. */
export function resolveSectionHeroSrc(
    key: SectionImageKey,
    sectionImages: SectionImagesMap | undefined,
    thumbnail: string
): string {
    return resolveCustomOrThumbnail(key, sectionImages, thumbnail, '');
}

/** Four images for the Origin Story grid. */
export function resolveOriginStoryGrid(
    sectionImages: SectionImagesMap | undefined,
    thumbnail: string,
    galleryImages: MediaItem[],
    alt: string
): MediaItem[] {
    const cfg = sectionImages?.originStory;
    if (cfg && cfg.useThumbnail === false && cfg.url?.trim()) {
        const src = resolveImageUrl(cfg.url.trim(), 'lodgeGallery');
        return Array.from({ length: 4 }, () => ({ src, alt }));
    }

    const thumbSrc = resolveImageUrl(thumbnail, 'lodge');
    if (galleryImages.length >= 4) {
        return galleryImages.slice(0, 4);
    }
    if (galleryImages.length > 0) {
        const grid = [...galleryImages];
        while (grid.length < 4) {
            grid.push(grid[grid.length - 1] || { src: thumbSrc, alt });
        }
        return grid.slice(0, 4);
    }
    return Array.from({ length: 4 }, () => ({ src: thumbSrc, alt }));
}
