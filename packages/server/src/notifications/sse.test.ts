import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createSseService } from "./sse.js";
import type { SseEvent } from "@care-y/shared";

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
  ticketId: "550e8400-e29b-41d4-a716-446655440000",
  queueId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
    const cleanup = svc.connect(res as never, "user-1", "org-1");

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
    const cleanup = svc.connect(res as never, "user-1", "org-1");

    expect(written).toContain(": connected\n\n");
    cleanup();
  });

  it("broadcasts events to matching users", () => {
    const svc = createSseService();
    const { res, written } = mockResponse();
    const cleanup = svc.connect(res as never, "user-1", "org-1");

    svc.broadcast("org-1", ["user-1"], TEST_EVENT);

    const dataLine = written.find((w) => w.startsWith("id: "));
    expect(dataLine).toBeDefined();
    expect(dataLine).toContain(JSON.stringify(TEST_EVENT));

    cleanup();
  });

  it("does not send events to users in different orgs", () => {
    const svc = createSseService();
    const { res: res1, written: w1 } = mockResponse();
    const { res: res2, written: w2 } = mockResponse();
    const c1 = svc.connect(res1 as never, "user-1", "org-1");
    const c2 = svc.connect(res2 as never, "user-2", "org-2");

    svc.broadcast("org-1", ["user-1"], TEST_EVENT);

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
    const cleanup = svc.connect(res as never, "user-2", "org-1");

    svc.broadcast("org-1", ["user-1"], TEST_EVENT); // user-2 not in recipients

    const dataLines = written.filter((w) => w.startsWith("id: "));
    expect(dataLines).toHaveLength(0);

    cleanup();
  });

  it("tracks connection count", () => {
    const svc = createSseService();
    expect(svc.connectionCount()).toBe(0);

    const { res: res1 } = mockResponse();
    const { res: res2 } = mockResponse();
    const c1 = svc.connect(res1 as never, "user-1", "org-1");
    expect(svc.connectionCount()).toBe(1);

    const c2 = svc.connect(res2 as never, "user-2", "org-1");
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
    svc.connect(res1 as never, "user-1", "org-1");
    svc.connect(res2 as never, "user-2", "org-1");

    svc.closeAll();

    expect(res1.end).toHaveBeenCalled();
    expect(res2.end).toHaveBeenCalled();
    expect(svc.connectionCount()).toBe(0);
  });

  it("sends heartbeat every 30 seconds", () => {
    const svc = createSseService();
    const { res, written } = mockResponse();
    const cleanup = svc.connect(res as never, "user-1", "org-1");

    vi.advanceTimersByTime(30_000);
    expect(written).toContain(": heartbeat\n\n");

    cleanup();
  });

  it("replays missed events on reconnect with Last-Event-ID", () => {
    const svc = createSseService();

    // First connection receives event
    const { res: res1 } = mockResponse();
    const c1 = svc.connect(res1 as never, "user-1", "org-1");
    svc.broadcast("org-1", ["user-1"], TEST_EVENT);
    c1();

    // Reconnect with Last-Event-ID=0 (missed event 1)
    const { res: res2, written: w2 } = mockResponse();
    const c2 = svc.connect(res2 as never, "user-1", "org-1", 0);

    const replayed = w2.filter((w) => w.startsWith("id: "));
    expect(replayed).toHaveLength(1);
    expect(replayed[0]).toContain(JSON.stringify(TEST_EVENT));

    c2();
  });

  it("prunes events older than 5 minutes from buffer", () => {
    const svc = createSseService();

    const { res: res1 } = mockResponse();
    const c1 = svc.connect(res1 as never, "user-1", "org-1");
    svc.broadcast("org-1", ["user-1"], TEST_EVENT);
    c1();

    // Advance 6 minutes
    vi.advanceTimersByTime(6 * 60 * 1000);

    // Reconnect - the old event should be pruned
    const { res: res2, written: w2 } = mockResponse();
    const c2 = svc.connect(res2 as never, "user-1", "org-1", 0);

    const replayed = w2.filter((w) => w.startsWith("id: "));
    expect(replayed).toHaveLength(0);

    c2();
  });
});
