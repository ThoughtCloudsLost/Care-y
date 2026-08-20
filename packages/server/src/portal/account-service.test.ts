/**
 * DB integration tests for the client account service.
 *
 * Uses describe.skipIf(!DATABASE_URL) and createTestDb() per the
 * testing-reference.md idioms. Each suite gets an isolated schema.
 */

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import { getSodium, hashChannelAuth } from "@care-y/crypto";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestClientFixture,
  createTestTicketFixture,
  testBlindIndexer,
  noopEncryptor,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { deriveFakeSaltKey } from "../auth/salt-defense.js";
import { createChannel, type ChannelRegistration } from "./channel-service.js";
import {
  getSaltForUsername,
  createAccount,
  upgradeFromSecureLink,
  login,
  resolveAccountSession,
  changePassword,
  resetAccount,
  logout,
  type AccountRegistrationInput,
  type AccountServiceDeps,
  type RewrappedMessageInput,
} from "./account-service.js";
import { UsernameTakenError } from "./portal-errors.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_OPS_HEX =
  "cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe";

function makeAccountReg(
  overrides?: Partial<AccountRegistrationInput>,
): AccountRegistrationInput {
  return {
    accountId: crypto.randomUUID(),
    username: `user-${crypto.randomUUID().slice(0, 8)}`,
    salt: crypto.randomBytes(16),
    publicKey: crypto.randomBytes(32),
    authHash: crypto.randomBytes(32),
    keyCheck: {
      ephemeralPoint: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      ciphertext: crypto.randomBytes(48),
    },
    ...overrides,
  };
}

function makeChannelReg(
  overrides?: Partial<ChannelRegistration>,
): ChannelRegistration {
  return {
    channelId: crypto.randomBytes(24).toString("hex"),
    authHash: crypto.randomBytes(32),
    clientPublic: crypto.randomBytes(32),
    hasPassphrase: false,
    keyCheck: {
      ephemeralPoint: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      ciphertext: crypto.randomBytes(48),
    },
    ...overrides,
  };
}

async function insertClient(db: Kysely<TenantDatabase>): Promise<string> {
  const fixture = await createTestClientFixture(db);
  return fixture.clientId;
}

async function insertFollowup(
  db: Kysely<TenantDatabase>,
  ticketId: string,
): Promise<string> {
  const row = await db
    .insertInto("followups")
    .values({
      ticket_id: ticketId,
      source: "volunteer",
      type: "message",
      encrypted_content: noopEncryptor.encrypt("test content"),
      created_by: null,
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

async function insertPortalMessage(
  db: Kysely<TenantDatabase>,
  channelRowId: string,
  followupId: string,
): Promise<string> {
  const row = await db
    .insertInto("portal_messages")
    .values({
      channel_id: channelRowId,
      followup_id: followupId,
      direction: "to_client",
      ephemeral_point: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      ciphertext: crypto.randomBytes(48),
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)("AccountService", () => {
  let testDb: TestDb;
  let db: Kysely<TenantDatabase>;
  let deps: AccountServiceDeps;

  beforeAll(async () => {
    await getSodium();
    testDb = await createTestDb();
    db = testDb.db;

    const fakeSaltKey = await deriveFakeSaltKey(TEST_OPS_HEX);
    deps = {
      indexer: testBlindIndexer,
      fakeSaltKey,
      orgUuid: TEST_ORG_ID,
    };
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  // -----------------------------------------------------------------------
  // getSaltForUsername
  // -----------------------------------------------------------------------

  describe("getSaltForUsername", () => {
    it("returns real salt and id for an existing account", async () => {
      const clientId = await insertClient(db);
      const reg = makeAccountReg();

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      const result = await getSaltForUsername(db, deps, reg.username);
      expect(Buffer.compare(result.salt, reg.salt)).toBe(0);
      expect(result.accountId).toBe(reg.accountId);
    });

    it("returns deterministic fakes for unknown usernames", async () => {
      const result1 = await getSaltForUsername(db, deps, "nonexistent-alpha");
      const result2 = await getSaltForUsername(db, deps, "nonexistent-alpha");

      // Same fake salt and id for the same unknown username
      expect(Buffer.compare(result1.salt, result2.salt)).toBe(0);
      expect(result1.accountId).toBe(result2.accountId);

      // Salt is 16 bytes
      expect(result1.salt.length).toBe(16);

      // AccountId looks like a UUID
      expect(result1.accountId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("normalization parity: registration and lookup produce the same result", async () => {
      const clientId = await insertClient(db);
      const reg = makeAccountReg({ username: "Ada Lovelace " });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      // Lookup with differently-cased, differently-spaced input
      const result = await getSaltForUsername(db, deps, "ada lovelace");
      expect(Buffer.compare(result.salt, reg.salt)).toBe(0);
      expect(result.accountId).toBe(reg.accountId);
    });
  });

  // -----------------------------------------------------------------------
  // createAccount
  // -----------------------------------------------------------------------

  describe("createAccount", () => {
    it("sets tier to account and inserts channel with kind=account", async () => {
      const clientId = await insertClient(db);
      const reg = makeAccountReg();

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      // Verify tier
      const client = await db
        .selectFrom("clients")
        .select("communication_tier")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();
      expect(client.communication_tier).toBe("account");

      // Verify channel row
      const channel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();
      expect(channel.kind).toBe("account");
      expect(channel.account_offer).toBe(false);
      expect(Buffer.compare(channel.client_public, reg.publicKey)).toBe(0);

      // Verify account row
      const account = await db
        .selectFrom("client_accounts")
        .selectAll()
        .where("id", "=", reg.accountId)
        .executeTakeFirstOrThrow();
      expect(account.client_id).toBe(clientId);
      expect(Buffer.compare(account.salt, reg.salt)).toBe(0);
      expect(Buffer.compare(account.public_key, reg.publicKey)).toBe(0);
      expect(Buffer.compare(account.auth_hash, reg.authHash)).toBe(0);
    });

    it("rejects duplicate usernames via UsernameTakenError", async () => {
      const clientId1 = await insertClient(db);
      const clientId2 = await insertClient(db);
      const username = `unique-${crypto.randomUUID().slice(0, 8)}`;
      const reg1 = makeAccountReg({ username });
      const reg2 = makeAccountReg({ username });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId1, reg1);
      });

      await expect(
        db.transaction().execute(async (trx) => {
          await createAccount(trx, deps, clientId2, reg2);
        }),
      ).rejects.toThrow(UsernameTakenError);
    });
  });

  // -----------------------------------------------------------------------
  // upgradeFromSecureLink
  // -----------------------------------------------------------------------

  describe("upgradeFromSecureLink", () => {
    it("revokes old channel, moves+swaps copies, deletes the rest", async () => {
      // Set up a client with a secure link channel and some messages
      const fixture = await createTestTicketFixture(db);
      const clientId = fixture.clientId;
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuth));
      const channelReg = makeChannelReg({ authHash });
      await createChannel(db, clientId, channelReg);

      const oldChannel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      // Insert two messages
      const followup1 = await insertFollowup(db, fixture.ticketId);
      const followup2 = await insertFollowup(db, fixture.ticketId);
      const msgId1 = await insertPortalMessage(db, oldChannel.id, followup1);
      const msgId2 = await insertPortalMessage(db, oldChannel.id, followup2);

      // Age the message the client will NOT re-encrypt: the stale guard
      // aborts only when a non-re-encrypted row is NEWER than the newest
      // re-encrypted one (a volunteer reply racing the upgrade). An older
      // skipped row is the normal delete-the-rest path.
      await db
        .updateTable("portal_messages")
        .set({ created_at: new Date(Date.now() - 60_000) })
        .where("id", "=", msgId2)
        .execute();

      // Re-encrypt only the first message
      const newCopy = {
        ephemeralPoint: crypto.randomBytes(32),
        nonce: crypto.randomBytes(24),
        ciphertext: crypto.randomBytes(48),
      };
      const rewrapped: RewrappedMessageInput[] = [
        { id: msgId1, copy: newCopy },
      ];

      const accountReg = makeAccountReg();

      await upgradeFromSecureLink(db, deps, oldChannel, accountReg, rewrapped);

      // Old channel is revoked
      const oldRow = await db
        .selectFrom("portal_channels")
        .select(["status", "revoked_at"])
        .where("id", "=", oldChannel.id)
        .executeTakeFirstOrThrow();
      expect(oldRow.status).toBe("revoked");
      expect(oldRow.revoked_at).not.toBeNull();

      // New channel is active with kind=account
      const newChannel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();
      expect(newChannel.kind).toBe("account");

      // Re-encrypted message exists on the new channel
      const movedMsg = await db
        .selectFrom("portal_messages")
        .select(["channel_id", "ephemeral_point"])
        .where("id", "=", msgId1)
        .executeTakeFirst();
      expect(movedMsg).not.toBeNull();
      expect(movedMsg!.channel_id).toBe(newChannel.id);
      expect(
        Buffer.compare(movedMsg!.ephemeral_point, newCopy.ephemeralPoint),
      ).toBe(0);

      // Non-re-encrypted message was deleted
      const deletedMsg = await db
        .selectFrom("portal_messages")
        .select("id")
        .where("id", "=", msgId2)
        .executeTakeFirst();
      expect(deletedMsg).toBeUndefined();

      // Old channel messages are gone
      const oldMsgs = await db
        .selectFrom("portal_messages")
        .select("id")
        .where("channel_id", "=", oldChannel.id)
        .execute();
      expect(oldMsgs).toHaveLength(0);

      // Tier is 'account'
      const client = await db
        .selectFrom("clients")
        .select("communication_tier")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();
      expect(client.communication_tier).toBe("account");
    });

    it("fragment-auth resolve of old channel fails after upgrade", async () => {
      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuth));
      const channelReg = makeChannelReg({ authHash });
      await createChannel(db, clientId, channelReg);

      const oldChannel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      const accountReg = makeAccountReg();
      await upgradeFromSecureLink(db, deps, oldChannel, accountReg, []);

      // Import resolveAuthedChannel to verify the old channel is inaccessible
      const { resolveAuthedChannel } = await import("./channel-service.js");
      const result = await resolveAuthedChannel(
        db,
        channelReg.channelId,
        rawAuth,
      );
      expect(result).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // login
  // -----------------------------------------------------------------------

  describe("login", () => {
    it("happy path: returns a session token whose hash is in the table", async () => {
      const clientId = await insertClient(db);
      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const reg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      const result = await login(db, reg.accountId, rawAuthToken);
      expect(result).not.toBeNull();
      expect(result!.sessionToken).toBeTruthy();
      expect(result!.expiresAt).toBeInstanceOf(Date);
      expect(result!.expiresAt.getTime()).toBeGreaterThan(Date.now());

      // Verify the token hash is in the table
      const tokenBuf = Buffer.from(result!.sessionToken, "base64url");
      const tokenHash = Buffer.from(hashChannelAuth(tokenBuf));
      const session = await db
        .selectFrom("client_account_sessions")
        .select("account_id")
        .where("token_hash", "=", tokenHash)
        .executeTakeFirst();
      expect(session).not.toBeUndefined();
      expect(session!.account_id).toBe(reg.accountId);
    });

    it("wrong token returns null", async () => {
      const clientId = await insertClient(db);
      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const reg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      const wrongToken = crypto.randomBytes(32);
      const result = await login(db, reg.accountId, wrongToken);
      expect(result).toBeNull();
    });

    it("unknown account id returns null", async () => {
      const unknownId = crypto.randomUUID();
      const result = await login(db, unknownId, crypto.randomBytes(32));
      expect(result).toBeNull();
    });

    it("wrong-token and unknown-id return null indistinguishably", async () => {
      const clientId = await insertClient(db);
      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const reg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      const wrongResult = await login(
        db,
        reg.accountId,
        crypto.randomBytes(32),
      );
      const unknownResult = await login(
        db,
        crypto.randomUUID(),
        crypto.randomBytes(32),
      );

      // Both are null, indistinguishable
      expect(wrongResult).toBeNull();
      expect(unknownResult).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // resolveAccountSession
  // -----------------------------------------------------------------------

  describe("resolveAccountSession", () => {
    it("returns account and channel for a valid session", async () => {
      const clientId = await insertClient(db);
      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const reg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      const loginResult = await login(db, reg.accountId, rawAuthToken);
      expect(loginResult).not.toBeNull();

      const session = await resolveAccountSession(
        db,
        loginResult!.sessionToken,
      );
      expect(session).not.toBeNull();
      expect(session!.account.id).toBe(reg.accountId);
      expect(session!.account.client_id).toBe(clientId);
      expect(session!.channel.kind).toBe("account");
      expect(session!.channel.status).toBe("active");
      expect(session!.channel.client_id).toBe(clientId);
    });

    it("returns null for expired session", async () => {
      const clientId = await insertClient(db);
      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const reg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      const loginResult = await login(db, reg.accountId, rawAuthToken);
      expect(loginResult).not.toBeNull();

      // Manually expire the session
      const tokenBuf = Buffer.from(loginResult!.sessionToken, "base64url");
      const tokenHash = Buffer.from(hashChannelAuth(tokenBuf));
      await db
        .updateTable("client_account_sessions")
        .set({ expires_at: new Date(Date.now() - 1000) })
        .where("token_hash", "=", tokenHash)
        .execute();

      const session = await resolveAccountSession(
        db,
        loginResult!.sessionToken,
      );
      expect(session).toBeNull();
    });

    it("returns null for unknown token", async () => {
      const fakeToken = crypto.randomBytes(32).toString("base64url");
      const session = await resolveAccountSession(db, fakeToken);
      expect(session).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // changePassword
  // -----------------------------------------------------------------------

  describe("changePassword", () => {
    it("verifies current token, swaps key material + copies, kills other sessions", async () => {
      // Create account and log in from two sessions
      const clientId = await insertClient(db);
      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const reg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      const login1 = await login(db, reg.accountId, rawAuthToken);
      const login2 = await login(db, reg.accountId, rawAuthToken);
      expect(login1).not.toBeNull();
      expect(login2).not.toBeNull();

      // Resolve session 1 for the changePassword call
      const resolved = await resolveAccountSession(db, login1!.sessionToken);
      expect(resolved).not.toBeNull();

      // The presented proof is the hash of the ACCOUNT auth token; the
      // resolved session's tokenHash identifies the surviving session.
      const currentAuthTokenHash = Buffer.from(hashChannelAuth(rawAuthToken));

      // New key material
      const newSalt = crypto.randomBytes(16);
      const newPublicKey = crypto.randomBytes(32);
      const newAuthHash = crypto.randomBytes(32);
      const newKeyCheck = {
        ephemeralPoint: crypto.randomBytes(32),
        nonce: crypto.randomBytes(24),
        ciphertext: crypto.randomBytes(48),
      };

      const changed = await changePassword(
        db,
        resolved!.account,
        resolved!.channel,
        currentAuthTokenHash,
        resolved!.tokenHash,
        {
          salt: newSalt,
          publicKey: newPublicKey,
          authHash: newAuthHash,
          keyCheck: newKeyCheck,
          rewrappedMessages: [],
        },
      );
      expect(changed).toBe(true);

      // Account has new key material
      const updatedAccount = await db
        .selectFrom("client_accounts")
        .selectAll()
        .where("id", "=", reg.accountId)
        .executeTakeFirstOrThrow();
      expect(Buffer.compare(updatedAccount.salt, newSalt)).toBe(0);
      expect(Buffer.compare(updatedAccount.public_key, newPublicKey)).toBe(0);
      expect(Buffer.compare(updatedAccount.auth_hash, newAuthHash)).toBe(0);

      // Channel has new public key and key check
      const updatedChannel = await db
        .selectFrom("portal_channels")
        .select(["client_public", "key_check_ephemeral_point"])
        .where("id", "=", resolved!.channel.id)
        .executeTakeFirstOrThrow();
      expect(Buffer.compare(updatedChannel.client_public, newPublicKey)).toBe(
        0,
      );
      expect(
        Buffer.compare(
          updatedChannel.key_check_ephemeral_point,
          newKeyCheck.ephemeralPoint,
        ),
      ).toBe(0);

      // Session 1 still exists
      const session1 = await resolveAccountSession(db, login1!.sessionToken);
      expect(session1).not.toBeNull();

      // Session 2 was revoked
      const session2 = await resolveAccountSession(db, login2!.sessionToken);
      expect(session2).toBeNull();
    });

    it("wrong currentAuthToken is a no-op (does not update anything)", async () => {
      const clientId = await insertClient(db);
      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const reg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      const loginResult = await login(db, reg.accountId, rawAuthToken);
      const resolved = await resolveAccountSession(
        db,
        loginResult!.sessionToken,
      );

      // Wrong hash
      const wrongHash = crypto.randomBytes(32);

      const newSalt = crypto.randomBytes(16);
      const changed = await changePassword(
        db,
        resolved!.account,
        resolved!.channel,
        wrongHash,
        resolved!.tokenHash,
        {
          salt: newSalt,
          publicKey: crypto.randomBytes(32),
          authHash: crypto.randomBytes(32),
          keyCheck: {
            ephemeralPoint: crypto.randomBytes(32),
            nonce: crypto.randomBytes(24),
            ciphertext: crypto.randomBytes(48),
          },
          rewrappedMessages: [],
        },
      );
      expect(changed).toBe(false);

      // Account still has old salt
      const account = await db
        .selectFrom("client_accounts")
        .select("salt")
        .where("id", "=", reg.accountId)
        .executeTakeFirstOrThrow();
      expect(Buffer.compare(account.salt, reg.salt)).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // resetAccount
  // -----------------------------------------------------------------------

  describe("resetAccount", () => {
    it("removes account, revokes channel, deletes copies, resets tier", async () => {
      const fixture = await createTestTicketFixture(db);
      const clientId = fixture.clientId;

      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const reg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      // Insert a portal message on the account channel
      const channel = await db
        .selectFrom("portal_channels")
        .select("id")
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .where("kind", "=", "account")
        .executeTakeFirstOrThrow();
      const followupId = await insertFollowup(db, fixture.ticketId);
      await insertPortalMessage(db, channel.id, followupId);

      // Log in to create a session
      await login(db, reg.accountId, rawAuthToken);

      // Reset
      await resetAccount(db, clientId);

      // Account row deleted
      const deletedAccount = await db
        .selectFrom("client_accounts")
        .select("id")
        .where("id", "=", reg.accountId)
        .executeTakeFirst();
      expect(deletedAccount).toBeUndefined();

      // Sessions cascaded
      const sessions = await db
        .selectFrom("client_account_sessions")
        .select("id")
        .where("account_id", "=", reg.accountId)
        .execute();
      expect(sessions).toHaveLength(0);

      // Channel revoked (not deleted)
      const revokedChannel = await db
        .selectFrom("portal_channels")
        .select(["status", "revoked_at"])
        .where("id", "=", channel.id)
        .executeTakeFirstOrThrow();
      expect(revokedChannel.status).toBe("revoked");
      expect(revokedChannel.revoked_at).not.toBeNull();

      // Portal messages deleted
      const msgs = await db
        .selectFrom("portal_messages")
        .select("id")
        .where("channel_id", "=", channel.id)
        .execute();
      expect(msgs).toHaveLength(0);

      // Tier reset
      const client = await db
        .selectFrom("clients")
        .select("communication_tier")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();
      expect(client.communication_tier).toBe("sms_email");
    });

    it("no-op when no account exists", async () => {
      const clientId = await insertClient(db);

      // Should not throw
      await resetAccount(db, clientId);

      const client = await db
        .selectFrom("clients")
        .select("communication_tier")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();
      expect(client.communication_tier).toBe("sms_email");
    });
  });

  // -----------------------------------------------------------------------
  // logout
  // -----------------------------------------------------------------------

  describe("logout", () => {
    it("deletes the session row", async () => {
      const clientId = await insertClient(db);
      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const reg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, deps, clientId, reg);
      });

      const loginResult = await login(db, reg.accountId, rawAuthToken);
      expect(loginResult).not.toBeNull();

      // Session resolves before logout
      const before = await resolveAccountSession(db, loginResult!.sessionToken);
      expect(before).not.toBeNull();

      await logout(db, loginResult!.sessionToken);

      // Session does not resolve after logout
      const after = await resolveAccountSession(db, loginResult!.sessionToken);
      expect(after).toBeNull();
    });

    it("is idempotent (no error on missing session)", async () => {
      const fakeToken = crypto.randomBytes(32).toString("base64url");
      await expect(logout(db, fakeToken)).resolves.toBeUndefined();
    });
  });
});
