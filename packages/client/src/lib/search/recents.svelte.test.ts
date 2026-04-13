// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/svelte";
import { searchRecents } from "./recents.svelte.js";

afterEach(() => {
  searchRecents.clear();
  cleanup();
});

describe("searchRecents", () => {
  it("adds items in most-recent-first order", () => {
    searchRecents.add("housing");
    searchRecents.add("transport");
    expect(searchRecents.items).toEqual(["transport", "housing"]);
  });

  it("moves duplicate to front without duplication", () => {
    searchRecents.add("housing");
    searchRecents.add("transport");
    searchRecents.add("housing");
    expect(searchRecents.items).toEqual(["housing", "transport"]);
  });

  it("caps at 10 items, dropping oldest", () => {
    for (let i = 0; i < 11; i++) {
      searchRecents.add(`query-${i}`);
    }
    expect(searchRecents.items).toHaveLength(10);
    // Oldest (query-0) should be gone, newest (query-10) at front
    expect(searchRecents.items[0]).toBe("query-10");
    expect(searchRecents.items).not.toContain("query-0");
  });

  it("removes a specific item", () => {
    searchRecents.add("housing");
    searchRecents.add("transport");
    searchRecents.remove("housing");
    expect(searchRecents.items).toEqual(["transport"]);
  });

  it("clears all items", () => {
    searchRecents.add("housing");
    searchRecents.add("transport");
    searchRecents.clear();
    expect(searchRecents.items).toEqual([]);
  });

  it("rejects items shorter than 2 characters", () => {
    searchRecents.add("a");
    searchRecents.add("");
    searchRecents.add(" ");
    expect(searchRecents.items).toEqual([]);
  });

  it("trims whitespace before storing", () => {
    searchRecents.add("  housing  ");
    expect(searchRecents.items).toEqual(["housing"]);
  });

  it("treats trimmed duplicates as the same entry", () => {
    searchRecents.add("housing");
    searchRecents.add("  housing  ");
    expect(searchRecents.items).toEqual(["housing"]);
  });
});
