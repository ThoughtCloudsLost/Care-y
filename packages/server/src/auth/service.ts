/**
 * Authentication service (tenant-scoped).
 *
 * Handles registration, login, logout, and session validation for a single
 * org's user base. Constructed per-request once the org is resolved, because
 * it needs a tenant-scoped Kysely instance.
 *
 * Login uses constant-time comparison and a dummy hash to prevent timing
 * side-channels that would reveal whether an identifier exists.
 */

import { randomBytes } from "node:crypto";
import type { Kysely, Selectable } from "kysely";
import type { TenantDatabase, UsersTable } from "../db/types.js";
import { isPgUniqueViolation } from "../db/pg-errors.js";
import { toCount } from "../db/query-utils.js";
import type { PasswordHasher } from "./password.js";
import type { SessionRepository, SessionData } from "./session-repository.js";
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import type { SessionTokenizer } from "../crypto/session-tokenizer.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import {
  AuthError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors.js";
import { ErrorCode, RoleId } from "@care-y/shared";

export interface UserRecord {
  readonly id: string;
  readonly identifier: string; // still decrypted server-side (Tier 2, needed for login response)
  readonly encryptedDisplayName: string; // base64 ciphertext, client decrypts with org key
  readonly roleId: string;
  readonly isActive: boolean;
}

export interface AuthService {
  register(input: {
    identifier: string;
    password: string;
    displayName: string;
    notificationEmail?: string;
    roleId: string;
  }): Promise<UserRecord>;

  login(input: {
    identifier: string;
    password: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<{ user: UserRecord; session: SessionData }>;

  logout(sessionToken: string): Promise<void>;

  validateSession(
    token: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ user: UserRecord; session: SessionData } | null>;

  findUserById(userId: string): Promise<UserRecord | null>;

  /** Counts active users with the admin role. Used for last-admin demotion protection. */
  countActiveAdmins(): Promise<number>;

  /** Updates a user's role. Returns the updated user record. */
  updateUserRole(userId: string, newRoleId: string): Promise<UserRecord>;

  /** Activates or deactivates a user. Deactivation kills sessions and revokes org key. */
  setUserActive(userId: string, isActive: boolean): Promise<UserRecord>;

  /** Updates the org's PII retention setting in org_config. */
  setPiiRetentionDays(days: number | null): Promise<void>;
}

export const SESSION_COOKIE_NAME = "care_y_session" as const;
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function toUserRecord(
  row: Selectable<UsersTable>,
  encryptor: FieldEncryptor,
): UserRecord {
  return {
    id: row.id,
    identifier: encryptor.decrypt(row.encrypted_identifier),
    encryptedDisplayName: row.encrypted_display_name.toString("base64"),
    roleId: row.role_id,
    isActive: row.is_active,
  };
}

function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

function logCleanupFailure(err: unknown): void {
  console.warn(
    "Failed to purge expired sessions:",
    err instanceof Error ? err.message : String(err),
  );
}

export function createAuthService(
  db: Kysely<TenantDatabase>,
  hasher: PasswordHasher,
  sessions: SessionRepository,
  encryptor: FieldEncryptor,
  sealedBox: SealedBoxEncryptor,
  indexer: BlindIndexer,
  tokenizer: SessionTokenizer,
  orgId: string,
): AuthService {
  // Lazy-initialized dummy hash for timing side-channel prevention.
  // On the first failed-lookup login attempt, we hash a throwaway string
  // so that the timing of a "user not found" path matches "wrong password".
  let timingPadHashPromise: Promise<string> | null = null;

  // eslint-disable-next-line @typescript-eslint/promise-function-async -- returns a cached promise; async would create a new wrapper on each call
  function getTimingPadHash(): Promise<string> {
    timingPadHashPromise ??= hasher.hash("__timing_pad__");
    return timingPadHashPromise;
  }

  async function findActiveUserByHash(
    identifierHash: string,
  ): Promise<Selectable<UsersTable> | null> {
    const row = await db
      .selectFrom("users")
      .selectAll()
      .where("identifier_hash", "=", identifierHash)
      .where("is_active", "=", true)
      .executeTakeFirst();

    return row ?? null;
  }

  async function findUserRowById(
    userId: string,
  ): Promise<Selectable<UsersTable> | null> {
    const row = await db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst();

    return row ?? null;
  }

  async function findActiveUserById(
    userId: string,
  ): Promise<Selectable<UsersTable> | null> {
    const row = await findUserRowById(userId);
    if (row?.is_active !== true) return null;
    return row;
  }

  function isSessionExpired(session: SessionData): boolean {
    return session.expiresAt.getTime() < Date.now();
  }

  /**
   * Detects IP/UA drift via HMAC token comparison. If the IP token differs
   * from the stored token, clears the 2FA verification flag so the user
   * must re-verify identity. The session is NOT killed; the user keeps their work.
   */
  async function handleIpChange(
    session: SessionData,
    ipAddress: string,
    userAgent: string,
  ): Promise<SessionData> {
    const currentIpToken = tokenizer.tokenize(ipAddress);
    const currentUaToken = tokenizer.tokenize(userAgent);

    if (
      session.ipToken !== currentIpToken ||
      session.uaToken !== currentUaToken
    ) {
      console.warn(
        `Session ${session.id}: IP or user-agent changed since creation`,
      );
    }

    if (session.ipToken !== currentIpToken && session.twofaVerified) {
      await sessions.clearTwoFactorVerified(session.token);
      return { ...session, twofaVerified: false };
    }

    return session;
  }

  /** Verify password against stored hash, or dummy hash if user not found. */
  async function verifyCredentials(
    password: string,
    row: Selectable<UsersTable> | null,
  ): Promise<Selectable<UsersTable>> {
    if (!row) {
      await hasher.verify(password, await getTimingPadHash());
      throw new AuthError(ErrorCode.INVALID_CREDENTIALS);
    }

    const valid = await hasher.verify(password, row.password_hash);
    if (!valid) {
      throw new AuthError(ErrorCode.INVALID_CREDENTIALS);
    }

    return row;
  }

  async function createSessionForUser(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<SessionData> {
    const session = await sessions.create({
      token: generateSessionToken(),
      userId,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
    });

    // Fire-and-forget: purge expired sessions without blocking the login response.
    // Keeps the security benefit (expired tokens don't linger) without the latency cost.
    sessions.deleteExpired().catch(logCleanupFailure);

    return session;
  }

  async function insertUserRow(input: {
    identifier: string;
    password: string;
    displayName: string;
    notificationEmail?: string;
    roleId: string;
  }): Promise<Selectable<UsersTable>> {
    const identifierHash = indexer.hash(input.identifier, orgId);
    const encryptedIdentifier = encryptor.encrypt(input.identifier);
    // ADR-016: display_name is Tier 1 (sealed box with org public key)
    const encryptedDisplayName = sealedBox.seal(input.displayName);
    const encryptedNotificationAddr =
      input.notificationEmail !== undefined && input.notificationEmail !== ""
        ? encryptor.encrypt(input.notificationEmail)
        : null;
    const passwordHash = await hasher.hash(input.password);

    try {
      return await db
        .insertInto("users")
        .values({
          identifier_hash: identifierHash,
          encrypted_identifier: encryptedIdentifier,
          password_hash: passwordHash,
          encrypted_display_name: encryptedDisplayName,
          encrypted_notification_addr: encryptedNotificationAddr,
          role_id: input.roleId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    } catch (err: unknown) {
      if (isPgUniqueViolation(err)) {
        throw new ConflictError(ErrorCode.ACCOUNT_ALREADY_EXISTS);
      }
      throw err;
    }
  }

  async function countActiveAdmins(): Promise<number> {
    const result = await db
      .selectFrom("users")
      .select(db.fn.countAll<string>().as("count"))
      .where("role_id", "=", RoleId.ADMIN)
      .where("is_active", "=", true)
      .executeTakeFirstOrThrow();
    return toCount(result);
  }

  async function updateUserRole(
    userId: string,
    newRoleId: string,
  ): Promise<UserRecord> {
    const row = await db
      .updateTable("users")
      .set({ role_id: newRoleId })
      .where("id", "=", userId)
      .where("is_active", "=", true)
      .returningAll()
      .executeTakeFirst();

    if (!row) {
      throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
    }

    return toUserRecord(row, encryptor);
  }

  async function setUserActive(
    userId: string,
    isActive: boolean,
  ): Promise<UserRecord> {
    return db.transaction().execute(async (tx) => {
      if (!isActive) {
        const targetUser = await tx
          .selectFrom("users")
          .selectAll()
          .where("id", "=", userId)
          .executeTakeFirst();

        if (!targetUser) {
          throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
        }

        if (targetUser.role_id === RoleId.ADMIN) {
          const result = await tx
            .selectFrom("users")
            .select(tx.fn.countAll<string>().as("count"))
            .where("role_id", "=", RoleId.ADMIN)
            .where("is_active", "=", true)
            .forUpdate()
            .executeTakeFirstOrThrow();
          if (toCount(result) <= 1) {
            throw new ForbiddenError(ErrorCode.CANNOT_DEACTIVATE_LAST_ADMIN);
          }
        }
      }

      const updated = await tx
        .updateTable("users")
        .set({ is_active: isActive })
        .where("id", "=", userId)
        .returningAll()
        .executeTakeFirst();

      if (!updated) {
        throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
      }

      if (!isActive) {
        await tx.deleteFrom("sessions").where("user_id", "=", userId).execute();
        await tx
          .deleteFrom("wrapped_org_keys")
          .where("user_id", "=", userId)
          .execute();
      }

      return toUserRecord(updated, encryptor);
    });
  }

  async function setPiiRetentionDays(days: number | null): Promise<void> {
    await db
      .updateTable("org_config")
      .set({ pii_retention_days: days })
      .execute();
  }

  return {
    async register(input): Promise<UserRecord> {
      const row = await insertUserRow(input);
      return toUserRecord(row, encryptor);
    },

    async login(input): Promise<{ user: UserRecord; session: SessionData }> {
      const row = await findActiveUserByHash(
        indexer.hash(input.identifier, orgId),
      );
      const verifiedRow = await verifyCredentials(input.password, row);
      const session = await createSessionForUser(
        verifiedRow.id,
        input.ipAddress,
        input.userAgent,
      );
      return { user: toUserRecord(verifiedRow, encryptor), session };
    },

    async logout(sessionToken: string): Promise<void> {
      await sessions.deleteByToken(sessionToken);
    },

    async validateSession(
      token: string,
      ipAddress: string,
      userAgent: string,
    ): Promise<{ user: UserRecord; session: SessionData } | null> {
      const session = await sessions.findByToken(token);
      if (!session) return null;

      if (isSessionExpired(session)) {
        await sessions.deleteByToken(token);
        return null;
      }

      const userRow = await findActiveUserById(session.userId);
      if (!userRow) {
        await sessions.deleteByToken(token);
        return null;
      }

      const updatedSession = await handleIpChange(
        session,
        ipAddress,
        userAgent,
      );
      return {
        user: toUserRecord(userRow, encryptor),
        session: updatedSession,
      };
    },

    async findUserById(userId: string): Promise<UserRecord | null> {
      const row = await findUserRowById(userId);
      return row ? toUserRecord(row, encryptor) : null;
    },

    countActiveAdmins,
    updateUserRole,
    setUserActive,
    setPiiRetentionDays,
  };
}
