/**
 * Buffer to base64 conversion for tRPC return paths.
 *
 * Ciphertext crosses the tRPC boundary as a base64 string. Services and
 * repositories keep Buffer, because Postgres bytea round-trips as Buffer
 * through Kysely. The conversion belongs at the router, on the way out.
 *
 * A Buffer returned from a tRPC procedure serializes as
 * {type:"Buffer", data:[74,97,110,...]}, roughly 2.8x the bytes of the
 * same value in base64, paid on every encrypted field of every row in
 * every list payload.
 *
 * See "Ciphertext on the Wire" in the code standards.
 */

/** Converts a Buffer to base64. For encrypted fields on tRPC responses. */
export function b64(buf: Buffer): string {
  return buf.toString("base64");
}

/** Converts a nullable Buffer to a nullable base64 string. */
export function b64n(buf: Buffer | null): string | null {
  return buf !== null ? buf.toString("base64") : null;
}

/** Buffer-valued key wrap as it leaves a service. */
export interface BufferKeyWrap {
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

/** Base64 key wrap as it crosses the wire. */
export interface WireKeyWrap {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedKey: string;
}

/** Converts a key wrap's Buffer fields to base64 strings. */
export function b64KeyWrap(kw: BufferKeyWrap | null): WireKeyWrap | null {
  if (kw === null) return null;
  return {
    ephemeralPoint: b64(kw.ephemeralPoint),
    nonce: b64(kw.nonce),
    wrappedKey: b64(kw.wrappedKey),
  };
}
