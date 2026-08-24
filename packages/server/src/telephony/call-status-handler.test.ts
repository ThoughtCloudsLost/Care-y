import { describe, expect, it, vi } from "vitest";
import {
  handleCallStatus,
  type CallStatusDeps,
} from "./call-status-handler.js";
import { createCallTracker, type TrackedCall } from "./call-tracker.js";
import type {
  OrgSchema,
  TicketId,
  UserId,
  QueueId,
  CallSid,
} from "@care-y/shared";

const TEST_ORG_SCHEMA = "org_test" as OrgSchema;
const TEST_TICKET_ID = "ticket-1" as TicketId;
const TEST_USER_ID = "user-1" as UserId;
const TEST_QUEUE_ID = "queue-intake-1" as QueueId;

function makeTracked(overrides?: Partial<TrackedCall>): TrackedCall {
  return {
    ticketId: TEST_TICKET_ID,
    userId: TEST_USER_ID,
    direction: "outbound",
    orgSchema: TEST_ORG_SCHEMA,
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
    getTenantDb: vi
      .fn()
      .mockReturnValue(mockDb) as unknown as CallStatusDeps["getTenantDb"],
    intakeQueueId: TEST_QUEUE_ID,
  };
}

describe("handleCallStatus", () => {
  it("creates a phone_call follow-up for terminal outbound call", async () => {
    const tracker = createCallTracker();
    await tracker.track(
      TEST_ORG_SCHEMA,
      "CA123" as CallSid,
      makeTracked({ direction: "outbound" }),
    );
    const deps = makeDeps(tracker);

    await handleCallStatus(
      TEST_ORG_SCHEMA,
      {
        CallSid: "CA123",
        CallStatus: "completed",
        Duration: "120",
      },
      deps,
    );

    expect(deps.inserts).toHaveLength(1);
    expect(deps.inserts[0]).toMatchObject({
      ticket_id: TEST_TICKET_ID,
      source: "volunteer",
      type: "phone_call",
      call_sid: "CA123" as CallSid,
      call_status: "completed",
      call_duration_seconds: 120,
    });
    // Tracker entry is NOT removed (recording callback needs it, TTL handles cleanup)
    expect(
      await tracker.get(TEST_ORG_SCHEMA, "CA123" as CallSid),
    ).toBeDefined();
  });

  it("creates a phone_call follow-up for inbound call", async () => {
    const tracker = createCallTracker();
    await tracker.track(
      TEST_ORG_SCHEMA,
      "CA456" as CallSid,
      makeTracked({ direction: "inbound", userId: null }),
    );
    const deps = makeDeps(tracker);

    await handleCallStatus(
      TEST_ORG_SCHEMA,
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
    await tracker.track(TEST_ORG_SCHEMA, "CA789" as CallSid, makeTracked());
    const deps = makeDeps(tracker);

    await handleCallStatus(
      TEST_ORG_SCHEMA,
      {
        CallSid: "CA789",
        CallStatus: "ringing",
      },
      deps,
    );

    expect(deps.inserts).toHaveLength(0);
    expect(
      await tracker.get(TEST_ORG_SCHEMA, "CA789" as CallSid),
    ).toBeDefined();
  });

  it("ignores unknown callSid", async () => {
    const deps = makeDeps();

    await handleCallStatus(
      TEST_ORG_SCHEMA,
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
    await handleCallStatus(TEST_ORG_SCHEMA, {}, deps);
    expect(deps.inserts).toHaveLength(0);
  });

  it("normalizes Twilio hyphenated status to underscored", async () => {
    const tracker = createCallTracker();
    await tracker.track(TEST_ORG_SCHEMA, "CA111" as CallSid, makeTracked());
    const deps = makeDeps(tracker);

    await handleCallStatus(
      TEST_ORG_SCHEMA,
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
    await tracker.track(TEST_ORG_SCHEMA, "CA222" as CallSid, makeTracked());
    const deps = makeDeps(tracker);

    await handleCallStatus(
      TEST_ORG_SCHEMA,
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
    await tracker.track(
      TEST_ORG_SCHEMA,
      "CA333" as CallSid,
      makeTracked({ ticketId: "" as TicketId, direction: "outbound" }),
    );
    const deps = makeDeps(tracker);

    await handleCallStatus(
      TEST_ORG_SCHEMA,
      {
        CallSid: "CA333",
        CallStatus: "completed",
        Duration: "60",
      },
      deps,
    );

    expect(deps.inserts).toHaveLength(0);
    // Tracker entry persists (TTL handles cleanup)
    expect(
      await tracker.get(TEST_ORG_SCHEMA, "CA333" as CallSid),
    ).toBeDefined();
  });

  // Inbound resolution now uses resolveOrCreateTicket which requires a real
  // DB (advisory lock + transaction). Covered in server-ticket-create.test.ts
  // DB integration tests.

  it("skips inbound resolution when no clientId", async () => {
    const tracker = createCallTracker();
    await tracker.track(
      TEST_ORG_SCHEMA,
      "CA555" as CallSid,
      makeTracked({
        ticketId: "" as TicketId,
        direction: "inbound",
        clientId: null,
      }),
    );
    const deps = makeDeps(tracker);

    await handleCallStatus(
      TEST_ORG_SCHEMA,
      { CallSid: "CA555", CallStatus: "completed" },
      deps,
    );

    expect(deps.inserts).toHaveLength(0);
  });
});
