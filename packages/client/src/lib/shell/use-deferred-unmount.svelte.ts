/**
 * Deferred unmount rune for shell overlay wrappers.
 *
 * Keeps children mounted while the overlay is open and for a configurable
 * duration after close so the Konsta outro animation can complete, then
 * flips to false so the subtree unmounts.
 *
 * Under `prefers-reduced-motion: reduce`, the delay collapses to 0 because
 * shared.css forces `transition-duration: 0.01ms !important` globally and
 * a fixed delay would strand content alive for users who gain nothing from
 * the animation.
 *
 * Must be called during component initialization (top-level script).
 */

// Konsta overlay outro durations (Tailwind utility classes on their wrappers).
// Sheet, Popup, Dialog, Panel, Popover all use duration-400.
// Actions uses duration-300 on iOS and duration-400 on Material.

/** Default overlay outro duration matching Konsta's `duration-400`. */
export const OVERLAY_OUTRO_MS = 400;

/**
 * Konsta Actions uses `duration-300` on iOS and `duration-400` on Material.
 * Without theme access at the shell layer we use 400 (the longer value) so
 * the animation always finishes before unmount.
 */
export const ACTION_SHEET_OUTRO_MS = 400;

export interface DeferredUnmountOpts {
  readonly opened: boolean;
  readonly durationMs?: number;
}

export interface DeferredUnmountReturn {
  readonly current: boolean;
}

export function useDeferredUnmount(
  opts: DeferredUnmountOpts,
): DeferredUnmountReturn {
  let render = $state(opts.opened);

  $effect(() => {
    if (opts.opened) {
      render = true;
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const delay = reduced ? 0 : (opts.durationMs ?? OVERLAY_OUTRO_MS);
    const id = setTimeout(() => {
      render = false;
    }, delay);

    return () => {
      clearTimeout(id);
    };
  });

  return {
    get current(): boolean {
      return render;
    },
  };
}
