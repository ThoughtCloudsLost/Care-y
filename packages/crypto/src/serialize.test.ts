import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { encode, decode } from "./serialize.js";
import { InvalidInputError } from "./errors.js";
import { FC_LIGHT } from "./fc-config.js";

describe("serialize (base64url no-padding)", () => {
  describe("encode/decode roundtrip", () => {
    it("roundtrips a 32-byte key", () => {
      const data = new Uint8Array(32);
      data.fill(0xab);
      const encoded = encode(data);
      const decoded = decode(encoded);
      expect(decoded).toEqual(data);
    });

    it("roundtrips an empty buffer", () => {
      const data = new Uint8Array(0);
      const encoded = encode(data);
      expect(encoded).toBe("");
      const decoded = decode(encoded);
      expect(decoded).toEqual(data);
    });

    it("roundtrips a single byte", () => {
      const data = new Uint8Array([0xff]);
      const encoded = encode(data);
      const decoded = decode(encoded);
      expect(decoded).toEqual(data);
    });

    it("produces URL-safe output (no +, /, or =)", () => {
      // 128 random-ish bytes that would produce +/=/. in standard base64
      const data = new Uint8Array(128);
      for (let i = 0; i < data.length; i++) {
        data[i] = (i * 7 + 13) & 0xff;
      }
      const encoded = encode(data);
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it("encode is deterministic", () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      expect(encode(data)).toBe(encode(data));
    });
  });

  describe("decode error handling", () => {
    it("throws InvalidInputError on invalid characters", () => {
      expect(() => decode("!!!invalid!!!")).toThrow(InvalidInputError);
    });

    it("accepts standard base64 padding (lax decode)", () => {
      const result = decode("AA==");
      expect(result).toEqual(new Uint8Array([0x00]));
    });

    it("accepts standard base64 characters (lax decode)", () => {
      const withUrlSafe = decode("ab-cd_ef");
      const withStandard = decode("ab+cd/ef");
      expect(withStandard).toEqual(withUrlSafe);
    });

    it("thrown error has correct code", () => {
      try {
        decode("!!!bad!!!");
        expect.fail("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidInputError);
        expect((e as InvalidInputError).code).toBe("INVALID_INPUT");
      }
    });
  });

  describe("property-based", () => {
    it("roundtrips arbitrary byte arrays", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 1024 }),
          (data) => {
            const roundtripped = decode(encode(data));
            expect(roundtripped).toEqual(data);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });

    it("encoded output is always URL-safe", () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 1, maxLength: 512 }), (data) => {
          const encoded = encode(data);
          expect(encoded).toMatch(/^[A-Za-z0-9_-]*$/);
        }),
        { numRuns: FC_LIGHT },
      );
    });
  });
});
