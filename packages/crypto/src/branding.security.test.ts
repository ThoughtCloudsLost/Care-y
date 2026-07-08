import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import {
  deriveClientBrandingKey,
  encryptClientBranding,
  decryptClientBranding,
} from "./branding.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { DecryptionError } from "./errors.js";
import { flipBit, containsSubarray } from "./test-utils.js";

/**
 * Property-based security invariants for client-side branding encryption.
 *
 * Branding is the weakest tier by design (the key derives from the public
 * org key), which makes its isolation properties the ones to watch: this
 * tier must never become a bridge between orgs on a shared deployment.
 *
 *   1. Cross-org isolation: branding sealed for one org never decrypts
 *      under another org's key, for arbitrary org keypairs.
 *   2. Full-key sensitivity: the derived branding key depends on every bit
 *      of the org public key. Fails if the BLAKE2b input is ever truncated
 *      or the domain label stops contributing.
 *   3. Confidentiality canary: the stored blob never contains the payload.
 *
 * Complements the roundtrip and wrong-key examples in branding.test.ts.
 */

describe("branding security invariants", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  function generateOrgPublicKey(): Uint8Array {
    return sodium.crypto_box_keypair().publicKey;
  }

  describe("cross-org isolation", () => {
    it("branding for one org never decrypts under another org's key", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 256 }),
          (payload) => {
            const orgA = generateOrgPublicKey();
            const orgB = generateOrgPublicKey();
            const encrypted = encryptClientBranding(payload, orgA);
            expect(() => decryptClientBranding(encrypted, orgB)).toThrow(
              DecryptionError,
            );
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("an org key differing in a single bit derives a different key and fails to decrypt", () => {
      // Bit-level separation is stronger than two independent orgs: it
      // fails if the key derivation ever consumes only part of the org
      // public key.
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 255 }), (bit) => {
          const orgKey = generateOrgPublicKey();
          const nearKey = flipBit(orgKey, bit);

          expect(deriveClientBrandingKey(nearKey)).not.toEqual(
            deriveClientBrandingKey(orgKey),
          );

          const payload = new TextEncoder().encode("branding-payload");
          const encrypted = encryptClientBranding(payload, orgKey);
          expect(() => decryptClientBranding(encrypted, nearKey)).toThrow(
            DecryptionError,
          );
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("confidentiality canary", () => {
    it("the stored blob never contains the payload as a contiguous run", () => {
      // Branding is encryption-at-rest, not E2E, but a passthrough
      // regression here would put org names and colors in plaintext rows
      // that the threat model assumes are ciphertext.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 16, maxLength: 512 }),
          (payload) => {
            const orgKey = generateOrgPublicKey();
            const encrypted = encryptClientBranding(payload, orgKey);
            expect(containsSubarray(encrypted, payload)).toBe(false);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});
