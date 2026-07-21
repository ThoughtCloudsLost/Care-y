/**
 * Unit tests for server-side branding crypto.
 *
 * deriveBrandingKey produces the secretbox key that protects branding
 * blobs (PWA icons, client branding payload) at rest. decryptBrandingBlob
 * opens nonce-prefixed secretbox blobs. The module exposes no encrypt
 * counterpart, so these tests seal blobs with the same secretbox layout
 * the decryptor documents: nonce (24) || crypto_secretbox_easy output
 * (16-byte MAC + ciphertext).
 *
 * No DB access; runs on host and in Docker.
 */

import { describe, it, expect } from "vitest";
import sodium from "sodium-native";
import { deriveBrandingKey, decryptBrandingBlob } from "./branding-crypto.js";
import { sealBrandingBlob, TEST_ORG_PUBLIC_KEY } from "../test-utils.js";

/** A second, distinct org public key for cross-org negative cases. */
const OTHER_ORG_PUBLIC_KEY = Buffer.alloc(
  sodium.crypto_box_PUBLICKEYBYTES,
  0x42,
);

/** Icon-like binary payload (PNG magic bytes plus filler, no PII). */
const PAYLOAD = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from("branding-payload-bytes"),
]);

describe("deriveBrandingKey", () => {
  it("derives a key sized for crypto_secretbox", () => {
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    expect(key.length).toBe(sodium.crypto_secretbox_KEYBYTES);
  });

  it("is deterministic for the same org public key", () => {
    const a = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const b = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    expect(a).toEqual(b);
  });

  it("derives distinct keys for distinct org public keys", () => {
    const a = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const b = deriveBrandingKey(OTHER_ORG_PUBLIC_KEY);
    expect(a).not.toEqual(b);
  });

  it("matches the pinned BLAKE2b(label || publicKey) derivation vector", () => {
    // Stored-data contract: every branding blob at rest (BlobStore icons,
    // client_encrypted_branding column) is keyed by BLAKE2b-256 of
    // "care-y-branding-v1" || orgPublicKey. The browser derives the same
    // key (deriveClientBrandingKey in packages/crypto). Changing the label
    // or hash breaks decryption of all existing blobs, so the exact output
    // is pinned here.
    const key = deriveBrandingKey(OTHER_ORG_PUBLIC_KEY);
    expect(key.toString("hex")).toBe(
      "fe9646b6a385f7c6ab721bb9632611556930ff3d884873afdb623262273e30b6",
    );
  });
});

describe("decryptBrandingBlob", () => {
  it("roundtrips a blob sealed with the derived key", () => {
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const blob = sealBrandingBlob(PAYLOAD, key);

    const result = decryptBrandingBlob(blob, key);

    expect(result).not.toBeNull();
    expect(result).toEqual(PAYLOAD);
  });

  it("roundtrips an empty plaintext to a zero-length buffer", () => {
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const blob = sealBrandingBlob(Buffer.alloc(0), key);

    const result = decryptBrandingBlob(blob, key);

    expect(result).toEqual(Buffer.alloc(0));
  });

  it("returns null under a key derived from a different org public key", () => {
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const otherKey = deriveBrandingKey(OTHER_ORG_PUBLIC_KEY);
    const blob = sealBrandingBlob(PAYLOAD, key);

    // Wrong key must fail closed (null), never yield plaintext or garbage.
    expect(decryptBrandingBlob(blob, otherKey)).toBeNull();
  });

  it("returns null for a truncated blob", () => {
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const blob = sealBrandingBlob(PAYLOAD, key);

    const truncated = blob.subarray(0, blob.length - 1);
    expect(decryptBrandingBlob(truncated, key)).toBeNull();
  });

  it("returns null when a ciphertext bit is flipped", () => {
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const blob = Buffer.from(sealBrandingBlob(PAYLOAD, key));

    const idx = blob.length - 1;
    const byte = blob[idx];
    if (byte !== undefined) blob[idx] = byte ^ 0x01;
    expect(decryptBrandingBlob(blob, key)).toBeNull();
  });

  it("returns null when a nonce bit is flipped", () => {
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const blob = Buffer.from(sealBrandingBlob(PAYLOAD, key));

    const byte = blob[0];
    if (byte !== undefined) blob[0] = byte ^ 0x01;
    expect(decryptBrandingBlob(blob, key)).toBeNull();
  });

  it("returns null for blobs shorter than the nonce plus MAC envelope", () => {
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const minLen =
      sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES;

    expect(decryptBrandingBlob(Buffer.alloc(0), key)).toBeNull();
    expect(decryptBrandingBlob(Buffer.alloc(minLen - 1), key)).toBeNull();
  });

  it("returns null for garbage at the minimum envelope size", () => {
    // Exactly nonce + MAC bytes passes the length guard but carries no
    // valid MAC; must fail closed rather than report an empty plaintext.
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const minLen =
      sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES;
    const garbage = Buffer.alloc(minLen);
    sodium.randombytes_buf(garbage);

    expect(decryptBrandingBlob(garbage, key)).toBeNull();
  });

  it("throws on a wrong-length key instead of returning a result", () => {
    // sodium-native rejects wrong-size keys with an assertion. The contract
    // pinned here is that a malformed key can never produce plaintext or a
    // null that looks like a routine decrypt failure; it fails loudly.
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const blob = sealBrandingBlob(PAYLOAD, key);
    const shortKey = Buffer.alloc(16);

    expect(() => decryptBrandingBlob(blob, shortKey)).toThrow();
  });
});
