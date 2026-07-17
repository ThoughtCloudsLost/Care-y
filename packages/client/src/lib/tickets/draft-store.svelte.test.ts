import { describe, it, expect, beforeEach } from "vitest";
import {
  getDraftForMode,
  setDraftForMode,
  clearDraftForMode,
  hasAnyDraft,
} from "./draft-store.svelte.js";

describe("draft-store", () => {
  beforeEach(() => {
    clearDraftForMode("t1", "reply");
    clearDraftForMode("t1", "sms");
    clearDraftForMode("t1", "note");
    clearDraftForMode("t2", "reply");
    clearDraftForMode("t2", "sms");
  });

  describe("getDraftForMode / setDraftForMode", () => {
    it("returns empty string when no draft exists", () => {
      expect(getDraftForMode("t1", "reply")).toBe("");
    });

    it("stores and retrieves a draft", () => {
      setDraftForMode("t1", "reply", "hello");
      expect(getDraftForMode("t1", "reply")).toBe("hello");
    });

    it("clears a draft", () => {
      setDraftForMode("t1", "reply", "hello");
      clearDraftForMode("t1", "reply");
      expect(getDraftForMode("t1", "reply")).toBe("");
    });

    it("sms mode uses a separate key from reply", () => {
      setDraftForMode("t1", "sms", "sms text");
      expect(getDraftForMode("t1", "sms")).toBe("sms text");
      expect(getDraftForMode("t1", "reply")).toBe("");
    });

    it("preserves drafts independently per mode", () => {
      setDraftForMode("t1", "reply", "reply text");
      setDraftForMode("t1", "sms", "sms text");

      expect(getDraftForMode("t1", "reply")).toBe("reply text");
      expect(getDraftForMode("t1", "sms")).toBe("sms text");
    });

    it("clearDraftForMode only clears the specified mode", () => {
      setDraftForMode("t1", "reply", "reply text");
      setDraftForMode("t1", "sms", "sms text");

      clearDraftForMode("t1", "sms");
      expect(getDraftForMode("t1", "reply")).toBe("reply text");
      expect(getDraftForMode("t1", "sms")).toBe("");
    });

    it("isolates drafts across ticket IDs", () => {
      setDraftForMode("t1", "sms", "t1 sms");
      setDraftForMode("t2", "sms", "t2 sms");

      expect(getDraftForMode("t1", "sms")).toBe("t1 sms");
      expect(getDraftForMode("t2", "sms")).toBe("t2 sms");
    });
  });

  describe("hasAnyDraft", () => {
    it("returns false when no drafts exist", () => {
      expect(hasAnyDraft()).toBe(false);
    });

    it("returns true when a reply draft exists", () => {
      setDraftForMode("t1", "reply", "hello");
      expect(hasAnyDraft()).toBe(true);
    });

    it("returns true when an SMS draft exists", () => {
      setDraftForMode("t1", "sms", "sms text");
      expect(hasAnyDraft()).toBe(true);
    });

    it("returns false after all drafts are cleared", () => {
      setDraftForMode("t1", "reply", "hello");
      setDraftForMode("t1", "sms", "sms text");

      clearDraftForMode("t1", "reply");
      clearDraftForMode("t1", "sms");
      expect(hasAnyDraft()).toBe(false);
    });

    it("setting empty text removes the draft", () => {
      setDraftForMode("t1", "sms", "text");
      setDraftForMode("t1", "sms", "");
      expect(hasAnyDraft()).toBe(false);
    });
  });
});
