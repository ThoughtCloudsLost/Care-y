import { describe, it, expect, beforeAll } from "vitest";
import {
  expandMessageXMD,
  HASH_TO_GROUP_DST,
  buildFinalizeInput,
} from "./rfc.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { InvalidInputError } from "./errors.js";

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function toHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("RFC 9380 / 9497 building blocks", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("expand_message_xmd", () => {
    it("returns exactly the requested length (64 bytes)", () => {
      const msg = new TextEncoder().encode("test");
      const DST = new TextEncoder().encode("test-DST");
      const result = expandMessageXMD(sodium, msg, DST, 64);
      expect(result.length).toBe(64);
    });

    it("is deterministic", () => {
      const msg = new TextEncoder().encode("deterministic");
      const DST = new TextEncoder().encode("DST");
      const a = expandMessageXMD(sodium, msg, DST, 64);
      const b = expandMessageXMD(sodium, msg, DST, 64);
      expect(a).toEqual(b);
    });

    it("different DSTs produce different output", () => {
      const msg = new TextEncoder().encode("same-msg");
      const a = expandMessageXMD(
        sodium,
        msg,
        new TextEncoder().encode("DST-1"),
        64,
      );
      const b = expandMessageXMD(
        sodium,
        msg,
        new TextEncoder().encode("DST-2"),
        64,
      );
      expect(a).not.toEqual(b);
    });

    it("different messages produce different output", () => {
      const DST = new TextEncoder().encode("same-DST");
      const a = expandMessageXMD(
        sodium,
        new TextEncoder().encode("msg-1"),
        DST,
        64,
      );
      const b = expandMessageXMD(
        sodium,
        new TextEncoder().encode("msg-2"),
        DST,
        64,
      );
      expect(a).not.toEqual(b);
    });

    it("handles multi-round expansion (> 64 bytes, exercises strxor)", () => {
      const msg = new TextEncoder().encode("multi-round");
      const DST = new TextEncoder().encode("test-DST");
      const result = expandMessageXMD(sodium, msg, DST, 128);
      expect(result.length).toBe(128);
    });

    it("multi-round first 64 bytes match single-round 64 bytes", () => {
      // The first b_1 block should be identical regardless of total length
      const msg = new TextEncoder().encode("prefix-check");
      const DST = new TextEncoder().encode("test-DST");
      const single = expandMessageXMD(sodium, msg, DST, 64);
      const multi = expandMessageXMD(sodium, msg, DST, 128);
      // These should NOT match because l_i_b_str (step 5) differs:
      // single encodes len=64 (0x0040), multi encodes len=128 (0x0080)
      // which changes msg_prime, which changes b_0, which changes everything.
      expect(multi.subarray(0, 64)).not.toEqual(single);
    });

    it("handles 3-round expansion (> 128 bytes)", () => {
      const msg = new TextEncoder().encode("three-rounds");
      const DST = new TextEncoder().encode("test-DST");
      const result = expandMessageXMD(sodium, msg, DST, 192);
      expect(result.length).toBe(192);
    });

    it("handles output length of 1 byte", () => {
      const msg = new TextEncoder().encode("short");
      const DST = new TextEncoder().encode("test-DST");
      const result = expandMessageXMD(sodium, msg, DST, 1);
      expect(result.length).toBe(1);
    });

    it("handles empty message", () => {
      const emptyMsg = new Uint8Array(0);
      const DST = new TextEncoder().encode("test-DST");
      const result = expandMessageXMD(sodium, emptyMsg, DST, 64);
      expect(result.length).toBe(64);
    });

    it("throws InvalidInputError for oversized output", () => {
      const msg = new TextEncoder().encode("test");
      const DST = new TextEncoder().encode("test-DST");
      // 255 * 64 + 1 = 16321, exceeds maximum
      expect(() => expandMessageXMD(sodium, msg, DST, 255 * 64 + 1)).toThrow(
        InvalidInputError,
      );
    });

    it("throws InvalidInputError for DST > 255 bytes", () => {
      const msg = new TextEncoder().encode("test");
      const longDST = new Uint8Array(256);
      expect(() => expandMessageXMD(sodium, msg, longDST, 64)).toThrow(
        InvalidInputError,
      );
    });

    it("lenInBytes = 0 produces empty output", () => {
      const msg = new TextEncoder().encode("zero-len");
      const DST = new TextEncoder().encode("test-DST");
      const result = expandMessageXMD(sodium, msg, DST, 0);
      expect(result.length).toBe(0);
    });

    /**
     * Cross-implementation known-answer vectors.
     *
     * Generated with Python 3.9 hashlib.sha512, following
     * RFC 9380 Section 5.3.1. DST chosen to match the RFC's
     * test suite naming convention (QUUX-V01-CS02).
     */
    describe("known-answer vectors (Python cross-validated)", () => {
      const DST = fromHex(
        "515555582d5630312d435330322d776974682d657870616e6465722d534841353132",
      );

      it("64-byte output matches Python reference", () => {
        const msg = fromHex("746573742d766563746f722d6d7367");
        const expected = fromHex(
          "d00ee36a2d723b1032c5a1c12feeeb0e790519e507c7e9591d9d5414eee7c2ec" +
            "f2079f2387e97d20b06e723fe90c6327d178cac933f1b16094346275194f4574",
        );
        const result = expandMessageXMD(sodium, msg, DST, 64);
        expect(toHex(result)).toBe(toHex(expected));
      });

      it("128-byte multi-round output matches Python reference", () => {
        const msg = fromHex("746573742d766563746f722d6d7367");
        const expected = fromHex(
          "0ea7bf38491ae7121af85518fff9654ff2d4c6517bccf361b86c0d2d187a40df" +
            "eddbd95e02e0827b5780a7dc5e7a0c20fb3836110336e05139140599863c06ba" +
            "0e29dbd186dce984db1b5e82ba3b18c1fe0a75f478dfae2bf87366836364c778" +
            "be60d12d76899677c9d8b23521d01e5a143212333a36e90e30e86f528568717b",
        );
        const result = expandMessageXMD(sodium, msg, DST, 128);
        expect(toHex(result)).toBe(toHex(expected));
      });

      it("empty message output matches Python reference", () => {
        const msg = new Uint8Array(0);
        const expected = fromHex(
          "3b2cdbc50e5cb4afb6e737926f729437b6c355a172a8ac4b76b5e8b6bbb73d96" +
            "5120996d86d4b0a441c4c149869aa1adfdcb6b1b83d152aa97de10a210d3ebd6",
        );
        const result = expandMessageXMD(sodium, msg, DST, 64);
        expect(toHex(result)).toBe(toHex(expected));
      });
    });
  });

  describe("HASH_TO_GROUP_DST", () => {
    it("starts with 'HashToGroup-'", () => {
      const prefix = new TextEncoder().encode("HashToGroup-");
      expect(HASH_TO_GROUP_DST.subarray(0, prefix.length)).toEqual(prefix);
    });

    it("contains OPRF mode byte 0x00", () => {
      // contextString = "OPRFV1-" || 0x00 || "-" || "ristretto255-SHA512"
      // DST = "HashToGroup-" || contextString
      const dstStr = new TextDecoder().decode(HASH_TO_GROUP_DST);
      expect(dstStr).toContain("OPRFV1-");
      expect(dstStr).toContain("ristretto255-SHA512");
      // Byte 19 should be 0x00 (mode byte after "HashToGroup-OPRFV1-")
      expect(HASH_TO_GROUP_DST[19]).toBe(0x00);
    });

    it("is under 255 bytes (DST length limit)", () => {
      expect(HASH_TO_GROUP_DST.length).toBeLessThan(256);
    });
  });

  describe("buildFinalizeInput", () => {
    it("produces correct format: I2OSP(len,2) || data || I2OSP(len,2) || data || 'Finalize'", () => {
      const input = new Uint8Array([0xaa, 0xbb]);
      const unblinded = new Uint8Array([0xcc, 0xdd, 0xee]);
      const result = buildFinalizeInput(input, unblinded);

      // I2OSP(2, 2) = [0x00, 0x02]
      expect(result[0]).toBe(0x00);
      expect(result[1]).toBe(0x02);
      // input bytes
      expect(result[2]).toBe(0xaa);
      expect(result[3]).toBe(0xbb);
      // I2OSP(3, 2) = [0x00, 0x03]
      expect(result[4]).toBe(0x00);
      expect(result[5]).toBe(0x03);
      // unblinded bytes
      expect(result[6]).toBe(0xcc);
      expect(result[7]).toBe(0xdd);
      expect(result[8]).toBe(0xee);
      // "Finalize" suffix
      const suffix = new TextEncoder().encode("Finalize");
      expect(result.subarray(9)).toEqual(suffix);
    });

    it("handles I2OSP length > 255 (two-byte big-endian)", () => {
      const input = new Uint8Array(300);
      const unblinded = new Uint8Array(32);
      const result = buildFinalizeInput(input, unblinded);
      // I2OSP(300, 2) = [0x01, 0x2C]
      expect(result[0]).toBe(0x01);
      expect(result[1]).toBe(0x2c);
    });

    it("length prefixing prevents ambiguous concatenation (injectivity)", () => {
      // Without length prefixes, these two pairs produce the same
      // raw concatenation: [0xAA, 0xBB, 0xCC]
      // With I2OSP length prefixes, they produce different encodings.
      const resultA = buildFinalizeInput(
        new Uint8Array([0xaa, 0xbb]),
        new Uint8Array([0xcc]),
      );
      const resultB = buildFinalizeInput(
        new Uint8Array([0xaa]),
        new Uint8Array([0xbb, 0xcc]),
      );
      expect(resultA).not.toEqual(resultB);
    });

    it("empty inputs produce distinct encodings from non-empty", () => {
      const withEmpty = buildFinalizeInput(
        new Uint8Array(0),
        new Uint8Array([0x01]),
      );
      const withByte = buildFinalizeInput(
        new Uint8Array([0x00]),
        new Uint8Array([0x01]),
      );
      expect(withEmpty).not.toEqual(withByte);
      // Verify the length prefix distinguishes them:
      // empty input: I2OSP(0,2) = [0x00, 0x00]
      // 1-byte input: I2OSP(1,2) = [0x00, 0x01]
      expect(withEmpty[0]).toBe(0x00);
      expect(withEmpty[1]).toBe(0x00);
      expect(withByte[0]).toBe(0x00);
      expect(withByte[1]).toBe(0x01);
    });

    it("throws InvalidInputError when input exceeds 65535 bytes", () => {
      const input = new Uint8Array(65536);
      const unblinded = new Uint8Array(32);
      expect(() => buildFinalizeInput(input, unblinded)).toThrow(
        InvalidInputError,
      );
    });

    it("throws InvalidInputError when the unblinded element exceeds 65535 bytes", () => {
      const input = new Uint8Array(2);
      const unblinded = new Uint8Array(65536);
      expect(() => buildFinalizeInput(input, unblinded)).toThrow(
        InvalidInputError,
      );
    });

    it("encodes a 65535-byte length at the two-byte boundary", () => {
      const input = new Uint8Array(65535);
      const unblinded = new Uint8Array(32);
      const result = buildFinalizeInput(input, unblinded);
      // I2OSP(65535, 2) = [0xff, 0xff]
      expect(result[0]).toBe(0xff);
      expect(result[1]).toBe(0xff);
    });
  });
});
