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
    const { userId, ticketId, queueId } = await createTicketFixture();
    const adminUser = await createTestUser(testDb.db);

    // Grant queue-level ticket access so assertAccess passes
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: adminUser.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

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

  // --- Types filter ---

  it("listByTicket with types filter returns only matching types", async () => {
    const { userId, ticketId } = await createTicketFixture();

    await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("msg-1"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });
    const note = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("note-1"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });
    await svc.create(userId, {
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
      ticketId,
      encryptedContent: Buffer.from("msg"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });
    await svc.create(userId, {
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
      ticketId,
      encryptedContent: Buffer.from("msg"),
      source: "volunteer",
      type: "message",
      isPrivate: false,
      mentionedPseudonyms: [],
    });
    const note = await svc.create(userId, {
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
      ticketId,
      encryptedContent: Buffer.from("note-1"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });
    const n2 = await svc.create(userId, {
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
      ticketId,
      encryptedContent: Buffer.from("visible-note"),
      source: "volunteer",
      type: "internal_note",
      isPrivate: true,
      mentionedPseudonyms: [],
    });
    await svc.create(otherUser.id, {
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
});
