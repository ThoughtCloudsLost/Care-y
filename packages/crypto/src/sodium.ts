/**
 * Unified sodium interface backed by libsodium-wrappers-sumo (WASM).
 *
 * Async lazy singleton: call getSodium() once at startup, then use
 * requireSodium() synchronously in hot paths. Both environments (browser
 * and Node) use the same WASM backend for byte-for-byte parity.
 *
 * sodium-native was evaluated but excluded: it does not expose ristretto255
 * functions, which are required for OPRF and ECIES. The server package uses
 * sodium-native directly for its own server-only needs (field encryption,
 * blind indexes) but the isomorphic crypto library uses sumo exclusively.
 *
 * References:
 *   SEC-142  libsodium.js WASM bindings (sumo build for ristretto255)
 *   SEC-143  libsodium Emscripten symbols (confirms sumo includes ristretto255)
 *   SEC-052  libsodium crypto_secretbox (XSalsa20-Poly1305 interface)
 *   SEC-053  libsodium ristretto255 API (point arithmetic, scalar ops)
 *   SEC-051  libsodium Argon2id (crypto_pwhash interface)
 *   SEC-054  libsodium memory management (memzero interface)
 */

import { SodiumNotReadyError } from "./errors.js";

export interface SodiumBackend {
  // --- Random ---
  randombytes_buf(length: number): Uint8Array;

  // --- Secretbox (XSalsa20-Poly1305) ---
  crypto_secretbox_easy(
    message: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array;
  crypto_secretbox_open_easy(
    ciphertext: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array;
  readonly crypto_secretbox_NONCEBYTES: number;
  readonly crypto_secretbox_KEYBYTES: number;
  readonly crypto_secretbox_MACBYTES: number;

  // --- HMAC-SHA512 ---
  // One-shot API (fixed 32-byte key, for authentication)
  crypto_auth_hmacsha512(message: Uint8Array, key: Uint8Array): Uint8Array;
  readonly crypto_auth_hmacsha512_BYTES: number;
  readonly crypto_auth_hmacsha512_KEYBYTES: number;
  // Streaming API (variable-length key, needed for HKDF where salt and PRK
  // are not 32 bytes). StateAddress is a number (WASM heap pointer).
  crypto_auth_hmacsha512_init(key: Uint8Array): number;
  crypto_auth_hmacsha512_update(state: number, data: Uint8Array): void;
  crypto_auth_hmacsha512_final(state: number): Uint8Array;

  // --- Generic hash (BLAKE2b, for branding key) ---
  crypto_generichash(
    hashLength: number,
    message: Uint8Array,
    key?: Uint8Array | null,
  ): Uint8Array;

  // --- Ristretto255 ---
  crypto_core_ristretto255_scalar_random(): Uint8Array;
  crypto_core_ristretto255_scalar_invert(scalar: Uint8Array): Uint8Array;
  crypto_core_ristretto255_scalar_mul(x: Uint8Array, y: Uint8Array): Uint8Array;
  crypto_core_ristretto255_scalar_add(x: Uint8Array, y: Uint8Array): Uint8Array;
  crypto_core_ristretto255_scalar_sub(x: Uint8Array, y: Uint8Array): Uint8Array;
  crypto_core_ristretto255_scalar_reduce(nonReduced: Uint8Array): Uint8Array;
  crypto_core_ristretto255_from_hash(hash: Uint8Array): Uint8Array;
  crypto_scalarmult_ristretto255(
    scalar: Uint8Array,
    point: Uint8Array,
  ): Uint8Array;
  crypto_scalarmult_ristretto255_base(scalar: Uint8Array): Uint8Array;
  crypto_core_ristretto255_add(p: Uint8Array, q: Uint8Array): Uint8Array;
  readonly crypto_core_ristretto255_BYTES: number;
  readonly crypto_core_ristretto255_SCALARBYTES: number;
  readonly crypto_core_ristretto255_HASHBYTES: number;

  // --- Argon2id (password hashing) ---
  crypto_pwhash(
    keyLength: number,
    password: Uint8Array,
    salt: Uint8Array,
    opsLimit: number,
    memLimit: number,
    alg: number,
  ): Uint8Array;
  readonly crypto_pwhash_ALG_ARGON2ID13: number;
  readonly crypto_pwhash_SALTBYTES: number;

  // --- SHA-512 (for RFC 9380 expand_message_xmd) ---
  crypto_hash_sha512(message: Uint8Array): Uint8Array;

  // --- Curve25519 sealed box (for org key tier) ---
  // The org keypair is Curve25519, separate from the ristretto255 keys used for ECIES.
  // crypto_box_seal: client-side sealing of KB articles, branding, org config.
  // crypto_box_seal_open: client-side unsealing via OrgKeyManager.
  // crypto_box_keypair: org keypair generation during admin onboarding.
  crypto_box_seal(message: Uint8Array, publicKey: Uint8Array): Uint8Array;
  crypto_box_seal_open(
    ciphertext: Uint8Array,
    publicKey: Uint8Array,
    secretKey: Uint8Array,
  ): Uint8Array;
  crypto_box_keypair(): {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
    keyType: string;
  };
  crypto_scalarmult_base(secretKey: Uint8Array): Uint8Array;
  readonly crypto_box_SEALBYTES: number; // 48
  readonly crypto_box_PUBLICKEYBYTES: number; // 32
  readonly crypto_box_SECRETKEYBYTES: number; // 32

  // --- Memory zeroing ---
  memzero(buf: Uint8Array): void;

  // --- Base64 (for serialize.ts) ---
  to_base64(buf: Uint8Array, variant: number): string;
  from_base64(str: string, variant: number): Uint8Array;
  readonly base64_variants: {
    readonly URLSAFE_NO_PADDING: number;
  };
}

let cachedBackend: SodiumBackend | null = null;
let pendingInit: Promise<SodiumBackend> | null = null;

/** Initialize and return the sodium backend. Lazy singleton with resolution lock. */
export async function getSodium(): Promise<SodiumBackend> {
  if (cachedBackend) return cachedBackend;

  if (pendingInit) return pendingInit;

  pendingInit = loadSumoBackend()
    .then((backend) => {
      cachedBackend = backend;
      pendingInit = null;
      return backend;
    })
    /* v8 ignore start -- WASM load failure recovery, not testable without mocking dynamic import */
    .catch((err: unknown) => {
      pendingInit = null;
      throw err;
    });
  /* v8 ignore stop */

  return pendingInit;
}

/**
 * Return the cached backend or throw if getSodium() was never awaited.
 * Use this in synchronous code paths after initialization.
 */
export function requireSodium(): SodiumBackend {
  if (!cachedBackend) {
    throw new SodiumNotReadyError();
  }
  return cachedBackend;
}

/** @internal Visible for testing: reset the singleton so tests can re-initialize. */
export function _resetSodiumForTesting(): void {
  cachedBackend = null;
  pendingInit = null;
}

/** @internal Visible for testing: inject a specific backend instance. */
export function _setSodiumForTesting(backend: SodiumBackend): void {
  cachedBackend = backend;
}

/**
 * Load libsodium-wrappers-sumo WASM backend.
 *
 * The package's .d.ts declares crypto functions as named ESM exports, but
 * at runtime they are dynamically populated on the default export object
 * only after `await ready`. This is a known libsodium.js behavior:
 * https://github.com/jedisct1/libsodium.js/issues/113
 * https://github.com/jedisct1/libsodium.js/issues/187
 *
 * After `ready` resolves, the default export structurally satisfies
 * SodiumBackend. The `as unknown as` cast bridges the mismatch between
 * the static .d.ts (named exports) and runtime (populated .default).
 */
async function loadSumoBackend(): Promise<SodiumBackend> {
  const mod = await import("libsodium-wrappers-sumo");
  const sodium = mod.default;
  await sodium.ready;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see #113, #187 above
  return sodium as unknown as SodiumBackend;
}
