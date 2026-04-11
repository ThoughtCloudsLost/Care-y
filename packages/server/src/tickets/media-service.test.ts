import * as crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import {
  createMediaService,
  registerMediaCleanupHandler,
  type MediaService,
} from "./media-service.js";
import {
  createTicketAccessChecker,
  type TicketAccessChecker,
} from "./access.js";
import { ForbiddenError, NotFoundError } from "../errors.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";

function createMockBlobStore(): BlobStore & { deletedKeys: string[] } {
  const deletedKeys: string[] = [];
  return {
    deletedKeys,
    async put() {
      return "mock-key-" + crypto.randomUUID().slice(0, 8);
    },
    async get() {
      return Buffer.from("mock-blob");
    },
    async delete(key) {
      deletedKeys.push(key);
    },
    async exists() {
      return true;
    },
  };
}

describe.skipIf(!process.env.DATABASE_URL)("MediaService (DB)", () => {
  let testDb: TestDb;
  let svc: MediaService;
  let access: TicketAccessChecker;
  let blobStore: ReturnType<typeof createMockBlobStore>;
  let userId: string;
  let outsiderId: string;
  let queueId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);

    const user = await createTestUser(testDb.db);
    userId = user.id;

    const outsider = await createTestUser(testDb.db);
    outsiderId = outsider.id;

    access = createTicketAccessChecker(testDb.db);
    blobStore = createMockBlobStore();
    svc = createMediaService(testDb.db, blobStore, access);

    const q = await createTestQueue(testDb.db);
    queueId = q.id;

    // Add user to queue so TicketAccessChecker grants access via queue membership.
    // outsiderId is deliberately NOT added to any queue.
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: userId })
      .execute();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function insertTicket(): Promise<string> {
    const fix = await createTestTicketFixture(testDb.db, { queueId });
    return fix.ticketId;
  }

  // -----------------------------------------------------------------------
  // Recordings
  // -----------------------------------------------------------------------

  it("createRecording inserts a recording row", async () => {
    const ticketId = await insertTicket();
    const rec = await svc.createRecording({
      ticketId,
      blobKey: "blob-rec-1",
      sizeBytes: 4096,
      durationSeconds: 120,
    });

    expect(rec.ticketId).toBe(ticketId);
    expect(rec.blobKey).toBe("blob-rec-1");
    expect(rec.sizeBytes).toBe(4096);
    expect(rec.durationSeconds).toBe(120);
    expect(rec.followupId).toBeNull();
    expect(rec.deletedAt).toBeNull();
    expect(rec.id).toBeTruthy();
    expect(rec.createdAt).toBeInstanceOf(Date);
  });

  it("getRecording returns the record after access check passes", async () => {
    const ticketId = await insertTicket();
    const created = await svc.createRecording({
      ticketId,
      blobKey: "blob-get-1",
      sizeBytes: 1024,
    });

    const fetched = await svc.getRecording(userId, created.id);
    expect(fetched.id).toBe(created.id);
    expect(fetched.blobKey).toBe("blob-get-1");
  });

  it("getRecording throws NotFoundError for non-existent recording", async () => {
    await expect(
      svc.getRecording(userId, crypto.randomUUID()),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  // Removed: "getRecording throws ForbiddenError when ticket does not exist"
  // The recordings table has a FK constraint on ticket_id, making orphaned
  // recordings (recording exists, ticket doesn't) physically impossible.
  // Testing this scenario would test PostgreSQL's FK enforcement, not our code.

  it("getRecording throws ForbiddenError for user outside ticket scope", async () => {
    const ticketId = await insertTicket();
    const rec = await svc.createRecording({
      ticketId,
      blobKey: "blob-denied-rec",
      sizeBytes: 256,
    });

    await expect(svc.getRecording(outsiderId, rec.id)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("getAttachment throws ForbiddenError for user outside ticket scope", async () => {
    const ticketId = await insertTicket();
    const att = await svc.createAttachment({
      ticketId,
      blobKey: "blob-denied-att",
      sizeBytes: 256,
    });

    await expect(svc.getAttachment(outsiderId, att.id)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("softDeleteRecording sets deleted_at to a non-null timestamp", async () => {
    const ticketId = await insertTicket();
    const rec = await svc.createRecording({
      ticketId,
      blobKey: "blob-soft-1",
      sizeBytes: 256,
    });

    await svc.softDeleteRecording(rec.id);

    const row = await testDb.db
      .selectFrom("recordings")
      .select("deleted_at")
      .where("id", "=", rec.id)
      .executeTakeFirstOrThrow();

    expect(row.deleted_at).not.toBeNull();
    expect(row.deleted_at).toBeInstanceOf(Date);
  });

  it("softDeleteRecording on already-soft-deleted recording is idempotent", async () => {
    const ticketId = await insertTicket();
    const rec = await svc.createRecording({
      ticketId,
      blobKey: "blob-soft-2",
      sizeBytes: 256,
    });

    await svc.softDeleteRecording(rec.id);
    // Second call should not throw
    await expect(svc.softDeleteRecording(rec.id)).resolves.toBeUndefined();
  });

  it("hardDeleteRecording removes the DB row and calls blobStore.delete", async () => {
    const ticketId = await insertTicket();
    const rec = await svc.createRecording({
      ticketId,
      blobKey: "blob-hard-1",
      sizeBytes: 512,
    });

    const deletesBefore = blobStore.deletedKeys.length;
    await svc.hardDeleteRecording(rec.id);

    // Blob was deleted
    expect(blobStore.deletedKeys.length).toBe(deletesBefore + 1);
    expect(blobStore.deletedKeys).toContain("blob-hard-1");

    // DB row is gone
    const row = await testDb.db
      .selectFrom("recordings")
      .select("id")
      .where("id", "=", rec.id)
      .executeTakeFirst();
    expect(row).toBeUndefined();
  });

  it("listRecordings excludes soft-deleted recordings", async () => {
    const ticketId = await insertTicket();

    const alive = await svc.createRecording({
      ticketId,
      blobKey: "blob-list-alive",
      sizeBytes: 100,
    });
    const deleted = await svc.createRecording({
      ticketId,
      blobKey: "blob-list-deleted",
      sizeBytes: 200,
    });

    await svc.softDeleteRecording(deleted.id);

    const list = await svc.listRecordings(userId, ticketId, { limit: 50 });
    const ids = list.map((r) => r.id);
    expect(ids).toContain(alive.id);
    expect(ids).not.toContain(deleted.id);
  });

  // -----------------------------------------------------------------------
  // Attachments
  // -----------------------------------------------------------------------

  it("createAttachment inserts an attachment row", async () => {
    const ticketId = await insertTicket();
    const att = await svc.createAttachment({
      ticketId,
      blobKey: "blob-att-1",
      sizeBytes: 8192,
      encryptedFilename: Buffer.from("encrypted-name"),
      contentType: "image/png",
    });

    expect(att.ticketId).toBe(ticketId);
    expect(att.blobKey).toBe("blob-att-1");
    expect(att.sizeBytes).toBe(8192);
    expect(Buffer.isBuffer(att.encryptedFilename)).toBe(true);
    expect(att.contentType).toBe("image/png");
    expect(att.followupId).toBeNull();
    expect(att.deletedAt).toBeNull();
  });

  it("getAttachment returns the record after access check passes", async () => {
    const ticketId = await insertTicket();
    const created = await svc.createAttachment({
      ticketId,
      blobKey: "blob-att-get",
      sizeBytes: 1024,
    });

    const fetched = await svc.getAttachment(userId, created.id);
    expect(fetched.id).toBe(created.id);
    expect(fetched.blobKey).toBe("blob-att-get");
  });

  it("softDeleteAttachment sets deleted_at", async () => {
    const ticketId = await insertTicket();
    const att = await svc.createAttachment({
      ticketId,
      blobKey: "blob-att-soft",
      sizeBytes: 512,
    });

    await svc.softDeleteAttachment(att.id);

    const row = await testDb.db
      .selectFrom("attachments")
      .select("deleted_at")
      .where("id", "=", att.id)
      .executeTakeFirstOrThrow();

    expect(row.deleted_at).not.toBeNull();
  });

  it("hardDeleteAttachment removes the DB row and calls blobStore.delete", async () => {
    const ticketId = await insertTicket();
    const att = await svc.createAttachment({
      ticketId,
      blobKey: "blob-att-hard",
      sizeBytes: 512,
    });

    const deletesBefore = blobStore.deletedKeys.length;
    await svc.hardDeleteAttachment(att.id);

    expect(blobStore.deletedKeys.length).toBe(deletesBefore + 1);
    expect(blobStore.deletedKeys).toContain("blob-att-hard");

    const row = await testDb.db
      .selectFrom("attachments")
      .select("id")
      .where("id", "=", att.id)
      .executeTakeFirst();
    expect(row).toBeUndefined();
  });

  it("listAttachments excludes soft-deleted attachments", async () => {
    const ticketId = await insertTicket();

    const alive = await svc.createAttachment({
      ticketId,
      blobKey: "blob-att-list-alive",
      sizeBytes: 100,
    });
    const deleted = await svc.createAttachment({
      ticketId,
      blobKey: "blob-att-list-deleted",
      sizeBytes: 200,
    });

    await svc.softDeleteAttachment(deleted.id);

    const list = await svc.listAttachments(userId, ticketId, { limit: 50 });
    const ids = list.map((a) => a.id);
    expect(ids).toContain(alive.id);
    expect(ids).not.toContain(deleted.id);
  });

  // --- Pagination ---

  it("listRecordings paginates with cursor", async () => {
    const ticketId = await insertTicket();

    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      const rec = await svc.createRecording({
        ticketId,
        blobKey: `blob-page-${String(i)}`,
        sizeBytes: 100,
      });
      ids.push(rec.id);
    }

    // First page of 2
    const page1 = await svc.listRecordings(userId, ticketId, { limit: 2 });
    expect(page1).toHaveLength(2);

    // Second page using cursor
    const page2 = await svc.listRecordings(userId, ticketId, {
      limit: 2,
      cursor: page1[1]!.id,
    });
    expect(page2).toHaveLength(2);

    // Third page (remainder)
    const page3 = await svc.listRecordings(userId, ticketId, {
      limit: 2,
      cursor: page2[1]!.id,
    });
    expect(page3).toHaveLength(1);

    // All 5 IDs covered with no duplicates
    const allIds = [
      ...page1.map((r) => r.id),
      ...page2.map((r) => r.id),
      ...page3.map((r) => r.id),
    ];
    expect(new Set(allIds).size).toBe(5);
  });

  it("listRecordings respects direction", async () => {
    const ticketId = await insertTicket();

    for (let i = 0; i < 3; i++) {
      await svc.createRecording({
        ticketId,
        blobKey: `blob-dir-${String(i)}`,
        sizeBytes: 100,
      });
    }

    const asc = await svc.listRecordings(userId, ticketId, {
      limit: 10,
      direction: "newer",
    });
    const desc = await svc.listRecordings(userId, ticketId, {
      limit: 10,
      direction: "older",
    });

    // Both return same records, same chronological order
    expect(asc.map((r) => r.id)).toEqual(desc.map((r) => r.id));
  });

  // --- followupId filter ---

  it("listRecordings with followupId returns only that follow-up's recordings", async () => {
    const ticketId = await insertTicket();
    const fuId1 = crypto.randomUUID();
    const fuId2 = crypto.randomUUID();

    // Create follow-ups so FK constraint is satisfied
    await testDb.db
      .insertInto("followups")
      .values([
        {
          id: fuId1,
          ticket_id: ticketId,
          source: "client",
          type: "message",
          is_private: false,
          mentioned_pseudonyms: "[]",
          encrypted_content: Buffer.from("c1"),
          created_by: null,
        },
        {
          id: fuId2,
          ticket_id: ticketId,
          source: "client",
          type: "message",
          is_private: false,
          mentioned_pseudonyms: "[]",
          encrypted_content: Buffer.from("c2"),
          created_by: null,
        },
      ])
      .execute();

    const rec1 = await svc.createRecording({
      ticketId,
      followupId: fuId1,
      blobKey: "blob-fu-filter-1",
      sizeBytes: 100,
    });
    await svc.createRecording({
      ticketId,
      followupId: fuId2,
      blobKey: "blob-fu-filter-2",
      sizeBytes: 100,
    });

    const result = await svc.listRecordings(userId, ticketId, {
      limit: 50,
      followupId: fuId1,
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(rec1.id);
  });

  it("listAttachments with followupId returns only that follow-up's attachments", async () => {
    const ticketId = await insertTicket();
    const fuId1 = crypto.randomUUID();
    const fuId2 = crypto.randomUUID();

    await testDb.db
      .insertInto("followups")
      .values([
        {
          id: fuId1,
          ticket_id: ticketId,
          source: "client",
          type: "message",
          is_private: false,
          mentioned_pseudonyms: "[]",
          encrypted_content: Buffer.from("c1"),
          created_by: null,
        },
        {
          id: fuId2,
          ticket_id: ticketId,
          source: "client",
          type: "message",
          is_private: false,
          mentioned_pseudonyms: "[]",
          encrypted_content: Buffer.from("c2"),
          created_by: null,
        },
      ])
      .execute();

    const att1 = await svc.createAttachment({
      ticketId,
      followupId: fuId1,
      blobKey: "blob-att-fu-1",
      sizeBytes: 100,
      contentType: "image/png",
    });
    await svc.createAttachment({
      ticketId,
      followupId: fuId2,
      blobKey: "blob-att-fu-2",
      sizeBytes: 200,
      contentType: "application/pdf",
    });

    const result = await svc.listAttachments(userId, ticketId, {
      limit: 50,
      followupId: fuId1,
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(att1.id);
  });

  it("listAttachments paginates with cursor", async () => {
    const ticketId = await insertTicket();

    const ids: string[] = [];
    for (let i = 0; i < 4; i++) {
      const att = await svc.createAttachment({
        ticketId,
        blobKey: `blob-att-page-${String(i)}`,
        sizeBytes: 100,
      });
      ids.push(att.id);
    }

    // First page of 2
    const page1 = await svc.listAttachments(userId, ticketId, { limit: 2 });
    expect(page1).toHaveLength(2);

    // Second page
    const page2 = await svc.listAttachments(userId, ticketId, {
      limit: 2,
      cursor: page1[1]!.id,
    });
    expect(page2).toHaveLength(2);

    // All 4 IDs covered
    const allIds = [...page1.map((a) => a.id), ...page2.map((a) => a.id)];
    expect(new Set(allIds).size).toBe(4);
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "registerMediaCleanupHandler (DB)",
  () => {
    let testDb: TestDb;
    let blobStore: ReturnType<typeof createMockBlobStore>;
    let queueId: string;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      blobStore = createMockBlobStore();

      const q = await createTestQueue(testDb.db);
      queueId = q.id;
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    async function insertTicket(): Promise<string> {
      const fix = await createTestTicketFixture(testDb.db, { queueId });
      return fix.ticketId;
    }

    it("soft-deletes media past retention and hard-deletes past purge", async () => {
      // Set org_config: retention = 30 days, purge = 60 days
      await testDb.db
        .updateTable("org_config")
        .set({ media_retention_days: 30, media_purge_days: 60 })
        .execute();

      const ticketId = await insertTicket();

      // Insert a recording created 45 days ago (past retention, not past purge)
      const pastRetention = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
      const retentionRec = await testDb.db
        .insertInto("recordings")
        .values({
          ticket_id: ticketId,
          followup_id: null,
          blob_key: "blob-cleanup-retention",
          size_bytes: 1024,
          duration_seconds: 30,
          created_at: pastRetention,
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();

      // Insert a recording soft-deleted 90 days ago (past purge)
      const pastPurge = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const purgeRec = await testDb.db
        .insertInto("recordings")
        .values({
          ticket_id: ticketId,
          followup_id: null,
          blob_key: "blob-cleanup-purge",
          size_bytes: 2048,
          duration_seconds: 60,
          deleted_at: pastPurge,
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();

      // Insert a fresh recording (should be untouched)
      const freshRec = await testDb.db
        .insertInto("recordings")
        .values({
          ticket_id: ticketId,
          followup_id: null,
          blob_key: "blob-cleanup-fresh",
          size_bytes: 512,
          duration_seconds: 10,
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();

      // Capture the cleanup handler via a mock JobQueue
      let capturedHandler:
        | ((payload: Record<string, unknown>) => Promise<void>)
        | undefined;

      const mockJobQueue: JobQueue = {
        process(queue, handler) {
          if (queue === "media-cleanup") {
            capturedHandler = handler;
          }
        },
        async enqueue() {
          return crypto.randomUUID();
        },
        start() {
          return;
        },
        async stop() {
          return;
        },
      };

      registerMediaCleanupHandler(
        mockJobQueue,
        () => testDb.db,
        blobStore,
        async () => [testDb.schemaName],
      );

      expect(capturedHandler).toBeDefined();
      await capturedHandler!({});

      // retentionRec should now be soft-deleted
      const retRow = await testDb.db
        .selectFrom("recordings")
        .select("deleted_at")
        .where("id", "=", retentionRec.id)
        .executeTakeFirst();
      expect(retRow).toBeDefined();
      expect(retRow!.deleted_at).not.toBeNull();

      // purgeRec should be hard-deleted (gone from DB, blob deleted)
      const purgeRow = await testDb.db
        .selectFrom("recordings")
        .select("id")
        .where("id", "=", purgeRec.id)
        .executeTakeFirst();
      expect(purgeRow).toBeUndefined();
      expect(blobStore.deletedKeys).toContain("blob-cleanup-purge");

      // freshRec should be untouched
      const freshRow = await testDb.db
        .selectFrom("recordings")
        .select("deleted_at")
        .where("id", "=", freshRec.id)
        .executeTakeFirstOrThrow();
      expect(freshRow.deleted_at).toBeNull();
    });
  },
);
