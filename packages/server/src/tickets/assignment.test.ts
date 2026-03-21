import * as crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  createTestTicketFixture,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import { createTicketAccessChecker } from "./access.js";
import {
  createAssignmentService,
  type AssignmentService,
} from "./assignment.js";
import { createStubShiftProvider } from "./shift-provider.js";
import { createQueuePermissionsService } from "./queue-permissions.js";
import { NotFoundError, TicketError } from "../errors.js";

describe.skipIf(!process.env.DATABASE_URL)("AssignmentService (DB)", () => {
  let testDb: TestDb;
  let svc: AssignmentService;
  let volunteerA: string;
  let volunteerB: string;
  let volunteerC: string;
  let queueId: string;

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
    assignedTo?: string;
    status?: string;
  }): Promise<string> {
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

  it("creates assignment_change system follow-up on assign", async () => {
    const ticketId = await insertTicket();
    await svc.assignRoundRobin(ticketId);

    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "assignment_change")
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
    await expect(
      svc.assignRoundRobin(crypto.randomUUID()),
    ).rejects.toBeInstanceOf(NotFoundError);
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

  it("take creates assignment_change follow-up", async () => {
    const ticketId = await insertTicket();
    await svc.take(volunteerA, ticketId);

    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "assignment_change")
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

  it("release creates assignment_change follow-up", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerB });
    await svc.release(volunteerB, ticketId);

    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "assignment_change")
      .execute();
    expect(followups.length).toBeGreaterThanOrEqual(1);
  });

  it("release throws TicketError when volunteer is not the assignee", async () => {
    const ticketId = await insertTicket({ assignedTo: volunteerA });
    await expect(svc.release(volunteerB, ticketId)).rejects.toBeInstanceOf(
      TicketError,
    );
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
});
