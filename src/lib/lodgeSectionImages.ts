import { resolveImageUrl } from '@/lib/fallbackImages';

/** Keys for lodge page narrative sections that can have their own hero image. */
export type SectionImageKey =
    | 'originStory'
    | 'natureBlend'
    | 'naturalistPhilosophy'
    | 'afterSafariVibe';

export type OriginStoryImageMode = 'same' | 'unique';

export interface SectionImageConfig {
    /** When true (default), the lodge thumbnail is used for this section. */
    useThumbnail?: boolean;
    /** Custom image URL when `useThumbnail` is false (Origin Story “same image” mode). */
    url?: string;
    /** Origin Story only: one image repeated vs four distinct images. */
    originImageMode?: OriginStoryImageMode;
    /** Origin Story only: up to four image URLs when `originImageMode` is `unique`. */
    gridUrls?: string[];
}

export type SectionImagesMap = Partial<Record<SectionImageKey, SectionImageConfig>>;

export const ORIGIN_STORY_GRID_SIZE = 4;

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

export function defaultOriginStoryImageConfig(): SectionImageConfig {
    return {
        useThumbnail: true,
        url: '',
        originImageMode: 'same',
        gridUrls: Array.from({ length: ORIGIN_STORY_GRID_SIZE }, () => ''),
    };
}

function normalizeGridUrls(raw: unknown): string[] {
    const urls = Array.isArray(raw)
        ? raw.map((item) => (typeof item === 'string' ? item : ''))
        : [];
    const padded = [...urls.slice(0, ORIGIN_STORY_GRID_SIZE)];
    while (padded.length < ORIGIN_STORY_GRID_SIZE) {
        padded.push('');
    }
    return padded;
}

function readOriginStoryConfig(item: unknown): SectionImageConfig {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return defaultOriginStoryImageConfig();
    }
    const cfg = item as SectionImageConfig;
    return {
        useThumbnail: cfg.useThumbnail !== false,
        url: typeof cfg.url === 'string' ? cfg.url : '',
        originImageMode: cfg.originImageMode === 'unique' ? 'unique' : 'same',
        gridUrls: normalizeGridUrls(cfg.gridUrls),
    };
}

export function readSectionImages(raw: unknown): SectionImagesMap {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const src = raw as Record<string, unknown>;
    const out: SectionImagesMap = {};
    for (const { key } of SECTION_IMAGE_FIELD_META) {
        const item = src[key];
        if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
        if (key === 'originStory') {
            out.originStory = readOriginStoryConfig(item);
            continue;
        }
        const cfg = item as SectionImageConfig;
        out[key] = {
            useThumbnail: cfg.useThumbnail !== false,
            url: typeof cfg.url === 'string' ? cfg.url : '',
        };
    }
    return out;
}

function serializeOriginStoryConfig(cfg: SectionImageConfig): SectionImageConfig | undefined {
    const mode = cfg.originImageMode === 'unique' ? 'unique' : 'same';

    if (mode === 'unique') {
        const gridUrls = normalizeGridUrls(cfg.gridUrls)
            .map((url) => url.trim())
            .filter(Boolean);
        if (gridUrls.length === 0) return undefined;
        return { originImageMode: 'unique', gridUrls };
    }

    const useThumbnail = cfg.useThumbnail !== false;
    const url = (cfg.url || '').trim();
    if (!useThumbnail) {
        return {
            originImageMode: 'same',
            useThumbnail: false,
            ...(url ? { url } : {}),
        };
    }

    return undefined;
}

/** Persist only non-default / in-progress custom entries. */
export function serializeSectionImages(draft: SectionImagesMap): SectionImagesMap | undefined {
    const out: SectionImagesMap = {};
    for (const { key } of SECTION_IMAGE_FIELD_META) {
        const cfg = draft[key];
        if (!cfg) continue;

        if (key === 'originStory') {
            const serialized = serializeOriginStoryConfig(cfg);
            if (serialized) out.originStory = serialized;
            continue;
        }

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
    thumbnail: string
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
    return resolveCustomOrThumbnail(key, sectionImages, thumbnail);
}

function repeatImage(src: string, alt: string, count = ORIGIN_STORY_GRID_SIZE): MediaItem[] {
    return Array.from({ length: count }, () => ({ src, alt }));
}

function resolveLegacyOriginGrid(
    thumbnail: string,
    galleryImages: MediaItem[],
    alt: string
): MediaItem[] {
    const thumbSrc = resolveImageUrl(thumbnail, 'lodge');

    if (galleryImages.length >= ORIGIN_STORY_GRID_SIZE) {
        return galleryImages.slice(0, ORIGIN_STORY_GRID_SIZE);
    }
    if (galleryImages.length > 0) {
        const grid = [...galleryImages];
        while (grid.length < ORIGIN_STORY_GRID_SIZE) {
            grid.push(grid[grid.length - 1] || { src: thumbSrc, alt });
        }
        return grid.slice(0, ORIGIN_STORY_GRID_SIZE);
    }
    return repeatImage(thumbSrc, alt);
}

/** Four images for the Origin Story grid. */
export function resolveOriginStoryGrid(
    sectionImages: SectionImagesMap | undefined,
    thumbnail: string,
    galleryImages: MediaItem[],
    alt: string
): MediaItem[] {
    const cfg = sectionImages?.originStory;
    const thumbSrc = resolveImageUrl(thumbnail, 'lodge');

    if (!cfg) {
        return resolveLegacyOriginGrid(thumbnail, galleryImages, alt);
    }

    const mode = cfg.originImageMode === 'unique' ? 'unique' : 'same';

    if (mode === 'unique') {
        const urls = normalizeGridUrls(cfg.gridUrls).map((url) => url.trim()).filter(Boolean);
        if (urls.length === 0) {
            return resolveLegacyOriginGrid(thumbnail, galleryImages, alt);
        }

        return Array.from({ length: ORIGIN_STORY_GRID_SIZE }, (_, index) => {
            const url = urls[index] || urls[urls.length - 1];
            return {
                src: resolveImageUrl(url, 'lodgeGallery'),
                alt,
            };
        });
    }

    if (cfg.useThumbnail === false && cfg.url?.trim()) {
        const src = resolveImageUrl(cfg.url.trim(), 'lodgeGallery');
        return repeatImage(src, alt);
    }

    return repeatImage(thumbSrc, alt);
}
