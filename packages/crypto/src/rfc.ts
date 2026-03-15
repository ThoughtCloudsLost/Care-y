/**
 * RFC 9497 / RFC 9380 building blocks for OPRF compliance.
 *
 * expand_message_xmd (RFC 9380 Section 5.3.1):
 *   Deterministic expansion of arbitrary input to uniform bytes using
 *   SHA-512. Used by HashToGroup and Finalize to match RFC 9497's
 *   ristretto255-SHA512 ciphersuite.
 *
 * Context string (RFC 9497 Section 3.1):
 *   Domain separation for the OPRF protocol. Encodes mode (0x00 for
 *   base OPRF) and ciphersuite identifier ("ristretto255-SHA512").
 *
 * References:
 *   SEC-012  RFC 9497 (OPRF protocol, CreateContextString, Finalize hash)
 *   SEC-011  RFC 9496 (ristretto255 group, used by HashToGroup)
 *   SEC-023  NIST SP 800-185 (domain separation formal definition)
 *   RFC 9380 Section 5.3.1 (expand_message_xmd algorithm)
 *   RFC 8017 (I2OSP primitive, Integer-to-Octet-String)
 */

import type { SodiumBackend } from "./sodium.js";
import { concatBytes } from "./bytes.js";
import { InvalidInputError } from "./errors.js";

/** SHA-512 output size in bytes. */
const B_IN_BYTES = 64;

/** SHA-512 input block size in bytes. */
const S_IN_BYTES = 128;

/**
 * OPRF mode byte (RFC 9497 Table 1).
 * 0x00 = base OPRF (no proof, no public key).
 */
const OPRF_MODE = 0x00;

/** Ciphersuite identifier for ristretto255-SHA512 (RFC 9497 Section 4.1). */
const SUITE_ID = "ristretto255-SHA512";

/**
 * contextString = "OPRFV1-" || I2OSP(mode, 1) || "-" || identifier
 * Pre-computed for base OPRF with ristretto255-SHA512.
 */
const CONTEXT_STRING = new TextEncoder().encode(
  `OPRFV1-${String.fromCharCode(OPRF_MODE)}-${SUITE_ID}`,
);

/** DST for HashToGroup: "HashToGroup-" || contextString */
export const HASH_TO_GROUP_DST = concatBytes(
  new TextEncoder().encode("HashToGroup-"),
  CONTEXT_STRING,
);

/* eslint-disable security/detect-object-injection --
   i2osp and strxor use loop-bounded indices over fixed-size Uint8Arrays.
   No user-controlled index access. These are RFC primitives with
   deterministic, length-checked iteration. Uint8Array elements are
   always numbers (0-255) within bounds, so non-null assertions are safe. */

/**
 * I2OSP(x, xLen): Integer to Octet String Primitive (RFC 8017).
 * Converts a nonneg integer to big-endian byte array of length xLen.
 */
function i2osp(x: number, xLen: number): Uint8Array {
  const result = new Uint8Array(xLen);
  for (let i = xLen - 1; i >= 0; i--) {
    result[i] = x & 0xff;
    x = x >>> 8;
  }
  return result;
}

/**
 * strxor: XOR two equal-length byte arrays (RFC 9380 Section 4).
 */
function strxor(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- bounded loop over Uint8Array; elements are always 0-255
    result[i] = a[i]! ^ b[i]!;
  }
  return result;
}

/* eslint-enable security/detect-object-injection */

/**
 * expand_message_xmd per RFC 9380 Section 5.3.1.
 *
 * Expands a message to len_in_bytes uniform bytes using SHA-512
 * with domain separation.
 *
 * @param sodium - Sodium backend (must expose crypto_hash_sha512)
 * @param msg - Message to expand
 * @param DST - Domain separation tag (max 255 bytes)
 * @param lenInBytes - Desired output length
 * @returns Uniform byte string of length lenInBytes
 */
export function expandMessageXMD(
  sodium: SodiumBackend,
  msg: Uint8Array,
  DST: Uint8Array,
  lenInBytes: number,
): Uint8Array {
  const ell = Math.ceil(lenInBytes / B_IN_BYTES);

  if (ell > 255 || lenInBytes > 65535 || DST.length > 255) {
    throw new InvalidInputError("expand_message_xmd: parameters out of range");
  }

  // Step 3: DST_prime = DST || I2OSP(len(DST), 1)
  const DST_prime = concatBytes(DST, i2osp(DST.length, 1));

  // Step 4: Z_pad = I2OSP(0, s_in_bytes) = 128 zero bytes for SHA-512
  const Z_pad = new Uint8Array(S_IN_BYTES);

  // Step 5: l_i_b_str = I2OSP(len_in_bytes, 2)
  const l_i_b_str = i2osp(lenInBytes, 2);

  // Step 6: msg_prime = Z_pad || msg || l_i_b_str || I2OSP(0, 1) || DST_prime
  const msg_prime = concatBytes(
    Z_pad,
    msg,
    l_i_b_str,
    new Uint8Array([0]),
    DST_prime,
  );

  // Step 7: b_0 = H(msg_prime)
  const b_0 = sodium.crypto_hash_sha512(msg_prime);

  // Step 8: b_1 = H(b_0 || I2OSP(1, 1) || DST_prime)
  const blocks: Uint8Array[] = [];
  let b_prev = sodium.crypto_hash_sha512(
    concatBytes(b_0, new Uint8Array([1]), DST_prime),
  );
  blocks.push(b_prev);

  // Steps 9-10: b_i = H(strxor(b_0, b_(i-1)) || I2OSP(i, 1) || DST_prime)
  for (let i = 2; i <= ell; i++) {
    b_prev = sodium.crypto_hash_sha512(
      concatBytes(strxor(b_0, b_prev), new Uint8Array([i]), DST_prime),
    );
    blocks.push(b_prev);
  }

  // Step 11-12: concatenate and truncate
  return concatBytes(...blocks).subarray(0, lenInBytes);
}

/**
 * Build the Finalize hash input per RFC 9497 Section 3.3.1.
 *
 * hashInput = I2OSP(len(input), 2) || input ||
 *             I2OSP(len(unblindedElement), 2) || unblindedElement ||
 *             "Finalize"
 */
export function buildFinalizeInput(
  input: Uint8Array,
  unblindedElement: Uint8Array,
): Uint8Array {
  return concatBytes(
    i2osp(input.length, 2),
    input,
    i2osp(unblindedElement.length, 2),
    unblindedElement,
    new TextEncoder().encode("Finalize"),
  );
}
