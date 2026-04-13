/**
 * Stub for $app/navigation (SvelteKit virtual module).
 *
 * Vite's import analysis resolves module specifiers during transformation,
 * before vitest's vi.mock() kicks in. .svelte components that import
 * $app/navigation fail unless Vite can resolve the specifier. This stub
 * provides the resolution target; individual tests override via vi.mock().
 */

export function goto(_url: string, _opts?: Record<string, unknown>): void {
  // Stub: overridden by vi.mock() in test files.
}

export function onNavigate(_cb: (nav: unknown) => unknown): void {
  // Stub
}

export function beforeNavigate(_cb: (nav: unknown) => unknown): void {
  // Stub
}

export function afterNavigate(_cb: (nav: unknown) => unknown): void {
  // Stub
}

export function invalidateAll(): void {
  // Stub
}

export function disableScrollHandling(): void {
  // Stub
}

export function pushState(_url: string, _state: Record<string, unknown>): void {
  // Stub
}

export function replaceState(
  _url: string,
  _state: Record<string, unknown>,
): void {
  // Stub
}

export function preloadData(_url: string): void {
  // Stub
}

export function preloadCode(_url: string): void {
  // Stub
}
