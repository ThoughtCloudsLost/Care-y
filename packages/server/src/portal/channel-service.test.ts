/**
 * DB integration tests for the portal channel service.
 *
 * Uses describe.skipIf(!DATABASE_URL) and createTestDb() per the
 * testing-reference.md idioms. Each suite gets an isolated schema.
 */

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import { getSodium } from "@care-y/crypto";
import type { TenantDatabase } from "../db/types.js";
import type {
  ClientId,
  TicketId,
  ChannelRowId,
  FollowupId,
} from "@care-y/shared";
import { channelSecretSchema } from "@care-y/shared";
import {
  createTestDb,
  createTestClientFixture,
  createTestTicketFixture,
  noopEncryptor,
  type TestDb,
} from "../test-utils.js";
import {
  createChannel,
  regenerateChannel,
  revokeChannel,
  resolveAuthedChannel,
  getActiveChannelSummary,
  type ChannelRegistration,
} from "./channel-service.js";
import { ChannelAlreadyActiveError } from "./portal-errors.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a ChannelRegistration with random values.
 * channelId is a 48-char hex string (matching the deriveChannelId output).
 * authHash is a 32-byte hash (matching hashChannelAuth output).
 */
function makeRegistration(
  overrides?: Partial<ChannelRegistration>,
): ChannelRegistration {
  return {
    channelId: channelSecretSchema.parse(
      crypto.randomBytes(24).toString("hex"),
    ),
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

/** Shorthand: create a client via the shared fixture and return its id. */
async function insertClient(db: Kysely<TenantDatabase>): Promise<ClientId> {
  const fixture = await createTestClientFixture(db);
  return fixture.clientId;
}

/**
 * Insert a minimal followup row for a ticket. Returns the followup id.
 */
async function insertFollowup(
  db: Kysely<TenantDatabase>,
  ticketId: TicketId,
): Promise<FollowupId> {
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

/**
 * Insert a portal_messages row linking a channel to a followup.
 */
async function insertPortalMessage(
  db: Kysely<TenantDatabase>,
  channelRowId: ChannelRowId,
  followupId: FollowupId,
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

describe.skipIf(!process.env.DATABASE_URL)("PortalChannelService", () => {
  let testDb: TestDb;
  let db: Kysely<TenantDatabase>;

  beforeAll(async () => {
    await getSodium();
    testDb = await createTestDb();
    db = testDb.db;
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  // -----------------------------------------------------------------------
  // createChannel
  // -----------------------------------------------------------------------

  describe("createChannel", () => {
    it("sets communication_tier to secure_link and inserts a channel row", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration();

      await createChannel(db, clientId, reg);

      // Verify tier
      const client = await db
        .selectFrom("clients")
        .select("communication_tier")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();
      expect(client.communication_tier).toBe("secure_link");

      // Verify channel row
      const channel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      expect(channel.channel_id).toBe(reg.channelId);
      expect(Buffer.compare(channel.auth_hash, reg.authHash)).toBe(0);
      expect(Buffer.compare(channel.client_public, reg.clientPublic)).toBe(0);
      expect(channel.has_passphrase).toBe(false);
      expect(channel.status).toBe("active");
      expect(channel.last_seen_at).toBeNull();
      expect(channel.last_notified_at).toBeNull();
      expect(channel.revoked_at).toBeNull();
    });

    it("throws ChannelAlreadyActiveError on double-create via constraint", async () => {
      const clientId = await insertClient(db);
      const reg1 = makeRegistration();
      const reg2 = makeRegistration();

      await createChannel(db, clientId, reg1);

      await expect(createChannel(db, clientId, reg2)).rejects.toThrow(
        ChannelAlreadyActiveError,
      );

      // Only one active channel should exist
      const channels = await db
        .selectFrom("portal_channels")
        .select("id")
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .execute();
      expect(channels).toHaveLength(1);
    });

    it("stores the key check ECIES triple", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration({ hasPassphrase: true });

      await createChannel(db, clientId, reg);

      const channel = await db
        .selectFrom("portal_channels")
        .select([
          "key_check_ephemeral_point",
          "key_check_nonce",
          "key_check_ciphertext",
          "has_passphrase",
        ])
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      expect(
        Buffer.compare(
          channel.key_check_ephemeral_point,
          reg.keyCheck.ephemeralPoint,
        ),
      ).toBe(0);
      expect(Buffer.compare(channel.key_check_nonce, reg.keyCheck.nonce)).toBe(
        0,
      );
      expect(
        Buffer.compare(channel.key_check_ciphertext, reg.keyCheck.ciphertext),
      ).toBe(0);
      expect(channel.has_passphrase).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // regenerateChannel
  // -----------------------------------------------------------------------

  describe("regenerateChannel", () => {
    it("revokes the old channel, deletes its messages, and inserts a new one", async () => {
      const clientId = await insertClient(db);
      const reg1 = makeRegistration();

      await createChannel(db, clientId, reg1);

      // Get the active channel row id (DB UUID, not channel_id)
      const oldChannel = await db
        .selectFrom("portal_channels")
        .select("id")
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      // Create a ticket and followup so we can insert portal_messages
      const fixture = await createTestTicketFixture(db);
      const followupId = await insertFollowup(db, fixture.ticketId);
      await insertPortalMessage(db, oldChannel.id, followupId);

      // Verify message exists
      const msgsBefore = await db
        .selectFrom("portal_messages")
        .select("id")
        .where("channel_id", "=", oldChannel.id)
        .execute();
      expect(msgsBefore).toHaveLength(1);

      // Regenerate
      const reg2 = makeRegistration();
      await regenerateChannel(db, clientId, reg2);

      // Old channel is revoked
      const oldRow = await db
        .selectFrom("portal_channels")
        .select(["status", "revoked_at"])
        .where("id", "=", oldChannel.id)
        .executeTakeFirstOrThrow();
      expect(oldRow.status).toBe("revoked");
      expect(oldRow.revoked_at).not.toBeNull();

      // Old messages deleted
      const msgsAfter = await db
        .selectFrom("portal_messages")
        .select("id")
        .where("channel_id", "=", oldChannel.id)
        .execute();
      expect(msgsAfter).toHaveLength(0);

      // New channel is active
      const newChannel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();
      expect(newChannel.channel_id).toBe(reg2.channelId);

      // Tier stays secure_link
      const client = await db
        .selectFrom("clients")
        .select("communication_tier")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();
      expect(client.communication_tier).toBe("secure_link");
    });

    it("works when no active channel exists (plain create)", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration();

      await regenerateChannel(db, clientId, reg);

      const channel = await db
        .selectFrom("portal_channels")
        .select("channel_id")
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();
      expect(channel.channel_id).toBe(reg.channelId);
    });
  });

  // -----------------------------------------------------------------------
  // revokeChannel
  // -----------------------------------------------------------------------

  describe("revokeChannel", () => {
    it("marks the channel revoked, deletes messages, and resets tier", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration();

      await createChannel(db, clientId, reg);

      const activeChannel = await db
        .selectFrom("portal_channels")
        .select("id")
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      // Insert a portal message
      const fixture = await createTestTicketFixture(db);
      const followupId = await insertFollowup(db, fixture.ticketId);
      await insertPortalMessage(db, activeChannel.id, followupId);

      await revokeChannel(db, clientId);

      // Channel is revoked
      const channel = await db
        .selectFrom("portal_channels")
        .select(["status", "revoked_at"])
        .where("id", "=", activeChannel.id)
        .executeTakeFirstOrThrow();
      expect(channel.status).toBe("revoked");
      expect(channel.revoked_at).not.toBeNull();

      // Messages deleted
      const msgs = await db
        .selectFrom("portal_messages")
        .select("id")
        .where("channel_id", "=", activeChannel.id)
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

    it("is safe to call when no active channel exists", async () => {
      const clientId = await insertClient(db);

      // Should not throw
      await revokeChannel(db, clientId);

      const client = await db
        .selectFrom("clients")
        .select("communication_tier")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();
      expect(client.communication_tier).toBe("sms_email");
    });
  });

  // -----------------------------------------------------------------------
  // resolveAuthedChannel
  // -----------------------------------------------------------------------

  describe("resolveAuthedChannel", () => {
    /**
     * To test that the compare path uses hashChannelAuth semantics,
     * we store a known token's hash and present the raw token.
     * hashChannelAuth = crypto_generichash(32, auth), which is
     * unkeyed BLAKE2b. We use @care-y/crypto's hashChannelAuth
     * directly to produce the stored hash.
     */
    it("returns the row when auth matches via hashChannelAuth", async () => {
      // We use hashChannelAuth from @care-y/crypto to compute both
      // the stored hash and the runtime comparison. This test proves
      // the service calls hashChannelAuth on the presented token and
      // compares against the stored hash (not some other scheme).
      const { hashChannelAuth: hash } = await import("@care-y/crypto");

      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hash(rawAuth));

      const reg = makeRegistration({ authHash });
      await createChannel(db, clientId, reg);

      const result = await resolveAuthedChannel(db, reg.channelId, rawAuth);
      expect(result).not.toBeNull();
      expect(result!.channel_id).toBe(reg.channelId);
      expect(result!.client_id).toBe(clientId);
    });

    it("returns null for wrong auth token", async () => {
      const { hashChannelAuth: hash } = await import("@care-y/crypto");

      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hash(rawAuth));

      const reg = makeRegistration({ authHash });
      await createChannel(db, clientId, reg);

      const wrongAuth = crypto.randomBytes(32);
      const result = await resolveAuthedChannel(db, reg.channelId, wrongAuth);
      expect(result).toBeNull();
    });

    it("returns null for unknown channel_id", async () => {
      const unknownChannelId = channelSecretSchema.parse(
        crypto.randomBytes(24).toString("hex"),
      );
      const auth = crypto.randomBytes(32);

      const result = await resolveAuthedChannel(db, unknownChannelId, auth);
      expect(result).toBeNull();
    });

    it("returns null for revoked channel (even with correct auth)", async () => {
      const { hashChannelAuth: hash } = await import("@care-y/crypto");

      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hash(rawAuth));

      const reg = makeRegistration({ authHash });
      await createChannel(db, clientId, reg);
      await revokeChannel(db, clientId);

      const result = await resolveAuthedChannel(db, reg.channelId, rawAuth);
      expect(result).toBeNull();
    });

    it("all null returns are indistinguishable to the caller", async () => {
      const { hashChannelAuth: hash } = await import("@care-y/crypto");

      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hash(rawAuth));

      const reg = makeRegistration({ authHash });
      await createChannel(db, clientId, reg);
      await revokeChannel(db, clientId);

      // Three different failure modes all produce the same null
      const unknownId = await resolveAuthedChannel(
        db,
        channelSecretSchema.parse(crypto.randomBytes(24).toString("hex")),
        rawAuth,
      );
      const revokedChannel = await resolveAuthedChannel(
        db,
        reg.channelId,
        rawAuth,
      );
      const wrongAuth = await resolveAuthedChannel(
        db,
        reg.channelId,
        crypto.randomBytes(32),
      );

      expect(unknownId).toBeNull();
      expect(revokedChannel).toBeNull();
      expect(wrongAuth).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // resolveAuthedChannel: kind clause
  // -----------------------------------------------------------------------

  describe("resolveAuthedChannel kind clause", () => {
    it("returns null for a kind='account' row even with correct auth preimage", async () => {
      const { hashChannelAuth: hash } = await import("@care-y/crypto");

      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hash(rawAuth));

      // Insert a channel row with kind='account' directly.
      // Account channels carry random auth_hash bytes in production
      // (no token exists), but here we use a real hash to prove the
      // kind clause blocks resolution even when the auth would match.
      await db
        .insertInto("portal_channels")
        .values({
          client_id: clientId,
          channel_id: channelSecretSchema.parse(
            crypto.randomBytes(24).toString("hex"),
          ),
          auth_hash: authHash,
          client_public: crypto.randomBytes(32),
          has_passphrase: false,
          key_check_ephemeral_point: crypto.randomBytes(32),
          key_check_nonce: crypto.randomBytes(24),
          key_check_ciphertext: crypto.randomBytes(48),
          status: "active",
          kind: "account",
        })
        .returning("channel_id")
        .executeTakeFirstOrThrow()
        .then((row) => {
          // Present the correct auth preimage; should still return null
          return resolveAuthedChannel(db, row.channel_id, rawAuth);
        })
        .then((result) => {
          expect(result).toBeNull();
        });
    });

    it("resolves a kind='intake_continuation' row with correct auth", async () => {
      const { hashChannelAuth: hash } = await import("@care-y/crypto");

      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hash(rawAuth));

      const channelId = channelSecretSchema.parse(
        crypto.randomBytes(24).toString("hex"),
      );

      await db
        .insertInto("portal_channels")
        .values({
          client_id: clientId,
          channel_id: channelId,
          auth_hash: authHash,
          client_public: crypto.randomBytes(32),
          has_passphrase: false,
          key_check_ephemeral_point: crypto.randomBytes(32),
          key_check_nonce: crypto.randomBytes(24),
          key_check_ciphertext: crypto.randomBytes(48),
          status: "active",
          kind: "intake_continuation",
        })
        .execute();

      const result = await resolveAuthedChannel(db, channelId, rawAuth);
      expect(result).not.toBeNull();
      expect(result!.channel_id).toBe(channelId);
      expect(result!.kind).toBe("intake_continuation");
    });

    it("still resolves kind='secure_link' rows (default behavior preserved)", async () => {
      const { hashChannelAuth: hash } = await import("@care-y/crypto");

      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hash(rawAuth));

      const reg = makeRegistration({ authHash });
      await createChannel(db, clientId, reg);

      // Verify the row has kind='secure_link' (the default)
      const channel = await db
        .selectFrom("portal_channels")
        .select("kind")
        .where("channel_id", "=", reg.channelId)
        .executeTakeFirstOrThrow();
      expect(channel.kind).toBe("secure_link");

      // resolveAuthedChannel should still work for secure_link rows
      const result = await resolveAuthedChannel(db, reg.channelId, rawAuth);
      expect(result).not.toBeNull();
      expect(result!.channel_id).toBe(reg.channelId);
    });
  });

  // -----------------------------------------------------------------------
  // Regeneration + auth resolution interaction
  // -----------------------------------------------------------------------

  describe("regeneration invalidates old auth", () => {
    it("old channel auth fails after regeneration", async () => {
      const { hashChannelAuth: hash } = await import("@care-y/crypto");

      const clientId = await insertClient(db);
      const rawAuth1 = crypto.randomBytes(32);
      const reg1 = makeRegistration({
        authHash: Buffer.from(hash(rawAuth1)),
      });
      await createChannel(db, clientId, reg1);

      // Regenerate with a new auth
      const rawAuth2 = crypto.randomBytes(32);
      const reg2 = makeRegistration({
        authHash: Buffer.from(hash(rawAuth2)),
      });
      await regenerateChannel(db, clientId, reg2);

      // Old auth on old channel_id fails (revoked)
      const oldResult = await resolveAuthedChannel(
        db,
        reg1.channelId,
        rawAuth1,
      );
      expect(oldResult).toBeNull();

      // New auth on new channel_id succeeds
      const newResult = await resolveAuthedChannel(
        db,
        reg2.channelId,
        rawAuth2,
      );
      expect(newResult).not.toBeNull();
      expect(newResult!.channel_id).toBe(reg2.channelId);
    });
  });

  // -----------------------------------------------------------------------
  // getActiveChannelSummary
  // -----------------------------------------------------------------------

  describe("getActiveChannelSummary", () => {
    it("returns metadata for an active channel", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration({ hasPassphrase: true });
      await createChannel(db, clientId, reg);

      const summary = await getActiveChannelSummary(db, clientId);
      expect(summary).not.toBeNull();
      expect(summary!.kind).toBe("secure_link");
      expect(summary!.hasPassphrase).toBe(true);
      expect(summary!.createdAt).toBeInstanceOf(Date);
    });

    it("returns null when no active channel exists", async () => {
      const clientId = await insertClient(db);

      const summary = await getActiveChannelSummary(db, clientId);
      expect(summary).toBeNull();
    });

    it("returns null for a revoked channel", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration();
      await createChannel(db, clientId, reg);
      await revokeChannel(db, clientId);

      const summary = await getActiveChannelSummary(db, clientId);
      expect(summary).toBeNull();
    });

    it("returns the correct kind for intake_continuation channels", async () => {
      const clientId = await insertClient(db);
      const channelId = channelSecretSchema.parse(
        crypto.randomBytes(24).toString("hex"),
      );

      await db
        .insertInto("portal_channels")
        .values({
          client_id: clientId,
          channel_id: channelId,
          auth_hash: crypto.randomBytes(32),
          client_public: crypto.randomBytes(32),
          has_passphrase: false,
          key_check_ephemeral_point: crypto.randomBytes(32),
          key_check_nonce: crypto.randomBytes(24),
          key_check_ciphertext: crypto.randomBytes(48),
          status: "active",
          kind: "intake_continuation",
        })
        .execute();

      const summary = await getActiveChannelSummary(db, clientId);
      expect(summary).not.toBeNull();
      expect(summary!.kind).toBe("intake_continuation");
    });
  });
});
