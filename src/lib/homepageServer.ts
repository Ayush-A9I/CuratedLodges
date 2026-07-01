import { revalidateTag } from 'next/cache';
import type { HomepageResponse } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/** Request timeout in milliseconds. Keeps a slow backend from blocking SSR. */
const FETCH_TIMEOUT_MS = 3000;

/** Server-side homepage bundle for SSR (hero + founding collection, etc.).
 *
 * Data is cached at the Next.js Data Cache layer and revalidated in the
 * background every 300 s (ISR-style). A cold or unresponsive backend times out
 * after 3 s; in that case — and for any other fetch failure — the function
 * returns null so page.tsx can render with its existing fallback behaviour.
 */
export async function fetchHomepage(): Promise<HomepageResponse | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/homepage`, {
      next: { revalidate: 300, tags: ['homepage'] },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`fetchHomepage: non-OK response (${res.status} ${res.statusText})`);
      return null;
    }

    return (await res.json()) as HomepageResponse;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn(`fetchHomepage: timed out after ${FETCH_TIMEOUT_MS}ms`);
    } else {
      console.warn('fetchHomepage: fetch error —', err instanceof Error ? err.message : String(err));
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Forces an immediate revalidation of the homepage data cache.
 *
 * Call this server-side (e.g. from an admin mutation route or Server Action)
 * after any content edit that should be reflected on the homepage without
 * waiting for the 300 s background revalidation window.
 *
 * @example
 * // In an admin Server Action:
 * await updateHeroBanner(data);
 * await revalidateHomepage();
 */
export async function revalidateHomepage(): Promise<void> {
  revalidateTag('homepage');
}
