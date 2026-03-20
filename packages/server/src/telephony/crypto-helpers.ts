/**
 * Shared encrypt-and-zero helpers for telephony handlers.
 *
 * Every inbound handler follows the same pattern: convert plaintext
 * to a Buffer, encrypt it, then zero the plaintext Buffer. Centralizing
 * this here prevents forgetting the zeroing step in new handlers.
 */

import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";

/**
 * Seal-encrypt a plaintext string and zero the intermediate Buffer.
 * Returns the encrypted Buffer. The plaintext never lingers in memory.
 */
export function sealString(
  sealedBox: SealedBoxEncryptor,
  plaintext: string,
): Buffer {
  const buf = Buffer.from(plaintext, "utf-8");
  try {
    return sealedBox.sealBuffer(buf);
  } finally {
    buf.fill(0);
  }
}

/**
 * Seal-encrypt a raw Buffer and zero it after encryption.
 * Use this for binary data (e.g., downloaded MMS attachments).
 * The caller must NOT use rawData after this call.
 */
export function sealBufferAndZero(
  sealedBox: SealedBoxEncryptor,
  rawData: Buffer,
): Buffer {
  try {
    return sealedBox.sealBuffer(rawData);
  } finally {
    rawData.fill(0);
  }
}
