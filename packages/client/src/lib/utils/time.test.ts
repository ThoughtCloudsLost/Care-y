import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type * as ParaglideMessages from "$lib/paraglide/messages.js";

// vi.mock required: tests pin deterministic message strings for assertions.
vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  ticket_date_today: () => "Today",
  ticket_date_yesterday: () => "Yesterday",
}));

import {
  formatDateSeparator,
  formatDuration,
  formatFileSize,
  formatShortDate,
  needsDateSeparator,
} from "./time.js";

const NOW = new Date("2026-04-01T12:00:00Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatDateSeparator", () => {
  it("returns 'Today' for the current date", () => {
    expect(formatDateSeparator("2026-04-01T14:30:00Z")).toBe("Today");
  });

  it("returns 'Yesterday' for the previous day", () => {
    expect(formatDateSeparator("2026-03-31T10:00:00Z")).toBe("Yesterday");
  });

  it("returns month and day for dates earlier in the same year", () => {
    const result = formatDateSeparator("2026-01-15T10:00:00Z");
    expect(result).toContain("15");
    expect(result).not.toContain("2026");
  });

  it("includes the year for dates in a different year", () => {
    const result = formatDateSeparator("2025-06-20T10:00:00Z");
    expect(result).toContain("20");
    expect(result).toContain("2025");
  });
});

describe("formatShortDate", () => {
  // Midday UTC so the assertions hold in any local timezone. The formatter
  // renders in local time, so a midnight-UTC timestamp lands on the previous
  // calendar day for anyone west of Greenwich.
  const MIDDAY = "2026-01-15T12:00:00.000Z";

  it("renders day, month, and year for an ISO timestamp", () => {
    const result = formatShortDate(MIDDAY);
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("does not spell the month out in full", () => {
    expect(formatShortDate(MIDDAY)).not.toContain("January");
  });

  it("returns the same string for the same instant", () => {
    expect(formatShortDate(MIDDAY)).toBe(formatShortDate(MIDDAY));
  });

  it("distinguishes different dates", () => {
    expect(formatShortDate(MIDDAY)).not.toBe(
      formatShortDate("2026-02-20T12:00:00.000Z"),
    );
  });
});

describe("formatDuration", () => {
  it("formats zero seconds as 0:00", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats sub-minute durations", () => {
    expect(formatDuration(47)).toBe("0:47");
  });

  it("formats exactly one minute", () => {
    expect(formatDuration(60)).toBe("1:00");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(135)).toBe("2:15");
  });

  it("pads seconds to two digits", () => {
    expect(formatDuration(62)).toBe("1:02");
  });

  it("truncates fractional seconds", () => {
    expect(formatDuration(90.7)).toBe("1:30");
  });
});

describe("formatFileSize", () => {
  it("formats zero bytes", () => {
    expect(formatFileSize(0)).toBe("0B");
  });

  it("formats bytes under 1 KB", () => {
    expect(formatFileSize(512)).toBe("512B");
  });

  it("formats kilobytes (rounds to nearest)", () => {
    expect(formatFileSize(2048)).toBe("2KB");
    expect(formatFileSize(1536)).toBe("2KB");
  });

  it("formats megabytes with one decimal", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0MB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5MB");
  });

  it("formats gigabytes with one decimal", () => {
    expect(formatFileSize(2.3 * 1024 * 1024 * 1024)).toBe("2.3GB");
  });
});

describe("needsDateSeparator", () => {
  it("returns true for the first item (no previous date)", () => {
    expect(needsDateSeparator("2026-04-01T10:00:00Z", undefined)).toBe(true);
  });

  it("returns false for timestamps on the same calendar day", () => {
    expect(
      needsDateSeparator("2026-04-01T14:00:00Z", "2026-04-01T10:00:00Z"),
    ).toBe(false);
  });

  it("returns true when calendar day differs", () => {
    // Use noon timestamps to avoid local-timezone edge cases (UTC midnight
    // can land on the prior local calendar day in west-of-UTC zones).
    expect(
      needsDateSeparator("2026-04-02T12:00:00Z", "2026-04-01T12:00:00Z"),
    ).toBe(true);
  });

  it("returns true when month differs", () => {
    expect(
      needsDateSeparator("2026-04-15T12:00:00Z", "2026-03-15T12:00:00Z"),
    ).toBe(true);
  });

  it("returns true when year differs", () => {
    expect(
      needsDateSeparator("2026-01-15T12:00:00Z", "2025-12-15T12:00:00Z"),
    ).toBe(true);
  });
});
