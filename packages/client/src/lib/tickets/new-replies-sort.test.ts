import { describe, it, expect } from "vitest";
import { sortNewRepliesFirst } from "./new-replies-sort.js";

interface Row {
  readonly id: string;
}

const rows = (...ids: string[]): Row[] => ids.map((id) => ({ id }));
const ids = (items: readonly Row[]): string[] => items.map((r) => r.id);

describe("sortNewRepliesFirst", () => {
  it("moves unread items to the front", () => {
    const items = rows("a", "b", "c", "d");
    const unread = new Set(["b", "d"]);

    const result = sortNewRepliesFirst(items, (r) => unread.has(r.id));

    expect(ids(result)).toEqual(["b", "d", "a", "c"]);
  });

  it("preserves server order within both blocks (stable partition)", () => {
    const items = rows("u1", "r1", "u2", "r2", "u3", "r3");
    const unread = new Set(["u1", "u2", "u3"]);

    const result = sortNewRepliesFirst(items, (r) => unread.has(r.id));

    expect(ids(result)).toEqual(["u1", "u2", "u3", "r1", "r2", "r3"]);
  });

  it("returns the same order when nothing is unread", () => {
    const items = rows("a", "b", "c");

    const result = sortNewRepliesFirst(items, () => false);

    expect(ids(result)).toEqual(["a", "b", "c"]);
  });

  it("returns the same order when everything is unread", () => {
    const items = rows("a", "b", "c");

    const result = sortNewRepliesFirst(items, () => true);

    expect(ids(result)).toEqual(["a", "b", "c"]);
  });

  it("handles an empty list", () => {
    expect(sortNewRepliesFirst([], () => true)).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const items = rows("a", "b", "c");
    const snapshot = [...items];

    sortNewRepliesFirst(items, (r) => r.id === "c");

    expect(items).toEqual(snapshot);
  });
});
