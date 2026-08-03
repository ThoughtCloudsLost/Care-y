/**
 * Base64url encoding/decoding and crypto utilities for WebAuthn.
 *
 * Vendored from @passwordless-id/webauthn v2.3.5 (MIT, Arnaud Dagnelies).
 * Source: https://github.com/passwordless-id/webauthn (commit e158fe0)
 *
 * Adapted for CARE-Y: uses Node.js Buffer instead of browser btoa/atob,
 * explicit return types, no `var` usage.
 */

import type { Base64URLString } from "./types.js";

/** Converts a UTF-8 string to an ArrayBuffer (Latin-1 codepoints). */
export function toBuffer(txt: string): ArrayBuffer {
  return Uint8Array.from(txt, (c) => c.charCodeAt(0)).buffer;
}

/** Converts an ArrayBuffer to a string (Latin-1 codepoints). */
export function parseBuffer(buffer: ArrayBuffer): string {
  return String.fromCharCode(...new Uint8Array(buffer));
}

/** Validates a base64url-encoded string. */
export function isBase64url(txt: string): boolean {
  return /^[a-zA-Z0-9\-_]+=*$/.test(txt);
}

/** Encodes binary data as a base64url string. */
export function toBase64url(buffer: ArrayBuffer | Uint8Array): Base64URLString {
  const ab =
    buffer instanceof Uint8Array
      ? buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength,
        )
      : buffer;
  return Buffer.from(ab).toString("base64url");
}

/** Decodes a base64url string to an ArrayBuffer. */
export function parseBase64url(txt: Base64URLString): ArrayBuffer {
  const base64 = txt.replaceAll("-", "+").replaceAll("_", "/");
  const buf = Buffer.from(base64, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/** Computes SHA-256 hash using Node.js crypto. */
export async function sha256(
  buffer: ArrayBuffer | Uint8Array,
): Promise<ArrayBuffer> {
  const { subtle } = globalThis.crypto;
  // Ensure a fresh Uint8Array view for Node's SubtleCrypto
  const input =
    buffer instanceof Uint8Array
      ? Uint8Array.from(buffer)
      : new Uint8Array(buffer);
  return subtle.digest("SHA-256", input);
}

/** Converts an ArrayBuffer to a hex string. */
export function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Concatenates two ArrayBuffers. */
export function concatenateBuffers(
  buffer1: ArrayBuffer,
  buffer2: ArrayBuffer,
): Uint8Array {
  const result = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  result.set(new Uint8Array(buffer1), 0);
  result.set(new Uint8Array(buffer2), buffer1.byteLength);
  return result;
}
