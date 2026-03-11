// Minimal type declarations for sodium-native v4.
// Covers only the functions used by field-encryptor.ts.
// Verified against sodium-native@4.3.3 binding.c (2026-03-08).

declare module "sodium-native" {
  // --- Constants ---
  export const crypto_secretbox_KEYBYTES: 32;
  export const crypto_secretbox_NONCEBYTES: 24;
  export const crypto_secretbox_MACBYTES: 16;

  // --- Random ---
  /** Fills `buf` with cryptographically secure random bytes. */
  export function randombytes_buf(buf: Buffer): void;

  // --- Secretbox (XSalsa20-Poly1305) ---
  /**
   * Encrypts `message` into `ciphertext` using `nonce` and `key`.
   * `ciphertext` must be `message.length + crypto_secretbox_MACBYTES` bytes.
   */
  export function crypto_secretbox_easy(
    ciphertext: Buffer,
    message: Buffer,
    nonce: Buffer,
    key: Buffer,
  ): void;

  /**
   * Decrypts `ciphertext` into `plaintext` using `nonce` and `key`.
   * Returns `true` on success, `false` if authentication fails.
   * `plaintext` must be `ciphertext.length - crypto_secretbox_MACBYTES` bytes.
   */
  export function crypto_secretbox_open_easy(
    plaintext: Buffer,
    ciphertext: Buffer,
    nonce: Buffer,
    key: Buffer,
  ): boolean;
}
