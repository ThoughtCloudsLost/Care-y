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
 *
 * Rotation touches only this volunteer's own rows (user_keys,
 * ticket_key_wraps, wrapped_org_keys). The org key itself does not
 * change, so pending intake and portal reply wraps sealed to the org
 * public key are unaffected; org key rotation lives in
 * org-reseal-service.ts.
 */

import type { Kysely, Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { KeyRotationError, ConflictError } from "../errors.js";
import { isPgUniqueViolation } from "../db/pg-errors.js";
import { ErrorCode } from "@care-y/shared";
import type { UserId, TicketId, KeyGeneration } from "@care-y/shared";

/**
 * Thrown when the volunteer holds a ticket key wrap the re-wrap set does
 * not cover: a wrap was granted after the client fetched its list. The
 * client refetches its wraps and retries; nothing is written.
 */
export class StaleKeyWrapsError extends ConflictError {
  constructor() {
    super(ErrorCode.STALE_KEY_WRAPS);
  }
}

export interface ReWrappedKey {
  readonly ticketId: TicketId;
  readonly keyGeneration: KeyGeneration;
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
  readonly userId: UserId;
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
    userId: UserId,
    salt: Buffer,
    volPublic: Buffer,
  ): Promise<void>;

  /** Returns whether a rotation lock is active for this user. */
  getRotationStatus(userId: UserId): Promise<{ inProgress: boolean }>;

  /** Acquires rotation lock. Throws KeyRotationError if already locked. */
  acquireLock(userId: UserId): Promise<void>;

  /** Releases rotation lock unconditionally. */
  releaseLock(userId: UserId): Promise<void>;
}

/** Key for matching a wrap row against a re-wrapped entry. */
function wrapRowKey(ticketId: TicketId, keyGeneration: KeyGeneration): string {
  return `${ticketId}:${keyGeneration}`;
}

/**
 * Applies a rotation on a caller-supplied transaction, so the caller can
 * commit it together with other writes (the password hash on a password
 * change). Must run while the rotation lock is held; clears the lock as
 * part of the same writes.
 *
 * Every wrap the volunteer currently holds must have a re-wrapped entry,
 * otherwise StaleKeyWrapsError. Entries with no current wrap (the ticket
 * was deleted, or its wrap removed, after the client fetched its list)
 * are dropped rather than inserted.
 */
export async function applyRotationInTransaction(
  tx: Transaction<TenantDatabase>,
  input: KeyRotationInput,
): Promise<void> {
  const currentWraps = await tx
    .selectFrom("ticket_key_wraps")
    .select(["ticket_id", "key_generation"])
    .where("volunteer_id", "=", input.userId)
    .execute();

  const submitted = new Set(
    input.reWrappedKeys.map((k) => wrapRowKey(k.ticketId, k.keyGeneration)),
  );
  const current = new Set<string>();
  for (const row of currentWraps) {
    const key = wrapRowKey(row.ticket_id, row.key_generation);
    if (!submitted.has(key)) {
      throw new StaleKeyWrapsError();
    }
    current.add(key);
  }

  const reWraps = input.reWrappedKeys.filter((k) =>
    current.has(wrapRowKey(k.ticketId, k.keyGeneration)),
  );

  await tx
    .deleteFrom("ticket_key_wraps")
    .where("volunteer_id", "=", input.userId)
    .execute();

  if (reWraps.length > 0) {
    await tx
      .insertInto("ticket_key_wraps")
      .values(
        reWraps.map((wrap) => ({
          ticket_id: wrap.ticketId,
          volunteer_id: input.userId,
          key_generation: wrap.keyGeneration,
          ephemeral_point: wrap.ephemeralPoint,
          nonce: wrap.nonce,
          wrapped_key: wrap.wrappedKey,
          algorithm: "ecies-ristretto255-v1",
        })),
      )
      .execute();
  }

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
}

export function createKeyRotationService(
  db: Kysely<TenantDatabase>,
): KeyRotationService {
  return {
    async initCryptoKeys(
      userId: UserId,
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

    async getRotationStatus(userId: UserId): Promise<{ inProgress: boolean }> {
      const row = await db
        .selectFrom("user_keys")
        .select("rotation_lock")
        .where("user_id", "=", userId)
        .executeTakeFirst();
      return { inProgress: row?.rotation_lock ?? false };
    },

    async acquireLock(userId: UserId): Promise<void> {
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

    async releaseLock(userId: UserId): Promise<void> {
      await db
        .updateTable("user_keys")
        .set({ rotation_lock: false })
        .where("user_id", "=", userId)
        .execute();
    },
  };
}
