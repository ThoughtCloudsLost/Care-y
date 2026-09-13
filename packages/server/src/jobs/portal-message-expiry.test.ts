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
  seedOrgPublicKey,
  createTestTicketFixture,
} from "../test-utils.js";
import {
  expirePortalMessages,
  registerPortalExpiryHandler,
  PORTAL_EXPIRY_QUEUE,
} from "./portal-message-expiry.js";
import { channelSecretSchema, newFollowupId } from "@care-y/shared";
import type {
  ClientId,
  ChannelRowId,
  TicketId,
  PortalMessageId,
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
  it("registers a handler on the correct queue name", () => {
    const processFn = vi.fn();
    const fakeQueue = {
      process: processFn,
      enqueue: vi.fn().mockResolvedValue(undefined),
      start: vi.fn(),
      stop: vi.fn().mockResolvedValue(undefined),
    };

    registerPortalExpiryHandler(
      fakeQueue,
      vi.fn().mockResolvedValue(undefined),
    );

    expect(processFn).toHaveBeenCalledWith(
      PORTAL_EXPIRY_QUEUE,
      expect.any(Function),
    );
  });
});
