import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  DETAIL_MAX_INPUT_ROWS,
  DETAIL_SOURCE_MAX_CHARS,
  DETAIL_VALUE_MAX_CHARS,
  FLOW_INTERACTION_IDLE_MS,
  beginFlowInteraction,
  buildFlowDetail,
  describeFlowBytes,
  currentFlowInteractionId,
  emitFlowEvent,
  isFlowRecording,
  replayRecordedEvents,
  resetFlowEvents,
  roundFlowDuration,
  setFlowClock,
  startFlowRecording,
  stopFlowRecording,
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
      expect(event?.detail).toBeNull();
      expect(event?.spanId).toBeNull();
    });

    it("stamps the emission time from the injected clock", () => {
      const clock = useTestClock();
      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "first" });
      clock.advance(40);
      emitFlowEvent({ lane: "ui", direction: "up", label: "second" });

      expect(events.at(0)?.at).toBe(0);
      expect(events.at(1)?.at).toBe(40);
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
      const detailThunk = vi.fn(() => buildFlowDetail({ source: "SELECT 1" }));
      // No listener
      emitFlowEvent({
        lane: "db",
        direction: "local",
        label: labelThunk,
        payloadPreview: previewThunk,
        detail: detailThunk,
      });
      expect(labelThunk).not.toHaveBeenCalled();
      expect(previewThunk).not.toHaveBeenCalled();
      // Building a detail walks every bound parameter, which is the most
      // expensive thing to skip when nobody has the band open.
      expect(detailThunk).not.toHaveBeenCalled();
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

  describe("recording mode", () => {
    it("diverts events to the recording buffer instead of listeners", () => {
      useTestClock();
      const events = collectEvents();
      startFlowRecording();
      emitFlowEvent({
        lane: "server",
        direction: "up",
        label: "route auth.getSalt",
        durationMs: 42,
      });
      emitFlowEvent({
        lane: "server",
        direction: "down",
        label: "route auth.getSalt",
        durationMs: 55,
      });
      const recorded = stopFlowRecording();

      // Listeners received nothing during recording
      expect(events).toHaveLength(0);

      // Recording captured both events with resolved fields
      expect(recorded).toHaveLength(2);
      expect(recorded[0]?.label).toBe("route auth.getSalt");
      expect(recorded[0]?.lane).toBe("server");
      expect(recorded[0]?.direction).toBe("up");
      expect(recorded[0]?.durationMs).toBe(42);
      expect(recorded[1]?.direction).toBe("down");
    });

    it("resolves thunks eagerly during recording", () => {
      useTestClock();
      startFlowRecording();
      const labelThunk = vi.fn(() => "thunked label");
      emitFlowEvent({
        lane: "crypto",
        direction: "local",
        label: labelThunk,
        payloadPreview: () => "preview from thunk",
      });
      const recorded = stopFlowRecording();

      expect(labelThunk).toHaveBeenCalledOnce();
      expect(recorded[0]?.label).toBe("thunked label");
      expect(recorded[0]?.payloadPreview).toBe("preview from thunk");
    });

    it("advances ids during recording so post-recording ids are consistent", () => {
      useTestClock();
      startFlowRecording();
      emitFlowEvent({ lane: "ui", direction: "up", label: "recorded" });
      emitFlowEvent({ lane: "ui", direction: "up", label: "recorded 2" });
      stopFlowRecording();

      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "after recording" });
      // Two events consumed ids 1 and 2 during recording
      expect(events[0]?.id).toBe(3);
    });

    it("throws when starting a second concurrent recording", () => {
      useTestClock();
      startFlowRecording();
      expect(() => {
        startFlowRecording();
      }).toThrow("already in progress");
      stopFlowRecording(); // cleanup
    });

    it("throws when stopping with no active recording", () => {
      useTestClock();
      expect(() => stopFlowRecording()).toThrow("No recording");
    });

    it("reports recording state via isFlowRecording", () => {
      useTestClock();
      expect(isFlowRecording()).toBe(false);
      startFlowRecording();
      expect(isFlowRecording()).toBe(true);
      stopFlowRecording();
      expect(isFlowRecording()).toBe(false);
    });

    it("resets recording state via resetFlowEvents", () => {
      useTestClock();
      startFlowRecording();
      resetFlowEvents();
      // After reset, no recording is active
      expect(isFlowRecording()).toBe(false);
      // Starting a new recording works without error
      startFlowRecording();
      stopFlowRecording();
    });
  });

  describe("replayRecordedEvents", () => {
    it("emits recorded events through the normal path with the given seam key", () => {
      useTestClock();
      const events = collectEvents();

      startFlowRecording();
      emitFlowEvent({
        lane: "server",
        direction: "up",
        label: "route auth.getSalt",
        durationMs: 30,
      });
      emitFlowEvent({
        lane: "server",
        direction: "down",
        label: "route auth.getSalt",
        durationMs: 45,
      });
      const recorded = stopFlowRecording();

      // Replay the recorded events
      replayRecordedEvents(recorded, "recorded-derivation");

      expect(events).toHaveLength(2);
      expect(events[0]?.label).toBe("route auth.getSalt");
      expect(events[0]?.seamKey).toBe("recorded-derivation");
      expect(events[0]?.durationMs).toBe(30);
      expect(events[1]?.seamKey).toBe("recorded-derivation");
      expect(events[1]?.durationMs).toBe(45);
    });

    it("attributes replayed events to the current interaction", () => {
      useTestClock();
      const events = collectEvents();

      startFlowRecording();
      emitFlowEvent({
        lane: "server",
        direction: "up",
        label: "route auth.getSalt",
      });
      const recorded = stopFlowRecording();

      // Start a new interaction, then replay
      const interactionId = beginFlowInteraction();
      replayRecordedEvents(recorded, "recorded-derivation");

      expect(events[0]?.interactionId).toBe(interactionId);
    });

    it("preserves real durationMs values from the recording", () => {
      useTestClock();
      const events = collectEvents();

      startFlowRecording();
      emitFlowEvent({
        lane: "server",
        direction: "down",
        label: "route auth.oprfEvaluate",
        durationMs: 137,
      });
      const recorded = stopFlowRecording();

      replayRecordedEvents(recorded, "recorded-derivation");
      expect(events[0]?.durationMs).toBe(137);
    });
  });

  describe("roundFlowDuration", () => {
    it("keeps one decimal below 10ms", () => {
      // Sub-millisecond work is normal on the db and crypto lanes, so
      // flattening it to 0 would report a real query as instant.
      expect(roundFlowDuration(0.37)).toBe(0.4);
      expect(roundFlowDuration(3.2499)).toBe(3.2);
      expect(roundFlowDuration(9.96)).toBe(10);
    });

    it("uses whole milliseconds at 10ms and above", () => {
      expect(roundFlowDuration(12.399999999552965)).toBe(12);
      expect(roundFlowDuration(142.6)).toBe(143);
    });

    it("drops a trailing zero when the value is whole", () => {
      // 5.02 must render "5 ms", not "5.0 ms".
      expect(String(roundFlowDuration(5.02))).toBe("5");
    });

    it("passes null and undefined through", () => {
      expect(roundFlowDuration(null)).toBeNull();
      expect(roundFlowDuration(undefined)).toBeNull();
    });

    it("rejects a non-finite duration", () => {
      expect(roundFlowDuration(Number.NaN)).toBeNull();
      expect(roundFlowDuration(Number.POSITIVE_INFINITY)).toBeNull();
    });

    it("rounds every emitted duration, whatever the producer", () => {
      useTestClock();
      const events = collectEvents();
      emitFlowEvent({
        lane: "db",
        direction: "local",
        label: "SELECT tickets",
        durationMs: 12.399999999552965,
      });

      expect(events.at(0)?.durationMs).toBe(12);
    });
  });

  describe("buildFlowDetail", () => {
    it("classifies by the strongest claim present", () => {
      const detail = buildFlowDetail({
        input: [
          { name: "$1", value: '"open"', kind: "plaintext" },
          { name: "$2", value: "bytes(48)", kind: "ciphertext", bytes: 48 },
          { name: "$3", value: "3", kind: "metadata" },
        ],
      });
      // One ciphertext parameter makes the whole event a ciphertext
      // event: that is the claim worth putting on the card face.
      expect(detail.classification).toBe("ciphertext");
    });

    it("falls back through the kind order when no ciphertext is present", () => {
      expect(
        buildFlowDetail({
          input: [{ name: "slot", value: "title", kind: "identifier" }],
        }).classification,
      ).toBe("identifier");
    });

    it("classifies as null when there are no input rows", () => {
      expect(buildFlowDetail({ source: "SELECT 1" }).classification).toBeNull();
    });

    it("honours an explicit classification over the derived one", () => {
      const detail = buildFlowDetail({
        input: [{ name: "n", value: "1", kind: "metadata" }],
        classification: "key-material",
      });
      expect(detail.classification).toBe("key-material");
    });

    it("caps input rows and says how many it dropped", () => {
      const rows = Array.from(
        { length: DETAIL_MAX_INPUT_ROWS + 5 },
        (_, i) => ({
          name: `$${String(i + 1)}`,
          value: String(i),
          kind: "metadata" as const,
        }),
      );
      const detail = buildFlowDetail({ input: rows });

      // Capped rows plus one row reporting the overflow.
      expect(detail.input).toHaveLength(DETAIL_MAX_INPUT_ROWS + 1);
      expect(detail.input.at(-1)?.value).toBe("+5 more");
    });

    it("does not add an overflow row when nothing was dropped", () => {
      const detail = buildFlowDetail({
        input: [{ name: "$1", value: "1", kind: "metadata" }],
      });
      expect(detail.input).toHaveLength(1);
    });

    it("truncates long values", () => {
      const detail = buildFlowDetail({
        input: [{ name: "$1", value: "x".repeat(200), kind: "plaintext" }],
      });
      expect(detail.input.at(0)?.value).toHaveLength(DETAIL_VALUE_MAX_CHARS);
      expect(detail.input.at(0)?.value.endsWith("...")).toBe(true);
    });

    it("truncates a long source", () => {
      const detail = buildFlowDetail({ source: "s".repeat(900) });
      expect(detail.source).toHaveLength(DETAIL_SOURCE_MAX_CHARS);
    });

    it("keeps a short source and a null source intact", () => {
      expect(buildFlowDetail({ source: "SELECT 1" }).source).toBe("SELECT 1");
      expect(buildFlowDetail({}).source).toBeNull();
    });

    it("preserves the byte count on rows that carry one", () => {
      const detail = buildFlowDetail({
        input: [
          {
            name: "$1",
            value: describeFlowBytes(64),
            kind: "ciphertext",
            bytes: 64,
          },
        ],
      });
      expect(detail.input.at(0)?.bytes).toBe(64);
      expect(detail.input.at(0)?.value).toBe("64 bytes");
    });
  });

  describe("span pairing", () => {
    it("gives both halves of a span the same spanId", async () => {
      useTestClock();
      const events = collectEvents();
      await traceFlowSpan({ lane: "trpc", label: "tickets.list query" }, () =>
        Promise.resolve("ok"),
      );

      const [request, response] = events;
      expect(request?.spanId).toBe(request?.id);
      expect(response?.spanId).toBe(request?.id);
      expect(response?.id).not.toBe(request?.id);
    });

    it("pairs the failure half with its request", async () => {
      useTestClock();
      const events = collectEvents();
      await expect(
        traceFlowSpan({ lane: "trpc", label: "auth.me query" }, () =>
          Promise.reject(new TypeError("boom")),
        ),
      ).rejects.toThrow(TypeError);

      expect(events.at(1)?.spanId).toBe(events.at(0)?.id);
    });

    it("builds the response detail from the settled result", async () => {
      useTestClock();
      const events = collectEvents();
      await traceFlowSpan(
        {
          lane: "server",
          label: "route tickets.list",
          resultDetail: (value: string[]) =>
            buildFlowDetail({
              result: [
                {
                  name: "rows",
                  value: String(value.length),
                  kind: "metadata",
                },
              ],
            }),
        },
        () => Promise.resolve(["a", "b", "c"]),
      );

      expect(events.at(1)?.detail?.result.at(0)?.value).toBe("3");
      // The request half has no result to describe.
      expect(events.at(0)?.detail).toBeNull();
    });

    it("reports a failure through failureDetail without the message", async () => {
      useTestClock();
      const events = collectEvents();
      await expect(
        traceFlowSpan(
          {
            lane: "server",
            label: "route tickets.get",
            failureDetail: () =>
              buildFlowDetail({
                result: [
                  { name: "code", value: "NOT_FOUND", kind: "metadata" },
                ],
              }),
          },
          () => Promise.reject(new TypeError("id 42 was not found")),
        ),
      ).rejects.toThrow(TypeError);

      const failure = events.at(1);
      expect(failure?.detail?.result.at(0)?.value).toBe("NOT_FOUND");
      // The thrown message can embed input values, so it must not travel.
      expect(JSON.stringify(failure)).not.toContain("42");
    });
  });

  describe("local span detail", () => {
    it("builds the whole detail from the settled result", async () => {
      useTestClock();
      const events = collectEvents();
      await traceFlowLocal(
        {
          lane: "db",
          label: "SELECT tickets",
          resultDetail: (rows: number) =>
            buildFlowDetail({
              source: "select * from tickets",
              input: [{ name: "$1", value: "10", kind: "metadata" }],
              result: [
                { name: "returned", value: String(rows), kind: "metadata" },
              ],
            }),
        },
        () => Promise.resolve(7),
      );

      const event = events.at(0);
      expect(event?.detail?.source).toBe("select * from tickets");
      expect(event?.detail?.input).toHaveLength(1);
      expect(event?.detail?.result.at(0)?.value).toBe("7");
    });

    it("falls back to the static detail when there is no resultDetail", async () => {
      useTestClock();
      const events = collectEvents();
      await traceFlowLocal(
        {
          lane: "crypto",
          label: "oprf evaluate",
          detail: buildFlowDetail({ source: "oprf" }),
        },
        () => Promise.resolve(undefined),
      );

      expect(events.at(0)?.detail?.source).toBe("oprf");
    });
  });

  describe("reset", () => {
    it("clears ids and listeners", () => {
      useTestClock();
      const listener = vi.fn();
      subscribeFlowEvents(listener);
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap sort" });

      resetFlowEvents();
      // Subscribe before emitting: ids advance on every emit, observed
      // or not, so the first post-reset emit is the one carrying id 1.
      const events = collectEvents();
      emitFlowEvent({ lane: "ui", direction: "up", label: "tap filters" });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(events.at(0)?.id).toBe(1);
      expect(currentFlowInteractionId()).toBe(1);
    });
  });
});
