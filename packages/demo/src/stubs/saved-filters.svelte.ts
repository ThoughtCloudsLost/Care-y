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

// Seed two demo presets so the saved-filter chip row renders on the
// ticket list, giving the saved-filters topic something to pulse.
// encryptedName is plaintext here: the demo stub's decrypt cache returns
// it as-is since the org key has already loaded by mount time.
const SEED_FILTERS: SavedFilterRecord[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    encryptedName: "Urgent open",
    color: "red",
    icon: "flame",
    state: JSON.stringify({
      statuses: ["new", "active"],
      queueIds: [],
      priorities: ["urgent"],
      assigneeId: null,
      dateFrom: null,
      dateTo: null,
      sortField: "createdAt",
      sortDirection: "desc",
      unreadOnly: false,
      needsAttentionOnly: false,
    }),
    shared: false,
    ownerId: "demo-user-001",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    encryptedName: "On hold",
    color: "orange",
    icon: "pause",
    state: JSON.stringify({
      statuses: ["hold"],
      queueIds: [],
      priorities: [],
      assigneeId: null,
      dateFrom: null,
      dateTo: null,
      sortField: "updatedAt",
      sortDirection: "desc",
      unreadOnly: false,
      needsAttentionOnly: false,
    }),
    shared: false,
    ownerId: "demo-user-001",
    createdAt: "2026-02-10T14:30:00Z",
  },
];

let filters = $state<SavedFilterRecord[]>([...SEED_FILTERS]);

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
