/**
 * Password hashing with a pluggable interface.
 *
 * Current implementation uses Node's built-in crypto.scrypt (no native dep).
 * Swap to Argon2id by providing a different PasswordHasher factory.
 */

import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SALT_BYTES = 16;
const KEY_BYTES = 64;
const HASH_PREFIX = "scrypt";

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

/** Creates a PasswordHasher backed by Node crypto.scrypt. */
export function createScryptHasher(): PasswordHasher {
  return {
    async hash(password: string): Promise<string> {
      const salt = randomBytes(SALT_BYTES);
      const derived = (await scryptAsync(password, salt, KEY_BYTES)) as Buffer;
      return `${HASH_PREFIX}:${salt.toString("hex")}:${derived.toString("hex")}`;
    },

    async verify(password: string, hash: string): Promise<boolean> {
      const [prefix, saltHex, hashHex, ...rest] = hash.split(":");
      if (rest.length > 0 || prefix !== HASH_PREFIX || !saltHex || !hashHex) {
        return false;
      }

      // Validate hex lengths before decoding. A 16-byte salt is 32 hex chars,
      // a 64-byte key is 128 hex chars. Reject anything else early.
      if (
        saltHex.length !== SALT_BYTES * 2 ||
        hashHex.length !== KEY_BYTES * 2
      ) {
        return false;
      }

      // Buffer.from(badHex, "hex") silently drops invalid hex pairs, producing
      // a shorter buffer. The length check catches that case.
      const salt = Buffer.from(saltHex, "hex");
      const stored = Buffer.from(hashHex, "hex");

      if (salt.length !== SALT_BYTES || stored.length !== KEY_BYTES) {
        return false;
      }

      const derived = (await scryptAsync(password, salt, KEY_BYTES)) as Buffer;
      return timingSafeEqual(derived, stored);
    },
  };
}
