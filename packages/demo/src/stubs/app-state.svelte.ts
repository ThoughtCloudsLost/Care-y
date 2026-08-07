/**
 * Rune-backed stub for $app/state.
 *
 * Provides a reactive page object that RouteMount (post-login) and
 * the router (login state) drive via setDemoPage(). The real $app/state
 * is read by ticket routes for page.params.id, page.url.searchParams,
 * and page.state.ticketId. The admin/people page reads page.url
 * searchParams for ?user= deep links and uses replaceState to update
 * the URL shallowly.
 *
 * RouteMount owns page-state post-login: it has the manifest match
 * with real params and routeId. The router only calls setDemoPage for
 * the login URL (reset).
 *
 * page.state is reactive: pushState/replaceState in app-navigation.ts
 * update it through setDemoPageState, and SvelteKit's shallow routing
 * pattern (page.state.ticketId, ?user= deep links) works correctly.
 */

import { DEMO_ORIGIN } from "../lib/demo-origin.js";
import { parseUrl } from "../lib/non-reactive.js";

// -----------------------------------------------------------------------
// Reactive page state (driven by setDemoPage)
// -----------------------------------------------------------------------

// Instances are swapped wholesale, never mutated, so $state.raw provides
// exactly the reference-level reactivity needed; a fresh URL per
// navigation mirrors how SvelteKit replaces page.url.
let pageUrl = $state.raw(parseUrl("/tickets", DEMO_ORIGIN));
let pageParams = $state<Record<string, string>>({});
let pageRouteId = $state<string>("/(app)/tickets");
let pageState = $state<Record<string, unknown>>({});

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
  pageUrl = parseUrl(
    update.url.pathname + update.url.search + update.url.hash,
    DEMO_ORIGIN,
  );
  pageParams = update.params;
  pageRouteId = update.routeId;
  // SvelteKit clears page.state on full navigations (only pushState/
  // replaceState set it); setDemoPage is a full navigation equivalent.
  pageState = {};
}

/**
 * Update page.url and page.state for shallow routing (pushState/
 * replaceState). Keeps the current routeId and params (SvelteKit's
 * shallow routing preserves the route; only URL and state change).
 */
export function setDemoPageShallow(
  url: URL,
  state: Record<string, unknown>,
): void {
  pageUrl = parseUrl(url.pathname + url.search + url.hash, DEMO_ORIGIN);
  pageState = state;
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
    return pageState;
  },
};

export const navigating = null;

export const updated = {
  current: false,
  check: async (): Promise<boolean> => Promise.resolve(false),
};
