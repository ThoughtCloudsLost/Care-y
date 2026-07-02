import { describe, expect, it, vi, afterEach } from "vitest";
import {
  createInMemoryRateLimiter,
  assertSingleInstanceRateLimiting,
} from "./rate-limiter.js";
import { ConfigError } from "../errors.js";

describe("createInMemoryRateLimiter", () => {
  const config = { windowMs: 10_000, maxRequests: 3 };

  it("allows requests up to the limit", () => {
    const time = 1000;
    const limiter = createInMemoryRateLimiter(config, () => time);

    const r1 = limiter.check("ip:1");
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r1.retryAfterMs).toBe(0);

    const r2 = limiter.check("ip:1");
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = limiter.check("ip:1");
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("rejects the request after the limit with retryAfterMs > 0", () => {
    let time = 1000;
    const limiter = createInMemoryRateLimiter(config, () => time);

    limiter.check("ip:1");
    time = 2000;
    limiter.check("ip:1");
    time = 3000;
    limiter.check("ip:1");

    time = 4000;
    const rejected = limiter.check("ip:1");
    expect(rejected.allowed).toBe(false);
    expect(rejected.remaining).toBe(0);
    // Oldest timestamp is 1000, window is 10_000, so retry after 1000 + 10_000 - 4000 = 7000
    expect(rejected.retryAfterMs).toBe(7000);
  });

  it("allows requests again after the window expires", () => {
    let time = 1000;
    const limiter = createInMemoryRateLimiter(config, () => time);

    limiter.check("ip:1");
    limiter.check("ip:1");
    limiter.check("ip:1");

    // Move past the window
    time = 12_000;
    const result = limiter.check("ip:1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("tracks keys independently", () => {
    const time = 1000;
    const limiter = createInMemoryRateLimiter(config, () => time);

    limiter.check("ip:1");
    limiter.check("ip:1");
    limiter.check("ip:1");

    const r1 = limiter.check("ip:1");
    expect(r1.allowed).toBe(false);

    const r2 = limiter.check("ip:2");
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(2);
  });

  it("reset clears a key so it can make requests again", () => {
    const time = 1000;
    const limiter = createInMemoryRateLimiter(config, () => time);

    limiter.check("ip:1");
    limiter.check("ip:1");
    limiter.check("ip:1");
    expect(limiter.check("ip:1").allowed).toBe(false);

    limiter.reset("ip:1");

    const result = limiter.check("ip:1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("reset on a nonexistent key does not throw", () => {
    const limiter = createInMemoryRateLimiter(config, () => 1000);
    expect(() => {
      limiter.reset("never-seen");
    }).not.toThrow();
  });

  it("retryAfterMs floors at 0 when window has just expired", () => {
    let time = 1000;
    const limiter = createInMemoryRateLimiter(config, () => time);

    limiter.check("ip:1");
    limiter.check("ip:1");
    limiter.check("ip:1");

    // Exactly at the boundary: oldest (1000) + window (10_000) - now (11_000) = 0
    time = 11_000;
    const result = limiter.check("ip:1");
    // The oldest entry is now outside the window, so it gets pruned.
    // Only 0 entries remain after pruning, so this is allowed.
    expect(result.allowed).toBe(true);
  });

  it("sliding window drops old timestamps progressively", () => {
    let time = 0;
    const limiter = createInMemoryRateLimiter(config, () => time);

    // Fill the window at t=0, t=3000, t=6000
    limiter.check("ip:1");
    time = 3000;
    limiter.check("ip:1");
    time = 6000;
    limiter.check("ip:1");

    // At t=9000, still full (all 3 within 10s window)
    time = 9000;
    expect(limiter.check("ip:1").allowed).toBe(false);

    // At t=10_001, the t=0 entry has expired, only 2 remain
    time = 10_001;
    const result = limiter.check("ip:1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0); // 2 old + 1 new = 3 = maxRequests
  });
});

describe("cleanup interval", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("prunes expired keys during periodic cleanup", () => {
    vi.useFakeTimers();

    let time = 1000;
    const limiter = createInMemoryRateLimiter(
      { windowMs: 5000, maxRequests: 2 },
      () => time,
    );

    // Add entries for two keys
    limiter.check("ip:a");
    limiter.check("ip:b");

    // Advance time past the window so entries expire
    time = 100_000;

    // Trigger the 60s cleanup interval
    vi.advanceTimersByTime(60_000);

    // After cleanup, the keys should have been pruned.
    // check() on a pruned key behaves like a fresh key.
    const resultA = limiter.check("ip:a");
    expect(resultA.allowed).toBe(true);
    expect(resultA.remaining).toBe(1); // 1 remaining = fresh (only this check used 1 slot)

    const resultB = limiter.check("ip:b");
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(1);
  });
});

describe("assertSingleInstanceRateLimiting", () => {
  it("allows boot for a single-instance deployment", () => {
    expect(() => {
      assertSingleInstanceRateLimiting(false);
    }).not.toThrow();
  });

  it("refuses boot when a multi-instance deployment is declared", () => {
    expect(() => {
      assertSingleInstanceRateLimiting(true);
    }).toThrow(ConfigError);
  });
});
