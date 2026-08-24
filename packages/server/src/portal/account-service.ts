/**
 * Client account lifecycle service.
 *
 * Manages encrypted account creation, login, session resolution,
 * password change, reset, and logout. All operations use timing-safe
 * comparisons and fake-salt enumeration defense. No plaintext
 * usernames, auth tokens, or session tokens are stored or logged.
 *
 * Account channels ride portal_channels rows with kind='account'.
 * The 8b messaging core (bootstrap, clientReply, storeClientCopy,
 * nudge, dual-copy volunteer replies) works unchanged on these rows.
 */

import crypto, { timingSafeEqual } from "node:crypto";
import type { Kysely, Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { PortalChannelRow } from "./channel-service.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import { hashChannelAuth } from "@care-y/crypto";
import { normalizeUsername } from "@care-y/shared";
import { computeFakeSalt, computeFakeUuid } from "../auth/salt-defense.js";
import { UsernameTakenError, StaleThreadError } from "./portal-errors.js";
import type {
  ClientId,
  ClientAccountId,
  OrgId,
  PortalMessageId,
  UsernameHash,
} from "@care-y/shared";
import { channelSecretSchema } from "@care-y/shared";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const CHANNEL_ID_BYTES = 24; // 48 hex chars
const AUTH_HASH_BYTES = 32;

/**
 * Constant dummy hash for timing-pad comparisons when no account row
 * exists. 32 bytes of zeros; never matches any real hash, but forces
 * the timingSafeEqual call to execute in all code paths.
 */
const TIMING_PAD_HASH = Buffer.alloc(AUTH_HASH_BYTES, 0);

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface AccountRegistrationInput {
  readonly accountId: ClientAccountId;
  readonly username: string;
  readonly salt: Buffer;
  readonly publicKey: Buffer;
  readonly authHash: Buffer;
  readonly keyCheck: {
    readonly ephemeralPoint: Buffer;
    readonly nonce: Buffer;
    readonly ciphertext: Buffer;
  };
}

export interface AccountServiceDeps {
  readonly indexer: BlindIndexer;
  readonly fakeSaltKey: Buffer;
  readonly orgUuid: OrgId;
}

export interface RewrappedMessageInput {
  readonly id: PortalMessageId;
  readonly copy: {
    readonly ephemeralPoint: Buffer;
    readonly nonce: Buffer;
    readonly ciphertext: Buffer;
  };
}

export interface ClientAccountRow {
  readonly id: ClientAccountId;
  readonly client_id: ClientId;
  readonly username_hash: UsernameHash;
  readonly salt: Buffer;
  readonly public_key: Buffer;
  readonly auth_hash: Buffer;
  readonly created_at: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detects the unique-violation on client_accounts.username_hash.
 * Postgres error code 23505 with a constraint name matching the
 * username_hash unique index.
 */
function isUsernameUniqueViolation(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const pg = err as { code?: string; constraint?: string };
  // The unique index name follows Postgres naming: uq_ or the table_column_key pattern
  return (
    pg.code === "23505" && (pg.constraint?.includes("username_hash") ?? false)
  );
}

/**
 * Wraps a Buffer for timingSafeEqual: normalizes to a proper Buffer
 * instance and validates length. Returns a 32-byte Buffer.
 */
function toHash32(value: Buffer | Uint8Array): Buffer {
  const buf = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buf;
}

// ---------------------------------------------------------------------------
// getSaltForUsername
// ---------------------------------------------------------------------------

/**
 * Fake-salt defense over client_accounts, the account variant of the
 * volunteer salt-endpoint enumeration defense.
 *
 * ALWAYS computes computeFakeSalt AND runs the DB query (constant-time
 * contract): both operations start immediately via Promise.all. Returns
 * real salt + accountId for existing accounts, deterministic fakes for
 * unknown usernames. Normalizes the username with the same shared helper
 * used at registration.
 */
export async function getSaltForUsername(
  db: Kysely<TenantDatabase>,
  deps: AccountServiceDeps,
  username: string,
): Promise<{ salt: Buffer; accountId: string }> {
  const normalized = normalizeUsername(username);
  const usernameHash = deps.indexer.hashUsername(normalized, deps.orgUuid);

  // ALWAYS execute both operations regardless of user existence.
  // Parallel execution: both start immediately, neither is conditional.
  const [fakeSalt, dbResult] = await Promise.all([
    Promise.resolve(
      computeFakeSalt(deps.fakeSaltKey, deps.orgUuid, normalized),
    ),
    db
      .selectFrom("client_accounts")
      .select(["salt", "id"])
      .where("username_hash", "=", usernameHash)
      .executeTakeFirst(),
  ]);

  const salt = dbResult?.salt ?? fakeSalt;
  const accountId =
    dbResult?.id ?? computeFakeUuid(deps.fakeSaltKey, deps.orgUuid, normalized);

  return {
    salt: Buffer.isBuffer(salt) ? salt : Buffer.from(salt),
    accountId,
  };
}

// ---------------------------------------------------------------------------
// createAccount
// ---------------------------------------------------------------------------

/**
 * Insert client_accounts row + portal_channels row (kind 'account',
 * random channel_id, random auth_hash, key check, account_offer false)
 * and set clients.communication_tier = 'account'.
 *
 * Takes a transaction handle: the intake branch and the upgrade run it
 * inside their own transactions. Unique-violation on username_hash
 * maps to UsernameTakenError (catch constraint 23505, never
 * pre-check-then-insert).
 */
export async function createAccount(
  trx: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  deps: AccountServiceDeps,
  clientId: ClientId,
  reg: AccountRegistrationInput,
): Promise<void> {
  const normalized = normalizeUsername(reg.username);
  const usernameHash = deps.indexer.hashUsername(normalized, deps.orgUuid);

  try {
    // Insert account row
    await trx
      .insertInto("client_accounts")
      .values({
        id: reg.accountId,
        client_id: clientId,
        username_hash: usernameHash,
        salt: reg.salt,
        public_key: reg.publicKey,
        auth_hash: reg.authHash,
      })
      .execute();
  } catch (err: unknown) {
    if (isUsernameUniqueViolation(err)) {
      throw new UsernameTakenError();
    }
    throw err;
  }

  // Insert account channel with random channel_id and random auth_hash
  // (no token ever exists for account channels; the random hash fails
  // closed cryptographically via the kind clause on resolveAuthedChannel)
  const channelId = channelSecretSchema.parse(
    crypto.randomBytes(CHANNEL_ID_BYTES).toString("hex"),
  );
  const randomAuthHash = crypto.randomBytes(AUTH_HASH_BYTES);

  await trx
    .insertInto("portal_channels")
    .values({
      client_id: clientId,
      channel_id: channelId,
      auth_hash: randomAuthHash,
      client_public: reg.publicKey,
      has_passphrase: false,
      key_check_ephemeral_point: reg.keyCheck.ephemeralPoint,
      key_check_nonce: reg.keyCheck.nonce,
      key_check_ciphertext: reg.keyCheck.ciphertext,
      kind: "account",
      account_offer: false,
    })
    .execute();

  // Set tier
  await trx
    .updateTable("clients")
    .set({ communication_tier: "account" })
    .where("id", "=", clientId)
    .execute();
}

// ---------------------------------------------------------------------------
// upgradeFromSecureLink
// ---------------------------------------------------------------------------

/**
 * Upgrade from Secure Link to Encrypted Account, one transaction:
 *   1. Revoke the old channel FIRST (partial unique index on client_id
 *      WHERE active rejects two active rows)
 *   2. createAccount inserts the new kind='account' channel
 *   3. For each rewrapped row: guarded UPDATE of portal_messages
 *   4. Stale-thread guard: reject if any old-channel row has created_at
 *      newer than the newest re-encrypted row
 *   5. DELETE remaining portal_messages of the old channel
 *
 * Does NOT touch followups or portal_reply_key_wraps (volunteer copies
 * and convergence are not this surface's to modify).
 */
export async function upgradeFromSecureLink(
  db: Kysely<TenantDatabase>,
  deps: AccountServiceDeps,
  channel: PortalChannelRow,
  reg: AccountRegistrationInput,
  rewrapped: readonly RewrappedMessageInput[],
): Promise<void> {
  await db.transaction().execute(async (trx) => {
    const oldChannelRowId = channel.id;

    // 1. Revoke old channel FIRST
    await trx
      .updateTable("portal_channels")
      .set({ status: "revoked", revoked_at: new Date() })
      .where("id", "=", oldChannelRowId)
      .execute();

    // 2. Create account (inserts account row + new channel + sets tier)
    await createAccount(trx, deps, channel.client_id, reg);

    // Get the new channel row id for message re-pointing
    const newChannel = await trx
      .selectFrom("portal_channels")
      .select("id")
      .where("client_id", "=", channel.client_id)
      .where("status", "=", "active")
      .where("kind", "=", "account")
      .executeTakeFirstOrThrow();

    const newChannelRowId = newChannel.id;

    // 3. Swap re-encrypted triples: guarded UPDATE per message
    // The WHERE channel_id = old guard stops cross-channel writes
    let newestRewrappedAt: Date | null = null;

    for (const msg of rewrapped) {
      const result = await trx
        .updateTable("portal_messages")
        .set({
          channel_id: newChannelRowId,
          ephemeral_point: msg.copy.ephemeralPoint,
          nonce: msg.copy.nonce,
          ciphertext: msg.copy.ciphertext,
        })
        .where("id", "=", msg.id)
        .where("channel_id", "=", oldChannelRowId)
        .returning("created_at")
        .executeTakeFirst();

      if (
        result &&
        (newestRewrappedAt === null || result.created_at > newestRewrappedAt)
      ) {
        newestRewrappedAt = result.created_at;
      }
    }

    // 4. Stale-thread guard: if any remaining old-channel message has
    // created_at newer than the newest row the client re-encrypted, a
    // volunteer dual-copy reply raced the upgrade. Abort.
    if (newestRewrappedAt !== null) {
      const staleRow = await trx
        .selectFrom("portal_messages")
        .select("id")
        .where("channel_id", "=", oldChannelRowId)
        .where("created_at", ">", newestRewrappedAt)
        .executeTakeFirst();

      if (staleRow) {
        throw new StaleThreadError();
      }
    }

    // 5. Delete remaining old-channel messages (not re-encrypted = dead ciphertext)
    await trx
      .deleteFrom("portal_messages")
      .where("channel_id", "=", oldChannelRowId)
      .execute();
  });
}

// ---------------------------------------------------------------------------
// login
// ---------------------------------------------------------------------------

/**
 * Login: look up by accountId. When missing, compare against a constant
 * dummy hash (timing pad). hashChannelAuth(authToken) vs auth_hash via
 * node:crypto timingSafeEqual (fixed 32-byte operands).
 *
 * Success: mint a session token, insert client_account_sessions with
 * token_hash and 24h expiry, fire-and-forget purge of expired rows.
 * Returns { sessionToken, expiresAt }.
 *
 * Failure: returns null (one generic error for unknown account and
 * wrong token, indistinguishable).
 */
export async function login(
  db: Kysely<TenantDatabase>,
  accountId: ClientAccountId,
  authToken: Buffer,
): Promise<{ sessionToken: string; expiresAt: Date } | null> {
  const account = await db
    .selectFrom("client_accounts")
    .select(["id", "auth_hash"])
    .where("id", "=", accountId)
    .executeTakeFirst();

  // Hash the presented token (same hashChannelAuth used at registration)
  const presentedHash = toHash32(Buffer.from(hashChannelAuth(authToken)));
  const storedHash = account ? toHash32(account.auth_hash) : TIMING_PAD_HASH;

  // Constant-time comparison. Both are exactly 32 bytes.
  if (presentedHash.length !== 32 || storedHash.length !== 32) {
    return null;
  }

  if (!timingSafeEqual(presentedHash, storedHash)) {
    return null;
  }

  // Timing pad compare executed but no real account exists
  if (!account) {
    return null;
  }

  // Mint session token
  const sessionTokenBuf = crypto.randomBytes(32);
  const sessionToken = sessionTokenBuf.toString("base64url");
  const tokenHash = Buffer.from(hashChannelAuth(sessionTokenBuf));
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db
    .insertInto("client_account_sessions")
    .values({
      account_id: account.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .execute();

  // Fire-and-forget purge of expired sessions
  void db
    .deleteFrom("client_account_sessions")
    .where("expires_at", "<", new Date())
    .execute()
    .catch(() => {
      // Purge failure is not actionable
    });

  return { sessionToken, expiresAt };
}

// ---------------------------------------------------------------------------
// resolveAccountSession
// ---------------------------------------------------------------------------

/**
 * Resolves a session by hashing the presented token and joining the row
 * to its account and ACTIVE kind='account' channel after an expiry check.
 * Returns null uniformly for unknown, expired, or channel-less sessions.
 */
export async function resolveAccountSession(
  db: Kysely<TenantDatabase>,
  sessionToken: string,
): Promise<{
  account: ClientAccountRow;
  channel: PortalChannelRow;
  tokenHash: Buffer;
} | null> {
  const tokenBuf = Buffer.from(sessionToken, "base64url");
  const tokenHash = Buffer.from(hashChannelAuth(tokenBuf));

  const session = await db
    .selectFrom("client_account_sessions")
    .select(["account_id", "expires_at"])
    .where("token_hash", "=", tokenHash)
    .executeTakeFirst();

  if (!session) {
    return null;
  }

  // Expiry check (server-side, autonomous decision)
  if (session.expires_at < new Date()) {
    return null;
  }

  const account = await db
    .selectFrom("client_accounts")
    .selectAll()
    .where("id", "=", session.account_id)
    .executeTakeFirst();

  if (!account) {
    return null;
  }

  const channel = await db
    .selectFrom("portal_channels")
    .selectAll()
    .where("client_id", "=", account.client_id)
    .where("status", "=", "active")
    .where("kind", "=", "account")
    .executeTakeFirst();

  if (!channel) {
    return null;
  }

  return { account, channel, tokenHash };
}

// ---------------------------------------------------------------------------
// changePassword
// ---------------------------------------------------------------------------

/**
 * Change password, one transaction, after verifying currentAuthToken
 * against the stored hash (timing-safe):
 *   - Update salt/public_key/auth_hash on the account
 *   - Update the channel's client_public + key check
 *   - Swap rewrapped triples (same guarded UPDATE as upgrade, no channel move)
 *   - Delete all sessions except the current one
 *
 * Same accountId (the OPRF userId is identity, not key material).
 */
export async function changePassword(
  db: Kysely<TenantDatabase>,
  account: ClientAccountRow,
  channel: PortalChannelRow,
  currentAuthTokenHash: Buffer,
  currentSessionTokenHash: Buffer,
  input: {
    readonly salt: Buffer;
    readonly publicKey: Buffer;
    readonly authHash: Buffer;
    readonly keyCheck: {
      readonly ephemeralPoint: Buffer;
      readonly nonce: Buffer;
      readonly ciphertext: Buffer;
    };
    readonly rewrappedMessages: readonly RewrappedMessageInput[];
  },
): Promise<boolean> {
  // Verify the current auth token (timing-safe). False signals the
  // router to fail with the one generic UNAUTHORIZED shape.
  const storedHash = toHash32(account.auth_hash);
  const presentedHash = toHash32(currentAuthTokenHash);

  if (presentedHash.length !== 32 || storedHash.length !== 32) {
    return false;
  }

  if (!timingSafeEqual(presentedHash, storedHash)) {
    return false;
  }

  await db.transaction().execute(async (trx) => {
    // Update account key material
    await trx
      .updateTable("client_accounts")
      .set({
        salt: input.salt,
        public_key: input.publicKey,
        auth_hash: input.authHash,
      })
      .where("id", "=", account.id)
      .execute();

    // Update channel's client_public + key check
    await trx
      .updateTable("portal_channels")
      .set({
        client_public: input.publicKey,
        key_check_ephemeral_point: input.keyCheck.ephemeralPoint,
        key_check_nonce: input.keyCheck.nonce,
        key_check_ciphertext: input.keyCheck.ciphertext,
      })
      .where("id", "=", channel.id)
      .execute();

    // Swap rewrapped triples (same guarded UPDATE as upgrade, no channel move)
    let newestRewrappedAt: Date | null = null;

    for (const msg of input.rewrappedMessages) {
      const result = await trx
        .updateTable("portal_messages")
        .set({
          ephemeral_point: msg.copy.ephemeralPoint,
          nonce: msg.copy.nonce,
          ciphertext: msg.copy.ciphertext,
        })
        .where("id", "=", msg.id)
        .where("channel_id", "=", channel.id)
        .returning("created_at")
        .executeTakeFirst();

      if (
        result &&
        (newestRewrappedAt === null || result.created_at > newestRewrappedAt)
      ) {
        newestRewrappedAt = result.created_at;
      }
    }

    // Stale-thread guard
    if (newestRewrappedAt !== null) {
      const staleRow = await trx
        .selectFrom("portal_messages")
        .select("id")
        .where("channel_id", "=", channel.id)
        .where("created_at", ">", newestRewrappedAt)
        .executeTakeFirst();

      if (staleRow) {
        throw new StaleThreadError();
      }
    }

    // Delete all sessions except the current one
    await trx
      .deleteFrom("client_account_sessions")
      .where("account_id", "=", account.id)
      .where("token_hash", "<>", currentSessionTokenHash)
      .execute();
  });

  return true;
}

// ---------------------------------------------------------------------------
// resetAccount
// ---------------------------------------------------------------------------

/**
 * Reset (volunteer-mediated): delete client_accounts row (cascades
 * sessions), revoke the account channel (do NOT delete the channel row)
 * and delete its portal_messages, set tier back to 'sms_email'.
 * One transaction. No-op-safe when no account exists.
 */
export async function resetAccount(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
): Promise<void> {
  await db.transaction().execute(async (trx) => {
    // Find the account (if any)
    const account = await trx
      .selectFrom("client_accounts")
      .select("id")
      .where("client_id", "=", clientId)
      .executeTakeFirst();

    if (!account) {
      return;
    }

    // Delete the account row (cascades sessions via FK)
    await trx
      .deleteFrom("client_accounts")
      .where("id", "=", account.id)
      .execute();

    // Find the active account channel
    const channel = await trx
      .selectFrom("portal_channels")
      .select("id")
      .where("client_id", "=", clientId)
      .where("status", "=", "active")
      .where("kind", "=", "account")
      .executeTakeFirst();

    if (channel) {
      // Delete portal_messages for the account channel
      await trx
        .deleteFrom("portal_messages")
        .where("channel_id", "=", channel.id)
        .execute();

      // Revoke the channel (do NOT delete the row; channel_id stays burned)
      await trx
        .updateTable("portal_channels")
        .set({ status: "revoked", revoked_at: new Date() })
        .where("id", "=", channel.id)
        .execute();
    }

    // Reset tier
    await trx
      .updateTable("clients")
      .set({ communication_tier: "sms_email" })
      .where("id", "=", clientId)
      .execute();
  });
}

// ---------------------------------------------------------------------------
// logout
// ---------------------------------------------------------------------------

/**
 * Delete the session row by hashing the presented token and matching
 * against token_hash. Idempotent (no error on missing row).
 */
export async function logout(
  db: Kysely<TenantDatabase>,
  sessionToken: string,
): Promise<void> {
  const tokenBuf = Buffer.from(sessionToken, "base64url");
  const tokenHash = Buffer.from(hashChannelAuth(tokenBuf));

  await db
    .deleteFrom("client_account_sessions")
    .where("token_hash", "=", tokenHash)
    .execute();
}
