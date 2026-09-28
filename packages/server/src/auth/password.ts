/**
 * Password and one-time code hashing behind narrow interfaces.
 *
 * Passwords use Argon2id via libsodium (argon2id-hash.ts). One-time codes
 * (email, SMS, backup) use Node's crypto.scrypt (scrypt-hash.ts).
 *
 * This module is a designated mint site for PasswordHash and CodeHash brands
 * (ADR-074). The narrow wrappers below cast once from the generic hasher
 * output, keeping brand casts out of every call site.
 */

import {
  AUTH_ARGON2ID_PARAMS,
  createArgon2idHasher,
  type Argon2idParams,
} from "./argon2id-hash.js";
import { createScryptHasher as createBaseHasher } from "./scrypt-hash.js";
import type { PasswordHash, CodeHash } from "@care-y/shared";

export {
  AUTH_ARGON2ID_PARAMS,
  AUTH_ARGON2ID_TEST_PARAMS,
} from "./argon2id-hash.js";

const CODE_KEY_BYTES = 32;

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;

  /**
   * Hashes a password, returning a branded PasswordHash for
   * `users.password_hash`. Delegates to the generic hash method.
   */
  hashPassword(password: string): Promise<PasswordHash>;
}

export interface CodeHasher {
  hash(code: string): Promise<string>;
  verify(code: string, hash: string): Promise<boolean>;

  /**
   * Hashes a one-time verification code, returning a branded CodeHash for
   * `email_codes.code_hash`, `sms_codes.code_hash`, `backup_codes.code_hash`.
   * Delegates to the generic hash method.
   */
  hashCode(code: string): Promise<CodeHash>;
}

/**
 * Creates a PasswordHasher backed by Argon2id. Tests pass
 * AUTH_ARGON2ID_TEST_PARAMS; everything else uses the default.
 */
export function createPasswordHasher(
  params: Argon2idParams = AUTH_ARGON2ID_PARAMS,
): PasswordHasher {
  const base = createArgon2idHasher(params);
  return {
    hash: base.hash.bind(base),
    verify: base.verify.bind(base),

    async hashPassword(password: string): Promise<PasswordHash> {
      return (await base.hash(password)) as PasswordHash;
    },
  };
}

/** Creates a CodeHasher backed by Node crypto.scrypt with 32-byte keys. */
export function createCodeHasher(): CodeHasher {
  const base = createBaseHasher(CODE_KEY_BYTES);
  return {
    hash: base.hash.bind(base),
    verify: base.verify.bind(base),

    async hashCode(code: string): Promise<CodeHash> {
      return (await base.hash(code)) as CodeHash;
    },
  };
}
