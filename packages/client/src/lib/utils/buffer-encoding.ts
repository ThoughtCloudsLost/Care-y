/**
 * Converts a JSON-serialized Node.js Buffer to a URL-safe base64 string.
 *
 * tRPC without superjson serializes Node.js Buffer objects as
 * { type: "Buffer", data: number[] } over JSON. This utility bridges
 * that format to the URL-safe base64 (no padding) strings expected by
 * CryptoBridge and @care-y/crypto's decode().
 *
 * If the input is already a string (e.g., when superjson is added later
 * or the server pre-converts), it is returned unchanged.
 */
export function serializedBufferToBase64(
  buf: { type: "Buffer"; data: number[] } | string,
): string {
  if (typeof buf === "string") return buf;
  const bytes = new Uint8Array(buf.data);
  // Standard base64 via btoa, then convert to URL-safe no-padding.
  // This matches @care-y/crypto's encode() output format.
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
