import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { region: string; park: string; lodge: string };
}): Promise<Metadata> {
  const { lodge } = params;
  const decodedLodge = decodeURIComponent(lodge);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${API_BASE}/lodges/${decodedLodge}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    const lodgeData = data.lodge || data;

    const title = `${lodgeData.name} - ${lodgeData.location || 'Curated Lodges'}`;
    const description =
      (Array.isArray(lodgeData.about?.description) ? lodgeData.about.description[0] : lodgeData.about) ||
      `Experience luxury and wildlife at ${lodgeData.name}`;

    // Normalize image: could be string or {url, altText} object
    let imageUrl = lodgeData.thumbnail || '';
    if (lodgeData.images && lodgeData.images.length > 0) {
      const firstImg = lodgeData.images[0];
      imageUrl = typeof firstImg === 'object' ? firstImg.url : firstImg;
    }

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
  } catch {
    return {
      title: 'Lodge - Curated Lodges',
      description: 'Discover premium wildlife safari lodges at Curated Lodges.',
    };
  }
}

export default function LodgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
