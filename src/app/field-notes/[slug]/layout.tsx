import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${API_BASE}/field-notes/${slug}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    const note = data.fieldNote || data;

    const title = note.title;
    const description = note.excerpt || (Array.isArray(note.content) ? note.content[0] : '') || `Read about ${note.title} from ${note.park}`;
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
  } catch {
    return {
      title: 'Field Note - Curated Lodges',
      description: 'Expert wildlife insights and safari stories from Curated Lodges.',
    };
  }
}

export default function FieldNoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
