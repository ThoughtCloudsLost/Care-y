import { describe, it, expect } from "vitest";
import {
  toRistrettoPoint,
  toScalar,
  toSymmetricKey,
  toSalt,
  toNonce,
} from "./types.js";

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

describe("toSymmetricKey", () => {
  it("returns the input for a valid 32-byte buffer", () => {
    const buf = new Uint8Array(32).fill(0xef);
    const result = toSymmetricKey(buf);

    expect(result).toBe(buf);
    expect(result.length).toBe(32);
  });

  it("throws RangeError for wrong length", () => {
    expect(() => toSymmetricKey(new Uint8Array(16))).toThrow(RangeError);
    expect(() => toSymmetricKey(new Uint8Array(64))).toThrow(RangeError);
    expect(() => toSymmetricKey(new Uint8Array(0))).toThrow(RangeError);
  });

  it("includes actual length in error message", () => {
    expect(() => toSymmetricKey(new Uint8Array(24))).toThrow(/got 24/);
  });
});

describe("toSalt", () => {
  it("returns the input for a valid 16-byte buffer", () => {
    const buf = new Uint8Array(16).fill(0x01);
    const result = toSalt(buf);

    expect(result).toBe(buf);
    expect(result.length).toBe(16);
  });

  it("throws RangeError for wrong length", () => {
    expect(() => toSalt(new Uint8Array(32))).toThrow(RangeError);
    expect(() => toSalt(new Uint8Array(8))).toThrow(RangeError);
    expect(() => toSalt(new Uint8Array(0))).toThrow(RangeError);
  });

  it("includes actual length in error message", () => {
    expect(() => toSalt(new Uint8Array(12))).toThrow(/got 12/);
  });
});

describe("toNonce", () => {
  it("returns the input for a valid 24-byte buffer", () => {
    const buf = new Uint8Array(24).fill(0x02);
    const result = toNonce(buf);

    expect(result).toBe(buf);
    expect(result.length).toBe(24);
  });

  it("throws RangeError for wrong length", () => {
    expect(() => toNonce(new Uint8Array(32))).toThrow(RangeError);
    expect(() => toNonce(new Uint8Array(16))).toThrow(RangeError);
    expect(() => toNonce(new Uint8Array(0))).toThrow(RangeError);
  });

  it("includes actual length in error message", () => {
    expect(() => toNonce(new Uint8Array(20))).toThrow(/got 20/);
  });
});
