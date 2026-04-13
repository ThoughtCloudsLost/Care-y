import { describe, it, expect } from "vitest";
import { followUpKind } from "./follow-up-utils.js";

describe("followUpKind", () => {
  it("classifies system-sourced follow-ups as system", () => {
    expect(followUpKind({ source: "system", type: "message" })).toBe("system");
  });

  it("classifies system internal_notes as system (source takes precedence)", () => {
    expect(followUpKind({ source: "system", type: "internal_note" })).toBe(
      "system",
    );
  });

  it("classifies volunteer internal_notes as note", () => {
    expect(followUpKind({ source: "volunteer", type: "internal_note" })).toBe(
      "note",
    );
  });

  it("classifies client internal_notes as note", () => {
    expect(followUpKind({ source: "client", type: "internal_note" })).toBe(
      "note",
    );
  });

  it("classifies volunteer messages as message", () => {
    expect(followUpKind({ source: "volunteer", type: "message" })).toBe(
      "message",
    );
  });

  it("classifies client messages as message", () => {
    expect(followUpKind({ source: "client", type: "message" })).toBe("message");
  });

  it("classifies volunteer sms as message", () => {
    expect(followUpKind({ source: "volunteer", type: "sms" })).toBe("message");
  });

  it("classifies volunteer call as message", () => {
    expect(followUpKind({ source: "volunteer", type: "call" })).toBe("message");
  });
});
