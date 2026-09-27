import { describe, it, expect, vi, afterEach } from "vitest";
import { cacheRegistry } from "$lib/crypto/cache-registry.js";
import {
  createSyncedSelfBlob,
  type SelfBlobEnvelope,
  type SyncedSelfBlobDeps,
} from "./synced-self-blob.svelte.js";
import {
  createFakeSelfBlobTransport,
  deferred,
  envelopeOf,
  lastPushedJson,
} from "$mocks/fake-self-blob-transport.js";

interface CounterDoc {
  readonly v: 1;
  readonly count: number;
}

function parseCounter(json: unknown): CounterDoc | null {
  if (typeof json !== "object" || json === null) return null;
  if (!("v" in json) || json.v !== 1) return null;
  if (!("count" in json) || typeof json.count !== "number") return null;
  return { v: 1, count: json.count };
}

function makeHarness(overrides?: Partial<SyncedSelfBlobDeps<CounterDoc>>) {
  const deps: SyncedSelfBlobDeps<CounterDoc> = {
    cacheName: "TestSelfBlob",
    logTag: "test-self-blob",
    ...createFakeSelfBlobTransport(),
    parse: parseCounter,
    serialize: (value) => value,
    defaultValue: () => ({ v: 1, count: 0 }),
    pushDelayMs: 100,
    ...overrides,
  };
  return { deps, blob: createSyncedSelfBlob(deps) };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("hydration", () => {
  it("loads the stored document", async () => {
    vi.useFakeTimers();
    const { blob } = makeHarness({
      fetchEnvelope: vi.fn(async () => envelopeOf({ v: 1, count: 7 })),
    });

    expect(blob.hydrated).toBe(false);
    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(blob.hydrated).toBe(true);
    expect(blob.value).toEqual({ v: 1, count: 7 });
  });

  it("hydrates only once per session", async () => {
    vi.useFakeTimers();
    const fetchEnvelope = vi.fn(async () => null);
    const { blob } = makeHarness({ fetchEnvelope });

    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);
    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(fetchEnvelope).toHaveBeenCalledTimes(1);
  });

  it("keeps a local change made before hydration and pushes it", async () => {
    vi.useFakeTimers();
    const { blob, deps } = makeHarness({
      fetchEnvelope: vi.fn(async () => envelopeOf({ v: 1, count: 7 })),
    });

    blob.update((doc) => ({ ...doc, count: 42 }));
    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(blob.value.count).toBe(42);
    expect(deps.pushEnvelope).toHaveBeenCalledTimes(1);
    expect(lastPushedJson(deps)).toEqual({ v: 1, count: 42 });
  });

  it("keeps a local change whose push landed before hydration", async () => {
    vi.useFakeTimers();
    const fetched = deferred<SelfBlobEnvelope | null>();
    const { blob } = makeHarness({
      fetchEnvelope: vi.fn(async () => fetched.promise),
    });

    blob.ensureHydrated();
    blob.update((doc) => ({ ...doc, count: 42 }));
    await blob.flush();
    fetched.resolve(envelopeOf({ v: 1, count: 7 }));
    await vi.advanceTimersByTimeAsync(0);

    expect(blob.value.count).toBe(42);
  });

  it("uses the injected merge when provided", async () => {
    vi.useFakeTimers();
    const merge = vi.fn(
      (local: CounterDoc, remote: CounterDoc): CounterDoc => ({
        v: 1,
        count: local.count + remote.count,
      }),
    );
    const { blob } = makeHarness({
      fetchEnvelope: vi.fn(async () => envelopeOf({ v: 1, count: 7 })),
      merge,
    });

    blob.update((doc) => ({ ...doc, count: 3 }));
    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(merge).toHaveBeenCalledWith({ v: 1, count: 3 }, { v: 1, count: 7 });
    expect(blob.value.count).toBe(10);
  });

  it("calls onHydrated with the merged document", async () => {
    vi.useFakeTimers();
    const onHydrated = vi.fn();
    const { blob } = makeHarness({
      fetchEnvelope: vi.fn(async () => envelopeOf({ v: 1, count: 7 })),
      onHydrated,
    });

    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(onHydrated).toHaveBeenCalledWith({ v: 1, count: 7 });
  });

  it("falls back to the default for a payload that fails parse", async () => {
    vi.useFakeTimers();
    const { blob } = makeHarness({
      fetchEnvelope: vi.fn(async () => envelopeOf({ v: 99, count: 7 })),
    });

    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(blob.hydrated).toBe(true);
    expect(blob.value).toEqual({ v: 1, count: 0 });
  });

  it("falls back to the default for a payload that is not JSON", async () => {
    vi.useFakeTimers();
    const { blob } = makeHarness({
      fetchEnvelope: vi.fn(async () => ({
        ephemeralPoint: "ep",
        nonce: "n",
        wrappedPayload: btoa("not json {"),
      })),
    });

    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);

    expect(blob.value).toEqual({ v: 1, count: 0 });
  });

  it("falls back to the default for an unopenable envelope and overwrites it on the next push", async () => {
    vi.useFakeTimers();
    const { blob, deps } = makeHarness({
      fetchEnvelope: vi.fn(async () => envelopeOf({ v: 1, count: 7 })),
      open: vi.fn(async () => Promise.reject(new Error("UNWRAP_FAILED"))),
    });

    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);
    expect(blob.hydrated).toBe(true);
    expect(blob.value).toEqual({ v: 1, count: 0 });
    expect(deps.pushEnvelope).not.toHaveBeenCalled();

    blob.update((doc) => ({ ...doc, count: 1 }));
    await vi.advanceTimersByTimeAsync(100);

    expect(deps.pushEnvelope).toHaveBeenCalledTimes(1);
    expect(lastPushedJson(deps)).toEqual({ v: 1, count: 1 });
  });

  it("marks hydration done after a fetch failure until clear resets it", async () => {
    vi.useFakeTimers();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const fetchEnvelope = vi
      .fn(async (): Promise<SelfBlobEnvelope | null> => null)
      .mockRejectedValueOnce(new Error("offline"));
    const { blob } = makeHarness({ fetchEnvelope });

    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);
    expect(blob.hydrated).toBe(true);
    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchEnvelope).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("hydration failed"),
      "offline",
    );

    blob.clear();
    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchEnvelope).toHaveBeenCalledTimes(2);
  });

  it("discards a hydration that completes after clear", async () => {
    vi.useFakeTimers();
    const fetched = deferred<SelfBlobEnvelope | null>();
    const { blob } = makeHarness({
      fetchEnvelope: vi.fn(async () => fetched.promise),
    });

    blob.ensureHydrated();
    blob.clear();
    fetched.resolve(envelopeOf({ v: 1, count: 7 }));
    await vi.advanceTimersByTimeAsync(0);

    expect(blob.value).toEqual({ v: 1, count: 0 });
    expect(blob.hydrated).toBe(false);
  });
});

describe("debounced push", () => {
  it("seals and pushes the latest document once after the debounce window", async () => {
    vi.useFakeTimers();
    const { blob, deps } = makeHarness();

    blob.update((doc) => ({ ...doc, count: 1 }));
    await vi.advanceTimersByTimeAsync(50);
    blob.update((doc) => ({ ...doc, count: 2 }));
    await vi.advanceTimersByTimeAsync(50);
    expect(deps.pushEnvelope).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(50);
    expect(deps.pushEnvelope).toHaveBeenCalledTimes(1);
    expect(lastPushedJson(deps)).toEqual({ v: 1, count: 2 });
    expect(blob.saveStatus).toBe("idle");
  });

  it("reports saving while a push is in flight", async () => {
    vi.useFakeTimers();
    const pushed = deferred<undefined>();
    const { blob } = makeHarness({
      pushEnvelope: vi.fn(async () => pushed.promise),
    });

    blob.update((doc) => ({ ...doc, count: 1 }));
    await vi.advanceTimersByTimeAsync(100);
    expect(blob.saveStatus).toBe("saving");

    pushed.resolve(undefined);
    await vi.advanceTimersByTimeAsync(0);
    expect(blob.saveStatus).toBe("idle");
  });

  it("sets the error state on a failed push and retries", async () => {
    vi.useFakeTimers();
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const pushEnvelope = vi
      .fn(async () => undefined)
      .mockRejectedValueOnce(new Error("offline"));
    const { blob, deps } = makeHarness({ pushEnvelope });

    blob.update((doc) => ({ ...doc, count: 1 }));
    await vi.advanceTimersByTimeAsync(100);
    expect(deps.pushEnvelope).toHaveBeenCalledTimes(1);
    expect(blob.saveStatus).toBe("error");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("push failed"),
      "offline",
    );

    // The failed push leaves the document dirty and reschedules itself.
    await vi.advanceTimersByTimeAsync(100);
    expect(deps.pushEnvelope).toHaveBeenCalledTimes(2);
    expect(lastPushedJson(deps)).toEqual({ v: 1, count: 1 });
    expect(blob.saveStatus).toBe("idle");
  });

  it("retries a failed push on flush", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const pushEnvelope = vi
      .fn(async () => undefined)
      .mockRejectedValueOnce(new Error("offline"));
    const { blob, deps } = makeHarness({ pushEnvelope });

    blob.update((doc) => ({ ...doc, count: 1 }));
    await blob.flush();
    expect(blob.saveStatus).toBe("error");

    await blob.flush();
    expect(deps.pushEnvelope).toHaveBeenCalledTimes(2);
    expect(blob.saveStatus).toBe("idle");
  });

  it("does not push when nothing changed", async () => {
    vi.useFakeTimers();
    const { blob, deps } = makeHarness();

    await blob.flush();

    expect(deps.pushEnvelope).not.toHaveBeenCalled();
  });
});

describe("clear", () => {
  it("resets to the default and cancels a pending push", async () => {
    vi.useFakeTimers();
    const { blob, deps } = makeHarness();

    blob.update((doc) => ({ ...doc, count: 1 }));
    blob.clear();
    await vi.advanceTimersByTimeAsync(200);

    expect(deps.pushEnvelope).not.toHaveBeenCalled();
    expect(blob.value).toEqual({ v: 1, count: 0 });
  });

  it("is registered with CacheRegistry under its cache name", async () => {
    vi.useFakeTimers();
    const { blob, deps } = makeHarness({
      cacheName: "TestSelfBlobRegistry",
      fetchEnvelope: vi.fn(async () => envelopeOf({ v: 1, count: 7 })),
    });

    blob.ensureHydrated();
    await vi.advanceTimersByTimeAsync(0);
    blob.update((doc) => ({ ...doc, count: 8 }));
    expect(cacheRegistry.registered).toContain("TestSelfBlobRegistry");

    cacheRegistry.clearAll();
    await vi.advanceTimersByTimeAsync(200);

    expect(blob.value).toEqual({ v: 1, count: 0 });
    expect(blob.hydrated).toBe(false);
    expect(blob.saveStatus).toBe("idle");
    expect(deps.pushEnvelope).not.toHaveBeenCalled();
  });

  it("ignores a push failure that settles after clear", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const pushed = deferred<undefined>();
    const { blob, deps } = makeHarness({
      pushEnvelope: vi.fn(async () => pushed.promise),
    });

    blob.update((doc) => ({ ...doc, count: 1 }));
    await vi.advanceTimersByTimeAsync(100);
    blob.clear();
    pushed.reject(new Error("offline"));
    await vi.advanceTimersByTimeAsync(200);

    expect(deps.pushEnvelope).toHaveBeenCalledTimes(1);
    expect(blob.saveStatus).toBe("idle");
  });
});
