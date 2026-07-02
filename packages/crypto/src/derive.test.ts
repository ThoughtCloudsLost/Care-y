import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import {
  deriveAccountKey,
  deriveMasterKey,
  deriveVolunteerPrivateKey,
  deriveVolunteerPublicKey,
  deriveOrgUnwrapKey,
  generateSalt,
} from "./derive.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { InvalidKeyError, InvalidInputError } from "./errors.js";
import { type SymmetricKey, type Salt, ARGON2_MIN_PARAMS } from "./types.js";

describe("key derivation", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("generateSalt", () => {
    it("returns a 16-byte salt", () => {
      const salt = generateSalt();
      expect(salt.length).toBe(sodium.crypto_pwhash_SALTBYTES);
    });

    it("returns different salts on successive calls", () => {
      const a = generateSalt();
      const b = generateSalt();
      expect(a).not.toEqual(b);
    });
  });

  describe("deriveAccountKey", () => {
    // Use fixed salt for determinism testing
    const fixedSalt = new Uint8Array(16) as Salt;
    fixedSalt.fill(0x42);

    it("returns a 32-byte stretched key", () => {
      const password = new TextEncoder().encode("test-password");
      const result = deriveAccountKey(password, fixedSalt);
      expect(result.length).toBe(32);
    });

    it("is deterministic for same input", () => {
      const password = new TextEncoder().encode("deterministic");
      const a = deriveAccountKey(password, fixedSalt);
      const b = deriveAccountKey(password, fixedSalt);
      expect(a).toEqual(b);
    });

    it("throws InvalidInputError for wrong-length salt", () => {
      const password = new TextEncoder().encode("test");
      const badSalt = new Uint8Array(8) as Salt;
      expect(() => deriveAccountKey(password, badSalt)).toThrow(
        InvalidInputError,
      );
    });

    it("enforces minimum params when server sends weaker values", () => {
      const password = new TextEncoder().encode("param-test");
      const weakParams = { memoryKiB: 1, iterations: 1 };

      // With weak params (floor-enforced to minimums)
      const withWeak = deriveAccountKey(password, fixedSalt, weakParams);
      // With no params (defaults to minimums)
      const withDefaults = deriveAccountKey(password, fixedSalt);

      // Both should produce the same output since weak params get floored
      expect(withWeak).toEqual(withDefaults);
    });

    it("accepts stronger-than-minimum params", () => {
      const password = new TextEncoder().encode("strong-test");
      const strongParams = {
        memoryKiB: ARGON2_MIN_PARAMS.memoryKiB * 2,
        iterations: ARGON2_MIN_PARAMS.iterations + 1,
      };

      const withStrong = deriveAccountKey(password, fixedSalt, strongParams);
      const withDefaults = deriveAccountKey(password, fixedSalt);

      // Stronger params produce different output
      expect(withStrong).not.toEqual(withDefaults);
    });

    it("different passwords produce different outputs", () => {
      const a = deriveAccountKey(
        new TextEncoder().encode("password-one"),
        fixedSalt,
      );
      const b = deriveAccountKey(
        new TextEncoder().encode("password-two"),
        fixedSalt,
      );
      expect(a).not.toEqual(b);
    });

    it("different salts produce different outputs", () => {
      const password = new TextEncoder().encode("same-password");
      const salt1 = new Uint8Array(16) as Salt;
      salt1.fill(0x01);
      const salt2 = new Uint8Array(16) as Salt;
      salt2.fill(0x02);
      const a = deriveAccountKey(password, salt1);
      const b = deriveAccountKey(password, salt2);
      expect(a).not.toEqual(b);
    });

    it("handles empty password without crashing", () => {
      // Argon2id accepts empty passwords (libsodium does not reject them).
      // In CARE-Y, the server should reject empty passwords before they
      // reach key derivation, but the crypto layer must not crash.
      const emptyPassword = new Uint8Array(0);
      const result = deriveAccountKey(emptyPassword, fixedSalt);
      expect(result.length).toBe(32);
    });

    it("partially weak params are individually floor-enforced", () => {
      const password = new TextEncoder().encode("partial-weak-test");
      // Only memoryKiB is weak, iterations is above floor
      const partialWeak = {
        memoryKiB: 1,
        iterations: ARGON2_MIN_PARAMS.iterations + 2,
      };
      const result = deriveAccountKey(password, fixedSalt, partialWeak);

      // With iterations above floor, the output should differ
      // from the default (which uses floor values for everything)
      const withDefaults = deriveAccountKey(password, fixedSalt);
      expect(result).not.toEqual(withDefaults);
    });
  });

  describe("deriveMasterKey", () => {
    it("returns a 32-byte key", () => {
      const oprfOutput = sodium.randombytes_buf(64);
      const mk = deriveMasterKey(oprfOutput);
      expect(mk.length).toBe(32);
    });

    it("is deterministic", () => {
      const oprfOutput = new Uint8Array(64);
      oprfOutput.fill(0xcc);
      const a = deriveMasterKey(oprfOutput);
      const b = deriveMasterKey(oprfOutput);
      expect(a).toEqual(b);
    });

    it("throws InvalidKeyError for wrong-length oprfOutput", () => {
      expect(() => deriveMasterKey(new Uint8Array(16))).toThrow(
        InvalidKeyError,
      );
      expect(() => deriveMasterKey(new Uint8Array(32))).toThrow(
        InvalidKeyError,
      );
    });

    it("pqShared produces different output than without", () => {
      const oprfOutput = new Uint8Array(64);
      oprfOutput.fill(0xdd);
      const pqShared = new Uint8Array(32);
      pqShared.fill(0xee);

      const withoutPQ = deriveMasterKey(oprfOutput);
      const withPQ = deriveMasterKey(oprfOutput, pqShared);
      expect(withPQ).not.toEqual(withoutPQ);
    });
  });

  describe("volunteer key derivation", () => {
    const masterKey = new Uint8Array(32) as SymmetricKey;
    masterKey.fill(0xab);

    it("deriveVolunteerPrivateKey returns 32 bytes", () => {
      const volPrivate = deriveVolunteerPrivateKey(masterKey);
      expect(volPrivate.length).toBe(32);
    });

    it("deriveVolunteerPublicKey returns a 32-byte ristretto255 point", () => {
      const volPrivate = deriveVolunteerPrivateKey(masterKey);
      const volPublic = deriveVolunteerPublicKey(volPrivate);
      expect(volPublic.length).toBe(sodium.crypto_core_ristretto255_BYTES);
      expect(volPublic.every((b) => b === 0)).toBe(false);
    });

    it("full chain is deterministic", () => {
      const priv1 = deriveVolunteerPrivateKey(masterKey);
      const pub1 = deriveVolunteerPublicKey(priv1);
      const priv2 = deriveVolunteerPrivateKey(masterKey);
      const pub2 = deriveVolunteerPublicKey(priv2);
      expect(priv1).toEqual(priv2);
      expect(pub1).toEqual(pub2);
    });

    it("different masterKeys produce different private keys", () => {
      const mk1 = new Uint8Array(32) as SymmetricKey;
      mk1.fill(0x01);
      const mk2 = new Uint8Array(32) as SymmetricKey;
      mk2.fill(0x02);
      const priv1 = deriveVolunteerPrivateKey(mk1);
      const priv2 = deriveVolunteerPrivateKey(mk2);
      expect(priv1).not.toEqual(priv2);
    });
  });

  describe("deriveOrgUnwrapKey", () => {
    const masterKey = new Uint8Array(32) as SymmetricKey;
    masterKey.fill(0xab);

    it("returns 32 bytes", () => {
      const key = deriveOrgUnwrapKey(masterKey);
      expect(key.length).toBe(32);
    });

    it("produces different output from deriveVolunteerPrivateKey (label separation)", () => {
      const orgKey = deriveOrgUnwrapKey(masterKey);
      const volKey = deriveVolunteerPrivateKey(masterKey);
      expect(orgKey).not.toEqual(volKey);
    });

    it("is deterministic", () => {
      const a = deriveOrgUnwrapKey(masterKey);
      const b = deriveOrgUnwrapKey(masterKey);
      expect(a).toEqual(b);
    });
  });

  describe("property-based", () => {
    it("volunteer keypair derivation always produces 32-byte point", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 32, maxLength: 32 }),
          (mkBytes) => {
            const mk = mkBytes as SymmetricKey;
            const priv = deriveVolunteerPrivateKey(mk);
            const pub = deriveVolunteerPublicKey(priv);
            expect(pub.length).toBe(32);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("orgUnwrapKey never equals volPrivate for any masterKey", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 32, maxLength: 32 }),
          (mkBytes) => {
            const mk = mkBytes as SymmetricKey;
            const orgKey = deriveOrgUnwrapKey(mk);
            const volKey = deriveVolunteerPrivateKey(mk);
            expect(orgKey).not.toEqual(volKey);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});
