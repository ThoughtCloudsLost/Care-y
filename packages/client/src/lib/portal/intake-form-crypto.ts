/**
 * Client-side encryption helpers for intake form field definitions.
 *
 * Field labels and config are org-authored content shown on a public page.
 * They are encrypted at rest under the client-branding key (BLAKE2b of the
 * org public key), following the two-tier model: public-page readable, DB
 * dump opaque. Anonymous visitors, volunteers, and admins can all derive
 * this key from the org public key.
 *
 * These helpers mirror the branding.ts encrypt/decrypt pattern but use a
 * distinct AAD label for domain separation (ADR-053). The branding AAD
 * binds branding blobs; this one binds form field blobs. Reusing the same
 * AAD would let a ciphertext produced for branding be accepted as a valid
 * field config, or vice versa.
 *
 * Runs on the main thread (no Worker) because the form definition key is
 * derived from public information (the org public key), not from session
 * secrets. The admin builder and the anonymous intake page both call these
 * directly. The Worker requires a keyed session that anonymous visitors
 * never have.
 */

import {
  deriveClientBrandingKey,
  encryptContent,
  decryptContent,
  requireSodium,
  encode,
  decode,
  DecryptionError,
  type SymmetricKey,
  type Ciphertext,
} from "@care-y/crypto";
import {
  intakeFieldConfigSchema,
  type IntakeFieldConfig,
} from "@care-y/shared";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Domain-separated AAD for intake form field ciphertext.
 * Distinct from BRANDING_AAD ("care-y-client-branding-aad-v1") to prevent
 * cross-context ciphertext acceptance (ADR-053).
 */
const INTAKE_FORM_AAD = textEncoder.encode("care-y-intake-form-aad-v1");

export interface EncryptedFieldContent {
  encryptedLabel: string;
  encryptedConfig: string;
}

export interface DecryptedFieldContent {
  label: string;
  config: IntakeFieldConfig;
}

/**
 * Encrypt a field definition's label and config under the client-branding key.
 *
 * The derived key is zeroed in a finally block. Each call re-derives the key
 * (one BLAKE2b hash) rather than caching it in module state, so key material
 * does not outlive its use.
 *
 * @param plain - Plaintext label and config to encrypt
 * @param orgPublicKey - The org's Curve25519 public key (32 bytes)
 * @returns Base64url-encoded encrypted label and config strings
 */
export function encryptFieldContent(
  plain: { label: string; config: IntakeFieldConfig },
  orgPublicKey: Uint8Array,
): EncryptedFieldContent {
  const key: SymmetricKey = deriveClientBrandingKey(orgPublicKey);
  try {
    const labelBytes = textEncoder.encode(plain.label);
    const configBytes = textEncoder.encode(JSON.stringify(plain.config));

    const encryptedLabelBlob = encryptContent(labelBytes, key, INTAKE_FORM_AAD);
    const encryptedConfigBlob = encryptContent(
      configBytes,
      key,
      INTAKE_FORM_AAD,
    );

    return {
      encryptedLabel: encode(encryptedLabelBlob),
      encryptedConfig: encode(encryptedConfigBlob),
    };
  } finally {
    requireSodium().memzero(key);
  }
}

/**
 * Decrypt a field definition's label and config under the client-branding key.
 *
 * After decryption, the config JSON is parsed and validated against
 * intakeFieldConfigSchema. If the schema rejects the parsed object, a
 * DecryptionError is thrown (trust boundary: the blob is org-authored but
 * the schema keeps the renderer total).
 *
 * @param enc - Base64url-encoded encrypted label and config strings
 * @param orgPublicKey - The org's Curve25519 public key (32 bytes)
 * @returns Decrypted label string and validated config object
 * @throws DecryptionError if decryption fails or config does not match schema
 */
export function decryptFieldContent(
  enc: { encryptedLabel: string; encryptedConfig: string },
  orgPublicKey: Uint8Array,
): DecryptedFieldContent {
  const key: SymmetricKey = deriveClientBrandingKey(orgPublicKey);
  try {
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Ciphertext is a branded Uint8Array; the base64-decoded bytes are XChaCha20-Poly1305 AEAD ciphertext (ADR-053) */
    const labelPlain = decryptContent(
      decode(enc.encryptedLabel) as Ciphertext,
      key,
      INTAKE_FORM_AAD,
    );
    const configPlain = decryptContent(
      decode(enc.encryptedConfig) as Ciphertext,
      key,
      INTAKE_FORM_AAD,
    );
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */

    const label = textDecoder.decode(labelPlain);
    const configJson: unknown = JSON.parse(textDecoder.decode(configPlain));
    const parsed = intakeFieldConfigSchema.safeParse(configJson);

    if (!parsed.success) {
      throw new DecryptionError(
        "Decrypted field config does not match expected schema",
      );
    }

    return { label, config: parsed.data };
  } finally {
    requireSodium().memzero(key);
  }
}
