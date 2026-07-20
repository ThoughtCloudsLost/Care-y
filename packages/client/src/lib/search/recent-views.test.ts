import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createRecentViews,
  parsePayload,
  serializePayload,
  type RecentViewEntry,
  type RecentViewsDeps,
  type RecentViewsEnvelope,
} from "./recent-views.js";

/**
 * Fake deps: seal is the identity on the payload (wrappedPayload carries
 * the base64 payload verbatim) so envelope contents stay inspectable
 * without crypto. The clock is injectable per the testing reference.
 */
function makeHarness(overrides?: Partial<RecentViewsDeps>) {
  let time = 1_000;
  const deps: RecentViewsDeps = {
    fetchEnvelope: vi.fn(async () => null),
    pushEnvelope: vi.fn(async () => undefined),
    seal: vi.fn(async (dataB64: string) => ({
      ephemeralPoint: "ep",
      nonce: "n",
      wrappedPayload: dataB64,
    })),
    open: vi.fn(async (envelope: RecentViewsEnvelope) =>
      Promise.resolve(envelope.wrappedPayload),
    ),
    prefetchTickets: vi.fn(async () => undefined),
    now: () => time,
    pushDelayMs: 100,
    ...overrides,
  };
  return {
    deps,
    store: createRecentViews(deps),
    tick: (ms: number): void => {
      time += ms;
    },
  };
}

function envelopeOf(entries: readonly RecentViewEntry[]): RecentViewsEnvelope {
  return {
    ephemeralPoint: "ep",
    nonce: "n",
    wrappedPayload: serializePayload(entries),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("serializePayload / parsePayload", () => {
  it("roundtrips entries", () => {
    const entries: RecentViewEntry[] = [
      { type: "ticket", id: "t-1", viewedAt: 100 },
      { type: "article", id: "a-1", viewedAt: 200 },
    ];
    expect(parsePayload(serializePayload(entries))).toEqual(entries);
  });

  it("returns empty for malformed base64", () => {
    expect(parsePayload("not base64!!")).toEqual([]);
  });

  it("returns empty for non-payload JSON", () => {
    const encoded = serializePayload([]);
    expect(parsePayload(encoded)).toEqual([]);
    const garbage = btoa(JSON.stringify({ v: 99, entries: [{}] }));
    expect(parsePayload(garbage)).toEqual([]);
  });

  it("drops malformed entries but keeps valid ones", () => {
    const mixed = btoa(
      JSON.stringify({
        v: 1,
        entries: [
          { type: "ticket", id: "t-1", viewedAt: 100 },
          { type: "queue", id: "q-1", viewedAt: 100 },
          { type: "ticket", id: "", viewedAt: 100 },
          { type: "ticket", id: "t-2", viewedAt: "soon" },
        ],
      }),
    );
    expect(parsePayload(mixed)).toEqual([
      { type: "ticket", id: "t-1", viewedAt: 100 },
    ]);
  });
});

describe("record", () => {
  it("orders entries most recently viewed first and dedupes", () => {
    const { store, tick } = makeHarness();
    store.record("ticket", "t-1");
    tick(10);
    store.record("ticket", "t-2");
    tick(10);
    store.record("ticket", "t-1");

    expect(store.entries.map((e) => e.id)).toEqual(["t-1", "t-2"]);
  });

  it("caps each type at 10 entries, dropping the oldest", () => {
    const { store, tick } = makeHarness();
    for (let i = 1; i <= 12; i++) {
      store.record("ticket", `t-${String(i)}`);
      tick(1);
    }
    const ids = store.entriesOf("ticket").map((e) => e.id);
    expect(ids).toHaveLength(10);
    expect(ids[0]).toBe("t-12");
    expect(ids).not.toContain("t-1");
    expect(ids).not.toContain("t-2");
  });

  it("filters entriesOf by type", () => {
    const { store, tick } = makeHarness();
    store.record("ticket", "t-1");
    tick(1);
    store.record("article", "a-1");

    expect(store.entriesOf("ticket").map((e) => e.id)).toEqual(["t-1"]);
    expect(store.entriesOf("article").map((e) => e.id)).toEqual(["a-1"]);
  });
});

describe("debounced push", () => {
  it("seals and pushes once after the debounce window", async () => {
    vi.useFakeTimers();
    const { store, deps, tick } = makeHarness();

    store.record("ticket", "t-1");
    tick(5);
    store.record("article", "a-1");

    expect(deps.pushEnvelope).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);

    expect(deps.pushEnvelope).toHaveBeenCalledTimes(1);
    const pushed = vi.mocked(deps.pushEnvelope).mock.calls.at(-1)?.[0];
    expect(pushed).toBeDefined();
    const entries = parsePayload(pushed?.wrappedPayload ?? "");
    expect(entries.map((e) => e.id)).toEqual(["a-1", "t-1"]);
  });

  it("reschedules automatically after a failed push", async () => {
    vi.useFakeTimers();
    const pushEnvelope = vi
      .fn(async () => undefined)
      .mockRejectedValueOnce(new Error("offline"));
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const { store, deps } = makeHarness({ pushEnvelope });

    store.record("ticket", "t-1");
    await vi.advanceTimersByTimeAsync(100);
    expect(deps.pushEnvelope).toHaveBeenCalledTimes(1);

    // The failed push marks the state dirty and reschedules itself.
    await vi.advanceTimersByTimeAsync(100);
    expect(deps.pushEnvelope).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("push failed"),
      "offline",
    );
    warnSpy.mockRestore();
  });

  it("clear cancels a pending push", async () => {
    vi.useFakeTimers();
    const { store, deps } = makeHarness();

    store.record("ticket", "t-1");
    store.clear();
    await vi.advanceTimersByTimeAsync(200);

    expect(deps.pushEnvelope).not.toHaveBeenCalled();
    expect(store.entries).toEqual([]);
  });
});

describe("ensureHydrated", () => {
  it("merges server entries under newer local ones", async () => {
    vi.useFakeTimers();
    const server = envelopeOf([
      { type: "ticket", id: "t-local", viewedAt: 50 },
      { type: "article", id: "a-server", viewedAt: 60 },
    ]);
    const { store } = makeHarness({
      fetchEnvelope: vi.fn(async () => server),
    });

    // Recorded before hydration: the local timestamp must win.
    store.record("ticket", "t-local");
    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    const entries = store.entries;
    expect(entries.map((e) => e.id)).toEqual(["t-local", "a-server"]);
    const local = entries.find((e) => e.id === "t-local");
    expect(local?.viewedAt).toBe(1_000);
  });

  it("hydrates only once per session", async () => {
    vi.useFakeTimers();
    const fetchEnvelope = vi.fn(async () => null);
    const { store } = makeHarness({ fetchEnvelope });

    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);
    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(fetchEnvelope).toHaveBeenCalledTimes(1);
  });

  it("treats an unopenable envelope as empty history", async () => {
    vi.useFakeTimers();
    const { store, deps } = makeHarness({
      fetchEnvelope: vi.fn(async () =>
        envelopeOf([{ type: "ticket", id: "t-old", viewedAt: 10 }]),
      ),
      open: vi.fn(async () => Promise.reject(new Error("UNWRAP_FAILED"))),
    });

    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(store.entries).toEqual([]);
    expect(deps.prefetchTickets).not.toHaveBeenCalled();
  });

  it("retries hydration after a fetch failure when clear resets state", async () => {
    vi.useFakeTimers();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const fetchEnvelope = vi
      .fn(async () => null)
      .mockRejectedValueOnce(new Error("offline"));
    const { store } = makeHarness({ fetchEnvelope });

    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);
    // After failure, hydration is "done" to prevent tight retry loops.
    // A second ensureHydrated without clear is a no-op.
    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchEnvelope).toHaveBeenCalledTimes(1);

    // clear() resets hydration to "idle", allowing retry.
    store.clear();
    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchEnvelope).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });

  it("prefetches hydrated ticket rows", async () => {
    vi.useFakeTimers();
    const { store, deps } = makeHarness({
      fetchEnvelope: vi.fn(async () =>
        envelopeOf([
          { type: "ticket", id: "t-1", viewedAt: 10 },
          { type: "article", id: "a-1", viewedAt: 20 },
          { type: "ticket", id: "t-2", viewedAt: 30 },
        ]),
      ),
    });

    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(deps.prefetchTickets).toHaveBeenCalledWith(["t-2", "t-1"]);
  });

  it("pushes local pre-hydration views after merging", async () => {
    vi.useFakeTimers();
    const { store, deps } = makeHarness({
      fetchEnvelope: vi.fn(async () =>
        envelopeOf([{ type: "article", id: "a-server", viewedAt: 5 }]),
      ),
    });

    store.record("ticket", "t-local");
    store.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(deps.pushEnvelope).toHaveBeenCalledTimes(1);
    const pushed = vi.mocked(deps.pushEnvelope).mock.calls.at(-1)?.[0];
    const entries = parsePayload(pushed?.wrappedPayload ?? "");
    expect(entries.map((e) => e.id)).toEqual(["t-local", "a-server"]);
  });
});
