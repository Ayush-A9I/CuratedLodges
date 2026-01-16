import { Metadata } from 'next';
import { lodgesData } from '../../../../../data/mock/LodgeData';

// Helper function to create URL-friendly slugs
const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export async function generateMetadata({
  params,
}: {
  params: { region: string; park: string; lodge: string };
}): Promise<Metadata> {
  const { region, park, lodge } = params;
  const decodedPark = decodeURIComponent(park);
  const decodedLodge = decodeURIComponent(lodge);

  // Get lodge data
  const regionData = lodgesData[region as keyof typeof lodgesData];
  const parkData = regionData?.[decodedPark];
  const lodgeData = parkData?.lodges.find(
    (l) => createSlug(l.name) === decodedLodge
  );

  if (!lodgeData) {
    return {
      title: 'Lodge Not Found',
      description: 'The lodge you are looking for could not be found.',
    };
  }

  const title = `${lodgeData.name} - ${lodgeData.location}`;
  const description =
    lodgeData.about?.description?.[0] ||
    `Experience luxury and wildlife at ${lodgeData.name}`;
  const imageUrl = lodgeData.images?.[0] || lodgeData.image;

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
