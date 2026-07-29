/**
 * Base64 helpers for binary values held on the client.
 *
 * These are for local storage and envelope parsing, not for ciphertext on
 * the wire. Encrypted fields arrive from tRPC as base64 strings already and
 * go straight to the decrypt caches without conversion.
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
