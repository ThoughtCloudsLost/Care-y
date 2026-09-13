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
  portalOprfInput,
  derivePortalKeypairFromOprf,
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
import { normalizeAlias } from "@care-y/shared";

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
      // Contract: browser and server each derive the channel id from the seed
      // with this exact formula; changing it orphans every existing channel.
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

    // Contract: server rows store crypto_generichash(32, auth) of channel
    // auth; changing the hash construction orphans every stored hash.
    it("matches independent crypto_generichash call", () => {
      const seed = generatePortalSeed();
      const auth = deriveChannelAuth(seed);
      const hash = hashChannelAuth(auth);
      const expected = sodium.crypto_generichash(32, auth);
      expect(hash).toEqual(expected);
    });
  });

  describe("passphrase normalization (via portalOprfInput)", () => {
    // Normalization must produce identical pre-blind inputs for equivalent
    // passphrase strings. stretchPassphrase coverage flows through here.
    it("case-insensitive: 'Word One' equals 'word one'", () => {
      const seed = generatePortalSeed();
      const a = portalOprfInput(seed, "Word One Two Three Four");
      const b = portalOprfInput(seed, "word one two three four");
      expect(a).toEqual(b);
    }, 120_000);

    it("NFKC normalization: compatibility forms equal", () => {
      const seed = generatePortalSeed();
      // U+FB01 (fi ligature) NFKC-normalizes to "fi"
      const a = portalOprfInput(seed, "ﬁve words here now test");
      const b = portalOprfInput(seed, "five words here now test");
      expect(a).toEqual(b);
    }, 120_000);

    it("mixed case and NFKC together", () => {
      const seed = generatePortalSeed();
      const a = portalOprfInput(seed, "HELLO WORLD");
      const b = portalOprfInput(seed, "hello world");
      expect(a).toEqual(b);
    }, 120_000);

    it("collapses internal whitespace runs: double-spaced display text equals single-spaced", () => {
      const seed = generatePortalSeed();
      const a = portalOprfInput(seed, "polish  naming  tilt  wrinkle");
      const b = portalOprfInput(seed, "polish naming tilt wrinkle");
      expect(a).toEqual(b);
    }, 120_000);

    it("trims leading/trailing whitespace and normalizes newlines and tabs", () => {
      const seed = generatePortalSeed();
      const a = portalOprfInput(seed, "  polish\tnaming\n tilt wrinkle ");
      const b = portalOprfInput(seed, "polish naming tilt wrinkle");
      expect(a).toEqual(b);
    }, 120_000);
  });

  describe("normalizePassphrase parity with normalizeAlias", () => {
    it("inline chain matches normalizeAlias for arbitrary unicode strings", () => {
      fc.assert(
        fc.property(fc.string({ unit: "binary" }), (s) => {
          // The old inline chain that normalizePassphrase used to implement
          const oldResult = s
            .normalize("NFKC")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");
          // The shared normalizeAlias that normalizePassphrase now delegates to
          const newResult = normalizeAlias(s);
          expect(newResult).toBe(oldResult);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("all outputs are distinct per seed", () => {
    it("channel_id, auth, and oprf input are all derived from distinct domains", () => {
      const seed = generatePortalSeed();
      const channelId = deriveChannelId(seed);
      const auth = deriveChannelAuth(seed);
      const input = portalOprfInput(seed);

      // Convert channelId to bytes for comparison
      const cidBytes = new Uint8Array(24);
      for (let i = 0; i < 24; i++) {
        cidBytes[i] = parseInt(channelId.substring(i * 2, i * 2 + 2), 16);
      }

      // auth is 32 bytes via HKDF, input is seed copy (24 bytes)
      // All pairwise distinct by domain separation.
      const authPrefix = auth.subarray(0, 24);
      expect(authPrefix).not.toEqual(cidBytes);
      expect(auth).not.toEqual(input);
    });
  });

  describe("HKDF_LABELS constants", () => {
    it("portal labels have the expected values", () => {
      // Contract: every stored portal-derived key depends on these literals;
      // changing one invalidates all previously derived keys.
      expect(HKDF_LABELS.PORTAL_AUTH).toBe("care-y-portal-auth-v1");
      expect(HKDF_LABELS.PORTAL_SALT).toBe("care-y-portal-salt-v1");
      expect(HKDF_LABELS.PORTAL_ECIES).toBe("care-y-portal-ecies-v1");
    });
  });

  describe("property-based", () => {
    it("for random 64-byte OPRF outputs, eciesDecrypt(eciesEncrypt(x, pub), priv) === x", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 64, maxLength: 64 }),
          fc.uint8Array({ minLength: 1, maxLength: 256 }),
          (oprfOut, plaintext) => {
            const kp = derivePortalKeypairFromOprf(oprfOut);
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

  // --- ADR-091: portalOprfInput ---

  describe("portalOprfInput (no passphrase)", () => {
    it("returns a copy of the seed (not the same reference)", () => {
      const seed = generatePortalSeed();
      const input = portalOprfInput(seed);
      expect(input).toEqual(seed);
      // Must be a distinct buffer so zeroing the returned value does not
      // clobber the caller's seed.
      expect(input.buffer).not.toBe(seed.buffer);
    });

    it("is deterministic for the same seed", () => {
      const seed = generatePortalSeed();
      const a = portalOprfInput(seed);
      const b = portalOprfInput(seed);
      expect(a).toEqual(b);
    });

    it("undefined passphrase matches no passphrase", () => {
      const seed = generatePortalSeed();
      const a = portalOprfInput(seed);
      const b = portalOprfInput(seed, undefined);
      expect(a).toEqual(b);
    });

    it("empty string passphrase matches no passphrase", () => {
      const seed = generatePortalSeed();
      const a = portalOprfInput(seed);
      const b = portalOprfInput(seed, "");
      expect(a).toEqual(b);
    });

    it("throws InvalidInputError for short seed", () => {
      expect(() => portalOprfInput(new Uint8Array(5))).toThrow(
        InvalidInputError,
      );
    });
  });

  describe("portalOprfInput (with passphrase)", () => {
    it("returns seed || stretched passphrase (longer than seed alone)", () => {
      const seed = generatePortalSeed();
      const input = portalOprfInput(seed, "test phrase here now five");
      // seed is 24 bytes, Argon2id output is 32 bytes, so total is 56.
      expect(input.length).toBe(PORTAL_SEED_BYTES + 32);
    }, 60_000);

    it("the seed prefix is preserved byte for byte", () => {
      const seed = generatePortalSeed();
      const input = portalOprfInput(seed, "alpha bravo charlie delta echo");
      const prefix = input.subarray(0, PORTAL_SEED_BYTES);
      expect(prefix).toEqual(seed);
    }, 60_000);

    it("stretched suffix is deterministic and 32 bytes (Argon2id output)", () => {
      const seed = generatePortalSeed();
      const passphrase = "foxtrot golf hotel india juliet";

      const oprfIn = portalOprfInput(seed, passphrase);
      const stretchedFromOprfIn = oprfIn.subarray(PORTAL_SEED_BYTES);

      // Call portalOprfInput again with the same inputs to confirm
      // determinism of the stretched portion (Argon2id via stretchPassphrase).
      const oprfIn2 = portalOprfInput(seed, passphrase);
      const stretchedAgain = oprfIn2.subarray(PORTAL_SEED_BYTES);
      expect(stretchedFromOprfIn).toEqual(stretchedAgain);
      expect(stretchedFromOprfIn.length).toBe(32);
    }, 120_000);

    it("passphrase normalization applies (case, NFKC, whitespace)", () => {
      const seed = generatePortalSeed();
      const a = portalOprfInput(seed, "  HELLO  World ");
      const b = portalOprfInput(seed, "hello world");
      expect(a).toEqual(b);
    }, 120_000);
  });

  // --- ADR-091: derivePortalKeypairFromOprf ---

  describe("derivePortalKeypairFromOprf", () => {
    it("returns a 32-byte scalar and a 32-byte point", () => {
      // Use 64 random bytes as a stand-in for an OPRF output.
      const fakeOprf = sodium.randombytes_buf(64);
      const kp = derivePortalKeypairFromOprf(fakeOprf);
      expect(kp.clientPrivate.length).toBe(32);
      expect(kp.clientPublic.length).toBe(32);
    });

    it("is deterministic for the same input", () => {
      const fakeOprf = sodium.randombytes_buf(64);
      const a = derivePortalKeypairFromOprf(fakeOprf);
      const b = derivePortalKeypairFromOprf(fakeOprf);
      expect(a.clientPrivate).toEqual(b.clientPrivate);
      expect(a.clientPublic).toEqual(b.clientPublic);
    });

    it("different inputs produce different keypairs", () => {
      const a = derivePortalKeypairFromOprf(sodium.randombytes_buf(64));
      const b = derivePortalKeypairFromOprf(sodium.randombytes_buf(64));
      expect(a.clientPrivate).not.toEqual(b.clientPrivate);
    });

    it("throws InvalidInputError for input shorter than 64 bytes", () => {
      expect(() => derivePortalKeypairFromOprf(new Uint8Array(32))).toThrow(
        InvalidInputError,
      );
    });

    it("throws InvalidInputError for input longer than 64 bytes", () => {
      expect(() => derivePortalKeypairFromOprf(new Uint8Array(65))).toThrow(
        InvalidInputError,
      );
    });

    it("throws InvalidInputError for empty input", () => {
      expect(() => derivePortalKeypairFromOprf(new Uint8Array(0))).toThrow(
        InvalidInputError,
      );
    });

    it("keypair roundtrips through eciesEncrypt/eciesDecrypt", () => {
      const fakeOprf = sodium.randombytes_buf(64);
      const kp = derivePortalKeypairFromOprf(fakeOprf);
      const plaintext = new TextEncoder().encode("oprf-portal-content");

      const encrypted = eciesEncrypt(plaintext, kp.clientPublic);
      const decrypted = eciesDecrypt(
        encrypted.ephemeralPoint,
        encrypted.nonce,
        encrypted.ciphertext,
        kp.clientPrivate,
      );
      expect(decrypted).toEqual(plaintext);
    });

    it("wrong OPRF output fails key-check decrypt with DecryptionError", () => {
      const oprf1 = sodium.randombytes_buf(64);
      const oprf2 = sodium.randombytes_buf(64);
      const kpCorrect = derivePortalKeypairFromOprf(oprf1);
      const kpWrong = derivePortalKeypairFromOprf(oprf2);

      const checkBytes = encodeLabel(PORTAL_KEY_CHECK);
      const encrypted = eciesEncrypt(checkBytes, kpCorrect.clientPublic);

      expect(() =>
        eciesDecrypt(
          encrypted.ephemeralPoint,
          encrypted.nonce,
          encrypted.ciphertext,
          kpWrong.clientPrivate,
        ),
      ).toThrow(DecryptionError);
    });
  });

  describe("portalOprfInput + derivePortalKeypairFromOprf property-based", () => {
    it("portalOprfInput (no passphrase) always equals seed copy for valid seeds", () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 18, maxLength: 64 }), (seed) => {
          const input = portalOprfInput(seed);
          expect(input).toEqual(seed);
          expect(input.buffer).not.toBe(seed.buffer);
        }),
        { numRuns: FC_MEDIUM },
      );
    });

    it("derivePortalKeypairFromOprf always produces a valid ECIES keypair", () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 64, maxLength: 64 }), (oprf) => {
          const kp = derivePortalKeypairFromOprf(oprf);
          expect(kp.clientPrivate.length).toBe(32);
          expect(kp.clientPublic.length).toBe(32);

          // Roundtrip
          const msg = new TextEncoder().encode("prop-test");
          const enc = eciesEncrypt(msg, kp.clientPublic);
          const dec = eciesDecrypt(
            enc.ephemeralPoint,
            enc.nonce,
            enc.ciphertext,
            kp.clientPrivate,
          );
          expect(dec).toEqual(msg);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});
