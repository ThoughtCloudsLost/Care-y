/**
 * "New replies first" partition for the tickets list.
 *
 * This sort is client-side BY DESIGN, and can only ever cover the loaded
 * window. Read cursors are E2E-encrypted per user (opaque ciphertext to
 * the server, bound to a per-user AAD slot; see the read-cursor-service
 * header on the server), so the server cannot sort or filter by read
 * state. Pages beyond the loaded window therefore arrive in server order
 * and join the read block as they load and their cursors decrypt.
 */

/**
 * Stable partition: unread items first, server order preserved within
 * both blocks. Returns a new array; the input is not mutated.
 */
export function sortNewRepliesFirst<T>(
  items: readonly T[],
  isUnread: (item: T) => boolean,
): T[] {
  const unread: T[] = [];
  const read: T[] = [];
  for (const item of items) {
    if (isUnread(item)) {
      unread.push(item);
    } else {
      read.push(item);
    }
  }
  return [...unread, ...read];
}
