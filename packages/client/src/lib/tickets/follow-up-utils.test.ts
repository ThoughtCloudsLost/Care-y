import { describe, it, expect } from "vitest";
import { followUpKind } from "./follow-up-utils.js";

describe("followUpKind", () => {
  it.each([
    "hold_placed",
    "hold_removed",
    "volunteer_assigned",
    "volunteer_unassigned",
    "status_opened",
    "status_closed",
    "priority_changed",
    "merge_note",
  ])("classifies %s as system", (type) => {
    expect(followUpKind({ type })).toBe("system");
  });

  it("classifies internal_note as note", () => {
    expect(followUpKind({ type: "internal_note" })).toBe("note");
  });

  it.each([
    "message",
    "sms_outbound",
    "sms_inbound",
    "phone_call",
    "voicemail",
  ])("classifies %s as message", (type) => {
    expect(followUpKind({ type })).toBe("message");
  });

  it("falls back to message for unknown types", () => {
    expect(followUpKind({ type: "some_future_type" })).toBe("message");
  });
});
