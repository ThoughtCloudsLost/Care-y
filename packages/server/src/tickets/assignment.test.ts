import * as crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  createTestTicketFixture,
  seedOrgPublicKey,
  withFailingFollowUpInserts,
  FollowUpInsertFailure,
  type TestDb,
} from "../test-utils.js";
import { createTicketAccessChecker } from "./access.js";
import {
  createAssignmentService,
  type AssignmentService,
} from "./assignment.js";
import { createStubShiftProvider } from "./shift-provider.js";
import { createQueuePermissionsService } from "./queue-permissions.js";
import type { TicketChangeListener } from "./ticket-live-events.js";
import { ForbiddenError, NotFoundError, TicketError } from "../errors.js";
import {
  newTicketId,
  type UserId,
  type TicketId,
  type QueueId,
} from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("AssignmentService (DB)", () => {
  let testDb: TestDb;
  let svc: AssignmentService;
  let volunteerA: UserId;
  let volunteerB: UserId;
  let volunteerC: UserId;
  let queueId: QueueId;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);

    const uA = await createTestUser(testDb.db);
    const uB = await createTestUser(testDb.db);
    const uC = await createTestUser(testDb.db);
    volunteerA = uA.id;
    volunteerB = uB.id;
    volunteerC = uC.id;

    const queue = await createTestQueue(testDb.db);
    queueId = queue.id;

    // Add all three volunteers to the queue
    for (const uid of [volunteerA, volunteerB, volunteerC]) {
      await testDb.db
        .insertInto("queue_assignments")
        .values({ queue_id: queueId, user_id: uid })
        .execute();
    }

    const access = createTicketAccessChecker(testDb.db);
    const queuePerms = createQueuePermissionsService(testDb.db);
    const shift = createStubShiftProvider((qId) =>
      queuePerms.getQueueMembers(qId),
    );
    svc = createAssignmentService(testDb.db, access, shift);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function insertTicket(opts?: {
    assignedTo?: UserId;
    status?: "open" | "closed";
  }): Promise<TicketId> {
    const fix = await createTestTicketFixture(testDb.db, { queueId });
    if (opts?.assignedTo !== undefined || opts?.status !== undefined) {
      await testDb.db
        .updateTable("tickets")
        .set({
          ...(opts.assignedTo !== undefined
            ? { assigned_to: opts.assignedTo }
            : {}),
          ...(opts.status !== undefined ? { status: opts.status } : {}),
        })
        .where("id", "=", fix.ticketId)
        .execute();
    }
    return fix.ticketId;
  }

  // --- assignRoundRobin ---

  it("assigns to volunteer with fewest open tickets", async () => {
    // Give volunteerA 2 open tickets, volunteerB 1, volunteerC 0
    await insertTicket({ assignedTo: volunteerA });
    await insertTicket({ assignedTo: volunteerA });
    await insertTicket({ assignedTo: volunteerB });

    const unassigned = await insertTicket();
    const result = await svc.assignRoundRobin(unassigned);
    expect(result.assignedTo).toBe(volunteerC);
  });

  it("creates volunteer_assigned system follow-up on assign", async () => {
    const ticketId = await insertTicket();
    await svc.assignRoundRobin(ticketId);

    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "volunteer_assigned")
      .execute();
    expect(followups.length).toBeGreaterThanOrEqual(1);
  });

  it("returns null assignedTo when no candidates (empty queue)", async () => {
    // Create a ticket in a different queue with no members
    const emptyQueue = await createTestQueue(testDb.db);
    const fix = await createTestTicketFixture(testDb.db, {
      queueId: emptyQueue.id,
    });

    const access = createTicketAccessChecker(testDb.db);
    const emptyShift = createStubShiftProvider(async () => []);
    const emptySvc = createAssignmentService(testDb.db, access, emptyShift);

    const result = await emptySvc.assignRoundRobin(fix.ticketId);
    expect(result.assignedTo).toBeNull();
  });

  it("throws NotFoundError for nonexistent ticket", async () => {
    await expect(svc.assignRoundRobin(newTicketId())).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("throws TicketError for closed ticket", async () => {
    const ticketId = await insertTicket({ status: "closed" });
    await expect(svc.assignRoundRobin(ticketId)).rejects.toBeInstanceOf(
      TicketError,
    );
  });

  // --- take ---

  it("take self-assigns an unassigned ticket", async () => {
    const ticketId = await insertTicket();
    await svc.take(volunteerA, ticketId);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("assigned_to")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.assigned_to).toBe(volunteerA);
  });

  it("take creates volunteer_assigned follow-up", async () => {
    const ticketId = await insertTicket();
    await svc.take(volunteerA, ticketId);

    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "volunteer_assigned")
      .execute();
    expect(followups.length).toBeGreaterThanOrEqual(1);
  });

  it("take throws TicketError when ticket is already assigned", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerB });
    await expect(svc.take(volunteerA, ticketId)).rejects.toBeInstanceOf(
      TicketError,
    );
  });

  it("take throws TicketError for closed ticket", async () => {
    const ticketId = await insertTicket({ status: "closed" });
    await expect(svc.take(volunteerA, ticketId)).rejects.toBeInstanceOf(
      TicketError,
    );
  });

  // --- release ---

  it("release clears assigned_to, ticket returns to unassigned", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerA });
    await svc.release(volunteerA, ticketId);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("assigned_to")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.assigned_to).toBeNull();
  });

  it("release creates volunteer_unassigned follow-up", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerB });
    await svc.release(volunteerB, ticketId);

    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "volunteer_unassigned")
      .execute();
    expect(followups.length).toBeGreaterThanOrEqual(1);
  });

  it("release throws TicketError when volunteer is not the assignee", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerA });
    await expect(svc.release(volunteerB, ticketId)).rejects.toBeInstanceOf(
      TicketError,
    );
  });

  it("release reads the current assignee, not one from before a reassignment", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerA });
    await svc.assignTo(volunteerA, ticketId, volunteerB);

    await expect(svc.release(volunteerA, ticketId)).rejects.toBeInstanceOf(
      TicketError,
    );

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("assigned_to")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.assigned_to).toBe(volunteerB);
  });

  it("release does NOT trigger auto-assignment", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerA });
    await svc.release(volunteerA, ticketId);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("assigned_to")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    // Stays unassigned per design: no auto-reassignment on release
    expect(ticket.assigned_to).toBeNull();
  });

  // --- assignTo ---

  it("assignTo sets assigned_to to target volunteer", async () => {
    const ticketId = await insertTicket();
    await svc.assignTo(volunteerA, ticketId, volunteerB);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("assigned_to")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.assigned_to).toBe(volunteerB);
  });

  it("assignTo with null clears assigned_to", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerA });
    await svc.assignTo(volunteerA, ticketId, null);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("assigned_to")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.assigned_to).toBeNull();
  });

  it("assignTo reassigns from one volunteer to another", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerA });
    await svc.assignTo(volunteerB, ticketId, volunteerC);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("assigned_to")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.assigned_to).toBe(volunteerC);
  });

  it("assignTo creates volunteer_assigned system follow-up", async () => {
    const ticketId = await insertTicket();
    await svc.assignTo(volunteerA, ticketId, volunteerB);

    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "volunteer_assigned")
      .execute();
    expect(followups.length).toBeGreaterThanOrEqual(1);
  });

  it("assignTo is no-op when target matches current assignee", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerA });
    await svc.assignTo(volunteerB, ticketId, volunteerA);

    // Should not have created a new follow-up for a no-op
    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "volunteer_assigned")
      .execute();
    expect(followups).toHaveLength(0);
  });

  it("assignTo throws TicketError for closed ticket", async () => {
    const ticketId = await insertTicket({ status: "closed" });
    await expect(
      svc.assignTo(volunteerA, ticketId, volunteerB),
    ).rejects.toBeInstanceOf(TicketError);
  });

  it("assignTo throws ForbiddenError for nonexistent ticket", async () => {
    // Access checker returns ForbiddenError for nonexistent tickets
    // (no existence leak: "not found" is indistinguishable from "no access")
    await expect(
      svc.assignTo(volunteerA, newTicketId(), volunteerB),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("assignTo throws ForbiddenError for inactive target user", async () => {
    // Create an inactive user
    const inactive = await createTestUser(testDb.db);
    await testDb.db
      .updateTable("users")
      .set({ is_active: false })
      .where("id", "=", inactive.id)
      .execute();

    const ticketId = await insertTicket();
    await expect(
      svc.assignTo(volunteerA, ticketId, inactive.id),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("assignTo throws ForbiddenError for nonexistent target user", async () => {
    const ticketId = await insertTicket();
    await expect(
      svc.assignTo(volunteerA, ticketId, crypto.randomUUID() as UserId),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("assignTo unassign names the assignee the previous call left", async () => {
    const ticketId = await insertTicket();
    await svc.assignTo(volunteerA, ticketId, volunteerA);
    await svc.assignTo(volunteerA, ticketId, volunteerB);
    await svc.assignTo(volunteerA, ticketId, null);

    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "volunteer_unassigned")
      .execute();
    expect(followups).toHaveLength(1);
    const params = followups[0]!.event_params as { userId: string };
    expect(params.userId).toBe(volunteerB);
  });

  // --- a failed system follow-up rolls back the assignment ---

  function createFailingService(
    onTicketChanged: TicketChangeListener,
  ): AssignmentService {
    const access = createTicketAccessChecker(testDb.db);
    const shift = createStubShiftProvider((qId) =>
      createQueuePermissionsService(testDb.db).getQueueMembers(qId),
    );
    return createAssignmentService(
      withFailingFollowUpInserts(testDb.db),
      access,
      shift,
      { onTicketChanged },
    );
  }

  async function followUpCount(ticketId: TicketId): Promise<number> {
    const row = await testDb.db
      .selectFrom("followups")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("ticket_id", "=", ticketId)
      .executeTakeFirstOrThrow();
    return Number(row.count);
  }

  async function assignedTo(ticketId: TicketId): Promise<UserId | null> {
    const row = await testDb.db
      .selectFrom("tickets")
      .select("assigned_to")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    return row.assigned_to;
  }

  it("assignRoundRobin leaves the ticket unassigned when its follow-up fails", async () => {
    const ticketId = await insertTicket();
    const onTicketChanged = vi.fn<TicketChangeListener>();
    const failing = createFailingService(onTicketChanged);
    const followUpsBefore = await followUpCount(ticketId);

    await expect(failing.assignRoundRobin(ticketId)).rejects.toBeInstanceOf(
      FollowUpInsertFailure,
    );

    expect(await assignedTo(ticketId)).toBeNull();
    expect(await followUpCount(ticketId)).toBe(followUpsBefore);
    expect(onTicketChanged).not.toHaveBeenCalled();
  });

  it("take leaves the ticket unassigned when its follow-up fails", async () => {
    const ticketId = await insertTicket();
    const onTicketChanged = vi.fn<TicketChangeListener>();
    const failing = createFailingService(onTicketChanged);
    const followUpsBefore = await followUpCount(ticketId);

    await expect(failing.take(volunteerA, ticketId)).rejects.toBeInstanceOf(
      FollowUpInsertFailure,
    );

    expect(await assignedTo(ticketId)).toBeNull();
    expect(await followUpCount(ticketId)).toBe(followUpsBefore);
    expect(onTicketChanged).not.toHaveBeenCalled();
  });

  it("release leaves the ticket assigned when its follow-up fails", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerA });
    const onTicketChanged = vi.fn<TicketChangeListener>();
    const failing = createFailingService(onTicketChanged);
    const followUpsBefore = await followUpCount(ticketId);

    await expect(failing.release(volunteerA, ticketId)).rejects.toBeInstanceOf(
      FollowUpInsertFailure,
    );

    expect(await assignedTo(ticketId)).toBe(volunteerA);
    expect(await followUpCount(ticketId)).toBe(followUpsBefore);
    expect(onTicketChanged).not.toHaveBeenCalled();
  });

  it("assignTo leaves the ticket unassigned when its follow-up fails", async () => {
    const ticketId = await insertTicket();
    const onTicketChanged = vi.fn<TicketChangeListener>();
    const failing = createFailingService(onTicketChanged);
    const followUpsBefore = await followUpCount(ticketId);

    await expect(
      failing.assignTo(volunteerA, ticketId, volunteerB),
    ).rejects.toBeInstanceOf(FollowUpInsertFailure);

    expect(await assignedTo(ticketId)).toBeNull();
    expect(await followUpCount(ticketId)).toBe(followUpsBefore);
    expect(onTicketChanged).not.toHaveBeenCalled();
  });
});
