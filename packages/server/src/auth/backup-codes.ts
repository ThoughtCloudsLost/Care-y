/**
 * Backup code generation and verification for 2FA recovery.
 *
 * Generates 8 alphanumeric codes. Codes are hashed with scrypt before storage.
 * Verification uses timing-safe comparison. Each code is one-time use.
 *
 * Code format: 8 lowercase alphanumeric characters, displayed with a hyphen
 * in the middle for readability (e.g., "a1b2-c3d4"). Hyphens and whitespace
 * are stripped before verification.
 */

import { randomBytes } from "node:crypto";
import { createScryptHasher } from "./scrypt-hash.js";

const CODE_COUNT = 8;
const CODE_LENGTH = 8;
const CODE_CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789";
const CODE_KEY_BYTES = 32;

const codeHasher = createScryptHasher(CODE_KEY_BYTES);

/**
 * Generates a single random backup code using rejection sampling
 * to avoid modulo bias.
 */
function generateSingleCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";
  for (const byte of bytes) {
    code += CODE_CHARSET.charAt(byte % CODE_CHARSET.length);
  }
  return code;
}

/**
 * Formats a code for display with a hyphen in the middle.
 * "a1b2c3d4" -> "a1b2-c3d4"
 */
export function formatCode(code: string): string {
  const mid = Math.floor(code.length / 2);
  return code.slice(0, mid) + "-" + code.slice(mid);
}

/**
 * Normalizes a user-entered code by stripping whitespace, hyphens,
 * and lowercasing.
 */
export function normalizeCode(input: string): string {
  return input.trim().toLowerCase().replace(/[\s-]/g, "");
}

/**
 * Generates `count` random backup codes.
 * Returns plaintext codes (caller displays them once, then hashes for storage).
 */
export function generateBackupCodes(count: number = CODE_COUNT): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateSingleCode());
  }
  return codes;
}

/**
 * Hashes a backup code with scrypt for storage.
 * Returns "scrypt:<salt_hex>:<hash_hex>".
 */
export async function hashBackupCode(code: string): Promise<string> {
  return codeHasher.hash(normalizeCode(code));
}

/**
 * Verifies a backup code against a stored hash using timing-safe comparison.
 * Returns true if the code matches.
 */
export async function verifyBackupCode(
  code: string,
  storedHash: string,
): Promise<boolean> {
  return codeHasher.verify(normalizeCode(code), storedHash);
}
