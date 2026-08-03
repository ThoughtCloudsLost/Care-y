/**
 * Standard base64 helpers for browser-local round-trips only.
 *
 * Used for localStorage persistence (sealed envelopes, recent views) and
 * offline file formats (escrow export). NOT for server wire values.
 * Wire values use encode/decode from @care-y/crypto (base64url, no padding).
 */

/**
 * Encode a Uint8Array to a standard base64 string.
 * Used for localStorage persistence of org-key ciphertext.
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Decode a standard base64 string back to Uint8Array.
 * Inverse of uint8ArrayToBase64.
 */
export function base64ToUint8Array(encoded: string): Uint8Array {
  const binary = atob(encoded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
