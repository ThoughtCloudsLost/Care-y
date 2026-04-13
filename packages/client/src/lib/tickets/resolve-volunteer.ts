/**
 * Volunteer name resolution with O(1) Map-based lookup.
 *
 * Replaces the previous pattern of Array.find() per call (O(N*M) when
 * resolving M names from N volunteers). Callers build the Map once via
 * $derived and pass it to resolveVolunteerName for each lookup.
 */

import type { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";

/** Volunteer record shape as it arrives over tRPC JSON (Buffer -> SerializedBuffer). */
export interface VolunteerRecord {
  readonly id: string;
  readonly encryptedDisplayName: SerializedBuffer | Uint8Array | null;
}

/**
 * Build a Map<userId, volunteer> for O(1) lookups.
 * Call from $derived so it recomputes only when the volunteer list changes.
 */
export function buildVolunteerMap(
  volunteers: readonly VolunteerRecord[] | undefined | null,
): Map<string, VolunteerRecord> {
  const map = new Map<string, VolunteerRecord>();
  if (volunteers == null) return map;
  for (const v of volunteers) map.set(v.id, v);
  return map;
}

/**
 * Resolve a userId to a decrypted volunteer display name.
 * Uses the pre-built Map for O(1) lookup instead of Array.find.
 */
export function resolveVolunteerName(
  userId: string | null,
  volunteerMap: Map<string, VolunteerRecord>,
  orgCache: OrgDecryptCache,
): string | undefined {
  if (userId === null) return undefined;
  const vol = volunteerMap.get(userId);
  if (!vol) return undefined;
  return (
    orgCache.decrypt(`volunteer:${vol.id}`, vol.encryptedDisplayName) ??
    undefined
  );
}
