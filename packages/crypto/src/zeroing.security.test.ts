import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_LIGHT } from "./fc-config.js";
import { hkdf } from "./hkdf.js";
import { deriveMasterKey } from "./derive.js";
import { eciesEncrypt, eciesDecrypt } from "./ecies.js";
import { oprfBlind, oprfFinalize } from "./oprf.js";
import { encryptWithPassphrase, decryptWithPassphrase } from "./escrow.js";
import {
  getSodium,
  _setSodiumForTesting,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { DecryptionError, InvalidKeyError } from "./errors.js";
import type { Scalar, RistrettoPoint, EvaluatedElement } from "./types.js";

/**
 * Buffer-zeroing contracts for intermediate key material (SEC-054).
 *
 * The modules under test promise to zero every secret intermediate they
 * allocate: HKDF's PRK and expand blocks, the ECIES ephemeral scalar and
 * ECDH shared secret, the OPRF unblinding scalar and unblinded element,
 * and the escrow Argon2id key. None of that is observable through return
 * values, so a regression (a dropped finally, an early return past the
 * cleanup) passes every functional test while leaving key material live in
 * heap memory for the lifetime of the process.
 *
 * These tests observe the contract at the package's own injectable-backend
 * seam (_setSodiumForTesting): a delegating SodiumBackend records the
 * buffers produced by the primitives that yield secret intermediates, and
 * after the operation returns (or throws), every recorded buffer must be
 * all zeros. The error paths matter most: cleanup lives in finally blocks
 * precisely so that a wrong passphrase or tampered ciphertext still zeroes
 * the derived key.
 *
 * Each assertion requires at least one captured buffer, so if a refactor
 * stops routing through a recorded primitive the test fails loudly instead
 * of passing vacuously, forcing a conscious update of the capture set.
 */

/** Buffers returned by secret-producing primitives during one operation. */
interface CaptureLog {
  /** HMAC-SHA512 finals: HKDF's PRK and every expand block T(i). */
  hmacFinals: Uint8Array[];
  /** crypto_scalarmult_ristretto255 outputs: ECDH shared secrets, OPRF unblinded elements. */
  scalarmults: Uint8Array[];
  /** crypto_core_ristretto255_scalar_random outputs: ECIES ephemeral scalars. */
  randomScalars: Uint8Array[];
  /** crypto_core_ristretto255_scalar_invert outputs: OPRF unblinding scalars. */
  invertedScalars: Uint8Array[];
  /** crypto_pwhash outputs: escrow-derived symmetric keys. */
  pwhashKeys: Uint8Array[];
}

/** Wrap the real backend, recording outputs of secret-producing primitives. */
function instrument(real: SodiumBackend): {
  backend: SodiumBackend;
  log: CaptureLog;
} {
  const log: CaptureLog = {
    hmacFinals: [],
    scalarmults: [],
    randomScalars: [],
    invertedScalars: [],
    pwhashKeys: [],
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

    crypto_core_ristretto255_scalar_random: () => {
      const out = real.crypto_core_ristretto255_scalar_random();
      log.randomScalars.push(out);
      return out;
    },
    crypto_core_ristretto255_scalar_invert: (scalar) => {
      const out = real.crypto_core_ristretto255_scalar_invert(scalar);
      log.invertedScalars.push(out);
      return out;
    },
    crypto_core_ristretto255_scalar_mul: (x, y) =>
      real.crypto_core_ristretto255_scalar_mul(x, y),
    crypto_core_ristretto255_scalar_add: (x, y) =>
      real.crypto_core_ristretto255_scalar_add(x, y),
    crypto_core_ristretto255_scalar_sub: (x, y) =>
      real.crypto_core_ristretto255_scalar_sub(x, y),
    crypto_core_ristretto255_scalar_reduce: (nonReduced) =>
      real.crypto_core_ristretto255_scalar_reduce(nonReduced),
    crypto_core_ristretto255_from_hash: (hash) =>
      real.crypto_core_ristretto255_from_hash(hash),
    crypto_scalarmult_ristretto255: (scalar, point) => {
      const out = real.crypto_scalarmult_ristretto255(scalar, point);
      log.scalarmults.push(out);
      return out;
    },
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

describe("intermediate key material zeroing", () => {
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

  describe("HKDF", () => {
    it("zeroes the PRK and every expand block for arbitrary output lengths", () => {
      // Lengths beyond 64 bytes exercise the multi-block chain, where each
      // superseded block must be zeroed as its successor consumes it.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          fc.integer({ min: 1, max: 256 }),
          (ikm, length) => {
            withInstrumented((log) => {
              hkdf(ikm, new TextEncoder().encode("zeroing-check"), length);
              expectAllZeroed(log.hmacFinals);
            });
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });
  });

  describe("master key derivation", () => {
    it("zeroes its HKDF intermediates for both derivation paths", () => {
      const oprfOutput = real.randombytes_buf(64);
      const pqShared = real.randombytes_buf(32);

      withInstrumented((log) => {
        deriveMasterKey(oprfOutput);
        expectAllZeroed(log.hmacFinals);
      });

      withInstrumented((log) => {
        deriveMasterKey(oprfOutput, pqShared);
        expectAllZeroed(log.hmacFinals);
      });
    });
  });

  describe("ECIES", () => {
    it("encrypt zeroes the ephemeral scalar and the shared secret", () => {
      // The ephemeral scalar is the most sensitive intermediate in the
      // wrap: recovering it from memory breaks that wrap outright.
      const priv = real.crypto_core_ristretto255_scalar_random();
      const pub = real.crypto_scalarmult_ristretto255_base(
        priv,
      ) as RistrettoPoint;

      withInstrumented((log) => {
        eciesEncrypt(new TextEncoder().encode("wrap-me"), pub);
        expectAllZeroed(log.randomScalars);
        expectAllZeroed(log.scalarmults);
        expectAllZeroed(log.hmacFinals);
      });
    });

    it("encrypt zeroes the ephemeral scalar even when the recipient key is rejected", () => {
      // Error path: the identity element fails scalarmult after the
      // ephemeral scalar already exists. The finally block must still run.
      const identity = new Uint8Array(32) as RistrettoPoint;

      withInstrumented((log) => {
        expect(() =>
          eciesEncrypt(new TextEncoder().encode("wrap-me"), identity),
        ).toThrow(InvalidKeyError);
        expectAllZeroed(log.randomScalars);
      });
    });

    it("decrypt zeroes the shared secret on success and on tampered ciphertext", () => {
      const priv = real.crypto_core_ristretto255_scalar_random() as Scalar;
      const pub = real.crypto_scalarmult_ristretto255_base(
        priv,
      ) as RistrettoPoint;
      const wrap = eciesEncrypt(new TextEncoder().encode("wrap-me"), pub);

      withInstrumented((log) => {
        eciesDecrypt(wrap.ephemeralPoint, wrap.nonce, wrap.ciphertext, priv);
        expectAllZeroed(log.scalarmults);
        expectAllZeroed(log.hmacFinals);
      });

      const tampered = wrap.ciphertext.slice();
      tampered[0] = (tampered[0] ?? 0) ^ 0xff;

      withInstrumented((log) => {
        expect(() =>
          eciesDecrypt(wrap.ephemeralPoint, wrap.nonce, tampered, priv),
        ).toThrow(DecryptionError);
        // The wrong-key failure happens after the ECDH, so the shared
        // secret exists and must still be zeroed on the throw path.
        expectAllZeroed(log.scalarmults);
      });
    });
  });

  describe("OPRF finalize", () => {
    it("zeroes the unblinding scalar and the unblinded element", () => {
      // The unblinded element is key * HashToGroup(password): holding onto
      // it would hand an attacker the per-user OPRF evaluation without
      // touching the server's rate limits.
      const input = new TextEncoder().encode("finalize-zeroing");
      const key = real.crypto_core_ristretto255_scalar_random() as Scalar;
      const session = oprfBlind(input);
      const evaluated = real.crypto_scalarmult_ristretto255(
        key,
        session.blindedElement,
      ) as EvaluatedElement;

      withInstrumented((log) => {
        oprfFinalize(session.blindState, evaluated, input);
        expectAllZeroed(log.invertedScalars);
        expectAllZeroed(log.scalarmults);
      });
    });
  });

  describe("escrow", () => {
    it("zeroes the derived key after encryption", () => {
      const secret = real.randombytes_buf(32);
      const passphrase = new TextEncoder().encode("zeroing-passphrase");

      withInstrumented((log) => {
        encryptWithPassphrase(secret, passphrase);
        expectAllZeroed(log.pwhashKeys);
      });
    }, 120_000);

    it("zeroes the derived key after decryption, on success and on wrong passphrase", () => {
      const secret = real.randombytes_buf(32);
      const passphrase = new TextEncoder().encode("zeroing-passphrase");
      const blob = encryptWithPassphrase(secret, passphrase);

      withInstrumented((log) => {
        decryptWithPassphrase(blob, passphrase);
        expectAllZeroed(log.pwhashKeys);
      });

      withInstrumented((log) => {
        expect(() =>
          decryptWithPassphrase(blob, new TextEncoder().encode("wrong")),
        ).toThrow(DecryptionError);
        // The wrong-passphrase path derives a key, fails the MAC, and must
        // still zero the key in its finally block.
        expectAllZeroed(log.pwhashKeys);
      });
    }, 120_000);
  });
});
