/**
 * DB integration tests for KB media service.
 *
 * Requires DATABASE_URL (runs inside Docker via `pnpm test:server:db`).
 * Creates an isolated test schema with kb_items and kb_attachments tables.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, type TestDb } from "../test-utils.js";
import {
  createKBMediaService,
  type KBMediaService,
} from "./kb-media-service.js";
import { NotFoundError } from "../errors.js";

const HAS_DB = !!process.env.DATABASE_URL;

describe.skipIf(!HAS_DB)("KBMediaService (DB integration)", () => {
  let ctx: TestDb;
  let svc: KBMediaService;
  let itemId: string;

  beforeAll(async () => {
    ctx = await createTestDb();

    // Insert a KB category and item to FK against
    const category = await ctx.db
      .insertInto("kb_categories")
      .values({
        encrypted_name: Buffer.from("test-category"),
        sort_order: 0,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const item = await ctx.db
      .insertInto("kb_items")
      .values({
        category_id: category.id,
        encrypted_title: Buffer.from("test-title"),
        encrypted_body: Buffer.from("test-body"),
        created_by: "user-1",
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    itemId = item.id;
    svc = createKBMediaService(ctx.db);
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it("creates an attachment and returns a record", async () => {
    const record = await svc.createAttachment({
      itemId,
      blobKey: "blob-key-1",
      sizeBytes: 2048,
      encryptedFilename: Buffer.from("encrypted-name"),
      contentType: "image/png",
    });

    expect(record.id).toBeDefined();
    expect(record.itemId).toBe(itemId);
    expect(record.blobKey).toBe("blob-key-1");
    expect(record.sizeBytes).toBe(2048);
    expect(record.encryptedFilename).toBeInstanceOf(Buffer);
    expect(record.contentType).toBe("image/png");
    expect(record.deletedAt).toBeNull();
  });

  it("creates an attachment without optional fields", async () => {
    const record = await svc.createAttachment({
      itemId,
      blobKey: "blob-key-2",
      sizeBytes: 512,
    });

    expect(record.encryptedFilename).toBeNull();
    expect(record.contentType).toBeNull();
  });

  it("retrieves an attachment by ID", async () => {
    const created = await svc.createAttachment({
      itemId,
      blobKey: "blob-key-get",
      sizeBytes: 100,
      contentType: "application/pdf",
    });

    const fetched = await svc.getAttachment(created.id);
    expect(fetched.id).toBe(created.id);
    expect(fetched.blobKey).toBe("blob-key-get");
  });

  it("throws NotFoundError for non-existent attachment", async () => {
    await expect(
      svc.getAttachment("00000000-0000-0000-0000-000000000000"),
    ).rejects.toThrow(NotFoundError);
  });

  it("lists attachments for an item", async () => {
    // Create a fresh item with known attachments
    const category = await ctx.db
      .insertInto("kb_categories")
      .values({
        encrypted_name: Buffer.from("list-cat"),
        sort_order: 1,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const item = await ctx.db
      .insertInto("kb_items")
      .values({
        category_id: category.id,
        encrypted_title: Buffer.from("list-title"),
        encrypted_body: Buffer.from("list-body"),
        created_by: "user-1",
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    await svc.createAttachment({
      itemId: item.id,
      blobKey: "list-key-1",
      sizeBytes: 100,
    });
    await svc.createAttachment({
      itemId: item.id,
      blobKey: "list-key-2",
      sizeBytes: 200,
    });

    const attachments = await svc.listAttachments(item.id);
    expect(attachments).toHaveLength(2);
    expect(attachments[0]!.blobKey).toBe("list-key-1");
    expect(attachments[1]!.blobKey).toBe("list-key-2");
  });

  it("excludes soft-deleted attachments from list", async () => {
    const created = await svc.createAttachment({
      itemId,
      blobKey: "soft-del-key",
      sizeBytes: 50,
    });

    await svc.softDeleteAttachment(created.id);

    // getAttachment should not find it
    await expect(svc.getAttachment(created.id)).rejects.toThrow(NotFoundError);
  });

  it("soft-delete is idempotent (throws on second attempt)", async () => {
    const created = await svc.createAttachment({
      itemId,
      blobKey: "double-del-key",
      sizeBytes: 50,
    });

    await svc.softDeleteAttachment(created.id);

    // Second soft-delete throws (already deleted)
    await expect(svc.softDeleteAttachment(created.id)).rejects.toThrow(
      NotFoundError,
    );
  });

  it("soft-delete throws for non-existent attachment", async () => {
    await expect(
      svc.softDeleteAttachment("00000000-0000-0000-0000-000000000000"),
    ).rejects.toThrow(NotFoundError);
  });
});
