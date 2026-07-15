import { describe, it, expect, beforeEach } from "vitest";
import {
  getDraft,
  setDraft,
  clearDraft,
  getDraftForMode,
  setDraftForMode,
  clearDraftForMode,
  hasAnyDraft,
} from "./draft-store.svelte.js";

describe("draft-store", () => {
  beforeEach(() => {
    clearDraft("t1");
    clearDraftForMode("t1", "sms");
    clearDraftForMode("t1", "note");
    clearDraft("t2");
    clearDraftForMode("t2", "sms");
  });

  describe("getDraft / setDraft (reply aliases)", () => {
    it("returns empty string when no draft exists", () => {
      expect(getDraft("t1")).toBe("");
    });

    it("stores and retrieves a draft", () => {
      setDraft("t1", "hello");
      expect(getDraft("t1")).toBe("hello");
    });

    it("clears a draft", () => {
      setDraft("t1", "hello");
      clearDraft("t1");
      expect(getDraft("t1")).toBe("");
    });
  });

  describe("getDraftForMode / setDraftForMode", () => {
    it("reply mode uses the same key as getDraft", () => {
      setDraftForMode("t1", "reply", "reply text");
      expect(getDraft("t1")).toBe("reply text");
      expect(getDraftForMode("t1", "reply")).toBe("reply text");
    });

    it("sms mode uses a separate key", () => {
      setDraftForMode("t1", "sms", "sms text");
      expect(getDraftForMode("t1", "sms")).toBe("sms text");
      expect(getDraft("t1")).toBe("");
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
      setDraft("t1", "hello");
      expect(hasAnyDraft()).toBe(true);
    });

    it("returns true when an SMS draft exists", () => {
      setDraftForMode("t1", "sms", "sms text");
      expect(hasAnyDraft()).toBe(true);
    });

    it("returns false after all drafts are cleared", () => {
      setDraft("t1", "hello");
      setDraftForMode("t1", "sms", "sms text");

      clearDraft("t1");
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
