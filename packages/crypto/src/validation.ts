/**
 * Byte-length validation helpers for cryptographic inputs.
 *
 * Centralizes the repeated pattern of checking Uint8Array length against
 * a libsodium constant and throwing a typed error. Pure functions
 * (throw on failure, no side effects otherwise).
 */

import { InvalidKeyError, InvalidInputError } from "./errors.js";

/**
 * Assert that a key has the expected byte length.
 * Throws InvalidKeyError with a descriptive message on mismatch.
 *
 * @param key - The key buffer to validate
 * @param expectedLength - Expected byte count (typically a libsodium constant)
 * @param label - Human-readable name for error messages (e.g., "Content key")
 */
export function assertKeyLength(
  key: Uint8Array,
  expectedLength: number,
  label: string,
): void {
  if (key.length !== expectedLength) {
    throw new InvalidKeyError(
      `${label} must be ${String(expectedLength)} bytes, got ${String(key.length)}`,
    );
  }
}

/**
 * Assert that an input buffer has the expected byte length.
 * Throws InvalidInputError with a descriptive message on mismatch.
 *
 * @param input - The buffer to validate
 * @param expectedLength - Expected byte count
 * @param label - Human-readable name for error messages (e.g., "Nonce")
 */
export function assertInputLength(
  input: Uint8Array,
  expectedLength: number,
  label: string,
): void {
  if (input.length !== expectedLength) {
    throw new InvalidInputError(
      `${label} must be ${String(expectedLength)} bytes, got ${String(input.length)}`,
    );
  }
}
