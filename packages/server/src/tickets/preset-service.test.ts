import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  type TestDb,
} from "../test-utils.js";
import { createPresetService, type PresetService } from "./preset-service.js";
import { NotFoundError } from "../errors.js";
import * as crypto from "node:crypto";

describe.skipIf(!process.env.DATABASE_URL)("PresetService (DB)", () => {
  let testDb: TestDb;
  let svc: PresetService;
  let queueId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    svc = createPresetService(testDb.db);

    const q = await createTestQueue(testDb.db);
    queueId = q.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("create inserts preset with encrypted blobs", async () => {
    const preset = await svc.create({
      encryptedTitle: Buffer.from("title-enc"),
      encryptedBody: Buffer.from("body-enc"),
      queueId: null,
      createdBy: "user-123",
    });

    expect(preset.id).toBeTruthy();
    expect(Buffer.isBuffer(preset.encryptedTitle)).toBe(true);
    expect(Buffer.isBuffer(preset.encryptedBody)).toBe(true);
    expect(preset.queueId).toBeNull();
    expect(preset.createdBy).toBe("user-123");
  });

  it("list returns global and queue-specific presets", async () => {
    await svc.create({
      encryptedTitle: Buffer.from("global"),
      encryptedBody: Buffer.from("g-body"),
      queueId: null,
      createdBy: "u1",
    });
    await svc.create({
      encryptedTitle: Buffer.from("queue-specific"),
      encryptedBody: Buffer.from("q-body"),
      queueId,
      createdBy: "u2",
    });

    const all = await svc.list(queueId);
    const titles = all.map((p) => p.encryptedTitle.toString());
    expect(titles).toContain("global");
    expect(titles).toContain("queue-specific");
  });

  it("list without queueId returns all presets", async () => {
    const all = await svc.list();
    expect(all.length).toBeGreaterThan(0);
  });

  it("update modifies only provided fields", async () => {
    const preset = await svc.create({
      encryptedTitle: Buffer.from("old-title"),
      encryptedBody: Buffer.from("old-body"),
      queueId: null,
      createdBy: "u1",
    });

    const updated = await svc.update(preset.id, {
      encryptedTitle: Buffer.from("new-title"),
    });

    expect(updated.encryptedTitle.toString()).toBe("new-title");
    expect(updated.encryptedBody.toString()).toBe("old-body");
  });

  it("update with no fields returns current state", async () => {
    const preset = await svc.create({
      encryptedTitle: Buffer.from("same"),
      encryptedBody: Buffer.from("same-body"),
      queueId: null,
      createdBy: "u1",
    });
    const same = await svc.update(preset.id, {});
    expect(same.encryptedTitle.toString()).toBe("same");
  });

  it("update throws NotFoundError for non-existent preset", async () => {
    await expect(
      svc.update(crypto.randomUUID(), {
        encryptedTitle: Buffer.from("x"),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("delete removes the preset row", async () => {
    const preset = await svc.create({
      encryptedTitle: Buffer.from("to-delete"),
      encryptedBody: Buffer.from("del-body"),
      queueId: null,
      createdBy: "u1",
    });

    await svc.delete(preset.id);

    // Verify it's gone
    const row = await testDb.db
      .selectFrom("preset_replies")
      .selectAll()
      .where("id", "=", preset.id)
      .executeTakeFirst();
    expect(row).toBeUndefined();
  });

  it("delete throws NotFoundError for non-existent preset", async () => {
    await expect(svc.delete(crypto.randomUUID())).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
