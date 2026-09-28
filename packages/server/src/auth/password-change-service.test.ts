import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomBytes, randomUUID } from "node:crypto";
import {
  createTestDb,
  createTestTicketFixture,
  noopEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  testSealedBox,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { createDbSessionRepository } from "./session-repository.js";
import type { SessionRepository } from "./session-repository.js";
import { AUTH_ARGON2ID_TEST_PARAMS, createPasswordHasher } from "./password.js";
import type { PasswordHasher } from "./password.js";
import { createAuthService, type AuthService } from "./service.js";
import {
  changePasswordWithRotation,
  type PasswordChangeDeps,
} from "./password-change-service.js";
import {
  createKeyRotationService,
  StaleKeyWrapsError,
} from "../crypto/key-rotation.js";
import { AuthError, NotFoundError, ValidationError } from "../errors.js";
import { RoleId } from "@care-y/shared";
import type {
  KeyGeneration,
  SessionToken,
  TicketId,
  UserId,
} from "@care-y/shared";

// DB integration tests. Skipped on host (no DATABASE_URL).
describe.skipIf(!process.env.DATABASE_URL)("changePasswordWithRotation", () => {
  let testDb: TestDb;
  let hasher: PasswordHasher;
  let sessions: SessionRepository;
  let auth: AuthService;
  let deps: PasswordChangeDeps;

  beforeAll(async () => {
    testDb = await createTestDb();
    hasher = createPasswordHasher(AUTH_ARGON2ID_TEST_PARAMS);
    sessions = createDbSessionRepository(
      testDb.db,
      testSessionTokenizer,
      testSealedBox,
    );
    auth = createAuthService(
      testDb.db,
      hasher,
      sessions,
      noopEncryptor,
      testSealedBox,
      testBlindIndexer,
      testSessionTokenizer,
      TEST_ORG_ID,
    );
    deps = {
      db: testDb.db,
      hasher,
      keyRotation: createKeyRotationService(testDb.db),
    };
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  const PASSWORD = "current-password-long-enough";
  const NEW_PASSWORD = "replacement-password-long-e";

  /** Registers a user with a user_keys row and signs them in twice. */
  async function setUp(mustChangePassword = false): Promise<{
    userId: UserId;
    identifier: string;
    current: SessionToken;
    other: SessionToken;
  }> {
    const identifier = `pcs-${randomUUID().slice(0, 8)}`;
    const user = await auth.register({
      identifier,
      password: PASSWORD,
      displayName: "Password Change",
      roleId: RoleId.VOLUNTEER,
      mustChangePassword,
    });
    await testDb.db
      .insertInto("user_keys")
      .values({
        user_id: user.id,
        salt: randomBytes(16),
        vol_public: randomBytes(32),
        rotation_lock: false,
      })
      .execute();
    const signIn = async (): Promise<SessionToken> =>
      (
        await auth.login({
          identifier,
          password: PASSWORD,
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
        })
      ).session.token;
    return {
      userId: user.id,
      identifier,
      current: await signIn(),
      other: await signIn(),
    };
  }

  function rotation(
    reWrappedKeys: { ticketId: TicketId; keyGeneration: KeyGeneration }[] = [],
  ): Parameters<typeof changePasswordWithRotation>[1]["rotation"] {
    return {
      saltNew: randomBytes(16),
      volPublicNew: randomBytes(32),
      reWrappedKeys: reWrappedKeys.map((k) => ({
        ...k,
        ephemeralPoint: randomBytes(32),
        nonce: randomBytes(24),
        wrappedKey: randomBytes(48),
      })),
    };
  }

  async function passwordHash(userId: UserId): Promise<string> {
    const row = await testDb.db
      .selectFrom("users")
      .select("password_hash")
      .where("id", "=", userId)
      .executeTakeFirstOrThrow();
    return row.password_hash;
  }

  async function keyState(
    userId: UserId,
  ): Promise<{ keyVersion: number; locked: boolean }> {
    const row = await testDb.db
      .selectFrom("user_keys")
      .select(["key_version", "rotation_lock"])
      .where("user_id", "=", userId)
      .executeTakeFirstOrThrow();
    return { keyVersion: row.key_version, locked: row.rotation_lock };
  }

  it("changes the password, rotates keys, ends other sessions and clears the forced change", async () => {
    const { userId, identifier, current, other } = await setUp(true);

    await changePasswordWithRotation(deps, {
      userId,
      sessionToken: current as never,
      currentPassword: PASSWORD,
      newPassword: NEW_PASSWORD,
      rotation: rotation(),
    });

    expect(await keyState(userId)).toEqual({ keyVersion: 2, locked: false });
    expect(await sessions.findByToken(current)).not.toBeNull();
    expect(await sessions.findByToken(other)).toBeNull();

    const found = await auth.findUserById(userId);
    expect(found?.mustChangePassword).toBe(false);

    const { user } = await auth.login({
      identifier,
      password: NEW_PASSWORD,
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    });
    expect(user.id).toBe(userId);
  });

  it("rejects a wrong current password without changing anything", async () => {
    const { userId, current } = await setUp();
    const before = await passwordHash(userId);

    await expect(
      changePasswordWithRotation(deps, {
        userId,
        sessionToken: current,
        currentPassword: "wrong-password-long-enough",
        newPassword: NEW_PASSWORD,
        rotation: rotation(),
      }),
    ).rejects.toBeInstanceOf(AuthError);

    expect(await passwordHash(userId)).toBe(before);
    expect(await keyState(userId)).toEqual({ keyVersion: 1, locked: false });
  });

  it("rejects a new password equal to the current one", async () => {
    const { userId, current } = await setUp();

    await expect(
      changePasswordWithRotation(deps, {
        userId,
        sessionToken: current,
        currentPassword: PASSWORD,
        newPassword: PASSWORD,
        rotation: rotation(),
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(await keyState(userId)).toEqual({ keyVersion: 1, locked: false });
  });

  it("rejects an inactive user", async () => {
    const { userId, current } = await setUp();
    await testDb.db
      .updateTable("users")
      .set({ is_active: false })
      .where("id", "=", userId)
      .execute();

    await expect(
      changePasswordWithRotation(deps, {
        userId,
        sessionToken: current,
        currentPassword: PASSWORD,
        newPassword: NEW_PASSWORD,
        rotation: rotation(),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rolls back the password and releases the lock when the rotation refuses", async () => {
    const { userId, current, other } = await setUp(true);
    const fixture = await createTestTicketFixture(testDb.db);
    // care-y-ignore-next-line no-plaintext-db-write -- test key wrap data, not real cryptographic material
    await testDb.db
      .insertInto("ticket_key_wraps")
      .values({
        ticket_id: fixture.ticketId,
        volunteer_id: userId,
        key_generation: randomUUID() as KeyGeneration,
        ephemeral_point: randomBytes(32),
        nonce: randomBytes(24),
        wrapped_key: randomBytes(48),
        algorithm: "ecies-ristretto255-v1",
      })
      .execute();
    const before = await passwordHash(userId);

    // The held wrap is missing from the re-wrap set.
    await expect(
      changePasswordWithRotation(deps, {
        userId,
        sessionToken: current,
        currentPassword: PASSWORD,
        newPassword: NEW_PASSWORD,
        rotation: rotation(),
      }),
    ).rejects.toBeInstanceOf(StaleKeyWrapsError);

    expect(await passwordHash(userId)).toBe(before);
    expect(await keyState(userId)).toEqual({ keyVersion: 1, locked: false });
    expect(await sessions.findByToken(other)).not.toBeNull();
    const found = await auth.findUserById(userId);
    expect(found?.mustChangePassword).toBe(true);
  });
});
