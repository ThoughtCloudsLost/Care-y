/**
 * Tests for the format-time stub's frozen-reference behavior.
 *
 * The stub delegates to the real formatRelativeTime when not in record
 * mode, so only the frozen branch is tested here (the real function
 * has its own test suite).
 */

import { describe, it, expect, vi } from "vitest";
import type * as RecordModeModule from "$demo/record-mode.js";

// Mock paraglide messages so the test runs without i18n compilation.
// Only the four bucket messages are needed; spreading the full module
// would require i18n compilation output.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  dashboard_time_just_now: () => "Just now",
  dashboard_time_minutes_ago: ({ count }: { count: number }) => `${count}m ago`,
  dashboard_time_hours_ago: ({ count }: { count: number }) => `${count}h ago`,
  dashboard_time_days_ago: ({ count }: { count: number }) => `${count}d ago`,
}));

// Freeze FROZEN_NOW at a known timestamp so assertions are deterministic
const FIXED_NOW = new Date("2026-04-01T12:00:00Z").getTime();

vi.mock(
  "$demo/record-mode.js",
  () =>
    ({
      isRecordMode: () => true,
      FROZEN_NOW: FIXED_NOW,
      forwardRecordParam: (url: string) => url,
    }) satisfies { [K in keyof typeof RecordModeModule]: unknown },
);

const { formatRelativeTime } = await import("./format-time.js");

describe("format-time stub (record mode)", () => {
  it("returns 'Just now' for dates less than 60s before FROZEN_NOW", () => {
    const date = new Date(FIXED_NOW - 30_000);
    expect(formatRelativeTime(date)).toBe("Just now");
  });

  it("returns minutes for dates 1-59 minutes before FROZEN_NOW", () => {
    const date = new Date(FIXED_NOW - 5 * 60_000);
    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it("returns hours for dates 1-23 hours before FROZEN_NOW", () => {
    const date = new Date(FIXED_NOW - 3 * 3_600_000);
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("returns days for dates 24+ hours before FROZEN_NOW", () => {
    const date = new Date(FIXED_NOW - 48 * 3_600_000);
    expect(formatRelativeTime(date)).toBe("2d ago");
  });

  it("produces identical output regardless of actual wall clock", () => {
    // Two calls at different real times should yield the same result
    // because the reference is FROZEN_NOW, not Date.now()
    const date = new Date(FIXED_NOW - 10 * 60_000);
    const first = formatRelativeTime(date);
    const second = formatRelativeTime(date);
    expect(first).toBe(second);
    expect(first).toBe("10m ago");
  });
});
