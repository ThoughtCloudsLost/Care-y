/**
 * Server-side secrets encryption for operational data (telephony config, etc.).
 *
 * Encrypts arbitrary Buffer payloads using a key derived from OPS_SECRETS_KEY
 * via HKDF with a domain-separated info string. Uses XSalsa20-Poly1305
 * (crypto_secretbox) for authenticated encryption.
 *
 * Wire format: nonce(24) || mac+ciphertext(16+N) stored as bytea.
 */

import { hkdfSync } from "node:crypto";
import sodium from "sodium-native";
import { SecretCryptoError } from "../errors.js";

const SECRETS_ENCRYPT_INFO = "care-y-secrets-encrypt-v1";
const REQUIRED_KEY_LENGTH = 32;

/**
 * Derives a secrets encryption key from OPS_SECRETS_KEY via HKDF.
 * Call once at startup, pass the result via dependency injection.
 */
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
  /** Encrypts a plaintext Buffer. Returns nonce(24) || ciphertext. */
  encrypt(plaintext: Buffer): Buffer;
  /** Decrypts a nonce(24) || ciphertext Buffer. Returns plaintext. */
  // care-y-ignore-next-line server-no-decrypt -- operational credentials (Twilio config), not E2EE client data. Server must decrypt to make outbound API calls (OPS1 design).
  decrypt(sealed: Buffer): Buffer;
}

/**
 * Creates a SecretsEncryptor using XSalsa20-Poly1305 (crypto_secretbox).
 * Wire format: nonce(24 bytes) || mac+ciphertext(16+N bytes), stored as bytea.
 */
export function createSecretsEncryptor(key: Buffer): SecretsEncryptor {
  if (key.length !== sodium.crypto_secretbox_KEYBYTES) {
    throw new SecretCryptoError(
      `Secrets key must be ${String(sodium.crypto_secretbox_KEYBYTES)} bytes, got ${String(key.length)}`,
    );
  }

  return {
    encrypt(plaintext: Buffer): Buffer {
      const nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
      sodium.randombytes_buf(nonce);

      const ciphertext = Buffer.alloc(
        plaintext.length + sodium.crypto_secretbox_MACBYTES,
      );
      try {
        sodium.crypto_secretbox_easy(ciphertext, plaintext, nonce, key);
        return Buffer.concat([nonce, ciphertext]);
      } catch (err) {
        ciphertext.fill(0);
        throw new SecretCryptoError(
          `Encryption failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },

    // care-y-ignore-next-line server-no-decrypt -- operational credentials (Twilio config), not E2EE client data. Server must decrypt to make outbound API calls (OPS1 design).
    decrypt(sealed: Buffer): Buffer {
      const minLength =
        sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES;
      if (sealed.length < minLength) {
        throw new SecretCryptoError(
          "Ciphertext too short to contain nonce + MAC",
        );
      }

      const nonce = sealed.subarray(0, sodium.crypto_secretbox_NONCEBYTES);
      const ciphertext = sealed.subarray(sodium.crypto_secretbox_NONCEBYTES);
      const plaintext = Buffer.alloc(
        ciphertext.length - sodium.crypto_secretbox_MACBYTES,
      );

      try {
        const ok = sodium.crypto_secretbox_open_easy(
          plaintext,
          ciphertext,
          nonce,
          key,
        );
        if (!ok) {
          throw new SecretCryptoError(
            "Decryption failed: authentication tag mismatch",
          );
        }
        return plaintext;
      } catch (err) {
        if (err instanceof SecretCryptoError) throw err;
        throw new SecretCryptoError(
          `Decryption failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
  };
}
