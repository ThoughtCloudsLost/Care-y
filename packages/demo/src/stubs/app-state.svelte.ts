/**
 * Rune-backed stub for $app/state.
 *
 * Provides a reactive page object that the demo router drives via
 * setDemoPage(). The real $app/state is read by ticket routes for
 * page.params.id, page.url.searchParams, and page.state.ticketId.
 *
 * pushState/replaceState are no-ops (desktop-only paths; the demo's
 * layoutMode.isDesktop is always false). beforeNavigate/afterNavigate
 * are no-ops because firing afterNavigate would cause AppShell's
 * markNavigated() to make shellBack() call history.back(), navigating
 * the outer demo page away.
 */

import { SvelteURL } from "svelte/reactivity";

// -----------------------------------------------------------------------
// Reactive page state (driven by setDemoPage)
// -----------------------------------------------------------------------

const DEMO_ORIGIN = "http://demo.local";

// Instances are swapped wholesale, never mutated, so $state.raw provides
// exactly the reference-level reactivity needed; a fresh URL per
// navigation mirrors how SvelteKit replaces page.url.
let pageUrl = $state.raw(new SvelteURL("/tickets", DEMO_ORIGIN));
let pageParams = $state<Record<string, string>>({});

function deriveParams(url: URL): Record<string, string> {
  const match = /^\/tickets\/([^/]+)$/.exec(url.pathname);
  if (match?.[1] !== undefined) {
    return { id: match[1] };
  }
  return {};
}

/**
 * Set the current demo page. Called by the router when navigating.
 * Swaps page.url for a fresh URL and derives params from the pathname.
 */
export function setDemoPage(url: URL): void {
  pageUrl = new SvelteURL(url.pathname + url.search + url.hash, DEMO_ORIGIN);
  pageParams = deriveParams(url);
}

// -----------------------------------------------------------------------
// $app/state surface
// -----------------------------------------------------------------------

export const page: {
  readonly params: Record<string, string>;
  readonly url: URL;
  readonly route: { readonly id: string };
  readonly status: number;
  readonly error: unknown;
  readonly data: Record<string, unknown>;
  readonly form: unknown;
  readonly state: Record<string, unknown>;
} = {
  get params(): Record<string, string> {
    return pageParams;
  },
  get url(): URL {
    return pageUrl;
  },
  route: { id: "/(app)/tickets" },
  status: 200,
  error: null,
  data: {},
  form: null,
  get state(): Record<string, unknown> {
    return {};
  },
};

export const navigating = null;

export const updated = {
  current: false,
  check: async (): Promise<boolean> => Promise.resolve(false),
};
