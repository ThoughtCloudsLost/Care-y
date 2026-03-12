/**
 * Password hashing with a pluggable interface.
 *
 * Current implementation uses Node's built-in crypto.scrypt (no native dep).
 * Swap to Argon2id by providing a different PasswordHasher factory.
 */

import { createScryptHasher as createBaseHasher } from "./scrypt-hash.js";

const PASSWORD_KEY_BYTES = 64;

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

/** Creates a PasswordHasher backed by Node crypto.scrypt. */
export function createScryptHasher(): PasswordHasher {
  return createBaseHasher(PASSWORD_KEY_BYTES);
}
