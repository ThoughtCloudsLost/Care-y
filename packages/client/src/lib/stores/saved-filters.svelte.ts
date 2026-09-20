/**
 * Saved filter store. Merges device-local (private) and server-stored
 * (shared, org-key-sealed) filters into one reactive list.
 *
 * Private filters persist to localStorage under "care-y:saved-filters".
 * Shared filters are fetched from the server via tRPC and held in memory
 * with their state decrypted on load so the apply path works unchanged.
 *
 * Share: takes a local record, writes its existing encrypted name plus
 * a freshly encrypted state to the server, and removes the local record.
 * Unshare: deletes the server row and moves the filter back to local
 * storage as a private record. Delete: removes from whichever store
 * holds it (local for private, server for shared).
 *
 * Decryption of names happens at render time via OrgDecryptCache.
 */

import {
  savedFilterRecordSchema,
  savedFilterColorSchema,
  type SavedFilterRecord,
  type SavedFilterState,
} from "@care-y/shared";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { resealSavedFilterNames } from "./saved-filter-reseal.js";
import { trpc } from "$lib/trpc/index.js";
import { requireRouter } from "$lib/errors.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";

export type { SavedFilterState };

const STORAGE_KEY = "care-y:saved-filters";

function loadFromStorage(): SavedFilterRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
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

export interface SavedFilterStore {
  readonly filters: SavedFilterRecord[];
  add(record: SavedFilterRecord): void;
  /** Remove a filter (local or shared). Async for shared filters. */
  remove(id: string): void;
  /** Toggle sharing on a filter. Share posts to server, unshare deletes. */
  toggleShare(id: string): void;
  /** Fetch shared filters from the server and decrypt their state. */
  loadShared(orgKeyManager: OrgKeyManager): Promise<void>;
  resealNames(bridge: CryptoBridge): Promise<void>;
  readonly count: number;
  /** Set context needed for share/unshare/delete operations. */
  setContext(userId: string, orgKeyManager: OrgKeyManager): void;
}

function createSavedFilterStore(): SavedFilterStore {
  let localFilters = $state(loadFromStorage());
  let sharedFilters = $state<SavedFilterRecord[]>([]);
  let currentUserId: string | null = null;
  let currentOrgKeyMgr: OrgKeyManager | null = null;

  function persistLocal(): void {
    saveToStorage(localFilters);
  }

  function mergedFilters(): SavedFilterRecord[] {
    return [...localFilters, ...sharedFilters];
  }

  async function shareFilter(id: string): Promise<void> {
    if (currentUserId == null || currentOrgKeyMgr == null) return;
    const local = localFilters.find(
      (f) => f.id === id && f.ownerId === currentUserId,
    );
    if (!local) return;

    const encryptedState = await currentOrgKeyMgr.encryptText(local.state);

    const result = await requireRouter(
      trpc.savedFilters,
      "savedFilters",
    ).share.mutate({
      encryptedName: local.encryptedName,
      encryptedState,
      color: savedFilterColorSchema.parse(local.color),
      icon: local.icon,
    });

    localFilters = localFilters.filter((f) => f.id !== id);
    persistLocal();

    const serverRecord: SavedFilterRecord = {
      id: result.filter.id,
      encryptedName: result.filter.encryptedName,
      color: savedFilterColorSchema.parse(result.filter.color),
      icon: result.filter.icon,
      state: local.state,
      shared: true,
      ownerId: result.filter.ownerId,
      createdAt: result.filter.createdAt,
    };
    sharedFilters = [...sharedFilters, serverRecord];
  }

  async function unshareFilter(id: string): Promise<void> {
    const shared = sharedFilters.find((f) => f.id === id);
    if (!shared) return;

    await requireRouter(trpc.savedFilters, "savedFilters").unshare.mutate({
      filterId: id,
    });

    sharedFilters = sharedFilters.filter((f) => f.id !== id);
    const localRecord: SavedFilterRecord = {
      ...shared,
      id: crypto.randomUUID(),
      shared: false,
    };
    localFilters = [localRecord, ...localFilters];
    persistLocal();
  }

  async function removeShared(id: string): Promise<void> {
    if (currentUserId == null) return;
    const target = sharedFilters.find((f) => f.id === id);
    if (target?.ownerId === currentUserId) {
      await requireRouter(trpc.savedFilters, "savedFilters").unshare.mutate({
        filterId: id,
      });
      sharedFilters = sharedFilters.filter((f) => f.id !== id);
    }
  }

  return {
    get filters(): SavedFilterRecord[] {
      return mergedFilters();
    },

    setContext(userId: string, orgKeyManager: OrgKeyManager): void {
      currentUserId = userId;
      currentOrgKeyMgr = orgKeyManager;
    },

    add(record: SavedFilterRecord): void {
      localFilters = [record, ...localFilters];
      persistLocal();
    },

    remove(id: string): void {
      const isLocal = localFilters.some((f) => f.id === id);
      if (isLocal) {
        localFilters = localFilters.filter((f) => f.id !== id);
        persistLocal();
        return;
      }
      void removeShared(id);
    },

    toggleShare(id: string): void {
      const all = mergedFilters();
      const target = all.find((f) => f.id === id);
      if (target == null) return;

      if (target.shared) {
        void unshareFilter(id);
      } else {
        void shareFilter(id);
      }
    },

    async loadShared(orgKeyManager: OrgKeyManager): Promise<void> {
      try {
        const result = await requireRouter(
          trpc.savedFilters,
          "savedFilters",
        ).list.query();
        const decoded: SavedFilterRecord[] = [];
        for (const f of result.filters) {
          let state: string;
          try {
            state = await orgKeyManager.decryptText(f.encryptedState);
          } catch {
            // Cannot decrypt (key rotation in progress, etc.). Skip.
            continue;
          }
          decoded.push({
            id: f.id,
            encryptedName: f.encryptedName,
            state,
            color: savedFilterColorSchema.parse(f.color),
            icon: f.icon,
            shared: true,
            ownerId: f.ownerId,
            createdAt: f.createdAt,
          });
        }
        sharedFilters = decoded;
      } catch {
        // Network error or user lacks VIEW_CASES. Shared filters
        // are supplementary; local filters still work.
      }
    },

    async resealNames(bridge: CryptoBridge): Promise<void> {
      const updated = await resealSavedFilterNames(bridge, localFilters);
      if (updated !== null) {
        localFilters = updated;
        persistLocal();
      }
    },

    get count(): number {
      return mergedFilters().length;
    },
  };
}

export const savedFilterStore = createSavedFilterStore();
