/**
 * LRU cache for per-ticket symmetric keys (tk).
 *
 * Runs inside the crypto Worker. Uses Map insertion order for LRU tracking:
 * delete + re-insert on access promotes an entry to most-recently-used.
 * The first entry in iteration order is always the eviction candidate.
 *
 * Calls `memzero` on every evicted Uint8Array so that key material is
 * scrubbed from memory immediately, not left for GC.
 */

export interface TkCacheConfig {
  /** Maximum number of cached ticket keys. Default: 50. */
  readonly maxEntries: number;
  /** Injected zeroing function (from sodium). Called on every evicted buffer. */
  readonly memzero: (buf: Uint8Array) => void;
}

export class TkCache {
  private readonly cache: Map<string, Uint8Array>;
  private readonly config: TkCacheConfig;

  constructor(config: TkCacheConfig) {
    this.cache = new Map();
    this.config = config;
  }

  /**
   * Retrieve a cached tk and promote it to most-recently-used.
   * Returns undefined if the ticketId is not cached.
   */
  get(ticketId: string): Uint8Array | undefined {
    const entry = this.cache.get(ticketId);
    if (entry === undefined) return undefined;

    // Promote to MRU: delete and re-insert moves it to the end of
    // Map iteration order, making it the last to be evicted.
    this.cache.delete(ticketId);
    this.cache.set(ticketId, entry);
    return entry;
  }

  /**
   * Cache a tk. If the cache is full, the least-recently-used entry
   * is evicted and its buffer is zeroed via `memzero`.
   */
  set(ticketId: string, tk: Uint8Array): void {
    // If this ticketId already exists, remove first so the re-insert
    // updates its position (and we don't double-count toward maxEntries).
    if (this.cache.has(ticketId)) {
      this.cache.delete(ticketId);
    }

    // Evict the LRU entry if at capacity.
    if (this.cache.size >= this.config.maxEntries) {
      // Map.keys().next() returns the oldest entry (first inserted).
      const oldestKey = this.cache.keys().next();
      if (oldestKey.done !== true) {
        const evicted = this.cache.get(oldestKey.value);
        this.cache.delete(oldestKey.value);
        if (evicted) {
          this.config.memzero(evicted);
        }
      }
    }

    this.cache.set(ticketId, tk);
  }

  /**
   * Remove and zero a specific entry. Called when TanStack Query GC
   * signals that a ticket's data has been garbage-collected.
   */
  evict(ticketId: string): void {
    const entry = this.cache.get(ticketId);
    if (entry !== undefined) {
      this.cache.delete(ticketId);
      this.config.memzero(entry);
    }
  }

  /** Zero every cached tk and clear the map. Called on logout/idle/unload. */
  zeroAll(): void {
    for (const entry of this.cache.values()) {
      this.config.memzero(entry);
    }
    this.cache.clear();
  }

  /** Number of currently cached entries. */
  get size(): number {
    return this.cache.size;
  }
}
