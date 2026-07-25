/**
 * Stub for $app/paths.
 *
 * Derives base from Vite's import.meta.env.BASE_URL so it works
 * both in local dev ("/") and under the GitHub Pages base path
 * ("/Care-y/"). The trailing slash is stripped so template
 * expressions like `${base}/tickets` compose correctly, matching
 * how SvelteKit's base behaves.
 */

const raw = import.meta.env.BASE_URL;
export const base: string = raw.endsWith("/") ? raw.slice(0, -1) : raw;

export const assets: string = base;

export function resolve(path: string): string {
  if (path.startsWith("/")) {
    return `${base}${path}`;
  }
  return path;
}
