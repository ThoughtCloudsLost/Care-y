/**
 * TOTP (Time-Based One-Time Password) implementation per RFC 6238.
 *
 * Uses HMAC-SHA1 for authenticator app compatibility (Google Authenticator,
 * Microsoft Authenticator do not reliably support SHA-256/SHA-512).
 * HMAC-SHA1 as a PRF is not affected by SHA-1's collision weakness.
 *
 * Secret generation, otpauth URI construction, and code verification.
 * No external dependencies; uses node:crypto exclusively.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOTP_DIGITS = 6;
/** Time step length in seconds (RFC 6238 default). */
export const TOTP_PERIOD = 30;
const TOTP_ALGORITHM = "sha1";

/**
 * Time steps checked in each direction for clock drift, the default for
 * verifyTotpCode(). The replay cache TTL is derived from this: keep the
 * two in sync by changing only this constant.
 */
export const TOTP_VERIFY_WINDOW = 1;

/**
 * Generates a 20-byte random TOTP secret.
 * Returns raw bytes. The caller must base32-encode for display
 * and encrypt with FieldEncryptor before DB storage.
 */
export function generateTotpSecret(): Buffer {
  return randomBytes(20);
}

/**
 * Encodes raw bytes as base32 (RFC 4648, no padding).
 * Used for the otpauth URI and manual entry display.
 */
export function base32Encode(buf: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let result = "";

  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += alphabet.charAt((value >>> bits) & 0x1f);
    }
  }

  if (bits > 0) {
    result += alphabet.charAt((value << (5 - bits)) & 0x1f);
  }

  return result;
}

/**
 * Decodes a base32 string (RFC 4648, case-insensitive, padding ignored) to bytes.
 */
export function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const stripped = input.toUpperCase().replace(/=+$/, "");

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const char of stripped) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue; // skip invalid chars
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 0xff);
    }
  }

  return Buffer.from(output);
}

/**
 * Constructs an otpauth:// URI for QR code generation.
 * The label uses the issuer as the account name (no PII in the URI).
 */
export function getTotpUri(secret: Buffer, issuer: string): string {
  const b32 = base32Encode(secret);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}?secret=${b32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${String(TOTP_DIGITS)}&period=${String(TOTP_PERIOD)}`;
}

/**
 * Generates the TOTP code for a given secret and Unix timestamp.
 * Exported for test use (avoids brute-forcing valid codes).
 */
export function generateTotpCode(secret: Buffer, timestamp: number): string {
  const counter = Math.floor(timestamp / 1000 / TOTP_PERIOD);

  // Counter as big-endian 8-byte buffer
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuf.writeUInt32BE(counter >>> 0, 4);

  const hmac = createHmac(TOTP_ALGORITHM, secret).update(counterBuf).digest();

  // Dynamic truncation (RFC 4226 Section 5.4)
  // HMAC-SHA1 always produces 20 bytes; readUInt8/readUInt32BE
  // throw on out-of-range, eliminating the need for null checks.
  const offset = hmac.readUInt8(hmac.length - 1) & 0x0f;
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;

  const otp = binary % 10 ** TOTP_DIGITS;
  return otp.toString().padStart(TOTP_DIGITS, "0");
}

/**
 * Verifies a TOTP code against a secret, checking the current time step
 * and `window` steps in each direction to handle clock drift.
 *
 * Returns true if the code matches any time step in the window.
 *
 * @param secret   Raw TOTP secret bytes (20 bytes)
 * @param code     6-digit code string from the user
 * @param window   Number of time steps to check in each direction (default TOTP_VERIFY_WINDOW)
 * @param now      Current timestamp in ms (default Date.now(), injectable for tests)
 */
export function verifyTotpCode(
  secret: Buffer,
  code: string,
  window: number = TOTP_VERIFY_WINDOW,
  now: number = Date.now(),
): boolean {
  if (code.length !== TOTP_DIGITS) return false;

  for (let i = -window; i <= window; i++) {
    const timestamp = now + i * TOTP_PERIOD * 1000;
    const expected = generateTotpCode(secret, timestamp);

    // Timing-safe comparison. Both are 6-char strings, so
    // Buffer.from() produces equal-length buffers.
    const a = Buffer.from(expected);
    const b = Buffer.from(code);
    if (a.length === b.length && timingSafeEqual(a, b)) {
      return true;
    }
  }

  return false;
}
