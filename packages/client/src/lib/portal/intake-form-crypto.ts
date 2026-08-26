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
  intakeFormMetaSchema,
  localizedTextSchema,
  visibleWhenSchema,
  type IntakeFieldConfig,
  type IntakeFormMeta,
  type LocalizedText,
  type LocalizedRichText,
  type VisibleWhen,
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
  label: LocalizedText;
  config: IntakeFieldConfig;
  visibleWhen?: VisibleWhen;
}

/**
 * Encrypt a field definition's label and config under the client-branding key.
 *
 * The derived key is zeroed in a finally block. Each call re-derives the key
 * (one BLAKE2b hash) rather than caching it in module state, so key material
 * does not outlive its use.
 *
 * @param plain - Localized label and config to encrypt
 * @param orgPublicKey - The org's Curve25519 public key (32 bytes)
 * @returns Base64url-encoded encrypted label and config strings
 */
export function encryptFieldContent(
  plain: {
    label: LocalizedText;
    config: IntakeFieldConfig;
    visibleWhen?: VisibleWhen;
  },
  orgPublicKey: Uint8Array,
): EncryptedFieldContent {
  const key: SymmetricKey = deriveClientBrandingKey(orgPublicKey);
  try {
    const labelBytes = textEncoder.encode(JSON.stringify(plain.label));
    // The config blob carries the field config and optional visibleWhen
    // rules. VisibleWhen is encrypted alongside the config so the server
    // never sees conditional visibility rules.
    const configPayload: Record<string, unknown> = { ...plain.config };
    if (plain.visibleWhen != null) {
      configPayload.visibleWhen = plain.visibleWhen;
    }
    const configBytes = textEncoder.encode(JSON.stringify(configPayload));

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

    // Parse and validate both blobs inside a catch-all so that neither
    // a JSON.parse SyntaxError nor an unexpected runtime error can leak
    // decrypted plaintext fragments in an error message. Only typed
    // DecryptionError with a content-free message escapes.
    let label: LocalizedText;
    let config: IntakeFieldConfig;

    try {
      const labelJson: unknown = JSON.parse(textDecoder.decode(labelPlain));
      const labelParsed = localizedTextSchema.safeParse(labelJson);
      if (!labelParsed.success) {
        throw new DecryptionError(
          "Decrypted field label does not match LocalizedText schema",
        );
      }
      label = labelParsed.data;
    } catch (err: unknown) {
      if (err instanceof DecryptionError) throw err;
      throw new DecryptionError(
        "Decrypted field label is not valid serialized content",
      );
    }

    let visibleWhen: VisibleWhen | undefined;

    try {
      const configJson: unknown = JSON.parse(textDecoder.decode(configPlain));
      // The config blob may contain a visibleWhen property alongside the
      // config discriminated union fields. Extract it before schema parsing.
      if (
        typeof configJson === "object" &&
        configJson !== null &&
        "visibleWhen" in configJson
      ) {
        const vw = (configJson as Record<string, unknown>).visibleWhen;
        const vwParsed = visibleWhenSchema.safeParse(vw);
        if (vwParsed.success) {
          visibleWhen = vwParsed.data;
        }
      }
      const parsed = intakeFieldConfigSchema.safeParse(configJson);
      if (!parsed.success) {
        throw new DecryptionError(
          "Decrypted field config does not match expected schema",
        );
      }
      config = parsed.data;
    } catch (err: unknown) {
      if (err instanceof DecryptionError) throw err;
      throw new DecryptionError(
        "Decrypted field config is not valid serialized content",
      );
    }

    return { label, config, visibleWhen };
  } finally {
    requireSodium().memzero(key);
  }
}

// ---------------------------------------------------------------------------
// Rich text content helpers
// ---------------------------------------------------------------------------

/**
 * Check whether a single rich-text locale value has meaningful content.
 * Strings are checked via trim().length; ProseMirror doc objects are
 * non-empty when their content array has at least one node.
 */
function hasRichValue(
  v: string | { type: "doc"; content: unknown[] },
): boolean {
  if (typeof v === "string") return v.trim().length > 0;
  return Array.isArray(v.content) && v.content.length > 0;
}

/**
 * Check whether a LocalizedRichText record has any non-empty locale value.
 * Returns false for undefined/null inputs.
 */
function hasAnyRichContent(localized: LocalizedRichText | undefined): boolean {
  if (localized == null) return false;
  return Object.values(localized).some((v) => hasRichValue(v));
}

// ---------------------------------------------------------------------------
// Form-level metadata encrypt/decrypt
// ---------------------------------------------------------------------------

/**
 * Encrypt form-level metadata (description, submit message, closed message)
 * under the client-branding key. Returns base64url-encoded ciphertext, or
 * undefined when all fields are empty (no blob needed).
 *
 * @param meta - Plaintext form metadata
 * @param orgPublicKey - Org Curve25519 public key (32 bytes)
 * @returns Base64url-encoded ciphertext, or undefined if meta is empty
 */
export function encryptFormMeta(
  meta: IntakeFormMeta,
  orgPublicKey: Uint8Array,
): string | undefined {
  // Skip encryption when no descriptive content is present
  const hasContent =
    hasAnyRichContent(meta.description) ||
    hasAnyRichContent(meta.submitMessage) ||
    hasAnyRichContent(meta.closedMessage) ||
    (meta.bannerBlobKey != null && meta.bannerBlobKey.length > 0);
  if (!hasContent) return undefined;

  const key: SymmetricKey = deriveClientBrandingKey(orgPublicKey);
  try {
    const metaBytes = textEncoder.encode(JSON.stringify(meta));
    const encrypted = encryptContent(metaBytes, key, INTAKE_FORM_AAD);
    return encode(encrypted);
  } finally {
    requireSodium().memzero(key);
  }
}

/**
 * Decrypt form-level metadata from a base64url-encoded ciphertext blob.
 *
 * @param encryptedMeta - Base64url ciphertext
 * @param orgPublicKey - Org Curve25519 public key (32 bytes)
 * @returns Validated IntakeFormMeta
 * @throws DecryptionError on decrypt failure or schema mismatch
 */
export function decryptFormMeta(
  encryptedMeta: string,
  orgPublicKey: Uint8Array,
): IntakeFormMeta {
  const key: SymmetricKey = deriveClientBrandingKey(orgPublicKey);
  try {
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Ciphertext is a branded Uint8Array; see encryptFieldContent comment */
    const plain = decryptContent(
      decode(encryptedMeta) as Ciphertext,
      key,
      INTAKE_FORM_AAD,
    );
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */

    try {
      const json: unknown = JSON.parse(textDecoder.decode(plain));
      const parsed = intakeFormMetaSchema.safeParse(json);
      if (!parsed.success) {
        throw new DecryptionError(
          "Decrypted form metadata does not match expected schema",
        );
      }
      return parsed.data;
    } catch (err: unknown) {
      if (err instanceof DecryptionError) throw err;
      throw new DecryptionError(
        "Decrypted form metadata is not valid serialized content",
      );
    }
  } finally {
    requireSodium().memzero(key);
  }
}
