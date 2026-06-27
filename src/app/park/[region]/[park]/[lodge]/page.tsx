import LodgeDetailClient from './LodgeDetailClient';
import { fetchLodgeBySlug } from '@/lib/lodgeServer';
import { resolveImageUrl } from '@/lib/fallbackImages';
import { readLodgeHeroFromContent, resolveLodgeHero } from '@/lib/lodgeHeroSection';

export default async function LodgePage({
  params,
}: {
  params: { region: string; park: string; lodge: string };
}) {
  const initialLodge = await fetchLodgeBySlug(params.lodge);
  const highlights =
    initialLodge?.jungloreStory?.highlights &&
    typeof initialLodge.jungloreStory.highlights === 'object' &&
    !Array.isArray(initialLodge.jungloreStory.highlights)
      ? initialLodge.jungloreStory.highlights
      : undefined;
  const hero = initialLodge
    ? resolveLodgeHero(
        readLodgeHeroFromContent(highlights),
        initialLodge.thumbnail || '',
        (url) => resolveImageUrl(url, 'lodge')
      )
    : null;
  const heroSrc = hero?.showImage ? hero.imageSrc : null;

  return (
    <>
      {heroSrc ? <link rel="preload" as="image" href={heroSrc} fetchPriority="high" /> : null}
      <LodgeDetailClient initialLodge={initialLodge} lodgeSlug={params.lodge} />
    </>
  );
}
