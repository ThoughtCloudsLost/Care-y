/**
 * Stub for $lib/stores/saved-filters.svelte.
 *
 * The real store persists to localStorage and validates entries through
 * savedFilterRecordSchema. This stub holds an empty array in memory.
 * No localStorage reads, no module-scope DOM access.
 */

// Type-only import from the real module (not aliased) so the color
// union and other fields match exactly at consumer sites.
import type { SavedFilterRecord, SavedFilterState } from "@care-y/shared";

export type { SavedFilterState };

let filters = $state<SavedFilterRecord[]>([]);

export const savedFilterStore: {
  readonly filters: SavedFilterRecord[];
  add(record: SavedFilterRecord): void;
  remove(id: string): void;
  toggleShare(id: string): void;
  readonly count: number;
} = {
  get filters(): SavedFilterRecord[] {
    return filters;
  },

  add(record: SavedFilterRecord): void {
    filters = [record, ...filters];
  },

  remove(id: string): void {
    filters = filters.filter((f) => f.id !== id);
  },

  toggleShare(id: string): void {
    filters = filters.map((f) =>
      f.id === id ? { ...f, shared: !f.shared } : f,
    );
  },

  get count(): number {
    return filters.length;
  },
};
