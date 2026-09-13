import { describe, it, expect } from "vitest";
import { formatPhoneDisplay } from "./format-phone.js";

describe("formatPhoneDisplay", () => {
  it("formats a US E.164 number", () => {
    expect(formatPhoneDisplay("+15550001234")).toBe("+1 (555) 000-1234");
  });

  it("formats another US number", () => {
    expect(formatPhoneDisplay("+12125559876")).toBe("+1 (212) 555-9876");
  });

  it("passes through a non-US E.164 number unchanged", () => {
    expect(formatPhoneDisplay("+442071234567")).toBe("+442071234567");
  });

  it("passes through a short US-prefix number that is not 12 chars", () => {
    expect(formatPhoneDisplay("+1555")).toBe("+1555");
  });

  it("passes through an empty string", () => {
    expect(formatPhoneDisplay("")).toBe("");
  });

  it("passes through a number with no + prefix", () => {
    expect(formatPhoneDisplay("15550001234")).toBe("15550001234");
  });

  it("passes through a long US-prefix number (extra digits)", () => {
    expect(formatPhoneDisplay("+155500012345")).toBe("+155500012345");
  });
});
