import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { hkdf, hkdfDerive32 } from "./hkdf.js";
import { getSodium, _resetSodiumForTesting } from "./sodium.js";
import { InvalidInputError } from "./errors.js";

/**
 * Helper: convert hex string to Uint8Array.
 */
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

describe("HKDF-SHA512", () => {
  beforeAll(async () => {
    _resetSodiumForTesting();
    await getSodium();
  });

  /**
   * Known-answer test vectors for HKDF-SHA512.
   *
   * RFC 5869 Appendix A only provides SHA-256 vectors. These SHA-512 vectors
   * were generated with Python 3.9 using `hmac` + `hashlib.sha512`, following
   * the same input patterns as the RFC 5869 Appendix A cases.
   *
   * Generation script:
   *   import hmac, hashlib
   *   def hkdf_sha512(ikm, salt, info, length):
   *       prk = hmac.new(salt or b'\x00'*64, ikm, hashlib.sha512).digest()
   *       n = (length + 63) // 64; okm = b''; prev = b''
   *       for i in range(1, n+1):
   *           prev = hmac.new(prk, prev + info + bytes([i]), hashlib.sha512).digest()
   *           okm += prev
   *       return okm[:length]
   */
  describe("known-answer vectors", () => {
    it("case 1: basic 32-byte output", () => {
      const ikm = fromHex("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b");
      const salt = fromHex("000102030405060708090a0b0c");
      const info = fromHex("f0f1f2f3f4f5f6f7f8f9");
      const expected = fromHex(
        "832390086cda71fb47625bb5ceb168e4c8e26a1a16ed34d9fc7fe92c14815793",
      );
      expect(hkdf(ikm, info, 32, salt)).toEqual(expected);
    });

    it("case 2: 82-byte output (multi-round expand)", () => {
      const ikm = fromHex(
        "000102030405060708090a0b0c0d0e0f" +
          "101112131415161718191a1b1c1d1e1f" +
          "202122232425262728292a2b2c2d2e2f" +
          "303132333435363738393a3b3c3d3e3f" +
          "404142434445464748494a4b4c4d4e4f",
      );
      const salt = fromHex(
        "606162636465666768696a6b6c6d6e6f" +
          "707172737475767778797a7b7c7d7e7f" +
          "808182838485868788898a8b8c8d8e8f" +
          "909192939495969798999a9b9c9d9e9f" +
          "a0a1a2a3a4a5a6a7a8a9aaabacadaeaf",
      );
      const info = fromHex(
        "b0b1b2b3b4b5b6b7b8b9babbbcbdbebf" +
          "c0c1c2c3c4c5c6c7c8c9cacbcccdcecf" +
          "d0d1d2d3d4d5d6d7d8d9dadbdcdddedf" +
          "e0e1e2e3e4e5e6e7e8e9eaebecedeeef" +
          "f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff",
      );
      const expected = fromHex(
        "ce6c97192805b346e6161e821ed16567" +
          "3b84f400a2b514b2fe23d84cd189ddf1" +
          "b695b48cbd1c8388441137b3ce28f16a" +
          "a64ba33ba466b24df6cfcb021ecff235" +
          "f6a2056ce3af1de44d572097a8505d9e" +
          "7a93",
      );
      expect(hkdf(ikm, info, 82, salt)).toEqual(expected);
    });

    it("case 3: no salt, empty info, 42-byte output", () => {
      const ikm = fromHex("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b");
      const info = new Uint8Array(0);
      const expected = fromHex(
        "f5fa02b18298a72a8c23898a8703472c" +
          "6eb179dc204c03425c970e3b164bf90f" +
          "ff22d04836d0e2343bac",
      );
      // No salt argument (defaults to 64 zero bytes per RFC 5869 Section 2.2)
      expect(hkdf(ikm, info, 42)).toEqual(expected);
    });
  });

  describe("boundary validation", () => {
    it("throws InvalidInputError for length=0", () => {
      const ikm = new Uint8Array(32);
      const info = new Uint8Array(0);
      expect(() => hkdf(ikm, info, 0)).toThrow(InvalidInputError);
    });

    it("throws InvalidInputError for length > 255*64", () => {
      const ikm = new Uint8Array(32);
      const info = new Uint8Array(0);
      expect(() => hkdf(ikm, info, 255 * 64 + 1)).toThrow(InvalidInputError);
    });

    it("throws InvalidInputError for negative length", () => {
      const ikm = new Uint8Array(32);
      const info = new Uint8Array(0);
      expect(() => hkdf(ikm, info, -1)).toThrow(InvalidInputError);
    });

    it("accepts max valid length (255*64 = 16320)", () => {
      const ikm = new Uint8Array(32);
      ikm.fill(0xaa);
      const info = new Uint8Array(0);
      const result = hkdf(ikm, info, 255 * 64);
      expect(result.length).toBe(255 * 64);
    });
  });

  describe("determinism and domain separation", () => {
    it("same inputs produce identical output", () => {
      const ikm = new Uint8Array(32);
      ikm.fill(0xcc);
      const info = new TextEncoder().encode("test-label");
      const a = hkdf(ikm, info, 32);
      const b = hkdf(ikm, info, 32);
      expect(a).toEqual(b);
    });

    it("different info labels produce different outputs", () => {
      const ikm = new Uint8Array(32);
      ikm.fill(0xdd);
      const info1 = new TextEncoder().encode("label-one");
      const info2 = new TextEncoder().encode("label-two");
      const a = hkdf(ikm, info1, 32);
      const b = hkdf(ikm, info2, 32);
      expect(a).not.toEqual(b);
    });

    it("different salts produce different outputs", () => {
      const ikm = new Uint8Array(32);
      ikm.fill(0xee);
      const info = new Uint8Array(0);
      const salt1 = new Uint8Array(64);
      salt1.fill(0x01);
      const salt2 = new Uint8Array(64);
      salt2.fill(0x02);
      const a = hkdf(ikm, info, 32, salt1);
      const b = hkdf(ikm, info, 32, salt2);
      expect(a).not.toEqual(b);
    });
  });

  describe("hkdfDerive32", () => {
    it("returns exactly 32 bytes", () => {
      const ikm = new Uint8Array(32);
      ikm.fill(0xab);
      const result = hkdfDerive32(ikm, "test-label");
      expect(result.length).toBe(32);
    });

    it("is deterministic", () => {
      const ikm = new Uint8Array(32);
      ikm.fill(0xab);
      const a = hkdfDerive32(ikm, "test-label");
      const b = hkdfDerive32(ikm, "test-label");
      expect(a).toEqual(b);
    });

    it("matches hkdf() called with equivalent params", () => {
      const ikm = new Uint8Array(32);
      ikm.fill(0xab);
      const label = "care-y-master-v2";
      const fromDerive32 = hkdfDerive32(ikm, label);
      const fromHkdf = hkdf(ikm, new TextEncoder().encode(label), 32);
      expect(fromDerive32).toEqual(fromHkdf);
    });

    it("different labels produce different outputs", () => {
      const ikm = new Uint8Array(32);
      ikm.fill(0xab);
      const a = hkdfDerive32(ikm, "care-y-master-v2");
      const b = hkdfDerive32(ikm, "care-y-ecies-private-v1");
      expect(a).not.toEqual(b);
    });
  });

  describe("property-based", () => {
    it("output length always matches requested length", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 128 }),
          fc.integer({ min: 1, max: 256 }),
          (ikm, length) => {
            const info = new TextEncoder().encode("prop-test");
            const result = hkdf(ikm, info, length);
            expect(result.length).toBe(length);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("output is deterministic for arbitrary inputs", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          fc.string({ minLength: 1, maxLength: 32 }),
          (ikm, label) => {
            const a = hkdfDerive32(ikm, label);
            const b = hkdfDerive32(ikm, label);
            expect(a).toEqual(b);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
