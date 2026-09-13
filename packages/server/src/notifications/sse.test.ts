import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createSseService } from "./sse.js";
import type { SseEvent } from "@care-y/shared";
import {
  orgSchemaNameSchema,
  userIdSchema,
  ticketIdSchema,
  queueIdSchema,
} from "@care-y/shared";

const SCHEMA_1 = orgSchemaNameSchema.parse(
  "org_00000000-0000-4000-8000-000000000001",
);
const SCHEMA_2 = orgSchemaNameSchema.parse(
  "org_00000000-0000-4000-8000-000000000002",
);
const USER_1 = userIdSchema.parse("11111111-1111-4111-8111-111111111111");
const USER_2 = userIdSchema.parse("22222222-2222-4222-8222-222222222222");

/** Minimal mock of ServerResponse for SSE testing. */
function mockResponse(): {
  res: {
    writeHead: ReturnType<typeof vi.fn>;
    write: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
    destroyed: boolean;
  };
  written: string[];
} {
  const written: string[] = [];
  return {
    written,
    res: {
      destroyed: false,
      writeHead: vi.fn(),
      write: vi.fn((chunk: string) => {
        written.push(chunk);
        return true;
      }),
      end: vi.fn(),
    },
  };
}

const TEST_EVENT: SseEvent = {
  type: "ticket_assigned",
  ticketId: ticketIdSchema.parse("550e8400-e29b-41d4-a716-446655440000"),
  queueId: queueIdSchema.parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
  timestamp: "2026-03-24T12:00:00.000Z",
};

describe("SseService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes SSE headers on connect", () => {
    const svc = createSseService();
    const { res } = mockResponse();
    const cleanup = svc.connect(res as never, USER_1, SCHEMA_1);

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    cleanup();
  });

  it("writes initial comment on connect", () => {
    const svc = createSseService();
    const { res, written } = mockResponse();
    const cleanup = svc.connect(res as never, USER_1, SCHEMA_1);

    expect(written).toContain(": connected\n\n");
    cleanup();
  });

  it("broadcasts events to matching users", () => {
    const svc = createSseService();
    const { res, written } = mockResponse();
    const cleanup = svc.connect(res as never, USER_1, SCHEMA_1);

    svc.broadcast(SCHEMA_1, [USER_1], TEST_EVENT);

    const dataLine = written.find((w) => w.startsWith("id: "));
    expect(dataLine).toBeDefined();
    expect(dataLine).toContain(JSON.stringify(TEST_EVENT));

    cleanup();
  });

  it("does not send events to users in different orgs", () => {
    const svc = createSseService();
    const { res: res1, written: w1 } = mockResponse();
    const { res: res2, written: w2 } = mockResponse();
    const c1 = svc.connect(res1 as never, USER_1, SCHEMA_1);
    const c2 = svc.connect(res2 as never, USER_2, SCHEMA_2);

    svc.broadcast(SCHEMA_1, [USER_1], TEST_EVENT);

    const org1Data = w1.filter((w) => w.startsWith("id: "));
    const org2Data = w2.filter((w) => w.startsWith("id: "));
    expect(org1Data).toHaveLength(1);
    expect(org2Data).toHaveLength(0);

    c1();
    c2();
  });

  it("does not send events to non-recipient users in same org", () => {
    const svc = createSseService();
    const { res, written } = mockResponse();
    const cleanup = svc.connect(res as never, USER_2, SCHEMA_1);

    svc.broadcast(SCHEMA_1, [USER_1], TEST_EVENT); // user-2 not in recipients

    const dataLines = written.filter((w) => w.startsWith("id: "));
    expect(dataLines).toHaveLength(0);

    cleanup();
  });

  it("tracks connection count", () => {
    const svc = createSseService();
    expect(svc.connectionCount()).toBe(0);

    const { res: res1 } = mockResponse();
    const { res: res2 } = mockResponse();
    const c1 = svc.connect(res1 as never, USER_1, SCHEMA_1);
    expect(svc.connectionCount()).toBe(1);

    const c2 = svc.connect(res2 as never, USER_2, SCHEMA_1);
    expect(svc.connectionCount()).toBe(2);

    c1();
    expect(svc.connectionCount()).toBe(1);

    c2();
    expect(svc.connectionCount()).toBe(0);
  });

  it("closeAll ends all connections", () => {
    const svc = createSseService();
    const { res: res1 } = mockResponse();
    const { res: res2 } = mockResponse();
    svc.connect(res1 as never, USER_1, SCHEMA_1);
    svc.connect(res2 as never, USER_2, SCHEMA_1);

    svc.closeAll();

    expect(res1.end).toHaveBeenCalled();
    expect(res2.end).toHaveBeenCalled();
    expect(svc.connectionCount()).toBe(0);
  });

  it("sends heartbeat every 30 seconds", () => {
    const svc = createSseService();
    const { res, written } = mockResponse();
    const cleanup = svc.connect(res as never, USER_1, SCHEMA_1);

    vi.advanceTimersByTime(30_000);
    expect(written).toContain(": heartbeat\n\n");

    cleanup();
  });

  it("replays missed events on reconnect with Last-Event-ID", () => {
    const svc = createSseService();

    // First connection receives event
    const { res: res1 } = mockResponse();
    const c1 = svc.connect(res1 as never, USER_1, SCHEMA_1);
    svc.broadcast(SCHEMA_1, [USER_1], TEST_EVENT);
    c1();

    // Reconnect with Last-Event-ID=0 (missed event 1)
    const { res: res2, written: w2 } = mockResponse();
    const c2 = svc.connect(res2 as never, USER_1, SCHEMA_1, 0);

    const replayed = w2.filter((w) => w.startsWith("id: "));
    expect(replayed).toHaveLength(1);
    expect(replayed[0]).toContain(JSON.stringify(TEST_EVENT));

    c2();
  });

  it("prunes events older than 5 minutes from buffer", () => {
    const svc = createSseService();

    const { res: res1 } = mockResponse();
    const c1 = svc.connect(res1 as never, USER_1, SCHEMA_1);
    svc.broadcast(SCHEMA_1, [USER_1], TEST_EVENT);
    c1();

    // Advance 6 minutes
    vi.advanceTimersByTime(6 * 60 * 1000);

    // Reconnect - the old event should be pruned
    const { res: res2, written: w2 } = mockResponse();
    const c2 = svc.connect(res2 as never, USER_1, SCHEMA_1, 0);

    const replayed = w2.filter((w) => w.startsWith("id: "));
    expect(replayed).toHaveLength(0);

    c2();
  });

  // --- Uncovered branches ---

  it("evicts oldest connection when MAX_CONNECTIONS_PER_USER is reached", () => {
    const svc = createSseService();
    const { res: res1 } = mockResponse();
    const { res: res2 } = mockResponse();
    const { res: res3 } = mockResponse();
    const { res: res4, written: w4 } = mockResponse();

    // Connect 3 times (the per-user limit)
    svc.connect(res1 as never, USER_1, SCHEMA_1);
    svc.connect(res2 as never, USER_1, SCHEMA_1);
    svc.connect(res3 as never, USER_1, SCHEMA_1);
    expect(svc.connectionCount()).toBe(3);

    // 4th connection evicts the oldest (res1)
    const c4 = svc.connect(res4 as never, USER_1, SCHEMA_1);
    expect(res1.end).toHaveBeenCalled();
    expect(svc.connectionCount()).toBe(3);

    // The new connection works
    svc.broadcast(SCHEMA_1, [USER_1], TEST_EVENT);
    const dataLines = w4.filter((w) => w.startsWith("id: "));
    expect(dataLines).toHaveLength(1);

    c4();
  });

  it("evicts oldest when already-destroyed connection is in the slot", () => {
    const svc = createSseService();
    const { res: res1 } = mockResponse();
    const { res: res2 } = mockResponse();
    const { res: res3 } = mockResponse();
    const { res: res4 } = mockResponse();

    svc.connect(res1 as never, USER_1, SCHEMA_1);
    svc.connect(res2 as never, USER_1, SCHEMA_1);
    svc.connect(res3 as never, USER_1, SCHEMA_1);

    // Mark res1 as already destroyed before eviction happens
    res1.destroyed = true;

    svc.connect(res4 as never, USER_1, SCHEMA_1);
    // end() should NOT be called on an already-destroyed response
    expect(res1.end).not.toHaveBeenCalled();
    expect(svc.connectionCount()).toBe(3);
  });

  it("replay only sends events matching the user's org and userId", () => {
    const svc = createSseService();

    const { res: r1 } = mockResponse();
    svc.connect(r1 as never, USER_1, SCHEMA_1);

    // Broadcast events for different user/org combos
    svc.broadcast(SCHEMA_1, [USER_1], TEST_EVENT);
    svc.broadcast(SCHEMA_1, [USER_2], TEST_EVENT);
    svc.broadcast(SCHEMA_2, [USER_1], TEST_EVENT);

    // Disconnect
    svc.closeAll();

    // Reconnect with lastEventId=0 (missed all events)
    const { res: r2, written: w2 } = mockResponse();
    const c2 = svc.connect(r2 as never, USER_1, SCHEMA_1, 0);

    // Only the first event (org-1 + user-1) should replay
    const replayed = w2.filter((w) => w.startsWith("id: "));
    expect(replayed).toHaveLength(1);

    c2();
  });

  it("broadcast sends to multiple connected clients of the same user", () => {
    const svc = createSseService();
    const { res: res1, written: w1 } = mockResponse();
    const { res: res2, written: w2 } = mockResponse();

    const c1 = svc.connect(res1 as never, USER_1, SCHEMA_1);
    const c2 = svc.connect(res2 as never, USER_1, SCHEMA_1);

    svc.broadcast(SCHEMA_1, [USER_1], TEST_EVENT);

    const data1 = w1.filter((w) => w.startsWith("id: "));
    const data2 = w2.filter((w) => w.startsWith("id: "));
    expect(data1).toHaveLength(1);
    expect(data2).toHaveLength(1);

    c1();
    c2();
  });

  it("heartbeat stops when connection is destroyed", () => {
    const svc = createSseService();
    const { res, written } = mockResponse();
    const cleanup = svc.connect(res as never, USER_1, SCHEMA_1);

    // First heartbeat fires
    vi.advanceTimersByTime(30_000);
    const heartbeats1 = written.filter((w) => w === ": heartbeat\n\n").length;
    expect(heartbeats1).toBe(1);

    // Mark connection as destroyed
    res.destroyed = true;

    // Next heartbeat interval should detect destroyed and clear
    vi.advanceTimersByTime(30_000);
    const heartbeats2 = written.filter((w) => w === ": heartbeat\n\n").length;
    // Should still be 1 (no new heartbeat written)
    expect(heartbeats2).toBe(1);

    cleanup();
  });

  it("sendEvent skips destroyed connections during broadcast", () => {
    const svc = createSseService();
    const { res, written } = mockResponse();
    const cleanup = svc.connect(res as never, USER_1, SCHEMA_1);

    // Destroy the connection before broadcast
    res.destroyed = true;

    svc.broadcast(SCHEMA_1, [USER_1], TEST_EVENT);

    const dataLines = written.filter((w) => w.startsWith("id: "));
    expect(dataLines).toHaveLength(0);

    cleanup();
  });

  it("cleanup is idempotent when called twice", () => {
    const svc = createSseService();
    const { res } = mockResponse();
    const cleanup = svc.connect(res as never, USER_1, SCHEMA_1);

    cleanup();
    expect(svc.connectionCount()).toBe(0);

    // Second call should not throw
    cleanup();
    expect(svc.connectionCount()).toBe(0);
  });

  it("connect without lastEventId does not replay events", () => {
    const svc = createSseService();
    const { res: r1 } = mockResponse();
    svc.connect(r1 as never, USER_1, SCHEMA_1);
    svc.broadcast(SCHEMA_1, [USER_1], TEST_EVENT);
    svc.closeAll();

    // Reconnect without lastEventId
    const { res: r2, written: w2 } = mockResponse();
    const c2 = svc.connect(r2 as never, USER_1, SCHEMA_1);

    const replayed = w2.filter((w) => w.startsWith("id: "));
    expect(replayed).toHaveLength(0);

    c2();
  });
});
