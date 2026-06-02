import { describe, it, expect } from "vitest";
import { systemEventLabel } from "./system-event-label.js";

describe("systemEventLabel", () => {
  it.each([
    ["assignment_change", "Assigned"],
    ["status_change", "Status changed"],
    ["hold_change", "Hold changed"],
    ["priority_change", "Priority changed"],
    ["merge_note", "Tickets merged"],
  ])("maps %s to '%s'", (type, expected) => {
    expect(systemEventLabel(type)).toBe(expected);
  });

  it("returns fallback for unknown type", () => {
    expect(systemEventLabel("some_future_type")).toBe("Event");
  });
});
