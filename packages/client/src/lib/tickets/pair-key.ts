/**
 * Stable pair key from two client ids. Sorted so (A,B) === (B,A).
 *
 * Shared by the main-thread merge scan composable (dismissals, filtering)
 * and the crypto-core worker (candidate detection). No key material or
 * worker types cross; this is a pure string function.
 */

/**
 * Compute a stable, order-independent pair key from two client ids.
 * The smaller id sorts first, separated by a colon.
 */
export function pairKey(clientIdA: string, clientIdB: string): string {
  return clientIdA < clientIdB
    ? `${clientIdA}:${clientIdB}`
    : `${clientIdB}:${clientIdA}`;
}
