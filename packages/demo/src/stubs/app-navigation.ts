/**
 * Stub for $app/navigation.
 *
 * All navigation functions are no-ops. The demo runs inside a
 * device frame with no real router, so navigations are scripted
 * by the demo engine rather than triggered by SvelteKit.
 */

export async function goto(
  _url: string,
  _opts?: Record<string, unknown>,
): Promise<void> {
  return Promise.resolve();
}

export function onNavigate(_cb: (nav: unknown) => unknown): void {
  // No-op
}

export function beforeNavigate(_cb: (nav: unknown) => unknown): void {
  // No-op
}

export function afterNavigate(_cb: (nav: unknown) => unknown): void {
  // No-op
}

export async function invalidateAll(): Promise<void> {
  return Promise.resolve();
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
