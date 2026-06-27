'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  disableAutomaticScrollRestoration,
  resetPageScrollThoroughly,
} from '@/lib/scrollReset';

/**
 * Ensures every route change starts at the top unless the URL includes a hash
 * anchor (e.g. #gallery).
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    disableAutomaticScrollRestoration();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash) return;
    resetPageScrollThoroughly();
  }, [pathname]);

  return null;
}
