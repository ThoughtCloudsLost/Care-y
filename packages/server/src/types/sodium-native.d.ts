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

  // --- Memory hardening (OPRF process) ---

  /**
   * Allocates `size` bytes of guard-paged, canary-protected memory.
   * The returned buffer is page-aligned with guard pages before and after.
   */
  export function sodium_malloc(size: number): Buffer;

  /** Locks `buf` into RAM, preventing it from being swapped to disk. */
  export function sodium_mlock(buf: Buffer): void;

  /** Makes `buf` read-only at the OS level (MMU protection). */
  export function sodium_mprotect_readonly(buf: Buffer): void;

  /** Makes `buf` read-write at the OS level. */
  export function sodium_mprotect_readwrite(buf: Buffer): void;

  /** Securely zeros `buf` (not optimized away by the compiler). */
  export function sodium_memzero(buf: Buffer): void;
}
