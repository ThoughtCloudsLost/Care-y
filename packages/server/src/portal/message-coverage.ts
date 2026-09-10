/**
 * Exact-coverage check shared by every portal re-keying operation
 * (addPassphrase, upgradeFromSecureLink, changePassword).
 *
 * The client re-seals the messages it can decrypt and declares the rest
 * as skipped. The server accepts the operation only when the two sets
 * exactly partition the channel's current rows: XOR membership rejects
 * overlap and uncovered rows (a message that arrived mid-operation
 * lands in neither set), and the size comparisons reject duplicate or
 * stray IDs that belong to no row of the channel.
 */
export function hasExactMessageCoverage(
  rowIds: readonly string[],
  rewrappedIds: readonly string[],
  skippedIds: readonly string[],
): boolean {
  const rewrapped = new Set<string>(rewrappedIds);
  const skipped = new Set<string>(skippedIds);
  return (
    rewrapped.size === rewrappedIds.length &&
    skipped.size === skippedIds.length &&
    rewrapped.size + skipped.size === rowIds.length &&
    rowIds.every((id) => rewrapped.has(id) !== skipped.has(id))
  );
}
