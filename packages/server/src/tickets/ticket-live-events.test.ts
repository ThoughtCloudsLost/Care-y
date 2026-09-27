import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  afterEach,
} from "vitest";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  createTestTicketFixture,
  createMockSseService,
  seedOrgPublicKey,
  stubTenantDbDefaultRoles,
  type TestDb,
} from "../test-utils.js";
import {
  announceClientTickets,
  createTicketLiveEvents,
} from "./ticket-live-events.js";
import {
  newTicketId,
  sseEventSchema,
  type OrgSchema,
  type QueueId,
  type TicketId,
  type UserId,
} from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("TicketLiveEvents (DB)", () => {
  let testDb: TestDb;
  let orgSchema: OrgSchema;
  let queueId: QueueId;
  let ticketId: TicketId;
  let assignee: UserId;
  let watcher: UserId;
  let member: UserId;
  let outsider: UserId;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    orgSchema = testDb.schemaName as OrgSchema;

    assignee = (await createTestUser(testDb.db)).id;
    watcher = (await createTestUser(testDb.db)).id;
    member = (await createTestUser(testDb.db)).id;
    outsider = (await createTestUser(testDb.db)).id;

    queueId = (await createTestQueue(testDb.db)).id;
    ticketId = (await createTestTicketFixture(testDb.db, { queueId })).ticketId;

    await testDb.db
      .updateTable("tickets")
      .set({ assigned_to: assignee })
      .where("id", "=", ticketId)
      .execute();
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: member })
      .execute();
    await testDb.db
      .insertInto("ticket_watchers")
      .values({ ticket_id: ticketId, user_id: watcher })
      .execute();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("broadcasts ticket_changed to everyone with access and no one else", async () => {
    const sse = createMockSseService();
    const live = createTicketLiveEvents({ sse });

    await live.ticketChanged(testDb.db, orgSchema, ticketId);

    expect(sse.broadcast).toHaveBeenCalledTimes(1);
    const [schema, recipients, event] = sse.broadcast.mock.calls[0] ?? [];
    expect(schema).toBe(orgSchema);
    expect([...(recipients ?? [])].sort()).toEqual(
      [assignee, watcher, member].sort(),
    );
    expect(recipients).not.toContain(outsider);
    expect(event).toMatchObject({ type: "ticket_changed", ticketId, queueId });
  });

  it("sends only the metadata the SSE schema allows", async () => {
    const sse = createMockSseService();
    const live = createTicketLiveEvents({ sse });

    await live.ticketChanged(testDb.db, orgSchema, ticketId);

    const event = sse.broadcast.mock.calls[0]?.[2];
    expect(sseEventSchema.safeParse(event).success).toBe(true);
    expect(Object.keys(event ?? {}).sort()).toEqual([
      "queueId",
      "ticketId",
      "timestamp",
      "type",
    ]);
  });

  it("sends nothing for a ticket that does not exist", async () => {
    const sse = createMockSseService();
    const live = createTicketLiveEvents({ sse });

    await live.ticketChanged(testDb.db, orgSchema, newTicketId());

    expect(sse.broadcast).not.toHaveBeenCalled();
  });

  it("never rejects when the broadcast throws, and logs without ids", async () => {
    const sse = createMockSseService();
    sse.broadcast.mockImplementation(() => {
      throw new Error("socket gone");
    });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {
      // silenced
    });
    const live = createTicketLiveEvents({ sse });

    await expect(
      live.ticketChanged(testDb.db, orgSchema, ticketId),
    ).resolves.toBeUndefined();

    expect(errors).toHaveBeenCalledTimes(1);
    const logged = errors.mock.calls.flat().map(String).join(" ");
    expect(logged).not.toContain(ticketId);
    expect(logged).not.toContain(assignee);
  });

  it("forTenant binds the tenant and emits without being awaited", async () => {
    const sse = createMockSseService();
    const live = createTicketLiveEvents({ sse });

    const listener = live.forTenant(testDb.db, orgSchema);
    listener(ticketId);
    expect(sse.broadcast).not.toHaveBeenCalled();

    await vi.waitFor(() => {
      expect(sse.broadcast).toHaveBeenCalledTimes(1);
    });
    expect(sse.broadcast.mock.calls[0]?.[2]).toMatchObject({
      type: "ticket_changed",
      ticketId,
    });
  });

  it("captureRemovals resolves before a delete and emits after it", async () => {
    const sse = createMockSseService();
    const live = createTicketLiveEvents({ sse });
    const doomed = (await createTestTicketFixture(testDb.db, { queueId }))
      .ticketId;

    const emit = await live.captureRemovals(testDb.db, orgSchema, [doomed]);
    await testDb.db.deleteFrom("tickets").where("id", "=", doomed).execute();
    expect(sse.broadcast).not.toHaveBeenCalled();

    emit();

    expect(sse.broadcast).toHaveBeenCalledTimes(1);
    const [, recipients, event] = sse.broadcast.mock.calls[0] ?? [];
    expect(recipients).toEqual([member]);
    expect(event).toMatchObject({ type: "ticket_changed", ticketId: doomed });
  });

  it("announceClientTickets hands every ticket of the client to the listener", async () => {
    const fixture = await createTestTicketFixture(testDb.db, { queueId });
    const second = await createTestTicketFixture(testDb.db, { queueId });
    await testDb.db
      .updateTable("tickets")
      .set({ client_id: fixture.clientId })
      .where("id", "=", second.ticketId)
      .execute();
    const listener = vi.fn<(id: TicketId) => void>();

    await announceClientTickets(testDb.db, fixture.clientId, listener);

    const announced = listener.mock.calls.map(([id]) => id);
    expect(announced).toHaveLength(2);
    expect(announced).toEqual(
      expect.arrayContaining([fixture.ticketId, second.ticketId]),
    );
    expect(listener).not.toHaveBeenCalledWith(ticketId);
  });

  it("announceClientTickets skips the lookup without a listener", async () => {
    // The stub throws on the tickets query this helper would run.
    await expect(
      announceClientTickets(
        stubTenantDbDefaultRoles(),
        (await createTestTicketFixture(testDb.db)).clientId,
        undefined,
      ),
    ).resolves.toBeUndefined();
  });

  it("announceClientTickets never rejects when the lookup fails, and logs without ids", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {
      // silenced
    });
    const { clientId } = await createTestTicketFixture(testDb.db);
    const listener = vi.fn();

    await expect(
      announceClientTickets(stubTenantDbDefaultRoles(), clientId, listener),
    ).resolves.toBeUndefined();

    expect(listener).not.toHaveBeenCalled();
    expect(errors).toHaveBeenCalledTimes(1);
    const logged = errors.mock.calls.flat().map(String).join(" ");
    expect(logged).not.toContain(clientId);
  });
});
