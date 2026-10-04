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
 *
 * A failed localStorage write never passes silently. `add` leaves the list
 * unchanged and throws SavedFilterStorageError for the create sheet to
 * show. Removing a private filter rolls back and raises a toast. Share,
 * unshare and reseal have already changed server or key state that cannot
 * be undone, so they keep the new state for the session and raise a toast.
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
import {
  requireRouter,
  SavedFilterStorageError,
  hasTrpcErrorCode,
} from "$lib/errors.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import * as m from "$lib/paraglide/messages.js";

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

export interface SavedFilterStore {
  readonly filters: SavedFilterRecord[];
  /** Add a private filter. Throws SavedFilterStorageError, leaving the list unchanged, when the write fails. */
  add(record: SavedFilterRecord): void;
  /** Remove a filter (local or shared). Async for shared filters. */
  remove(id: string): void;
  /** Toggle sharing on a filter. Share posts to server, unshare deletes. */
  toggleShare(id: string): void;
  /** Fetch shared filters from the server and decrypt their state. */
  loadShared(orgKeyManager: OrgKeyManager): Promise<void>;
  /** True when the last shared-filter fetch failed for a reason other than missing permission. */
  readonly sharedLoadFailed: boolean;
  /** Re-run the shared-filter fetch with the key manager from the last loadShared call. */
  retryShared(): Promise<void>;
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
  let sharedLoadFailed = $state(false);
  let sharedLoadKeyMgr: OrgKeyManager | null = null;

  /** Persist private filters; on failure tell the account with a toast. */
  function persistLocalOrToast(): void {
    if (!saveToStorage(localFilters)) {
      toastStore.show(m.saved_filter_save_failed());
    }
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

    // The server share has succeeded and cannot be undone here. If the
    // local removal does not persist, the private copy returns on reload
    // beside the shared one; the toast says the device write failed.
    localFilters = localFilters.filter((f) => f.id !== id);
    persistLocalOrToast();

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
    // The server unshare has already happened, so the private copy stays
    // in the list for this session even when the write fails.
    persistLocalOrToast();
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

  async function loadShared(orgKeyManager: OrgKeyManager): Promise<void> {
    sharedLoadKeyMgr = orgKeyManager;
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
      sharedLoadFailed = false;
    } catch (err: unknown) {
      // Without VIEW_CASES the server answers FORBIDDEN and the shared
      // section stays absent. Any other failure is shown as retryable.
      sharedLoadFailed = !hasTrpcErrorCode(err, "FORBIDDEN");
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
      const next = [record, ...localFilters];
      if (!saveToStorage(next)) throw new SavedFilterStorageError();
      localFilters = next;
    },

    remove(id: string): void {
      const isLocal = localFilters.some((f) => f.id === id);
      if (isLocal) {
        const next = localFilters.filter((f) => f.id !== id);
        if (!saveToStorage(next)) {
          toastStore.show(m.saved_filter_delete_failed());
          return;
        }
        localFilters = next;
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
      await loadShared(orgKeyManager);
    },

    get sharedLoadFailed(): boolean {
      return sharedLoadFailed;
    },

    async retryShared(): Promise<void> {
      if (sharedLoadKeyMgr == null) return;
      await loadShared(sharedLoadKeyMgr);
    },

    async resealNames(bridge: CryptoBridge): Promise<void> {
      const updated = await resealSavedFilterNames(bridge, localFilters);
      // The resealed names are correct for this session; a failed write
      // leaves the old ones on disk, which the next session reseals again.
      if (updated !== null) {
        localFilters = updated;
        persistLocalOrToast();
      }
    },

    get count(): number {
      return mergedFilters().length;
    },
  };
}

export const savedFilterStore = createSavedFilterStore();
