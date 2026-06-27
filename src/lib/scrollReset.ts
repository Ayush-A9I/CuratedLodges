/** Force the viewport back to the top (instant, not smooth). */
export function resetPageScroll(): void {
  if (typeof window === 'undefined') return;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Run scroll reset across paint frames to beat late layout/focus shifts. */
export function resetPageScrollThoroughly(): void {
  resetPageScroll();
  if (typeof window === 'undefined') return;
  requestAnimationFrame(() => {
    resetPageScroll();
    requestAnimationFrame(resetPageScroll);
  });
}

export function disableAutomaticScrollRestoration(): void {
  if (typeof window === 'undefined') return;
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
}
