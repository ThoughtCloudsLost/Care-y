import { describe, it, expect, vi, afterEach } from "vitest";
import { ticketPrioritySchema } from "@care-y/shared";
import type * as Runtime from "$lib/paraglide/runtime.js";
import { PRIORITY_OPTIONS, priorityLabel } from "./priority-labels.js";

// vi.mock required: the compiled Paraglide messages read the active locale
// through the runtime's getLocale() at call time, and there is no seam to
// spy on from the message module itself. Spreading importOriginal keeps
// every other runtime export real.
let mockLocale = "en";
vi.mock("$lib/paraglide/runtime.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Runtime>()),
  getLocale: () => mockLocale,
}));

// Restore in a hook, not at the end of the test body: a test that fails
// partway would otherwise leave the locale switched for everything after it.
afterEach(() => {
  mockLocale = "en";
});

describe("PRIORITY_OPTIONS", () => {
  it("covers every priority the schema accepts, in schema order", () => {
    expect(PRIORITY_OPTIONS.map((option) => option.value)).toEqual([
      ...ticketPrioritySchema.options,
    ]);
  });

  it("resolves labels at call time, so a locale switch re-reads them", () => {
    const low = PRIORITY_OPTIONS[0];
    if (low === undefined) throw new Error("no priority options");

    mockLocale = "en";
    expect(low.label()).toBe("Low");

    mockLocale = "es";
    expect(low.label()).toBe("Baja");
  });
});

describe("priorityLabel", () => {
  it.each([
    ["low", "Low"],
    ["normal", "Normal"],
    ["high", "High"],
    ["urgent", "Urgent"],
  ])("maps %s to '%s'", (value, expected) => {
    expect(priorityLabel(value)).toBe(expected);
  });

  it("returns the raw value for a priority it has no label for", () => {
    expect(priorityLabel("some_future_priority")).toBe("some_future_priority");
  });
});
