import { describe, it, expect } from "vitest";
import { entryAutoDismisses } from "./entry-visibility.js";

describe("entryAutoDismisses", () => {
  // -----------------------------------------------------------------
  // Init origin never dismisses
  // -----------------------------------------------------------------

  it("does not dismiss at init origin with matching seqs", () => {
    expect(entryAutoDismisses(true, "init", 0, 0)).toBe(false);
  });

  it("does not dismiss at init origin with differing seqs", () => {
    expect(entryAutoDismisses(true, "init", 5, 0)).toBe(false);
  });

  it("does not dismiss at init origin when re-shown at a later seq", () => {
    expect(entryAutoDismisses(true, "init", 12, 12)).toBe(false);
  });

  // -----------------------------------------------------------------
  // Non-init with same seq does not dismiss (re-shown entry survives)
  // -----------------------------------------------------------------

  it("does not dismiss when locationSeq equals entryShownAtSeq (phone origin)", () => {
    expect(entryAutoDismisses(true, "phone", 7, 7)).toBe(false);
  });

  it("does not dismiss when locationSeq equals entryShownAtSeq (deep-link origin)", () => {
    expect(entryAutoDismisses(true, "deep-link", 3, 3)).toBe(false);
  });

  it("does not dismiss when locationSeq equals entryShownAtSeq (page-click origin)", () => {
    expect(entryAutoDismisses(true, "page-click", 10, 10)).toBe(false);
  });

  // -----------------------------------------------------------------
  // Non-init with differing seq dismisses
  // -----------------------------------------------------------------

  it("dismisses when location moved (phone origin)", () => {
    expect(entryAutoDismisses(true, "phone", 8, 7)).toBe(true);
  });

  it("dismisses when location moved (deep-link origin)", () => {
    expect(entryAutoDismisses(true, "deep-link", 4, 3)).toBe(true);
  });

  it("dismisses when location moved (page-click origin)", () => {
    expect(entryAutoDismisses(true, "page-click", 11, 10)).toBe(true);
  });

  // -----------------------------------------------------------------
  // entryVisible false always returns false
  // -----------------------------------------------------------------

  it("returns false when entry is not visible (init)", () => {
    expect(entryAutoDismisses(false, "init", 0, 0)).toBe(false);
  });

  it("returns false when entry is not visible (phone, differing seq)", () => {
    expect(entryAutoDismisses(false, "phone", 5, 3)).toBe(false);
  });

  it("returns false when entry is not visible (page-click, differing seq)", () => {
    expect(entryAutoDismisses(false, "page-click", 2, 0)).toBe(false);
  });
});
