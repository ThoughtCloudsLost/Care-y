/**
 * URL-safe base64 (no padding) serialization for crypto values.
 *
 * All binary-to-string conversion in @care-y/crypto goes through these two
 * functions. They delegate to libsodium's base64 implementation, which
 * operates on Uint8Array directly (no JS string intermediaries for binary
 * data). The URLSAFE_NO_PADDING variant matches RFC 9497 OPRF test vectors,
 * WebAuthn, and JWT conventions.
 */

import { requireSodium } from "./sodium.js";
import { InvalidInputError } from "./errors.js";

/**
 * Encode binary data to URL-safe base64 (no padding).
 *
 * @param data - Raw bytes to encode
 * @returns URL-safe base64 string (alphabet: A-Za-z0-9_-)
 */
export function encode(data: Uint8Array): string {
  const sodium = requireSodium();
  return sodium.to_base64(data, sodium.base64_variants.URLSAFE_NO_PADDING);
}

/**
 * Decode URL-safe base64 (no padding) to binary data.
 *
 * @param encoded - URL-safe base64 string
 * @returns Decoded bytes
 * @throws InvalidInputError on malformed input
 */
export function decode(encoded: string): Uint8Array {
  const sodium = requireSodium();
  try {
    return sodium.from_base64(
      encoded,
      sodium.base64_variants.URLSAFE_NO_PADDING,
    );
  } catch {
    throw new InvalidInputError("Invalid base64url encoding");
  }
}
