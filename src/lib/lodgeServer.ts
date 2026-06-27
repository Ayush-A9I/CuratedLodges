import type { LodgeDetail } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/** Server-side lodge fetch for SSR (metadata, lodge page initial paint). */
export async function fetchLodgeBySlug(slug: string): Promise<LodgeDetail | null> {
  const decoded = decodeURIComponent(slug);
  try {
    const res = await fetch(`${API_BASE}/lodges/${encodeURIComponent(decoded)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.lodge || data) as LodgeDetail;
  } catch {
    return null;
  }
}
