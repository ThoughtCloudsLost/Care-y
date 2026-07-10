import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  createTestClientFixture,
  type TestDb,
} from "../test-utils.js";
import {
  createTicketService,
  type TicketService,
  type CreateTicketKeyWrap,
} from "./ticket-service.js";
import {
  createTicketAccessChecker,
  type TicketAccessChecker,
} from "./access.js";
import { createQueuePermissionsService } from "./queue-permissions.js";
import { createDependencyService } from "./dependency-service.js";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  TicketError,
  MergeError,
} from "../errors.js";
import * as crypto from "node:crypto";
import { encode, getSodium } from "@care-y/crypto";

describe.skipIf(!process.env.DATABASE_URL)("TicketService (DB)", () => {
  let testDb: TestDb;
  let access: TicketAccessChecker;
  let svc: TicketService;

  beforeAll(async () => {
    await getSodium();
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    access = createTicketAccessChecker(testDb.db);
    const qps = createQueuePermissionsService(testDb.db);
    svc = createTicketService(testDb.db, access, (userId) =>
      qps.getUserQueues(userId),
    );
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

  function fakeKeyWrap(): CreateTicketKeyWrap {
    return {
      ephemeralPoint: Buffer.from("fake-ephemeral-point"),
      nonce: Buffer.from("fake-nonce"),
      wrappedKey: Buffer.from("fake-wrapped-key"),
    };
  }

  async function createClientFixture() {
    const fix = await createTestClientFixture(testDb.db);
    return { userId: fix.userId, clientId: fix.clientId, queueId: fix.queueId };
  }

  it("create inserts a ticket with correct defaults", async () => {
    const { userId, clientId, queueId } = await createClientFixture();
    const keyGen = crypto.randomUUID();

    const ticket = await svc.create(userId, {
      id: crypto.randomUUID(),
      clientId,
      queueId,
      encryptedTitle: Buffer.from("title"),
      encryptedDescription: Buffer.from("desc"),
      priority: "normal",
      keyGeneration: keyGen,
      keyWrap: fakeKeyWrap(),
    });

    expect(ticket.status).toBe("open");
    expect(ticket.priority).toBe("normal");
    expect(ticket.onHold).toBe(false);
    expect(ticket.assignedTo).toBeNull();
    expect(ticket.clientId).toBe(clientId);
    expect(ticket.queueId).toBe(queueId);
    expect(ticket.keyGeneration).toBe(keyGen);
    expect(ticket.id).toBeTruthy();
    expect(ticket.createdAt).toBeInstanceOf(Date);
  });

  it("create rejects if queue does not exist", async () => {
    const { userId, clientId } = await createClientFixture();

    await expect(
      svc.create(userId, {
        id: crypto.randomUUID(),
        clientId,
        queueId: crypto.randomUUID(),
        encryptedTitle: Buffer.from("t"),
        encryptedDescription: Buffer.from("d"),
        priority: "normal",
        keyGeneration: crypto.randomUUID(),
        keyWrap: fakeKeyWrap(),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("create rejects if client is merged", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    // Create another client to serve as the merge target
    const mergePrimary = await createTestTicketFixture(testDb.db);

    // Mark client as merged
    await testDb.db
      .updateTable("clients")
      .set({ merged_into: mergePrimary.clientId })
      .where("id", "=", clientId)
      .execute();

    await expect(
      svc.create(userId, {
        id: crypto.randomUUID(),
        clientId,
        queueId,
        encryptedTitle: Buffer.from("t"),
        encryptedDescription: Buffer.from("d"),
        priority: "normal",
        keyGeneration: crypto.randomUUID(),
        keyWrap: fakeKeyWrap(),
      }),
    ).rejects.toBeInstanceOf(MergeError);
  });

  it("create with existing closed ticket reopens it", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    // Create and close a ticket
    const first = await svc.create(userId, {
      id: crypto.randomUUID(),
      clientId,
      queueId,
      encryptedTitle: Buffer.from("old-title"),
      encryptedDescription: Buffer.from("old-desc"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });
    await testDb.db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", first.id)
      .execute();

    // Create again for the same client. The reopen path requires the
    // existing ticket's id, which the client learns via getCreateTarget
    // before encrypting (ADR-053).
    const newKeyGen = crypto.randomUUID();
    const reopened = await svc.create(userId, {
      id: first.id,
      clientId,
      queueId,
      encryptedTitle: Buffer.from("new-title"),
      encryptedDescription: Buffer.from("new-desc"),
      priority: "high",
      keyGeneration: newKeyGen,
      keyWrap: fakeKeyWrap(),
    });

    expect(reopened.id).toBe(first.id);
    expect(reopened.status).toBe("open");
    expect(reopened.keyGeneration).toBe(newKeyGen);
    expect(reopened.priority).toBe("high");
  });

  it("create against a stale reopen target throws ConflictError", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    const first = await svc.create(userId, {
      id: crypto.randomUUID(),
      clientId,
      queueId,
      encryptedTitle: Buffer.from("t"),
      encryptedDescription: Buffer.from("d"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });
    await testDb.db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", first.id)
      .execute();

    // A minted id that does not match the closed ticket means the client
    // encrypted against the wrong target; the create must fail closed.
    await expect(
      svc.create(userId, {
        id: crypto.randomUUID(),
        clientId,
        queueId,
        encryptedTitle: Buffer.from("t2"),
        encryptedDescription: Buffer.from("d2"),
        priority: "normal",
        keyGeneration: crypto.randomUUID(),
        keyWrap: fakeKeyWrap(),
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("getCreateTarget reports open, reopen, and fresh targets", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    expect(await svc.getCreateTarget(clientId)).toEqual({
      openTicketId: null,
      reopenTicketId: null,
    });

    const ticket = await svc.create(userId, {
      id: crypto.randomUUID(),
      clientId,
      queueId,
      encryptedTitle: Buffer.from("t"),
      encryptedDescription: Buffer.from("d"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });

    expect(await svc.getCreateTarget(clientId)).toEqual({
      openTicketId: ticket.id,
      reopenTicketId: null,
    });

    await testDb.db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", ticket.id)
      .execute();

    expect(await svc.getCreateTarget(clientId)).toEqual({
      openTicketId: null,
      reopenTicketId: ticket.id,
    });
  });

  it("create stores the client-minted id on fresh tickets", async () => {
    const { userId, clientId, queueId } = await createClientFixture();
    const mintedId = crypto.randomUUID();

    const ticket = await svc.create(userId, {
      id: mintedId,
      clientId,
      queueId,
      encryptedTitle: Buffer.from("t"),
      encryptedDescription: Buffer.from("d"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });

    expect(ticket.id).toBe(mintedId);
  });

  it("create with existing open ticket throws ConflictError", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    await svc.create(userId, {
      id: crypto.randomUUID(),
      clientId,
      queueId,
      encryptedTitle: Buffer.from("title"),
      encryptedDescription: Buffer.from("desc"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });

    await expect(
      svc.create(userId, {
        id: crypto.randomUUID(),
        clientId,
        queueId,
        encryptedTitle: Buffer.from("other-title"),
        encryptedDescription: Buffer.from("other-desc"),
        priority: "high",
        keyGeneration: crypto.randomUUID(),
        keyWrap: fakeKeyWrap(),
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("create inserts a key wrap row in ticket_key_wraps", async () => {
    const { userId, clientId, queueId } = await createClientFixture();
    const keyGen = crypto.randomUUID();
    const kw = fakeKeyWrap();

    const ticket = await svc.create(userId, {
      id: crypto.randomUUID(),
      clientId,
      queueId,
      encryptedTitle: Buffer.from("title"),
      encryptedDescription: Buffer.from("desc"),
      priority: "normal",
      keyGeneration: keyGen,
      keyWrap: kw,
    });

    const wrapRow = await testDb.db
      .selectFrom("ticket_key_wraps")
      .selectAll()
      .where("ticket_id", "=", ticket.id)
      .where("volunteer_id", "=", userId)
      .executeTakeFirst();

    expect(wrapRow).toBeDefined();
    expect(wrapRow!.key_generation).toBe(keyGen);
    expect(wrapRow!.algorithm).toBe("ecies-ristretto255-v1");
    expect(Buffer.from(wrapRow!.ephemeral_point).toString()).toBe(
      kw.ephemeralPoint.toString(),
    );
  });

  it("create inserts key wrap for reopened tickets", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    const first = await svc.create(userId, {
      id: crypto.randomUUID(),
      clientId,
      queueId,
      encryptedTitle: Buffer.from("t"),
      encryptedDescription: Buffer.from("d"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });

    await testDb.db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", first.id)
      .execute();

    const newKeyGen = crypto.randomUUID();
    const newKw = fakeKeyWrap();
    await svc.create(userId, {
      id: first.id,
      clientId,
      queueId,
      encryptedTitle: Buffer.from("new-t"),
      encryptedDescription: Buffer.from("new-d"),
      priority: "normal",
      keyGeneration: newKeyGen,
      keyWrap: newKw,
    });

    const wrapRow = await testDb.db
      .selectFrom("ticket_key_wraps")
      .selectAll()
      .where("ticket_id", "=", first.id)
      .where("key_generation", "=", newKeyGen)
      .executeTakeFirst();

    expect(wrapRow).toBeDefined();
    expect(wrapRow!.volunteer_id).toBe(userId);
  });

  it("findById returns ticket with all fields mapped to camelCase", async () => {
    const { userId, ticketId, clientId, queueId } = await createTicketFixture();

    const ticket = await svc.findById(ticketId, userId);

    expect(ticket.id).toBe(ticketId);
    expect(ticket.clientId).toBe(clientId);
    expect(ticket.queueId).toBe(queueId);
    expect(ticket.status).toBe("open");
    expect(ticket.priority).toBe("normal");
    expect(ticket.onHold).toBe(false);
    expect(ticket.assignedTo).toBeNull();
    expect(Buffer.isBuffer(ticket.encryptedTitle)).toBe(true);
    expect(Buffer.isBuffer(ticket.encryptedDescription)).toBe(true);
    expect(ticket.keyGeneration).toBeTruthy();
    expect(ticket.createdAt).toBeInstanceOf(Date);
  });

  it("findById throws ForbiddenError for non-existent ticket", async () => {
    const user = await createTestUser(testDb.db);

    await expect(
      svc.findById(crypto.randomUUID(), user.id),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("list returns tickets with keyset pagination", async () => {
    // Create a user and 3 tickets in the same queue
    const queue = await createTestQueue(testDb.db, {
      label: "Paginate-Q-" + crypto.randomUUID().slice(0, 8),
    });
    const user = await createTestUser(testDb.db);
    // Give the user queue access so list() returns results
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queue.id, user_id: user.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

    const ticketIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const fix = await createTestTicketFixture(testDb.db, {
        queueId: queue.id,
      });
      ticketIds.push(fix.ticketId);
    }

    // First page: limit 2
    const page1 = await svc.list(user.id, { queueIds: [queue.id], limit: 2 });
    expect(page1).toHaveLength(2);

    // Second page: cursor from last item of page1
    const page2 = await svc.list(user.id, {
      queueIds: [queue.id],
      limit: 2,
      cursor: page1[1]!.id,
    });
    expect(page2).toHaveLength(1);

    // All 3 IDs covered with no duplicates
    const allIds = [...page1.map((t) => t.id), ...page2.map((t) => t.id)];
    expect(new Set(allIds).size).toBe(3);
    expect(new Set(allIds)).toEqual(new Set(ticketIds));
  });

  it("list filters by queueIds and statuses arrays", async () => {
    const { userId, queueId, ticketId } = await createTicketFixture();

    // Open tickets in this queue (array-based)
    const openInQueue = await svc.list(userId, {
      queueIds: [queueId],
      statuses: ["open"],
      limit: 100,
    });
    expect(openInQueue.some((t) => t.id === ticketId)).toBe(true);

    // Closed tickets in this queue (should not contain our open ticket)
    const closedInQueue = await svc.list(userId, {
      queueIds: [queueId],
      statuses: ["closed"],
      limit: 100,
    });
    expect(closedInQueue.some((t) => t.id === ticketId)).toBe(false);
  });

  it("list returns empty for user with no queue access", async () => {
    const { queueId } = await createTicketFixture();
    // Create a user who is NOT assigned to any queue
    const outsider = await createTestUser(testDb.db);

    const result = await svc.list(outsider.id, {
      queueIds: [queueId],
      limit: 100,
    });
    expect(result).toHaveLength(0);
  });

  it("close sets status to closed and creates system follow-up", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const closed = await svc.close(userId, ticketId);
    expect(closed.status).toBe("closed");

    // Verify system follow-up was created
    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "status_change")
      .execute();
    expect(followups.length).toBeGreaterThanOrEqual(1);
  });

  it("close throws TicketError when unresolved dependencies exist", async () => {
    const fixture1 = await createTicketFixture();
    const fixture2 = await createTicketFixture();

    // Add an unresolved dependency (fixture2's ticket is still open)
    const depService = createDependencyService(testDb.db);
    await depService.add(fixture1.userId, fixture1.ticketId, fixture2.ticketId);

    await expect(
      svc.close(fixture1.userId, fixture1.ticketId),
    ).rejects.toBeInstanceOf(TicketError);
  });

  it("reopen sets status to open and updates key_generation", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Close first
    await svc.close(userId, ticketId);

    const newKeyGen = crypto.randomUUID();
    const reopened = await svc.reopen(userId, ticketId, newKeyGen);

    expect(reopened.status).toBe("open");
    expect(reopened.keyGeneration).toBe(newKeyGen);
  });

  it("update with onHold: true sets on_hold and creates system follow-up", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const updated = await svc.update(userId, {
      ticketId,
      onHold: true,
    });

    expect(updated.onHold).toBe(true);

    // Verify hold_change system follow-up
    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "hold_change")
      .execute();
    expect(followups.length).toBeGreaterThanOrEqual(1);
  });

  // --- Key wrap read path ---

  async function insertKeyWrap(
    ticketId: string,
    volunteerId: string,
    keyGeneration: string,
  ): Promise<{ ephemeralPoint: Buffer; nonce: Buffer; wrappedKey: Buffer }> {
    const ephemeralPoint = crypto.randomBytes(32);
    const nonce = crypto.randomBytes(24);
    const wrappedKey = crypto.randomBytes(48);

    // care-y-ignore-next-line no-plaintext-db-write -- test key wrap data, not real cryptographic material
    await testDb.db
      .insertInto("ticket_key_wraps")
      .values({
        ticket_id: ticketId,
        volunteer_id: volunteerId,
        key_generation: keyGeneration,
        ephemeral_point: ephemeralPoint,
        nonce,
        wrapped_key: wrappedKey,
        algorithm: "ecies-ristretto255-v1",
      })
      .execute();

    return { ephemeralPoint, nonce, wrappedKey };
  }

  it("list returns keyWrap: null for tickets without a wrap row", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const results = await svc.list(userId, { limit: 100 });
    const ticket = results.find((t) => t.id === ticketId);

    expect(ticket).toBeDefined();
    expect(ticket!.keyWrap).toBeNull();
  });

  it("list returns populated keyWrap with correct base64 values", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Look up the ticket's key_generation for the wrap
    const ticketRow = await testDb.db
      .selectFrom("tickets")
      .select("key_generation")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();

    const buffers = await insertKeyWrap(
      ticketId,
      userId!,
      ticketRow.key_generation,
    );

    const results = await svc.list(userId!, { limit: 100 });
    const ticket = results.find((t) => t.id === ticketId);

    expect(ticket).toBeDefined();
    expect(ticket!.keyWrap).not.toBeNull();
    // Key wraps must use URL-safe base64 (no padding) to match @care-y/crypto's
    // decode(). Standard base64 (+/=) breaks the crypto Worker's decryption.
    expect(ticket!.keyWrap!.ephemeralPoint).toBe(
      encode(new Uint8Array(buffers.ephemeralPoint)),
    );
    expect(ticket!.keyWrap!.nonce).toBe(encode(new Uint8Array(buffers.nonce)));
    expect(ticket!.keyWrap!.wrappedKey).toBe(
      encode(new Uint8Array(buffers.wrappedKey)),
    );
    // Regression guard: must never contain standard base64 characters
    expect(ticket!.keyWrap!.ephemeralPoint).not.toMatch(/[+/=]/);
    expect(ticket!.keyWrap!.nonce).not.toMatch(/[+/=]/);
    expect(ticket!.keyWrap!.wrappedKey).not.toMatch(/[+/=]/);
  });

  it("list does NOT return key wraps belonging to other volunteers", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Look up key_generation
    const ticketRow = await testDb.db
      .selectFrom("tickets")
      .select("key_generation")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();

    // Insert wrap for a different volunteer
    const otherUser = await createTestUser(testDb.db);
    await insertKeyWrap(ticketId, otherUser.id, ticketRow.key_generation);

    // The requesting user should see keyWrap: null (wrap belongs to otherUser)
    const results = await svc.list(userId!, { limit: 100 });
    const ticket = results.find((t) => t.id === ticketId);

    expect(ticket).toBeDefined();
    expect(ticket!.keyWrap).toBeNull();
  });

  it("findById returns key wrap scoped to the requesting user", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Look up key_generation
    const ticketRow = await testDb.db
      .selectFrom("tickets")
      .select("key_generation")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();

    const buffers = await insertKeyWrap(
      ticketId,
      userId!,
      ticketRow.key_generation,
    );

    const ticket = await svc.findById(ticketId, userId!);

    expect(ticket.keyWrap).not.toBeNull();
    expect(ticket.keyWrap!.ephemeralPoint).toBe(
      encode(new Uint8Array(buffers.ephemeralPoint)),
    );
    expect(ticket.keyWrap!.nonce).toBe(encode(new Uint8Array(buffers.nonce)));
    expect(ticket.keyWrap!.wrappedKey).toBe(
      encode(new Uint8Array(buffers.wrappedKey)),
    );
    expect(ticket.keyWrap!.ephemeralPoint).not.toMatch(/[+/=]/);

    // Another user requesting the same ticket should get null keyWrap
    const otherUser = await createTestUser(testDb.db);
    // Give otherUser queue access so findById's access check passes
    await testDb.db
      .insertInto("queue_assignments")
      .values({
        queue_id: ticket.queueId,
        user_id: otherUser.id,
      })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

    const otherResult = await svc.findById(ticketId, otherUser.id);
    expect(otherResult.keyWrap).toBeNull();
  });

  it("list filters by priorities array", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    const normalTicket = await svc.create(userId, {
      id: crypto.randomUUID(),
      clientId,
      queueId,
      encryptedTitle: Buffer.from("normal-priority"),
      encryptedDescription: Buffer.from("desc"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });

    // Create a high-priority ticket for a different client in the same queue
    const otherClient = await createTestClientFixture(testDb.db, { queueId });
    const highTicket = await svc.create(userId, {
      id: crypto.randomUUID(),
      clientId: otherClient.clientId,
      queueId,
      encryptedTitle: Buffer.from("high-priority"),
      encryptedDescription: Buffer.from("desc"),
      priority: "high",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });

    // Filter to high only
    const highOnly = await svc.list(userId, {
      priorities: ["high"],
      limit: 100,
    });
    expect(highOnly.some((t) => t.id === highTicket.id)).toBe(true);
    expect(highOnly.some((t) => t.id === normalTicket.id)).toBe(false);

    // Filter to both
    const both = await svc.list(userId, {
      priorities: ["normal", "high"],
      limit: 100,
    });
    expect(both.some((t) => t.id === normalTicket.id)).toBe(true);
    expect(both.some((t) => t.id === highTicket.id)).toBe(true);
  });

  it("list with empty arrays returns all (no filter applied)", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const result = await svc.list(userId, {
      statuses: [],
      queueIds: [],
      priorities: [],
      limit: 100,
    });
    // The fixture ticket should be present (no filters active)
    expect(result.some((t) => t.id === ticketId)).toBe(true);
  });

  it("list filters by assignedTo", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Assign ticket to this user
    await testDb.db
      .updateTable("tickets")
      .set({ assigned_to: userId })
      .where("id", "=", ticketId)
      .execute();

    const assigned = await svc.list(userId, {
      assignedTo: userId,
      limit: 100,
    });
    expect(assigned.some((t) => t.id === ticketId)).toBe(true);

    // Filter by a different assignee
    const otherUser = await createTestUser(testDb.db);
    const notAssigned = await svc.list(userId, {
      assignedTo: otherUser.id,
      limit: 100,
    });
    expect(notAssigned.some((t) => t.id === ticketId)).toBe(false);
  });

  it("list filters by onHold", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Put ticket on hold
    await svc.update(userId, { ticketId, onHold: true });

    const onHoldResults = await svc.list(userId, {
      onHold: true,
      limit: 100,
    });
    expect(onHoldResults.some((t) => t.id === ticketId)).toBe(true);

    const notOnHold = await svc.list(userId, {
      onHold: false,
      limit: 100,
    });
    expect(notOnHold.some((t) => t.id === ticketId)).toBe(false);
  });

  // --- recentFollowUps ---

  it("recentFollowUps returns follow-ups grouped by ticket", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Insert 4 follow-ups for this ticket
    for (let i = 0; i < 4; i++) {
      await testDb.db
        .insertInto("followups")
        .values({
          ticket_id: ticketId,
          source: "volunteer",
          type: "message",
          encrypted_content: Buffer.from(`message-${i}`),
        })
        .execute();
    }

    const result = await svc.recentFollowUps(userId, {
      ticketIds: [ticketId],
      perTicket: 3,
    });

    expect(result[ticketId]).toBeDefined();
    expect(result[ticketId]).toHaveLength(3);
    // Should be ordered by created_at DESC (most recent first)
    for (let i = 0; i < result[ticketId]!.length - 1; i++) {
      expect(result[ticketId]![i]!.createdAt.getTime()).toBeGreaterThanOrEqual(
        result[ticketId]![i + 1]!.createdAt.getTime(),
      );
    }
  });

  it("recentFollowUps respects perTicket limit", async () => {
    const { userId, ticketId } = await createTicketFixture();

    for (let i = 0; i < 5; i++) {
      await testDb.db
        .insertInto("followups")
        .values({
          ticket_id: ticketId,
          source: "volunteer",
          type: "message",
          encrypted_content: Buffer.from(`msg-${i}`),
        })
        .execute();
    }

    const result = await svc.recentFollowUps(userId, {
      ticketIds: [ticketId],
      perTicket: 2,
    });
    expect(result[ticketId]).toHaveLength(2);
  });

  it("recentFollowUps returns empty for tickets outside user queues", async () => {
    const { ticketId } = await createTicketFixture();
    const outsider = await createTestUser(testDb.db);

    const result = await svc.recentFollowUps(outsider.id, {
      ticketIds: [ticketId],
      perTicket: 3,
    });
    expect(result).toEqual({});
  });

  it("recentFollowUps includes key wraps for requesting user", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Insert a follow-up
    await testDb.db
      .insertInto("followups")
      .values({
        ticket_id: ticketId,
        source: "volunteer",
        type: "message",
        encrypted_content: Buffer.from("wrap-test"),
      })
      .execute();

    // Insert a key wrap for this user
    const ticketRow = await testDb.db
      .selectFrom("tickets")
      .select("key_generation")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();

    const buffers = await insertKeyWrap(
      ticketId,
      userId,
      ticketRow.key_generation,
    );

    const result = await svc.recentFollowUps(userId, {
      ticketIds: [ticketId],
      perTicket: 3,
    });

    const followUps = result[ticketId];
    expect(followUps).toBeDefined();
    expect(followUps!.length).toBeGreaterThanOrEqual(1);
    // At least one should have a key wrap (the one with our wrap row)
    const withWrap = followUps!.find((f) => f.keyWrap !== null);
    expect(withWrap).toBeDefined();
    expect(withWrap!.keyWrap!.ephemeralPoint).toBe(
      encode(new Uint8Array(buffers.ephemeralPoint)),
    );
    expect(withWrap!.keyWrap!.ephemeralPoint).not.toMatch(/[+/=]/);
  });

  // --- listReadState ---

  async function insertFollowUp(
    ticketId: string,
    source: "client" | "volunteer" | "system",
    createdAt?: Date,
    createdBy?: string,
  ): Promise<void> {
    await testDb.db
      .insertInto("followups")
      .values({
        ticket_id: ticketId,
        source,
        type: source === "system" ? "status_change" : "message",
        encrypted_content: Buffer.alloc(0),
        ...(createdAt ? { created_at: createdAt } : {}),
        ...(createdBy !== undefined ? { created_by: createdBy } : {}),
      })
      .execute();
  }

  it("listReadState silently filters tickets outside user queues", async () => {
    const fixMine = await createTicketFixture();
    const fixOther = await createTicketFixture();

    const result = await svc.listReadState(fixMine.userId, {
      ticketIds: [fixMine.ticketId, fixOther.ticketId],
    });

    expect(result[fixMine.ticketId]).toBeDefined();
    expect(result[fixOther.ticketId]).toBeUndefined();
  });

  it("listReadState returns empty for a user with no queue access", async () => {
    const { ticketId } = await createTicketFixture();
    const outsider = await createTestUser(testDb.db);

    const result = await svc.listReadState(outsider.id, {
      ticketIds: [ticketId],
    });
    expect(result).toEqual({});
  });

  it("listReadState returns a null cursor without creating a row", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const result = await svc.listReadState(userId, { ticketIds: [ticketId] });

    expect(result[ticketId]).toBeDefined();
    expect(result[ticketId]!.encryptedReadCursor).toBeNull();

    // The read path must not lazily populate dummy rows; the "row exists
    // = opened the detail view once" surface belongs to the detail path.
    const rows = await testDb.db
      .selectFrom("ticket_read_cursors")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .execute();
    expect(rows).toHaveLength(0);
  });

  it("listReadState passes stored cursor ciphertext through verbatim", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const blob = Buffer.from("opaque-cursor-bytes-for-list-read-state");
    await testDb.db
      .insertInto("ticket_read_cursors")
      .values({
        ticket_id: ticketId,
        user_id: userId,
        encrypted_read_cursor: blob,
      })
      .execute();

    const result = await svc.listReadState(userId, { ticketIds: [ticketId] });

    expect(result[ticketId]!.encryptedReadCursor).not.toBeNull();
    expect(result[ticketId]!.encryptedReadCursor!.equals(blob)).toBe(true);
  });

  it("listReadState excludes system follow-ups from timestamps", async () => {
    const { userId, ticketId } = await createTicketFixture();

    await insertFollowUp(ticketId, "client");
    await insertFollowUp(ticketId, "volunteer");
    await insertFollowUp(ticketId, "system");

    const result = await svc.listReadState(userId, { ticketIds: [ticketId] });

    expect(result[ticketId]!.followUpCreatedAt).toHaveLength(2);
  });

  it("listReadState excludes the caller's own follow-ups from timestamps", async () => {
    const { userId, ticketId } = await createTicketFixture();
    const other = await createTestUser(testDb.db);

    // Client-authored rows carry a null created_by and must survive the
    // IS DISTINCT FROM filter; only the caller's own rows drop.
    await insertFollowUp(ticketId, "client");
    await insertFollowUp(ticketId, "volunteer", undefined, userId);
    await insertFollowUp(ticketId, "volunteer", undefined, other.id);

    const result = await svc.listReadState(userId, { ticketIds: [ticketId] });

    expect(result[ticketId]!.followUpCreatedAt).toHaveLength(2);
  });

  it("listReadState keeps the same reply visible to a different caller", async () => {
    const { userId, ticketId, queueId } = await createTicketFixture();
    await insertFollowUp(ticketId, "volunteer", undefined, userId);

    // The author sees no timestamps; a colleague on the same queue sees one.
    const own = await svc.listReadState(userId, { ticketIds: [ticketId] });
    expect(own[ticketId]!.followUpCreatedAt).toHaveLength(0);

    const colleague = await createTestUser(testDb.db);
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: colleague.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();
    const theirs = await svc.listReadState(colleague.id, {
      ticketIds: [ticketId],
    });
    expect(theirs[ticketId]!.followUpCreatedAt).toHaveLength(1);
  });

  it("listReadState caps timestamps at 20 per ticket, newest first", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const base = Date.now() - 25 * 60_000;
    for (let i = 0; i < 25; i++) {
      await insertFollowUp(ticketId, "client", new Date(base + i * 60_000));
    }

    const result = await svc.listReadState(userId, { ticketIds: [ticketId] });

    const stamps = result[ticketId]!.followUpCreatedAt;
    expect(stamps).toHaveLength(20);
    for (let i = 0; i < stamps.length - 1; i++) {
      expect(stamps[i]!.getTime()).toBeGreaterThanOrEqual(
        stamps[i + 1]!.getTime(),
      );
    }
    // The 20 kept are the newest of the 25 inserted (the oldest 5 dropped).
    expect(stamps[stamps.length - 1]!.getTime()).toBe(base + 5 * 60_000);
  });

  // --- sweepReadState ---

  async function insertCursorRow(
    userId: string,
    ticketId: string,
    blob?: Buffer,
  ): Promise<Buffer> {
    const cursor = blob ?? crypto.randomBytes(85);
    await testDb.db
      .insertInto("ticket_read_cursors")
      .values({
        ticket_id: ticketId,
        user_id: userId,
        encrypted_read_cursor: cursor,
      })
      .execute();
    return cursor;
  }

  async function insertKeyWrapRow(
    ticketId: string,
    volunteerId: string,
    keyGeneration: string,
  ): Promise<CreateTicketKeyWrap> {
    const wrap: CreateTicketKeyWrap = {
      ephemeralPoint: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      wrappedKey: crypto.randomBytes(48),
    };
    await testDb.db
      .insertInto("ticket_key_wraps")
      .values({
        ticket_id: ticketId,
        volunteer_id: volunteerId,
        key_generation: keyGeneration,
        ephemeral_point: wrap.ephemeralPoint,
        nonce: wrap.nonce,
        wrapped_key: wrap.wrappedKey,
        algorithm: "ecies-ristretto255-v1",
      })
      .execute();
    return wrap;
  }

  async function ticketKeyGeneration(ticketId: string): Promise<string> {
    const row = await testDb.db
      .selectFrom("tickets")
      .select("key_generation")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    return row.key_generation;
  }

  it("sweepReadState pages all cursor rows without gap or overlap", async () => {
    const { userId, queueId, ticketId } = await createTicketFixture();
    const ticketIds = [ticketId];
    for (let i = 0; i < 4; i++) {
      const extra = await createTestTicketFixture(testDb.db, { queueId });
      ticketIds.push(extra.ticketId);
    }
    for (const id of ticketIds) {
      await insertCursorRow(userId, id);
    }

    const pageOne = await svc.sweepReadState(userId, { limit: 3 });
    expect(pageOne.items).toHaveLength(3);
    expect(pageOne.nextCursor).toBe(pageOne.items[2]!.ticketId);

    const pageTwo = await svc.sweepReadState(userId, {
      cursor: pageOne.nextCursor!,
      limit: 3,
    });
    expect(pageTwo.items).toHaveLength(2);
    expect(pageTwo.nextCursor).toBeNull();

    // Lowercase-hex uuid string order matches PostgreSQL's bytewise uuid
    // order, so the walked pages must equal the sorted id set exactly.
    const walked = [...pageOne.items, ...pageTwo.items].map((e) => e.ticketId);
    expect(walked).toEqual([...ticketIds].sort());
  });

  it("sweepReadState silently filters tickets outside user queues", async () => {
    const mine = await createTicketFixture();
    const other = await createTicketFixture();

    await insertCursorRow(mine.userId, mine.ticketId);
    // Artificial out-of-scope row: the user opened this ticket while
    // they still had queue access, then lost the queue.
    await insertCursorRow(mine.userId, other.ticketId);

    const result = await svc.sweepReadState(mine.userId, { limit: 200 });
    const ids = result.items.map((e) => e.ticketId);
    expect(ids).toContain(mine.ticketId);
    expect(ids).not.toContain(other.ticketId);
  });

  it("sweepReadState excludes cursor rows on closed tickets", async () => {
    const { userId, ticketId } = await createTicketFixture();

    await testDb.db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", ticketId)
      .execute();
    // Close normally deletes cursor rows; insert one artificially so the
    // sweep's status filter is proven on its own.
    await insertCursorRow(userId, ticketId);

    const result = await svc.sweepReadState(userId, { limit: 200 });
    expect(result.items).toHaveLength(0);
    expect(result.nextCursor).toBeNull();
  });

  it("sweepReadState returns null latestActivityAt for system-only tickets", async () => {
    const { userId, ticketId } = await createTicketFixture();
    await insertCursorRow(userId, ticketId);
    await insertFollowUp(ticketId, "system");

    const result = await svc.sweepReadState(userId, { limit: 200 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.latestActivityAt).toBeNull();
  });

  it("sweepReadState reports the newest non-system activity time", async () => {
    const { userId, ticketId } = await createTicketFixture();
    await insertCursorRow(userId, ticketId);

    const base = Date.now() - 10 * 60_000;
    await insertFollowUp(ticketId, "client", new Date(base));
    await insertFollowUp(ticketId, "volunteer", new Date(base + 60_000));
    // Newest overall is a system event; it must not win the max.
    await insertFollowUp(ticketId, "system", new Date(base + 120_000));

    const result = await svc.sweepReadState(userId, { limit: 200 });
    expect(result.items[0]!.latestActivityAt?.getTime()).toBe(base + 60_000);
  });

  it("sweepReadState ignores the caller's own replies for latest activity", async () => {
    const { userId, ticketId } = await createTicketFixture();
    await insertCursorRow(userId, ticketId);

    const base = Date.now() - 10 * 60_000;
    // A ticket whose only reply is the caller's own reads as no activity.
    await insertFollowUp(
      ticketId,
      "volunteer",
      new Date(base + 60_000),
      userId,
    );
    const own = await svc.sweepReadState(userId, { limit: 200 });
    expect(own.items).toHaveLength(1);
    expect(own.items[0]!.latestActivityAt).toBeNull();

    // An older reply by someone else still wins over the caller's newer one.
    const other = await createTestUser(testDb.db);
    await insertFollowUp(ticketId, "volunteer", new Date(base), other.id);
    const withOther = await svc.sweepReadState(userId, { limit: 200 });
    expect(withOther.items[0]!.latestActivityAt?.getTime()).toBe(base);
  });

  it("sweepReadState passes cursor ciphertext through verbatim", async () => {
    const { userId, ticketId } = await createTicketFixture();
    const blob = Buffer.from("opaque-cursor-bytes-for-the-sweep");
    await insertCursorRow(userId, ticketId, blob);

    const result = await svc.sweepReadState(userId, { limit: 200 });
    expect(result.items[0]!.encryptedReadCursor.equals(blob)).toBe(true);
  });

  it("sweepReadState only returns tickets with cursor rows and creates none", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const result = await svc.sweepReadState(userId, { limit: 200 });
    expect(result.items).toHaveLength(0);

    // The sweep is read-only: it must not materialize dummy rows the way
    // the detail path's getOrCreate does.
    const rows = await testDb.db
      .selectFrom("ticket_read_cursors")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .execute();
    expect(rows).toHaveLength(0);
  });

  it("sweepReadState returns the key wrap at the ticket's current generation", async () => {
    const { userId, ticketId } = await createTicketFixture();
    await insertCursorRow(userId, ticketId);
    const generation = await ticketKeyGeneration(ticketId);
    const wrap = await insertKeyWrapRow(ticketId, userId, generation);

    const result = await svc.sweepReadState(userId, { limit: 200 });
    const entry = result.items[0]!;
    expect(entry.keyWrap).not.toBeNull();
    expect(entry.keyWrap!.ephemeralPoint).toBe(
      encode(new Uint8Array(wrap.ephemeralPoint)),
    );
    expect(entry.keyWrap!.nonce).toBe(encode(new Uint8Array(wrap.nonce)));
    expect(entry.keyWrap!.wrappedKey).toBe(
      encode(new Uint8Array(wrap.wrappedKey)),
    );
  });

  it("sweepReadState returns a null key wrap for an unwrapped user", async () => {
    const { userId, queueId, ticketId } = await createTicketFixture();
    await insertCursorRow(userId, ticketId);

    // A wrap at a stale generation does not count: the join is matched
    // to the ticket's current key_generation, so it resolves null too.
    const stale = await createTestTicketFixture(testDb.db, { queueId });
    await insertCursorRow(userId, stale.ticketId);
    await insertKeyWrapRow(stale.ticketId, userId, crypto.randomUUID());

    const result = await svc.sweepReadState(userId, { limit: 200 });
    expect(result.items).toHaveLength(2);
    for (const entry of result.items) {
      expect(entry.keyWrap).toBeNull();
    }
  });

  it("list returns assignedDisplayName as Buffer when ticket is assigned", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    const ticket = await svc.create(userId, {
      id: crypto.randomUUID(),
      clientId,
      queueId,
      encryptedTitle: Buffer.from("assign-display-test"),
      encryptedDescription: Buffer.from("desc"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });

    // Assign via direct DB update (assignment is a separate service).
    await testDb.db
      .updateTable("tickets")
      .set({ assigned_to: userId })
      .where("id", "=", ticket.id)
      .execute();

    const results = await svc.list(userId, {
      queueIds: [queueId],
      statuses: ["open"],
      limit: 100,
    });
    const found = results.find((t) => t.id === ticket.id);
    expect(found).toBeTruthy();

    // assignedDisplayName must be a Buffer (sealed-box ciphertext from
    // the users table), not a decoded string. This guards against a
    // regression where the server accidentally returns plaintext.
    if (found!.assignedDisplayName !== null) {
      expect(Buffer.isBuffer(found!.assignedDisplayName)).toBe(true);
    }
  });

  // --- Server-side sort ---

  it("sortBy priority places urgent before low (not alphabetical)", async () => {
    const { userId, queueId } = await createClientFixture();

    // Create tickets with different priorities via separate clients
    // (one-ticket-per-client model)
    const priorities = ["low", "urgent", "normal", "high"] as const;
    const ticketIds: string[] = [];

    for (const p of priorities) {
      const c = await createTestClientFixture(testDb.db, { queueId });
      const t = await svc.create(c.userId, {
        id: crypto.randomUUID(),
        clientId: c.clientId,
        queueId,
        encryptedTitle: Buffer.from(`title-${p}`),
        encryptedDescription: Buffer.from("desc"),
        priority: p,
        keyGeneration: crypto.randomUUID(),
        keyWrap: fakeKeyWrap(),
      });
      ticketIds.push(t.id);
    }

    const descResults = await svc.list(userId, {
      queueIds: [queueId],
      sortBy: "priority",
      sortDirection: "asc",
      limit: 100,
    });

    // Extract priorities of our test tickets in the order they were returned
    const ourTickets = descResults.filter((t) => ticketIds.includes(t.id));
    const returnedPriorities = ourTickets.map((t) => t.priority);

    // Urgent should come first (sort key 0), then high (1), normal (2), low (3)
    const urgentIdx = returnedPriorities.indexOf("urgent");
    const highIdx = returnedPriorities.indexOf("high");
    const normalIdx = returnedPriorities.indexOf("normal");
    const lowIdx = returnedPriorities.indexOf("low");

    expect(urgentIdx).toBeLessThan(highIdx);
    expect(highIdx).toBeLessThan(normalIdx);
    expect(normalIdx).toBeLessThan(lowIdx);
  });

  it("sortBy priority desc places low before urgent", async () => {
    const { userId, queueId } = await createClientFixture();

    const priorities = ["urgent", "low"] as const;
    const ticketIds: string[] = [];

    for (const p of priorities) {
      const c = await createTestClientFixture(testDb.db, { queueId });
      const t = await svc.create(c.userId, {
        id: crypto.randomUUID(),
        clientId: c.clientId,
        queueId,
        encryptedTitle: Buffer.from(`title-${p}`),
        encryptedDescription: Buffer.from("desc"),
        priority: p,
        keyGeneration: crypto.randomUUID(),
        keyWrap: fakeKeyWrap(),
      });
      ticketIds.push(t.id);
    }

    const results = await svc.list(userId, {
      queueIds: [queueId],
      sortBy: "priority",
      sortDirection: "desc",
      limit: 100,
    });

    const ourTickets = results.filter((t) => ticketIds.includes(t.id));
    const returnedPriorities = ourTickets.map((t) => t.priority);

    expect(returnedPriorities.indexOf("low")).toBeLessThan(
      returnedPriorities.indexOf("urgent"),
    );
  });

  it("sortBy last_activity places recently-active tickets first (desc)", async () => {
    const { userId, queueId } = await createClientFixture();

    // Ticket A: created first, no follow-ups (last_activity = null)
    const clientA = await createTestClientFixture(testDb.db, { queueId });
    const ticketA = await svc.create(clientA.userId, {
      id: crypto.randomUUID(),
      clientId: clientA.clientId,
      queueId,
      encryptedTitle: Buffer.from("old-no-activity"),
      encryptedDescription: Buffer.from("desc"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });

    // Ticket B: created second, has a follow-up (last_activity = now)
    const clientB = await createTestClientFixture(testDb.db, { queueId });
    const ticketB = await svc.create(clientB.userId, {
      id: crypto.randomUUID(),
      clientId: clientB.clientId,
      queueId,
      encryptedTitle: Buffer.from("recent-activity"),
      encryptedDescription: Buffer.from("desc"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
      keyWrap: fakeKeyWrap(),
    });

    // Add a follow-up to ticket B so it has recent activity
    await testDb.db
      .insertInto("followups")
      .values({
        ticket_id: ticketB.id,
        source: "volunteer",
        type: "message",
        encrypted_content: Buffer.from("test follow-up"),
      })
      .execute();

    const results = await svc.list(userId, {
      queueIds: [queueId],
      sortBy: "last_activity",
      sortDirection: "desc",
      limit: 100,
    });

    const ourTickets = results.filter(
      (t) => t.id === ticketA.id || t.id === ticketB.id,
    );

    // Ticket B (has activity) should appear before ticket A (no activity)
    const idxB = ourTickets.findIndex((t) => t.id === ticketB.id);
    const idxA = ourTickets.findIndex((t) => t.id === ticketA.id);
    expect(idxB).toBeLessThan(idxA);
  });

  it("sortBy priority pagination covers all tickets without duplicates", async () => {
    const { userId, queueId } = await createClientFixture();

    // Create 5 tickets with mixed priorities
    const priorities = ["low", "urgent", "high", "normal", "urgent"] as const;
    const ticketIds: string[] = [];

    for (const p of priorities) {
      const c = await createTestClientFixture(testDb.db, { queueId });
      const t = await svc.create(c.userId, {
        id: crypto.randomUUID(),
        clientId: c.clientId,
        queueId,
        encryptedTitle: Buffer.from(`title-${p}-${ticketIds.length}`),
        encryptedDescription: Buffer.from("desc"),
        priority: p,
        keyGeneration: crypto.randomUUID(),
        keyWrap: fakeKeyWrap(),
      });
      ticketIds.push(t.id);
    }

    // Page through with limit 2
    const page1 = await svc.list(userId, {
      queueIds: [queueId],
      sortBy: "priority",
      sortDirection: "asc",
      limit: 2,
    });
    expect(page1.length).toBe(2);

    const page2 = await svc.list(userId, {
      queueIds: [queueId],
      sortBy: "priority",
      sortDirection: "asc",
      limit: 2,
      cursor: page1[1]!.id,
    });
    expect(page2.length).toBe(2);

    const page3 = await svc.list(userId, {
      queueIds: [queueId],
      sortBy: "priority",
      sortDirection: "asc",
      limit: 2,
      cursor: page2[1]!.id,
    });

    // Collect all returned ticket IDs across pages
    const allReturned = [
      ...page1.map((t) => t.id),
      ...page2.map((t) => t.id),
      ...page3.map((t) => t.id),
    ];

    // All 5 tickets appear exactly once (no duplicates, no skips)
    const ourReturned = allReturned.filter((id) => ticketIds.includes(id));
    expect(new Set(ourReturned).size).toBe(5);
    expect(ourReturned).toHaveLength(5);
  });

  it("sortBy last_activity pagination covers tickets with and without activity", async () => {
    const { userId, queueId } = await createClientFixture();

    // 5 tickets: indices 0,2,4 have follow-ups (activity), 1,3 do not (NULL).
    // With NULLS LAST desc, active tickets come first, then NULLs.
    // Pagination must cross the non-NULL → NULL boundary without skips.
    const ticketIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const c = await createTestClientFixture(testDb.db, { queueId });
      const t = await svc.create(c.userId, {
        id: crypto.randomUUID(),
        clientId: c.clientId,
        queueId,
        encryptedTitle: Buffer.from(`activity-page-${i}`),
        encryptedDescription: Buffer.from("desc"),
        priority: "normal",
        keyGeneration: crypto.randomUUID(),
        keyWrap: fakeKeyWrap(),
      });
      ticketIds.push(t.id);

      if (i % 2 === 0) {
        await testDb.db
          .insertInto("followups")
          .values({
            ticket_id: t.id,
            source: "volunteer",
            type: "message",
            encrypted_content: Buffer.from(`msg-${i}`),
          })
          .execute();
      }
    }

    // Page through with limit 2
    const page1 = await svc.list(userId, {
      queueIds: [queueId],
      sortBy: "last_activity",
      sortDirection: "desc",
      limit: 2,
    });
    expect(page1.length).toBe(2);

    const page2 = await svc.list(userId, {
      queueIds: [queueId],
      sortBy: "last_activity",
      sortDirection: "desc",
      limit: 2,
      cursor: page1[1]!.id,
    });
    expect(page2.length).toBe(2);

    const page3 = await svc.list(userId, {
      queueIds: [queueId],
      sortBy: "last_activity",
      sortDirection: "desc",
      limit: 2,
      cursor: page2[1]!.id,
    });

    const allReturned = [
      ...page1.map((t) => t.id),
      ...page2.map((t) => t.id),
      ...page3.map((t) => t.id),
    ];

    // All 5 tickets appear exactly once across pages
    const ourReturned = allReturned.filter((id) => ticketIds.includes(id));
    expect(new Set(ourReturned).size).toBe(5);
    expect(ourReturned).toHaveLength(5);
  });

  it("default sort (no sortBy) returns tickets in created_at desc order", async () => {
    const { userId, queueId } = await createClientFixture();

    const ticketIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const c = await createTestClientFixture(testDb.db, { queueId });
      const t = await svc.create(c.userId, {
        id: crypto.randomUUID(),
        clientId: c.clientId,
        queueId,
        encryptedTitle: Buffer.from(`title-${i}`),
        encryptedDescription: Buffer.from("desc"),
        priority: "normal",
        keyGeneration: crypto.randomUUID(),
        keyWrap: fakeKeyWrap(),
      });
      ticketIds.push(t.id);
    }

    const results = await svc.list(userId, {
      queueIds: [queueId],
      limit: 100,
    });

    const ourTickets = results.filter((t) => ticketIds.includes(t.id));
    const returnedIds = ourTickets.map((t) => t.id);

    // Default is desc, so the last created ticket should appear first
    expect(returnedIds[0]).toBe(ticketIds[2]);
    expect(returnedIds[1]).toBe(ticketIds[1]);
    expect(returnedIds[2]).toBe(ticketIds[0]);
  });
});
