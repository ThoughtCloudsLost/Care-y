import { describe, it, expect, beforeEach } from "vitest";
import {
  beginSplitHandoff,
  endSplitHandoff,
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
});
