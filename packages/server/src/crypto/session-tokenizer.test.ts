import { describe, it, expect } from "vitest";
import {
  deriveSessionHmacKey,
  createSessionTokenizer,
} from "./session-tokenizer.js";
import { CryptoError } from "../errors.js";

// Deterministic 32-byte test key (same as TEST_OPS_KEY in test-utils.ts)
const TEST_OPS_KEY = Buffer.from(
  "cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe",
  "hex",
);

describe("deriveSessionHmacKey", () => {
  it("produces a 32-byte Buffer from valid OPS_SECRETS_KEY", () => {
    const hmacKey = deriveSessionHmacKey(TEST_OPS_KEY);
    expect(hmacKey).toBeInstanceOf(Buffer);
    expect(hmacKey.length).toBe(32);
  });

  it("produces the same key for the same input (deterministic)", () => {
    const key1 = deriveSessionHmacKey(TEST_OPS_KEY);
    const key2 = deriveSessionHmacKey(TEST_OPS_KEY);
    expect(key1.equals(key2)).toBe(true);
  });

  it("throws CryptoError for 31-byte key", () => {
    expect(() => deriveSessionHmacKey(Buffer.alloc(31))).toThrow(CryptoError);
  });

  it("throws CryptoError for 33-byte key", () => {
    expect(() => deriveSessionHmacKey(Buffer.alloc(33))).toThrow(CryptoError);
  });

  it("throws CryptoError for empty key", () => {
    expect(() => deriveSessionHmacKey(Buffer.alloc(0))).toThrow(CryptoError);
  });
});

describe("createSessionTokenizer", () => {
  it("throws CryptoError for wrong-length HMAC key", () => {
    expect(() => createSessionTokenizer(Buffer.alloc(16))).toThrow(CryptoError);
  });

  it("throws CryptoError for empty HMAC key", () => {
    expect(() => createSessionTokenizer(Buffer.alloc(0))).toThrow(CryptoError);
  });

  it("creates a tokenizer with a valid 32-byte key", () => {
    const hmacKey = deriveSessionHmacKey(TEST_OPS_KEY);
    const tokenizer = createSessionTokenizer(hmacKey);
    expect(tokenizer).toHaveProperty("tokenize");
  });
});

describe("SessionTokenizer.tokenize", () => {
  const hmacKey = deriveSessionHmacKey(TEST_OPS_KEY);
  const tokenizer = createSessionTokenizer(hmacKey);

  it("produces consistent hex output across calls", () => {
    const token1 = tokenizer.tokenize("127.0.0.1");
    const token2 = tokenizer.tokenize("127.0.0.1");
    expect(token1).toBe(token2);
  });

  it("produces 64-character hex string (SHA-256 output)", () => {
    const token = tokenizer.tokenize("127.0.0.1");
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different tokens for different inputs", () => {
    const ipToken = tokenizer.tokenize("127.0.0.1");
    const uaToken = tokenizer.tokenize("Mozilla/5.0");
    expect(ipToken).not.toBe(uaToken);
  });

  it("produces different tokens for similar inputs", () => {
    const token1 = tokenizer.tokenize("192.168.1.1");
    const token2 = tokenizer.tokenize("192.168.1.2");
    expect(token1).not.toBe(token2);
  });

  it("handles empty string input", () => {
    const token = tokenizer.tokenize("");
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("handles unicode input", () => {
    const token = tokenizer.tokenize("Mözilla/5.0 日本語");
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("different keys produce different tokens for same input", () => {
    const otherKey = Buffer.alloc(32);
    otherKey.fill(0x42);
    const otherTokenizer = createSessionTokenizer(otherKey);

    const token1 = tokenizer.tokenize("127.0.0.1");
    const token2 = otherTokenizer.tokenize("127.0.0.1");
    expect(token1).not.toBe(token2);
  });
});
