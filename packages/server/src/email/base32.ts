/**
 * Lowercase base32 encoder (RFC 4648 alphabet, lowercased, no padding).
 *
 * Email local parts survive case folding by intermediaries, so the token
 * must use a case-insensitive alphabet. Standard base32 uses A-Z and 2-7;
 * we lowercase the output so it round-trips through any MTA that normalizes.
 */

const ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";

/** Encodes a Buffer to lowercase base32 (no padding). */
export function encodeBase32Lower(input: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";

  for (const byte of input) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      out += ALPHABET.charAt((value >>> bits) & 0x1f);
    }
  }

  // Flush remaining bits (left-padded with zeros)
  if (bits > 0) {
    out += ALPHABET.charAt((value << (5 - bits)) & 0x1f);
  }

  return out;
}
