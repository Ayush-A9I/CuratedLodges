/**
 * Default Unsplash images when no upload has been provided yet.
 * Keep in sync with CuratedLodges_Backend/src/utils/fallbackImages.ts
 */

export const FALLBACK_IMAGES = {
  lodge: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  lodgeGallery: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200&q=80',
  room: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  naturalist: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  park: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&q=80',
  testimonial: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  fieldNote: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
  bankOffer: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
} as const;

export type FallbackImageKind = keyof typeof FALLBACK_IMAGES;

export function isNonEmptyImageUrl(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function resolveImageUrl(
  url: string | null | undefined,
  kind: FallbackImageKind
): string {
  return isNonEmptyImageUrl(url) ? url.trim() : FALLBACK_IMAGES[kind];
}
