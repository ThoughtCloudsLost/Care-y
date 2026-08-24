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
import type {
  UserId,
  OrgId,
  SessionToken,
  IdentifierHash,
  RoleIdValue,
} from "@care-y/shared";

export interface UserRecord {
  readonly id: UserId;
  readonly encryptedIdentifier: string; // base64 sealed ciphertext, client decrypts with org key (ADR-052)
  readonly encryptedDisplayName: string; // base64 ciphertext, client decrypts with org key
  readonly encryptedPreferredLocale: string | null; // base64 ciphertext, client decrypts with org key
  readonly roleId: RoleIdValue;
  readonly isActive: boolean;
  readonly hasSeenBriefing: boolean;
}

export interface AuthService {
  register(input: {
    identifier: string;
    password: string;
    displayName: string;
    notificationEmail?: string;
    preferredLocale?: string;
    roleId: RoleIdValue;
  }): Promise<UserRecord>;

  login(input: {
    identifier: string;
    password: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<{ user: UserRecord; session: SessionData }>;

  logout(sessionToken: SessionToken): Promise<void>;

  validateSession(
    token: SessionToken,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ user: UserRecord; session: SessionData } | null>;

  findUserById(userId: UserId): Promise<UserRecord | null>;

  /** Counts active users with the admin role. Used for last-admin demotion protection. */
  countActiveAdmins(): Promise<number>;

  /** Updates a user's role. Returns the updated user record. */
  updateUserRole(userId: UserId, newRoleId: RoleIdValue): Promise<UserRecord>;

  /** Activates or deactivates a user. Deactivation kills sessions and revokes org key. */
  setUserActive(
    actorId: UserId,
    userId: UserId,
    isActive: boolean,
  ): Promise<UserRecord>;

  /** Updates an encrypted display name (ciphertext only, client encrypts). */
  updateDisplayName(
    userId: UserId,
    encryptedDisplayName: Buffer,
  ): Promise<void>;

  /**
   * Updates a user's login identifier (username).
   * If currentPassword is provided, verifies it first (self-service path).
   * If omitted, caller is assumed to be admin (admin-service path).
   */
  updateUsername(
    userId: UserId,
    newIdentifier: string,
    currentPassword?: string,
  ): Promise<void>;

  /**
   * Updates a user's password hash and kills all other sessions.
   * Crypto key rotation (rotateKeys) is a separate step handled by the client.
   */
  updatePasswordHash(
    userId: UserId,
    sessionToken: SessionToken,
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;

  /** Updates the org's PII retention setting in org_config. */
  setPiiRetentionDays(days: number | null): Promise<void>;

  markBriefingSeen(userId: UserId): Promise<void>;

  /** Mark org onboarding setup as complete. */
  markSetupCompleted(): Promise<void>;

  /** Checks whether a user_keys row exists for the given user. */
  hasUserKeys(userId: UserId): Promise<boolean>;

  getHubStatus(): Promise<{
    activeUserCount: number;
    queueCount: number;
    keyStatus: "ok" | "missing";
    retentionDays: number | null;
    blocklistCount: number;
    greetingCount: number;
    templateCount: number;
  }>;
}

export const SESSION_COOKIE_NAME = "care_y_session" as const;
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function toUserRecord(row: Selectable<UsersTable>): UserRecord {
  return {
    id: row.id,
    encryptedIdentifier: row.encrypted_identifier.toString("base64url"),
    encryptedDisplayName: row.encrypted_display_name.toString("base64url"),
    encryptedPreferredLocale:
      row.encrypted_preferred_locale?.toString("base64url") ?? null,
    roleId: row.role_id,
    isActive: row.is_active,
    hasSeenBriefing: row.has_seen_briefing,
  };
}

function generateSessionToken(): SessionToken {
  return randomBytes(32).toString("hex") as SessionToken;
}

function logCleanupFailure(err: unknown): void {
  console.warn(
    "Failed to purge expired sessions:",
    err instanceof Error ? err.message : String(err),
  );
}

async function validateDeactivation(
  tx: Kysely<TenantDatabase>,
  actorId: UserId,
  userId: UserId,
): Promise<void> {
  if (userId === actorId) {
    throw new ForbiddenError(ErrorCode.CANNOT_DEACTIVATE_SELF);
  }

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
      .executeTakeFirstOrThrow();
    if (toCount(result) <= 1) {
      throw new ForbiddenError(ErrorCode.CANNOT_DEACTIVATE_LAST_ADMIN);
    }
  }
}

export function createAuthService(
  db: Kysely<TenantDatabase>,
  hasher: PasswordHasher,
  sessions: SessionRepository,
  encryptor: FieldEncryptor,
  sealedBox: SealedBoxEncryptor,
  indexer: BlindIndexer,
  tokenizer: SessionTokenizer,
  orgId: OrgId,
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
    identifierHash: IdentifierHash,
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
    userId: UserId,
  ): Promise<Selectable<UsersTable> | null> {
    const row = await db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst();

    return row ?? null;
  }

  async function findActiveUserById(
    userId: UserId,
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
    userId: UserId,
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
    preferredLocale?: string;
    roleId: RoleIdValue;
  }): Promise<Selectable<UsersTable>> {
    const identifierHash = indexer.hashIdentifier(input.identifier, orgId);
    // ADR-052: identifier is org-key tier (sealed box, server-blind).
    // Login never reads it back; lookup goes through identifier_hash.
    const encryptedIdentifier = sealedBox.seal(input.identifier);
    // display_name is org-key tier (sealed box with org public key)
    const encryptedDisplayName = sealedBox.seal(input.displayName);
    const encryptedNotificationAddr =
      input.notificationEmail !== undefined && input.notificationEmail !== ""
        ? encryptor.encrypt(input.notificationEmail)
        : null;
    const encryptedPreferredLocale =
      input.preferredLocale !== undefined
        ? sealedBox.seal(input.preferredLocale)
        : null;
    const passwordHash = await hasher.hashPassword(input.password);

    try {
      return await db
        .insertInto("users")
        .values({
          identifier_hash: identifierHash,
          encrypted_identifier: encryptedIdentifier,
          password_hash: passwordHash,
          encrypted_display_name: encryptedDisplayName,
          encrypted_notification_addr: encryptedNotificationAddr,
          encrypted_preferred_locale: encryptedPreferredLocale,
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
    userId: UserId,
    newRoleId: RoleIdValue,
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

    return toUserRecord(row);
  }

  async function setUserActive(
    actorId: UserId,
    userId: UserId,
    isActive: boolean,
  ): Promise<UserRecord> {
    return db.transaction().execute(async (tx) => {
      if (!isActive) {
        await validateDeactivation(tx, actorId, userId);
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

      return toUserRecord(updated);
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
      return toUserRecord(row);
    },

    async login(input): Promise<{ user: UserRecord; session: SessionData }> {
      const row = await findActiveUserByHash(
        indexer.hashIdentifier(input.identifier, orgId),
      );
      const verifiedRow = await verifyCredentials(input.password, row);
      const session = await createSessionForUser(
        verifiedRow.id,
        input.ipAddress,
        input.userAgent,
      );
      return { user: toUserRecord(verifiedRow), session };
    },

    async logout(sessionToken: SessionToken): Promise<void> {
      await sessions.deleteByToken(sessionToken);
    },

    async validateSession(
      token: SessionToken,
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
        user: toUserRecord(userRow),
        session: updatedSession,
      };
    },

    async findUserById(userId: UserId): Promise<UserRecord | null> {
      const row = await findUserRowById(userId);
      return row ? toUserRecord(row) : null;
    },

    countActiveAdmins,
    updateUserRole,
    setUserActive,
    setPiiRetentionDays,

    async markSetupCompleted(): Promise<void> {
      await db
        .updateTable("org_config")
        .set({ setup_completed: true })
        .execute();
    },

    async hasUserKeys(userId: UserId): Promise<boolean> {
      const row = await db
        .selectFrom("user_keys")
        .select("user_id")
        .where("user_id", "=", userId)
        .executeTakeFirst();
      return row !== undefined;
    },

    async markBriefingSeen(userId: UserId): Promise<void> {
      await db
        .updateTable("users")
        .set({ has_seen_briefing: true })
        .where("id", "=", userId)
        .execute();
    },

    async updateDisplayName(
      userId: UserId,
      encryptedDisplayName: Buffer,
    ): Promise<void> {
      const result = await db
        .updateTable("users")
        .set({ encrypted_display_name: encryptedDisplayName })
        .where("id", "=", userId)
        .where("is_active", "=", true)
        .executeTakeFirst();

      if (result.numUpdatedRows === 0n) {
        throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
      }
    },

    async updateUsername(
      userId: UserId,
      newIdentifier: string,
      currentPassword?: string,
    ): Promise<void> {
      const row = await findActiveUserById(userId);
      if (!row) {
        throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
      }

      if (currentPassword !== undefined) {
        const valid = await hasher.verify(currentPassword, row.password_hash);
        if (!valid) {
          throw new AuthError(ErrorCode.INVALID_CREDENTIALS);
        }
      }

      const newIdentifierHash = indexer.hashIdentifier(newIdentifier, orgId);
      const newEncryptedIdentifier = sealedBox.seal(newIdentifier);

      try {
        const result = await db
          .updateTable("users")
          .set({
            identifier_hash: newIdentifierHash,
            encrypted_identifier: newEncryptedIdentifier,
          })
          .where("id", "=", userId)
          .where("is_active", "=", true)
          .executeTakeFirst();

        if (result.numUpdatedRows === 0n) {
          throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
        }
      } catch (err: unknown) {
        if (isPgUniqueViolation(err)) {
          throw new ConflictError(ErrorCode.USERNAME_ALREADY_TAKEN);
        }
        throw err;
      }
    },

    async updatePasswordHash(
      userId: UserId,
      sessionToken: SessionToken,
      currentPassword: string,
      newPassword: string,
    ): Promise<void> {
      const row = await findActiveUserById(userId);
      if (!row) {
        throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
      }

      const valid = await hasher.verify(currentPassword, row.password_hash);
      if (!valid) {
        throw new AuthError(ErrorCode.INVALID_CREDENTIALS);
      }

      const newHash = await hasher.hashPassword(newPassword);

      await db.transaction().execute(async (tx) => {
        await tx
          .updateTable("users")
          .set({ password_hash: newHash })
          .where("id", "=", userId)
          .where("is_active", "=", true)
          .execute();

        await tx
          .deleteFrom("sessions")
          .where("user_id", "=", userId)
          .where("token", "!=", sessionToken)
          .execute();
      });
    },

    async getHubStatus(): Promise<{
      activeUserCount: number;
      queueCount: number;
      keyStatus: "ok" | "missing";
      retentionDays: number | null;
      blocklistCount: number;
      greetingCount: number;
      templateCount: number;
    }> {
      const [
        userCount,
        queueCount,
        keyStatus,
        retentionConfig,
        blocklistCount,
        greetingCount,
        templateCount,
      ] = await Promise.all([
        db
          .selectFrom("users")
          .select(db.fn.countAll<string>().as("c"))
          .where("is_active", "=", true)
          .executeTakeFirstOrThrow(),
        db
          .selectFrom("queues")
          .select(db.fn.countAll<string>().as("c"))
          .executeTakeFirstOrThrow(),
        db.selectFrom("org_config").select("org_public_key").executeTakeFirst(),
        db
          .selectFrom("org_config")
          .select("pii_retention_days")
          .executeTakeFirst(),
        db
          .selectFrom("phone_blocklist")
          .select(db.fn.countAll<string>().as("c"))
          .executeTakeFirstOrThrow(),
        db
          .selectFrom("phone_greetings")
          .select(db.fn.countAll<string>().as("c"))
          .executeTakeFirstOrThrow(),
        db
          .selectFrom("sms_responses")
          .select(db.fn.countAll<string>().as("c"))
          .executeTakeFirstOrThrow(),
      ]);
      return {
        activeUserCount: Number(userCount.c),
        queueCount: Number(queueCount.c),
        keyStatus: keyStatus?.org_public_key ? "ok" : "missing",
        retentionDays: retentionConfig?.pii_retention_days ?? null,
        blocklistCount: Number(blocklistCount.c),
        greetingCount: Number(greetingCount.c),
        templateCount: Number(templateCount.c),
      };
    },
  };
}
