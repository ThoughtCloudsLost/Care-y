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
  PortalMessageId,
  BlobKey,
} from "@care-y/shared";
import {
  channelSecretSchema,
  newAttachmentId,
  newRecordingId,
} from "@care-y/shared";
import {
  createTestDb,
  createTestClientFixture,
  createTestTicketFixture,
  noopEncryptor,
  fakeTriple,
  type TestDb,
} from "../test-utils.js";
import {
  createChannel,
  regenerateChannel,
  revokeChannel,
  resolveAuthedChannel,
  getActiveChannelSummary,
  addPassphrase,
  type ChannelRegistration,
} from "./channel-service.js";
import {
  ChannelAlreadyActiveError,
  PassphraseAlreadySetError,
  PassphraseCountMismatchError,
} from "./portal-errors.js";

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
): Promise<PortalMessageId> {
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

// fakeTriple imported from test-utils.ts

/**
 * Insert a parent attachment row plus a portal_attachments carrier row
 * for the given channel and followup.
 */
async function insertPortalAttachment(
  db: Kysely<TenantDatabase>,
  channelRowId: ChannelRowId,
  followupId: FollowupId,
  ticketId: TicketId,
): Promise<void> {
  const attId = newAttachmentId();
  await db
    .insertInto("attachments")
    .values({
      id: attId,
      ticket_id: ticketId,
      followup_id: followupId,
      blob_key: `test/att/${attId}` as BlobKey,
      size_bytes: 512,
      file_key_wrap: Buffer.alloc(72, 0xab),
    })
    .execute();

  const triple = fakeTriple();
  await db
    .insertInto("portal_attachments")
    .values({
      attachment_id: attId,
      channel_id: channelRowId,
      followup_id: followupId,
      direction: "to_client",
      ephemeral_point: triple.ephemeralPoint,
      nonce: triple.nonce,
      ciphertext: triple.ciphertext,
    })
    .execute();
}

/**
 * Insert a parent recording row plus a portal_recordings carrier row
 * for the given channel and followup.
 */
async function insertPortalRecording(
  db: Kysely<TenantDatabase>,
  channelRowId: ChannelRowId,
  followupId: FollowupId,
  ticketId: TicketId,
): Promise<void> {
  const recId = newRecordingId();
  await db
    .insertInto("recordings")
    .values({
      id: recId,
      ticket_id: ticketId,
      followup_id: followupId,
      blob_key: `test/rec/${recId}` as BlobKey,
      size_bytes: 1024,
      duration_seconds: 10,
      file_key_wrap: Buffer.alloc(72, 0xab),
    })
    .execute();

  const triple = fakeTriple();
  await db
    .insertInto("portal_recordings")
    .values({
      recording_id: recId,
      channel_id: channelRowId,
      followup_id: followupId,
      direction: "to_client",
      ephemeral_point: triple.ephemeralPoint,
      nonce: triple.nonce,
      ciphertext: triple.ciphertext,
    })
    .execute();
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

    it("leaves tier untouched when no active channel existed", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration();

      // Create and revoke a channel (sets tier back to sms_email)
      await createChannel(db, clientId, reg);

      // Manually set tier to secure_link to simulate a state where
      // the channel was already revoked but the tier was re-set
      await db
        .updateTable("clients")
        .set({ communication_tier: "secure_link" })
        .where("id", "=", clientId)
        .execute();

      // Revoke the active channel
      await revokeChannel(db, clientId);

      // After revoking the real channel, tier is sms_email
      const afterFirst = await db
        .selectFrom("clients")
        .select("communication_tier")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();
      expect(afterFirst.communication_tier).toBe("sms_email");

      // Now set tier to secure_link again (simulating external state)
      await db
        .updateTable("clients")
        .set({ communication_tier: "secure_link" })
        .where("id", "=", clientId)
        .execute();

      // Call revokeChannel again with no active channel: tier must stay
      await revokeChannel(db, clientId);

      const afterSecond = await db
        .selectFrom("clients")
        .select("communication_tier")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();
      expect(afterSecond.communication_tier).toBe("secure_link");
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

  // -----------------------------------------------------------------------
  // Carrier purge on regeneration and revocation
  // -----------------------------------------------------------------------

  describe("regenerateChannel purges portal carriers", () => {
    it("deletes portal_attachments and portal_recordings for the old channel", async () => {
      const clientId = await insertClient(db);
      const reg1 = makeRegistration();
      await createChannel(db, clientId, reg1);

      const oldChannel = await db
        .selectFrom("portal_channels")
        .select("id")
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      const fixture = await createTestTicketFixture(db);
      const followupId = await insertFollowup(db, fixture.ticketId);
      await insertPortalMessage(db, oldChannel.id, followupId);
      await insertPortalAttachment(
        db,
        oldChannel.id,
        followupId,
        fixture.ticketId,
      );
      await insertPortalRecording(
        db,
        oldChannel.id,
        followupId,
        fixture.ticketId,
      );

      // Verify carriers exist before regeneration
      const attBefore = await db
        .selectFrom("portal_attachments")
        .select("id")
        .where("channel_id", "=", oldChannel.id)
        .execute();
      expect(attBefore).toHaveLength(1);

      const recBefore = await db
        .selectFrom("portal_recordings")
        .select("id")
        .where("channel_id", "=", oldChannel.id)
        .execute();
      expect(recBefore).toHaveLength(1);

      // Regenerate
      const reg2 = makeRegistration();
      await regenerateChannel(db, clientId, reg2);

      // Old channel's portal_attachments purged
      const attAfter = await db
        .selectFrom("portal_attachments")
        .select("id")
        .where("channel_id", "=", oldChannel.id)
        .execute();
      expect(attAfter).toHaveLength(0);

      // Old channel's portal_recordings purged
      const recAfter = await db
        .selectFrom("portal_recordings")
        .select("id")
        .where("channel_id", "=", oldChannel.id)
        .execute();
      expect(recAfter).toHaveLength(0);
    });
  });

  describe("revokeChannel purges portal carriers", () => {
    it("deletes portal_attachments and portal_recordings for the revoked channel", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration();
      await createChannel(db, clientId, reg);

      const activeChannel = await db
        .selectFrom("portal_channels")
        .select("id")
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      const fixture = await createTestTicketFixture(db);
      const followupId = await insertFollowup(db, fixture.ticketId);
      await insertPortalMessage(db, activeChannel.id, followupId);
      await insertPortalAttachment(
        db,
        activeChannel.id,
        followupId,
        fixture.ticketId,
      );
      await insertPortalRecording(
        db,
        activeChannel.id,
        followupId,
        fixture.ticketId,
      );

      await revokeChannel(db, clientId);

      // portal_attachments purged
      const attAfter = await db
        .selectFrom("portal_attachments")
        .select("id")
        .where("channel_id", "=", activeChannel.id)
        .execute();
      expect(attAfter).toHaveLength(0);

      // portal_recordings purged
      const recAfter = await db
        .selectFrom("portal_recordings")
        .select("id")
        .where("channel_id", "=", activeChannel.id)
        .execute();
      expect(recAfter).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Unique index from migration 106
  // -----------------------------------------------------------------------

  describe("portal_messages unique index", () => {
    it("rejects a second portal_messages row with the same (channel_id, followup_id)", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration();
      await createChannel(db, clientId, reg);

      const activeChannel = await db
        .selectFrom("portal_channels")
        .select("id")
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      const fixture = await createTestTicketFixture(db);
      const followupId = await insertFollowup(db, fixture.ticketId);

      // First insert succeeds
      await insertPortalMessage(db, activeChannel.id, followupId);

      // Second insert with the same (channel_id, followup_id) violates the unique index
      await expect(
        insertPortalMessage(db, activeChannel.id, followupId),
      ).rejects.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // addPassphrase
  // -----------------------------------------------------------------------

  describe("addPassphrase", () => {
    it("atomically swaps client_public, key_check, has_passphrase, and message triples", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration({ hasPassphrase: false });
      await createChannel(db, clientId, reg);

      const channel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      // Insert two portal messages
      const fixture = await createTestTicketFixture(db);
      const fid1 = await insertFollowup(db, fixture.ticketId);
      const fid2 = await insertFollowup(db, fixture.ticketId);
      const msgId1 = await insertPortalMessage(db, channel.id, fid1);
      const msgId2 = await insertPortalMessage(db, channel.id, fid2);

      const newPublic = crypto.randomBytes(32);
      const newKeyCheck = {
        ephemeralPoint: crypto.randomBytes(32),
        nonce: crypto.randomBytes(24),
        ciphertext: crypto.randomBytes(48),
      };
      const resealedMessages = [
        {
          id: msgId1,
          copy: {
            ephemeralPoint: Buffer.alloc(32, 0xaa),
            nonce: Buffer.alloc(24, 0xbb),
            ciphertext: Buffer.alloc(48, 0xcc),
          },
        },
        {
          id: msgId2,
          copy: {
            ephemeralPoint: Buffer.alloc(32, 0xdd),
            nonce: Buffer.alloc(24, 0xee),
            ciphertext: Buffer.alloc(48, 0xff),
          },
        },
      ];

      await addPassphrase(db, channel, {
        clientPublic: newPublic,
        keyCheck: newKeyCheck,
        resealedMessages,
        skippedMessageIds: [],
      });

      // Verify channel columns swapped
      const updated = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("id", "=", channel.id)
        .executeTakeFirstOrThrow();

      expect(updated.has_passphrase).toBe(true);
      expect(Buffer.compare(updated.client_public, newPublic)).toBe(0);
      expect(
        Buffer.compare(
          updated.key_check_ephemeral_point,
          newKeyCheck.ephemeralPoint,
        ),
      ).toBe(0);
      expect(Buffer.compare(updated.key_check_nonce, newKeyCheck.nonce)).toBe(
        0,
      );
      expect(
        Buffer.compare(updated.key_check_ciphertext, newKeyCheck.ciphertext),
      ).toBe(0);

      // Verify message triples swapped
      const msg1 = await db
        .selectFrom("portal_messages")
        .select(["ephemeral_point", "nonce", "ciphertext"])
        .where("id", "=", msgId1)
        .executeTakeFirstOrThrow();

      expect(Buffer.compare(msg1.ephemeral_point, Buffer.alloc(32, 0xaa))).toBe(
        0,
      );
      expect(Buffer.compare(msg1.nonce, Buffer.alloc(24, 0xbb))).toBe(0);
      expect(Buffer.compare(msg1.ciphertext, Buffer.alloc(48, 0xcc))).toBe(0);

      const msg2 = await db
        .selectFrom("portal_messages")
        .select(["ephemeral_point", "nonce", "ciphertext"])
        .where("id", "=", msgId2)
        .executeTakeFirstOrThrow();

      expect(Buffer.compare(msg2.ephemeral_point, Buffer.alloc(32, 0xdd))).toBe(
        0,
      );
    });

    it("rejects when has_passphrase is already true", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration({ hasPassphrase: true });
      await createChannel(db, clientId, reg);

      const channel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      await expect(
        addPassphrase(db, channel, {
          clientPublic: crypto.randomBytes(32),
          keyCheck: {
            ephemeralPoint: crypto.randomBytes(32),
            nonce: crypto.randomBytes(24),
            ciphertext: crypto.randomBytes(48),
          },
          resealedMessages: [],
          skippedMessageIds: [],
        }),
      ).rejects.toThrow(PassphraseAlreadySetError);
    });

    it("rejects on count mismatch and changes nothing", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration({ hasPassphrase: false });
      await createChannel(db, clientId, reg);

      const channel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      // Insert one message but send zero resealed
      const fixture = await createTestTicketFixture(db);
      const fid = await insertFollowup(db, fixture.ticketId);
      await insertPortalMessage(db, channel.id, fid);

      await expect(
        addPassphrase(db, channel, {
          clientPublic: crypto.randomBytes(32),
          keyCheck: {
            ephemeralPoint: crypto.randomBytes(32),
            nonce: crypto.randomBytes(24),
            ciphertext: crypto.randomBytes(48),
          },
          resealedMessages: [], // mismatch: 0 vs 1
          skippedMessageIds: [],
        }),
      ).rejects.toThrow(PassphraseCountMismatchError);

      // Verify nothing changed
      const unchanged = await db
        .selectFrom("portal_channels")
        .select(["has_passphrase", "client_public"])
        .where("id", "=", channel.id)
        .executeTakeFirstOrThrow();

      expect(unchanged.has_passphrase).toBe(false);
      expect(Buffer.compare(unchanged.client_public, reg.clientPublic)).toBe(0);
    });

    it("succeeds when an undecryptable message is declared skipped, leaving its triple untouched", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration({ hasPassphrase: false });
      await createChannel(db, clientId, reg);

      const channel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      const fixture = await createTestTicketFixture(db);
      const fid1 = await insertFollowup(db, fixture.ticketId);
      const fid2 = await insertFollowup(db, fixture.ticketId);
      const resealedId = await insertPortalMessage(db, channel.id, fid1);
      const skippedId = await insertPortalMessage(db, channel.id, fid2);

      const before = await db
        .selectFrom("portal_messages")
        .select(["ephemeral_point", "nonce", "ciphertext"])
        .where("id", "=", skippedId)
        .executeTakeFirstOrThrow();

      await addPassphrase(db, channel, {
        clientPublic: crypto.randomBytes(32),
        keyCheck: {
          ephemeralPoint: crypto.randomBytes(32),
          nonce: crypto.randomBytes(24),
          ciphertext: crypto.randomBytes(48),
        },
        resealedMessages: [
          {
            id: resealedId,
            copy: {
              ephemeralPoint: Buffer.alloc(32, 0xaa),
              nonce: Buffer.alloc(24, 0xbb),
              ciphertext: Buffer.alloc(48, 0xcc),
            },
          },
        ],
        skippedMessageIds: [skippedId],
      });

      const updated = await db
        .selectFrom("portal_channels")
        .select("has_passphrase")
        .where("id", "=", channel.id)
        .executeTakeFirstOrThrow();
      expect(updated.has_passphrase).toBe(true);

      // Resealed row swapped
      const resealed = await db
        .selectFrom("portal_messages")
        .select(["ephemeral_point"])
        .where("id", "=", resealedId)
        .executeTakeFirstOrThrow();
      expect(
        Buffer.compare(resealed.ephemeral_point, Buffer.alloc(32, 0xaa)),
      ).toBe(0);

      // Skipped row untouched (still sealed to the superseded key)
      const skipped = await db
        .selectFrom("portal_messages")
        .select(["ephemeral_point", "nonce", "ciphertext"])
        .where("id", "=", skippedId)
        .executeTakeFirstOrThrow();
      expect(
        Buffer.compare(skipped.ephemeral_point, before.ephemeral_point),
      ).toBe(0);
      expect(Buffer.compare(skipped.nonce, before.nonce)).toBe(0);
      expect(Buffer.compare(skipped.ciphertext, before.ciphertext)).toBe(0);
    });

    it("rejects when a message appears in both the resealed and skipped sets", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration({ hasPassphrase: false });
      await createChannel(db, clientId, reg);

      const channel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      const fixture = await createTestTicketFixture(db);
      const fid1 = await insertFollowup(db, fixture.ticketId);
      const fid2 = await insertFollowup(db, fixture.ticketId);
      const msgId1 = await insertPortalMessage(db, channel.id, fid1);
      // Second row exists so the size check alone cannot catch the overlap
      await insertPortalMessage(db, channel.id, fid2);

      await expect(
        addPassphrase(db, channel, {
          clientPublic: crypto.randomBytes(32),
          keyCheck: {
            ephemeralPoint: crypto.randomBytes(32),
            nonce: crypto.randomBytes(24),
            ciphertext: crypto.randomBytes(48),
          },
          resealedMessages: [
            {
              id: msgId1,
              copy: {
                ephemeralPoint: Buffer.alloc(32, 0xaa),
                nonce: Buffer.alloc(24, 0xbb),
                ciphertext: Buffer.alloc(48, 0xcc),
              },
            },
          ],
          skippedMessageIds: [msgId1],
        }),
      ).rejects.toThrow(PassphraseCountMismatchError);
    });

    it("rejects when a skipped ID belongs to no row of the channel", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration({ hasPassphrase: false });
      await createChannel(db, clientId, reg);

      const channel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      // One real row, declared resealed; the skip is a stray UUID, so a
      // bare count comparison (1 + 1 = 2 vs 1) fails and a coverage walk
      // never sees the stray. Either way the guard must reject.
      const fixture = await createTestTicketFixture(db);
      const fid = await insertFollowup(db, fixture.ticketId);
      const msgId = await insertPortalMessage(db, channel.id, fid);
      const strayId = crypto.randomUUID() as PortalMessageId;

      await expect(
        addPassphrase(db, channel, {
          clientPublic: crypto.randomBytes(32),
          keyCheck: {
            ephemeralPoint: crypto.randomBytes(32),
            nonce: crypto.randomBytes(24),
            ciphertext: crypto.randomBytes(48),
          },
          resealedMessages: [
            {
              id: msgId,
              copy: {
                ephemeralPoint: Buffer.alloc(32, 0xaa),
                nonce: Buffer.alloc(24, 0xbb),
                ciphertext: Buffer.alloc(48, 0xcc),
              },
            },
          ],
          skippedMessageIds: [strayId],
        }),
      ).rejects.toThrow(PassphraseCountMismatchError);
    });

    it("second call rejects with PassphraseAlreadySetError", async () => {
      const clientId = await insertClient(db);
      const reg = makeRegistration({ hasPassphrase: false });
      await createChannel(db, clientId, reg);

      const channel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      // First call succeeds (no messages)
      await addPassphrase(db, channel, {
        clientPublic: crypto.randomBytes(32),
        keyCheck: {
          ephemeralPoint: crypto.randomBytes(32),
          nonce: crypto.randomBytes(24),
          ciphertext: crypto.randomBytes(48),
        },
        resealedMessages: [],
        skippedMessageIds: [],
      });

      // Second call rejects (has_passphrase is now true on the DB row,
      // but the in-memory channel object still has has_passphrase=false;
      // the transaction re-check catches it)
      await expect(
        addPassphrase(db, channel, {
          clientPublic: crypto.randomBytes(32),
          keyCheck: {
            ephemeralPoint: crypto.randomBytes(32),
            nonce: crypto.randomBytes(24),
            ciphertext: crypto.randomBytes(48),
          },
          resealedMessages: [],
          skippedMessageIds: [],
        }),
      ).rejects.toThrow(PassphraseAlreadySetError);
    });

    it("stored key check no longer opens with seed-only-derived key", async () => {
      // Full pipeline assertion: derive a keypair with seed only,
      // create a channel, then addPassphrase with a passphrase-derived
      // keypair. Verify the stored key check is sealed to the new key.
      const {
        derivePortalKeypairFromOprf,
        eciesEncrypt,
        eciesDecrypt,
        PORTAL_KEY_CHECK,
        toRistrettoPoint,
        toNonce,
      } = await import("@care-y/crypto");

      // Bypass the OPRF server for a unit test by deriving two keypairs
      // from different 64-byte inputs via derivePortalKeypairFromOprf.
      // This tests the key check property without a live OPRF server.

      // Fake OPRF output for seed-only (64 random bytes)
      const seedOnlyOprfOutput = crypto.randomBytes(64);
      const seedOnlyKeypair = derivePortalKeypairFromOprf(seedOnlyOprfOutput);

      // Fake OPRF output for passphrase (different 64 random bytes)
      const passphraseOprfOutput = crypto.randomBytes(64);
      const passphraseKeypair =
        derivePortalKeypairFromOprf(passphraseOprfOutput);

      // Verify the two keypairs differ
      expect(
        Buffer.compare(
          Buffer.from(seedOnlyKeypair.clientPublic),
          Buffer.from(passphraseKeypair.clientPublic),
        ),
      ).not.toBe(0);

      // Seal a key check to the seed-only key
      const keyCheckPlain = new TextEncoder().encode(PORTAL_KEY_CHECK);
      const seedKeyCheck = eciesEncrypt(
        keyCheckPlain,
        seedOnlyKeypair.clientPublic,
      );

      // Create channel with seed-only key and the matching key check
      const clientId = await insertClient(db);
      const reg = makeRegistration({
        hasPassphrase: false,
        clientPublic: Buffer.from(seedOnlyKeypair.clientPublic),
        keyCheck: {
          ephemeralPoint: Buffer.from(seedKeyCheck.ephemeralPoint),
          nonce: Buffer.from(seedKeyCheck.nonce),
          ciphertext: Buffer.from(seedKeyCheck.ciphertext),
        },
      });

      await createChannel(db, clientId, reg);

      const channel = await db
        .selectFrom("portal_channels")
        .selectAll()
        .where("client_id", "=", clientId)
        .where("status", "=", "active")
        .executeTakeFirstOrThrow();

      // Add passphrase: seal new key check to the passphrase keypair
      const newKeyCheck = eciesEncrypt(
        keyCheckPlain,
        passphraseKeypair.clientPublic,
      );

      await addPassphrase(db, channel, {
        clientPublic: Buffer.from(passphraseKeypair.clientPublic),
        keyCheck: {
          ephemeralPoint: Buffer.from(newKeyCheck.ephemeralPoint),
          nonce: Buffer.from(newKeyCheck.nonce),
          ciphertext: Buffer.from(newKeyCheck.ciphertext),
        },
        resealedMessages: [],
        skippedMessageIds: [],
      });

      // Read the stored key check
      const updated = await db
        .selectFrom("portal_channels")
        .select([
          "key_check_ephemeral_point",
          "key_check_nonce",
          "key_check_ciphertext",
        ])
        .where("id", "=", channel.id)
        .executeTakeFirstOrThrow();

      // Decrypt with the passphrase key: should succeed
      const decrypted = eciesDecrypt(
        toRistrettoPoint(new Uint8Array(updated.key_check_ephemeral_point)),
        toNonce(new Uint8Array(updated.key_check_nonce)),
        new Uint8Array(updated.key_check_ciphertext),
        passphraseKeypair.clientPrivate,
      );
      expect(new TextDecoder().decode(decrypted)).toBe(PORTAL_KEY_CHECK);

      // Decrypt with the seed-only key: should fail
      expect(() =>
        eciesDecrypt(
          toRistrettoPoint(new Uint8Array(updated.key_check_ephemeral_point)),
          toNonce(new Uint8Array(updated.key_check_nonce)),
          new Uint8Array(updated.key_check_ciphertext),
          seedOnlyKeypair.clientPrivate,
        ),
      ).toThrow();

      // Clean up key material
      const sodium = (await import("@care-y/crypto")).requireSodium();
      sodium.memzero(seedOnlyKeypair.clientPrivate);
      sodium.memzero(passphraseKeypair.clientPrivate);
    });
  });
});
