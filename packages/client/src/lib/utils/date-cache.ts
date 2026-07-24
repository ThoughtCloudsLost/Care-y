const cache = new Map<string, Date>();

/**
 * Memoized ISO-string to Date parser for hot remap paths: a list rebuild
 * that runs per decrypt settle should not allocate a fresh Date per row.
 * Module-level and unbounded by design; entries are keyed by the distinct
 * timestamp strings actually seen, which stays small for curated lists.
 * Deliberately a plain Map: the cache is never rendered from, so reads
 * must not subscribe anything.
 */
export function cachedDate(iso: string): Date {
  let date = cache.get(iso);
  if (date === undefined) {
    date = new Date(iso);
    cache.set(iso, date);
  }
  return date;
}
