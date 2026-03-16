/**
 * Runtime Tier 1 PII migration: re-encrypts display_name, ip_address,
 * and user_agent from crypto_secretbox (server-readable) to
 * crypto_box_seal (server-blind sealed box).
 *
 * Called once after the first admin uploads org_public_key.
 * Idempotent: callers should check a flag before invoking.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { FieldEncryptor } from "./field-encryptor.js";
import type { SealedBoxEncryptor } from "./sealed-box.js";

export interface Tier1MigrationResult {
  readonly usersProcessed: number;
  readonly sessionsProcessed: number;
}

/**
 * Re-encrypts three PII fields from secretbox to sealed box.
 * Runs inside a transaction. Each row is processed individually
 * to avoid holding multiple plaintext values in memory.
 *
 * NOTE: fieldEncryptor.decrypt() returns a string (immutable, cannot be
 * zeroed). Accepted residual risk for a one-time migration under
 * OPS_SECRETS_KEY. The string will be GC'd. Post-migration, new
 * encryptions use sealed box from the start (no decrypt step).
 */
export async function runTier1Migration(
  db: Kysely<TenantDatabase>,
  fieldEncryptor: FieldEncryptor,
  sealedBox: SealedBoxEncryptor,
): Promise<Tier1MigrationResult> {
  return db.transaction().execute(async (tx) => {
    // Re-encrypt display_name on users table
    const users = await tx
      .selectFrom("users")
      .select(["id", "encrypted_display_name"])
      .execute();

    for (const user of users) {
      // care-y-ignore-next-line server-no-decrypt -- one-time migration: decrypt Tier 2 secretbox to re-encrypt as Tier 1 sealed box (ADR-016)
      const plaintext = fieldEncryptor.decrypt(user.encrypted_display_name);
      const sealed = sealedBox.seal(plaintext);

      // care-y-ignore-next-line no-plaintext-db-write -- sealed is crypto_box_seal ciphertext, not plaintext
      await tx
        .updateTable("users")
        .set({ encrypted_display_name: sealed })
        .where("id", "=", user.id)
        .execute();
    }

    // Re-encrypt ip_address and user_agent on sessions table
    const sessions = await tx
      .selectFrom("sessions")
      .select(["id", "encrypted_ip_address", "encrypted_user_agent"])
      .execute();

    for (const session of sessions) {
      // care-y-ignore-next-line server-no-decrypt -- one-time migration: decrypt Tier 2 secretbox to re-encrypt as Tier 1 sealed box (ADR-016)
      const ip = fieldEncryptor.decrypt(session.encrypted_ip_address);
      // care-y-ignore-next-line server-no-decrypt -- same migration context as above
      const ua = fieldEncryptor.decrypt(session.encrypted_user_agent);

      const sealedIp = sealedBox.seal(ip);
      const sealedUa = sealedBox.seal(ua);

      await tx
        .updateTable("sessions")
        .set({
          encrypted_ip_address: sealedIp,
          encrypted_user_agent: sealedUa,
        })
        .where("id", "=", session.id)
        .execute();
    }

    return {
      usersProcessed: users.length,
      sessionsProcessed: sessions.length,
    };
  });
}
