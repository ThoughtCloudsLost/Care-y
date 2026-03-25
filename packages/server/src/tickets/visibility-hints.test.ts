import { describe, it, expect } from "vitest";
import {
  getTicketOpenHint,
  HINT_TICKET_OPEN_WEB,
  HINT_TICKET_OPEN_SMS,
  HINT_SMS_SEND,
  HINT_TICKET_ASSIGN,
  type VisibilityHint,
} from "./visibility-hints.js";

describe("VisibilityHints", () => {
  describe("getTicketOpenHint", () => {
    it("returns HINT_TICKET_OPEN_WEB for web source", () => {
      expect(getTicketOpenHint("web")).toBe(HINT_TICKET_OPEN_WEB);
    });

    it("returns HINT_TICKET_OPEN_SMS for sms source", () => {
      expect(getTicketOpenHint("sms")).toBe(HINT_TICKET_OPEN_SMS);
    });

    it("returns HINT_TICKET_OPEN_SMS for voicemail source", () => {
      expect(getTicketOpenHint("voicemail")).toBe(HINT_TICKET_OPEN_SMS);
    });

    it("returns null for system source", () => {
      expect(getTicketOpenHint("system")).toBeNull();
    });
  });

  describe("hint constants have required fields", () => {
    const allHints: VisibilityHint[] = [
      HINT_TICKET_OPEN_WEB,
      HINT_TICKET_OPEN_SMS,
      HINT_SMS_SEND,
      HINT_TICKET_ASSIGN,
    ];

    it.each(allHints.map((h) => [h.key, h]))(
      "%s has non-empty key, text, and valid audience",
      (_key, hint) => {
        expect(hint.key).toBeTruthy();
        expect(hint.text).toBeTruthy();
        expect(hint.text.length).toBeGreaterThan(10);
        expect(["volunteer", "admin"]).toContain(hint.audience);
      },
    );

    it("all hints have unique keys", () => {
      const keys = allHints.map((h) => h.key);
      expect(new Set(keys).size).toBe(keys.length);
    });
  });
});
