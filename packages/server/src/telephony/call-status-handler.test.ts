import { describe, expect, it, vi } from "vitest";
import {
  handleCallStatus,
  type CallStatusDeps,
} from "./call-status-handler.js";
import { createCallTracker, type TrackedCall } from "./call-tracker.js";

function makeTracked(overrides?: Partial<TrackedCall>): TrackedCall {
  return {
    ticketId: "ticket-1",
    userId: "user-1",
    direction: "outbound",
    orgSchema: "test_org",
    clientId: null,
    createdAt: Date.now(),
    ...overrides,
  };
}

function makeDeps(callTracker = createCallTracker()): CallStatusDeps & {
  inserts: Array<Record<string, unknown>>;
} {
  const inserts: Array<Record<string, unknown>> = [];
  const mockDb = {
    insertInto: vi.fn().mockReturnValue({
      values: vi.fn().mockImplementation((vals: Record<string, unknown>) => {
        inserts.push(vals);
        return { execute: vi.fn().mockResolvedValue(undefined) };
      }),
    }),
  };

  return {
    callTracker,
    inserts,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mock
    getTenantDb: vi.fn().mockReturnValue(mockDb) as any,
    intakeQueueId: "queue-intake-1",
  };
}

describe("handleCallStatus", () => {
  it("creates a phone_call follow-up for terminal outbound call", async () => {
    const tracker = createCallTracker();
    tracker.track("CA123", makeTracked({ direction: "outbound" }));
    const deps = makeDeps(tracker);

    await handleCallStatus(
      "test_org",
      {
        CallSid: "CA123",
        CallStatus: "completed",
        Duration: "120",
      },
      deps,
    );

    expect(deps.inserts).toHaveLength(1);
    expect(deps.inserts[0]).toMatchObject({
      ticket_id: "ticket-1",
      source: "volunteer",
      type: "phone_call",
      call_sid: "CA123",
      call_status: "completed",
      call_duration_seconds: 120,
    });
    // Tracker entry is NOT removed (recording callback needs it, TTL handles cleanup)
    expect(tracker.get("CA123")).toBeDefined();
  });

  it("creates a phone_call follow-up for inbound call", async () => {
    const tracker = createCallTracker();
    tracker.track("CA456", makeTracked({ direction: "inbound", userId: null }));
    const deps = makeDeps(tracker);

    await handleCallStatus(
      "test_org",
      {
        CallSid: "CA456",
        CallStatus: "no-answer",
      },
      deps,
    );

    expect(deps.inserts).toHaveLength(1);
    expect(deps.inserts[0]).toMatchObject({
      source: "client",
      call_status: "no_answer",
      call_duration_seconds: null,
    });
  });

  it("ignores non-terminal statuses", async () => {
    const tracker = createCallTracker();
    tracker.track("CA789", makeTracked());
    const deps = makeDeps(tracker);

    await handleCallStatus(
      "test_org",
      {
        CallSid: "CA789",
        CallStatus: "ringing",
      },
      deps,
    );

    expect(deps.inserts).toHaveLength(0);
    expect(tracker.get("CA789")).toBeDefined();
  });

  it("ignores unknown callSid", async () => {
    const deps = makeDeps();

    await handleCallStatus(
      "test_org",
      {
        CallSid: "unknown",
        CallStatus: "completed",
      },
      deps,
    );

    expect(deps.inserts).toHaveLength(0);
  });

  it("ignores missing CallSid or CallStatus", async () => {
    const deps = makeDeps();
    await handleCallStatus("test_org", {}, deps);
    expect(deps.inserts).toHaveLength(0);
  });

  it("normalizes Twilio hyphenated status to underscored", async () => {
    const tracker = createCallTracker();
    tracker.track("CA111", makeTracked());
    const deps = makeDeps(tracker);

    await handleCallStatus(
      "test_org",
      {
        CallSid: "CA111",
        CallStatus: "no-answer",
      },
      deps,
    );

    expect(deps.inserts[0]?.call_status).toBe("no_answer");
  });

  it("handles missing duration (non-completed call)", async () => {
    const tracker = createCallTracker();
    tracker.track("CA222", makeTracked());
    const deps = makeDeps(tracker);

    await handleCallStatus(
      "test_org",
      {
        CallSid: "CA222",
        CallStatus: "busy",
      },
      deps,
    );

    expect(deps.inserts[0]?.call_duration_seconds).toBeNull();
  });

  it("skips insert when outbound call has no ticketId", async () => {
    const tracker = createCallTracker();
    tracker.track(
      "CA333",
      makeTracked({ ticketId: "", direction: "outbound" }),
    );
    const deps = makeDeps(tracker);

    await handleCallStatus(
      "test_org",
      {
        CallSid: "CA333",
        CallStatus: "completed",
        Duration: "60",
      },
      deps,
    );

    expect(deps.inserts).toHaveLength(0);
    // Tracker entry persists (TTL handles cleanup)
    expect(tracker.get("CA333")).toBeDefined();
  });

  // Inbound resolution now uses resolveOrCreateTicket which requires a real
  // DB (advisory lock + transaction). Covered in server-ticket-create.test.ts
  // DB integration tests.

  it("skips inbound resolution when no clientId", async () => {
    const tracker = createCallTracker();
    tracker.track(
      "CA555",
      makeTracked({
        ticketId: "",
        direction: "inbound",
        clientId: null,
      }),
    );
    const deps = makeDeps(tracker);

    await handleCallStatus(
      "test_org",
      { CallSid: "CA555", CallStatus: "completed" },
      deps,
    );

    expect(deps.inserts).toHaveLength(0);
  });
});
