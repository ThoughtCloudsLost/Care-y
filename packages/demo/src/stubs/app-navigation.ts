/**
 * Stub for $app/navigation.
 *
 * All navigation functions are no-ops by default. The demo runs inside
 * a device frame with no real router, so navigations are handled by
 * the demo engine.
 *
 * T11's router registers a handler via registerDemoNavigationHandler()
 * so that goto() calls from real shell components (tab switches, sidebar
 * links) route through the demo's page switcher instead of being dropped.
 *
 * beforeNavigate/afterNavigate callbacks are stored in arrays and
 * fired by the router on every navigate/handleGoto call so that
 * AppShell's markNavigated + closeSearch logic runs correctly.
 *
 * pushState/replaceState update the demo page state via setDemoPageShallow
 * so that SvelteKit's shallow routing pattern works (page.state.ticketId,
 * ?user= deep links in the admin/people page).
 */

import { SvelteURL } from "svelte/reactivity";
import { page, setDemoPageShallow } from "./app-state.svelte.js";

// -----------------------------------------------------------------------
// Structural types matching SvelteKit's BeforeNavigate/AfterNavigate
// -----------------------------------------------------------------------

/** Minimal structural match for SvelteKit's Navigation.from / .to */
interface NavigationEndpoint {
  readonly url: URL;
  readonly params: Record<string, string>;
  readonly route: { id: string | null };
}

/** Structural match for BeforeNavigate (callback param of beforeNavigate). */
interface BeforeNavigateArg {
  readonly from: NavigationEndpoint | null;
  readonly to: NavigationEndpoint | null;
  readonly willUnload: boolean;
  readonly type: string;
  readonly complete: Promise<void>;
  cancel(): void;
}

/** Structural match for AfterNavigate (callback param of afterNavigate). */
interface AfterNavigateArg {
  readonly from: NavigationEndpoint | null;
  readonly to: NavigationEndpoint | null;
  readonly willUnload: boolean;
  readonly type: string;
  readonly complete: Promise<void>;
}

/** Structural match for OnNavigate (callback param of onNavigate). */
interface OnNavigateArg {
  readonly from: NavigationEndpoint | null;
  readonly to: NavigationEndpoint;
  readonly willUnload: boolean;
  readonly type: string;
  readonly complete: Promise<void>;
}

// -----------------------------------------------------------------------
// Navigation handler registration (contract for T11's router)
// -----------------------------------------------------------------------

/** Handler called when a shell component triggers goto(). */
export type DemoNavigationHandler = (href: string) => void;

let handler: DemoNavigationHandler | null = null;

/**
 * Register a handler that intercepts goto() calls from real shell
 * components. Only one handler can be active at a time; registering
 * a new one replaces any existing handler.
 */
export function registerDemoNavigationHandler(fn: DemoNavigationHandler): void {
  handler = fn;
}

/**
 * Remove a previously registered navigation handler. Only removes
 * the handler if it matches the provided function reference, so a
 * stale unregister cannot remove a newer handler.
 */
export function unregisterDemoNavigationHandler(
  fn: DemoNavigationHandler,
): void {
  if (handler === fn) handler = null;
}

// -----------------------------------------------------------------------
// Lifecycle callback arrays
// -----------------------------------------------------------------------

type BeforeNavigateCb = (nav: BeforeNavigateArg) => void;
type AfterNavigateCb = (nav: AfterNavigateArg) => void;

let beforeCallbacks: BeforeNavigateCb[] = [];
let afterCallbacks: AfterNavigateCb[] = [];

/**
 * Fire all registered beforeNavigate callbacks. Called by the router
 * on every navigation event.
 */
export function fireBeforeNavigate(arg: BeforeNavigateArg): void {
  for (const cb of beforeCallbacks) {
    cb(arg);
  }
}

/**
 * Fire all registered afterNavigate callbacks. Called by the router
 * on every navigation event.
 */
export function fireAfterNavigate(arg: AfterNavigateArg): void {
  for (const cb of afterCallbacks) {
    cb(arg);
  }
}

/**
 * Reset all lifecycle callback arrays. For testing.
 */
export function resetLifecycleCallbacks(): void {
  beforeCallbacks = [];
  afterCallbacks = [];
}

// -----------------------------------------------------------------------
// URL resolution helper
// -----------------------------------------------------------------------

/**
 * Resolve a URL argument (string) against the current page URL.
 * SvelteKit allows empty strings and relative paths in pushState/
 * replaceState; this helper normalizes them to absolute URLs.
 */
function resolveUrl(url: string): URL {
  if (url === "") {
    // Empty string means "current URL" in SvelteKit
    return new URL(page.url.href);
  }
  // Relative paths resolve against the current page URL
  return new SvelteURL(url, page.url.href);
}

// -----------------------------------------------------------------------
// $app/navigation API surface
// -----------------------------------------------------------------------

export async function goto(
  url: string,
  _opts?: Record<string, unknown>,
): Promise<void> {
  await Promise.resolve();
  if (handler !== null) {
    handler(url);
    return;
  }
  // No handler registered: swallow the navigation silently.
  // This matches the previous no-op behavior before the handler seam.
}

export function onNavigate(
  _cb: (nav: OnNavigateArg) => void | Promise<void>,
): void {
  // No-op
}

export function beforeNavigate(cb: (nav: BeforeNavigateArg) => void): void {
  beforeCallbacks.push(cb);
}

export function afterNavigate(cb: (nav: AfterNavigateArg) => void): void {
  afterCallbacks.push(cb);
}

export async function invalidateAll(): Promise<void> {
  await Promise.resolve();
}

export function disableScrollHandling(): void {
  // No-op
}

export function pushState(url: string, state: Record<string, unknown>): void {
  const resolved = resolveUrl(url);
  // Idempotency guard: if href and state are unchanged, skip the update.
  // This prevents the known ?user= effect loop where replaceState
  // re-triggers the deriving effect.
  if (resolved.href === page.url.href && shallowEqual(state, page.state)) {
    return;
  }
  setDemoPageShallow(resolved, state);
}

export function replaceState(
  url: string,
  state: Record<string, unknown>,
): void {
  const resolved = resolveUrl(url);
  // Same idempotency guard as pushState
  if (resolved.href === page.url.href && shallowEqual(state, page.state)) {
    return;
  }
  setDemoPageShallow(resolved, state);
}

export function preloadData(_url: string): void {
  // No-op
}

export function preloadCode(_url: string): void {
  // No-op
}

// -----------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------

/**
 * Shallow equality check for state objects. Compares own enumerable
 * keys and values with strict equality. Sufficient for the page.state
 * objects SvelteKit uses (flat key-value maps).
 */
function shallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    // eslint-disable-next-line security/detect-object-injection -- iterating own keys
    if (a[key] !== b[key]) return false;
  }
  return true;
}
