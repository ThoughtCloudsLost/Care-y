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

  // --- Sealed box (crypto_box_seal, Curve25519) ---
  export const crypto_box_PUBLICKEYBYTES: 32;
  export const crypto_box_SECRETKEYBYTES: 32;
  export const crypto_box_SEEDBYTES: 32;
  export const crypto_box_SEALBYTES: 48;

  /**
   * Generates a Curve25519 keypair. Both buffers must be pre-allocated.
   * `pk` must be crypto_box_PUBLICKEYBYTES bytes.
   * `sk` must be crypto_box_SECRETKEYBYTES bytes.
   */
  export function crypto_box_keypair(pk: Buffer, sk: Buffer): void;

  /**
   * Generates a deterministic Curve25519 keypair from a 32-byte seed.
   * Same seed always produces the same keypair.
   * `pk` must be crypto_box_PUBLICKEYBYTES bytes.
   * `sk` must be crypto_box_SECRETKEYBYTES bytes.
   * `seed` must be crypto_box_SEEDBYTES bytes.
   */
  export function crypto_box_seed_keypair(
    pk: Buffer,
    sk: Buffer,
    seed: Buffer,
  ): void;

  /**
   * Encrypts `message` into `ciphertext` using an ephemeral key and
   * the recipient's `publicKey`. The sender is anonymous.
   * `ciphertext` must be `message.length + crypto_box_SEALBYTES` bytes.
   */
  export function crypto_box_seal(
    ciphertext: Buffer,
    message: Buffer,
    publicKey: Buffer,
  ): void;

  /**
   * Opens a sealed box. Type declared for test-only roundtrip verification.
   * The server never calls this in production (no unseal on SealedBoxEncryptor).
   * `plaintext` must be `ciphertext.length - crypto_box_SEALBYTES` bytes.
   */
  // care-y-ignore-next-line server-no-decrypt -- type declaration for test-only roundtrip verification, not called in production
  export function crypto_box_seal_open(
    plaintext: Buffer,
    ciphertext: Buffer,
    publicKey: Buffer,
    secretKey: Buffer,
  ): boolean;

  // --- Hashing (BLAKE2b) ---
  export const crypto_generichash_BYTES: 32;
  export const crypto_generichash_BYTES_MIN: 16;
  export const crypto_generichash_BYTES_MAX: 64;

  /**
   * Computes a BLAKE2b hash of `input` into `output`.
   * `output` must be between crypto_generichash_BYTES_MIN and BYTES_MAX.
   * `key` is optional (null for unkeyed hashing).
   */
  export function crypto_generichash(
    output: Buffer,
    input: Buffer,
    key?: Buffer | null,
  ): void;

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
