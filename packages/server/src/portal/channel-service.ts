/**
 * Portal channel lifecycle service.
 *
 * Creates, regenerates, and revokes Secure Link channels for clients.
 * Resolves an authenticated channel for portal procedures by hashing
 * the presented auth token via hashChannelAuth and comparing
 * timing-safe against the stored auth_hash.
 *
 * This service is client-scoped and trusts its caller for access
 * control, same layering as intake-form-service.
 */

import { timingSafeEqual } from "node:crypto";
import type { Kysely, Selectable } from "kysely";
import type { TenantDatabase, PortalChannelsTable } from "../db/types.js";
import { hashChannelAuth } from "@care-y/crypto";
import { ChannelAlreadyActiveError } from "./portal-errors.js";
import type { ClientId, ChannelSecret } from "@care-y/shared";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface ChannelRegistration {
  readonly channelId: ChannelSecret;
  readonly authHash: Buffer;
  readonly clientPublic: Buffer;
  readonly hasPassphrase: boolean;
  readonly keyCheck: {
    readonly ephemeralPoint: Buffer;
    readonly nonce: Buffer;
    readonly ciphertext: Buffer;
  };
}

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

export type PortalChannelRow = Selectable<PortalChannelsTable>;

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Insert a channel row from a registration payload.
 * Extracted to avoid duplication between create and regenerate.
 */
async function insertChannel(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
  reg: ChannelRegistration,
): Promise<void> {
  await db
    .insertInto("portal_channels")
    .values({
      client_id: clientId,
      channel_id: reg.channelId,
      auth_hash: reg.authHash,
      client_public: reg.clientPublic,
      has_passphrase: reg.hasPassphrase,
      key_check_ephemeral_point: reg.keyCheck.ephemeralPoint,
      key_check_nonce: reg.keyCheck.nonce,
      key_check_ciphertext: reg.keyCheck.ciphertext,
    })
    .execute();
}

/**
 * Detects the partial-unique-index violation on portal_channels
 * (uq_portal_channels_active_client). Postgres error code 23505 is
 * unique_violation; the constraint name confirms which index.
 */
function isActiveChannelConstraintViolation(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const pg = err as { code?: string; constraint?: string };
  return (
    pg.code === "23505" && pg.constraint === "uq_portal_channels_active_client"
  );
}

/**
 * Upgrade a client to Secure Link: set communication_tier and insert
 * the channel row in one transaction.
 *
 * Throws ChannelAlreadyActiveError when the partial unique index
 * rejects a second active channel for the same client. The constraint
 * is the authority; no pre-check-then-insert.
 */
export async function createChannel(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
  reg: ChannelRegistration,
): Promise<void> {
  try {
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("clients")
        .set({ communication_tier: "secure_link" })
        .where("id", "=", clientId)
        .execute();

      await insertChannel(trx, clientId, reg);
    });
  } catch (err: unknown) {
    if (isActiveChannelConstraintViolation(err)) {
      throw new ChannelAlreadyActiveError();
    }
    throw err;
  }
}

/**
 * Regenerate a channel: revoke the old active channel (if any), delete
 * its portal_messages, and insert a new registration. All in one
 * transaction. No-op-safe when no active channel exists (plain create).
 */
export async function regenerateChannel(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
  reg: ChannelRegistration,
): Promise<void> {
  await db.transaction().execute(async (trx) => {
    // Find the current active channel (if any).
    const active = await trx
      .selectFrom("portal_channels")
      .select("id")
      .where("client_id", "=", clientId)
      .where("status", "=", "active")
      .executeTakeFirst();

    if (active) {
      // Delete portal_messages for the old channel before revoking.
      await trx
        .deleteFrom("portal_messages")
        .where("channel_id", "=", active.id)
        .execute();

      // Mark old channel as revoked.
      await trx
        .updateTable("portal_channels")
        .set({ status: "revoked", revoked_at: new Date() })
        .where("id", "=", active.id)
        .execute();
    }

    // Set tier (idempotent if already secure_link).
    await trx
      .updateTable("clients")
      .set({ communication_tier: "secure_link" })
      .where("id", "=", clientId)
      .execute();

    await insertChannel(trx, clientId, reg);
  });
}

/**
 * Revoke the active channel, delete its portal_messages, and reset the
 * client's tier back to sms_email. No-op if no active channel exists.
 */
export async function revokeChannel(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
): Promise<void> {
  await db.transaction().execute(async (trx) => {
    const active = await trx
      .selectFrom("portal_channels")
      .select("id")
      .where("client_id", "=", clientId)
      .where("status", "=", "active")
      .executeTakeFirst();

    if (active) {
      await trx
        .deleteFrom("portal_messages")
        .where("channel_id", "=", active.id)
        .execute();

      await trx
        .updateTable("portal_channels")
        .set({ status: "revoked", revoked_at: new Date() })
        .where("id", "=", active.id)
        .execute();
    }

    await trx
      .updateTable("clients")
      .set({ communication_tier: "sms_email" })
      .where("id", "=", clientId)
      .execute();
  });
}

/**
 * Auth-gated channel lookup for portal procedures.
 *
 * Finds the active channel by channel_id, hashes the presented auth
 * token via hashChannelAuth (unkeyed BLAKE2b, same as registration),
 * and compares timing-safe against the stored auth_hash. Both operands
 * are fixed 32-byte hashes, satisfying the equal-length precondition
 * for node:crypto timingSafeEqual.
 *
 * Returns null uniformly for unknown channel_id, revoked status, and
 * bad auth. The caller maps all three to one generic error
 * (enumeration resistance).
 */
export async function resolveAuthedChannel(
  db: Kysely<TenantDatabase>,
  channelId: ChannelSecret,
  auth: Buffer,
): Promise<PortalChannelRow | null> {
  // Look up by channel_id. Only active rows are valid.
  const row = await db
    .selectFrom("portal_channels")
    .selectAll()
    .where("channel_id", "=", channelId)
    .where("status", "=", "active")
    .where("kind", "=", "secure_link")
    .executeTakeFirst();

  if (!row) {
    return null;
  }

  // Hash the presented auth token through the same hashChannelAuth
  // used at registration. The server never stores or receives the raw
  // token at any point after registration.
  const presentedHash = Buffer.from(hashChannelAuth(auth));
  const storedHash = Buffer.isBuffer(row.auth_hash)
    ? row.auth_hash
    : Buffer.from(row.auth_hash);

  // Constant-time comparison. Both are exactly 32 bytes (BLAKE2b output
  // with hash length 32). Never use Buffer.equals here (timing leak on
  // an anonymous endpoint).
  if (presentedHash.length !== 32 || storedHash.length !== 32) {
    return null;
  }

  if (!timingSafeEqual(presentedHash, storedHash)) {
    return null;
  }

  return row;
}
