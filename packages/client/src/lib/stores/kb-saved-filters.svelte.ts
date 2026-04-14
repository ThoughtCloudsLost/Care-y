/**
 * Saved filter store for the KB article list.
 * Persists named filter combinations to localStorage.
 *
 * Follows the same pattern as saved-filters.svelte.ts (tickets).
 * Reuses the shared SavedFilterRecord schema (domain-agnostic record
 * envelope). The `state` field contains KB-specific filter state
 * serialized as JSON, validated by kbSavedFilterStateSchema.
 *
 * localStorage key: "care-y:kb-saved-filters"
 */

import {
  savedFilterRecordSchema,
  kbSavedFilterStateSchema,
  type SavedFilterRecord,
} from "@care-y/shared";

export type { KbSavedFilterState } from "@care-y/shared";

const STORAGE_KEY = "care-y:kb-saved-filters";

function loadFromStorage(): SavedFilterRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: SavedFilterRecord[] = [];
    for (const entry of parsed) {
      const result = savedFilterRecordSchema.safeParse(entry);
      if (!result.success) continue;
      // Also validate the inner state JSON against the KB schema.
      // Discard records whose state doesn't match (e.g. leftover ticket filters).
      try {
        const stateData: unknown = JSON.parse(result.data.state);
        const stateResult = kbSavedFilterStateSchema.safeParse(stateData);
        if (!stateResult.success) continue;
      } catch {
        continue;
      }
      valid.push(result.data);
    }
    return valid;
  } catch {
    return [];
  }
}

function saveToStorage(records: SavedFilterRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage full or unavailable
  }
}

function createKbSavedFilterStore(): {
  readonly filters: SavedFilterRecord[];
  add(record: SavedFilterRecord): void;
  remove(id: string): void;
  toggleShare(id: string): void;
  readonly count: number;
} {
  let filters = $state(loadFromStorage());

  function persist(): void {
    saveToStorage(filters);
  }

  return {
    get filters(): SavedFilterRecord[] {
      return filters;
    },

    add(record: SavedFilterRecord): void {
      filters = [record, ...filters];
      persist();
    },

    remove(id: string): void {
      filters = filters.filter((f) => f.id !== id);
      persist();
    },

    toggleShare(id: string): void {
      filters = filters.map((f) =>
        f.id === id ? { ...f, shared: !f.shared } : f,
      );
      persist();
    },

    get count(): number {
      return filters.length;
    },
  };
}

export const kbSavedFilterStore = createKbSavedFilterStore();
