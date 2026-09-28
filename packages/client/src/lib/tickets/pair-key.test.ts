import { describe, it, expect } from "vitest";
import { pairKey, undismissedPairs } from "./pair-key.js";

describe("pairKey", () => {
  it("returns a:b when a < b", () => {
    expect(pairKey("aaa", "zzz")).toBe("aaa:zzz");
  });

  it("returns a:b when b < a (order-independent)", () => {
    expect(pairKey("zzz", "aaa")).toBe("aaa:zzz");
  });

  it("is symmetric", () => {
    expect(pairKey("client-1", "client-2")).toBe(
      pairKey("client-2", "client-1"),
    );
  });

  it("handles equal ids", () => {
    expect(pairKey("same", "same")).toBe("same:same");
  });

  it("handles uuid-shaped ids", () => {
    const a = "01234567-89ab-cdef-0123-456789abcdef";
    const b = "fedcba98-7654-3210-fedc-ba9876543210";
    const result = pairKey(a, b);
    expect(result).toBe(`${a}:${b}`);
    expect(pairKey(b, a)).toBe(result);
  });
});

describe("undismissedPairs", () => {
  const pairs = [
    { clientIdA: "a", clientIdB: "b" },
    { clientIdA: "c", clientIdB: "d" },
  ];

  it("drops a pair dismissed in either order", () => {
    expect(undismissedPairs(pairs, new Set([pairKey("b", "a")]))).toEqual([
      { clientIdA: "c", clientIdB: "d" },
    ]);
  });

  it("keeps every pair when nothing is dismissed", () => {
    expect(undismissedPairs(pairs, new Set())).toEqual(pairs);
  });
});
