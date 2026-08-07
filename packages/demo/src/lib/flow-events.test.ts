import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  FLOW_INTERACTION_IDLE_MS,
  beginFlowInteraction,
  currentFlowInteractionId,
  emitFlowEvent,
  resetFlowEvents,
  setFlowClock,
  subscribeFlowEvents,
  traceFlowLocal,
  traceFlowSpan,
  truncateFlowPreview,
} from "./flow-events.js";
import type { DemoFlowEvent } from "./bridge.js";

/** Manual clock so grouping and durations never touch wall time. */
function useTestClock(): { advance: (ms: number) => void } {
  let t = 0;
  setFlowClock(() => t);
  return {
    advance(ms: number): void {
      t += ms;
    },
  };
}

/** Collect emitted events into an array via subscription. */
function collectEvents(): DemoFlowEvent[] {
  const events: DemoFlowEvent[] = [];
  subscribeFlowEvents((event) => {
    events.push(event);
  });
  return events;
}

describe("flow events", () => {
  beforeEach(() => {
    resetFlowEvents();
  });

  describe("ids and delivery", () => {
    it("assigns monotonic ids starting at 1", () => {
      useTestClock();
      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap one" });
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap two" });
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap three" });

      expect(events.map((e) => e.id)).toEqual([1, 2, 3]);
    });

    it("normalizes optional fields to null", () => {
      useTestClock();
      const events = collectEvents();
      emitFlowEvent({
        lane: "trpc",
        direction: "up",
        label: "tickets.list query",
      });

      const event = events.at(0);
      expect(event?.seamKey).toBeNull();
      expect(event?.payloadPreview).toBeNull();
      expect(event?.durationMs).toBeNull();
    });

    it("skips event construction when no listeners are attached", () => {
      useTestClock();
      // No listener subscribed
      const result = emitFlowEvent({
        lane: "ui",
        direction: "up",
        label: "tap one",
      });
      // Returns a sentinel with the correct id but empty label for thunks
      expect(result.id).toBe(1);
      // Ids still advance
      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap two" });
      expect(events.at(0)?.id).toBe(2);
    });

    it("resolves thunk label and payloadPreview when listeners exist", () => {
      useTestClock();
      const events = collectEvents();
      emitFlowEvent({
        lane: "db",
        direction: "local",
        label: () => "SELECT users",
        payloadPreview: () => "limit 10",
      });

      expect(events.at(0)?.label).toBe("SELECT users");
      expect(events.at(0)?.payloadPreview).toBe("limit 10");
    });

    it("does not call thunks when no listeners exist", () => {
      useTestClock();
      const labelThunk = vi.fn(() => "SELECT users");
      const previewThunk = vi.fn(() => "limit 10");
      // No listener
      emitFlowEvent({
        lane: "db",
        direction: "local",
        label: labelThunk,
        payloadPreview: previewThunk,
      });
      expect(labelThunk).not.toHaveBeenCalled();
      expect(previewThunk).not.toHaveBeenCalled();
    });
  });

  describe("interaction grouping", () => {
    it("keeps events inside the idle window in one interaction", () => {
      const clock = useTestClock();
      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap sort" });
      clock.advance(FLOW_INTERACTION_IDLE_MS - 1);
      emitFlowEvent({ lane: "trpc", direction: "up", label: "tickets.list" });

      const ids = events.map((e) => e.interactionId);
      expect(ids.at(0)).toBe(ids.at(1));
    });

    it("starts a new interaction after the idle window", () => {
      const clock = useTestClock();
      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap sort" });
      clock.advance(FLOW_INTERACTION_IDLE_MS + 1);
      emitFlowEvent({
        lane: "db",
        direction: "local",
        label: "SELECT tickets",
      });

      const ids = events.map((e) => e.interactionId);
      expect(ids.at(1)).toBe((ids.at(0) ?? 0) + 1);
    });

    it("bumps the interaction on an explicit begin", () => {
      useTestClock();
      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap sort" });
      const before = currentFlowInteractionId();
      const after = beginFlowInteraction();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap filters" });

      expect(after).toBe(before + 1);
      expect(events.at(-1)?.interactionId).toBe(after);
    });

    it("does not double-bump when a begin precedes a long gap", () => {
      const clock = useTestClock();
      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap sort" });
      const before = currentFlowInteractionId();

      clock.advance(FLOW_INTERACTION_IDLE_MS * 4);
      beginFlowInteraction();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap filters" });

      expect(events.at(-1)?.interactionId).toBe(before + 1);
    });

    it("honors an explicitly pinned interaction id", () => {
      const clock = useTestClock();
      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap sort" });
      const pinned = currentFlowInteractionId();
      clock.advance(FLOW_INTERACTION_IDLE_MS * 3);
      emitFlowEvent({
        lane: "trpc",
        direction: "down",
        label: "tickets.list query",
        interactionId: pinned,
      });

      expect(events.at(-1)?.interactionId).toBe(pinned);
    });
  });

  describe("subscription", () => {
    it("delivers new events and stops after unsubscribe", () => {
      useTestClock();
      const seen: string[] = [];
      const unsubscribe = subscribeFlowEvents((event) => {
        seen.push(event.label);
      });

      emitFlowEvent({ lane: "ui", direction: "up", label: "first" });
      unsubscribe();
      emitFlowEvent({ lane: "ui", direction: "up", label: "second" });

      expect(seen).toEqual(["first"]);
    });

    it("does not replay events emitted before subscribing", () => {
      useTestClock();
      emitFlowEvent({ lane: "ui", direction: "up", label: "before" });
      const seen: string[] = [];
      subscribeFlowEvents((event) => {
        seen.push(event.label);
      });

      expect(seen).toEqual([]);
    });
  });

  describe("traceFlowSpan", () => {
    it("emits a request and response pair sharing one interaction", async () => {
      const clock = useTestClock();
      const events = collectEvents();
      const result = await traceFlowSpan(
        { lane: "trpc", label: "tickets.list query" },
        async () => {
          clock.advance(FLOW_INTERACTION_IDLE_MS * 2);
          return Promise.resolve("rows");
        },
      );

      expect(result).toBe("rows");
      expect(events).toHaveLength(2);
      expect(events.at(0)?.direction).toBe("up");
      expect(events.at(1)?.direction).toBe("down");
      expect(events.at(1)?.interactionId).toBe(events.at(0)?.interactionId);
      expect(events.at(1)?.durationMs).toBe(FLOW_INTERACTION_IDLE_MS * 2);
    });

    it("marks a failed call and rethrows", async () => {
      useTestClock();
      const events = collectEvents();
      const failure = new TypeError("boom");

      await expect(
        traceFlowSpan({ lane: "trpc", label: "tickets.list query" }, () =>
          Promise.reject(failure),
        ),
      ).rejects.toBe(failure);

      const last = events.at(-1);
      expect(last?.label).toBe("tickets.list query failed");
      expect(last?.payloadPreview).toBe("TypeError");
    });
  });

  describe("traceFlowLocal", () => {
    it("emits one timed event per call", async () => {
      const clock = useTestClock();
      const events = collectEvents();
      await traceFlowLocal(
        { lane: "db", label: "SELECT tickets", payloadPreview: "10, 0" },
        async () => {
          clock.advance(12);
          return Promise.resolve(null);
        },
      );

      expect(events).toHaveLength(1);
      expect(events.at(0)?.direction).toBe("local");
      expect(events.at(0)?.durationMs).toBe(12);
      expect(events.at(0)?.payloadPreview).toBe("10, 0");
    });

    it("emits a failure event and rethrows", async () => {
      useTestClock();
      const events = collectEvents();
      const failure = new RangeError("nope");

      await expect(
        traceFlowLocal({ lane: "crypto", label: "decrypt title" }, () =>
          Promise.reject(failure),
        ),
      ).rejects.toBe(failure);

      expect(events.at(-1)?.label).toBe("decrypt title failed");
    });
  });

  describe("previews", () => {
    it("collapses whitespace and clamps long previews", () => {
      const preview = truncateFlowPreview(`a${"b".repeat(300)}`, 10);
      expect(preview).toHaveLength(10);
      expect(preview.endsWith("...")).toBe(true);
      expect(truncateFlowPreview("select  *\n from x")).toBe("select * from x");
    });

    it("clamps previews passed through emit", () => {
      useTestClock();
      const events = collectEvents();
      emitFlowEvent({
        lane: "db",
        direction: "local",
        label: "INSERT tickets",
        payloadPreview: "x".repeat(400),
      });

      expect(events.at(0)?.payloadPreview).toHaveLength(120);
    });
  });

  describe("reset", () => {
    it("clears ids and listeners", () => {
      useTestClock();
      const listener = vi.fn();
      subscribeFlowEvents(listener);
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap sort" });

      resetFlowEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap filters" });

      expect(listener).toHaveBeenCalledTimes(1);
      // After reset, ids restart at 1
      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap again" });
      expect(events.at(0)?.id).toBe(1);
      expect(currentFlowInteractionId()).toBe(1);
    });
  });
});
