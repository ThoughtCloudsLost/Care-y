/**
 * Engine prewarm latch: triggers the phone iframe mount (and with it
 * the PGlite engine boot) when the first clip nears the viewport, so
 * the 2.3 to 2.5 s cold boot spends itself against reading time.
 *
 * One IntersectionObserver watches every observed element with a
 * generous rootMargin. The first intersection flips `warm` true and
 * disconnects the observer permanently. Multiple observed elements are
 * fine; any of them can trip the latch.
 *
 * When IntersectionObserver is unavailable (jsdom), the latch fires
 * immediately: a prewarm that silently never fires would hold the
 * iframe unmounted forever, which is the expensive failure mode.
 */

import { SvelteSet } from "svelte/reactivity";

/** Roughly one viewport of lead distance for the observer trigger. */
export const PREWARM_ROOT_MARGIN = "100%";

export interface EnginePrewarm {
  /** True once any observed element has approached the viewport. */
  readonly warm: boolean;
  /** Attach an element for the observer to watch. Safe to call with undefined. */
  observe(el: HTMLElement | undefined): void;
  /** Tear down the observer. Idempotent. */
  destroy(): void;
}

export function createEnginePrewarm(): EnginePrewarm {
  let warm = $state(false);
  let observer: IntersectionObserver | null = null;
  let destroyed = false;

  // Track observed elements so destroy() can clean up, and so
  // re-calling observe(undefined) for a previously-observed element
  // unobserves it.
  const observed = new SvelteSet<HTMLElement>();

  // IntersectionObserver is absent in jsdom. Latch immediately rather
  // than never: a prewarm that never fires is worse than one that
  // fires eagerly.
  if (typeof IntersectionObserver === "undefined") {
    warm = true;
  } else {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            warm = true;
            observer?.disconnect();
            observer = null;
            observed.clear();
            return;
          }
        }
      },
      { rootMargin: PREWARM_ROOT_MARGIN },
    );
  }

  function observe(el: HTMLElement | undefined): void {
    if (destroyed || warm) return;

    if (el === undefined) return;
    if (observer === null) return;
    if (observed.has(el)) return;

    observed.add(el);
    observer.observe(el);
  }

  function destroy(): void {
    if (destroyed) return;
    destroyed = true;
    observer?.disconnect();
    observer = null;
    observed.clear();
  }

  return {
    get warm(): boolean {
      return warm;
    },
    observe,
    destroy,
  };
}
