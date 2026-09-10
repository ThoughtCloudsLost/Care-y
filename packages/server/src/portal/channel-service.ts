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
import type { Kysely, Selectable, Transaction } from "kysely";
import type { TenantDatabase, PortalChannelsTable } from "../db/types.js";
import { hashChannelAuth } from "@care-y/crypto";
import {
  ChannelAlreadyActiveError,
  PassphraseAlreadySetError,
  PassphraseCountMismatchError,
} from "./portal-errors.js";
import { hasExactMessageCoverage } from "./message-coverage.js";
import { PORTAL_SURFACE_KINDS } from "@care-y/shared";
import type { ClientId, ChannelSecret, PortalMessageId } from "@care-y/shared";

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
 * Regenerate a channel: revoke the old active channel (if any), purge
 * its portal carriers (messages, attachments, recordings), and insert
 * a new registration. All in one transaction. No-op-safe when no
 * active channel exists (plain create).
 */
export async function regenerateChannel(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
  reg: ChannelRegistration,
): Promise<void> {
  await db.transaction().execute(async (trx) => {
    // Kind-agnostic: regeneration replaces any active channel regardless of kind
    const active = await trx
      .selectFrom("portal_channels")
      .select("id")
      .where("client_id", "=", clientId)
      .where("status", "=", "active")
      .executeTakeFirst();

    if (active) {
      // Purge portal carriers for the old channel. The expiry-bounded
      // copy lifetime (ADR-092) means no carrier row should outlive
      // the channel it was sealed to.
      await trx
        .deleteFrom("portal_attachments")
        .where("channel_id", "=", active.id)
        .execute();

      await trx
        .deleteFrom("portal_recordings")
        .where("channel_id", "=", active.id)
        .execute();

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
 * Revoke the active channel, purge its portal carriers (messages,
 * attachments, recordings), and reset the client's tier back to
 * sms_email. No-op if no active channel exists.
 */
export async function revokeChannel(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
): Promise<void> {
  await db.transaction().execute(async (trx) => {
    // Kind-agnostic: revocation applies to any active channel regardless of kind
    const active = await trx
      .selectFrom("portal_channels")
      .select("id")
      .where("client_id", "=", clientId)
      .where("status", "=", "active")
      .executeTakeFirst();

    if (active) {
      // Purge portal carriers for the old channel. The expiry-bounded
      // copy lifetime (ADR-092) means no carrier row should outlive
      // the channel it was sealed to.
      await trx
        .deleteFrom("portal_attachments")
        .where("channel_id", "=", active.id)
        .execute();

      await trx
        .deleteFrom("portal_recordings")
        .where("channel_id", "=", active.id)
        .execute();

      await trx
        .deleteFrom("portal_messages")
        .where("channel_id", "=", active.id)
        .execute();

      await trx
        .updateTable("portal_channels")
        .set({ status: "revoked", revoked_at: new Date() })
        .where("id", "=", active.id)
        .execute();

      // Only reset tier when a channel was actually revoked
      await trx
        .updateTable("clients")
        .set({ communication_tier: "sms_email" })
        .where("id", "=", clientId)
        .execute();
    }
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
    .where("kind", "in", [...PORTAL_SURFACE_KINDS])
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

// ---------------------------------------------------------------------------
// Channel status lookup for OPRF gating (ADR-091)
// ---------------------------------------------------------------------------

/**
 * Minimal row returned by lookupChannelForOprf: status and auth_hash
 * regardless of channel status. The OPRF evaluate path uses this to
 * decide whether to allow, require auth, or refuse evaluation.
 */
export interface ChannelOprfLookup {
  readonly status: string;
  readonly auth_hash: Buffer;
}

/**
 * Look up a channel row by channel_id, returning status and auth_hash
 * regardless of channel status. Returns null when no row exists for
 * the given channelId (the mint path, where evaluation is allowed).
 *
 * This is intentionally status-agnostic: the caller (OPRF evaluate
 * service) decides the gating rules per status.
 */
export async function lookupChannelForOprf(
  db: Kysely<TenantDatabase>,
  channelId: ChannelSecret,
): Promise<ChannelOprfLookup | null> {
  const row = await db
    .selectFrom("portal_channels")
    .select(["status", "auth_hash"])
    .where("channel_id", "=", channelId)
    .executeTakeFirst();

  if (!row) return null;

  return {
    status: row.status,
    auth_hash: Buffer.isBuffer(row.auth_hash)
      ? row.auth_hash
      : Buffer.from(row.auth_hash),
  };
}

// ---------------------------------------------------------------------------
// Active channel lookup (shared by inbound-sms, followup-service, etc.)
// ---------------------------------------------------------------------------

/**
 * Returns the client's active portal channel, or undefined when none exists.
 *
 * The partial unique index uq_portal_channels_active_client guarantees at
 * most one row matches, so executeTakeFirst is correct.
 *
 * Accepts a plain Kysely handle or a transaction so callers inside a
 * transaction can reuse the same DB session.
 */
export async function findActiveChannel(
  db: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  clientId: ClientId,
): Promise<PortalChannelRow | undefined> {
  return db
    .selectFrom("portal_channels")
    .selectAll()
    .where("client_id", "=", clientId)
    .where("status", "=", "active")
    .executeTakeFirst();
}

// ---------------------------------------------------------------------------
// Active channel summary (used by merge UI)
// ---------------------------------------------------------------------------

export interface ActiveChannelSummary {
  readonly kind: string;
  readonly createdAt: Date;
  readonly hasPassphrase: boolean;
}

/**
 * Returns metadata for the client's active portal channel, or null when
 * no active channel exists. Used by the merge confirmation UI to surface
 * channel collision info.
 */
export async function getActiveChannelSummary(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
): Promise<ActiveChannelSummary | null> {
  const row = await db
    .selectFrom("portal_channels")
    .select(["kind", "created_at", "has_passphrase"])
    .where("client_id", "=", clientId)
    .where("status", "=", "active")
    .executeTakeFirst();

  if (!row) return null;

  return {
    kind: row.kind,
    createdAt: row.created_at,
    hasPassphrase: row.has_passphrase,
  };
}

// ---------------------------------------------------------------------------
// Add passphrase to a bare-link channel
// ---------------------------------------------------------------------------

/** ECIES triple as Buffers, matching the portal message service shape. */
export interface EciesTripleBuffers {
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly ciphertext: Buffer;
}

/** A single re-sealed portal message row. */
export interface ResealedMessageInput {
  readonly id: PortalMessageId;
  readonly copy: EciesTripleBuffers;
}

/** Input for the addPassphrase transaction. */
export interface AddPassphraseInput {
  readonly clientPublic: Buffer;
  readonly keyCheck: EciesTripleBuffers;
  readonly resealedMessages: readonly ResealedMessageInput[];
  /** Messages the client could not decrypt and declares as left out of
   *  the re-seal. They stay sealed to the superseded key (they were
   *  already unreadable to the client), but declaring them keeps the
   *  coverage check exact. */
  readonly skippedMessageIds: readonly PortalMessageId[];
}

/**
 * Atomically add a passphrase to a bare-link channel.
 *
 * One transaction swaps client_public, the key_check triple,
 * has_passphrase = true, and every portal_messages row for the channel.
 *
 * Rejects when:
 *   - has_passphrase is already true (PassphraseAlreadySetError)
 *   - resealedMessages + skippedMessageIds do not exactly cover the
 *     channel's portal_messages rows at transaction time
 *     (PassphraseCountMismatchError: a concurrent inbound copy landed
 *     in neither list, or the ID sets overlap or contain strays; the
 *     client refetches and retries)
 */
export async function addPassphrase(
  db: Kysely<TenantDatabase>,
  channel: PortalChannelRow,
  input: AddPassphraseInput,
): Promise<void> {
  if (channel.has_passphrase) {
    throw new PassphraseAlreadySetError();
  }

  await db.transaction().execute(async (trx) => {
    // Re-check inside the transaction (serializable guard)
    const current = await trx
      .selectFrom("portal_channels")
      .select("has_passphrase")
      .where("id", "=", channel.id)
      .where("status", "=", "active")
      .executeTakeFirst();

    if (!current || current.has_passphrase) {
      throw new PassphraseAlreadySetError();
    }

    // Coverage check inside the transaction: resealed + skipped must
    // exactly partition the channel's current rows, so a concurrent
    // inbound copy (in neither set) aborts rather than being orphaned.
    const rows = await trx
      .selectFrom("portal_messages")
      .select("id")
      .where("channel_id", "=", channel.id)
      .execute();

    const covered = hasExactMessageCoverage(
      rows.map((row) => row.id),
      input.resealedMessages.map((msg) => msg.id),
      input.skippedMessageIds,
    );
    if (!covered) {
      throw new PassphraseCountMismatchError();
    }

    // Swap channel columns
    await trx
      .updateTable("portal_channels")
      .set({
        client_public: input.clientPublic,
        has_passphrase: true,
        key_check_ephemeral_point: input.keyCheck.ephemeralPoint,
        key_check_nonce: input.keyCheck.nonce,
        key_check_ciphertext: input.keyCheck.ciphertext,
      })
      .where("id", "=", channel.id)
      .execute();

    // Swap each portal_messages row's ciphertext triple.
    // The WHERE channel_id guard prevents cross-channel writes.
    for (const msg of input.resealedMessages) {
      await trx
        .updateTable("portal_messages")
        .set({
          ephemeral_point: msg.copy.ephemeralPoint,
          nonce: msg.copy.nonce,
          ciphertext: msg.copy.ciphertext,
        })
        .where("id", "=", msg.id)
        .where("channel_id", "=", channel.id)
        .execute();
    }
  });
}
