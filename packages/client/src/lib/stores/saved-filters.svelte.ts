/**
 * Saved filter store. Persists named filter combinations to localStorage.
 *
 * Each saved filter has an org-key-encrypted name (encrypted at save time
 * by the caller, not by this store), a color, an icon, and a serialized
 * filter state JSON. Decryption of names happens at render time via
 * OrgDecryptCache (lazy, not in this store).
 *
 * localStorage key: "care-y:saved-filters"
 * Format: JSON array validated through savedFilterRecordSchema.
 *
 * 6c.2 may add a "stages" dimension to filter state. The state field is
 * an opaque JSON string, so no schema change is needed here.
 */

import {
  savedFilterRecordSchema,
  type SavedFilterRecord,
  type SavedFilterState,
} from "@care-y/shared";

export type { SavedFilterState };

const STORAGE_KEY = "care-y:saved-filters";

function loadFromStorage(): SavedFilterRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate each entry individually; discard malformed ones silently.
    const valid: SavedFilterRecord[] = [];
    for (const entry of parsed) {
      const result = savedFilterRecordSchema.safeParse(entry);
      if (result.success) valid.push(result.data);
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
    // localStorage full or unavailable (private browsing). Silently fail.
  }
}

function createSavedFilterStore(): {
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

export const savedFilterStore = createSavedFilterStore();
