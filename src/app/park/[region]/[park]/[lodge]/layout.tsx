import { Metadata } from 'next';
import { fetchLodgeBySlug } from '@/lib/lodgeServer';
import { resolveImageUrl } from '@/lib/fallbackImages';

export async function generateMetadata({
  params,
}: {
  params: { region: string; park: string; lodge: string };
}): Promise<Metadata> {
  const decodedLodge = decodeURIComponent(params.lodge);
  const lodgeData = await fetchLodgeBySlug(decodedLodge);

  if (!lodgeData) {
    return {
      title: 'Lodge - Curated Lodges',
      description: 'Discover premium wildlife safari lodges at Curated Lodges.',
    };
  }

  const title = `${lodgeData.name} - ${lodgeData.location || 'Curated Lodges'}`;
  const aboutDesc = lodgeData.about?.description;
  const description =
    (Array.isArray(aboutDesc) ? aboutDesc[0] : typeof aboutDesc === 'string' ? aboutDesc : undefined) ||
    `Experience luxury and wildlife at ${lodgeData.name}`;

  const imageUrl = resolveImageUrl(lodgeData.thumbnail, 'lodge');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: lodgeData.name,
        },
      ],
      siteName: 'Curated Lodges',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function LodgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
