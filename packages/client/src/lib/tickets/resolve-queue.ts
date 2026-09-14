/**
 * Queue name resolution with O(1) Map-based lookup.
 *
 * Mirrors resolve-volunteer.ts. Returns undefined rather than a fallback
 * string so each call site picks its own wording, which is what lets the
 * timeline and the pickers word an unresolvable queue differently.
 */

import type { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";

/** Queue record shape as it arrives over tRPC JSON. */
export interface QueueRecord {
  readonly id: string;
  readonly encryptedName: string | null;
}

/**
 * Build a Map<queueId, queue> for O(1) lookups.
 * Call from $derived so it recomputes only when the queue list changes.
 */
export function buildQueueMap(
  queues: readonly QueueRecord[] | undefined | null,
): Map<string, QueueRecord> {
  const map = new Map<string, QueueRecord>();
  if (queues == null) return map;
  for (const q of queues) map.set(q.id, q);
  return map;
}

/**
 * Resolve a queueId to a decrypted queue name.
 * Returns undefined when the queue is unknown or cannot be decrypted.
 */
export function resolveQueueName(
  queueId: string | null,
  queueMap: Map<string, QueueRecord>,
  orgCache: OrgDecryptCache,
): string | undefined {
  if (queueId === null) return undefined;
  const queue = queueMap.get(queueId);
  if (!queue) return undefined;
  return (
    orgCache.decrypt(`queue:${queue.id}`, queue.encryptedName) ?? undefined
  );
}
