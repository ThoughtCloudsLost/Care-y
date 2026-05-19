/**
 * Admin auto-wrap: distribute the org key to volunteers who have
 * completed first-login but don't have a wrapped_org_keys entry yet.
 *
 * Runs on the main thread (org-tier, not PII-tier). The org secret key
 * is exported from the Worker, used for ECIES wrapping, and zeroed
 * immediately after. OrgKeyManager retains its copy for the session;
 * zeroing happens on logout via the cleanup handler.
 */

import { wrapKey, encode, decode, toRistrettoPoint } from "@care-y/crypto";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { trpc } from "$lib/trpc/index.js";

export interface PendingWrapUser {
  userId: string;
  volPublic: string;
}

/**
 * Wrap the org key for all volunteers who don't have one yet.
 * Idempotent: server uses INSERT ON CONFLICT DO NOTHING.
 *
 * Exports the org secret key from the Worker once, wraps for each user,
 * then zeros the key material. Per-user errors are logged (dev only)
 * and do not prevent wrapping for remaining users.
 */
export async function wrapOrgKeyForPending(
  bridge: CryptoBridge,
  pendingUsers: PendingWrapUser[],
): Promise<number> {
  if (pendingUsers.length === 0) return 0;

  const orgSecretKeyBuf = await bridge.exportOrgSecretKey();
  const orgSecretKey = new Uint8Array(orgSecretKeyBuf);
  let wrapped = 0;

  try {
    for (const user of pendingUsers) {
      try {
        const recipientPublic = toRistrettoPoint(decode(user.volPublic));
        const result = wrapKey(orgSecretKey, recipientPublic);

        await trpc.keys.wrapOrgKeyForUser.mutate({
          userId: user.userId,
          wrappedKey: encode(result.ciphertext),
          ephemeralPoint: encode(result.ephemeralPoint),
          nonce: encode(result.nonce),
        });

        wrapped++;
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          console.warn(`[org-key-wrap] failed for user ${user.userId}:`, err);
        }
      }
    }
  } finally {
    orgSecretKey.fill(0);
  }

  return wrapped;
}

/**
 * Orchestrator: fetch unwrapped users from the server and wrap the
 * org key for each. Returns the number of users successfully wrapped.
 */
export async function autoWrapPendingUsers(
  bridge: CryptoBridge,
): Promise<number> {
  const pending = await trpc.keys.listUnwrappedUsers.query();
  if (pending.length === 0) return 0;

  const count = await wrapOrgKeyForPending(bridge, pending);

  if (import.meta.env.DEV) {
    console.info(
      `[org-key-wrap] wrapped org key for ${String(count)}/${String(pending.length)} users`,
    );
  }

  return count;
}
