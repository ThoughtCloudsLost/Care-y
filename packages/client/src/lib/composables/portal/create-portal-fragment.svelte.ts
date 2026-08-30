/**
 * Composable: fragment parse lifecycle for the Secure Link portal page.
 *
 * Handles the async sodium init, one-shot parse of location.hash,
 * and exposes state + seams for the page to wire navigation (strip).
 *
 * When the page loads without a fragment (or after the fragment was
 * stripped), a hashchange event carrying a new non-empty hash resets
 * the composable and re-runs the parse path. This lets a client
 * re-paste a link into the address bar after a locale switch or
 * other non-reloading navigation that previously left the page dead.
 */

import { getSodium } from "@care-y/crypto";
import { parseFragment } from "$lib/portal/portal-crypto.js";

export interface FragmentData {
  readonly seed: Uint8Array;
  readonly auth: Uint8Array;
  readonly channelId: string;
}

export interface PortalFragmentState {
  /** Whether the URL has a non-empty hash. Synchronous, no sodium needed. */
  readonly hashPresent: boolean;
  /** Whether the fragment parse has completed (success or failure). */
  readonly fragmentResolved: boolean;
  /** Parsed fragment data, or null if absent/malformed. */
  readonly fragmentData: FragmentData | null;
  /** Convenience: both resolved and data present. */
  readonly hasValidFragment: boolean;
  /** Whether the fragment has been stripped from the address bar. */
  readonly fragmentStripped: boolean;
  /** Signal that the router is ready (call from afterNavigate). */
  markRouterReady(): void;
  /** The path to replaceState to (strips the fragment). Null when not ready. */
  readonly strippablePath: string | null;
  /** Mark the strip as done (call after replaceState). */
  markStripped(): void;
}

/**
 * Create portal fragment state.
 *
 * @param isBrowser - whether we are in a browser environment
 * @param readHash - function returning location.hash (injected for testability)
 */
export function createPortalFragment(
  isBrowser: boolean,
  readHash: () => string,
  routeChannelId: () => string,
): PortalFragmentState {
  let hashPresent = $state(
    isBrowser ? Boolean(readHash() && readHash() !== "#") : false,
  );

  let fragmentData = $state<FragmentData | null>(null);
  let fragmentResolved = $state(false);
  let routerReady = $state(false);
  let stripped = $state(false);

  // One-shot async init: await sodium, then parse the fragment
  let initStarted = false;
  $effect(() => {
    if (!isBrowser || !hashPresent || initStarted) return;
    initStarted = true;

    void (async () => {
      await getSodium();
      fragmentData = parseFragment(readHash());
      fragmentResolved = true;
    })();
  });

  // No hash at all: resolve immediately so the missing-info state shows
  $effect(() => {
    if (!isBrowser || hashPresent || fragmentResolved) return;
    fragmentResolved = true;
  });

  // Recovery: when a new non-empty hash arrives after the composable
  // resolved with no valid fragment, reset and re-run the parse path.
  // Our own strip never sets a hash (it replaces with a bare path),
  // so empty-to-non-empty is unambiguous and cannot be our strip.
  $effect(() => {
    if (!isBrowser) return;

    function onHashChange(): void {
      const raw = readHash();
      const hasHash = Boolean(raw && raw !== "#");
      if (!hasHash) return;

      // Only recover when we previously resolved with no valid data
      if (fragmentData !== null) return;

      // Reset internal state and re-run
      initStarted = false;
      fragmentResolved = false;
      stripped = false;
      hashPresent = true;
    }

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  });

  const hasValidFragment = $derived(fragmentResolved && fragmentData !== null);

  // Strip readiness: both router ready and valid fragment, not yet stripped
  const strippablePath = $derived.by((): string | null => {
    if (!routerReady || !hasValidFragment || stripped) return null;
    return `/portal/${routeChannelId()}`;
  });

  return {
    get hashPresent(): boolean {
      return hashPresent;
    },
    get fragmentResolved(): boolean {
      return fragmentResolved;
    },
    get fragmentData(): FragmentData | null {
      return fragmentData;
    },
    get hasValidFragment(): boolean {
      return hasValidFragment;
    },
    get fragmentStripped(): boolean {
      return stripped;
    },
    markRouterReady(): void {
      routerReady = true;
    },
    get strippablePath(): string | null {
      return strippablePath;
    },
    markStripped(): void {
      stripped = true;
    },
  };
}
