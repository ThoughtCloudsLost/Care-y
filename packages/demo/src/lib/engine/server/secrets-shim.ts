/**
 * Shim for packages/server/src/config/secrets.ts
 *
 * Replaces sodium-native with libsodium-wrappers-sumo.
 * Replaces node:crypto hkdfSync with the node-crypto-shim.
 *
 * Mirrors: packages/server/src/config/secrets.ts:1-115
 */

import _sodium from "libsodium-wrappers-sumo";
import { hkdfSync } from "./node-crypto-shim.js";

class SecretCryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecretCryptoError";
  }
}

const SECRETS_ENCRYPT_INFO = "care-y-secrets-encrypt-v1";
const REQUIRED_KEY_LENGTH = 32;
const NONCE_BYTES = 24; // crypto_secretbox_NONCEBYTES
const MAC_BYTES = 16; // crypto_secretbox_MACBYTES
const KEY_BYTES = 32; // crypto_secretbox_KEYBYTES

export function deriveSecretsKey(opsSecretsKey: Buffer): Buffer {
  if (opsSecretsKey.length !== REQUIRED_KEY_LENGTH) {
    throw new SecretCryptoError(
      `OPS_SECRETS_KEY must be exactly ${String(REQUIRED_KEY_LENGTH)} bytes, got ${String(opsSecretsKey.length)}`,
    );
  }

  return Buffer.from(
    hkdfSync(
      "sha256",
      opsSecretsKey,
      Buffer.alloc(0),
      SECRETS_ENCRYPT_INFO,
      32,
    ),
  );
}

export interface SecretsEncryptor {
  encrypt(plaintext: Buffer): Buffer;
  decrypt(sealed: Buffer): Buffer;
}

export function createSecretsEncryptor(key: Buffer): SecretsEncryptor {
  if (key.length !== KEY_BYTES) {
    throw new SecretCryptoError(
      `Secrets key must be ${String(KEY_BYTES)} bytes, got ${String(key.length)}`,
    );
  }

  const keyU8 = new Uint8Array(key);

  return {
    encrypt(plaintext: Buffer): Buffer {
      const nonce = _sodium.randombytes_buf(NONCE_BYTES);
      try {
        const ciphertext = _sodium.crypto_secretbox_easy(
          new Uint8Array(plaintext),
          nonce,
          keyU8,
        );
        return Buffer.concat([Buffer.from(nonce), Buffer.from(ciphertext)]);
      } catch (err: unknown) {
        throw new SecretCryptoError(
          `Encryption failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },

    decrypt(sealed: Buffer): Buffer {
      const minLength = NONCE_BYTES + MAC_BYTES;
      if (sealed.length < minLength) {
        throw new SecretCryptoError(
          "Ciphertext too short to contain nonce + MAC",
        );
      }

      const nonce = new Uint8Array(sealed.subarray(0, NONCE_BYTES));
      const ciphertext = new Uint8Array(sealed.subarray(NONCE_BYTES));

      try {
        const plaintext = _sodium.crypto_secretbox_open_easy(
          ciphertext,
          nonce,
          keyU8,
        );
        return Buffer.from(plaintext);
      } catch (err: unknown) {
        if (err instanceof SecretCryptoError) throw err;
        throw new SecretCryptoError(
          `Decryption failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
  };
}
