import { describe, it, expect } from "vitest";
import { concatBytes, scalarFromInt } from "./bytes.js";

describe("concatBytes", () => {
  it("concatenates two arrays", () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([4, 5]);
    expect(concatBytes(a, b)).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
  });

  it("concatenates three arrays", () => {
    const a = new Uint8Array([1]);
    const b = new Uint8Array([2, 3]);
    const c = new Uint8Array([4, 5, 6]);
    expect(concatBytes(a, b, c)).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));
  });

  it("handles a single array (identity)", () => {
    const a = new Uint8Array([10, 20, 30]);
    const result = concatBytes(a);
    expect(result).toEqual(a);
    // Should be a new buffer, not the same reference
    expect(result).not.toBe(a);
  });

  it("handles zero arguments (empty result)", () => {
    const result = concatBytes();
    expect(result).toEqual(new Uint8Array(0));
    expect(result.length).toBe(0);
  });

  it("handles empty arrays mixed with non-empty", () => {
    const empty = new Uint8Array(0);
    const data = new Uint8Array([1, 2, 3]);
    expect(concatBytes(empty, data, empty)).toEqual(data);
  });

  it("handles all empty arrays", () => {
    const result = concatBytes(
      new Uint8Array(0),
      new Uint8Array(0),
      new Uint8Array(0),
    );
    expect(result.length).toBe(0);
  });

  it("preserves byte values at boundaries (no off-by-one)", () => {
    // Fill with distinct patterns to catch offset errors
    const a = new Uint8Array(3).fill(0xaa);
    const b = new Uint8Array(2).fill(0xbb);
    const c = new Uint8Array(4).fill(0xcc);
    const result = concatBytes(a, b, c);

    expect(result.length).toBe(9);
    expect(result[0]).toBe(0xaa);
    expect(result[2]).toBe(0xaa); // last byte of a
    expect(result[3]).toBe(0xbb); // first byte of b
    expect(result[4]).toBe(0xbb); // last byte of b
    expect(result[5]).toBe(0xcc); // first byte of c
    expect(result[8]).toBe(0xcc); // last byte of c
  });

  it("does not mutate input arrays", () => {
    const a = new Uint8Array([1, 2]);
    const b = new Uint8Array([3, 4]);
    concatBytes(a, b);
    expect(a).toEqual(new Uint8Array([1, 2]));
    expect(b).toEqual(new Uint8Array([3, 4]));
  });

  it("handles many small arrays", () => {
    const arrays = Array.from(
      { length: 100 },
      (_, i) => new Uint8Array([i & 0xff]),
    );
    const result = concatBytes(...arrays);
    expect(result.length).toBe(100);
    expect(result[0]).toBe(0);
    expect(result[99]).toBe(99);
  });
});

describe("scalarFromInt", () => {
  // ristretto255 scalars are little-endian per RFC 9496: byte 0 holds the least significant byte.
  it("places value at byte 0 (little-endian)", () => {
    const scalar = scalarFromInt(42);
    expect(scalar[0]).toBe(42);
    expect(scalar.length).toBe(32);
  });

  it("all other bytes are zero", () => {
    const scalar = scalarFromInt(255);
    expect(scalar[0]).toBe(255);
    for (let i = 1; i < 32; i++) {
      expect(scalar[i]).toBe(0);
    }
  });

  it("handles value 0", () => {
    const scalar = scalarFromInt(0);
    expect(scalar[0]).toBe(0);
    expect(scalar.every((b) => b === 0)).toBe(true);
  });

  it("handles value 1", () => {
    const scalar = scalarFromInt(1);
    expect(scalar[0]).toBe(1);
    expect(scalar.slice(1).every((b) => b === 0)).toBe(true);
  });

  it("handles maximum single-byte value 255", () => {
    const scalar = scalarFromInt(255);
    expect(scalar[0]).toBe(255);
  });

  it("returns a new buffer each call (no shared state)", () => {
    const a = scalarFromInt(1);
    const b = scalarFromInt(1);
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });

  it("returns exactly 32 bytes for any input", () => {
    for (const val of [0, 1, 127, 128, 255]) {
      expect(scalarFromInt(val).length).toBe(32);
    }
  });
});
