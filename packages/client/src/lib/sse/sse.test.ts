import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleEvent, type SSEEvent } from "./index.svelte.js";
import type { QueryClient } from "@tanstack/svelte-query";

function createMockQueryClient(): QueryClient {
  return {
    invalidateQueries: vi.fn(),
  } as unknown as QueryClient;
}

describe("handleEvent", () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = createMockQueryClient();
  });

  it("invalidates tickets list on ticket:created", () => {
    handleEvent({ type: "ticket:created" }, qc);

    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["tickets"],
    });
  });

  it("invalidates tickets list on ticket:updated", () => {
    handleEvent({ type: "ticket:updated" }, qc);

    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["tickets"],
    });
  });

  it("invalidates specific ticket when ticketId is provided", () => {
    handleEvent({ type: "ticket:updated", ticketId: "t-123" }, qc);

    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["tickets"],
    });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["ticket", "t-123"],
    });
  });

  it("does not invalidate specific ticket when ticketId is absent", () => {
    handleEvent({ type: "ticket:created" }, qc);

    expect(qc.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["tickets"],
    });
  });

  it("invalidates kb on kb:updated", () => {
    handleEvent({ type: "kb:updated" }, qc);

    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["kb"],
    });
  });

  it("invalidates notifications on notification event", () => {
    handleEvent({ type: "notification" }, qc);

    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["notifications"],
    });
  });

  it("invalidates follow-ups for specific ticket on followup:created", () => {
    handleEvent({ type: "followup:created", ticketId: "t-789" }, qc);

    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["ticket", "t-789", "followUps"],
    });
  });

  it("does not invalidate when followup:created has no ticketId", () => {
    handleEvent({ type: "followup:created" }, qc);

    expect(qc.invalidateQueries).not.toHaveBeenCalled();
  });

  it("does nothing for unknown event types", () => {
    handleEvent({ type: "unknown:event" }, qc);

    expect(qc.invalidateQueries).not.toHaveBeenCalled();
  });
});

describe("createSSEListener", () => {
  let mockEventSource: {
    onopen: (() => void) | null;
    onmessage: ((event: { data: string }) => void) | null;
    onerror: (() => void) | null;
    close: ReturnType<typeof vi.fn>;
    url: string;
    withCredentials: boolean;
  };
  let constructorCalls: Array<{ url: string; opts: unknown }>;

  beforeEach(() => {
    vi.useFakeTimers();
    constructorCalls = [];

    mockEventSource = {
      onopen: null,
      onmessage: null,
      onerror: null,
      close: vi.fn(),
      url: "",
      withCredentials: false,
    };

    // EventSource is used with `new`, so the mock must be a constructor.
    // A regular function works as a constructor when called with `new` as
    // long as it returns an object.
    function MockEventSource(
      this: unknown,
      url: string,
      opts?: { withCredentials?: boolean },
    ): typeof mockEventSource {
      mockEventSource.url = url;
      mockEventSource.withCredentials = opts?.withCredentials ?? false;
      constructorCalls.push({ url, opts });
      return mockEventSource;
    }

    vi.stubGlobal("EventSource", MockEventSource);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // Import dynamically after mocks are set up, because the module uses $state.
  async function importListener() {
    return await import("./index.svelte.js");
  }

  it("creates EventSource with correct URL and credentials", async () => {
    const { createSSEListener } = await importListener();
    const qc = createMockQueryClient();

    const listener = createSSEListener({
      url: "/sse/events",
      queryClient: qc,
    });
    listener.connect();

    expect(constructorCalls).toEqual([
      { url: "/sse/events", opts: { withCredentials: true } },
    ]);
  });

  it("calls onConnectionChange(true) on open", async () => {
    const { createSSEListener } = await importListener();
    const qc = createMockQueryClient();
    const onChange = vi.fn();

    const listener = createSSEListener({
      url: "/sse/events",
      queryClient: qc,
      onConnectionChange: onChange,
    });
    listener.connect();
    mockEventSource.onopen?.();

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onConnectionChange(false) on error and schedules reconnect", async () => {
    const { createSSEListener } = await importListener();
    const qc = createMockQueryClient();
    const onChange = vi.fn();

    const listener = createSSEListener({
      url: "/sse/events",
      queryClient: qc,
      onConnectionChange: onChange,
    });
    listener.connect();
    mockEventSource.onerror?.();

    expect(onChange).toHaveBeenCalledWith(false);
    expect(mockEventSource.close).toHaveBeenCalled();
  });

  it("reconnects with exponential backoff", async () => {
    const { createSSEListener } = await importListener();
    const qc = createMockQueryClient();

    const listener = createSSEListener({
      url: "/sse/events",
      queryClient: qc,
    });
    listener.connect();

    // First error: reconnect at 1s
    mockEventSource.onerror?.();
    expect(constructorCalls).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(constructorCalls).toHaveLength(2);

    // Second error: reconnect at 2s
    mockEventSource.onerror?.();
    vi.advanceTimersByTime(1000);
    expect(constructorCalls).toHaveLength(2); // not yet
    vi.advanceTimersByTime(1000);
    expect(constructorCalls).toHaveLength(3);
  });

  it("caps backoff at 30 seconds", async () => {
    const { createSSEListener } = await importListener();
    const qc = createMockQueryClient();

    const listener = createSSEListener({
      url: "/sse/events",
      queryClient: qc,
    });
    listener.connect();

    // Trigger many errors to push backoff past 30s
    for (let i = 0; i < 10; i++) {
      mockEventSource.onerror?.();
      vi.advanceTimersByTime(30_000);
    }

    // After 10 errors, backoff should be capped at 30s, not 2^10 = 1024s
    const callCount = constructorCalls.length;
    mockEventSource.onerror?.();
    vi.advanceTimersByTime(30_000);
    expect(constructorCalls).toHaveLength(callCount + 1);
  });

  it("resets reconnect attempt counter on successful open", async () => {
    const { createSSEListener } = await importListener();
    const qc = createMockQueryClient();

    const listener = createSSEListener({
      url: "/sse/events",
      queryClient: qc,
    });
    listener.connect();

    // Error, reconnect after 1s
    mockEventSource.onerror?.();
    vi.advanceTimersByTime(1000);

    // Successful open resets counter
    mockEventSource.onopen?.();

    // Next error should reconnect at 1s again (not 2s)
    mockEventSource.onerror?.();
    vi.advanceTimersByTime(1000);
    expect(constructorCalls).toHaveLength(3);
  });

  it("disconnect closes EventSource and clears reconnect timer", async () => {
    const { createSSEListener } = await importListener();
    const qc = createMockQueryClient();

    const listener = createSSEListener({
      url: "/sse/events",
      queryClient: qc,
    });
    listener.connect();
    mockEventSource.onerror?.(); // triggers reconnect timer

    listener.disconnect();

    // Verify no reconnect happens
    vi.advanceTimersByTime(60_000);
    // Only 1 call (initial connect), no reconnect after disconnect
    expect(constructorCalls).toHaveLength(1);
  });

  it("does not create duplicate EventSource on double connect", async () => {
    const { createSSEListener } = await importListener();
    const qc = createMockQueryClient();

    const listener = createSSEListener({
      url: "/sse/events",
      queryClient: qc,
    });
    listener.connect();
    listener.connect();

    expect(constructorCalls).toHaveLength(1);
  });

  it("handles malformed SSE message data without crashing", async () => {
    const { createSSEListener } = await importListener();
    const qc = createMockQueryClient();

    const listener = createSSEListener({
      url: "/sse/events",
      queryClient: qc,
    });
    listener.connect();
    mockEventSource.onopen?.();

    // Send malformed JSON, should not throw
    mockEventSource.onmessage?.({ data: "not-json{{{" });

    expect(qc.invalidateQueries).not.toHaveBeenCalled();
  });

  it("dispatches valid SSE messages to handleEvent", async () => {
    const { createSSEListener } = await importListener();
    const qc = createMockQueryClient();

    const listener = createSSEListener({
      url: "/sse/events",
      queryClient: qc,
    });
    listener.connect();
    mockEventSource.onopen?.();

    const event: SSEEvent = { type: "ticket:created", ticketId: "t-456" };
    mockEventSource.onmessage?.({ data: JSON.stringify(event) });

    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["tickets"],
    });
    expect(qc.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["ticket", "t-456"],
    });
  });
});
