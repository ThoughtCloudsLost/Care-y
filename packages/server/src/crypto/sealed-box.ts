/**
 * Server-blind sealed box encryption using crypto_box_seal (Curve25519).
 *
 * The server can seal (encrypt) data with the org public key but cannot
 * unseal it. Only volunteers holding the org secret key (unwrapped via
 * their masterKey-derived orgUnwrapKey) can decrypt.
 *
 * Wire format: crypto_box_seal output (ephemeral pk + mac + ciphertext),
 * stored as bytea. Size = plaintext.length + crypto_box_SEALBYTES (48 bytes).
 */

import sodium from "sodium-native";
import { CryptoError } from "../errors.js";

export interface SealedBoxEncryptor {
  /** Encrypt plaintext so only the org key holder can read it. */
  seal(plaintext: string): Buffer;
}

const CURVE25519_PK_BYTES = 32; // sodium.crypto_box_PUBLICKEYBYTES

/**
 * Creates a SealedBoxEncryptor bound to a specific org public key.
 * The public key is loaded once (from org_config) and reused for all seal() calls.
 */
export function createSealedBoxEncryptor(
  orgPublicKey: Buffer,
): SealedBoxEncryptor {
  if (orgPublicKey.length !== CURVE25519_PK_BYTES) {
    throw new CryptoError(
      `orgPublicKey must be ${String(CURVE25519_PK_BYTES)} bytes, got ${String(orgPublicKey.length)}`,
    );
  }

  return {
    seal(plaintext: string): Buffer {
      const message = Buffer.from(plaintext, "utf-8");
      try {
        const ciphertext = Buffer.alloc(
          message.length + sodium.crypto_box_SEALBYTES,
        );
        sodium.crypto_box_seal(ciphertext, message, orgPublicKey);
        return ciphertext;
      } finally {
        message.fill(0);
      }
    },
  };
}
