import type { HomepageResponse } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/** Server-side homepage bundle for SSR (hero + founding collection, etc.). */
export async function fetchHomepage(): Promise<HomepageResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/homepage`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as HomepageResponse;
  } catch {
    return null;
  }
}
