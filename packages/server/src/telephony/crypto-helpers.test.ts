/**
 * Unit tests for telephony crypto helpers (sealString, sealBufferAndZero,
 * encryptString).
 *
 * Verifies the encrypt-and-zero contract: plaintext Buffers are zeroed
 * in the finally block regardless of whether the encrypt call succeeds
 * or throws. Uses minimal stubs (no real key material).
 */

import { describe, it, expect } from "vitest";
import {
  sealString,
  sealBufferAndZero,
  encryptString,
} from "./crypto-helpers.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";

/** Minimal stub that returns the input bytes prefixed with a tag. */
function createStubEncryptor(): SealedBoxEncryptor {
  return {
    generation: 1,
    seal(plaintext: string): Buffer {
      return Buffer.from(`sealed:${plaintext}`);
    },
    sealBuffer(data: Buffer): Buffer {
      return Buffer.concat([Buffer.from("sealed:"), data]);
    },
  };
}

/** Stub that always throws from sealBuffer. */
function createThrowingEncryptor(): SealedBoxEncryptor {
  return {
    generation: 1,
    seal(): Buffer {
      throw new Error("seal failure");
    },
    sealBuffer(): Buffer {
      throw new Error("sealBuffer failure");
    },
  };
}

describe("crypto-helpers", () => {
  describe("sealString", () => {
    it("returns the encrypted Buffer from sealBuffer", () => {
      const enc = createStubEncryptor();
      const result = sealString(enc, "hello");

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe("sealed:hello");
    });

    it("zeros the intermediate plaintext Buffer after successful seal", () => {
      const captured: Buffer[] = [];
      const enc: SealedBoxEncryptor = {
        generation: 1,
        seal(plaintext: string): Buffer {
          return Buffer.from(`sealed:${plaintext}`);
        },
        sealBuffer(data: Buffer): Buffer {
          // Capture a copy and the original reference
          captured.push(data);
          return Buffer.concat([Buffer.from("sealed:"), Buffer.from(data)]);
        },
      };

      sealString(enc, "secret-text");

      // The Buffer passed to sealBuffer must be zeroed after the call
      expect(captured).toHaveLength(1);
      const original = captured[0] as Buffer;
      expect(original.every((b) => b === 0)).toBe(true);
    });

    it("zeros the intermediate plaintext Buffer even when sealBuffer throws", () => {
      const captured: Buffer[] = [];
      const enc: SealedBoxEncryptor = {
        generation: 1,
        seal(): Buffer {
          throw new Error("unused");
        },
        sealBuffer(data: Buffer): Buffer {
          captured.push(data);
          throw new Error("sealBuffer failure");
        },
      };

      expect(() => sealString(enc, "secret-text")).toThrow(
        "sealBuffer failure",
      );

      expect(captured).toHaveLength(1);
      const original = captured[0] as Buffer;
      expect(original.every((b) => b === 0)).toBe(true);
    });
  });

  describe("sealBufferAndZero", () => {
    it("returns the encrypted Buffer from sealBuffer", () => {
      const enc = createStubEncryptor();
      const input = Buffer.from("binary-data");
      const result = sealBufferAndZero(enc, input);

      expect(Buffer.isBuffer(result)).toBe(true);
      // The result contains the sealed prefix (the input was zeroed after seal)
      expect(result.toString().startsWith("sealed:")).toBe(true);
    });

    it("zeros the input Buffer after successful seal", () => {
      const enc = createStubEncryptor();
      const input = Buffer.from("plaintext-bytes");

      sealBufferAndZero(enc, input);

      expect(input.every((b) => b === 0)).toBe(true);
    });

    it("zeros the input Buffer even when sealBuffer throws", () => {
      const enc = createThrowingEncryptor();
      const input = Buffer.from("plaintext-bytes");

      expect(() => sealBufferAndZero(enc, input)).toThrow("sealBuffer failure");

      expect(input.every((b) => b === 0)).toBe(true);
    });

    it("handles an empty Buffer without error", () => {
      const enc = createStubEncryptor();
      const input = Buffer.alloc(0);
      const result = sealBufferAndZero(enc, input);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(input.length).toBe(0);
    });
  });

  describe("encryptString", () => {
    /** Minimal FieldEncryptor stub that prefixes input with "ops:". */
    function createStubFieldEncryptor(): FieldEncryptor {
      return {
        encrypt(plaintext: string): Buffer {
          return Buffer.from(`ops:${plaintext}`);
        },
        encryptBuffer(data: Buffer): Buffer {
          return Buffer.concat([Buffer.from("ops:"), data]);
        },
        decrypt(ciphertext: Buffer): string {
          return ciphertext.toString().replace("ops:", "");
        },
        decryptToBuffer(ciphertext: Buffer): Buffer {
          return Buffer.from(ciphertext.toString().replace("ops:", ""));
        },
      };
    }

    it("returns the encrypted Buffer from encryptBuffer", () => {
      const enc = createStubFieldEncryptor();
      const result = encryptString(enc, "hello");

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe("ops:hello");
    });

    it("zeros the intermediate plaintext Buffer after successful encrypt", () => {
      const captured: Buffer[] = [];
      const enc: FieldEncryptor = {
        encrypt(plaintext: string): Buffer {
          return Buffer.from(`ops:${plaintext}`);
        },
        encryptBuffer(data: Buffer): Buffer {
          captured.push(data);
          return Buffer.concat([Buffer.from("ops:"), Buffer.from(data)]);
        },
        decrypt(ciphertext: Buffer): string {
          return ciphertext.toString();
        },
        decryptToBuffer(ciphertext: Buffer): Buffer {
          return Buffer.from(ciphertext);
        },
      };

      encryptString(enc, "secret-text");

      expect(captured).toHaveLength(1);
      const original = captured[0] as Buffer;
      expect(original.every((b) => b === 0)).toBe(true);
    });

    it("zeros the intermediate plaintext Buffer even when encryptBuffer throws", () => {
      const captured: Buffer[] = [];
      const enc: FieldEncryptor = {
        encrypt(): Buffer {
          throw new Error("unused");
        },
        encryptBuffer(data: Buffer): Buffer {
          captured.push(data);
          throw new Error("encryptBuffer failure");
        },
        decrypt(): string {
          throw new Error("unused");
        },
        decryptToBuffer(): Buffer {
          throw new Error("unused");
        },
      };

      expect(() => encryptString(enc, "secret-text")).toThrow(
        "encryptBuffer failure",
      );

      expect(captured).toHaveLength(1);
      const original = captured[0] as Buffer;
      expect(original.every((b) => b === 0)).toBe(true);
    });
  });
});
