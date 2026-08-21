import { describe, it, expect, beforeEach } from "vitest";
import {
  beginSplitHandoff,
  endSplitHandoff,
  isSplitHandoffCurrent,
  splitHandoffId,
} from "./split-handoff.svelte.js";

describe("splitHandoff", () => {
  beforeEach(() => {
    endSplitHandoff("tickets");
    endSplitHandoff("library");
  });

  it("returns null for a pane with no handoff in flight", () => {
    expect(splitHandoffId("tickets")).toBeNull();
  });

  it("holds the id between begin and end", () => {
    beginSplitHandoff("tickets", "tk-0001");
    expect(splitHandoffId("tickets")).toBe("tk-0001");
    endSplitHandoff("tickets");
    expect(splitHandoffId("tickets")).toBeNull();
  });

  it("keeps panes independent", () => {
    beginSplitHandoff("tickets", "tk-0001");
    expect(splitHandoffId("library")).toBeNull();

    beginSplitHandoff("library", "kb-0007");
    endSplitHandoff("tickets");
    expect(splitHandoffId("library")).toBe("kb-0007");
  });

  it("replaces the held id when a second handoff starts", () => {
    beginSplitHandoff("tickets", "tk-0001");
    beginSplitHandoff("tickets", "tk-0002");
    expect(splitHandoffId("tickets")).toBe("tk-0002");
  });

  it("is idempotent (no error ending a pane that holds nothing)", () => {
    expect(() => {
      endSplitHandoff("tickets");
    }).not.toThrow();
    expect(splitHandoffId("tickets")).toBeNull();
  });

  describe("supersession", () => {
    it("reports its own token as current while in flight", () => {
      const token = beginSplitHandoff("tickets", "tk-0001");
      expect(isSplitHandoffCurrent("tickets", token)).toBe(true);
    });

    it("drops the token once the handoff ends", () => {
      const token = beginSplitHandoff("tickets", "tk-0001");
      endSplitHandoff("tickets");
      expect(isSplitHandoffCurrent("tickets", token)).toBe(false);
    });

    it("drops the earlier token when a second handoff replaces it", () => {
      const first = beginSplitHandoff("tickets", "tk-0001");
      const second = beginSplitHandoff("tickets", "tk-0002");
      expect(isSplitHandoffCurrent("tickets", first)).toBe(false);
      expect(isSplitHandoffCurrent("tickets", second)).toBe(true);
    });

    it("issues tokens that never repeat across panes", () => {
      const tickets = beginSplitHandoff("tickets", "tk-0001");
      const library = beginSplitHandoff("library", "kb-0007");
      expect(tickets).not.toBe(library);
      expect(isSplitHandoffCurrent("tickets", library)).toBe(false);
      expect(isSplitHandoffCurrent("library", tickets)).toBe(false);
    });
  });
});
