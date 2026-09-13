/**
 * Unit tests for the portal rate-limit error guard.
 *
 * Covers: both accepted codes, the structured retry hint, hint absence,
 * malformed hints, and non-rate-limit shapes.
 */

import { describe, it, expect } from "vitest";
import { readRateLimitError } from "./rate-limit-error.js";

describe("readRateLimitError", () => {
  it("reads RATE_LIMITED with a structured retry hint", () => {
    const err = { data: { code: "RATE_LIMITED", retryAfterSeconds: 42 } };
    expect(readRateLimitError(err)).toEqual({ retryAfterSeconds: 42 });
  });

  it("reads TOO_MANY_REQUESTS without a hint as retryAfterSeconds null", () => {
    const err = { data: { code: "TOO_MANY_REQUESTS" } };
    expect(readRateLimitError(err)).toEqual({ retryAfterSeconds: null });
  });

  it("drops a non-numeric retry hint but still reports the rate limit", () => {
    const err = { data: { code: "RATE_LIMITED", retryAfterSeconds: "60" } };
    expect(readRateLimitError(err)).toEqual({ retryAfterSeconds: null });
  });

  it("drops zero and negative retry hints", () => {
    expect(
      readRateLimitError({
        data: { code: "RATE_LIMITED", retryAfterSeconds: 0 },
      }),
    ).toEqual({ retryAfterSeconds: null });
    expect(
      readRateLimitError({
        data: { code: "RATE_LIMITED", retryAfterSeconds: -5 },
      }),
    ).toEqual({ retryAfterSeconds: null });
  });

  it("returns null for other tRPC error codes", () => {
    expect(readRateLimitError({ data: { code: "NOT_FOUND" } })).toBeNull();
    expect(readRateLimitError({ data: { code: "UNAUTHORIZED" } })).toBeNull();
  });

  it("returns null for non-error shapes", () => {
    expect(readRateLimitError(null)).toBeNull();
    expect(readRateLimitError(undefined)).toBeNull();
    expect(readRateLimitError("rate limited")).toBeNull();
    expect(readRateLimitError(new Error("Rate limited"))).toBeNull();
    expect(readRateLimitError({ data: null })).toBeNull();
    expect(readRateLimitError({ data: {} })).toBeNull();
  });
});
