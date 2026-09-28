/**
 * Volunteer password change with crypto key rotation.
 *
 * The client derives new keys from the new password and re-wraps every
 * ticket key and its org key copy before calling in. This service
 * verifies the current password, then commits the new password hash,
 * the removal of the account's other sessions, and the key rotation in
 * one transaction: either the account moves to the new password and the
 * keys derived from it, or nothing changes.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { PasswordHasher } from "./password.js";
import {
  applyRotationInTransaction,
  type KeyRotationInput,
  type KeyRotationService,
} from "../crypto/key-rotation.js";
import { AuthError, NotFoundError, ValidationError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import type { SessionToken, UserId } from "@care-y/shared";

export interface PasswordChangeDeps {
  readonly db: Kysely<TenantDatabase>;
  readonly hasher: PasswordHasher;
  readonly keyRotation: KeyRotationService;
}

export interface PasswordChangeInput {
  readonly userId: UserId;
  /** The caller's session, which survives; every other session ends. */
  readonly sessionToken: SessionToken;
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly rotation: Omit<KeyRotationInput, "userId">;
}

/**
 * Changes the password and rotates the caller's keys atomically.
 * Also clears must_change_password, so an account created with a
 * temporary password is released by its first change.
 */
export async function changePasswordWithRotation(
  deps: PasswordChangeDeps,
  input: PasswordChangeInput,
): Promise<void> {
  const { db, hasher, keyRotation } = deps;
  const { userId } = input;

  const row = await db
    .selectFrom("users")
    .select("password_hash")
    .where("id", "=", userId)
    .where("is_active", "=", true)
    .executeTakeFirst();
  if (!row) {
    throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
  }

  const valid = await hasher.verify(input.currentPassword, row.password_hash);
  if (!valid) {
    throw new AuthError(ErrorCode.INVALID_CREDENTIALS);
  }

  if (input.newPassword === input.currentPassword) {
    throw new ValidationError(ErrorCode.PASSWORD_UNCHANGED);
  }

  // Hash outside the transaction: the KDF is slow and holds no locks.
  const newHash = await hasher.hashPassword(input.newPassword);

  await keyRotation.acquireLock(userId);
  try {
    await db.transaction().execute(async (tx) => {
      const updated = await tx
        .updateTable("users")
        .set({ password_hash: newHash, must_change_password: false })
        .where("id", "=", userId)
        .where("is_active", "=", true)
        .executeTakeFirst();
      // Deactivated since the check above: roll back the whole change.
      if (updated.numUpdatedRows === 0n) {
        throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
      }

      await tx
        .deleteFrom("sessions")
        .where("user_id", "=", userId)
        .where("token", "!=", input.sessionToken)
        .execute();

      await applyRotationInTransaction(tx, { ...input.rotation, userId });
    });
  } catch (err: unknown) {
    // The rotation clears the lock inside the transaction only when it
    // commits. On failure release it here so ticket creation resumes
    // wrapping to this volunteer; a release failure must not mask the
    // original error.
    await keyRotation.releaseLock(userId).catch((releaseErr: unknown) => {
      console.error(
        "Failed to release rotation lock after password change failure:",
        releaseErr instanceof Error ? releaseErr.message : String(releaseErr),
      );
    });
    throw err;
  }
}
