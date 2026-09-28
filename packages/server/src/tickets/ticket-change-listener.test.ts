import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { Mock } from "vitest";
import type { Kysely } from "kysely";
import {
  newTicketId,
  orgSchemaNameSchema,
  type OrgSchema,
} from "@care-y/shared";
import type { TenantDatabase } from "../db/types.js";
import { stubTenantDbDefaultRoles, TestSetupError } from "../test-utils.js";
import type { TicketLiveEvents } from "./ticket-live-events.js";
import {
  TICKET_CHANGED_CHANNEL,
  TICKET_CHANGED_LISTEN_STATEMENT,
} from "./ticket-change-channel.js";
import {
  LISTEN_BACKOFF_INITIAL_MS,
  LISTEN_BACKOFF_MAX_MS,
  LISTEN_STABLE_MS,
  createTicketChangeNoticeListener,
  type NotificationClient,
  type TicketChangeNoticeListener,
} from "./ticket-change-listener.js";

const ORG_SCHEMA = orgSchemaNameSchema.parse(
  "org_0b6f2c1e-4d7a-4c2e-9f1a-3e5d7c9b1a2f",
);

/** In-memory stand-in for one node-postgres session. */
class FakeNotificationClient implements NotificationClient {
  readonly queries: string[] = [];
  ended = false;
  private notificationHandler:
    ((channel: string, payload: string | undefined) => void) | null = null;
  private errorHandler: ((err: Error) => void) | null = null;
  private endHandler: (() => void) | null = null;

  constructor(private readonly failConnect: boolean) {}

  async connect(): Promise<void> {
    if (this.failConnect) throw new Error("connection refused");
  }

  async query(text: string): Promise<void> {
    this.queries.push(text);
  }

  async end(): Promise<void> {
    if (this.ended) return;
    this.ended = true;
    this.endHandler?.();
  }

  onNotification(
    handler: (channel: string, payload: string | undefined) => void,
  ): void {
    this.notificationHandler = handler;
  }

  onError(handler: (err: Error) => void): void {
    this.errorHandler = handler;
  }

  onEnd(handler: () => void): void {
    this.endHandler = handler;
  }

  notify(channel: string, payload: string | undefined): void {
    this.notificationHandler?.(channel, payload);
  }

  fail(err: Error): void {
    this.errorHandler?.(err);
  }
}

describe("ticket change notice listener", () => {
  const tenantDb = stubTenantDbDefaultRoles();
  let clients: FakeNotificationClient[];
  let failNextConnects: boolean;
  let ticketChanged: Mock<TicketLiveEvents["ticketChanged"]>;
  let getTenantDb: Mock<(orgSchema: OrgSchema) => Kysely<TenantDatabase>>;
  let listener: TicketChangeNoticeListener;

  beforeEach(() => {
    clients = [];
    failNextConnects = false;
    ticketChanged = vi.fn<TicketLiveEvents["ticketChanged"]>(
      async () => undefined,
    );
    getTenantDb = vi.fn<(orgSchema: OrgSchema) => Kysely<TenantDatabase>>(
      () => tenantDb,
    );
    const liveEvents: TicketLiveEvents = {
      ticketChanged,
      forTenant: vi.fn<TicketLiveEvents["forTenant"]>(() => () => undefined),
      captureRemovals: vi.fn<TicketLiveEvents["captureRemovals"]>(
        async () => () => undefined,
      ),
    };
    listener = createTicketChangeNoticeListener({
      createClient: () => {
        const client = new FakeNotificationClient(failNextConnects);
        clients.push(client);
        return client;
      },
      getTenantDb,
      liveEvents,
    });
    vi.spyOn(console, "error").mockImplementation(() => {
      // silenced
    });
    vi.spyOn(console, "warn").mockImplementation(() => {
      // silenced
    });
  });

  afterEach(async () => {
    await listener.stop();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function current(): FakeNotificationClient {
    const client = clients[clients.length - 1];
    if (client === undefined) throw new TestSetupError("no client created");
    return client;
  }

  /** Asserts the next session is opened after exactly `wait` ms. */
  async function expectReconnectAfter(wait: number): Promise<void> {
    const before = clients.length;
    await vi.advanceTimersByTimeAsync(wait - 1);
    expect(clients).toHaveLength(before);
    await vi.advanceTimersByTimeAsync(1);
    expect(clients).toHaveLength(before + 1);
  }

  it("subscribes on start", async () => {
    await listener.start();
    expect(clients).toHaveLength(1);
    expect(current().queries).toEqual([TICKET_CHANGED_LISTEN_STATEMENT]);
  });

  it("hands a valid notice to ticketChanged with that tenant's database", async () => {
    await listener.start();
    const ticketId = newTicketId();

    current().notify(
      TICKET_CHANGED_CHANNEL,
      JSON.stringify({ orgSchema: ORG_SCHEMA, ticketId }),
    );

    expect(getTenantDb).toHaveBeenCalledWith(ORG_SCHEMA);
    expect(ticketChanged).toHaveBeenCalledTimes(1);
    expect(ticketChanged).toHaveBeenCalledWith(tenantDb, ORG_SCHEMA, ticketId);
  });

  it("ignores extra fields in the notice", async () => {
    await listener.start();
    const ticketId = newTicketId();

    current().notify(
      TICKET_CHANGED_CHANNEL,
      JSON.stringify({
        orgSchema: ORG_SCHEMA,
        ticketId,
        userIds: ["someone"],
      }),
    );

    expect(ticketChanged).toHaveBeenCalledWith(tenantDb, ORG_SCHEMA, ticketId);
  });

  it.each([
    [
      "a bad org schema",
      JSON.stringify({ orgSchema: "public", ticketId: newTicketId() }),
    ],
    [
      "a bad ticket id",
      JSON.stringify({ orgSchema: ORG_SCHEMA, ticketId: "ticket-1" }),
    ],
    ["a non-JSON payload", "org_x:ticket"],
    ["no payload", undefined],
  ])("drops %s with one fixed log line", async (_n, payload) => {
    await listener.start();

    current().notify(TICKET_CHANGED_CHANNEL, payload);

    expect(ticketChanged).not.toHaveBeenCalled();
    expect(getTenantDb).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      "Dropped a malformed ticket change notice",
    );
  });

  it("ignores notices on other channels", async () => {
    await listener.start();

    current().notify(
      "other_channel",
      JSON.stringify({ orgSchema: ORG_SCHEMA, ticketId: newTicketId() }),
    );

    expect(ticketChanged).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("reconnects with doubling delays capped at the maximum", async () => {
    vi.useFakeTimers();
    failNextConnects = true;
    await listener.start();
    expect(clients).toHaveLength(1);

    const expected: number[] = [];
    let delay = LISTEN_BACKOFF_INITIAL_MS;
    for (let i = 0; i < 7; i++) {
      expected.push(delay);
      delay = Math.min(delay * 2, LISTEN_BACKOFF_MAX_MS);
    }
    expect(expected.slice(-2)).toEqual([
      LISTEN_BACKOFF_MAX_MS,
      LISTEN_BACKOFF_MAX_MS,
    ]);

    for (const wait of expected) await expectReconnectAfter(wait);
    for (const client of clients) expect(client.ended).toBe(true);
  });

  it("keeps backing off when each new session drops right after subscribing", async () => {
    vi.useFakeTimers();
    await listener.start();

    for (const wait of [
      LISTEN_BACKOFF_INITIAL_MS,
      LISTEN_BACKOFF_INITIAL_MS * 2,
      LISTEN_BACKOFF_INITIAL_MS * 4,
      LISTEN_BACKOFF_INITIAL_MS * 8,
    ]) {
      expect(current().queries).toEqual([TICKET_CHANGED_LISTEN_STATEMENT]);
      current().fail(new Error("terminating connection"));
      await expectReconnectAfter(wait);
    }
  });

  it("resets the delay only after a session outlives the stability window", async () => {
    vi.useFakeTimers();
    await listener.start();
    current().fail(new Error("terminating connection"));
    await expectReconnectAfter(LISTEN_BACKOFF_INITIAL_MS);

    // Lost just before the window closes: the delay keeps doubling.
    await vi.advanceTimersByTimeAsync(LISTEN_STABLE_MS - 1);
    current().fail(new Error("terminating connection"));
    await expectReconnectAfter(LISTEN_BACKOFF_INITIAL_MS * 2);

    // Lost after a full window: the delay starts over.
    await vi.advanceTimersByTimeAsync(LISTEN_STABLE_MS);
    current().fail(new Error("terminating connection"));
    await expectReconnectAfter(LISTEN_BACKOFF_INITIAL_MS);
  });

  it("re-subscribes on a new session after losing a stable one", async () => {
    vi.useFakeTimers();
    failNextConnects = true;
    await listener.start();
    await vi.advanceTimersByTimeAsync(LISTEN_BACKOFF_INITIAL_MS);
    failNextConnects = false;
    await vi.advanceTimersByTimeAsync(LISTEN_BACKOFF_INITIAL_MS * 2);
    expect(clients).toHaveLength(3);
    expect(current().queries).toEqual([TICKET_CHANGED_LISTEN_STATEMENT]);

    const lost = current();
    await vi.advanceTimersByTimeAsync(LISTEN_STABLE_MS);
    lost.fail(new Error("terminating connection"));
    expect(lost.ended).toBe(true);

    await expectReconnectAfter(LISTEN_BACKOFF_INITIAL_MS);
    expect(clients).toHaveLength(4);
    expect(current().queries).toEqual([TICKET_CHANGED_LISTEN_STATEMENT]);

    const ticketId = newTicketId();
    current().notify(
      TICKET_CHANGED_CHANNEL,
      JSON.stringify({ orgSchema: ORG_SCHEMA, ticketId }),
    );
    expect(ticketChanged).toHaveBeenCalledWith(tenantDb, ORG_SCHEMA, ticketId);
  });

  it("treats a session end like a loss", async () => {
    vi.useFakeTimers();
    await listener.start();
    await current().end();

    await vi.advanceTimersByTimeAsync(LISTEN_BACKOFF_INITIAL_MS);
    expect(clients).toHaveLength(2);
    expect(current().queries).toEqual([TICKET_CHANGED_LISTEN_STATEMENT]);
  });

  it("stop closes the session and never reconnects", async () => {
    vi.useFakeTimers();
    await listener.start();
    const client = current();

    await listener.stop();

    expect(client.ended).toBe(true);
    await vi.advanceTimersByTimeAsync(LISTEN_BACKOFF_MAX_MS * 2);
    expect(clients).toHaveLength(1);
  });

  it("stop cancels a pending retry", async () => {
    vi.useFakeTimers();
    failNextConnects = true;
    await listener.start();

    await listener.stop();

    await vi.advanceTimersByTimeAsync(LISTEN_BACKOFF_MAX_MS * 2);
    expect(clients).toHaveLength(1);
  });
});
