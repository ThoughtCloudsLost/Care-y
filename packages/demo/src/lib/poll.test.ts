import { describe, it, expect, vi, afterEach } from "vitest";
import {
  pollUntil,
  POLL_INTERVAL_MS,
  POLL_TIMEOUT_SHORT_MS,
  POLL_TIMEOUT_MEDIUM_MS,
  POLL_TIMEOUT_STANDARD_MS,
} from "./poll.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("pollUntil", () => {
  it("resolves immediately when the probe succeeds on first check", async () => {
    const result = await pollUntil({ probe: () => "found" });
    expect(result).toBe("found");
  });

  it("resolves null on timeout when probe never succeeds", async () => {
    vi.useFakeTimers();
    const promise = pollUntil({
      probe: () => null,
      timeoutMs: 300,
      pollMs: 100,
    });

    // Advance past the timeout
    await vi.advanceTimersByTimeAsync(400);
    const result = await promise;
    expect(result).toBeNull();
  });

  it("resolves null when isStale returns true", async () => {
    vi.useFakeTimers();
    let stale = false;
    const promise = pollUntil({
      probe: () => null,
      isStale: () => stale,
      timeoutMs: 5000,
      pollMs: 100,
    });

    await vi.advanceTimersByTimeAsync(150);
    stale = true;
    await vi.advanceTimersByTimeAsync(150);
    const result = await promise;
    expect(result).toBeNull();
  });

  it("resolves when probe succeeds after several ticks", async () => {
    vi.useFakeTimers();
    let callCount = 0;
    const promise = pollUntil({
      probe: () => {
        callCount += 1;
        return callCount >= 3 ? "done" : null;
      },
      timeoutMs: 5000,
      pollMs: 100,
    });

    // First call is immediate (returns null), then two interval ticks
    await vi.advanceTimersByTimeAsync(250);
    const result = await promise;
    expect(result).toBe("done");
  });
});

describe("timing constants", () => {
  it("exports the expected default values", () => {
    expect(POLL_INTERVAL_MS).toBe(100);
    expect(POLL_TIMEOUT_SHORT_MS).toBe(1500);
    expect(POLL_TIMEOUT_MEDIUM_MS).toBe(4000);
    expect(POLL_TIMEOUT_STANDARD_MS).toBe(5000);
  });
});
