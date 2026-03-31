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
import { AuthError, ConflictError, NotFoundError } from "../errors.js";
import { RoleId } from "@care-y/shared";

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
      throw new AuthError("Invalid credentials");
    }

    const valid = await hasher.verify(password, row.password_hash);
    if (!valid) {
      throw new AuthError("Invalid credentials");
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
    const encryptedDisplayName = encryptor.encrypt(input.displayName);
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
        throw new ConflictError(
          "An account with this identifier already exists",
        );
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
      throw new NotFoundError("User not found");
    }

    return toUserRecord(row, encryptor);
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
    setPiiRetentionDays,
  };
}
