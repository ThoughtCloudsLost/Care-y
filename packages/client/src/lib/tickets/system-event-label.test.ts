import { describe, it, expect } from "vitest";
import { systemEventLabel } from "./system-event-label.js";

describe("systemEventLabel", () => {
  it.each([
    ["hold_placed", "Placed on hold"],
    ["hold_removed", "Removed from hold"],
    ["status_opened", "Reopened"],
    ["status_closed", "Closed"],
    ["merge_note", "Tickets merged"],
  ])("maps %s to '%s'", (type, expected) => {
    expect(systemEventLabel(type)).toBe(expected);
  });

  it("returns fallback for unknown type", () => {
    expect(systemEventLabel("some_future_type")).toBe("Event");
  });

  it("interpolates priority from event_params", () => {
    const label = systemEventLabel("priority_changed", { to: "high" });
    expect(label).toBe("Priority changed to High");
  });

  it("shows '?' when priority event_params missing", () => {
    const label = systemEventLabel("priority_changed");
    expect(label).toBe("Priority changed to ?");
  });

  it("interpolates volunteer name via resolveUserName callback", () => {
    const resolve = (id: string): string =>
      id === "user-1" ? "Alice" : "Unknown";
    const label = systemEventLabel(
      "volunteer_assigned",
      { userId: "user-1" },
      resolve,
    );
    expect(label).toBe("Alice assigned");
  });

  it("falls back to 'A volunteer' when no resolveUserName callback", () => {
    const label = systemEventLabel("volunteer_assigned", { userId: "user-1" });
    expect(label).toBe("A volunteer assigned");
  });

  it("falls back to 'A volunteer' when userId is missing from params", () => {
    const resolve = (): string => "Alice";
    const label = systemEventLabel("volunteer_unassigned", {}, resolve);
    expect(label).toBe("A volunteer unassigned");
  });

  it("falls back to 'A volunteer' when event_params is null", () => {
    const label = systemEventLabel("volunteer_unassigned", null);
    expect(label).toBe("A volunteer unassigned");
  });
});
