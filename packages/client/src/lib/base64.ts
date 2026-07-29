/**
 * Browser-side ArrayBuffer utilities for crypto flows.
 *
 * Wire-value encoding/decoding uses encode/decode from @care-y/crypto.
 * This module provides only the toArrayBuffer helper for Transferable
 * hand-off to the crypto Worker.
 */

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
