/**
 * formatRelativeTime tests.
 *
 * Verifies correct relative time string generation for various
 * time deltas. Uses vi.setSystemTime to control Date.now().
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

// Mock paraglide messages so we can test the logic without i18n compilation.
vi.mock("$lib/paraglide/messages.js", () => ({
  dashboard_time_just_now: () => "Just now",
  dashboard_time_minutes_ago: ({ count }: { count: number }) => `${count}m ago`,
  dashboard_time_hours_ago: ({ count }: { count: number }) => `${count}h ago`,
  dashboard_time_days_ago: ({ count }: { count: number }) => `${count}d ago`,
}));

import { formatRelativeTime } from "./format-time.js";

const NOW = new Date("2026-04-01T12:00:00Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatRelativeTime", () => {
  it("returns 'Just now' for dates less than 60 seconds ago", () => {
    const date = new Date(NOW.getTime() - 30_000);
    expect(formatRelativeTime(date)).toBe("Just now");
  });

  it("returns minutes for dates 1-59 minutes ago", () => {
    const date = new Date(NOW.getTime() - 5 * 60_000);
    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it("returns hours for dates 1-23 hours ago", () => {
    const date = new Date(NOW.getTime() - 3 * 3600_000);
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("returns days for dates 24+ hours ago", () => {
    const date = new Date(NOW.getTime() - 48 * 3600_000);
    expect(formatRelativeTime(date)).toBe("2d ago");
  });

  it("returns 'Just now' for dates 0 seconds ago", () => {
    expect(formatRelativeTime(NOW)).toBe("Just now");
  });

  it("returns '1m ago' for exactly 60 seconds", () => {
    const date = new Date(NOW.getTime() - 60_000);
    expect(formatRelativeTime(date)).toBe("1m ago");
  });

  it("returns '1h ago' for exactly 60 minutes", () => {
    const date = new Date(NOW.getTime() - 60 * 60_000);
    expect(formatRelativeTime(date)).toBe("1h ago");
  });

  it("returns '1d ago' for exactly 24 hours", () => {
    const date = new Date(NOW.getTime() - 24 * 3600_000);
    expect(formatRelativeTime(date)).toBe("1d ago");
  });
});
