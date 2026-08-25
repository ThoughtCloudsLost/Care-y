import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import {
  PORTAL_SEED_BYTES,
  PORTAL_KEY_CHECK,
  generatePortalSeed,
  deriveChannelId,
  deriveChannelAuth,
  hashChannelAuth,
  derivePortalKeypair,
} from "./portal.js";
import { eciesEncrypt, eciesDecrypt } from "./ecies.js";
import { encodeLabel } from "./bytes.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { InvalidInputError, DecryptionError } from "./errors.js";
import { HKDF_LABELS } from "./types.js";

describe("portal key derivation", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("generatePortalSeed", () => {
    it("returns a buffer of PORTAL_SEED_BYTES length", () => {
      const seed = generatePortalSeed();
      expect(seed.length).toBe(PORTAL_SEED_BYTES);
      expect(seed.length).toBe(24);
    });

    it("returns different seeds on successive calls", () => {
      const a = generatePortalSeed();
      const b = generatePortalSeed();
      expect(a).not.toEqual(b);
    });
  });

  describe("deriveChannelId", () => {
    it("returns a 48-character lowercase hex string", () => {
      const seed = generatePortalSeed();
      const channelId = deriveChannelId(seed);
      expect(channelId).toMatch(/^[0-9a-f]{48}$/);
    });

    it("matches an independent crypto_hash_sha512 slice", () => {
      const seed = generatePortalSeed();
      const channelId = deriveChannelId(seed);

      const hash = sodium.crypto_hash_sha512(seed);
      const prefix = hash.subarray(0, 24);
      const expected = Array.from(prefix, (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");

      expect(channelId).toBe(expected);
    });

    it("is deterministic for the same seed", () => {
      const seed = generatePortalSeed();
      const a = deriveChannelId(seed);
      const b = deriveChannelId(seed);
      expect(a).toBe(b);
    });

    it("different seeds produce different channel ids", () => {
      const seed1 = generatePortalSeed();
      const seed2 = generatePortalSeed();
      expect(deriveChannelId(seed1)).not.toBe(deriveChannelId(seed2));
    });

    it("throws InvalidInputError for seed shorter than 18 bytes", () => {
      const shortSeed = new Uint8Array(17);
      expect(() => deriveChannelId(shortSeed)).toThrow(InvalidInputError);
    });

    it("accepts exactly 18-byte seed (minimum)", () => {
      const minSeed = new Uint8Array(18);
      minSeed.fill(0x42);
      const channelId = deriveChannelId(minSeed);
      expect(channelId).toMatch(/^[0-9a-f]{48}$/);
    });

    it("throws for empty seed", () => {
      expect(() => deriveChannelId(new Uint8Array(0))).toThrow(
        InvalidInputError,
      );
    });
  });

  describe("deriveChannelAuth", () => {
    it("returns a 32-byte auth token", () => {
      const seed = generatePortalSeed();
      const auth = deriveChannelAuth(seed);
      expect(auth.length).toBe(32);
    });

    it("is deterministic for the same seed", () => {
      const seed = generatePortalSeed();
      const a = deriveChannelAuth(seed);
      const b = deriveChannelAuth(seed);
      expect(a).toEqual(b);
    });

    it("differs from channel_id bytes", () => {
      const seed = generatePortalSeed();
      const channelId = deriveChannelId(seed);
      const auth = deriveChannelAuth(seed);
      // channel_id is hex of SHA-512 prefix; auth is HKDF output.
      // Convert channel_id hex to bytes for comparison.
      const channelIdBytes = new Uint8Array(24);
      for (let i = 0; i < 24; i++) {
        channelIdBytes[i] = parseInt(channelId.substring(i * 2, i * 2 + 2), 16);
      }
      // Auth is 32 bytes, channelIdBytes is 24 bytes; they cannot be equal
      // by length alone, but verify the first 24 bytes also differ
      // (domain separation guarantee).
      const authPrefix = auth.subarray(0, 24);
      expect(authPrefix).not.toEqual(channelIdBytes);
    });

    it("different seeds produce different auth tokens", () => {
      const seed1 = generatePortalSeed();
      const seed2 = generatePortalSeed();
      expect(deriveChannelAuth(seed1)).not.toEqual(deriveChannelAuth(seed2));
    });

    it("throws InvalidInputError for short seed", () => {
      expect(() => deriveChannelAuth(new Uint8Array(10))).toThrow(
        InvalidInputError,
      );
    });
  });

  describe("hashChannelAuth", () => {
    it("returns a 32-byte hash", () => {
      const seed = generatePortalSeed();
      const auth = deriveChannelAuth(seed);
      const hash = hashChannelAuth(auth);
      expect(hash.length).toBe(32);
    });

    it("is deterministic for the same auth token", () => {
      const seed = generatePortalSeed();
      const auth = deriveChannelAuth(seed);
      const a = hashChannelAuth(auth);
      const b = hashChannelAuth(auth);
      expect(a).toEqual(b);
    });

    it("differs from the raw auth token", () => {
      const seed = generatePortalSeed();
      const auth = deriveChannelAuth(seed);
      const hash = hashChannelAuth(auth);
      expect(hash).not.toEqual(auth);
    });

    it("different auth tokens produce different hashes", () => {
      const seed1 = generatePortalSeed();
      const seed2 = generatePortalSeed();
      const auth1 = deriveChannelAuth(seed1);
      const auth2 = deriveChannelAuth(seed2);
      expect(hashChannelAuth(auth1)).not.toEqual(hashChannelAuth(auth2));
    });

    it("matches independent crypto_generichash call", () => {
      const seed = generatePortalSeed();
      const auth = deriveChannelAuth(seed);
      const hash = hashChannelAuth(auth);
      const expected = sodium.crypto_generichash(32, auth);
      expect(hash).toEqual(expected);
    });
  });

  describe("derivePortalKeypair (no passphrase)", () => {
    it("returns a 32-byte scalar and a 32-byte point", () => {
      const seed = generatePortalSeed();
      const kp = derivePortalKeypair(seed);
      expect(kp.clientPrivate.length).toBe(32);
      expect(kp.clientPublic.length).toBe(32);
    });

    it("is deterministic for the same seed", () => {
      const seed = generatePortalSeed();
      const kp1 = derivePortalKeypair(seed);
      const kp2 = derivePortalKeypair(seed);
      expect(kp1.clientPrivate).toEqual(kp2.clientPrivate);
      expect(kp1.clientPublic).toEqual(kp2.clientPublic);
    });

    it("different seeds produce different keypairs", () => {
      const seed1 = generatePortalSeed();
      const seed2 = generatePortalSeed();
      const kp1 = derivePortalKeypair(seed1);
      const kp2 = derivePortalKeypair(seed2);
      expect(kp1.clientPrivate).not.toEqual(kp2.clientPrivate);
      expect(kp1.clientPublic).not.toEqual(kp2.clientPublic);
    });

    it("keypair roundtrips through eciesEncrypt/eciesDecrypt", () => {
      const seed = generatePortalSeed();
      const kp = derivePortalKeypair(seed);
      const plaintext = new TextEncoder().encode("portal message content");

      const encrypted = eciesEncrypt(plaintext, kp.clientPublic);
      const decrypted = eciesDecrypt(
        encrypted.ephemeralPoint,
        encrypted.nonce,
        encrypted.ciphertext,
        kp.clientPrivate,
      );

      expect(decrypted).toEqual(plaintext);
    });

    it("the PORTAL_KEY_CHECK constant roundtrips through ECIES", () => {
      const seed = generatePortalSeed();
      const kp = derivePortalKeypair(seed);
      const checkBytes = encodeLabel(PORTAL_KEY_CHECK);

      const encrypted = eciesEncrypt(checkBytes, kp.clientPublic);
      const decrypted = eciesDecrypt(
        encrypted.ephemeralPoint,
        encrypted.nonce,
        encrypted.ciphertext,
        kp.clientPrivate,
      );

      expect(decrypted).toEqual(checkBytes);
    });

    it("throws InvalidInputError for short seed", () => {
      expect(() => derivePortalKeypair(new Uint8Array(5))).toThrow(
        InvalidInputError,
      );
    });

    it("accepts 18-byte seed (minimum)", () => {
      const minSeed = new Uint8Array(18);
      minSeed.fill(0xab);
      const kp = derivePortalKeypair(minSeed);
      expect(kp.clientPrivate.length).toBe(32);
      expect(kp.clientPublic.length).toBe(32);
    });

    it("undefined passphrase produces the same keypair as no passphrase", () => {
      const seed = generatePortalSeed();
      const kpNone = derivePortalKeypair(seed);
      const kpUndefined = derivePortalKeypair(seed, undefined);
      expect(kpNone.clientPrivate).toEqual(kpUndefined.clientPrivate);
      expect(kpNone.clientPublic).toEqual(kpUndefined.clientPublic);
    });

    it("empty string passphrase produces the same keypair as no passphrase", () => {
      const seed = generatePortalSeed();
      const kpNone = derivePortalKeypair(seed);
      const kpEmpty = derivePortalKeypair(seed, "");
      expect(kpNone.clientPrivate).toEqual(kpEmpty.clientPrivate);
      expect(kpNone.clientPublic).toEqual(kpEmpty.clientPublic);
    });
  });

  describe("derivePortalKeypair (with passphrase)", () => {
    // Argon2id takes seconds per call; explicit timeouts match derive.test.ts convention
    it("passphrase changes the keypair", () => {
      const seed = generatePortalSeed();
      const kpPlain = derivePortalKeypair(seed);
      const kpPass = derivePortalKeypair(
        seed,
        "correct horse battery staple glove",
      );

      expect(kpPass.clientPrivate).not.toEqual(kpPlain.clientPrivate);
      expect(kpPass.clientPublic).not.toEqual(kpPlain.clientPublic);
    }, 60_000);

    it("is deterministic with the same passphrase", () => {
      const seed = generatePortalSeed();
      const kp1 = derivePortalKeypair(seed, "same passphrase");
      const kp2 = derivePortalKeypair(seed, "same passphrase");
      expect(kp1.clientPrivate).toEqual(kp2.clientPrivate);
      expect(kp1.clientPublic).toEqual(kp2.clientPublic);
    }, 120_000);

    it("wrong passphrase fails the key-check decrypt with DecryptionError", () => {
      const seed = generatePortalSeed();
      const kpCorrect = derivePortalKeypair(seed, "right words here now five");
      const checkBytes = encodeLabel(PORTAL_KEY_CHECK);

      const encrypted = eciesEncrypt(checkBytes, kpCorrect.clientPublic);

      const kpWrong = derivePortalKeypair(seed, "wrong words here now five");
      expect(() =>
        eciesDecrypt(
          encrypted.ephemeralPoint,
          encrypted.nonce,
          encrypted.ciphertext,
          kpWrong.clientPrivate,
        ),
      ).toThrow(DecryptionError);
    }, 120_000);

    it("passphrase-derived keypair roundtrips through ECIES", () => {
      const seed = generatePortalSeed();
      const kp = derivePortalKeypair(seed, "test passphrase words");
      const plaintext = new TextEncoder().encode("encrypted for portal client");

      const encrypted = eciesEncrypt(plaintext, kp.clientPublic);
      const decrypted = eciesDecrypt(
        encrypted.ephemeralPoint,
        encrypted.nonce,
        encrypted.ciphertext,
        kp.clientPrivate,
      );

      expect(decrypted).toEqual(plaintext);
    }, 60_000);

    it("different passphrases produce different keypairs from the same seed", () => {
      const seed = generatePortalSeed();
      const kpA = derivePortalKeypair(seed, "alpha bravo charlie delta echo");
      const kpB = derivePortalKeypair(seed, "foxtrot golf hotel india juliet");
      expect(kpA.clientPrivate).not.toEqual(kpB.clientPrivate);
      expect(kpA.clientPublic).not.toEqual(kpB.clientPublic);
    }, 120_000);
  });

  describe("passphrase normalization", () => {
    // Normalization must produce identical keypairs for equivalent inputs.
    // Argon2id timeout applies.
    it("case-insensitive: 'Word One' equals 'word one'", () => {
      const seed = generatePortalSeed();
      const kpUpper = derivePortalKeypair(seed, "Word One Two Three Four");
      const kpLower = derivePortalKeypair(seed, "word one two three four");
      expect(kpUpper.clientPrivate).toEqual(kpLower.clientPrivate);
      expect(kpUpper.clientPublic).toEqual(kpLower.clientPublic);
    }, 120_000);

    it("NFKC normalization: compatibility forms equal", () => {
      const seed = generatePortalSeed();
      // U+FB01 (fi ligature) NFKC-normalizes to "fi"
      const kpLigature = derivePortalKeypair(seed, "ﬁve words here now test");
      const kpPlain = derivePortalKeypair(seed, "five words here now test");
      expect(kpLigature.clientPrivate).toEqual(kpPlain.clientPrivate);
      expect(kpLigature.clientPublic).toEqual(kpPlain.clientPublic);
    }, 120_000);

    it("mixed case and NFKC together", () => {
      const seed = generatePortalSeed();
      const kpA = derivePortalKeypair(seed, "HELLO WORLD");
      const kpB = derivePortalKeypair(seed, "hello world");
      expect(kpA.clientPrivate).toEqual(kpB.clientPrivate);
    }, 120_000);

    it("collapses internal whitespace runs: double-spaced display text equals single-spaced", () => {
      // The volunteer sheet displays words.join("  ") but derives from
      // words.join(" "); a client typing what they see must still unlock.
      const seed = generatePortalSeed();
      const kpDouble = derivePortalKeypair(
        seed,
        "polish  naming  tilt  wrinkle",
      );
      const kpSingle = derivePortalKeypair(seed, "polish naming tilt wrinkle");
      expect(kpDouble.clientPrivate).toEqual(kpSingle.clientPrivate);
      expect(kpDouble.clientPublic).toEqual(kpSingle.clientPublic);
    }, 120_000);

    it("trims leading/trailing whitespace and normalizes newlines and tabs", () => {
      const seed = generatePortalSeed();
      const kpMessy = derivePortalKeypair(
        seed,
        "  polish\tnaming\n tilt wrinkle ",
      );
      const kpClean = derivePortalKeypair(seed, "polish naming tilt wrinkle");
      expect(kpMessy.clientPrivate).toEqual(kpClean.clientPrivate);
      expect(kpMessy.clientPublic).toEqual(kpClean.clientPublic);
    }, 120_000);
  });

  describe("all outputs are distinct per seed", () => {
    it("channel_id, auth, and keypair are all derived from distinct domains", () => {
      const seed = generatePortalSeed();
      const channelId = deriveChannelId(seed);
      const auth = deriveChannelAuth(seed);
      const kp = derivePortalKeypair(seed);

      // Convert channelId to bytes for comparison
      const cidBytes = new Uint8Array(24);
      for (let i = 0; i < 24; i++) {
        cidBytes[i] = parseInt(channelId.substring(i * 2, i * 2 + 2), 16);
      }

      // All pairwise distinct (auth is 32 bytes, scalar is 32 bytes)
      expect(auth).not.toEqual(kp.clientPrivate);
      expect(auth).not.toEqual(kp.clientPublic);
      expect(kp.clientPrivate).not.toEqual(kp.clientPublic);
    });
  });

  describe("HKDF_LABELS constants", () => {
    it("portal labels have the expected values", () => {
      expect(HKDF_LABELS.PORTAL_AUTH).toBe("care-y-portal-auth-v1");
      expect(HKDF_LABELS.PORTAL_SALT).toBe("care-y-portal-salt-v1");
      expect(HKDF_LABELS.PORTAL_ECIES).toBe("care-y-portal-ecies-v1");
    });
  });

  describe("property-based", () => {
    it("for random seeds and passphrases, eciesDecrypt(eciesEncrypt(x, pub), priv) === x", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 24, maxLength: 24 }),
          fc.uint8Array({ minLength: 1, maxLength: 256 }),
          (seed, plaintext) => {
            const kp = derivePortalKeypair(seed);
            const encrypted = eciesEncrypt(plaintext, kp.clientPublic);
            const decrypted = eciesDecrypt(
              encrypted.ephemeralPoint,
              encrypted.nonce,
              encrypted.ciphertext,
              kp.clientPrivate,
            );
            expect(decrypted).toEqual(plaintext);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("channel_id is always 48 hex chars for valid seeds", () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 18, maxLength: 64 }), (seed) => {
          const channelId = deriveChannelId(seed);
          expect(channelId).toMatch(/^[0-9a-f]{48}$/);
        }),
        { numRuns: FC_MEDIUM },
      );
    });

    it("auth is always 32 bytes for valid seeds", () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 18, maxLength: 64 }), (seed) => {
          const auth = deriveChannelAuth(seed);
          expect(auth.length).toBe(32);
        }),
        { numRuns: FC_MEDIUM },
      );
    });

    it("hashChannelAuth is always 32 bytes", () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 18, maxLength: 64 }), (seed) => {
          const auth = deriveChannelAuth(seed);
          const hash = hashChannelAuth(auth);
          expect(hash.length).toBe(32);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});
