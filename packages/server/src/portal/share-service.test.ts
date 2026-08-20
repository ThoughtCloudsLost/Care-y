/**
 * Integration tests for the share link service.
 *
 * DB tests run inside Docker via `pnpm test:server:db`. Each suite gets
 * an isolated test schema via createTestDb() and drops it in afterAll.
 */

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { sql } from "kysely";
import type { TestDb } from "../test-utils.js";
import {
  createTestDb,
  createTestTicketFixture,
  createMockJobQueue,
} from "../test-utils.js";
import {
  createShare,
  openShare,
  listSharesByTicket,
  registerShareCleanupHandler,
  ShareTicketNotFoundError,
  SHARE_CLEANUP_QUEUE,
  SHARE_CLEANUP_INTERVAL_MS,
  type CreateShareRow,
} from "./share-service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Set in beforeAll from the ticket fixture's created user; followups.created_by
// carries a foreign key to users, so a random UUID is rejected.
let sharedUserId: string;

function makeShareInput(
  ticketId: string,
  overrides?: Partial<CreateShareRow>,
): CreateShareRow {
  return {
    shareId: crypto.randomUUID(),
    ticketId,
    ciphertext: Buffer.from("test-share-ciphertext"),
    followUpId: crypto.randomUUID(),
    encryptedFollowUp: Buffer.from("test-followup-ciphertext"),
    createdBy: sharedUserId,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "share-service (DB integration)",
  () => {
    let testDb: TestDb;
    let ticketId: string;

    beforeAll(async () => {
      testDb = await createTestDb();
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      ticketId = fixture.ticketId;
      if (fixture.userId === null) {
        throw new Error("fixture did not create a user");
      }
      sharedUserId = fixture.userId;
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    // ----- createShare -----

    it("creates both a share_links row and a share_link follow-up in one transaction", async () => {
      const input = makeShareInput(ticketId);
      const result = await createShare(testDb.db, input);

      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());

      // Verify share row
      const shareRow = await testDb.db
        .selectFrom("share_links")
        .selectAll()
        .where("id", "=", input.shareId)
        .executeTakeFirst();

      expect(shareRow).toBeDefined();
      expect(shareRow!.ticket_id).toBe(ticketId);
      expect(shareRow!.ciphertext).toEqual(input.ciphertext);
      expect(shareRow!.read_at).toBeNull();

      // Verify follow-up row
      const fuRow = await testDb.db
        .selectFrom("followups")
        .selectAll()
        .where("id", "=", input.followUpId)
        .executeTakeFirst();

      expect(fuRow).toBeDefined();
      expect(fuRow!.ticket_id).toBe(ticketId);
      expect(fuRow!.source).toBe("volunteer");
      expect(fuRow!.type).toBe("share_link");
      expect(fuRow!.encrypted_content).toEqual(input.encryptedFollowUp);
      expect(fuRow!.created_by).toBe(input.createdBy);
      expect(fuRow!.key_generation).toBeNull();
      expect(fuRow!.event_params).toEqual({ shareId: input.shareId });
    });

    it("rolls back the share row when the follow-up insert fails", async () => {
      const shareId = crypto.randomUUID();
      // Use the same followUpId as a prior test row to trigger a PK conflict
      // on the followups table, forcing a rollback of the share insert.
      const existingFu = await testDb.db
        .selectFrom("followups")
        .select("id")
        .executeTakeFirstOrThrow();

      const input = makeShareInput(ticketId, {
        shareId,
        followUpId: existingFu.id,
      });

      await expect(createShare(testDb.db, input)).rejects.toThrow();

      // Share row must not exist (transaction rolled back)
      const shareRow = await testDb.db
        .selectFrom("share_links")
        .select("id")
        .where("id", "=", shareId)
        .executeTakeFirst();

      expect(shareRow).toBeUndefined();
    });

    it("throws ShareTicketNotFoundError for a nonexistent ticket", async () => {
      const input = makeShareInput(crypto.randomUUID());
      await expect(createShare(testDb.db, input)).rejects.toThrow(
        ShareTicketNotFoundError,
      );
    });

    // ----- openShare -----

    it("returns 'ready' with the exact inserted ciphertext on first open", async () => {
      const input = makeShareInput(ticketId);
      await createShare(testDb.db, input);

      const result = await openShare(testDb.db, input.shareId);
      expect(result.status).toBe("ready");
      if (result.status === "ready") {
        expect(result.ciphertext).toEqual(input.ciphertext);
      }
    });

    it("returns 'opened' on second call (ciphertext column is NULL)", async () => {
      const input = makeShareInput(ticketId);
      await createShare(testDb.db, input);

      const first = await openShare(testDb.db, input.shareId);
      expect(first.status).toBe("ready");

      const second = await openShare(testDb.db, input.shareId);
      expect(second.status).toBe("opened");

      // Verify ciphertext column is NULL after consume
      const row = await testDb.db
        .selectFrom("share_links")
        .select(["ciphertext", "read_at"])
        .where("id", "=", input.shareId)
        .executeTakeFirstOrThrow();

      expect(row.ciphertext).toBeNull();
      expect(row.read_at).not.toBeNull();
    });

    it("returns 'expired' for a row with past expires_at", async () => {
      const shareId = crypto.randomUUID();
      const pastExpiry = new Date(Date.now() - 1000);

      await testDb.db
        .insertInto("share_links")
        .values({
          id: shareId,
          ticket_id: ticketId,
          ciphertext: Buffer.from("expired-ct"),
          expires_at: pastExpiry,
        })
        .execute();

      const result = await openShare(testDb.db, shareId);
      expect(result.status).toBe("expired");
    });

    it("returns 'not_found' for an unknown id", async () => {
      const result = await openShare(testDb.db, crypto.randomUUID());
      expect(result.status).toBe("not_found");
    });

    it("yields exactly one 'ready' when two concurrent opens race", async () => {
      const input = makeShareInput(ticketId);
      await createShare(testDb.db, input);

      const [a, b] = await Promise.all([
        openShare(testDb.db, input.shareId),
        openShare(testDb.db, input.shareId),
      ]);

      const statuses = [a.status, b.status].sort();
      expect(statuses).toEqual(["opened", "ready"]);
    });

    // ----- listSharesByTicket -----

    it("returns status rows without ciphertext, ordered by created_at desc", async () => {
      // Create a fresh ticket so we control the exact share count
      const fix2 = await createTestTicketFixture(testDb.db);

      const input1 = makeShareInput(fix2.ticketId);
      const input2 = makeShareInput(fix2.ticketId);
      await createShare(testDb.db, input1);
      await createShare(testDb.db, input2);

      const list = await listSharesByTicket(testDb.db, fix2.ticketId);

      expect(list).toHaveLength(2);
      // Most recent first
      expect(list[0]!.createdAt.getTime()).toBeGreaterThanOrEqual(
        list[1]!.createdAt.getTime(),
      );

      // Verify no ciphertext field on returned rows
      for (const row of list) {
        expect(row).toHaveProperty("id");
        expect(row).toHaveProperty("createdAt");
        expect(row).toHaveProperty("expiresAt");
        expect(row).toHaveProperty("readAt");
        expect(row).not.toHaveProperty("ciphertext");
      }
    });

    // ----- cleanup -----

    it("cleanup deletes expired rows but not live ones", async () => {
      const fix3 = await createTestTicketFixture(testDb.db);

      // Insert an expired row (past expiry)
      const expiredId = crypto.randomUUID();
      await testDb.db
        .insertInto("share_links")
        .values({
          id: expiredId,
          ticket_id: fix3.ticketId,
          ciphertext: Buffer.from("expired-cleanup"),
          expires_at: new Date(Date.now() - 60_000),
        })
        .execute();

      // Insert a consumed tombstone past expiry (read_at set, ciphertext null)
      const tombstoneId = crypto.randomUUID();
      await testDb.db
        .insertInto("share_links")
        .values({
          id: tombstoneId,
          ticket_id: fix3.ticketId,
          ciphertext: null,
          read_at: sql<Date>`now() - interval '2 days'`,
          expires_at: new Date(Date.now() - 60_000),
        })
        .execute();

      // Insert a live row (future expiry)
      const liveInput = makeShareInput(fix3.ticketId);
      await createShare(testDb.db, liveInput);

      const { jobQueue, handlers } = createMockJobQueue();

      registerShareCleanupHandler(
        jobQueue,
        () => testDb.db,
        async () => [testDb.schemaName],
      );

      const handler = handlers.get(SHARE_CLEANUP_QUEUE);
      expect(handler).toBeDefined();
      await handler!({});

      // Expired row gone
      const expiredRow = await testDb.db
        .selectFrom("share_links")
        .select("id")
        .where("id", "=", expiredId)
        .executeTakeFirst();
      expect(expiredRow).toBeUndefined();

      // Tombstone gone
      const tombstoneRow = await testDb.db
        .selectFrom("share_links")
        .select("id")
        .where("id", "=", tombstoneId)
        .executeTakeFirst();
      expect(tombstoneRow).toBeUndefined();

      // Live row still present
      const liveRow = await testDb.db
        .selectFrom("share_links")
        .select("id")
        .where("id", "=", liveInput.shareId)
        .executeTakeFirst();
      expect(liveRow).toBeDefined();
    });
  },
);

// ---------------------------------------------------------------------------
// Cleanup handler self-enqueue (no DB required)
// ---------------------------------------------------------------------------

describe("registerShareCleanupHandler self-enqueue", () => {
  it("re-enqueues with the cleanup interval after a successful run", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const listOrgSchemas = vi.fn().mockResolvedValue([]);

    registerShareCleanupHandler(
      jobQueue,
      () => {
        throw new Error("no tenant DB expected for empty schema list");
      },
      listOrgSchemas,
    );

    const handler = handlers.get(SHARE_CLEANUP_QUEUE);
    expect(handler).toBeDefined();
    await handler!({});

    expect(listOrgSchemas).toHaveBeenCalledOnce();
    expect(jobQueue.enqueue).toHaveBeenCalledWith(
      SHARE_CLEANUP_QUEUE,
      {},
      { delay: SHARE_CLEANUP_INTERVAL_MS },
    );
  });

  it("re-enqueues even when the run throws", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const listOrgSchemas = vi
      .fn()
      .mockRejectedValue(new Error("schema listing failed"));

    registerShareCleanupHandler(
      jobQueue,
      () => {
        throw new Error("no tenant DB expected");
      },
      listOrgSchemas,
    );

    const handler = handlers.get(SHARE_CLEANUP_QUEUE);
    expect(handler).toBeDefined();

    await expect(handler!({})).rejects.toThrow("schema listing failed");

    expect(jobQueue.enqueue).toHaveBeenCalledWith(
      SHARE_CLEANUP_QUEUE,
      {},
      { delay: SHARE_CLEANUP_INTERVAL_MS },
    );
  });
});
