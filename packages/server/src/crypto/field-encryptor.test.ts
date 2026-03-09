import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  deriveKeys,
  createFieldEncryptor,
  createBlindIndexer,
  createNoopFieldEncryptor,
} from "./field-encryptor.js";
import { CryptoError } from "../errors.js";

// Deterministic 32-byte test key (not from env, not a real secret).
const TEST_KEY = Buffer.from(
  "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2",
  "hex",
);

// A different 32-byte key to test cross-key behavior.
const ALT_KEY = Buffer.from(
  "f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2",
  "hex",
);

describe("deriveKeys", () => {
  it("produces two 32-byte buffers", () => {
    const keys = deriveKeys(TEST_KEY);
    expect(keys.blindIndexKey.length).toBe(32);
    expect(keys.fieldEncryptKey.length).toBe(32);
  });

  it("is deterministic (same input produces same output)", () => {
    const a = deriveKeys(TEST_KEY);
    const b = deriveKeys(TEST_KEY);
    expect(a.blindIndexKey.equals(b.blindIndexKey)).toBe(true);
    expect(a.fieldEncryptKey.equals(b.fieldEncryptKey)).toBe(true);
  });

  it("produces different subkeys from each other", () => {
    const keys = deriveKeys(TEST_KEY);
    expect(keys.blindIndexKey.equals(keys.fieldEncryptKey)).toBe(false);
  });

  it("produces different subkeys for different master keys", () => {
    const a = deriveKeys(TEST_KEY);
    const b = deriveKeys(ALT_KEY);
    expect(a.blindIndexKey.equals(b.blindIndexKey)).toBe(false);
    expect(a.fieldEncryptKey.equals(b.fieldEncryptKey)).toBe(false);
  });

  it("rejects a key shorter than 32 bytes", () => {
    expect(() => deriveKeys(Buffer.alloc(16))).toThrow(CryptoError);
  });

  it("rejects a key longer than 32 bytes", () => {
    expect(() => deriveKeys(Buffer.alloc(64))).toThrow(CryptoError);
  });
});

describe("createFieldEncryptor", () => {
  const keys = deriveKeys(TEST_KEY);
  const encryptor = createFieldEncryptor(keys.fieldEncryptKey);

  it("roundtrips ASCII text", () => {
    const result = encryptor.decrypt(encryptor.encrypt("hello world"));
    expect(result).toBe("hello world");
  });

  it("roundtrips unicode text", () => {
    const input = "\u00e9\u00e0\u00fc \u5c0f\u660e \ud83d\ude00";
    const result = encryptor.decrypt(encryptor.encrypt(input));
    expect(result).toBe(input);
  });

  it("roundtrips empty string", () => {
    const result = encryptor.decrypt(encryptor.encrypt(""));
    expect(result).toBe("");
  });

  it("produces different ciphertext each call (random nonce)", () => {
    const a = encryptor.encrypt("same input");
    const b = encryptor.encrypt("same input");
    expect(a.equals(b)).toBe(false);
  });

  it("ciphertext is nonce(24) + mac+ct(16+N) bytes", () => {
    const ct = encryptor.encrypt("test");
    const messageLen = Buffer.byteLength("test", "utf-8");
    expect(ct.length).toBe(24 + 16 + messageLen);
  });

  it("rejects decryption with wrong key", () => {
    const altEncryptor = createFieldEncryptor(
      deriveKeys(ALT_KEY).fieldEncryptKey,
    );
    const ct = encryptor.encrypt("secret");
    expect(() => altEncryptor.decrypt(ct)).toThrow(CryptoError);
  });

  it("rejects truncated ciphertext", () => {
    const ct = encryptor.encrypt("hello");
    const truncated = ct.subarray(0, 20);
    expect(() => encryptor.decrypt(truncated)).toThrow(CryptoError);
  });

  it("rejects ciphertext with flipped bit", () => {
    const ct = encryptor.encrypt("hello");
    const corrupted = Buffer.from(ct);
    // Flip a bit in the ciphertext portion (after the 24-byte nonce)
    const byte = corrupted[30];
    if (byte !== undefined) corrupted[30] = byte ^ 0x01;
    expect(() => encryptor.decrypt(corrupted)).toThrow(CryptoError);
  });

  it("rejects empty buffer", () => {
    expect(() => encryptor.decrypt(Buffer.alloc(0))).toThrow(CryptoError);
  });

  it("rejects key with wrong length", () => {
    expect(() => createFieldEncryptor(Buffer.alloc(16))).toThrow(CryptoError);
  });

  // Property-based: arbitrary UTF-8 roundtrips
  it("roundtrips arbitrary strings (property-based)", () => {
    fc.assert(
      fc.property(fc.string(), (s: string) => {
        const result = encryptor.decrypt(encryptor.encrypt(s));
        return result === s;
      }),
      { numRuns: 200 },
    );
  });
});

describe("createBlindIndexer", () => {
  const keys = deriveKeys(TEST_KEY);
  const indexer = createBlindIndexer(keys.blindIndexKey);

  it("produces a 64-char hex string (SHA-256)", () => {
    const h = indexer.hash("test");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic", () => {
    expect(indexer.hash("alice")).toBe(indexer.hash("alice"));
  });

  it("is case-insensitive", () => {
    expect(indexer.hash("Alice")).toBe(indexer.hash("alice"));
    expect(indexer.hash("ALICE")).toBe(indexer.hash("alice"));
  });

  it("trims whitespace before hashing", () => {
    expect(indexer.hash("  alice  ")).toBe(indexer.hash("alice"));
  });

  it("produces different output for different inputs", () => {
    expect(indexer.hash("alice")).not.toBe(indexer.hash("bob"));
  });

  it("produces different output for different keys", () => {
    const altIndexer = createBlindIndexer(deriveKeys(ALT_KEY).blindIndexKey);
    expect(indexer.hash("alice")).not.toBe(altIndexer.hash("alice"));
  });

  it("rejects key with wrong length", () => {
    expect(() => createBlindIndexer(Buffer.alloc(16))).toThrow(CryptoError);
  });

  // Property-based: determinism for arbitrary inputs
  it("is deterministic for arbitrary strings (property-based)", () => {
    fc.assert(
      fc.property(fc.string(), (s: string) => {
        return indexer.hash(s) === indexer.hash(s);
      }),
      { numRuns: 200 },
    );
  });
});

describe("createNoopFieldEncryptor", () => {
  const noop = createNoopFieldEncryptor();

  it("roundtrips correctly", () => {
    const result = noop.decrypt(noop.encrypt("hello"));
    expect(result).toBe("hello");
  });

  it("roundtrips unicode", () => {
    const input = "\ud83d\ude80 test \u00e9";
    expect(noop.decrypt(noop.encrypt(input))).toBe(input);
  });

  it("roundtrips empty string", () => {
    expect(noop.decrypt(noop.encrypt(""))).toBe("");
  });
});
