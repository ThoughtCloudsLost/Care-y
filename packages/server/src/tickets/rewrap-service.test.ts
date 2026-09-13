import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import {
  createTicketAccessChecker,
  type TicketAccessChecker,
} from "./access.js";
import { rewrapFollowUp, type RewrapInput } from "./rewrap-service.js";
import { ForbiddenError } from "../errors.js";
import * as crypto from "node:crypto";
import type { BlobStore, BlobCategory } from "../storage/store.js";
import {
  newFollowupId,
  newKeyGeneration,
  type KeyGeneration,
  type BlobKey,
  type OrgSchema,
} from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("rewrapFollowUp (DB)", () => {
  let testDb: TestDb;
  let access: TicketAccessChecker;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    access = createTicketAccessChecker(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function createFixtureWithFollowUp(opts?: {
    keyGeneration?: KeyGeneration;
  }) {
    const fix = await createTestTicketFixture(testDb.db, { createUser: true });
    const keyGen = opts?.keyGeneration ?? newKeyGeneration();

    const fu = await testDb.db
      .insertInto("followups")
      .values({
        ticket_id: fix.ticketId,
        source: "client",
        type: "sms_inbound",
        encrypted_content: Buffer.from("temp-encrypted"),
        key_generation: keyGen,
      })
      .returning(["id", "ticket_id"])
      .executeTakeFirstOrThrow();

    await testDb.db
      .insertInto("ticket_key_wraps")
      .values({
        ticket_id: fix.ticketId,
        volunteer_id: fix.userId!,
        key_generation: keyGen,
        ephemeral_point: crypto.randomBytes(32),
        nonce: crypto.randomBytes(24),
        wrapped_key: crypto.randomBytes(48),
        algorithm: "ecies-ristretto255-v1",
      })
      .execute();

    return {
      userId: fix.userId!,
      ticketId: fix.ticketId,
      queueId: fix.queueId,
      followUpId: fu.id,
      keyGeneration: keyGen,
    };
  }

  it("replaces content, clears key_generation, deletes temp wraps", async () => {
    const { userId, followUpId, ticketId, keyGeneration } =
      await createFixtureWithFollowUp();

    const result = await rewrapFollowUp(testDb.db, access, userId, {
      followUpId,
      encryptedContent: Buffer.from("canonical-encrypted"),
    });

    expect(result.rewrapped).toBe(true);

    const fu = await testDb.db
      .selectFrom("followups")
      .select(["encrypted_content", "key_generation"])
      .where("id", "=", followUpId)
      .executeTakeFirstOrThrow();

    expect(fu.key_generation).toBeNull();
    expect(fu.encrypted_content.toString()).toBe("canonical-encrypted");

    const wraps = await testDb.db
      .selectFrom("ticket_key_wraps")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("key_generation", "=", keyGeneration)
      .execute();

    expect(wraps).toHaveLength(0);
  });

  it("returns rewrapped: false when follow-up does not exist", async () => {
    const fix = await createTestTicketFixture(testDb.db, { createUser: true });

    const result = await rewrapFollowUp(testDb.db, access, fix.userId!, {
      followUpId: newFollowupId(),
      encryptedContent: Buffer.from("x"),
    });

    expect(result.rewrapped).toBe(false);
  });

  it("is idempotent (second call returns rewrapped: false)", async () => {
    const { userId, followUpId } = await createFixtureWithFollowUp();

    const first = await rewrapFollowUp(testDb.db, access, userId, {
      followUpId,
      encryptedContent: Buffer.from("canonical"),
    });
    expect(first.rewrapped).toBe(true);

    const second = await rewrapFollowUp(testDb.db, access, userId, {
      followUpId,
      encryptedContent: Buffer.from("different"),
    });
    expect(second.rewrapped).toBe(false);

    const fu = await testDb.db
      .selectFrom("followups")
      .select("encrypted_content")
      .where("id", "=", followUpId)
      .executeTakeFirstOrThrow();
    expect(fu.encrypted_content.toString()).toBe("canonical");
  });

  it("throws ForbiddenError for user without ticket access", async () => {
    const { followUpId } = await createFixtureWithFollowUp();
    const outsider = await createTestUser(testDb.db);

    await expect(
      rewrapFollowUp(testDb.db, access, outsider.id, {
        followUpId,
        encryptedContent: Buffer.from("x"),
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("replaces blob keys in attachments and recordings tables", async () => {
    const { userId, followUpId, ticketId } = await createFixtureWithFollowUp();

    await testDb.db
      .insertInto("recordings")
      .values({
        ticket_id: ticketId,
        followup_id: followUpId,
        blob_key: "old-rec-key" as BlobKey,
        size_bytes: 1024,
        duration_seconds: 10,
      })
      .execute();

    await testDb.db
      .insertInto("attachments")
      .values({
        ticket_id: ticketId,
        followup_id: followUpId,
        blob_key: "old-att-key" as BlobKey,
        size_bytes: 2048,
        content_type: "image/jpeg",
      })
      .execute();

    const mockBlobStore: BlobStore = {
      put: vi
        .fn()
        .mockResolvedValueOnce("new-rec-key")
        .mockResolvedValueOnce("new-att-key"),
      get: vi.fn(),
      exists: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const input: RewrapInput = {
      followUpId,
      encryptedContent: Buffer.from("canonical"),
      blobUpdates: [
        {
          oldBlobKey: "old-rec-key" as BlobKey,
          encryptedData: Buffer.from("re-encrypted-rec"),
          category: "recording" as BlobCategory,
        },
        {
          oldBlobKey: "old-att-key" as BlobKey,
          encryptedData: Buffer.from("re-encrypted-att"),
          category: "attachment" as BlobCategory,
        },
      ],
    };

    const result = await rewrapFollowUp(
      testDb.db,
      access,
      userId,
      input,
      mockBlobStore,
      "test_schema" as OrgSchema,
    );

    expect(result.rewrapped).toBe(true);
    expect(mockBlobStore.put).toHaveBeenCalledTimes(2);

    const rec = await testDb.db
      .selectFrom("recordings")
      .select("blob_key")
      .where("followup_id", "=", followUpId)
      .executeTakeFirstOrThrow();
    expect(rec.blob_key).toBe("new-rec-key");

    const att = await testDb.db
      .selectFrom("attachments")
      .select("blob_key")
      .where("followup_id", "=", followUpId)
      .executeTakeFirstOrThrow();
    expect(att.blob_key).toBe("new-att-key");

    expect(mockBlobStore.delete).toHaveBeenCalledWith("old-rec-key");
    expect(mockBlobStore.delete).toHaveBeenCalledWith("old-att-key");
  });

  it("skips blob processing when no blobUpdates provided", async () => {
    const { userId, followUpId } = await createFixtureWithFollowUp();

    const mockBlobStore: BlobStore = {
      put: vi.fn(),
      get: vi.fn(),
      exists: vi.fn(),
      delete: vi.fn(),
    };

    await rewrapFollowUp(
      testDb.db,
      access,
      userId,
      { followUpId, encryptedContent: Buffer.from("canonical") },
      mockBlobStore,
      "test_schema" as OrgSchema,
    );

    expect(mockBlobStore.put).not.toHaveBeenCalled();
    expect(mockBlobStore.delete).not.toHaveBeenCalled();
  });
});
