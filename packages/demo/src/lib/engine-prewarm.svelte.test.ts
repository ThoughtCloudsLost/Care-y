import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createEnginePrewarm,
  PREWARM_ROOT_MARGIN,
} from "./engine-prewarm.svelte.js";

// -----------------------------------------------------------------------
// IntersectionObserver stub
// -----------------------------------------------------------------------

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

interface FakeObserver {
  callback: IOCallback;
  options: IntersectionObserverInit | undefined;
  observed: Set<Element>;
  disconnect: ReturnType<typeof vi.fn>;
}

function installFakeIO(): { observers: FakeObserver[] } {
  const observers: FakeObserver[] = [];

  const FakeIntersectionObserver = vi.fn(function (
    this: FakeObserver,
    callback: IOCallback,
    options?: IntersectionObserverInit,
  ) {
    this.callback = callback;
    this.options = options;
    this.observed = new Set();
    this.disconnect = vi.fn(() => {
      this.observed.clear();
    });
    observers.push(this);
  });

  FakeIntersectionObserver.prototype.observe = function (
    this: FakeObserver,
    el: Element,
  ): void {
    this.observed.add(el);
  };

  FakeIntersectionObserver.prototype.unobserve = function (
    this: FakeObserver,
    el: Element,
  ): void {
    this.observed.delete(el);
  };

  FakeIntersectionObserver.prototype.disconnect = function (
    this: FakeObserver,
  ): void {
    this.observed.clear();
  };

  globalThis.IntersectionObserver =
    FakeIntersectionObserver as unknown as typeof IntersectionObserver;

  return { observers };
}

/** Fire an intersection entry on the most recently created observer. */
function fireEntry(
  obs: FakeObserver,
  target: Element,
  isIntersecting: boolean,
): void {
  obs.callback([
    { target, isIntersecting } as unknown as IntersectionObserverEntry,
  ]);
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe("createEnginePrewarm", () => {
  let savedIO: typeof globalThis.IntersectionObserver | undefined;

  beforeEach(() => {
    savedIO = globalThis.IntersectionObserver;
  });

  afterEach(() => {
    if (savedIO !== undefined) {
      globalThis.IntersectionObserver = savedIO;
    } else {
      // Restore the absent state for the fallback test
      delete (globalThis as Record<string, unknown>).IntersectionObserver;
    }
  });

  it("starts cold", () => {
    installFakeIO();
    const pw = createEnginePrewarm();
    expect(pw.warm).toBe(false);
    pw.destroy();
  });

  it("latches warm on the first intersection", () => {
    const { observers } = installFakeIO();
    const pw = createEnginePrewarm();

    const el = document.createElement("div");
    pw.observe(el);
    expect(observers).toHaveLength(1);

    fireEntry(observers[0]!, el, true);
    expect(pw.warm).toBe(true);
    pw.destroy();
  });

  it("ignores non-intersecting entries", () => {
    const { observers } = installFakeIO();
    const pw = createEnginePrewarm();

    const el = document.createElement("div");
    pw.observe(el);
    fireEntry(observers[0]!, el, false);
    expect(pw.warm).toBe(false);
    pw.destroy();
  });

  it("stays warm once latched (one-way)", () => {
    const { observers } = installFakeIO();
    const pw = createEnginePrewarm();

    const el = document.createElement("div");
    pw.observe(el);
    fireEntry(observers[0]!, el, true);

    // A non-intersecting entry after the latch changes nothing
    // (observer is disconnected, but even if it fired it would not unlatch)
    expect(pw.warm).toBe(true);
    pw.destroy();
  });

  it("disconnects the observer on latch", () => {
    const { observers } = installFakeIO();
    const pw = createEnginePrewarm();

    const el = document.createElement("div");
    pw.observe(el);
    const obs = observers[0]!;

    fireEntry(obs, el, true);
    expect(obs.disconnect).toHaveBeenCalledTimes(1);
    pw.destroy();
  });

  it("accepts multiple observed elements and any can trip the latch", () => {
    const { observers } = installFakeIO();
    const pw = createEnginePrewarm();

    const el1 = document.createElement("div");
    const el2 = document.createElement("div");
    pw.observe(el1);
    pw.observe(el2);

    const obs = observers[0]!;
    expect(obs.observed.size).toBe(2);

    // Second element triggers
    fireEntry(obs, el2, true);
    expect(pw.warm).toBe(true);
    pw.destroy();
  });

  it("does not double-observe the same element", () => {
    const { observers } = installFakeIO();
    const pw = createEnginePrewarm();

    const el = document.createElement("div");
    pw.observe(el);
    pw.observe(el);

    expect(observers[0]!.observed.size).toBe(1);
    pw.destroy();
  });

  it("skips observe after the latch fires", () => {
    const { observers } = installFakeIO();
    const pw = createEnginePrewarm();

    const el1 = document.createElement("div");
    pw.observe(el1);
    fireEntry(observers[0]!, el1, true);

    // New observe after latch is a no-op
    const el2 = document.createElement("div");
    pw.observe(el2);
    // Observer was disconnected; no new observers created
    expect(observers).toHaveLength(1);
    pw.destroy();
  });

  it("skips observe(undefined) without error", () => {
    installFakeIO();
    const pw = createEnginePrewarm();
    expect(() => {
      pw.observe(undefined);
    }).not.toThrow();
    pw.destroy();
  });

  it("passes the expected rootMargin to the observer", () => {
    const { observers } = installFakeIO();
    const pw = createEnginePrewarm();

    // Force observer creation by observing an element
    const el = document.createElement("div");
    pw.observe(el);

    expect(observers[0]!.options?.rootMargin).toBe(PREWARM_ROOT_MARGIN);
    pw.destroy();
  });

  it("destroy is idempotent", () => {
    installFakeIO();
    const pw = createEnginePrewarm();
    pw.destroy();
    expect(() => {
      pw.destroy();
    }).not.toThrow();
  });

  it("skips observe after destroy", () => {
    const { observers } = installFakeIO();
    const pw = createEnginePrewarm();
    pw.destroy();

    const el = document.createElement("div");
    pw.observe(el);

    // Observer was created during construction but disconnected;
    // no element was added after destroy
    expect(observers[0]!.observed.size).toBe(0);
  });
});

// -----------------------------------------------------------------------
// Missing IntersectionObserver fallback
// -----------------------------------------------------------------------

describe("createEnginePrewarm (no IntersectionObserver)", () => {
  let savedIO: typeof globalThis.IntersectionObserver | undefined;

  beforeEach(() => {
    savedIO = globalThis.IntersectionObserver;
    delete (globalThis as Record<string, unknown>).IntersectionObserver;
  });

  afterEach(() => {
    if (savedIO !== undefined) {
      globalThis.IntersectionObserver = savedIO;
    }
  });

  it("latches warm immediately when IntersectionObserver is unavailable", () => {
    const pw = createEnginePrewarm();
    expect(pw.warm).toBe(true);
    pw.destroy();
  });

  it("observe is safe when IntersectionObserver is unavailable", () => {
    const pw = createEnginePrewarm();
    const el = document.createElement("div");
    expect(() => {
      pw.observe(el);
    }).not.toThrow();
    pw.destroy();
  });
});
