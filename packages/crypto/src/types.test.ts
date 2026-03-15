import { describe, it, expect } from "vitest";
import { toRistrettoPoint, toScalar } from "./types.js";

describe("toRistrettoPoint", () => {
  it("returns the input for a valid 32-byte buffer", () => {
    const buf = new Uint8Array(32).fill(0xab);
    const result = toRistrettoPoint(buf);

    expect(result).toBe(buf);
    expect(result.length).toBe(32);
  });

  it("throws RangeError for a buffer shorter than 32 bytes", () => {
    expect(() => toRistrettoPoint(new Uint8Array(16))).toThrow(RangeError);
  });

  it("throws RangeError for a buffer longer than 32 bytes", () => {
    expect(() => toRistrettoPoint(new Uint8Array(64))).toThrow(RangeError);
  });

  it("throws RangeError for an empty buffer", () => {
    expect(() => toRistrettoPoint(new Uint8Array(0))).toThrow(RangeError);
  });

  it("includes actual length in error message", () => {
    expect(() => toRistrettoPoint(new Uint8Array(20))).toThrow(/got 20/);
  });
});

describe("toScalar", () => {
  it("returns the input for a valid 32-byte buffer", () => {
    const buf = new Uint8Array(32).fill(0xcd);
    const result = toScalar(buf);

    expect(result).toBe(buf);
    expect(result.length).toBe(32);
  });

  it("throws RangeError for a buffer shorter than 32 bytes", () => {
    expect(() => toScalar(new Uint8Array(16))).toThrow(RangeError);
  });

  it("throws RangeError for a buffer longer than 32 bytes", () => {
    expect(() => toScalar(new Uint8Array(64))).toThrow(RangeError);
  });

  it("throws RangeError for an empty buffer", () => {
    expect(() => toScalar(new Uint8Array(0))).toThrow(RangeError);
  });

  it("includes actual length in error message", () => {
    expect(() => toScalar(new Uint8Array(10))).toThrow(/got 10/);
  });
});
