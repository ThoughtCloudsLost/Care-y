/**
 * Stub for $lib/stores/saved-filters.svelte.
 *
 * The real store persists to localStorage and validates entries through
 * savedFilterRecordSchema. This stub holds an in-memory array seeded
 * with two presets. No localStorage reads, no module-scope DOM access.
 *
 * Seed filter names are sealed (crypto_box_seal) to the org public key
 * via sealSeedFilterNames(), called from PhoneApp after the engine
 * boots and the org key is available. Until sealed, encryptedName
 * holds a placeholder that the OrgDecryptCache cannot decrypt, so
 * chips render "..." until the seal call runs.
 */

// Type-only import from the real module (not aliased) so the color
// union and other fields match exactly at consumer sites.
import type { SavedFilterRecord, SavedFilterState } from "@care-y/shared";
import _sodium from "libsodium-wrappers-sumo";

export type { SavedFilterState };

// Plaintext names for each seed filter. Kept separate from the record
// array so sealSeedFilterNames can iterate them by index.
const SEED_NAMES = ["Urgent open", "On hold"] as const;

// Seed two demo presets so the saved-filter chip row renders on the
// ticket list, giving the saved-filters topic something to pulse.
// encryptedName starts as a placeholder (empty base64url); the real
// sealed-box ciphertext is injected by sealSeedFilterNames after
// the engine boots and the org public key is available.
const SEED_FILTERS: SavedFilterRecord[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    encryptedName: "",
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
    encryptedName: "",
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

/**
 * Seal the seed filter names to the org public key so the
 * OrgDecryptCache can decrypt them via the real crypto worker.
 *
 * Called once from PhoneApp after the engine boots. Uses
 * crypto_box_seal (sealed box, same primitive the server uses for
 * org-tier fields) and encodes the ciphertext as base64url to match
 * the wire encoding that tRPC routes use for encrypted columns.
 *
 * @param orgPublicKey - The 32-byte Curve25519 org public key from seedResult
 */
export function sealSeedFilterNames(orgPublicKey: Uint8Array): void {
  const sealed = SEED_NAMES.map((name) => {
    const plainBytes = new TextEncoder().encode(name);
    const cipherBytes = _sodium.crypto_box_seal(plainBytes, orgPublicKey);
    // base64url, no padding, matching ciphertext-wire.ts b64()
    return Buffer.from(cipherBytes).toString("base64url");
  });

  filters = filters.map((f, i) => ({
    ...f,
    encryptedName: sealed.at(i) ?? f.encryptedName,
  }));
}

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
