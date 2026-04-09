import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import {
  createFollowUpService,
  type FollowUpService,
} from "./followup-service.js";
import {
  createTicketAccessChecker,
  type TicketAccessChecker,
} from "./access.js";
import { ForbiddenError, NotFoundError } from "../errors.js";
import * as crypto from "node:crypto";

describe.skipIf(!process.env.DATABASE_URL)("FollowUpService (DB)", () => {
  let testDb: TestDb;
  let access: TicketAccessChecker;
  let svc: FollowUpService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    access = createTicketAccessChecker(testDb.db);
    svc = createFollowUpService(testDb.db, access);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function createTicketFixture() {
    const fix = await createTestTicketFixture(testDb.db, { createUser: true });
    return {
      userId: fix.userId!,
      clientId: fix.clientId,
      queueId: fix.queueId,
      ticketId: fix.ticketId,
      phoneId: fix.phoneId,
    };
  }

  it("create inserts follow-up with encrypted_content", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("content-blob"),
      source: "volunteer",
      type: "note",
      isPrivate: false,
      mentionedPseudonyms: ["alice"],
    });

    expect(fu.id).toBeTruthy();
    expect(fu.ticketId).toBe(ticketId);
    expect(fu.source).toBe("volunteer");
    expect(fu.type).toBe("note");
    expect(fu.isPrivate).toBe(false);
    expect(fu.mentionedPseudonyms).toEqual(["alice"]);
    expect(Buffer.isBuffer(fu.encryptedContent)).toBe(true);
    expect(fu.createdAt).toBeInstanceOf(Date);
  });

  it("create throws ForbiddenError for inaccessible ticket", async () => {
    const user = await createTestUser(testDb.db);

    await expect(
      svc.create(user.id, {
        ticketId: crypto.randomUUID(),
        encryptedContent: Buffer.from("c"),
        source: "volunteer",
        type: "note",
        isPrivate: false,
        mentionedPseudonyms: [],
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("create rejects adding follow-up to closed ticket", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Close the ticket directly
    await testDb.db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", ticketId)
      .execute();

    await expect(
      svc.create(userId, {
        ticketId,
        encryptedContent: Buffer.from("c"),
        source: "volunteer",
        type: "note",
        isPrivate: false,
        mentionedPseudonyms: [],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("listByTicket returns follow-ups in creation order with pagination", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Insert 3 follow-ups
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const fu = await svc.create(userId, {
        ticketId,
        encryptedContent: Buffer.from(`content-${String(i)}`),
        source: "volunteer",
        type: "note",
        isPrivate: false,
        mentionedPseudonyms: [],
      });
      ids.push(fu.id);
    }

    // First page
    const page1 = await svc.listByTicket(userId, ticketId, { limit: 2 });
    expect(page1).toHaveLength(2);

    // Second page using cursor
    const page2 = await svc.listByTicket(userId, ticketId, {
      limit: 2,
      cursor: page1[1]!.id,
    });
    expect(page2).toHaveLength(1);

    // All 3 IDs covered with no duplicates
    const allIds = [...page1.map((f) => f.id), ...page2.map((f) => f.id)];
    expect(new Set(allIds).size).toBe(3);
    expect(new Set(allIds)).toEqual(new Set(ids));
  });

  // --- updateInternalNote ---

  it("updateInternalNote succeeds for author of internal note", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("original-note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    const updated = await svc.updateInternalNote(
      userId,
      fu.id,
      Buffer.from("edited-note"),
    );

    expect(updated.id).toBe(fu.id);
    expect(updated.encryptedContent.toString()).toBe("edited-note");
  });

  it("updateInternalNote rejects non-author", async () => {
    const { userId, ticketId } = await createTicketFixture();
    const otherUser = await createTestUser(testDb.db);

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await expect(
      svc.updateInternalNote(otherUser.id, fu.id, Buffer.from("edited")),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("updateInternalNote rejects non-internal-note types", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("message"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    await expect(
      svc.updateInternalNote(userId, fu.id, Buffer.from("edited")),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("updateInternalNote rejects system-sourced internal notes", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("system-note"),
      source: "system",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await expect(
      svc.updateInternalNote(userId, fu.id, Buffer.from("edited")),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  // --- softDeleteInternalNote ---

  it("softDeleteInternalNote succeeds for author", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("note-to-delete"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await svc.softDeleteInternalNote(userId, fu.id, false);

    // Verify deleted_at is set
    const row = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("id", "=", fu.id)
      .executeTakeFirstOrThrow();

    expect(row.deleted_at).toBeInstanceOf(Date);
  });

  it("softDeleteInternalNote succeeds for admin on other author's note", async () => {
    const { userId, ticketId } = await createTicketFixture();
    const adminUser = await createTestUser(testDb.db);

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    // Admin can delete another user's note
    await svc.softDeleteInternalNote(adminUser.id, fu.id, true);

    const row = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("id", "=", fu.id)
      .executeTakeFirstOrThrow();

    expect(row.deleted_at).toBeInstanceOf(Date);
  });

  it("softDeleteInternalNote rejects non-author non-admin", async () => {
    const { userId, ticketId } = await createTicketFixture();
    const otherUser = await createTestUser(testDb.db);

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await expect(
      svc.softDeleteInternalNote(otherUser.id, fu.id, false),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("softDeleteInternalNote rejects non-internal-note types", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("msg"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    await expect(
      svc.softDeleteInternalNote(userId, fu.id, false),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  // --- listByTicket excludes soft-deleted ---

  it("listByTicket excludes soft-deleted follow-ups", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu1 = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("note-1"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("note-2"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    // Soft-delete the first note
    await svc.softDeleteInternalNote(userId, fu1.id, false);

    const list = await svc.listByTicket(userId, ticketId, { limit: 100 });
    const ids = list.map((f) => f.id);
    expect(ids).not.toContain(fu1.id);
  });

  // --- Access checks on edit/delete ---

  it("updateInternalNote rejects user without ticket access", async () => {
    const { userId, ticketId } = await createTicketFixture();
    const outsider = await createTestUser(testDb.db);

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await expect(
      svc.updateInternalNote(outsider.id, fu.id, Buffer.from("edited")),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("softDeleteInternalNote rejects user without ticket access", async () => {
    const { userId, ticketId } = await createTicketFixture();
    const outsider = await createTestUser(testDb.db);

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await expect(
      svc.softDeleteInternalNote(outsider.id, fu.id, false),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
