/**
 * Rune-backed stub for $app/state.
 *
 * Provides a reactive page object that RouteMount (post-login) and
 * the router (login state) drive via setDemoPage(). The real $app/state
 * is read by ticket routes for page.params.id, page.url.searchParams,
 * and page.state.ticketId.
 *
 * RouteMount owns page-state post-login: it has the manifest match
 * with real params and routeId. The router only calls setDemoPage for
 * the login URL (reset). pushState/replaceState are no-ops (desktop-only
 * paths; the demo's layoutMode.isDesktop is always false).
 * beforeNavigate/afterNavigate are no-ops because firing afterNavigate
 * would cause AppShell's markNavigated() to make shellBack() call
 * history.back(), navigating the outer demo page away.
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
let pageRouteId = $state<string>("/(app)/tickets");

export interface DemoPageUpdate {
  readonly url: URL;
  readonly params: Record<string, string>;
  readonly routeId: string;
}

/**
 * Set the current demo page. Called by RouteMount when its manifest
 * match changes (post-login), or by the router for login state.
 * Swaps page.url for a fresh URL and applies the provided params
 * and routeId from the manifest match.
 */
export function setDemoPage(update: DemoPageUpdate): void {
  pageUrl = new SvelteURL(
    update.url.pathname + update.url.search + update.url.hash,
    DEMO_ORIGIN,
  );
  pageParams = update.params;
  pageRouteId = update.routeId;
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
  get route(): { readonly id: string } {
    return { id: pageRouteId };
  },
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
