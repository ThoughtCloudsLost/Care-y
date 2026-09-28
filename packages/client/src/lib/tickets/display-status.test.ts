import { describe, it, expect } from "vitest";
import { deriveDisplayStatus } from "./display-status.js";

describe("deriveDisplayStatus", () => {
  it("returns 'new' for an open ticket nobody has responded to", () => {
    expect(deriveDisplayStatus("open", false, false)).toBe("new");
  });

  it("returns 'active' for an open ticket with a response", () => {
    expect(deriveDisplayStatus("open", false, true)).toBe("active");
  });

  it("returns 'hold' when onHold is true regardless of status or response", () => {
    expect(deriveDisplayStatus("open", true, false)).toBe("hold");
    expect(deriveDisplayStatus("open", true, true)).toBe("hold");
  });

  it("returns 'closed' for closed tickets", () => {
    expect(deriveDisplayStatus("closed", false, false)).toBe("closed");
    expect(deriveDisplayStatus("closed", false, true)).toBe("closed");
  });

  it("returns 'hold' over 'closed' when both onHold and closed", () => {
    // Edge case: a closed ticket shouldn't normally be onHold,
    // but if the data says so, hold takes priority
    expect(deriveDisplayStatus("closed", true, false)).toBe("hold");
  });
});
