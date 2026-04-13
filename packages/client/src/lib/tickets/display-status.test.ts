import { describe, it, expect } from "vitest";
import { deriveDisplayStatus } from "./display-status.js";

describe("deriveDisplayStatus", () => {
  it("returns 'new' for open ticket with no follow-ups", () => {
    expect(deriveDisplayStatus("open", false, 0)).toBe("new");
  });

  it("returns 'active' for open ticket with follow-ups", () => {
    expect(deriveDisplayStatus("open", false, 1)).toBe("active");
  });

  it("returns 'active' for open ticket with many follow-ups", () => {
    expect(deriveDisplayStatus("open", false, 42)).toBe("active");
  });

  it("returns 'hold' when onHold is true regardless of status or followUpCount", () => {
    expect(deriveDisplayStatus("open", true, 0)).toBe("hold");
    expect(deriveDisplayStatus("open", true, 5)).toBe("hold");
  });

  it("returns 'closed' for closed tickets", () => {
    expect(deriveDisplayStatus("closed", false, 0)).toBe("closed");
    expect(deriveDisplayStatus("closed", false, 10)).toBe("closed");
  });

  it("returns 'hold' over 'closed' when both onHold and closed", () => {
    // Edge case: a closed ticket shouldn't normally be onHold,
    // but if the data says so, hold takes priority
    expect(deriveDisplayStatus("closed", true, 0)).toBe("hold");
  });
});
