import { describe, it, expect, beforeAll } from "vitest";
import { deriveClientAccountKeys } from "./client-account.js";
import {
  getSodium,
  _resetSodiumForTesting,
  _setSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";

/**
 * Buffer-zeroing contracts for client-account key derivation (SEC-054).
 *
 * deriveClientAccountKeys promises to zero the 64-byte HKDF expansion
 * used for scalar reduction. A dropped finally or early return would
 * leave the expansion live in heap memory, from which the private key
 * can be trivially recovered (scalar_reduce is deterministic).
 *
 * The test observes this via the same instrumented-backend pattern used
 * in zeroing.security.test.ts and portal.security.test.ts: a delegating
 * SodiumBackend records the buffers fed to scalar_reduce and the HMAC
 * finals from HKDF, and after the operation returns every recorded
 * buffer must be all zeros.
 */

/** Buffers returned by secret-producing primitives during one operation. */
interface CaptureLog {
  hmacFinals: Uint8Array[];
  scalarReduceInputs: Uint8Array[];
}

/** Wrap the real backend, recording outputs of secret-producing primitives. */
function instrument(real: SodiumBackend): {
  backend: SodiumBackend;
  log: CaptureLog;
} {
  const log: CaptureLog = {
    hmacFinals: [],
    scalarReduceInputs: [],
  };

  const backend: SodiumBackend = {
    randombytes_buf: (length) => real.randombytes_buf(length),

    crypto_secretbox_easy: (message, nonce, key) =>
      real.crypto_secretbox_easy(message, nonce, key),
    crypto_secretbox_open_easy: (ciphertext, nonce, key) =>
      real.crypto_secretbox_open_easy(ciphertext, nonce, key),
    crypto_secretbox_NONCEBYTES: real.crypto_secretbox_NONCEBYTES,
    crypto_secretbox_KEYBYTES: real.crypto_secretbox_KEYBYTES,
    crypto_secretbox_MACBYTES: real.crypto_secretbox_MACBYTES,

    crypto_aead_xchacha20poly1305_ietf_encrypt: (m, ad, nsec, npub, key) =>
      real.crypto_aead_xchacha20poly1305_ietf_encrypt(m, ad, nsec, npub, key),
    crypto_aead_xchacha20poly1305_ietf_decrypt: (nsec, c, ad, npub, key) =>
      real.crypto_aead_xchacha20poly1305_ietf_decrypt(nsec, c, ad, npub, key),
    crypto_aead_xchacha20poly1305_ietf_NPUBBYTES:
      real.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
    crypto_aead_xchacha20poly1305_ietf_ABYTES:
      real.crypto_aead_xchacha20poly1305_ietf_ABYTES,
    crypto_aead_xchacha20poly1305_ietf_KEYBYTES:
      real.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,

    crypto_auth_hmacsha512: (message, key) =>
      real.crypto_auth_hmacsha512(message, key),
    crypto_auth_hmacsha512_BYTES: real.crypto_auth_hmacsha512_BYTES,
    crypto_auth_hmacsha512_KEYBYTES: real.crypto_auth_hmacsha512_KEYBYTES,
    crypto_auth_hmacsha512_init: (key) => real.crypto_auth_hmacsha512_init(key),
    crypto_auth_hmacsha512_update: (state, data) => {
      real.crypto_auth_hmacsha512_update(state, data);
    },
    crypto_auth_hmacsha512_final: (state) => {
      const out = real.crypto_auth_hmacsha512_final(state);
      log.hmacFinals.push(out);
      return out;
    },

    crypto_generichash: (hashLength, message, key) =>
      real.crypto_generichash(hashLength, message, key),

    crypto_core_ristretto255_scalar_random: () =>
      real.crypto_core_ristretto255_scalar_random(),
    crypto_core_ristretto255_scalar_invert: (scalar) =>
      real.crypto_core_ristretto255_scalar_invert(scalar),
    crypto_core_ristretto255_scalar_mul: (x, y) =>
      real.crypto_core_ristretto255_scalar_mul(x, y),
    crypto_core_ristretto255_scalar_add: (x, y) =>
      real.crypto_core_ristretto255_scalar_add(x, y),
    crypto_core_ristretto255_scalar_sub: (x, y) =>
      real.crypto_core_ristretto255_scalar_sub(x, y),
    crypto_core_ristretto255_scalar_reduce: (nonReduced) => {
      log.scalarReduceInputs.push(nonReduced);
      return real.crypto_core_ristretto255_scalar_reduce(nonReduced);
    },
    crypto_core_ristretto255_from_hash: (hash) =>
      real.crypto_core_ristretto255_from_hash(hash),
    crypto_scalarmult_ristretto255: (scalar, point) =>
      real.crypto_scalarmult_ristretto255(scalar, point),
    crypto_scalarmult_ristretto255_base: (scalar) =>
      real.crypto_scalarmult_ristretto255_base(scalar),
    crypto_core_ristretto255_add: (p, q) =>
      real.crypto_core_ristretto255_add(p, q),
    crypto_core_ristretto255_BYTES: real.crypto_core_ristretto255_BYTES,
    crypto_core_ristretto255_SCALARBYTES:
      real.crypto_core_ristretto255_SCALARBYTES,
    crypto_core_ristretto255_HASHBYTES: real.crypto_core_ristretto255_HASHBYTES,

    crypto_pwhash: (keyLength, password, salt, opsLimit, memLimit, alg) =>
      real.crypto_pwhash(keyLength, password, salt, opsLimit, memLimit, alg),
    crypto_pwhash_ALG_ARGON2ID13: real.crypto_pwhash_ALG_ARGON2ID13,
    crypto_pwhash_SALTBYTES: real.crypto_pwhash_SALTBYTES,

    crypto_hash_sha512: (message) => real.crypto_hash_sha512(message),

    crypto_box_seal: (message, publicKey) =>
      real.crypto_box_seal(message, publicKey),
    crypto_box_seal_open: (ciphertext, publicKey, secretKey) =>
      real.crypto_box_seal_open(ciphertext, publicKey, secretKey),
    crypto_box_keypair: () => real.crypto_box_keypair(),
    crypto_scalarmult_base: (secretKey) =>
      real.crypto_scalarmult_base(secretKey),
    crypto_box_SEALBYTES: real.crypto_box_SEALBYTES,
    crypto_box_PUBLICKEYBYTES: real.crypto_box_PUBLICKEYBYTES,
    crypto_box_SECRETKEYBYTES: real.crypto_box_SECRETKEYBYTES,

    memzero: (buf) => {
      real.memzero(buf);
    },

    to_base64: (buf, variant) => real.to_base64(buf, variant),
    from_base64: (str, variant) => real.from_base64(str, variant),
    base64_variants: real.base64_variants,
  };

  return { backend, log };
}

/** Assert that buffers were captured and every one is fully zeroed. */
function expectAllZeroed(captured: readonly Uint8Array[]): void {
  expect(captured.length).toBeGreaterThan(0);
  for (const buf of captured) {
    expect(buf.every((b) => b === 0)).toBe(true);
  }
}

describe("client-account intermediate zeroing", () => {
  let real: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    real = await getSodium();
  });

  /** Run fn against an instrumented backend, always restoring the real one. */
  function withInstrumented<T>(fn: (log: CaptureLog) => T): T {
    const { backend, log } = instrument(real);
    _setSodiumForTesting(backend);
    try {
      return fn(log);
    } finally {
      _setSodiumForTesting(real);
    }
  }

  it("zeroes the 64-byte HKDF expansion passed to scalar_reduce", () => {
    withInstrumented((log) => {
      const oprfOutput = real.randombytes_buf(64);
      deriveClientAccountKeys(oprfOutput);

      // The 64-byte expansion is the most sensitive intermediate: recovering
      // it from memory lets an attacker re-derive the private key via
      // deterministic scalar_reduce.
      expect(log.scalarReduceInputs.length).toBeGreaterThan(0);
      expectAllZeroed(log.scalarReduceInputs);
    });
  });

  it("zeroes all HKDF intermediates (PRK and expand blocks)", () => {
    withInstrumented((log) => {
      const oprfOutput = real.randombytes_buf(64);
      deriveClientAccountKeys(oprfOutput);

      // HKDF finals include PRK and expand blocks from both the keypair
      // derivation (64-byte output) and the auth token derivation (32-byte).
      expectAllZeroed(log.hmacFinals);
    });
  });

  it("zeroes intermediates even when oprfOutput triggers edge-case scalar values", () => {
    // An all-zero oprfOutput is a degenerate case; the finally block must
    // still run and zero the expansion.
    withInstrumented((log) => {
      const oprfOutput = new Uint8Array(64);
      deriveClientAccountKeys(oprfOutput);

      expectAllZeroed(log.scalarReduceInputs);
      expectAllZeroed(log.hmacFinals);
    });
  });
});
