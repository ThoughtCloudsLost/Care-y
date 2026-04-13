const MAX_RECENTS = 10;

// Session-scoped. No persistence. Cleared on page unload/logout.
let items = $state<readonly string[]>([]);

export const searchRecents = {
  /** Current recent searches (most recent first). */
  get items(): readonly string[] {
    return items;
  },

  /** Add a search term. Deduplicates and caps at MAX_RECENTS. */
  add(query: string): void {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    // Remove duplicate if exists, prepend to front.
    items = [trimmed, ...items.filter((q) => q !== trimmed)].slice(
      0,
      MAX_RECENTS,
    );
  },

  /** Remove a single recent entry (user taps X). */
  remove(query: string): void {
    items = items.filter((q) => q !== query);
  },

  /** Clear all recents. Called on logout/session timeout. */
  clear(): void {
    items = [];
  },
};
