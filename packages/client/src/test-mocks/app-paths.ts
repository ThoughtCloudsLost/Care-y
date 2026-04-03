/**
 * Stub for $app/paths (SvelteKit virtual module).
 *
 * Same pattern as app-navigation.ts: provides a Vite resolution target
 * so .svelte files can import $app/paths during test transformation.
 * Individual tests override via vi.mock() if needed.
 */

export const base = "";

export const assets = "";

export function resolve(path: string): string {
  return path;
}
