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
 *
 * A failed localStorage write never passes silently: `add` throws
 * SavedFilterStorageError and leaves the list unchanged, remove and
 * toggleShare roll back and raise a toast, and reseal keeps the resealed
 * names for the session and raises a toast.
 */

import {
  savedFilterRecordSchema,
  kbSavedFilterStateSchema,
  type SavedFilterRecord,
} from "@care-y/shared";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { resealSavedFilterNames } from "./saved-filter-reseal.js";
import { SavedFilterStorageError } from "$lib/errors.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import * as m from "$lib/paraglide/messages.js";

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

/** Write the private filters. Returns false when storage refuses the write. */
function saveToStorage(records: SavedFilterRecord[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    // Storage full or unavailable (private browsing). Callers report it.
    return false;
  }
}

function createKbSavedFilterStore(): {
  readonly filters: SavedFilterRecord[];
  /** Add a private filter. Throws SavedFilterStorageError, leaving the list unchanged, when the write fails. */
  add(record: SavedFilterRecord): void;
  remove(id: string): void;
  toggleShare(id: string): void;
  resealNames(bridge: CryptoBridge): Promise<void>;
  readonly count: number;
} {
  let filters = $state(loadFromStorage());

  return {
    get filters(): SavedFilterRecord[] {
      return filters;
    },

    add(record: SavedFilterRecord): void {
      const next = [record, ...filters];
      if (!saveToStorage(next)) throw new SavedFilterStorageError();
      filters = next;
    },

    remove(id: string): void {
      const next = filters.filter((f) => f.id !== id);
      if (!saveToStorage(next)) {
        toastStore.show(m.saved_filter_delete_failed());
        return;
      }
      filters = next;
    },

    toggleShare(id: string): void {
      const next = filters.map((f) =>
        f.id === id ? { ...f, shared: !f.shared } : f,
      );
      if (!saveToStorage(next)) {
        toastStore.show(m.saved_filter_save_failed());
        return;
      }
      filters = next;
    },

    async resealNames(bridge: CryptoBridge): Promise<void> {
      const updated = await resealSavedFilterNames(bridge, filters);
      if (updated !== null) {
        // Correct for this session; the next session reseals the old
        // names again.
        filters = updated;
        if (!saveToStorage(filters)) {
          toastStore.show(m.saved_filter_save_failed());
        }
      }
    },

    get count(): number {
      return filters.length;
    },
  };
}

export const kbSavedFilterStore = createKbSavedFilterStore();
