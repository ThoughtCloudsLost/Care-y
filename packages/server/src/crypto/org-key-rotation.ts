/**
 * Org key rotation orchestration (non-PII tier).
 *
 * Triggered after volunteer offboarding. The actual re-wrapping of the org
 * private key happens client-side: an admin's browser decrypts with the old
 * org key, generates a fresh Curve25519 keypair, and re-encrypts the new
 * private key for each remaining volunteer's volPublic. This module provides
 * the server-side bookkeeping: replace org_public_key, delete old
 * wrapped_org_keys, accept new per-volunteer wrapped copies, and append a
 * generation row carrying the old secret sealed under the new one so
 * pre-rotation ciphertext stays decryptable (chain direction: old secret
 * sealed under new secret, per ADR-107).
 *
 * The admin's browser calls a tRPC endpoint with:
 * { newOrgPublicKey, newGeneration, prevSecretCt, prevNonce,
 *   wrappedKeys: [{ userId, wrappedKey, nonce }] }
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { UserId } from "@care-y/shared";
import { ConflictError } from "../errors.js";

export interface OrgKeyRotationInput {
  readonly newOrgPublicKey: Buffer;
  readonly newGeneration: number;
  /**
   * Outgoing secret sealed under the incoming one. Null only when the
   * outgoing key has no remaining data and no holder needs it again (the
   * dev bootstrap over a throwaway seed key); a null makes that generation
   * permanently unreadable.
   */
  readonly chainedFrom: {
    readonly prevSecretCt: Buffer;
    readonly prevNonce: Buffer;
  } | null;
  readonly wrappedKeys: readonly {
    readonly userId: UserId;
    readonly ephemeralPoint: Buffer;
    readonly wrappedKey: Buffer;
    readonly nonce: Buffer;
  }[];
}

export interface OrgKeyRotationService {
  /**
   * Atomically replaces the org keypair:
   * 1. Reads current_key_generation and guards against race conditions
   * 2. Inserts a generation row with the sealed previous secret
   * 3. Updates org_config.org_public_key and current_key_generation
   * 4. Deletes all existing wrapped_org_keys
   * 5. Inserts new wrapped copies for remaining volunteers
   */
  rotateOrgKey(input: OrgKeyRotationInput): Promise<void>;
}

export function createOrgKeyRotationService(
  db: Kysely<TenantDatabase>,
): OrgKeyRotationService {
  return {
    async rotateOrgKey(input: OrgKeyRotationInput): Promise<void> {
      await db.transaction().execute(async (tx) => {
        // Read current generation and guard against concurrent rotation
        const config = await tx
          .selectFrom("org_config")
          .select("current_key_generation")
          .executeTakeFirstOrThrow();

        const expected = config.current_key_generation + 1;
        if (input.newGeneration !== expected) {
          throw new ConflictError(
            `org key rotation generation conflict: expected ${String(expected)}, got ${String(input.newGeneration)}`,
          );
        }

        // Append generation row with old secret sealed under new secret
        await tx
          .insertInto("org_key_generations")
          .values({
            generation: input.newGeneration,
            public_key: input.newOrgPublicKey,
            prev_secret_ct: input.chainedFrom?.prevSecretCt ?? null,
            prev_nonce: input.chainedFrom?.prevNonce ?? null,
          })
          .execute();

        // Replace org public key and bump generation
        await tx
          .updateTable("org_config")
          .set({
            org_public_key: input.newOrgPublicKey,
            current_key_generation: input.newGeneration,
          })
          .execute();

        // Delete all old wrapped copies
        await tx.deleteFrom("wrapped_org_keys").execute();

        // Insert new wrapped copies for remaining volunteers
        for (const wrap of input.wrappedKeys) {
          await tx
            .insertInto("wrapped_org_keys")
            .values({
              user_id: wrap.userId,
              ephemeral_point: wrap.ephemeralPoint,
              wrapped_key: wrap.wrappedKey,
              nonce: wrap.nonce,
            })
            .execute();
        }
      });
    },
  };
}
