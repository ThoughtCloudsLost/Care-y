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
 */

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

export function beforeNavigate(_cb: (nav: BeforeNavigateArg) => void): void {
  // No-op
}

export function afterNavigate(_cb: (nav: AfterNavigateArg) => void): void {
  // No-op
}

export async function invalidateAll(): Promise<void> {
  await Promise.resolve();
}

export function disableScrollHandling(): void {
  // No-op
}

export function pushState(_url: string, _state: Record<string, unknown>): void {
  // No-op
}

export function replaceState(
  _url: string,
  _state: Record<string, unknown>,
): void {
  // No-op
}

export function preloadData(_url: string): void {
  // No-op
}

export function preloadCode(_url: string): void {
  // No-op
}
