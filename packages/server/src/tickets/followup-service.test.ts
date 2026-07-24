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

  async function createNoteTypeWithViewRole(
    db: TestDb["db"],
    minViewRole: string,
  ): Promise<string> {
    const row = await db
      .insertInto("note_types")
      .values({
        encrypted_name: Buffer.from("restricted-type"),
        encrypted_icon: Buffer.from("shield"),
        encrypted_escalation_targets: Buffer.from(JSON.stringify([])),
        min_view_role: minViewRole,
        min_create_role: minViewRole,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return row.id;
  }

  it("create inserts follow-up with encrypted_content", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("original-note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    const { record: updated } = await svc.updateInternalNote(
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
    const { userId, ticketId, queueId } = await createTicketFixture();
    const adminUser = await createTestUser(testDb.db);

    // Grant queue-level ticket access so assertAccess passes
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: adminUser.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("note-1"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await svc.create(userId, {
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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

  // --- Types filter ---

  it("listByTicket with types filter returns only matching types", async () => {
    const { userId, ticketId } = await createTicketFixture();

    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("msg-1"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });
    const note = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("note-1"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });
    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("status-1"),
      source: "system",
      type: "status_change",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    // Filter to notes only
    const notes = await svc.listByTicket(userId, ticketId, {
      limit: 50,
      types: ["internal_note"],
    });
    expect(notes).toHaveLength(1);
    expect(notes[0]!.id).toBe(note.id);

    // Filter to multiple types
    const mixed = await svc.listByTicket(userId, ticketId, {
      limit: 50,
      types: ["message", "status_change"],
    });
    expect(mixed).toHaveLength(2);
    expect(mixed.every((f) => f.type !== "internal_note")).toBe(true);

    // No filter returns all
    const all = await svc.listByTicket(userId, ticketId, { limit: 50 });
    expect(all).toHaveLength(3);
  });

  it("listSummary with limit caps results", async () => {
    const { userId, ticketId } = await createTicketFixture();

    for (let i = 0; i < 5; i++) {
      await svc.create(userId, {
        id: crypto.randomUUID(),
        ticketId,
        encryptedContent: Buffer.from(`msg-${String(i)}`),
        source: "volunteer",
        type: "message",
        isPrivate: false,
        mentionedPseudonyms: [],
      });
    }

    const page = await svc.listSummary(userId, ticketId, {
      limit: 3,
    });
    expect(page).toHaveLength(3);

    const all = await svc.listSummary(userId, ticketId, {
      limit: 100,
    });
    expect(all).toHaveLength(5);
  });

  it("listSummary with types filter returns only matching types", async () => {
    const { userId, ticketId } = await createTicketFixture();

    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("msg"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });
    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    const notes = await svc.listSummary(userId, ticketId, {
      limit: 100,
      types: ["internal_note"],
    });
    expect(notes).toHaveLength(1);
    expect(notes[0]!.type).toBe("internal_note");
  });

  it("listByIds with types filter only returns matching IDs", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const msg = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("msg"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });
    const note = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    // Request both IDs but filter to notes only
    const result = await svc.listByIds(userId, ticketId, [msg.id, note.id], {
      types: ["internal_note"],
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(note.id);
  });

  // --- Media flags (hasRecording, hasImage, hasFile) ---

  it("listByTicket returns hasRecording true when follow-up has a recording", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("msg-with-vm"),
      source: "client",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    // Insert a recording for this follow-up
    await testDb.db
      .insertInto("recordings")
      .values({
        ticket_id: ticketId,
        followup_id: fu.id,
        blob_key: "blob-vm-test",
        size_bytes: 1024,
        duration_seconds: 30,
      })
      .execute();

    const list = await svc.listByTicket(userId, ticketId, { limit: 50 });
    const found = list.find((f) => f.id === fu.id);
    expect(found).toBeDefined();
    expect(found!.hasRecording).toBe(true);
    expect(found!.hasImage).toBe(false);
    expect(found!.hasFile).toBe(false);
  });

  it("listByTicket returns hasImage true when follow-up has image attachment", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("msg-with-img"),
      source: "client",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    await testDb.db
      .insertInto("attachments")
      .values({
        ticket_id: ticketId,
        followup_id: fu.id,
        blob_key: "blob-img-test",
        size_bytes: 2048,
        content_type: "image/jpeg",
      })
      .execute();

    const list = await svc.listByTicket(userId, ticketId, { limit: 50 });
    const found = list.find((f) => f.id === fu.id);
    expect(found).toBeDefined();
    expect(found!.hasRecording).toBe(false);
    expect(found!.hasImage).toBe(true);
    expect(found!.hasFile).toBe(false);
  });

  it("listByTicket returns all flags false for text-only follow-ups", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("text-only"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    const list = await svc.listByTicket(userId, ticketId, { limit: 50 });
    const found = list.find((f) => f.id === fu.id);
    expect(found).toBeDefined();
    expect(found!.hasRecording).toBe(false);
    expect(found!.hasImage).toBe(false);
    expect(found!.hasFile).toBe(false);
  });

  it("listByIds also returns media flags", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("msg-ids"),
      source: "client",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    // Add a non-image attachment (file)
    await testDb.db
      .insertInto("attachments")
      .values({
        ticket_id: ticketId,
        followup_id: fu.id,
        blob_key: "blob-file-test",
        size_bytes: 4096,
        content_type: "application/pdf",
      })
      .execute();

    const result = await svc.listByIds(userId, ticketId, [fu.id]);
    expect(result).toHaveLength(1);
    expect(result[0]!.hasRecording).toBe(false);
    expect(result[0]!.hasImage).toBe(false);
    expect(result[0]!.hasFile).toBe(true);
  });

  it("create returns all media flags as false", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("new-msg"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    expect(fu.hasRecording).toBe(false);
    expect(fu.hasImage).toBe(false);
    expect(fu.hasFile).toBe(false);
  });

  it("create persists noteTypeId on internal notes", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const noteTypeId = crypto.randomUUID();
    await testDb.db
      .insertInto("note_types")
      .values({
        id: noteTypeId,
        encrypted_name: Buffer.from("name"),
        encrypted_icon: Buffer.from("icon"),
        encrypted_escalation_targets: Buffer.from("[]"),
        is_active: true,
        requires_on_close: false,
      })
      .execute();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("typed-note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
      noteTypeId,
    });

    expect(fu.noteTypeId).toBe(noteTypeId);
  });

  it("create without noteTypeId stores null", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("untyped-note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    expect(fu.noteTypeId).toBeNull();
  });

  it("updateInternalNote changes noteTypeId when provided", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const noteTypeA = crypto.randomUUID();
    const noteTypeB = crypto.randomUUID();
    await testDb.db
      .insertInto("note_types")
      .values([
        {
          id: noteTypeA,
          encrypted_name: Buffer.from("type-a"),
          encrypted_icon: Buffer.from("icon-a"),
          encrypted_escalation_targets: Buffer.from("[]"),
        },
        {
          id: noteTypeB,
          encrypted_name: Buffer.from("type-b"),
          encrypted_icon: Buffer.from("icon-b"),
          encrypted_escalation_targets: Buffer.from("[]"),
        },
      ])
      .execute();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("note-content"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
      noteTypeId: noteTypeA,
    });

    const { record: updated, previousNoteTypeId } =
      await svc.updateInternalNote(
        userId,
        fu.id,
        Buffer.from("updated-content"),
        noteTypeB,
      );

    expect(updated.noteTypeId).toBe(noteTypeB);
    expect(previousNoteTypeId).toBe(noteTypeA);
  });

  it("updateInternalNote preserves noteTypeId when not provided", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const noteTypeId = crypto.randomUUID();
    await testDb.db
      .insertInto("note_types")
      .values({
        id: noteTypeId,
        encrypted_name: Buffer.from("name"),
        encrypted_icon: Buffer.from("icon"),
        encrypted_escalation_targets: Buffer.from("[]"),
      })
      .execute();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("note-content"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
      noteTypeId,
    });

    const { record: updated } = await svc.updateInternalNote(
      userId,
      fu.id,
      Buffer.from("edited-content"),
    );

    expect(updated.noteTypeId).toBe(noteTypeId);
  });

  it("listSummary includes noteTypeId in results", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const noteTypeId = crypto.randomUUID();
    await testDb.db
      .insertInto("note_types")
      .values({
        id: noteTypeId,
        encrypted_name: Buffer.from("name"),
        encrypted_icon: Buffer.from("icon"),
        encrypted_escalation_targets: Buffer.from("[]"),
      })
      .execute();

    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("typed-note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
      noteTypeId,
    });

    const results = await svc.listSummary(userId, ticketId, { limit: 10 });
    const note = results.find((r) => r.type === "internal_note");
    expect(note).toBeDefined();
    expect(note!.noteTypeId).toBe(noteTypeId);
  });

  it("listSummary returns null noteTypeId for pre-feature notes", async () => {
    const { userId, ticketId } = await createTicketFixture();

    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("old-note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    const results = await svc.listSummary(userId, ticketId, { limit: 10 });
    const note = results.find((r) => r.type === "internal_note");
    expect(note).toBeDefined();
    expect(note!.noteTypeId).toBeNull();
  });

  // ── Reactions ──

  it("toggleReaction adds then removes a reaction", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const note = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("react-test"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    const added = await svc.toggleReaction(
      userId,
      "dXwG0zR9BtJp",
      note.id,
      "acknowledge",
    );
    expect(added).toHaveLength(1);
    expect(added[0]!.reaction).toBe("acknowledge");
    expect(added[0]!.userIds).toContain(userId);

    const removed = await svc.toggleReaction(
      userId,
      "dXwG0zR9BtJp",
      note.id,
      "acknowledge",
    );
    expect(removed).toHaveLength(0);
  });

  it("toggleReaction rejects non-internal_note followups", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const msg = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("just a message"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    await expect(
      svc.toggleReaction(userId, "dXwG0zR9BtJp", msg.id, "approve"),
    ).rejects.toThrow(ForbiddenError);
  });

  it("getReactions batch-loads reactions for multiple followups", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const n1 = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("note-1"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });
    const n2 = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("note-2"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await svc.toggleReaction(userId, "dXwG0zR9BtJp", n1.id, "flag");
    await svc.toggleReaction(userId, "dXwG0zR9BtJp", n2.id, "complete");

    const map = await svc.getReactions([n1.id, n2.id]);
    expect(map.get(n1.id)).toHaveLength(1);
    expect(map.get(n1.id)![0]!.reaction).toBe("flag");
    expect(map.get(n2.id)).toHaveLength(1);
    expect(map.get(n2.id)![0]!.reaction).toBe("complete");
  });

  it("getReactions returns empty map for empty input", async () => {
    const map = await svc.getReactions([]);
    expect(map.size).toBe(0);
  });

  // ── View gating ──

  it("listByTicket filters notes by min_view_role", async () => {
    const { userId, ticketId, queueId } = await createTicketFixture();

    // Second user creates the restricted note so the "own notes always
    // visible" bypass does not mask the role filter.
    const otherUser = await createTestUser(testDb.db);
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: otherUser.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

    const noteTypeId = await createNoteTypeWithViewRole(
      testDb.db,
      "POFKWG7erXEJ",
    );

    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("visible-note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });
    await svc.create(otherUser.id, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("restricted-note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
      noteTypeId,
    });

    const asVolunteer = await svc.listByTicket(userId, ticketId, {
      limit: 50,
      userRoleId: "dXwG0zR9BtJp",
    });
    const noteTexts = asVolunteer
      .filter((r) => r.type === "internal_note")
      .map((r) => r.encryptedContent.toString());

    expect(noteTexts).toContain("visible-note");
    expect(noteTexts).not.toContain("restricted-note");

    const asAdmin = await svc.listByTicket(userId, ticketId, {
      limit: 50,
      userRoleId: "POFKWG7erXEJ",
    });
    const adminNoteTexts = asAdmin
      .filter((r) => r.type === "internal_note")
      .map((r) => r.encryptedContent.toString());

    expect(adminNoteTexts).toContain("visible-note");
    expect(adminNoteTexts).toContain("restricted-note");
  });

  it("listByTicket always shows own notes regardless of role gating", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const noteTypeId = await createNoteTypeWithViewRole(
      testDb.db,
      "POFKWG7erXEJ",
    );

    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("my-restricted-note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
      noteTypeId,
    });

    const results = await svc.listByTicket(userId, ticketId, {
      limit: 50,
      userRoleId: "dXwG0zR9BtJp",
    });
    const noteTexts = results
      .filter((r) => r.type === "internal_note")
      .map((r) => r.encryptedContent.toString());

    expect(noteTexts).toContain("my-restricted-note");
  });

  // ── Key wrap on follow-ups with key_generation (tk_temp) ──

  it("listByTicket returns keyWrap for follow-ups with non-null key_generation", async () => {
    const { userId, ticketId } = await createTicketFixture();
    const keyGen = crypto.randomUUID();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("temp-msg"),
      source: "client",
      type: "sms_inbound",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    // Manually set key_generation and insert a key wrap
    await testDb.db
      .updateTable("followups")
      .set({ key_generation: keyGen })
      .where("id", "=", fu.id)
      .execute();

    const ep = crypto.randomBytes(32);
    const nonce = crypto.randomBytes(24);
    const wk = crypto.randomBytes(48);

    await testDb.db
      .insertInto("ticket_key_wraps")
      .values({
        ticket_id: ticketId,
        volunteer_id: userId,
        key_generation: keyGen,
        ephemeral_point: ep,
        nonce,
        wrapped_key: wk,
        algorithm: "ecies-ristretto255-v1",
      })
      .execute();

    const list = await svc.listByTicket(userId, ticketId, { limit: 50 });
    const found = list.find((f) => f.id === fu.id);

    expect(found).toBeDefined();
    expect(found!.keyGeneration).toBe(keyGen);
    expect(found!.keyWrap).not.toBeNull();
    expect(Buffer.isBuffer(found!.keyWrap!.ephemeralPoint)).toBe(true);
    expect(found!.keyWrap!.ephemeralPoint).toEqual(ep);
    expect(found!.keyWrap!.nonce).toEqual(nonce);
    expect(found!.keyWrap!.wrappedKey).toEqual(wk);
  });

  it("listByTicket returns keyWrap: null for canonicalized follow-ups", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("canonical-msg"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    const list = await svc.listByTicket(userId, ticketId, { limit: 50 });
    const found = list.find((f) => f.id === fu.id);

    expect(found).toBeDefined();
    expect(found!.keyGeneration).toBeNull();
    expect(found!.keyWrap).toBeNull();
  });

  it("listByTicket scopes key wraps to the requesting user", async () => {
    const { userId, ticketId, queueId } = await createTicketFixture();
    const otherUser = await createTestUser(testDb.db);

    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: otherUser.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

    const keyGen = crypto.randomUUID();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("temp-msg"),
      source: "client",
      type: "sms_inbound",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    await testDb.db
      .updateTable("followups")
      .set({ key_generation: keyGen })
      .where("id", "=", fu.id)
      .execute();

    // Insert wrap only for userId, not otherUser
    await testDb.db
      .insertInto("ticket_key_wraps")
      .values({
        ticket_id: ticketId,
        volunteer_id: userId,
        key_generation: keyGen,
        ephemeral_point: crypto.randomBytes(32),
        nonce: crypto.randomBytes(24),
        wrapped_key: crypto.randomBytes(48),
        algorithm: "ecies-ristretto255-v1",
      })
      .execute();

    // otherUser should not see the wrap
    const otherList = await svc.listByTicket(otherUser.id, ticketId, {
      limit: 50,
    });
    const otherFound = otherList.find((f) => f.id === fu.id);
    expect(otherFound).toBeDefined();
    expect(otherFound!.keyWrap).toBeNull();
  });

  // ── Call metadata fields ──

  it("create persists call metadata fields", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("call-record"),
      source: "system",
      type: "phone_call",
      isPrivate: false,
      mentionedPseudonyms: [],
      callSid: "CA_test_001",
      callStatus: "completed",
      callDurationSeconds: 120,
    });

    expect(fu.callSid).toBe("CA_test_001");
    expect(fu.callStatus).toBe("completed");
    expect(fu.callDurationSeconds).toBe(120);
  });

  it("listByTicket returns call metadata on phone_call follow-ups", async () => {
    const { userId, ticketId } = await createTicketFixture();

    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("call-data"),
      source: "system",
      type: "phone_call",
      isPrivate: false,
      mentionedPseudonyms: [],
      callSid: "CA_list_002",
      callStatus: "no_answer",
      callDurationSeconds: 0,
    });

    const list = await svc.listByTicket(userId, ticketId, { limit: 50 });
    const call = list.find((f) => f.type === "phone_call");
    expect(call).toBeDefined();
    expect(call!.callStatus).toBe("no_answer");
    expect(call!.callDurationSeconds).toBe(0);
  });

  it("create defaults call metadata to null when not provided", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("plain-msg"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    expect(fu.callSid).toBeNull();
    expect(fu.callStatus).toBeNull();
    expect(fu.callDurationSeconds).toBeNull();
  });

  // ── Cursor direction ──

  it("listByTicket with direction=older returns results in ascending order", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      const fu = await svc.create(userId, {
        id: crypto.randomUUID(),
        ticketId,
        encryptedContent: Buffer.from(`older-dir-${String(i)}`),
        source: "volunteer",
        type: "message",
        isPrivate: false,
        mentionedPseudonyms: [],
      });
      ids.push(fu.id);
    }

    // Get the last follow-up as our cursor anchor
    const all = await svc.listByTicket(userId, ticketId, { limit: 100 });
    const last = all[all.length - 1]!;

    // Direction "older" pages backward from the cursor
    const older = await svc.listByTicket(userId, ticketId, {
      limit: 3,
      cursor: last.id,
      direction: "older",
    });
    // Results should be returned in ascending order (reversed internally)
    for (let i = 0; i < older.length - 1; i++) {
      expect(older[i]!.createdAt.getTime()).toBeLessThanOrEqual(
        older[i + 1]!.createdAt.getTime(),
      );
    }
    // None of the "older" results should include the cursor item itself
    expect(older.map((f) => f.id)).not.toContain(last.id);
  });

  it("listByTicket with direction=newer pages forward from cursor", async () => {
    const { userId, ticketId } = await createTicketFixture();

    for (let i = 0; i < 5; i++) {
      await svc.create(userId, {
        id: crypto.randomUUID(),
        ticketId,
        encryptedContent: Buffer.from(`newer-dir-${String(i)}`),
        source: "volunteer",
        type: "message",
        isPrivate: false,
        mentionedPseudonyms: [],
      });
    }

    const all = await svc.listByTicket(userId, ticketId, { limit: 100 });
    const first = all[0]!;

    // Direction "newer" pages forward from the cursor
    const newer = await svc.listByTicket(userId, ticketId, {
      limit: 3,
      cursor: first.id,
      direction: "newer",
    });
    // All results should be newer than the cursor
    for (const fu of newer) {
      expect(fu.createdAt.getTime()).toBeGreaterThanOrEqual(
        first.createdAt.getTime(),
      );
    }
    expect(newer.map((f) => f.id)).not.toContain(first.id);
  });

  // ── Date range filters ──

  it("listByTicket filters by dateFrom and dateTo", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Create follow-ups
    for (let i = 0; i < 3; i++) {
      await svc.create(userId, {
        id: crypto.randomUUID(),
        ticketId,
        encryptedContent: Buffer.from(`date-filter-${String(i)}`),
        source: "volunteer",
        type: "message",
        isPrivate: false,
        mentionedPseudonyms: [],
      });
    }

    // Future date range should return nothing
    const futureDate = new Date(Date.now() + 86_400_000).toISOString();
    const farFuture = new Date(Date.now() + 172_800_000).toISOString();
    const empty = await svc.listByTicket(userId, ticketId, {
      limit: 100,
      dateFrom: futureDate,
      dateTo: farFuture,
    });
    expect(empty).toHaveLength(0);

    // Past to now range should return all
    const pastDate = new Date(Date.now() - 86_400_000)
      .toISOString()
      .split("T")[0]!;
    const today = new Date().toISOString().split("T")[0]!;
    const withRange = await svc.listByTicket(userId, ticketId, {
      limit: 100,
      dateFrom: pastDate,
      dateTo: today,
    });
    expect(withRange.length).toBeGreaterThanOrEqual(3);
  });

  // ── Media flag filters ──

  it("listByTicket with mediaFlags=recording returns only follow-ups with recordings", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const withRec = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("has-recording"),
      source: "client",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });
    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("no-recording"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    await testDb.db
      .insertInto("recordings")
      .values({
        ticket_id: ticketId,
        followup_id: withRec.id,
        blob_key: "blob-rec-filter-test",
        size_bytes: 1024,
        duration_seconds: 15,
      })
      .execute();

    const filtered = await svc.listByTicket(userId, ticketId, {
      limit: 100,
      mediaFlags: ["recording"],
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe(withRec.id);
  });

  it("listByTicket with mediaFlags=file returns follow-ups with non-image attachments", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const withFile = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("has-file"),
      source: "client",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    await testDb.db
      .insertInto("attachments")
      .values({
        ticket_id: ticketId,
        followup_id: withFile.id,
        blob_key: "blob-file-filter-test",
        size_bytes: 2048,
        content_type: "application/pdf",
      })
      .execute();

    const filtered = await svc.listByTicket(userId, ticketId, {
      limit: 100,
      mediaFlags: ["file"],
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe(withFile.id);
  });

  it("listByTicket with mediaFlags=image returns follow-ups with image attachments", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const withImg = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("has-image-att"),
      source: "client",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    await testDb.db
      .insertInto("attachments")
      .values({
        ticket_id: ticketId,
        followup_id: withImg.id,
        blob_key: "blob-img-filter-test",
        size_bytes: 4096,
        content_type: "image/png",
      })
      .execute();

    const filtered = await svc.listByTicket(userId, ticketId, {
      limit: 100,
      mediaFlags: ["image"],
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe(withImg.id);
  });

  // ── createdBy + includeClientSource filter ──

  it("listByTicket filters by createdBy and includeClientSource", async () => {
    const { userId, ticketId, queueId } = await createTicketFixture();
    const otherUser = await createTestUser(testDb.db);

    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: otherUser.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("by-user1"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });
    await svc.create(otherUser.id, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("by-user2"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });
    // Client-sourced follow-up (no created_by)
    await testDb.db
      .insertInto("followups")
      .values({
        ticket_id: ticketId,
        source: "client",
        type: "message",
        encrypted_content: Buffer.from("from-client"),
      })
      .execute();

    // Filter to userId only
    const byUser = await svc.listByTicket(userId, ticketId, {
      limit: 100,
      createdBy: [userId],
    });
    expect(byUser.every((f) => f.createdBy === userId)).toBe(true);

    // includeClientSource brings in client-sourced follow-ups
    const withClient = await svc.listByTicket(userId, ticketId, {
      limit: 100,
      createdBy: [userId],
      includeClientSource: true,
    });
    const sources = withClient.map((f) => f.source);
    expect(sources).toContain("client");
    expect(sources).toContain("volunteer");
  });

  // ── listSummary cursor + direction ──

  it("listSummary with direction=older pages backward from cursor", async () => {
    const { userId, ticketId } = await createTicketFixture();

    for (let i = 0; i < 5; i++) {
      await svc.create(userId, {
        id: crypto.randomUUID(),
        ticketId,
        encryptedContent: Buffer.from(`summary-older-${String(i)}`),
        source: "volunteer",
        type: "message",
        isPrivate: false,
        mentionedPseudonyms: [],
      });
    }

    const all = await svc.listSummary(userId, ticketId, { limit: 100 });
    const last = all[all.length - 1]!;

    const older = await svc.listSummary(userId, ticketId, {
      limit: 3,
      cursor: last.id,
      direction: "older",
    });

    // Results should be in ascending order (reversed internally)
    for (let i = 0; i < older.length - 1; i++) {
      expect(older[i]!.createdAt.getTime()).toBeLessThanOrEqual(
        older[i + 1]!.createdAt.getTime(),
      );
    }
    expect(older.map((s) => s.id)).not.toContain(last.id);
  });

  // ── listSummary media flags from batch queries ──

  it("listSummary returns correct recording duration and media flags", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("summary-rec"),
      source: "client",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    // Insert two recordings with different durations
    await testDb.db
      .insertInto("recordings")
      .values([
        {
          ticket_id: ticketId,
          followup_id: fu.id,
          blob_key: "blob-rec-1",
          size_bytes: 1024,
          duration_seconds: 15,
        },
        {
          ticket_id: ticketId,
          followup_id: fu.id,
          blob_key: "blob-rec-2",
          size_bytes: 2048,
          duration_seconds: 45,
        },
      ])
      .execute();

    const summaries = await svc.listSummary(userId, ticketId, { limit: 100 });
    const found = summaries.find((s) => s.id === fu.id);
    expect(found).toBeDefined();
    expect(found!.hasRecording).toBe(true);
    expect(found!.recordingDurationSeconds).toBe(45); // max of 15 and 45
  });

  it("listSummary distinguishes image vs file attachments", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fuImg = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("has-img"),
      source: "client",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    const fuFile = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("has-file"),
      source: "client",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    await testDb.db
      .insertInto("attachments")
      .values([
        {
          ticket_id: ticketId,
          followup_id: fuImg.id,
          blob_key: "blob-img-summary",
          size_bytes: 4096,
          content_type: "image/jpeg",
        },
        {
          ticket_id: ticketId,
          followup_id: fuFile.id,
          blob_key: "blob-file-summary",
          size_bytes: 8192,
          content_type: "application/pdf",
        },
      ])
      .execute();

    const summaries = await svc.listSummary(userId, ticketId, { limit: 100 });
    const imgSummary = summaries.find((s) => s.id === fuImg.id);
    const fileSummary = summaries.find((s) => s.id === fuFile.id);

    expect(imgSummary!.hasImage).toBe(true);
    expect(imgSummary!.hasFile).toBe(false);
    expect(fileSummary!.hasImage).toBe(false);
    expect(fileSummary!.hasFile).toBe(true);
  });

  it("listSummary omits encryptedContent for plain messages", async () => {
    const { userId, ticketId } = await createTicketFixture();

    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("system-content"),
      source: "system",
      type: "status_change",
      isPrivate: false,
      mentionedPseudonyms: [],
    });
    await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("plain-msg"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    const summaries = await svc.listSummary(userId, ticketId, { limit: 100 });
    const system = summaries.find((s) => s.type === "status_change");
    const plain = summaries.find((s) => s.type === "message");

    // System events keep their content; plain messages do not
    expect(system!.encryptedContent).not.toBeNull();
    expect(plain!.encryptedContent).toBeNull();
  });

  // ── listByTicket with active filters includes position/count ──

  it("listByTicket with active filters includes fullPosition and totalCount", async () => {
    const { userId, ticketId } = await createTicketFixture();

    for (let i = 0; i < 4; i++) {
      await svc.create(userId, {
        id: crypto.randomUUID(),
        ticketId,
        encryptedContent: Buffer.from(`pos-${String(i)}`),
        source: "volunteer",
        type: i < 2 ? "message" : "internal_note",
        isPrivate: i >= 2,
        mentionedPseudonyms: [],
      });
    }

    // Filter to messages only (active filter triggers position computation)
    const messages = await svc.listByTicket(userId, ticketId, {
      limit: 100,
      types: ["message"],
    });
    expect(messages).toHaveLength(2);
    // fullPosition and totalCount should be defined
    for (const fu of messages) {
      expect(fu.fullPosition).toBeDefined();
      expect(fu.totalCount).toBeDefined();
      expect(typeof fu.totalCount).toBe("number");
    }
  });

  // ── listSummary with active filters includes position/count ──

  it("listSummary with active filters includes fullPosition and totalCount", async () => {
    const { userId, ticketId } = await createTicketFixture();

    for (let i = 0; i < 3; i++) {
      await svc.create(userId, {
        id: crypto.randomUUID(),
        ticketId,
        encryptedContent: Buffer.from(`sum-pos-${String(i)}`),
        source: "volunteer",
        type: "message",
        isPrivate: false,
        mentionedPseudonyms: [],
      });
    }

    const filtered = await svc.listSummary(userId, ticketId, {
      limit: 100,
      types: ["message"],
    });
    expect(filtered.length).toBeGreaterThanOrEqual(3);
    for (const s of filtered) {
      expect(s.fullPosition).toBeDefined();
      expect(s.totalCount).toBeDefined();
    }
  });

  // ── listByIds empty ──

  it("listByIds returns empty array for empty followUpIds", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const result = await svc.listByIds(userId, ticketId, []);
    expect(result).toEqual([]);
  });

  // ── toggleReaction role gating ──

  it("toggleReaction rejects user below min_view_role for restricted notes", async () => {
    const { userId, ticketId, queueId } = await createTicketFixture();

    // Create a restricted note type requiring admin
    const noteTypeId = await createNoteTypeWithViewRole(
      testDb.db,
      "POFKWG7erXEJ", // Admin
    );

    // Use a different user as the note author so the "own note" bypass does not mask
    const otherUser = await createTestUser(testDb.db);
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: otherUser.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

    const note = await svc.create(otherUser.id, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("restricted-react-test"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
      noteTypeId,
    });

    // Volunteer (below admin) should be rejected
    await expect(
      svc.toggleReaction(userId, "dXwG0zR9BtJp", note.id, "acknowledge"),
    ).rejects.toThrow(ForbiddenError);
  });

  // ── updateInternalNote on deleted follow-up ──

  it("updateInternalNote rejects deleted follow-up", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("delete-then-update"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await svc.softDeleteInternalNote(userId, fu.id, false);

    await expect(
      svc.updateInternalNote(userId, fu.id, Buffer.from("edited")),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  // ── softDeleteInternalNote on already-deleted follow-up ──

  it("softDeleteInternalNote rejects already-deleted follow-up", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("double-delete"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await svc.softDeleteInternalNote(userId, fu.id, false);
    // Second delete should throw NotFoundError
    await expect(
      svc.softDeleteInternalNote(userId, fu.id, false),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  // ── toggleReaction on deleted follow-up ──

  it("toggleReaction rejects deleted follow-up", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const note = await svc.create(userId, {
      id: crypto.randomUUID(),
      ticketId,
      encryptedContent: Buffer.from("react-delete-test"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });

    await svc.softDeleteInternalNote(userId, note.id, false);

    await expect(
      svc.toggleReaction(userId, "dXwG0zR9BtJp", note.id, "acknowledge"),
    ).rejects.toThrow(NotFoundError);
  });

  // ── toggleReaction on non-existent follow-up ──

  it("toggleReaction rejects non-existent follow-up", async () => {
    const { userId } = await createTicketFixture();

    await expect(
      svc.toggleReaction(
        userId,
        "dXwG0zR9BtJp",
        crypto.randomUUID(),
        "acknowledge",
      ),
    ).rejects.toThrow(NotFoundError);
  });

  // ── updateInternalNote non-existent follow-up ──

  it("updateInternalNote rejects non-existent follow-up", async () => {
    const { userId } = await createTicketFixture();

    await expect(
      svc.updateInternalNote(userId, crypto.randomUUID(), Buffer.from("x")),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  // ── softDeleteInternalNote non-existent follow-up ──

  it("softDeleteInternalNote rejects non-existent follow-up", async () => {
    const { userId } = await createTicketFixture();

    await expect(
      svc.softDeleteInternalNote(userId, crypto.randomUUID(), false),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
