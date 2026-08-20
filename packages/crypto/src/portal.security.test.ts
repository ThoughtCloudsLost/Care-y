import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import {
  generatePortalSeed,
  deriveChannelId,
  deriveChannelAuth,
  hashChannelAuth,
  derivePortalKeypair,
} from "./portal.js";
import { eciesEncrypt, eciesDecrypt } from "./ecies.js";
import {
  getSodium,
  _resetSodiumForTesting,
  _setSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";

/**
 * Security invariants for portal key derivation (SEC-054, SEC-011).
 *
 * These tests verify properties that functional roundtrip tests do not
 * cover: scalar canonicality, output uniqueness (collision resistance),
 * and zeroing of intermediate key material. A regression in any of these
 * would not break roundtrips but would weaken the portal's security
 * guarantees.
 */

// --- Instrumented backend for zeroing verification ---

/** Buffers returned by secret-producing primitives during one operation. */
interface CaptureLog {
  hmacFinals: Uint8Array[];
  pwhashKeys: Uint8Array[];
  scalarReduceInputs: Uint8Array[];
}

/** Wrap the real backend, recording outputs of secret-producing primitives. */
function instrument(real: SodiumBackend): {
  backend: SodiumBackend;
  log: CaptureLog;
} {
  const log: CaptureLog = {
    hmacFinals: [],
    pwhashKeys: [],
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
      // Track the 64-byte input that gets reduced (this is the expanded
      // HKDF output that must be zeroed after reduction).
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

    crypto_pwhash: (keyLength, password, salt, opsLimit, memLimit, alg) => {
      const out = real.crypto_pwhash(
        keyLength,
        password,
        salt,
        opsLimit,
        memLimit,
        alg,
      );
      log.pwhashKeys.push(out);
      return out;
    },
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

describe("portal security invariants", () => {
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

  describe("scalar canonicality", () => {
    it("derived scalar is a canonical reduced ristretto255 scalar", () => {
      // A canonical scalar, when reduced again, equals itself.
      // This confirms scalar_reduce was applied (not a raw HKDF slice).
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 24, maxLength: 24 }), (seed) => {
          const kp = derivePortalKeypair(seed);
          const reReduced = real.crypto_core_ristretto255_scalar_reduce(
            // Pad the 32-byte scalar to 64 bytes for scalar_reduce input
            (() => {
              const padded = new Uint8Array(64);
              padded.set(kp.clientPrivate);
              return padded;
            })(),
          );
          expect(kp.clientPrivate).toEqual(reReduced);
        }),
        { numRuns: FC_MEDIUM },
      );
    });

    it("derived scalar is non-zero", () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 24, maxLength: 24 }), (seed) => {
          const kp = derivePortalKeypair(seed);
          expect(kp.clientPrivate.every((b) => b === 0)).toBe(false);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("output uniqueness", () => {
    it("outputs for two random seeds never collide", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 24, maxLength: 24 }),
          fc.uint8Array({ minLength: 24, maxLength: 24 }),
          (seed1, seed2) => {
            // Skip when seeds happen to be identical
            if (
              seed1.length === seed2.length &&
              seed1.every((b, i) => b === seed2[i])
            ) {
              return;
            }

            const cid1 = deriveChannelId(seed1);
            const cid2 = deriveChannelId(seed2);
            expect(cid1).not.toBe(cid2);

            const auth1 = deriveChannelAuth(seed1);
            const auth2 = deriveChannelAuth(seed2);
            expect(auth1).not.toEqual(auth2);

            const kp1 = derivePortalKeypair(seed1);
            const kp2 = derivePortalKeypair(seed2);
            expect(kp1.clientPrivate).not.toEqual(kp2.clientPrivate);
            expect(kp1.clientPublic).not.toEqual(kp2.clientPublic);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("cross-recipient isolation", () => {
    it("a wrap to one portal keypair never decrypts under another seed's keypair", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 24, maxLength: 24 }),
          fc.uint8Array({ minLength: 24, maxLength: 24 }),
          fc.uint8Array({ minLength: 1, maxLength: 128 }),
          (seed1, seed2, plaintext) => {
            if (seed1.every((b, i) => b === seed2[i])) return;

            const kp1 = derivePortalKeypair(seed1);
            const kp2 = derivePortalKeypair(seed2);
            const encrypted = eciesEncrypt(plaintext, kp1.clientPublic);

            expect(() =>
              eciesDecrypt(
                encrypted.ephemeralPoint,
                encrypted.nonce,
                encrypted.ciphertext,
                kp2.clientPrivate,
              ),
            ).toThrow();
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("intermediate zeroing (no passphrase)", () => {
    it("zeroes the HKDF intermediates and the 64-byte expansion", () => {
      withInstrumented((log) => {
        const seed = generatePortalSeed();
        derivePortalKeypair(seed);

        // HKDF finals include PRK and expand blocks from the keypair derivation
        expectAllZeroed(log.hmacFinals);

        // The 64-byte expanded buffer passed to scalar_reduce must be zeroed
        expect(log.scalarReduceInputs.length).toBeGreaterThan(0);
        expectAllZeroed(log.scalarReduceInputs);
      });
    });
  });

  describe("intermediate zeroing (with passphrase)", () => {
    it("zeroes the Argon2id output, ikm, HKDF intermediates, and expansion", () => {
      withInstrumented((log) => {
        const seed = generatePortalSeed();
        derivePortalKeypair(seed, "zeroing test passphrase words five");

        // Argon2id output must be zeroed
        expectAllZeroed(log.pwhashKeys);

        // HKDF finals (PRK + expand blocks from salt derivation and keypair derivation)
        expectAllZeroed(log.hmacFinals);

        // The 64-byte expansion must be zeroed
        expect(log.scalarReduceInputs.length).toBeGreaterThan(0);
        expectAllZeroed(log.scalarReduceInputs);
      });
    }, 60_000);
  });

  describe("hashChannelAuth determinism across backends", () => {
    it("hash of a derived auth matches independent generichash call", () => {
      // Both the browser (portal page) and the server (request validation)
      // must produce the same hash from the same auth token. This test
      // pins the hash algorithm as unkeyed BLAKE2b-256.
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 24, maxLength: 24 }), (seed) => {
          const auth = deriveChannelAuth(seed);
          const hash = hashChannelAuth(auth);
          const expected = real.crypto_generichash(32, auth);
          expect(hash).toEqual(expected);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("public key derivation consistency", () => {
    it("clientPublic equals scalarmult_base(clientPrivate)", () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 24, maxLength: 24 }), (seed) => {
          const kp = derivePortalKeypair(seed);
          const recomputedPublic = real.crypto_scalarmult_ristretto255_base(
            kp.clientPrivate,
          );
          expect(kp.clientPublic).toEqual(recomputedPublic);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});
