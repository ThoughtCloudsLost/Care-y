/**
 * Shim for packages/server/src/crypto/sealed-box.ts
 *
 * Replaces sodium-native with libsodium-wrappers-sumo (WASM).
 * API is identical: createSealedBoxEncryptor returns a SealedBoxEncryptor.
 *
 * Mirrors: packages/server/src/crypto/sealed-box.ts:1-59
 */

import _sodium from "libsodium-wrappers-sumo";

class CryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CryptoError";
  }
}

export interface SealedBoxEncryptor {
  seal(plaintext: string): Buffer;
  sealBuffer(data: Buffer): Buffer;
}

const CURVE25519_PK_BYTES = 32;

export function createSealedBoxEncryptor(
  orgPublicKey: Buffer,
): SealedBoxEncryptor {
  if (orgPublicKey.length !== CURVE25519_PK_BYTES) {
    throw new CryptoError(
      `orgPublicKey must be ${String(CURVE25519_PK_BYTES)} bytes, got ${String(orgPublicKey.length)}`,
    );
  }

  const pkU8 = new Uint8Array(orgPublicKey);

  return {
    seal(plaintext: string): Buffer {
      const message = Buffer.from(plaintext, "utf-8");
      try {
        const ciphertext = _sodium.crypto_box_seal(
          new Uint8Array(message),
          pkU8,
        );
        return Buffer.from(ciphertext);
      } finally {
        message.fill(0);
      }
    },

    sealBuffer(data: Buffer): Buffer {
      const ciphertext = _sodium.crypto_box_seal(new Uint8Array(data), pkU8);
      return Buffer.from(ciphertext);
    },
  };
}
