import { Metadata } from 'next';
import { fieldNotesData } from '@/data/mock/FieldNotesData';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  
  // Find the field note by slug
  const note = fieldNotesData.find(n => n.slug === slug);

  if (!note) {
    return {
      title: 'Article Not Found',
      description: 'The field note you are looking for could not be found.',
    };
  }

  const title = note.title;
  const description = note.excerpt || note.content[0] || `Read about ${note.title} from ${note.park}`;
  const imageUrl = note.image;
  const url = `https://curated-lodges.vercel.app/field-notes/${slug}`;

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
          alt: note.title,
        },
      ],
      url,
      siteName: 'Curated Lodges',
      type: 'article',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function FieldNoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
