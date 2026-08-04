import { describe, it, expect } from "vitest";
import { isLogsTab, defaultTab } from "./logs-utils.js";

describe("isLogsTab", () => {
  it.each(["calls", "audit"])('accepts "%s"', (v) => {
    expect(isLogsTab(v)).toBe(true);
  });

  it.each(["settings", "users", "", "Calls", "AUDIT", "people"])(
    'rejects "%s"',
    (v) => {
      expect(isLogsTab(v)).toBe(false);
    },
  );
});

describe("defaultTab", () => {
  it('returns "calls"', () => {
    expect(defaultTab()).toBe("calls");
  });
});
