import { describe, it, expect, vi, afterEach } from "vitest";
import { createDedupStore } from "./dedup-store.js";

describe("createDedupStore", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports a new SID as not duplicate", () => {
    const store = createDedupStore(5000, () => 1000);
    expect(store.isDuplicate("SM-abc")).toBe(false);
    store.stop();
  });

  it("reports a processed SID as duplicate", () => {
    const store = createDedupStore(5000, () => 1000);
    store.markProcessed("SM-abc");
    expect(store.isDuplicate("SM-abc")).toBe(true);
    store.stop();
  });

  it("treats a different SID as not duplicate", () => {
    const store = createDedupStore(5000, () => 1000);
    store.markProcessed("SM-abc");
    expect(store.isDuplicate("SM-xyz")).toBe(false);
    store.stop();
  });

  it("reports SID as not duplicate after TTL expires", () => {
    let time = 1000;
    const store = createDedupStore(5000, () => time);

    store.markProcessed("SM-abc");
    expect(store.isDuplicate("SM-abc")).toBe(true);

    // Advance past TTL
    time += 5000;
    expect(store.isDuplicate("SM-abc")).toBe(false);
    store.stop();
  });

  it("removes expired entries during cleanup cycle", () => {
    vi.useFakeTimers();
    let time = 1000;
    const store = createDedupStore(5000, () => time);

    store.markProcessed("SM-old");

    // Advance the injectable clock past TTL
    time += 6000;

    // Advance the interval timer to trigger cleanup (60s)
    vi.advanceTimersByTime(60_000);

    // Entry was pruned by cleanup; isDuplicate should return false
    expect(store.isDuplicate("SM-old")).toBe(false);
    store.stop();
  });

  it("clears all entries on stop", () => {
    const store = createDedupStore(5000, () => 1000);
    store.markProcessed("SM-abc");
    store.markProcessed("SM-xyz");

    store.stop();

    expect(store.isDuplicate("SM-abc")).toBe(false);
    expect(store.isDuplicate("SM-xyz")).toBe(false);
  });
});
