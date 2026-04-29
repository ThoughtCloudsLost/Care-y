/**
 * Admin auto-wrap: distribute the org key to volunteers who have
 * completed first-login but don't have a wrapped_org_keys entry yet.
 *
 * Runs on the main thread (org-tier, not PII-tier). The org secret key
 * is NOT zeroed here because OrgKeyManager retains it for the session.
 * Zeroing happens on logout via the cleanup handler.
 *
 * Server endpoints (keys.listUnwrappedUsers, keys.wrapOrgKeyForUser)
 * are created in the server onboarding phase. This module will wire against them once they exist.
 */

import { wrapKey, encode, decode } from "@care-y/crypto";
import type { RistrettoPoint } from "@care-y/crypto";
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
 * Requires keys.wrapOrgKeyForUser server endpoint (created in the server onboarding phase).
 *
 * @param bridge - CryptoBridge with the org secret key loaded in the Worker
 */
export async function wrapOrgKeyForPending(
  bridge: CryptoBridge,
  pendingUsers: PendingWrapUser[],
): Promise<void> {
  if (pendingUsers.length === 0) return;

  const keysRouter = trpc.keys;
  if (!("wrapOrgKeyForUser" in keysRouter)) {
    if (import.meta.env.DEV) {
      console.warn(
        "[org-key-wrap] keys.wrapOrgKeyForUser not available yet (the server onboarding phase)",
      );
    }
    return;
  }

  for (const user of pendingUsers) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- branded type cast, validated by wrapKey at runtime
      const recipientPublic = decode(user.volPublic) as RistrettoPoint;

      const orgSecretKeyBuf = await bridge.exportOrgSecretKey();
      const orgSecretKey = new Uint8Array(orgSecretKeyBuf);

      try {
        const wrapped = wrapKey(orgSecretKey, recipientPublic);

        interface MutateEndpoint {
          mutate: (input: Record<string, string>) => Promise<unknown>;
        }
        /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- forward ref to the server onboarding phase endpoint, guarded by runtime "in" check above */
        const wrapEndpoint = (
          keysRouter as unknown as Record<string, MutateEndpoint | undefined>
        ).wrapOrgKeyForUser as MutateEndpoint;
        /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
        await wrapEndpoint.mutate({
          userId: user.userId,
          wrappedKey: encode(wrapped.ciphertext),
          ephemeralPoint: encode(wrapped.ephemeralPoint),
          nonce: encode(wrapped.nonce),
        });
      } finally {
        orgSecretKey.fill(0);
      }
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        console.warn(`[org-key-wrap] failed for user ${user.userId}:`, err);
      }
    }
  }
}
