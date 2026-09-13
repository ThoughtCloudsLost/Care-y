import { describe, it, expect } from "vitest";
import { enabledTicketId } from "./queries.js";

describe("enabledTicketId", () => {
  it("returns true for a non-empty string", () => {
    expect(enabledTicketId("abc-123")).toBe(true);
  });

  it("returns false for an empty string", () => {
    expect(enabledTicketId("")).toBe(false);
  });
});
