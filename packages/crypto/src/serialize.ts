/**
 * URL-safe base64 (no padding) serialization for crypto values.
 *
 * All binary-to-string conversion in @care-y/crypto goes through these two
 * functions. Uses native btoa/atob (available in browsers and Node 16+)
 * instead of libsodium, so encode/decode work without prior getSodium()
 * initialization. The URLSAFE_NO_PADDING variant matches RFC 9497 OPRF
 * test vectors, WebAuthn, and JWT conventions.
 */

import { InvalidInputError } from "./errors.js";

/**
 * Encode binary data to URL-safe base64 (no padding).
 *
 * @param data - Raw bytes to encode
 * @returns URL-safe base64 string (alphabet: A-Za-z0-9_-)
 */
export function encode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decode URL-safe base64 (no padding) to binary data.
 *
 * @param encoded - URL-safe base64 string
 * @returns Decoded bytes
 * @throws InvalidInputError on malformed input
 */
export function decode(encoded: string): Uint8Array {
  try {
    const std = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = std + "=".repeat((4 - (std.length % 4)) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    throw new InvalidInputError("Invalid base64url encoding");
  }
}
