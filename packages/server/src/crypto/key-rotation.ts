/**
 * Key rotation service for volunteer password change flows.
 *
 * The client does the heavy cryptographic lifting: re-derives masterKey via
 * OPRF, re-wraps all accessible ticket keys with the new vol_private. The
 * server's role is coordination: acquire the rotation lock, accept the new
 * salt + volPublic + re-wrapped keys, update atomically, release the lock.
 *
 * The rotation_lock column is a pessimistic DB flag (survives server
 * restarts). While locked, ticket creation skips this volunteer for ECIES
 * wrapping, preventing wraps to an old vol_public the volunteer can no
 * longer derive.
 */

import { type Kysely, sql } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { KeyRotationError, ConflictError } from "../errors.js";
import { isPgUniqueViolation } from "../db/pg-errors.js";

export interface ReWrappedKey {
  readonly ticketId: string;
  readonly keyGeneration: string;
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

export interface ReWrappedOrgKey {
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

export interface KeyRotationInput {
  readonly userId: string;
  readonly saltNew: Buffer;
  readonly volPublicNew: Buffer;
  readonly reWrappedKeys: readonly ReWrappedKey[];
  readonly reWrappedOrgKey?: ReWrappedOrgKey;
}

export interface KeyRotationService {
  /**
   * First-time crypto key setup: inserts user_keys row with salt + volPublic.
   * Throws ConflictError if a row already exists (prevents salt replacement).
   * Per crypto-architecture-v2.md Section 7 steps 9-10.
   */
  initCryptoKeys(
    userId: string,
    salt: Buffer,
    volPublic: Buffer,
  ): Promise<void>;

  /** Updates volPublic on an existing user_keys row (password change flow). */
  storeVolPublic(userId: string, volPublic: Buffer): Promise<void>;

  /** Returns whether a rotation lock is active for this user. */
  getRotationStatus(userId: string): Promise<{ inProgress: boolean }>;

  /** Acquires rotation lock. Throws KeyRotationError if already locked. */
  acquireLock(userId: string): Promise<void>;

  /** Releases rotation lock unconditionally. */
  releaseLock(userId: string): Promise<void>;

  /**
   * Atomically updates user_keys (salt, vol_public, key_version++)
   * and replaces ticket_key_wraps for this volunteer.
   * Must be called between acquireLock and releaseLock.
   */
  applyRotation(input: KeyRotationInput): Promise<void>;
}

export function createKeyRotationService(
  db: Kysely<TenantDatabase>,
): KeyRotationService {
  return {
    async initCryptoKeys(
      userId: string,
      salt: Buffer,
      volPublic: Buffer,
    ): Promise<void> {
      try {
        await db
          .insertInto("user_keys")
          .values({
            user_id: userId,
            salt,
            vol_public: volPublic,
          })
          .execute();
      } catch (err: unknown) {
        if (isPgUniqueViolation(err)) {
          throw new ConflictError(
            "Crypto keys already initialized for this account",
          );
        }
        throw err;
      }
    },

    async storeVolPublic(userId: string, volPublic: Buffer): Promise<void> {
      await db
        .updateTable("user_keys")
        .set({ vol_public: volPublic })
        .where("user_id", "=", userId)
        .execute();
    },

    async getRotationStatus(userId: string): Promise<{ inProgress: boolean }> {
      const row = await db
        .selectFrom("user_keys")
        .select("rotation_lock")
        .where("user_id", "=", userId)
        .executeTakeFirst();
      return { inProgress: row?.rotation_lock ?? false };
    },

    async acquireLock(userId: string): Promise<void> {
      const result = await db
        .updateTable("user_keys")
        .set({ rotation_lock: true })
        .where("user_id", "=", userId)
        .where("rotation_lock", "=", false)
        .executeTakeFirst();

      if (result.numUpdatedRows === BigInt(0)) {
        throw new KeyRotationError(
          "Key rotation already in progress for this user",
        );
      }
    },

    async releaseLock(userId: string): Promise<void> {
      await db
        .updateTable("user_keys")
        .set({ rotation_lock: false })
        .where("user_id", "=", userId)
        .execute();
    },

    async applyRotation(input: KeyRotationInput): Promise<void> {
      await db.transaction().execute(async (tx) => {
        // Replace salt and volPublic, then increment key_version
        await tx
          .updateTable("user_keys")
          .set({
            salt: input.saltNew,
            vol_public: input.volPublicNew,
            key_version: (eb) => eb("key_version", "+", 1),
            rotated_at: new Date(),
            rotation_lock: false, // release lock in the same transaction
          })
          .where("user_id", "=", input.userId)
          .execute();

        // Delete old wraps for this volunteer and insert new ones.
        // ticket_key_wraps may not have a corresponding table yet (the
        // migration lands with the ticket system). A SAVEPOINT protects
        // the transaction: if the table doesn't exist, PostgreSQL aborts
        // only the savepoint, not the outer transaction.
        if (input.reWrappedKeys.length > 0) {
          await sql`SAVEPOINT rewrap`.execute(tx);
          try {
            // ticket_key_wraps is defined in TenantDatabase but may not
            // have a CREATE TABLE migration yet. The `as never` casts let
            // Kysely issue SQL against a table the schema doesn't guarantee;
            // the catch block below rolls back to the savepoint on failure.
            /* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
            await tx
              .deleteFrom("ticket_key_wraps" as never)
              .where("volunteer_id" as never, "=", input.userId as never)
              .execute();

            for (const wrap of input.reWrappedKeys) {
              await tx
                .insertInto("ticket_key_wraps" as never)
                .values({
                  ticket_id: wrap.ticketId,
                  volunteer_id: input.userId,
                  key_generation: wrap.keyGeneration,
                  ephemeral_point: wrap.ephemeralPoint,
                  nonce: wrap.nonce,
                  wrapped_key: wrap.wrappedKey,
                  algorithm: "ecies-ristretto255-v1",
                } as never)
                .execute();
            }
            /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
            await sql`RELEASE SAVEPOINT rewrap`.execute(tx);
          } catch (err: unknown) {
            // Roll back to the savepoint so the outer transaction (user_keys
            // update) survives. Expected failure modes:
            // - "does not exist": ticket_key_wraps table not yet migrated
            // - FK violation (code 23503): stale ticket reference in re-wrap
            const pgCode =
              err instanceof Error
                ? (err as Error & { code?: string }).code
                : undefined;
            const isTableMissing =
              err instanceof Error && err.message.includes("does not exist");
            const isFkViolation = pgCode === "23503";

            if (isTableMissing || isFkViolation) {
              await sql`ROLLBACK TO SAVEPOINT rewrap`.execute(tx);
            } else {
              throw err;
            }
          }
        }

        if (input.reWrappedOrgKey) {
          await tx
            .updateTable("wrapped_org_keys")
            .set({
              ephemeral_point: input.reWrappedOrgKey.ephemeralPoint,
              nonce: input.reWrappedOrgKey.nonce,
              wrapped_key: input.reWrappedOrgKey.wrappedKey,
            })
            .where("user_id", "=", input.userId)
            .execute();
        }
      });
    },
  };
}
