/**
 * Org key rotation orchestration (non-PII tier).
 *
 * Triggered after volunteer offboarding. The actual re-wrapping of the org
 * private key happens client-side: an admin's browser decrypts with the old
 * org key, generates a fresh Curve25519 keypair, and re-encrypts the new
 * private key for each remaining volunteer's volPublic. This module provides
 * the server-side bookkeeping: replace org_public_key, delete old
 * wrapped_org_keys, and accept new per-volunteer wrapped copies.
 *
 * The admin's browser calls a tRPC endpoint with:
 * { newOrgPublicKey, wrappedKeys: [{ userId, wrappedKey, nonce }] }
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

export interface OrgKeyRotationInput {
  readonly newOrgPublicKey: Buffer;
  readonly wrappedKeys: readonly {
    readonly userId: string;
    readonly wrappedKey: Buffer;
    readonly nonce: Buffer;
  }[];
}

export interface OrgKeyRotationService {
  /**
   * Atomically replaces the org keypair:
   * 1. Updates org_config.org_public_key
   * 2. Deletes all existing wrapped_org_keys
   * 3. Inserts new wrapped copies for remaining volunteers
   */
  rotateOrgKey(input: OrgKeyRotationInput): Promise<void>;
}

export function createOrgKeyRotationService(
  db: Kysely<TenantDatabase>,
): OrgKeyRotationService {
  return {
    async rotateOrgKey(input: OrgKeyRotationInput): Promise<void> {
      await db.transaction().execute(async (tx) => {
        // Replace org public key
        await tx
          .updateTable("org_config")
          .set({ org_public_key: input.newOrgPublicKey })
          .execute();

        // Delete all old wrapped copies
        await tx.deleteFrom("wrapped_org_keys").execute();

        // Insert new wrapped copies for remaining volunteers
        for (const wrap of input.wrappedKeys) {
          await tx
            .insertInto("wrapped_org_keys")
            .values({
              user_id: wrap.userId,
              wrapped_key: wrap.wrappedKey,
              nonce: wrap.nonce,
            })
            .execute();
        }
      });
    },
  };
}
