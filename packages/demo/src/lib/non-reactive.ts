/**
 * Constructors for deliberately non-reactive collections and URLs.
 *
 * svelte/prefer-svelte-reactivity flags built-in Map/Set/URL construction
 * inside .svelte and .svelte.ts files, where an instance usually feeds
 * rendering and should be reactive. Some instances are pure bookkeeping
 * or throwaway parses: swapped wholesale into $state.raw, read only
 * inside the pass that builds them, or discarded after one read.
 * Making those reactive would add per-key signal overhead on hot paths
 * (and in the worst case subscribe a pass to its own scratch state).
 *
 * Routing construction through these named helpers keeps the lint rule
 * meaningful where it matters and makes the non-reactive intent
 * explicit at the call site.
 */

export function plainMap<K, V>(): Map<K, V> {
  return new Map<K, V>();
}

export function plainSet<T>(): Set<T> {
  return new Set<T>();
}

/** Parse a throwaway URL that nothing observes reactively. */
export function parseUrl(href: string, base?: string): URL {
  return new URL(href, base);
}
