/**
 * Tests for intake form field definition encryption helpers.
 *
 * Verifies roundtrip for every field type's config shape, tampered
 * ciphertext rejection, and schema validation on decrypt.
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  getSodium,
  requireSodium,
  DecryptionError,
  decode,
  encode,
  deriveClientBrandingKey,
  encryptContent,
} from "@care-y/crypto";
import type { IntakeFieldConfig, LocalizedText } from "@care-y/shared";
import {
  encryptFieldContent,
  decryptFieldContent,
} from "./intake-form-crypto.js";

beforeAll(async () => {
  await getSodium();
});

function generateOrgPublicKey(): Uint8Array {
  const sodium = requireSodium();
  const sk = sodium.randombytes_buf(sodium.crypto_box_SECRETKEYBYTES);
  return sodium.crypto_scalarmult_base(sk);
}

describe("intake-form-crypto", () => {
  const orgPubKey = (() => {
    // Deferred: sodium must be ready before calling generateOrgPublicKey.
    // The variable is assigned in beforeAll via a second init or lazily.
    let key: Uint8Array | undefined;
    return (): Uint8Array => {
      key ??= generateOrgPublicKey();
      return key;
    };
  })();

  describe("encryptFieldContent / decryptFieldContent roundtrip", () => {
    it("roundtrips a text field config with LocalizedText label", () => {
      const config: IntakeFieldConfig = {
        type: "text",
        maxLength: 200,
        placeholder: { en: "Your name" },
      };
      const label: LocalizedText = { en: "Full Name" };
      const encrypted = encryptFieldContent({ label, config }, orgPubKey());
      const decrypted = decryptFieldContent(encrypted, orgPubKey());

      expect(decrypted.label).toEqual({ en: "Full Name" });
      expect(decrypted.config).toEqual(config);
    });

    it("roundtrips a text field config with optional fields omitted", () => {
      const config: IntakeFieldConfig = { type: "text" };
      const encrypted = encryptFieldContent(
        { label: { en: "Simple" }, config },
        orgPubKey(),
      );
      const decrypted = decryptFieldContent(encrypted, orgPubKey());

      expect(decrypted.label).toEqual({ en: "Simple" });
      expect(decrypted.config).toEqual({ type: "text" });
    });

    it("roundtrips a textarea field config", () => {
      const config: IntakeFieldConfig = {
        type: "textarea",
        maxLength: 5000,
        placeholder: { en: "Describe your situation" },
      };
      const encrypted = encryptFieldContent(
        { label: { en: "Message" }, config },
        orgPubKey(),
      );
      const decrypted = decryptFieldContent(encrypted, orgPubKey());

      expect(decrypted.label).toEqual({ en: "Message" });
      expect(decrypted.config).toEqual(config);
    });

    it("roundtrips a select field config with keyed options", () => {
      const config: IntakeFieldConfig = {
        type: "select",
        options: [
          { key: "k1", label: { en: "Phone" } },
          { key: "k2", label: { en: "Email" } },
          { key: "k3", label: { en: "Signal" } },
        ],
      };
      const encrypted = encryptFieldContent(
        { label: { en: "Contact Method" }, config },
        orgPubKey(),
      );
      const decrypted = decryptFieldContent(encrypted, orgPubKey());

      expect(decrypted.label).toEqual({ en: "Contact Method" });
      expect(decrypted.config).toEqual(config);
    });

    it("roundtrips a multiselect field config with keyed options", () => {
      const config: IntakeFieldConfig = {
        type: "multiselect",
        options: [
          { key: "k1", label: { en: "Legal aid" } },
          { key: "k2", label: { en: "Housing" } },
          { key: "k3", label: { en: "Medical" } },
          { key: "k4", label: { en: "Counseling" } },
        ],
      };
      const encrypted = encryptFieldContent(
        { label: { en: "Services Needed" }, config },
        orgPubKey(),
      );
      const decrypted = decryptFieldContent(encrypted, orgPubKey());

      expect(decrypted.label).toEqual({ en: "Services Needed" });
      expect(decrypted.config).toEqual(config);
    });

    it("roundtrips an availability field config", () => {
      const config: IntakeFieldConfig = {
        type: "availability",
        allowRecurring: true,
        allowSpecific: false,
      };
      const encrypted = encryptFieldContent(
        { label: { en: "When can we reach you?" }, config },
        orgPubKey(),
      );
      const decrypted = decryptFieldContent(encrypted, orgPubKey());

      expect(decrypted.label).toEqual({ en: "When can we reach you?" });
      expect(decrypted.config).toEqual(config);
    });

    it("roundtrips an availability field with both windows enabled", () => {
      const config: IntakeFieldConfig = {
        type: "availability",
        allowRecurring: true,
        allowSpecific: true,
      };
      const encrypted = encryptFieldContent(
        { label: { en: "Availability" }, config },
        orgPubKey(),
      );
      const decrypted = decryptFieldContent(encrypted, orgPubKey());

      expect(decrypted.config).toEqual(config);
    });

    it("preserves Unicode in labels", () => {
      const config: IntakeFieldConfig = { type: "text" };
      const label: LocalizedText = {
        en: "Full Name",
        es: "Nombre completo",
      };
      const encrypted = encryptFieldContent({ label, config }, orgPubKey());
      const decrypted = decryptFieldContent(encrypted, orgPubKey());

      expect(decrypted.label).toEqual({
        en: "Full Name",
        es: "Nombre completo",
      });
    });

    it("produces different ciphertext on each call (random nonce)", () => {
      const config: IntakeFieldConfig = { type: "text" };
      const label: LocalizedText = { en: "Same" };
      const a = encryptFieldContent({ label, config }, orgPubKey());
      const b = encryptFieldContent({ label, config }, orgPubKey());

      expect(a.encryptedLabel).not.toBe(b.encryptedLabel);
      expect(a.encryptedConfig).not.toBe(b.encryptedConfig);
    });
  });

  describe("tampered ciphertext", () => {
    it("throws DecryptionError when label ciphertext is tampered", () => {
      const config: IntakeFieldConfig = { type: "text" };
      const encrypted = encryptFieldContent(
        { label: { en: "Name" }, config },
        orgPubKey(),
      );

      const labelBytes = decode(encrypted.encryptedLabel);
      // Flip a byte in the ciphertext portion (past the 24-byte nonce)
      labelBytes[labelBytes.length - 1] =
        (labelBytes[labelBytes.length - 1] ?? 0) ^ 0xff;
      const tampered = {
        ...encrypted,
        encryptedLabel: encode(labelBytes),
      };

      expect(() => decryptFieldContent(tampered, orgPubKey())).toThrow(
        DecryptionError,
      );
    });

    it("throws DecryptionError when config ciphertext is tampered", () => {
      const config: IntakeFieldConfig = {
        type: "select",
        options: [
          { key: "a", label: { en: "A" } },
          { key: "b", label: { en: "B" } },
        ],
      };
      const encrypted = encryptFieldContent(
        { label: { en: "Pick" }, config },
        orgPubKey(),
      );

      const configBytes = decode(encrypted.encryptedConfig);
      configBytes[configBytes.length - 1] =
        (configBytes[configBytes.length - 1] ?? 0) ^ 0xff;
      const tampered = {
        ...encrypted,
        encryptedConfig: encode(configBytes),
      };

      expect(() => decryptFieldContent(tampered, orgPubKey())).toThrow(
        DecryptionError,
      );
    });

    it("throws DecryptionError with wrong org public key", () => {
      const config: IntakeFieldConfig = { type: "text" };
      const encrypted = encryptFieldContent(
        { label: { en: "Name" }, config },
        orgPubKey(),
      );

      const otherKey = generateOrgPublicKey();

      expect(() => decryptFieldContent(encrypted, otherKey)).toThrow(
        DecryptionError,
      );
    });
  });

  describe("schema validation on decrypt", () => {
    it("throws DecryptionError when config fails schema (not silent default)", () => {
      // Manually encrypt a config blob with an invalid shape: missing
      // the discriminator "type" field entirely.
      const key = deriveClientBrandingKey(orgPubKey());
      const aad = new TextEncoder().encode("care-y-intake-form-aad-v1");

      try {
        const invalidConfig = JSON.stringify({ notAType: true });
        const labelBlob = encryptContent(
          new TextEncoder().encode("Label"),
          key,
          aad,
        );
        const configBlob = encryptContent(
          new TextEncoder().encode(invalidConfig),
          key,
          aad,
        );

        const enc = {
          encryptedLabel: encode(labelBlob),
          encryptedConfig: encode(configBlob),
        };

        expect(() => decryptFieldContent(enc, orgPubKey())).toThrow(
          DecryptionError,
        );
      } finally {
        requireSodium().memzero(key);
      }
    });

    it("throws DecryptionError when config has wrong type variant", () => {
      const key = deriveClientBrandingKey(orgPubKey());
      const aad = new TextEncoder().encode("care-y-intake-form-aad-v1");

      try {
        // "select" requires options array; omit it
        const badConfig = JSON.stringify({ type: "select" });
        const labelBlob = encryptContent(
          new TextEncoder().encode("Pick one"),
          key,
          aad,
        );
        const configBlob = encryptContent(
          new TextEncoder().encode(badConfig),
          key,
          aad,
        );

        const enc = {
          encryptedLabel: encode(labelBlob),
          encryptedConfig: encode(configBlob),
        };

        expect(() => decryptFieldContent(enc, orgPubKey())).toThrow(
          DecryptionError,
        );
      } finally {
        requireSodium().memzero(key);
      }
    });

    it("throws DecryptionError when config JSON is not an object", () => {
      const key = deriveClientBrandingKey(orgPubKey());
      const aad = new TextEncoder().encode("care-y-intake-form-aad-v1");

      try {
        const labelBlob = encryptContent(
          new TextEncoder().encode("Label"),
          key,
          aad,
        );
        const configBlob = encryptContent(
          new TextEncoder().encode('"just a string"'),
          key,
          aad,
        );

        const enc = {
          encryptedLabel: encode(labelBlob),
          encryptedConfig: encode(configBlob),
        };

        expect(() => decryptFieldContent(enc, orgPubKey())).toThrow(
          DecryptionError,
        );
      } finally {
        requireSodium().memzero(key);
      }
    });
  });
});
