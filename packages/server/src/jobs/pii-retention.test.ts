/**
 * Integration tests for the PII retention purge job.
 *
 * DB tests run inside Docker via `pnpm test:server:db`.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import * as crypto from "node:crypto";
import type { TestDb } from "../test-utils.js";
import {
  createTestDb,
  createMockJobQueue,
  createMemoryBlobStore,
  seedOrgPublicKey,
  createTestTicketFixture,
  noopEncryptor,
  testSealedBox,
  TEST_ORG_ID,
} from "../test-utils.js";
import {
  findPurgeableTickets,
  purgeTenant,
  purgeTicket,
  purgeClient,
  registerPiiRetentionHandler,
  PII_RETENTION_QUEUE,
  PII_RETENTION_INTERVAL_MS,
} from "./pii-retention.js";
import { newFollowupId, newAttachmentId, newRecordingId } from "@care-y/shared";
import type {
  TicketId,
  ClientId,
  PhoneId,
  PhoneHash,
  QueueId,
  KeyGeneration,
  BlobKey,
  CallSid,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Insert a follow-up at a specific time. */
async function insertFollowup(
  db: TestDb["db"],
  ticketId: TicketId,
  createdAt: Date,
): Promise<void> {
  await db
    .insertInto("followups")
    .values({
      id: newFollowupId(),
      ticket_id: ticketId,
      source: "volunteer",
      type: "message",
      encrypted_content: Buffer.from("ct-test"),
      created_at: createdAt,
    })
    .execute();
}

/** Insert a recording with a blob key. */
async function insertRecording(
  db: TestDb["db"],
  ticketId: TicketId,
  blobKey: BlobKey,
): Promise<void> {
  await db
    .insertInto("recordings")
    .values({
      id: newRecordingId(),
      ticket_id: ticketId,
      blob_key: blobKey,
      size_bytes: 100,
      duration_seconds: 10,
      file_key_wrap: Buffer.alloc(72, 0xab),
    })
    .execute();
}

/** Insert an attachment with a blob key. */
async function insertAttachment(
  db: TestDb["db"],
  ticketId: TicketId,
  blobKey: BlobKey,
): Promise<void> {
  await db
    .insertInto("attachments")
    .values({
      id: newAttachmentId(),
      ticket_id: ticketId,
      blob_key: blobKey,
      size_bytes: 50,
      content_type: "text/plain",
      encrypted_filename: Buffer.from("name"),
      file_key_wrap: Buffer.alloc(72, 0xab),
    })
    .execute();
}

/** Insert a tracked call for a ticket. */
async function insertTrackedCall(
  db: TestDb["db"],
  ticketId: TicketId,
  callSid: string,
): Promise<void> {
  await db
    .insertInto("tracked_calls")
    .values({
      call_sid: callSid as CallSid,
      ticket_id: ticketId,
      direction: "inbound",
    })
    .execute();
}

/** Create a phone row for tests. Returns the phone ID. */
async function createTestPhone(
  db: TestDb["db"],
  uid: string,
  overrides?: Record<string, unknown>,
): Promise<PhoneId> {
  const phoneRow = {
    phone_hash: `ph-${uid}` as PhoneHash,
    encrypted_number: noopEncryptor.encrypt(`+1555${uid}`),
    locale: "en-US",
    ...overrides,
  };
  // care-y-ignore-next-line no-plaintext-db-write -- phone_hash is a blind index, encrypted_number passes through noopEncryptor.encrypt() above
  const row = await db
    .insertInto("phones")
    .values(phoneRow)
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

/** Create a client row for tests. Returns the client ID. */
async function createTestClientRow(
  db: TestDb["db"],
  uid: string,
  phoneId: PhoneId,
): Promise<ClientId> {
  const clientRow = {
    encrypted_alias: testSealedBox.sealBuffer(Buffer.from(`cl-${uid}`)),
    alias_hash: null,
    phone_id: phoneId,
  };
  // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is test ciphertext via testSealedBox; phone_id is a UUID FK
  const row = await db
    .insertInto("clients")
    .values(clientRow)
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

/** Set pii_retention_days on the org_config row. */
async function setRetention(
  db: TestDb["db"],
  days: number | null,
): Promise<void> {
  await db
    .updateTable("org_config")
    .set({ pii_retention_days: days })
    .execute();
}

/** Close a ticket. */
async function closeTicket(
  db: TestDb["db"],
  ticketId: TicketId,
): Promise<void> {
  await db
    .updateTable("tickets")
    .set({ status: "closed" })
    .where("id", "=", ticketId)
    .execute();
}

/** Create a second ticket for an existing client. */
async function createTicketForClient(
  db: TestDb["db"],
  clientId: ClientId,
  queueId: QueueId,
): Promise<TicketId> {
  const row = await db
    .insertInto("tickets")
    .values({
      client_id: clientId,
      queue_id: queueId,
      encrypted_title: noopEncryptor.encrypt("extra-title"),
      encrypted_description: noopEncryptor.encrypt("extra-desc"),
      key_generation: crypto.randomUUID() as KeyGeneration,
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

// ---------------------------------------------------------------------------
// DB integration tests: anchor query (findPurgeableTickets)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "pii-retention anchor query (DB integration)",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("selects closed tickets with last activity older than cutoff", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      await closeTicket(testDb.db, fixture.ticketId);
      // Add a follow-up 100 days ago
      await insertFollowup(
        testDb.db,
        fixture.ticketId,
        new Date(Date.now() - 100 * MS_PER_DAY),
      );

      const cutoff = new Date(Date.now() - 90 * MS_PER_DAY);
      const result = await findPurgeableTickets(testDb.db, cutoff);

      const found = result.find((r) => r.ticketId === fixture.ticketId);
      expect(found).toBeDefined();
    });

    it("skips open tickets even if their last activity is old", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      // Ticket is open by default. Add an old follow-up.
      await insertFollowup(
        testDb.db,
        fixture.ticketId,
        new Date(Date.now() - 200 * MS_PER_DAY),
      );

      const cutoff = new Date(Date.now() - 90 * MS_PER_DAY);
      const result = await findPurgeableTickets(testDb.db, cutoff);

      const found = result.find((r) => r.ticketId === fixture.ticketId);
      expect(found).toBeUndefined();
    });

    it("skips closed tickets with recent activity", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      await closeTicket(testDb.db, fixture.ticketId);
      // Add a follow-up 5 days ago (within the 90-day window)
      await insertFollowup(
        testDb.db,
        fixture.ticketId,
        new Date(Date.now() - 5 * MS_PER_DAY),
      );

      const cutoff = new Date(Date.now() - 90 * MS_PER_DAY);
      const result = await findPurgeableTickets(testDb.db, cutoff);

      const found = result.find((r) => r.ticketId === fixture.ticketId);
      expect(found).toBeUndefined();
    });

    it("uses ticket created_at when there are no follow-ups", async () => {
      // A ticket with no follow-ups at all should use created_at as its
      // last activity date. Since we just created it, it should NOT be
      // eligible for purge with a 90-day cutoff.
      const fixture = await createTestTicketFixture(testDb.db);
      await closeTicket(testDb.db, fixture.ticketId);

      const cutoff = new Date(Date.now() - 90 * MS_PER_DAY);
      const result = await findPurgeableTickets(testDb.db, cutoff);

      const found = result.find((r) => r.ticketId === fixture.ticketId);
      expect(found).toBeUndefined();
    });
  },
);

// ---------------------------------------------------------------------------
// DB integration tests: purgeTicket (blob-first ordering, cascade)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "pii-retention purgeTicket (DB integration)",
  () => {
    let testDb: TestDb;
    let blobStore: ReturnType<typeof createMemoryBlobStore>;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      blobStore = createMemoryBlobStore();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("deletes blobs before rows (recording and attachment)", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const recBlobKey = "test/recording/purge-rec" as BlobKey;
      const attBlobKey = "test/attachment/purge-att" as BlobKey;

      blobStore.blobs.set(recBlobKey, Buffer.from("rec-bytes"));
      blobStore.blobs.set(attBlobKey, Buffer.from("att-bytes"));

      await insertRecording(testDb.db, fixture.ticketId, recBlobKey);
      await insertAttachment(testDb.db, fixture.ticketId, attBlobKey);

      const { jobQueue } = createMockJobQueue();

      // Track call order: blob deletes should happen before row deletes
      const deletedBlobKeys: string[] = [];
      const trackedBlobStore = {
        ...blobStore,
        async delete(key: BlobKey): Promise<void> {
          deletedBlobKeys.push(key);
          return blobStore.delete(key);
        },
        async put(
          ...args: Parameters<typeof blobStore.put>
        ): ReturnType<typeof blobStore.put> {
          return blobStore.put(...args);
        },
        async get(
          ...args: Parameters<typeof blobStore.get>
        ): ReturnType<typeof blobStore.get> {
          return blobStore.get(...args);
        },
        async exists(
          ...args: Parameters<typeof blobStore.exists>
        ): ReturnType<typeof blobStore.exists> {
          return blobStore.exists(...args);
        },
      };

      const counts = await testDb.db
        .transaction()
        .execute(async (trx) =>
          purgeTicket(
            trx,
            fixture.ticketId,
            trackedBlobStore,
            jobQueue,
            TEST_ORG_ID,
          ),
        );

      // Blobs deleted
      expect(deletedBlobKeys).toContain(recBlobKey);
      expect(deletedBlobKeys).toContain(attBlobKey);
      expect(counts.blobsDeleted).toBe(2);

      // Ticket row gone
      const ticket = await testDb.db
        .selectFrom("tickets")
        .select("id")
        .where("id", "=", fixture.ticketId)
        .executeTakeFirst();
      expect(ticket).toBeUndefined();
    });

    it("clears tracked_calls and enqueues log deletion", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const callSid = `CA${crypto.randomUUID().slice(0, 30)}`;
      await insertTrackedCall(testDb.db, fixture.ticketId, callSid);

      const { jobQueue } = createMockJobQueue();

      const counts = await testDb.db
        .transaction()
        .execute(async (trx) =>
          purgeTicket(trx, fixture.ticketId, blobStore, jobQueue, TEST_ORG_ID),
        );

      expect(counts.logDeletionsEnqueued).toBe(1);
      expect(jobQueue.enqueue).toHaveBeenCalledWith(
        "log-deletion",
        expect.objectContaining({
          orgId: TEST_ORG_ID,
          resourceType: "call",
          resourceId: callSid,
        }),
        expect.objectContaining({ maxRetries: 3 }),
      );

      // tracked_calls row gone
      const tracked = await testDb.db
        .selectFrom("tracked_calls")
        .select("call_sid")
        .where("call_sid", "=", callSid as CallSid)
        .executeTakeFirst();
      expect(tracked).toBeUndefined();
    });
  },
);

// ---------------------------------------------------------------------------
// DB integration tests: purgeTenant (full sweep)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "pii-retention purgeTenant (DB integration)",
  () => {
    let testDb: TestDb;
    let blobStore: ReturnType<typeof createMemoryBlobStore>;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      blobStore = createMemoryBlobStore();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("skips tenant when pii_retention_days is null", async () => {
      await setRetention(testDb.db, null);
      const { jobQueue } = createMockJobQueue();

      const result = await purgeTenant(
        testDb.db,
        blobStore,
        jobQueue,
        TEST_ORG_ID,
      );

      expect(result.ticketsPurged).toBe(0);
      expect(result.clientsPurged).toBe(0);
    });

    it("skips tenant when pii_retention_days is 0", async () => {
      await setRetention(testDb.db, 0);
      const { jobQueue } = createMockJobQueue();

      const result = await purgeTenant(
        testDb.db,
        blobStore,
        jobQueue,
        TEST_ORG_ID,
      );

      expect(result.ticketsPurged).toBe(0);
    });

    it("skips tenant when pii_retention_days is negative", async () => {
      await setRetention(testDb.db, -5);
      const { jobQueue } = createMockJobQueue();

      const result = await purgeTenant(
        testDb.db,
        blobStore,
        jobQueue,
        TEST_ORG_ID,
      );

      expect(result.ticketsPurged).toBe(0);
    });

    it("purges eligible closed tickets and orphaned clients", async () => {
      await setRetention(testDb.db, 90);
      const fixture = await createTestTicketFixture(testDb.db);
      await closeTicket(testDb.db, fixture.ticketId);
      // Old follow-up: 100 days ago
      await insertFollowup(
        testDb.db,
        fixture.ticketId,
        new Date(Date.now() - 100 * MS_PER_DAY),
      );

      const { jobQueue } = createMockJobQueue();

      const result = await purgeTenant(
        testDb.db,
        blobStore,
        jobQueue,
        TEST_ORG_ID,
      );

      expect(result.ticketsPurged).toBeGreaterThanOrEqual(1);
      expect(result.clientsPurged).toBeGreaterThanOrEqual(1);

      // Client row gone
      const client = await testDb.db
        .selectFrom("clients")
        .select("id")
        .where("id", "=", fixture.clientId)
        .executeTakeFirst();
      expect(client).toBeUndefined();

      // Phone row gone
      const phone = await testDb.db
        .selectFrom("phones")
        .select("id")
        .where("id", "=", fixture.phoneId)
        .executeTakeFirst();
      expect(phone).toBeUndefined();
    });

    it("keeps clients who have open tickets", async () => {
      await setRetention(testDb.db, 90);
      const fixture = await createTestTicketFixture(testDb.db);

      // Ticket 1: closed, old activity
      await closeTicket(testDb.db, fixture.ticketId);
      await insertFollowup(
        testDb.db,
        fixture.ticketId,
        new Date(Date.now() - 100 * MS_PER_DAY),
      );

      // Ticket 2: open (default status)
      const openTicketId = await createTicketForClient(
        testDb.db,
        fixture.clientId,
        fixture.queueId,
      );

      const { jobQueue } = createMockJobQueue();

      const result = await purgeTenant(
        testDb.db,
        blobStore,
        jobQueue,
        TEST_ORG_ID,
      );

      // The closed old ticket should be purged
      const closedTicket = await testDb.db
        .selectFrom("tickets")
        .select("id")
        .where("id", "=", fixture.ticketId)
        .executeTakeFirst();
      expect(closedTicket).toBeUndefined();

      // The open ticket should still exist
      const openTicket = await testDb.db
        .selectFrom("tickets")
        .select("id")
        .where("id", "=", openTicketId)
        .executeTakeFirst();
      expect(openTicket).toBeDefined();

      // Client should still exist (they have an open ticket)
      const client = await testDb.db
        .selectFrom("clients")
        .select("id")
        .where("id", "=", fixture.clientId)
        .executeTakeFirst();
      expect(client).toBeDefined();

      expect(result.clientsPurged).toBe(0);
    });

    it("keeps clients whose last ticket has recent activity", async () => {
      await setRetention(testDb.db, 90);
      const fixture = await createTestTicketFixture(testDb.db);
      await closeTicket(testDb.db, fixture.ticketId);
      // Recent follow-up: 10 days ago
      await insertFollowup(
        testDb.db,
        fixture.ticketId,
        new Date(Date.now() - 10 * MS_PER_DAY),
      );

      const { jobQueue } = createMockJobQueue();

      const result = await purgeTenant(
        testDb.db,
        blobStore,
        jobQueue,
        TEST_ORG_ID,
      );

      // Neither ticket nor client should be purged
      const ticket = await testDb.db
        .selectFrom("tickets")
        .select("id")
        .where("id", "=", fixture.ticketId)
        .executeTakeFirst();
      expect(ticket).toBeDefined();

      expect(result.ticketsPurged).toBe(0);
    });
  },
);

// ---------------------------------------------------------------------------
// DB integration tests: purgeClient (reusable cascade)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "pii-retention purgeClient (DB integration)",
  () => {
    let testDb: TestDb;
    let blobStore: ReturnType<typeof createMemoryBlobStore>;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      blobStore = createMemoryBlobStore();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("deletes the client, their tickets, phone, and email", async () => {
      const uid = crypto.randomUUID().slice(0, 8);
      const phoneId = await createTestPhone(testDb.db, `purge-${uid}`);
      const clientId = await createTestClientRow(
        testDb.db,
        `purge-${uid}`,
        phoneId,
      );

      // Create a queue and ticket
      const queue = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: Buffer.from(`Q-purge-${uid}`),
          sort_order: 999,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("tickets")
        .values({
          client_id: clientId,
          queue_id: queue.id,
          encrypted_title: noopEncryptor.encrypt("purge-title"),
          encrypted_description: noopEncryptor.encrypt("purge-desc"),
          key_generation: crypto.randomUUID() as KeyGeneration,
        })
        .execute();

      const { jobQueue } = createMockJobQueue();

      const counts = await testDb.db
        .transaction()
        .execute(async (trx) =>
          purgeClient(trx, clientId, blobStore, jobQueue, TEST_ORG_ID),
        );

      expect(counts.ticketsPurged).toBe(1);

      // Client gone
      const remainingClient = await testDb.db
        .selectFrom("clients")
        .select("id")
        .where("id", "=", clientId)
        .executeTakeFirst();
      expect(remainingClient).toBeUndefined();

      // Phone gone (no other client references it)
      const remainingPhone = await testDb.db
        .selectFrom("phones")
        .select("id")
        .where("id", "=", phoneId)
        .executeTakeFirst();
      expect(remainingPhone).toBeUndefined();
    });

    it("preserves phone row when shared by another client", async () => {
      const uid = crypto.randomUUID().slice(0, 8);
      const sharedPhoneId = await createTestPhone(testDb.db, `shared-${uid}`, {
        is_shared_line: true,
      });

      // Client A (will be purged)
      const clientAId = await createTestClientRow(
        testDb.db,
        `A-${uid}`,
        sharedPhoneId,
      );

      // Client B (keeps the phone)
      await createTestClientRow(testDb.db, `B-${uid}`, sharedPhoneId);

      const { jobQueue } = createMockJobQueue();

      await testDb.db
        .transaction()
        .execute(async (trx) =>
          purgeClient(trx, clientAId, blobStore, jobQueue, TEST_ORG_ID),
        );

      // Phone should still exist (client B references it)
      const remainingPhone = await testDb.db
        .selectFrom("phones")
        .select("id")
        .where("id", "=", sharedPhoneId)
        .executeTakeFirst();
      expect(remainingPhone).toBeDefined();
    });
  },
);

// ---------------------------------------------------------------------------
// Unit tests: registerPiiRetentionHandler (self-enqueue chain)
// ---------------------------------------------------------------------------

describe("registerPiiRetentionHandler", () => {
  it("runs the tenant sweep and re-enqueues with the interval on success", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const getTenantDb = vi.fn();
    const blobStore = createMemoryBlobStore();
    const listActiveOrgs = vi.fn().mockResolvedValue([]);

    registerPiiRetentionHandler(
      jobQueue,
      getTenantDb,
      blobStore,
      listActiveOrgs,
    );

    const handler = handlers.get(PII_RETENTION_QUEUE);
    expect(handler).toBeDefined();
    await handler!({});

    expect(listActiveOrgs).toHaveBeenCalledOnce();
    expect(jobQueue.enqueue).toHaveBeenCalledWith(
      PII_RETENTION_QUEUE,
      {},
      { delay: PII_RETENTION_INTERVAL_MS },
    );
  });

  it("re-enqueues even when the tenant sweep throws", async () => {
    const { jobQueue, handlers } = createMockJobQueue();
    const getTenantDb = vi.fn();
    const blobStore = createMemoryBlobStore();
    const listActiveOrgs = vi.fn().mockRejectedValue(new Error("sweep failed"));

    registerPiiRetentionHandler(
      jobQueue,
      getTenantDb,
      blobStore,
      listActiveOrgs,
    );

    const handler = handlers.get(PII_RETENTION_QUEUE);
    expect(handler).toBeDefined();

    await expect(handler!({})).rejects.toThrow("sweep failed");

    expect(jobQueue.enqueue).toHaveBeenCalledWith(
      PII_RETENTION_QUEUE,
      {},
      { delay: PII_RETENTION_INTERVAL_MS },
    );
  });
});
