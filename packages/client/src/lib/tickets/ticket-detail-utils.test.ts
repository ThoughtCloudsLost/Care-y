import { describe, it, expect } from "vitest";
import {
  shouldShowHint,
  searchFollowUps,
  lookupCachedFollowUpCount,
  insertMentionAtCursor,
  type DecryptCache,
  type CachedTicketPage,
} from "./ticket-detail-utils.js";

describe("shouldShowHint", () => {
  it("returns true on first call for a type", () => {
    const shown = new Set<string>();
    expect(shouldShowHint("sms", shown)).toBe(true);
  });

  it("returns false on second call for the same type", () => {
    const shown = new Set<string>();
    shouldShowHint("sms", shown);
    expect(shouldShowHint("sms", shown)).toBe(false);
  });

  it("tracks types independently", () => {
    const shown = new Set<string>();
    expect(shouldShowHint("sms", shown)).toBe(true);
    expect(shouldShowHint("call", shown)).toBe(true);
    expect(shouldShowHint("sms", shown)).toBe(false);
    expect(shouldShowHint("call", shown)).toBe(false);
  });

  it("mutates the provided Set", () => {
    const shown = new Set<string>();
    shouldShowHint("sms", shown);
    expect(shown.has("sms")).toBe(true);
  });
});

describe("searchFollowUps", () => {
  const ERROR = "__DECRYPT_ERROR__";

  function makeFuzzy(haystack: readonly string[], query: string) {
    return haystack
      .map((text, index) => ({ text, index }))
      .filter((e) => e.text.toLowerCase().includes(query.toLowerCase()))
      .map((e) => ({ index: e.index }));
  }

  function makeCache(
    entries: Record<string, string | undefined>,
  ): DecryptCache {
    return { get: (id: string) => entries[id] };
  }

  it("returns matching follow-up IDs", () => {
    const fups = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const cache = makeCache({
      a: "hello world",
      b: "goodbye",
      c: "hello there",
    });
    const result = searchFollowUps(fups, cache, "hello", ERROR, makeFuzzy);
    expect(result).toEqual(["a", "c"]);
  });

  it("returns empty array when no matches", () => {
    const fups = [{ id: "a" }];
    const cache = makeCache({ a: "hello" });
    const result = searchFollowUps(fups, cache, "xyz", ERROR, makeFuzzy);
    expect(result).toEqual([]);
  });

  it("skips entries with undefined plaintext", () => {
    const fups = [{ id: "a" }, { id: "b" }];
    const cache = makeCache({ a: "match", b: undefined });
    const result = searchFollowUps(fups, cache, "match", ERROR, makeFuzzy);
    expect(result).toEqual(["a"]);
  });

  it("skips entries matching the error sentinel", () => {
    const fups = [{ id: "a" }, { id: "b" }];
    const cache = makeCache({ a: ERROR, b: "searchable" });
    const result = searchFollowUps(fups, cache, "searchable", ERROR, makeFuzzy);
    expect(result).toEqual(["b"]);
  });

  it("returns empty array for empty follow-ups list", () => {
    const cache = makeCache({});
    const result = searchFollowUps([], cache, "test", ERROR, makeFuzzy);
    expect(result).toEqual([]);
  });

  it("handles fuzzy function returning out-of-bounds indices gracefully", () => {
    const fups = [{ id: "a" }];
    const cache = makeCache({ a: "text" });
    // fuzzy returns an index beyond searchable array length
    const brokenFuzzy = () => [{ index: 0 }, { index: 99 }];
    const result = searchFollowUps(fups, cache, "text", ERROR, brokenFuzzy);
    // index 0 maps to "a", index 99 maps to nothing (entry is undefined)
    expect(result).toEqual(["a"]);
  });

  it("preserves result ordering by index", () => {
    const fups = [{ id: "x" }, { id: "y" }, { id: "z" }];
    const cache = makeCache({ x: "alpha", y: "beta", z: "alpha beta" });
    // fuzzy returns indices in reverse order
    const reverseFuzzy = () => [{ index: 2 }, { index: 0 }];
    const result = searchFollowUps(fups, cache, "alpha", ERROR, reverseFuzzy);
    expect(result).toEqual(["x", "z"]);
  });

  it("filters all entries when every plaintext is the error sentinel", () => {
    const fups = [{ id: "a" }, { id: "b" }];
    const cache = makeCache({ a: ERROR, b: ERROR });
    const result = searchFollowUps(fups, cache, "anything", ERROR, makeFuzzy);
    expect(result).toEqual([]);
  });
});

describe("lookupCachedFollowUpCount", () => {
  function entry(
    data: CachedTicketPage | undefined,
  ): [unknown, CachedTicketPage | undefined] {
    return [["tickets", "list"], data];
  }

  it("returns followUpCount for a matching ticket", () => {
    const entries = [
      entry({
        pages: [
          [
            { id: "t-1", followUpCount: 5 },
            { id: "t-2", followUpCount: 3 },
          ],
        ],
      }),
    ];
    expect(lookupCachedFollowUpCount(entries, "t-2")).toBe(3);
  });

  it("returns undefined when ticket is not in cache", () => {
    const entries = [entry({ pages: [[{ id: "t-1", followUpCount: 5 }]] })];
    expect(lookupCachedFollowUpCount(entries, "t-99")).toBeUndefined();
  });

  it("returns undefined for empty entries", () => {
    expect(lookupCachedFollowUpCount([], "t-1")).toBeUndefined();
  });

  it("skips entries with undefined data", () => {
    const entries = [entry(undefined)];
    expect(lookupCachedFollowUpCount(entries, "t-1")).toBeUndefined();
  });

  it("searches across multiple pages", () => {
    const entries = [
      entry({
        pages: [
          [{ id: "t-1", followUpCount: 1 }],
          [{ id: "t-2", followUpCount: 7 }],
        ],
      }),
    ];
    expect(lookupCachedFollowUpCount(entries, "t-2")).toBe(7);
  });

  it("skips entries with data but no pages property", () => {
    const entries: [unknown, CachedTicketPage | undefined][] = [
      [["tickets", "list"], {} as CachedTicketPage],
    ];
    expect(lookupCachedFollowUpCount(entries, "t-1")).toBeUndefined();
  });

  it("searches across multiple cache entries", () => {
    const entries = [
      entry({ pages: [[{ id: "t-1", followUpCount: 2 }]] }),
      entry({ pages: [[{ id: "t-2", followUpCount: 9 }]] }),
    ];
    expect(lookupCachedFollowUpCount(entries, "t-2")).toBe(9);
  });

  it("returns first match when ticket appears in multiple entries", () => {
    const entries = [
      entry({ pages: [[{ id: "t-1", followUpCount: 3 }]] }),
      entry({ pages: [[{ id: "t-1", followUpCount: 5 }]] }),
    ];
    expect(lookupCachedFollowUpCount(entries, "t-1")).toBe(3);
  });

  it("returns undefined when pages array is empty", () => {
    const entries = [entry({ pages: [] })];
    expect(lookupCachedFollowUpCount(entries, "t-1")).toBeUndefined();
  });

  it("returns undefined when page contains no matching ticket", () => {
    const entries = [
      entry({
        pages: [
          [
            { id: "t-1", followUpCount: 1 },
            { id: "t-2", followUpCount: 2 },
          ],
          [{ id: "t-3", followUpCount: 3 }],
        ],
      }),
    ];
    expect(lookupCachedFollowUpCount(entries, "t-99")).toBeUndefined();
  });
});

describe("insertMentionAtCursor", () => {
  it("replaces @partial with @DisplayName at cursor position", () => {
    const result = insertMentionAtCursor("Hello @Ali", 10, "Alice");
    expect(result).toEqual({
      text: "Hello @Alice ",
      cursor: 13,
    });
  });

  it("preserves text after cursor", () => {
    // Cursor at position 7: before="Hey @Bo", after="more text"
    const result = insertMentionAtCursor("Hey @Bomore text", 7, "Bob");
    expect(result).toEqual({
      text: "Hey @Bob more text",
      cursor: 9,
    });
  });

  it("returns null when no @ symbol before cursor", () => {
    const result = insertMentionAtCursor("Hello world", 5, "Alice");
    expect(result).toBeNull();
  });

  it("handles @ at the very start of the text", () => {
    const result = insertMentionAtCursor("@J", 2, "Jane");
    expect(result).toEqual({
      text: "@Jane ",
      cursor: 6,
    });
  });

  it("uses the last @ before cursor when multiple exist", () => {
    const result = insertMentionAtCursor("@Alice said @B", 14, "Bob");
    expect(result).toEqual({
      text: "@Alice said @Bob ",
      cursor: 17,
    });
  });

  it("handles empty partial after @", () => {
    const result = insertMentionAtCursor("Hello @", 7, "Charlie");
    expect(result).toEqual({
      text: "Hello @Charlie ",
      cursor: 15,
    });
  });

  it("handles cursor at start with no @", () => {
    const result = insertMentionAtCursor("hello", 0, "Alice");
    expect(result).toBeNull();
  });

  it("returns null for empty string", () => {
    const result = insertMentionAtCursor("", 0, "Alice");
    expect(result).toBeNull();
  });

  it("handles cursor at end of text with @ elsewhere", () => {
    const text = "Hey @partial and more";
    const result = insertMentionAtCursor(text, text.length, "Complete");
    // lastIndexOf("@") finds the @ at index 4
    expect(result).toEqual({
      text: "Hey @Complete ",
      cursor: 14,
    });
  });

  it("computes correct cursor position for multi-byte display names", () => {
    const result = insertMentionAtCursor("@", 1, "SomeLongName");
    expect(result).toEqual({
      text: "@SomeLongName ",
      cursor: 14,
    });
    expect(result!.cursor).toBe("@SomeLongName ".length);
  });
});
