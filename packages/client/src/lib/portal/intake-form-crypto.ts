/**
 * Re-exports intake form field and metadata encryption from @care-y/crypto.
 *
 * The canonical implementations live in packages/crypto/src/intake-form.ts
 * beside the branding pair they mirror. This module re-exports them so
 * existing client-side callers ("$lib/portal/intake-form-crypto.js") do
 * not need import path changes.
 */

export {
  encryptFieldContent,
  decryptFieldContent,
  encryptFormMeta,
  decryptFormMeta,
  type EncryptedFieldContent,
  type DecryptedFieldContent,
} from "@care-y/crypto";
