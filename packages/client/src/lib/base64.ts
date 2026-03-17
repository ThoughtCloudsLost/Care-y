/**
 * Base64 and base64url encoding utilities for browser-side crypto flows.
 *
 * Consolidates base64 handling that was previously duplicated across
 * webauthn.ts, login-crypto.ts, and register-crypto.ts. Browser-only
 * (uses atob/btoa, no Node Buffer).
 */

/**
 * Decode a standard base64 string (with +, /, =) to Uint8Array.
 *
 * The OPRF evaluate endpoint returns standard base64. The @care-y/crypto
 * decode() expects url-safe no-padding base64. This bridges the gap until
 * all server responses are standardized to url-safe encoding.
 *
 * The `evaluated` value is a public ristretto255 point (not key material),
 * so the temporary JS string from atob is acceptable here.
 */
export function decodeStandardBase64(encoded: string): Uint8Array {
  const binary = atob(encoded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/**
 * Copy a Uint8Array's contents into a standalone ArrayBuffer
 * suitable for Transferable transfer. Uses slice() to guarantee
 * a fresh ArrayBuffer even when the view covers the whole buffer.
 */
export function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  // ArrayBuffer.prototype.slice returns ArrayBuffer per spec, but TS
  // types it as ArrayBufferLike (union with SharedArrayBuffer).
  // Uint8Array never backs onto SharedArrayBuffer in our usage.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ArrayBuffer.slice() always returns ArrayBuffer
  return view.buffer.slice(
    view.byteOffset,
    view.byteOffset + view.byteLength,
  ) as ArrayBuffer;
}
