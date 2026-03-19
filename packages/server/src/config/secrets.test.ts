import { describe, it, expect } from "vitest";
import { deriveSecretsKey, createSecretsEncryptor } from "./secrets.js";
import { deriveKeys } from "../crypto/field-encryptor.js";
import { SecretCryptoError } from "../errors.js";

// Deterministic 32-byte test key (hardcoded, not from env).
const TEST_OPS_KEY = Buffer.from(
  "cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe",
  "hex",
);

describe("deriveSecretsKey", () => {
  it("returns a 32-byte buffer", () => {
    const key = deriveSecretsKey(TEST_OPS_KEY);
    expect(key.length).toBe(32);
  });

  it("is deterministic (same input produces same output)", () => {
    const a = deriveSecretsKey(TEST_OPS_KEY);
    const b = deriveSecretsKey(TEST_OPS_KEY);
    expect(a.equals(b)).toBe(true);
  });

  it("throws SecretCryptoError for a key shorter than 32 bytes", () => {
    expect(() => deriveSecretsKey(Buffer.alloc(16))).toThrow(SecretCryptoError);
  });

  it("throws SecretCryptoError for a key longer than 32 bytes", () => {
    expect(() => deriveSecretsKey(Buffer.alloc(64))).toThrow(SecretCryptoError);
  });

  it("produces a key that differs from field-encryptor derived keys (domain separation)", () => {
    const secretsKey = deriveSecretsKey(TEST_OPS_KEY);
    const fieldKeys = deriveKeys(TEST_OPS_KEY);
    expect(secretsKey.equals(fieldKeys.blindIndexKey)).toBe(false);
    expect(secretsKey.equals(fieldKeys.fieldEncryptKey)).toBe(false);
  });
});

describe("createSecretsEncryptor", () => {
  const key = deriveSecretsKey(TEST_OPS_KEY);
  const encryptor = createSecretsEncryptor(key);

  it("throws SecretCryptoError for wrong-length key", () => {
    expect(() => createSecretsEncryptor(Buffer.alloc(16))).toThrow(
      SecretCryptoError,
    );
  });

  describe("encrypt/decrypt roundtrip", () => {
    it("roundtrips an empty buffer", () => {
      const input = Buffer.alloc(0);
      // care-y-ignore-next-line server-no-decrypt -- test-only roundtrip for OPS_SECRETS_KEY encryption (operational credentials, not E2EE client data)
      const result = encryptor.decrypt(encryptor.encrypt(input));
      expect(result.equals(input)).toBe(true);
    });

    it("roundtrips a 1-byte buffer", () => {
      const input = Buffer.from([0x42]);
      // care-y-ignore-next-line server-no-decrypt -- test-only roundtrip for OPS_SECRETS_KEY encryption (operational credentials, not E2EE client data)
      const result = encryptor.decrypt(encryptor.encrypt(input));
      expect(result.equals(input)).toBe(true);
    });

    it("roundtrips a 1KB buffer", () => {
      const input = Buffer.alloc(1024, 0xab);
      // care-y-ignore-next-line server-no-decrypt -- test-only roundtrip for OPS_SECRETS_KEY encryption (operational credentials, not E2EE client data)
      const result = encryptor.decrypt(encryptor.encrypt(input));
      expect(result.equals(input)).toBe(true);
    });

    it("roundtrips a 64KB buffer", () => {
      const input = Buffer.alloc(64 * 1024, 0xcd);
      // care-y-ignore-next-line server-no-decrypt -- test-only roundtrip for OPS_SECRETS_KEY encryption (operational credentials, not E2EE client data)
      const result = encryptor.decrypt(encryptor.encrypt(input));
      expect(result.equals(input)).toBe(true);
    });
  });

  it("produces different output for the same input (random nonce)", () => {
    const input = Buffer.from("same payload");
    const a = encryptor.encrypt(input);
    const b = encryptor.encrypt(input);
    expect(a.equals(b)).toBe(false);
  });

  // Wire format contract: nonce(24) || mac+ciphertext(16+N) stored as bytea
  // in telephony_config. Changing this format breaks all existing encrypted rows.
  it("ciphertext is exactly 24 + 16 + plaintext.length bytes", () => {
    const input = Buffer.from("test payload");
    const sealed = encryptor.encrypt(input);
    expect(sealed.length).toBe(24 + 16 + input.length);
  });

  it("throws SecretCryptoError when decrypting with wrong key", () => {
    const altOpsKey = Buffer.from(
      "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      "hex",
    );
    const altEncryptor = createSecretsEncryptor(deriveSecretsKey(altOpsKey));
    const sealed = encryptor.encrypt(Buffer.from("secret"));
    // care-y-ignore-next-line server-no-decrypt -- test-only: verifying wrong-key rejection
    expect(() => altEncryptor.decrypt(sealed)).toThrow(SecretCryptoError);
  });

  it("throws SecretCryptoError when ciphertext is tampered", () => {
    const sealed = encryptor.encrypt(Buffer.from("tamper test"));
    const corrupted = Buffer.from(sealed);
    // Flip a bit in the ciphertext portion (after the 24-byte nonce)
    const byte = corrupted[30];
    if (byte !== undefined) corrupted[30] = byte ^ 0x01;
    // care-y-ignore-next-line server-no-decrypt -- test-only: verifying tamper detection
    expect(() => encryptor.decrypt(corrupted)).toThrow(SecretCryptoError);
  });

  it("throws SecretCryptoError when ciphertext is truncated", () => {
    const sealed = encryptor.encrypt(Buffer.from("truncate test"));
    const truncated = sealed.subarray(0, 20);
    // care-y-ignore-next-line server-no-decrypt -- test-only: verifying truncation rejection
    expect(() => encryptor.decrypt(truncated)).toThrow(SecretCryptoError);
  });
});
