/**
 * Converts a JSON-serialized Node.js Buffer to a base64 string.
 *
 * tRPC without superjson serializes Node.js Buffer objects as
 * { type: "Buffer", data: number[] } over JSON. This utility bridges
 * that format to the base64 strings expected by CryptoBridge.
 *
 * If the input is already a string (e.g., when superjson is added later
 * or the server pre-converts), it is returned unchanged.
 */
export function serializedBufferToBase64(
  buf: { type: "Buffer"; data: number[] } | string,
): string {
  if (typeof buf === "string") return buf;
  const bytes = new Uint8Array(buf.data);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
