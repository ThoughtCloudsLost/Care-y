/**
 * Tests for intake form field definition encryption helpers.
 *
 * Verifies roundtrip for every field type's config shape, tampered
 * ciphertext rejection, and schema validation on decrypt.
 */

import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import {
  encryptFieldContent,
  decryptFieldContent,
  encryptFormMeta,
  decryptFormMeta,
} from "./intake-form.js";
import { deriveClientBrandingKey } from "./branding.js";
import { encryptContent } from "./content.js";
import { encode, decode } from "./serialize.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { DecryptionError } from "./errors.js";
import type { SymmetricKey } from "./types.js";
import type {
  IntakeFieldConfig,
  IntakeFormMeta,
  LocalizedText,
  VisibleWhenV1,
  VisibleWhenV2,
} from "@care-y/shared";

function generateOrgPublicKey(sodium: SodiumBackend): Uint8Array {
  const kp = sodium.crypto_box_keypair();
  return kp.publicKey;
}

describe("intake-form", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  const orgPubKey = (): Uint8Array => generateOrgPublicKey(sodium);

  describe("encryptFieldContent / decryptFieldContent roundtrip", () => {
    it("roundtrips a text field config with LocalizedText label", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = {
        type: "text",
        maxLength: 200,
        placeholder: { en: "Your name" },
      };
      const label: LocalizedText = { en: "Full Name" };
      const encrypted = encryptFieldContent({ label, config }, pk);
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.label).toEqual({ en: "Full Name" });
      expect(decrypted.config).toEqual(config);
    });

    it("roundtrips a text field config with optional fields omitted", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "text" };
      const encrypted = encryptFieldContent(
        { label: { en: "Simple" }, config },
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.label).toEqual({ en: "Simple" });
      expect(decrypted.config).toEqual({ type: "text" });
    });

    it("roundtrips a textarea field config", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = {
        type: "textarea",
        maxLength: 5000,
        placeholder: { en: "Describe your situation" },
      };
      const encrypted = encryptFieldContent(
        { label: { en: "Message" }, config },
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.label).toEqual({ en: "Message" });
      expect(decrypted.config).toEqual(config);
    });

    it("roundtrips a select field config with keyed options", () => {
      const pk = orgPubKey();
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
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.label).toEqual({ en: "Contact Method" });
      expect(decrypted.config).toEqual(config);
    });

    it("roundtrips a multiselect field config with keyed options", () => {
      const pk = orgPubKey();
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
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.label).toEqual({ en: "Services Needed" });
      expect(decrypted.config).toEqual(config);
    });

    it("roundtrips an availability field config", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = {
        type: "availability",
        allowRecurring: true,
        allowSpecific: false,
      };
      const encrypted = encryptFieldContent(
        { label: { en: "When can we reach you?" }, config },
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.label).toEqual({ en: "When can we reach you?" });
      expect(decrypted.config).toEqual(config);
    });

    it("roundtrips an availability field with both windows enabled", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = {
        type: "availability",
        allowRecurring: true,
        allowSpecific: true,
      };
      const encrypted = encryptFieldContent(
        { label: { en: "Availability" }, config },
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.config).toEqual(config);
    });

    it("preserves Unicode in labels", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "text" };
      const label: LocalizedText = {
        en: "Full Name",
        es: "Nombre completo",
      };
      const encrypted = encryptFieldContent({ label, config }, pk);
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.label).toEqual({
        en: "Full Name",
        es: "Nombre completo",
      });
    });

    it("produces different ciphertext on each call (random nonce)", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "text" };
      const label: LocalizedText = { en: "Same" };
      const a = encryptFieldContent({ label, config }, pk);
      const b = encryptFieldContent({ label, config }, pk);

      expect(a.encryptedLabel).not.toBe(b.encryptedLabel);
      expect(a.encryptedConfig).not.toBe(b.encryptedConfig);
    });
  });

  describe("tampered ciphertext", () => {
    it("throws DecryptionError when label ciphertext is tampered", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "text" };
      const encrypted = encryptFieldContent(
        { label: { en: "Name" }, config },
        pk,
      );

      const labelBytes = decode(encrypted.encryptedLabel);
      // Flip a byte in the ciphertext portion (past the 24-byte nonce)
      labelBytes[labelBytes.length - 1] =
        (labelBytes[labelBytes.length - 1] ?? 0) ^ 0xff;
      const tampered = {
        ...encrypted,
        encryptedLabel: encode(labelBytes),
      };

      expect(() => decryptFieldContent(tampered, pk)).toThrow(DecryptionError);
    });

    it("throws DecryptionError when config ciphertext is tampered", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = {
        type: "select",
        options: [
          { key: "a", label: { en: "A" } },
          { key: "b", label: { en: "B" } },
        ],
      };
      const encrypted = encryptFieldContent(
        { label: { en: "Pick" }, config },
        pk,
      );

      const configBytes = decode(encrypted.encryptedConfig);
      configBytes[configBytes.length - 1] =
        (configBytes[configBytes.length - 1] ?? 0) ^ 0xff;
      const tampered = {
        ...encrypted,
        encryptedConfig: encode(configBytes),
      };

      expect(() => decryptFieldContent(tampered, pk)).toThrow(DecryptionError);
    });

    it("throws DecryptionError with wrong org public key", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "text" };
      const encrypted = encryptFieldContent(
        { label: { en: "Name" }, config },
        pk,
      );

      const otherKey = orgPubKey();

      expect(() => decryptFieldContent(encrypted, otherKey)).toThrow(
        DecryptionError,
      );
    });
  });

  describe("schema validation on decrypt", () => {
    it("throws DecryptionError when config fails schema (not silent default)", () => {
      const pk = orgPubKey();
      // Manually encrypt a config blob with an invalid shape: missing
      // the discriminator "type" field entirely.
      const key = deriveClientBrandingKey(pk);
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

        expect(() => decryptFieldContent(enc, pk)).toThrow(DecryptionError);
      } finally {
        sodium.memzero(key);
      }
    });

    it("throws DecryptionError when config has wrong type variant", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
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

        expect(() => decryptFieldContent(enc, pk)).toThrow(DecryptionError);
      } finally {
        sodium.memzero(key);
      }
    });

    it("throws DecryptionError when config JSON is not an object", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
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

        expect(() => decryptFieldContent(enc, pk)).toThrow(DecryptionError);
      } finally {
        sodium.memzero(key);
      }
    });
  });

  describe("visibleWhen roundtrip through encrypt/decrypt", () => {
    it("v1 all-mode encrypts as v2 and decrypts to v2 (single group)", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "text" };
      const label: LocalizedText = { en: "Conditional field" };
      const v1Input: VisibleWhenV1 = {
        mode: "all",
        rules: [
          { fieldKey: "fk-trigger", operator: "equals", optionKey: "opt-a" },
        ],
      };

      const encrypted = encryptFieldContent(
        { label, config, visibleWhen: v1Input },
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      // Decrypted output is always v2
      const expectedV2: VisibleWhenV2 = {
        version: 2,
        groups: [v1Input.rules],
      };
      expect(decrypted.visibleWhen).toEqual(expectedV2);
      expect(decrypted.config).toEqual(config);
      expect(decrypted.label).toEqual(label);
    });

    it("v1 any-mode encrypts as v2 (one group per rule)", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = {
        type: "multiselect",
        options: [
          { key: "k1", label: { en: "A" } },
          { key: "k2", label: { en: "B" } },
        ],
      };
      const v1Input: VisibleWhenV1 = {
        mode: "any",
        rules: [
          { fieldKey: "fk-multi", operator: "includes", optionKey: "k1" },
          { fieldKey: "fk-cb", operator: "checked", boolValue: true },
        ],
      };

      const encrypted = encryptFieldContent(
        { label: { en: "Dependent" }, config, visibleWhen: v1Input },
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      const expectedV2: VisibleWhenV2 = {
        version: 2,
        groups: v1Input.rules.map((r) => [r]),
      };
      expect(decrypted.visibleWhen).toEqual(expectedV2);
    });

    it("v2 shape round-trips unchanged", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "text" };
      const v2Input: VisibleWhenV2 = {
        version: 2,
        groups: [
          [
            { fieldKey: "fk-sel", operator: "equals", optionKey: "opt-x" },
            { fieldKey: "fk-cb", operator: "checked", boolValue: true },
          ],
          [{ fieldKey: "fk-multi", operator: "includes", optionKey: "opt-y" }],
        ],
      };

      const encrypted = encryptFieldContent(
        { label: { en: "V2 condition" }, config, visibleWhen: v2Input },
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.visibleWhen).toEqual(v2Input);
    });

    it("v2 with negated operators round-trips correctly", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "textarea" };
      const v2Input: VisibleWhenV2 = {
        version: 2,
        groups: [
          [{ fieldKey: "fk-1", operator: "notEquals", optionKey: "opt-a" }],
          [{ fieldKey: "fk-2", operator: "notIncludes", optionKey: "opt-b" }],
        ],
      };

      const encrypted = encryptFieldContent(
        { label: { en: "Negated" }, config, visibleWhen: v2Input },
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.visibleWhen).toEqual(v2Input);
    });

    it("v2 with isEmpty/isNotEmpty operators round-trips correctly", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "text" };
      const v2Input: VisibleWhenV2 = {
        version: 2,
        groups: [
          [{ fieldKey: "fk-text", operator: "isEmpty" }],
          [{ fieldKey: "fk-date", operator: "isNotEmpty" }],
        ],
      };

      const encrypted = encryptFieldContent(
        { label: { en: "Empty check" }, config, visibleWhen: v2Input },
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.visibleWhen).toEqual(v2Input);
    });

    it("returns undefined visibleWhen when none was provided", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "text" };
      const encrypted = encryptFieldContent(
        { label: { en: "No condition" }, config },
        pk,
      );
      const decrypted = decryptFieldContent(encrypted, pk);

      expect(decrypted.visibleWhen).toBeUndefined();
    });

    it("v1 blob decrypts to v2 in memory and re-encrypts as v2", () => {
      const pk = orgPubKey();
      const config: IntakeFieldConfig = { type: "text" };
      const label: LocalizedText = { en: "Re-encrypt test" };
      const v1Input: VisibleWhenV1 = {
        mode: "all",
        rules: [
          { fieldKey: "fk-a", operator: "equals", optionKey: "opt-x" },
          { fieldKey: "fk-b", operator: "checked", boolValue: true },
        ],
      };

      // First encrypt with v1 input
      const firstEncrypted = encryptFieldContent(
        { label, config, visibleWhen: v1Input },
        pk,
      );
      // Decrypt: should be v2
      const decrypted = decryptFieldContent(firstEncrypted, pk);
      expect(decrypted.visibleWhen?.version).toBe(2);

      // Re-encrypt the decrypted v2 shape
      const reEncrypted = encryptFieldContent(
        { label, config, visibleWhen: decrypted.visibleWhen },
        pk,
      );
      // Decrypt again: still v2, structurally identical
      const reDecrypted = decryptFieldContent(reEncrypted, pk);
      expect(reDecrypted.visibleWhen).toEqual(decrypted.visibleWhen);
    });
  });

  describe("malformed visibleWhen in config blob", () => {
    it("omits visibleWhen when it fails schema validation (does not crash)", () => {
      const pk = orgPubKey();
      // Hand-craft an encrypted config blob with a valid field config but
      // a malformed visibleWhen (missing required "rules" array).
      const key = deriveClientBrandingKey(pk);
      const aad = new TextEncoder().encode("care-y-intake-form-aad-v1");

      try {
        const configWithBadVw = JSON.stringify({
          type: "text",
          visibleWhen: { mode: "all" },
        });
        const labelBlob = encryptContent(
          new TextEncoder().encode(JSON.stringify({ en: "Label" })),
          key,
          aad,
        );
        const configBlob = encryptContent(
          new TextEncoder().encode(configWithBadVw),
          key,
          aad,
        );

        const enc = {
          encryptedLabel: encode(labelBlob),
          encryptedConfig: encode(configBlob),
        };

        // Should not throw; the config is valid, only visibleWhen is bad
        const decrypted = decryptFieldContent(enc, pk);
        expect(decrypted.config.type).toBe("text");
        expect(decrypted.visibleWhen).toBeUndefined();
      } finally {
        sodium.memzero(key);
      }
    });

    it("omits visibleWhen when rules have an invalid operator", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      const aad = new TextEncoder().encode("care-y-intake-form-aad-v1");

      try {
        const configWithBadOp = JSON.stringify({
          type: "checkbox",
          visibleWhen: {
            mode: "all",
            rules: [{ fieldKey: "fk-1", operator: "contains", optionKey: "x" }],
          },
        });
        const labelBlob = encryptContent(
          new TextEncoder().encode(JSON.stringify({ en: "CB" })),
          key,
          aad,
        );
        const configBlob = encryptContent(
          new TextEncoder().encode(configWithBadOp),
          key,
          aad,
        );

        const enc = {
          encryptedLabel: encode(labelBlob),
          encryptedConfig: encode(configBlob),
        };

        const decrypted = decryptFieldContent(enc, pk);
        expect(decrypted.config.type).toBe("checkbox");
        expect(decrypted.visibleWhen).toBeUndefined();
      } finally {
        sodium.memzero(key);
      }
    });

    it("omits visibleWhen when the value is not an object", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      const aad = new TextEncoder().encode("care-y-intake-form-aad-v1");

      try {
        const configWithStringVw = JSON.stringify({
          type: "text",
          visibleWhen: "not-an-object",
        });
        const labelBlob = encryptContent(
          new TextEncoder().encode(JSON.stringify({ en: "Label" })),
          key,
          aad,
        );
        const configBlob = encryptContent(
          new TextEncoder().encode(configWithStringVw),
          key,
          aad,
        );

        const enc = {
          encryptedLabel: encode(labelBlob),
          encryptedConfig: encode(configBlob),
        };

        const decrypted = decryptFieldContent(enc, pk);
        expect(decrypted.config.type).toBe("text");
        expect(decrypted.visibleWhen).toBeUndefined();
      } finally {
        sodium.memzero(key);
      }
    });
  });

  // -------------------------------------------------------------------------
  // decryptFieldContent error branches (label schema mismatch, label non-JSON,
  // config schema mismatch, config non-JSON, and the instanceof rethrow guards)
  // -------------------------------------------------------------------------

  describe("decryptFieldContent error branches", () => {
    // AAD literal must match the production constant. The value is the
    // domain-separation label defined in ADR-053 and consumed by the
    // XChaCha20-Poly1305 AEAD construction; changing it breaks all
    // stored intake-form ciphertext.
    const aad = new TextEncoder().encode("care-y-intake-form-aad-v1");

    function validLabelBlob(key: SymmetricKey): Uint8Array {
      return encryptContent(
        new TextEncoder().encode(JSON.stringify({ en: "ct-test-label" })),
        key,
        aad,
      );
    }

    function validConfigBlob(key: SymmetricKey): Uint8Array {
      return encryptContent(
        new TextEncoder().encode(JSON.stringify({ type: "text" })),
        key,
        aad,
      );
    }

    it("throws DecryptionError when label is valid JSON but fails LocalizedText schema", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      try {
        // Array is valid JSON but not a LocalizedText record
        const badLabel = encryptContent(
          new TextEncoder().encode(JSON.stringify([1, 2, 3])),
          key,
          aad,
        );
        const enc = {
          encryptedLabel: encode(badLabel),
          encryptedConfig: encode(validConfigBlob(key)),
        };
        expect(() => decryptFieldContent(enc, pk)).toThrow(DecryptionError);
      } finally {
        sodium.memzero(key);
      }
    });

    it("throws DecryptionError when label ciphertext decrypts to non-JSON bytes", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      try {
        const notJson = encryptContent(
          new TextEncoder().encode("<<<not json>>>"),
          key,
          aad,
        );
        const enc = {
          encryptedLabel: encode(notJson),
          encryptedConfig: encode(validConfigBlob(key)),
        };
        expect(() => decryptFieldContent(enc, pk)).toThrow(DecryptionError);
      } finally {
        sodium.memzero(key);
      }
    });

    it("throws DecryptionError when config is valid JSON but fails intakeFieldConfig schema", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      try {
        // Object with no "type" discriminator
        const badConfig = encryptContent(
          new TextEncoder().encode(JSON.stringify({ unknown: true })),
          key,
          aad,
        );
        const enc = {
          encryptedLabel: encode(validLabelBlob(key)),
          encryptedConfig: encode(badConfig),
        };
        expect(() => decryptFieldContent(enc, pk)).toThrow(DecryptionError);
      } finally {
        sodium.memzero(key);
      }
    });

    it("throws DecryptionError when config ciphertext decrypts to non-JSON bytes", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      try {
        const notJson = encryptContent(
          new TextEncoder().encode("<<<not json>>>"),
          key,
          aad,
        );
        const enc = {
          encryptedLabel: encode(validLabelBlob(key)),
          encryptedConfig: encode(notJson),
        };
        expect(() => decryptFieldContent(enc, pk)).toThrow(DecryptionError);
      } finally {
        sodium.memzero(key);
      }
    });

    it("label schema-mismatch error message does not leak seeded plaintext", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      const seeded = "ct-secret-label-payload-42";
      try {
        const badLabel = encryptContent(
          new TextEncoder().encode(JSON.stringify({ en: 99999 })),
          key,
          aad,
        );
        const enc = {
          encryptedLabel: encode(badLabel),
          encryptedConfig: encode(validConfigBlob(key)),
        };
        let msg = "";
        try {
          decryptFieldContent(enc, pk);
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(DecryptionError);
          msg = (err as DecryptionError).message;
        }
        expect(msg).not.toContain(seeded);
        expect(msg).not.toContain("99999");
      } finally {
        sodium.memzero(key);
      }
    });

    it("label non-JSON error message does not leak seeded plaintext", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      const seeded = "ct-garbage-payload-77";
      try {
        const notJson = encryptContent(
          new TextEncoder().encode(seeded),
          key,
          aad,
        );
        const enc = {
          encryptedLabel: encode(notJson),
          encryptedConfig: encode(validConfigBlob(key)),
        };
        let msg = "";
        try {
          decryptFieldContent(enc, pk);
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(DecryptionError);
          msg = (err as DecryptionError).message;
        }
        expect(msg).not.toContain(seeded);
      } finally {
        sodium.memzero(key);
      }
    });

    it("config schema-mismatch error message does not leak seeded plaintext", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      const seeded = "ct-config-secret-88";
      try {
        const badConfig = encryptContent(
          new TextEncoder().encode(JSON.stringify({ noType: seeded })),
          key,
          aad,
        );
        const enc = {
          encryptedLabel: encode(validLabelBlob(key)),
          encryptedConfig: encode(badConfig),
        };
        let msg = "";
        try {
          decryptFieldContent(enc, pk);
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(DecryptionError);
          msg = (err as DecryptionError).message;
        }
        expect(msg).not.toContain(seeded);
      } finally {
        sodium.memzero(key);
      }
    });

    it("config non-JSON error message does not leak seeded plaintext", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      const seeded = "ct-config-garbage-99";
      try {
        const notJson = encryptContent(
          new TextEncoder().encode(seeded),
          key,
          aad,
        );
        const enc = {
          encryptedLabel: encode(validLabelBlob(key)),
          encryptedConfig: encode(notJson),
        };
        let msg = "";
        try {
          decryptFieldContent(enc, pk);
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(DecryptionError);
          msg = (err as DecryptionError).message;
        }
        expect(msg).not.toContain(seeded);
      } finally {
        sodium.memzero(key);
      }
    });
  });

  // -------------------------------------------------------------------------
  // encryptFormMeta / decryptFormMeta
  // -------------------------------------------------------------------------

  describe("encryptFormMeta / decryptFormMeta roundtrip", () => {
    it("roundtrips a full meta with all fields populated", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = {
        description: { en: "ct-form-desc" },
        submitMessage: { en: "ct-submit-msg" },
        closedMessage: { en: "ct-closed-msg" },
        bannerBlobKey: "ct-banner-key-abc",
        bannerAlt: "ct-banner-alt-text",
      };

      const encrypted = encryptFormMeta(meta, pk);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");

      const decrypted = decryptFormMeta(encrypted!, pk);
      expect(decrypted).toEqual(meta);
    });

    it("roundtrips meta with only description", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = {
        description: { en: "ct-only-desc" },
      };

      const encrypted = encryptFormMeta(meta, pk);
      expect(encrypted).toBeDefined();
      const decrypted = decryptFormMeta(encrypted!, pk);
      expect(decrypted).toEqual(meta);
    });

    it("roundtrips meta with ProseMirror doc JSON in description", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = {
        description: {
          en: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "ct-prosemirror" }],
              },
            ],
          },
        },
      };

      const encrypted = encryptFormMeta(meta, pk);
      expect(encrypted).toBeDefined();
      const decrypted = decryptFormMeta(encrypted!, pk);
      expect(decrypted).toEqual(meta);
    });

    it("roundtrips meta with bannerAlt but no bannerBlobKey", () => {
      const pk = orgPubKey();
      // bannerAlt alone does not trigger hasContent (bannerBlobKey is the
      // content-bearing field); this meta has a description to carry content.
      const meta: IntakeFormMeta = {
        description: { en: "ct-desc-with-alt" },
        bannerAlt: "ct-alt-only",
      };

      const encrypted = encryptFormMeta(meta, pk);
      expect(encrypted).toBeDefined();
      const decrypted = decryptFormMeta(encrypted!, pk);
      expect(decrypted).toEqual(meta);
    });

    it("produces different ciphertext on each call (random nonce)", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = {
        description: { en: "ct-nonce-test" },
      };

      const a = encryptFormMeta(meta, pk);
      const b = encryptFormMeta(meta, pk);
      expect(a).not.toBe(b);
    });
  });

  // -------------------------------------------------------------------------
  // hasContent paths in encryptFormMeta (lines 226-231)
  // -------------------------------------------------------------------------

  describe("encryptFormMeta hasContent paths", () => {
    it("returns undefined when all meta fields are empty or absent", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = {};
      expect(encryptFormMeta(meta, pk)).toBe(undefined);
    });

    it("returns undefined when fields are present but contain only whitespace", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = {
        description: { en: "   " },
        submitMessage: { en: "  \t  " },
        closedMessage: { en: "\n" },
        bannerBlobKey: "",
      };
      expect(encryptFormMeta(meta, pk)).toBe(undefined);
    });

    it("returns undefined when rich text fields have empty content arrays", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = {
        description: { en: { type: "doc", content: [] } },
      };
      expect(encryptFormMeta(meta, pk)).toBe(undefined);
    });

    it("encrypts when only description has content", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = { description: { en: "ct-desc-only" } };
      const encrypted = encryptFormMeta(meta, pk);
      expect(encrypted).toBeDefined();
      expect(decryptFormMeta(encrypted!, pk)).toEqual(meta);
    });

    it("encrypts when only submitMessage has content", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = { submitMessage: { en: "ct-submit-only" } };
      const encrypted = encryptFormMeta(meta, pk);
      expect(encrypted).toBeDefined();
      expect(decryptFormMeta(encrypted!, pk)).toEqual(meta);
    });

    it("encrypts when only closedMessage has content", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = { closedMessage: { en: "ct-closed-only" } };
      const encrypted = encryptFormMeta(meta, pk);
      expect(encrypted).toBeDefined();
      expect(decryptFormMeta(encrypted!, pk)).toEqual(meta);
    });

    it("encrypts when only bannerBlobKey has content", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = { bannerBlobKey: "ct-banner-key-xyz" };
      const encrypted = encryptFormMeta(meta, pk);
      expect(encrypted).toBeDefined();
      expect(decryptFormMeta(encrypted!, pk)).toEqual(meta);
    });
  });

  // -------------------------------------------------------------------------
  // decryptFormMeta error branches (wrong key, truncated, tampered,
  // schema mismatch, non-JSON)
  // -------------------------------------------------------------------------

  describe("decryptFormMeta error branches", () => {
    // AAD literal must match the production constant (ADR-053 domain
    // separation label). Stored form-meta ciphertext depends on this value.
    const aad = new TextEncoder().encode("care-y-intake-form-aad-v1");

    it("throws DecryptionError with wrong org public key", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = { description: { en: "ct-wrong-key" } };
      const encrypted = encryptFormMeta(meta, pk)!;

      const otherPk = orgPubKey();
      expect(() => decryptFormMeta(encrypted, otherPk)).toThrow(
        DecryptionError,
      );
    });

    it("throws DecryptionError on truncated ciphertext", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = { description: { en: "ct-truncated" } };
      const encrypted = encryptFormMeta(meta, pk)!;

      const blob = decode(encrypted);
      const truncated = encode(blob.subarray(0, 10));
      expect(() => decryptFormMeta(truncated, pk)).toThrow(DecryptionError);
    });

    it("throws DecryptionError on flipped-bit ciphertext", () => {
      const pk = orgPubKey();
      const meta: IntakeFormMeta = { description: { en: "ct-flipped" } };
      const encrypted = encryptFormMeta(meta, pk)!;

      const blob = decode(encrypted);
      blob[blob.length - 1] = (blob[blob.length - 1] ?? 0) ^ 0xff;
      const tampered = encode(blob);
      expect(() => decryptFormMeta(tampered, pk)).toThrow(DecryptionError);
    });

    it("throws DecryptionError when decrypted blob is valid JSON but fails intakeFormMeta schema", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      try {
        // Valid JSON, wrong shape (array instead of object)
        const badMeta = encryptContent(
          new TextEncoder().encode(JSON.stringify([1, 2, 3])),
          key,
          aad,
        );
        const encrypted = encode(badMeta);
        expect(() => decryptFormMeta(encrypted, pk)).toThrow(DecryptionError);
      } finally {
        sodium.memzero(key);
      }
    });

    it("throws DecryptionError when decrypted blob is not valid JSON", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      try {
        const notJson = encryptContent(
          new TextEncoder().encode("<<<not-json-meta>>>"),
          key,
          aad,
        );
        const encrypted = encode(notJson);
        expect(() => decryptFormMeta(encrypted, pk)).toThrow(DecryptionError);
      } finally {
        sodium.memzero(key);
      }
    });

    it("schema-mismatch error message does not leak seeded plaintext", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      const seeded = "ct-meta-secret-55";
      try {
        const badMeta = encryptContent(
          new TextEncoder().encode(JSON.stringify({ badField: seeded })),
          key,
          aad,
        );
        const encrypted = encode(badMeta);
        let msg = "";
        try {
          decryptFormMeta(encrypted, pk);
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(DecryptionError);
          msg = (err as DecryptionError).message;
        }
        expect(msg).not.toContain(seeded);
      } finally {
        sodium.memzero(key);
      }
    });

    it("non-JSON error message does not leak seeded plaintext", () => {
      const pk = orgPubKey();
      const key = deriveClientBrandingKey(pk);
      const seeded = "ct-meta-garbage-66";
      try {
        const notJson = encryptContent(
          new TextEncoder().encode(seeded),
          key,
          aad,
        );
        const encrypted = encode(notJson);
        let msg = "";
        try {
          decryptFormMeta(encrypted, pk);
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(DecryptionError);
          msg = (err as DecryptionError).message;
        }
        expect(msg).not.toContain(seeded);
      } finally {
        sodium.memzero(key);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Property-based roundtrip: arbitrary non-empty form meta strings survive
  // encrypt -> decrypt without data loss.
  // -------------------------------------------------------------------------

  describe("property-based", () => {
    it("roundtrip recovers arbitrary form meta with non-empty fields", () => {
      const pk = orgPubKey();
      fc.assert(
        fc.property(
          fc.record({
            description: fc.record({
              en: fc.string({ minLength: 1, maxLength: 200 }),
            }),
            submitMessage: fc.record({
              en: fc.string({ minLength: 1, maxLength: 200 }),
            }),
            closedMessage: fc.record({
              en: fc.string({ minLength: 1, maxLength: 200 }),
            }),
            bannerBlobKey: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          (meta) => {
            // All fields carry content, so encryptFormMeta always returns
            // a string (never undefined). The constrained arbitraries
            // guarantee non-empty values; the all-empty case is covered
            // by the hasContent tests above.
            const encrypted = encryptFormMeta(meta, pk);
            expect(encrypted).toBeDefined();
            const decrypted = decryptFormMeta(encrypted!, pk);
            expect(decrypted).toEqual(meta);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});
