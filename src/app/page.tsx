import HomeClient from './HomeClient';
import { fetchHomepage } from '@/lib/homepageServer';
import { resolveImageUrl } from '@/lib/fallbackImages';

export default async function HomePage() {
  const initialData = await fetchHomepage();
  const heroImageSrc = resolveImageUrl(initialData?.hero?.imageUrl, 'park');

  return (
    <>
      <link rel="preload" as="image" href={heroImageSrc} fetchPriority="high" />
      <HomeClient initialData={initialData} />
    </>
  );
}
