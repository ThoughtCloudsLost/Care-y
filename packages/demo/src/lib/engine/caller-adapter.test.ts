import { describe, it, expect } from "vitest";
import { reshapeWire } from "./caller-adapter.js";

describe("reshapeWire", () => {
  it("returns the same reference for a buffer-free object", () => {
    const input = { a: 1, b: "hello", c: { d: true } };
    const result = reshapeWire(input);
    expect(result).toBe(input);
  });

  it("returns the same reference for a buffer-free array", () => {
    const input = [1, "two", { three: 3 }];
    const result = reshapeWire(input);
    expect(result).toBe(input);
  });

  it("converts a Uint8Array to { type: Buffer, data: number[] }", () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const result = reshapeWire(bytes);
    expect(result).toEqual({ type: "Buffer", data: [1, 2, 3] });
  });

  it("only rebuilds nodes on the path to a Uint8Array", () => {
    const untouched = { x: 1, y: "z" };
    const input = {
      clean: untouched,
      dirty: { nested: new Uint8Array([4, 5]) },
    };
    const result = reshapeWire(input) as Record<string, unknown>;
    // The parent was rebuilt (a new object), but the clean subtree
    // is the original reference.
    expect(result).not.toBe(input);
    expect(result.clean).toBe(untouched);
    expect(result.dirty).toEqual({
      nested: { type: "Buffer", data: [4, 5] },
    });
  });

  it("passes Date instances through unchanged", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const input = { created: date, name: "test" };
    const result = reshapeWire(input) as Record<string, unknown>;
    // No Uint8Array, so the object is returned as-is
    expect(result).toBe(input);
    expect(result.created).toBe(date);
  });

  it("handles arrays containing Uint8Arrays", () => {
    const input = [new Uint8Array([10]), "text", 42];
    const result = reshapeWire(input) as unknown[];
    expect(result).not.toBe(input);
    expect(result[0]).toEqual({ type: "Buffer", data: [10] });
    expect(result[1]).toBe("text");
    expect(result[2]).toBe(42);
  });

  it("handles deeply nested Uint8Arrays", () => {
    const input = { a: { b: { c: { d: new Uint8Array([7, 8, 9]) } } } };
    const result = reshapeWire(input) as Record<string, unknown>;
    expect(result).not.toBe(input);
    const deepResult = (
      (result.a as Record<string, unknown>).b as Record<string, unknown>
    ).c as Record<string, unknown>;
    expect(deepResult.d).toEqual({ type: "Buffer", data: [7, 8, 9] });
  });

  it("passes primitives through unchanged", () => {
    expect(reshapeWire(null)).toBeNull();
    expect(reshapeWire(undefined)).toBeUndefined();
    expect(reshapeWire(42)).toBe(42);
    expect(reshapeWire("hello")).toBe("hello");
    expect(reshapeWire(true)).toBe(true);
  });

  it("preserves array identity when no element contains a buffer", () => {
    const inner = [1, 2, 3];
    const outer = { list: inner, label: "ok" };
    const result = reshapeWire(outer);
    expect(result).toBe(outer);
    expect((result as Record<string, unknown>).list).toBe(inner);
  });
});
