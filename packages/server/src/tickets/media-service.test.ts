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
import { NotFoundError } from "../errors.js";
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
  let queueId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);

    const user = await createTestUser(testDb.db);
    userId = user.id;

    access = createTicketAccessChecker(testDb.db);
    blobStore = createMockBlobStore();
    svc = createMediaService(testDb.db, blobStore, access);

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

    const list = await svc.listRecordings(userId, ticketId);
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

    const list = await svc.listAttachments(userId, ticketId);
    const ids = list.map((a) => a.id);
    expect(ids).toContain(alive.id);
    expect(ids).not.toContain(deleted.id);
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
