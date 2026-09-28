/**
 * Argon2id password hashing via libsodium's crypto_pwhash_str.
 *
 * Output is the self-describing PHC-style string libsodium produces
 * ("$argon2id$v=19$m=...,t=...,p=1$salt$hash"), so the cost parameters and
 * salt travel with each stored hash and verification needs no extra state.
 * The async variants run the derivation on the libuv thread pool instead of
 * blocking the event loop.
 *
 * Password bytes are copied into a Buffer and zeroed after use. The JS string
 * the caller holds cannot be zeroed; this only limits extra copies.
 */

import sodium from "sodium-native";
import { CryptoError } from "../errors.js";

export interface Argon2idParams {
  /** Number of passes over memory (libsodium opslimit). */
  readonly opsLimit: number;
  /** Memory cost in bytes (libsodium memlimit). */
  readonly memLimitBytes: number;
}

/**
 * Production cost. Matches the client key-path floor (ARGON2_MIN_PARAMS in
 * packages/crypto/src/types.ts: 64 MiB, 4 passes) and exceeds the OWASP
 * Password Storage Cheat Sheet minimum: "Use Argon2id with a minimum
 * configuration of 19 MiB of memory, an iteration count of 2, and 1 degree
 * of parallelism."
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
export const AUTH_ARGON2ID_PARAMS: Argon2idParams = {
  opsLimit: 4,
  memLimitBytes: 64 * 1024 * 1024,
};

/** libsodium's minimum cost. For tests only, never for stored credentials. */
export const AUTH_ARGON2ID_TEST_PARAMS: Argon2idParams = {
  opsLimit: sodium.crypto_pwhash_OPSLIMIT_MIN,
  memLimitBytes: sodium.crypto_pwhash_MEMLIMIT_MIN,
};

const ARGON2ID_PREFIX = "$argon2id$";

export interface Argon2idHasher {
  hash(password: string): Promise<string>;
  verify(password: string, storedHash: string): Promise<boolean>;
}

/** Strips the NUL padding libsodium leaves after the encoded hash string. */
function decodeHashString(out: Buffer): string {
  const end = out.indexOf(0);
  return out.toString("utf8", 0, end === -1 ? out.length : end);
}

/** Creates an Argon2id hasher bound to the given cost parameters. */
export function createArgon2idHasher(params: Argon2idParams): Argon2idHasher {
  return {
    async hash(password: string): Promise<string> {
      // sodium-native's async binding rejects an empty input. Password
      // schemas enforce a minimum length upstream, so reaching here is a bug.
      if (password.length === 0) {
        throw new CryptoError("Cannot hash an empty password");
      }

      const out = Buffer.alloc(sodium.crypto_pwhash_STRBYTES);
      const passwd = Buffer.from(password, "utf8");
      try {
        await sodium.crypto_pwhash_str_async(
          out,
          passwd,
          params.opsLimit,
          params.memLimitBytes,
        );
      } finally {
        sodium.sodium_memzero(passwd);
      }
      return decodeHashString(out);
    },

    async verify(password: string, storedHash: string): Promise<boolean> {
      if (password.length === 0) return false;
      if (!storedHash.startsWith(ARGON2ID_PREFIX)) return false;

      // The stored string plus its NUL terminator must fit in STRBYTES.
      const encoded = Buffer.from(storedHash, "utf8");
      if (encoded.length > sodium.crypto_pwhash_STRBYTES - 1) return false;

      const strBuf = Buffer.alloc(sodium.crypto_pwhash_STRBYTES);
      encoded.copy(strBuf);

      const passwd = Buffer.from(password, "utf8");
      try {
        return await sodium.crypto_pwhash_str_verify_async(strBuf, passwd);
      } finally {
        sodium.sodium_memzero(passwd);
      }
    },
  };
}
