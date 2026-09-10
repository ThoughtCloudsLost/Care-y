/**
 * Integration tests for the portal message expiry job.
 *
 * DB tests run inside Docker via `pnpm test:server:db`.
 */

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { TestDb } from "../test-utils.js";
import {
  createTestDb,
  createMockJobQueue,
  seedOrgPublicKey,
  createTestTicketFixture,
} from "../test-utils.js";
import {
  expirePortalMessages,
  registerPortalExpiryHandler,
  PORTAL_EXPIRY_QUEUE,
} from "./portal-message-expiry.js";
import {
  channelSecretSchema,
  newFollowupId,
  newAttachmentId,
  newRecordingId,
} from "@care-y/shared";
import type {
  ClientId,
  ChannelRowId,
  TicketId,
  PortalMessageId,
  BlobKey,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function insertChannel(
  db: TestDb["db"],
  clientId: ClientId,
  lastSeenAt: Date | null,
): Promise<ChannelRowId> {
  const channelId = channelSecretSchema.parse(
    crypto.randomBytes(24).toString("hex"),
  );
  const row = await db
    .insertInto("portal_channels")
    .values({
      client_id: clientId,
      channel_id: channelId,
      auth_hash: Buffer.alloc(32, 0xaa),
      client_public: Buffer.alloc(32, 0xbb),
      has_passphrase: false,
      key_check_ephemeral_point: Buffer.alloc(32, 0xcc),
      key_check_nonce: Buffer.alloc(24, 0xdd),
      key_check_ciphertext: Buffer.from("kc"),
      status: "active",
      last_seen_at: lastSeenAt,
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

/**
 * Insert a follow-up row (needed to satisfy the FK on portal_messages)
 * then insert a portal_messages row. Returns the portal_messages id.
 */
async function insertPortalMessage(
  db: TestDb["db"],
  channelRowId: ChannelRowId,
  ticketId: TicketId,
): Promise<PortalMessageId> {
  const fuId = newFollowupId();
  await db
    .insertInto("followups")
    .values({
      id: fuId,
      ticket_id: ticketId,
      source: "volunteer",
      type: "message",
      encrypted_content: Buffer.from("ct-exp"),
    })
    .execute();

  const row = await db
    .insertInto("portal_messages")
    .values({
      channel_id: channelRowId,
      followup_id: fuId,
      direction: "to_client",
      ephemeral_point: Buffer.alloc(32, 0x01),
      nonce: Buffer.alloc(24, 0x02),
      ciphertext: Buffer.from("ct"),
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "portal-message-expiry (DB integration)",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("deletes messages for channels inactive past the 30-day boundary", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      const expiredChannelId = await insertChannel(
        testDb.db,
        fixture.clientId,
        oldDate,
      );
      const msgId = await insertPortalMessage(
        testDb.db,
        expiredChannelId,
        fixture.ticketId,
      );

      const deleted = await expirePortalMessages(testDb.db);

      expect(deleted).toBeGreaterThanOrEqual(1);

      const remaining = await testDb.db
        .selectFrom("portal_messages")
        .select("id")
        .where("id", "=", msgId)
        .executeTakeFirst();
      expect(remaining).toBeUndefined();
    });

    it("leaves messages for recently active channels", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const recentDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
      const activeChannelId = await insertChannel(
        testDb.db,
        fixture.clientId,
        recentDate,
      );
      const msgId = await insertPortalMessage(
        testDb.db,
        activeChannelId,
        fixture.ticketId,
      );

      await expirePortalMessages(testDb.db);

      const remaining = await testDb.db
        .selectFrom("portal_messages")
        .select("id")
        .where("id", "=", msgId)
        .executeTakeFirst();
      expect(remaining).toBeDefined();
    });

    it("deletes portal_attachments for expired channels", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      const expiredChannelId = await insertChannel(
        testDb.db,
        fixture.clientId,
        oldDate,
      );

      // Seed a follow-up, attachment, and portal_attachments wrap
      const fuId = newFollowupId();
      await testDb.db
        .insertInto("followups")
        .values({
          id: fuId,
          ticket_id: fixture.ticketId,
          source: "client",
          type: "message",
          encrypted_content: Buffer.from("ct"),
        })
        .execute();

      const attId = newAttachmentId();
      await testDb.db
        .insertInto("attachments")
        .values({
          id: attId,
          ticket_id: fixture.ticketId,
          followup_id: fuId,
          blob_key: "test/attachment/exp-att" as BlobKey,
          size_bytes: 100,
          content_type: "image/png",
          encrypted_filename: Buffer.from("enc"),
          file_key_wrap: Buffer.alloc(72, 0xab),
        })
        .execute();

      await testDb.db
        .insertInto("portal_attachments")
        .values({
          attachment_id: attId,
          channel_id: expiredChannelId,
          followup_id: fuId,
          direction: "from_client",
          ephemeral_point: Buffer.alloc(32, 0x01),
          nonce: Buffer.alloc(24, 0x02),
          ciphertext: Buffer.from("wrap-ct"),
        })
        .execute();

      await expirePortalMessages(testDb.db);

      const remaining = await testDb.db
        .selectFrom("portal_attachments")
        .select("id")
        .where("channel_id", "=", expiredChannelId)
        .executeTakeFirst();
      expect(remaining).toBeUndefined();

      // Attachment row itself stays (only the portal wrap is deleted)
      const attRow = await testDb.db
        .selectFrom("attachments")
        .select("id")
        .where("id", "=", attId)
        .executeTakeFirst();
      expect(attRow).toBeDefined();
    });

    it("deletes portal_recordings for expired channels", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      const expiredChannelId = await insertChannel(
        testDb.db,
        fixture.clientId,
        oldDate,
      );

      const fuId = newFollowupId();
      await testDb.db
        .insertInto("followups")
        .values({
          id: fuId,
          ticket_id: fixture.ticketId,
          source: "system",
          type: "phone_call",
          encrypted_content: Buffer.from("ct"),
        })
        .execute();

      const recId = newRecordingId();
      await testDb.db
        .insertInto("recordings")
        .values({
          id: recId,
          ticket_id: fixture.ticketId,
          followup_id: fuId,
          blob_key: "test/recording/exp-rec" as BlobKey,
          size_bytes: 256,
          duration_seconds: 30,
          file_key_wrap: Buffer.alloc(72, 0xab),
        })
        .execute();

      await testDb.db
        .insertInto("portal_recordings")
        .values({
          recording_id: recId,
          channel_id: expiredChannelId,
          followup_id: fuId,
          direction: "to_client",
          ephemeral_point: Buffer.alloc(32, 0x01),
          nonce: Buffer.alloc(24, 0x02),
          ciphertext: Buffer.from("wrap-ct"),
        })
        .execute();

      await expirePortalMessages(testDb.db);

      const remaining = await testDb.db
        .selectFrom("portal_recordings")
        .select("id")
        .where("channel_id", "=", expiredChannelId)
        .executeTakeFirst();
      expect(remaining).toBeUndefined();

      // Recording row itself stays
      const recRow = await testDb.db
        .selectFrom("recordings")
        .select("id")
        .where("id", "=", recId)
        .executeTakeFirst();
      expect(recRow).toBeDefined();
    });

    it("leaves all three tables' rows for fresh channels", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const recentDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const freshChannelId = await insertChannel(
        testDb.db,
        fixture.clientId,
        recentDate,
      );

      // Message
      const msgId = await insertPortalMessage(
        testDb.db,
        freshChannelId,
        fixture.ticketId,
      );

      // Attachment
      const fuIdAtt = newFollowupId();
      await testDb.db
        .insertInto("followups")
        .values({
          id: fuIdAtt,
          ticket_id: fixture.ticketId,
          source: "client",
          type: "message",
          encrypted_content: Buffer.from("ct"),
        })
        .execute();

      const attId = newAttachmentId();
      await testDb.db
        .insertInto("attachments")
        .values({
          id: attId,
          ticket_id: fixture.ticketId,
          followup_id: fuIdAtt,
          blob_key: "test/attachment/fresh-att" as BlobKey,
          size_bytes: 100,
          content_type: "image/png",
          encrypted_filename: Buffer.from("enc"),
          file_key_wrap: Buffer.alloc(72, 0xab),
        })
        .execute();

      await testDb.db
        .insertInto("portal_attachments")
        .values({
          attachment_id: attId,
          channel_id: freshChannelId,
          followup_id: fuIdAtt,
          direction: "from_client",
          ephemeral_point: Buffer.alloc(32, 0x01),
          nonce: Buffer.alloc(24, 0x02),
          ciphertext: Buffer.from("ct"),
        })
        .execute();

      // Recording
      const fuIdRec = newFollowupId();
      await testDb.db
        .insertInto("followups")
        .values({
          id: fuIdRec,
          ticket_id: fixture.ticketId,
          source: "system",
          type: "phone_call",
          encrypted_content: Buffer.from("ct"),
        })
        .execute();

      const recId = newRecordingId();
      await testDb.db
        .insertInto("recordings")
        .values({
          id: recId,
          ticket_id: fixture.ticketId,
          followup_id: fuIdRec,
          blob_key: "test/recording/fresh-rec" as BlobKey,
          size_bytes: 256,
          duration_seconds: 30,
          file_key_wrap: Buffer.alloc(72, 0xab),
        })
        .execute();

      await testDb.db
        .insertInto("portal_recordings")
        .values({
          recording_id: recId,
          channel_id: freshChannelId,
          followup_id: fuIdRec,
          direction: "to_client",
          ephemeral_point: Buffer.alloc(32, 0x01),
          nonce: Buffer.alloc(24, 0x02),
          ciphertext: Buffer.from("ct"),
        })
        .execute();

      await expirePortalMessages(testDb.db);

      // All three should still be there
      const msg = await testDb.db
        .selectFrom("portal_messages")
        .select("id")
        .where("id", "=", msgId)
        .executeTakeFirst();
      expect(msg).toBeDefined();

      const att = await testDb.db
        .selectFrom("portal_attachments")
        .select("id")
        .where("channel_id", "=", freshChannelId)
        .executeTakeFirst();
      expect(att).toBeDefined();

      const rec = await testDb.db
        .selectFrom("portal_recordings")
        .select("id")
        .where("channel_id", "=", freshChannelId)
        .executeTakeFirst();
      expect(rec).toBeDefined();
    });

    it("uses created_at when last_seen_at is null (channel never visited)", async () => {
      // Channel with null last_seen_at: uses created_at.
      // Since we just inserted it, created_at is now(), which is < 30 days.
      const fixture = await createTestTicketFixture(testDb.db);
      const channelId = await insertChannel(
        testDb.db,
        fixture.clientId,
        null, // never visited
      );
      const msgId = await insertPortalMessage(
        testDb.db,
        channelId,
        fixture.ticketId,
      );

      await expirePortalMessages(testDb.db);

      const remaining = await testDb.db
        .selectFrom("portal_messages")
        .select("id")
        .where("id", "=", msgId)
        .executeTakeFirst();
      // created_at is "now", so it should NOT be expired
      expect(remaining).toBeDefined();
    });
  },
);

describe("registerPortalExpiryHandler", () => {
  it("runs the tenant sweep and re-enqueues with the interval on success", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const runForAllTenants = vi.fn().mockResolvedValue(undefined);

    registerPortalExpiryHandler(jobQueue, runForAllTenants, 12_345);

    const handler = handlers.get(PORTAL_EXPIRY_QUEUE);
    expect(handler).toBeDefined();
    await handler!({});

    expect(runForAllTenants).toHaveBeenCalledOnce();
    expect(jobQueue.enqueue).toHaveBeenCalledWith(
      PORTAL_EXPIRY_QUEUE,
      {},
      { delay: 12_345 },
    );
  });

  it("re-enqueues even when the tenant sweep throws", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const runForAllTenants = vi
      .fn()
      .mockRejectedValue(new Error("tenant sweep failed"));

    registerPortalExpiryHandler(jobQueue, runForAllTenants, 12_345);

    const handler = handlers.get(PORTAL_EXPIRY_QUEUE);
    expect(handler).toBeDefined();

    await expect(handler!({})).rejects.toThrow("tenant sweep failed");

    expect(jobQueue.enqueue).toHaveBeenCalledWith(
      PORTAL_EXPIRY_QUEUE,
      {},
      { delay: 12_345 },
    );
  });
});
