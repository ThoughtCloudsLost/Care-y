/**
 * Unit tests for server-side branding crypto.
 *
 * deriveBrandingKey produces the AEAD key that protects branding blobs
 * (PWA icons, client branding payload) at rest. decryptBrandingBlob opens
 * nonce-prefixed XChaCha20-Poly1305 blobs. The module exposes no encrypt
 * counterpart, so these tests seal blobs with sealBrandingBlob, which
 * mirrors the layout the decryptor documents: nonce (24) || ciphertext
 * (plaintext + 16-byte tag), AAD "care-y-client-branding-aad-v1".
 *
 * A helper that mirrors the decryptor can agree with a bug, so the
 * cross-package interop suite at the bottom is the real correctness
 * check: it encrypts with the browser's own code path and decrypts here.
 *
 * No DB access; runs on host and in Docker.
 */

import { describe, it, expect, beforeAll } from "vitest";
import sodium from "sodium-native";
import {
  encryptClientBranding,
  decryptClientBranding,
  getSodium,
} from "@care-y/crypto";
import { deriveBrandingKey, decryptBrandingBlob } from "./branding-crypto.js";
import { CryptoError } from "../errors.js";
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
  it("derives a key sized for the XChaCha20-Poly1305 AEAD", () => {
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    expect(key.length).toBe(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES);
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

  it("returns null for blobs shorter than the nonce plus tag envelope", () => {
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const minLen =
      sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES +
      sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES;

    expect(decryptBrandingBlob(Buffer.alloc(0), key)).toBeNull();
    expect(decryptBrandingBlob(Buffer.alloc(minLen - 1), key)).toBeNull();
  });

  it("returns null for garbage at the minimum envelope size", () => {
    // Exactly nonce + tag bytes passes the length guard but carries no
    // valid tag; must fail closed rather than report an empty plaintext.
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const minLen =
      sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES +
      sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES;
    const garbage = Buffer.alloc(minLen);
    sodium.randombytes_buf(garbage);

    expect(decryptBrandingBlob(garbage, key)).toBeNull();
  });

  it("returns null when the associated data does not match", () => {
    // The AAD is what separates branding ciphertext from every other
    // content slot. A blob sealed without it must not open here, or the
    // domain separation ADR-053 introduced is decorative.
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const nonce = Buffer.alloc(
      sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
    );
    sodium.randombytes_buf(nonce);
    const sealed = Buffer.alloc(
      PAYLOAD.length + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES,
    );
    sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      sealed,
      PAYLOAD,
      Buffer.from("care-y-some-other-aad", "utf-8"),
      null,
      nonce,
      key,
    );

    expect(decryptBrandingBlob(Buffer.concat([nonce, sealed]), key)).toBeNull();
  });

  it("throws CryptoError on a wrong-length key instead of returning null", () => {
    // A malformed key is a programming error, not an authentication
    // failure. It must never surface as a null that looks like a routine
    // decrypt miss, or a key-derivation bug would degrade silently to
    // "branding not configured" everywhere.
    const key = deriveBrandingKey(TEST_ORG_PUBLIC_KEY);
    const blob = sealBrandingBlob(PAYLOAD, key);
    const shortKey = Buffer.alloc(16);

    expect(() => decryptBrandingBlob(blob, shortKey)).toThrow(CryptoError);
  });
});

describe("cross-package branding interop", () => {
  beforeAll(async () => {
    await getSodium();
  });

  it("decrypts a blob produced by the browser's encryptClientBranding", () => {
    // The production path: the browser encrypts branding, the server
    // decrypts it to serve icons and the PWA manifest. Every other test in
    // this file seals with a helper that mirrors the decryptor, so only
    // this one can catch the two sides drifting apart.
    const blob = encryptClientBranding(
      new Uint8Array(PAYLOAD),
      new Uint8Array(TEST_ORG_PUBLIC_KEY),
    );

    const result = decryptBrandingBlob(
      Buffer.from(blob),
      deriveBrandingKey(TEST_ORG_PUBLIC_KEY),
    );

    expect(result).toEqual(PAYLOAD);
  });

  it("rejects a browser blob sealed for a different org", () => {
    const blob = encryptClientBranding(
      new Uint8Array(PAYLOAD),
      new Uint8Array(OTHER_ORG_PUBLIC_KEY),
    );

    expect(
      decryptBrandingBlob(
        Buffer.from(blob),
        deriveBrandingKey(TEST_ORG_PUBLIC_KEY),
      ),
    ).toBeNull();
  });

  it("agrees with the browser on the derived key bytes", () => {
    // Both sides derive independently. If the labels or hash ever diverge,
    // the browser can still read its own blobs and the server silently
    // serves defaults, so compare the derivation directly.
    const blob = encryptClientBranding(
      new Uint8Array(PAYLOAD),
      new Uint8Array(TEST_ORG_PUBLIC_KEY),
    );

    expect(
      Buffer.from(
        decryptClientBranding(blob, new Uint8Array(TEST_ORG_PUBLIC_KEY)),
      ),
    ).toEqual(PAYLOAD);
    expect(
      decryptBrandingBlob(
        Buffer.from(blob),
        deriveBrandingKey(TEST_ORG_PUBLIC_KEY),
      ),
    ).toEqual(PAYLOAD);
  });
});
