import { describe, expect, it, vi, afterEach } from "vitest";
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

describe("CallTracker", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tracks and retrieves a call", () => {
    const tracker = createCallTracker();
    const call = makeTracked();
    tracker.track("CA123", call);
    expect(tracker.get("CA123")).toBe(call);
    expect(tracker.size).toBe(1);
  });

  it("returns undefined for unknown callSid", () => {
    const tracker = createCallTracker();
    expect(tracker.get("unknown")).toBeUndefined();
  });

  it("removes a tracked call", () => {
    const tracker = createCallTracker();
    tracker.track("CA123", makeTracked());
    tracker.remove("CA123");
    expect(tracker.get("CA123")).toBeUndefined();
    expect(tracker.size).toBe(0);
  });

  it("remove is a no-op for unknown callSid", () => {
    const tracker = createCallTracker();
    tracker.remove("unknown");
    expect(tracker.size).toBe(0);
  });

  it("tracks multiple calls independently", () => {
    const tracker = createCallTracker();
    const call1 = makeTracked({ ticketId: "t1" });
    const call2 = makeTracked({ ticketId: "t2" });
    tracker.track("CA1", call1);
    tracker.track("CA2", call2);
    expect(tracker.get("CA1")?.ticketId).toBe("t1");
    expect(tracker.get("CA2")?.ticketId).toBe("t2");
    expect(tracker.size).toBe(2);
  });
});
