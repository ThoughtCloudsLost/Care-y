import { describe, it, expect, beforeAll } from "vitest";
import { getSodium, type SodiumBackend } from "./sodium.js";
import { zeroAll } from "./mem.js";

describe("zeroAll", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    sodium = await getSodium();
  });

  it("zeros all provided buffers", () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([4, 5, 6]);

    zeroAll(a, b);

    expect(a).toEqual(new Uint8Array(3));
    expect(b).toEqual(new Uint8Array(3));
  });

  it("skips null entries without throwing", () => {
    const a = new Uint8Array([0xff, 0xfe]);

    expect(() => {
      zeroAll(a, null, null);
    }).not.toThrow();
    expect(a).toEqual(new Uint8Array(2));
  });

  it("handles empty argument list", () => {
    expect(() => {
      zeroAll();
    }).not.toThrow();
  });

  it("handles all-null argument list", () => {
    expect(() => {
      zeroAll(null, null);
    }).not.toThrow();
  });

  it("zeros a single buffer", () => {
    const buf = sodium.randombytes_buf(32);
    const nonZero = buf.some((b) => b !== 0);
    expect(nonZero).toBe(true);

    zeroAll(buf);

    expect(buf.every((b) => b === 0)).toBe(true);
  });
});
