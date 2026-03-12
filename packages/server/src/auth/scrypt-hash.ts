/**
 * Shared scrypt hashing and verification.
 *
 * Used by password.ts (64-byte keys), backup-codes.ts (32-byte keys), and
 * email-code.ts (32-byte keys). Each caller creates a hasher with its own
 * key length; the salt size (16 bytes) and serialization format
 * ("scrypt:saltHex:hashHex") are fixed.
 *
 * Verification uses timing-safe comparison to prevent side-channel leaks.
 */

import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const SALT_BYTES = 16;
const HASH_PREFIX = "scrypt";

export interface ScryptHasher {
  hash(input: string): Promise<string>;
  verify(input: string, storedHash: string): Promise<boolean>;
}

interface ParsedHash {
  readonly salt: Buffer;
  readonly derived: Buffer;
}

/**
 * Parses a stored hash string ("scrypt:saltHex:hashHex") and validates
 * component lengths against the expected key size. Returns null if the
 * format is invalid or lengths don't match.
 */
function parseStoredHash(
  storedHash: string,
  keyBytes: number,
): ParsedHash | null {
  const [prefix, saltHex, hashHex, ...rest] = storedHash.split(":");
  if (
    rest.length > 0 ||
    prefix !== HASH_PREFIX ||
    saltHex === undefined ||
    saltHex === "" ||
    hashHex === undefined ||
    hashHex === ""
  ) {
    return null;
  }

  if (saltHex.length !== SALT_BYTES * 2 || hashHex.length !== keyBytes * 2) {
    return null;
  }

  // Buffer.from(badHex, "hex") silently drops invalid hex pairs, producing
  // a shorter buffer. The length check catches that case.
  const salt = Buffer.from(saltHex, "hex");
  const derived = Buffer.from(hashHex, "hex");

  if (salt.length !== SALT_BYTES || derived.length !== keyBytes) {
    return null;
  }

  return { salt, derived };
}

/**
 * Creates a scrypt hasher with the given derived key length.
 *
 * @param keyBytes - Number of bytes for the derived key (e.g. 64 for passwords, 32 for codes)
 */
export function createScryptHasher(keyBytes: number): ScryptHasher {
  return {
    async hash(input: string): Promise<string> {
      const salt = randomBytes(SALT_BYTES);
      const derived = await scryptAsync(input, salt, keyBytes);
      return `${HASH_PREFIX}:${salt.toString("hex")}:${derived.toString("hex")}`;
    },

    async verify(input: string, storedHash: string): Promise<boolean> {
      const parsed = parseStoredHash(storedHash, keyBytes);
      if (!parsed) return false;

      const derived = await scryptAsync(input, parsed.salt, keyBytes);
      return timingSafeEqual(derived, parsed.derived);
    },
  };
}
