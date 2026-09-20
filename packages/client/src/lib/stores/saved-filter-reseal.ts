/**
 * Re-encrypt device-local saved-filter names under the current org key.
 *
 * Device-local ciphertext is invisible to the server's resealStatus,
 * which is one reason ADR-107 forbids pruning the generation chain.
 * This converges each device as it is used.
 */

import type { SavedFilterRecord } from "@care-y/shared";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

/**
 * Attempt to reseal all saved-filter encrypted names in one batch call.
 * Returns a new array with resealed values substituted, or null if
 * nothing changed (no persist needed). Undecryptable records (both
 * resealed and fromGeneration null) stay untouched to avoid destroying
 * device-local data.
 */
export async function resealSavedFilterNames(
  bridge: CryptoBridge,
  records: readonly SavedFilterRecord[],
): Promise<SavedFilterRecord[] | null> {
  if (records.length === 0) return null;

  const items = records.map((r) => ({
    cacheKey: r.id,
    ciphertext: r.encryptedName,
  }));

  const results = await bridge.orgResealBatch(items);

  const resealedByCacheKey = new Map<string, string>();
  for (const r of results) {
    if (r.resealed !== null) {
      resealedByCacheKey.set(r.cacheKey, r.resealed);
    }
  }

  if (resealedByCacheKey.size === 0) return null;

  return records.map((r) => {
    const newCt = resealedByCacheKey.get(r.id);
    if (newCt !== undefined) {
      return { ...r, encryptedName: newCt };
    }
    return r;
  });
}
