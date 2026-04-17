import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  createTestDb,
  noopEncryptor,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  testSealedBox,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { createDbSessionRepository } from "./session-repository.js";
import type { SessionRepository } from "./session-repository.js";
import { createScryptHasher } from "./password.js";
import type { PasswordHasher } from "./password.js";
import {
  createAuthService,
  SESSION_MAX_AGE_MS,
  type AuthService,
} from "./service.js";
import { AuthError, ConflictError } from "../errors.js";

// DB integration tests. Skipped on host (no DATABASE_URL).
// Run via: docker compose exec app pnpm vitest run --project server
describe.skipIf(!process.env.DATABASE_URL)("AuthService", () => {
  let testDb: TestDb;
  let hasher: PasswordHasher;
  let sessions: SessionRepository;
  let service: AuthService;

  beforeAll(async () => {
    testDb = await createTestDb();
    hasher = createScryptHasher();
    sessions = createDbSessionRepository(
      testDb.db,
      testSessionTokenizer,
      testSealedBox,
    );
    service = createAuthService(
      testDb.db,
      hasher,
      sessions,
      noopEncryptor,
      testSealedBox,
      testBlindIndexer,
      testSessionTokenizer,
      TEST_ORG_ID,
    );
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  // -----------------------------------------------------------------------
  // Registration
  // -----------------------------------------------------------------------

  describe("register", () => {
    it("creates a user and returns UserRecord without password_hash", async () => {
      const user = await service.register({
        identifier: "alice",
        password: "supersecretpasswd1",
        displayName: "Alice Smith",
        roleId: "volunteer",
      });

      expect(user.id).toBeDefined();
      expect(user.identifier).toBe("alice");
      expect(user.encryptedDisplayName).toBeDefined();
      expect(user.encryptedDisplayName.length).toBeGreaterThan(0);
      expect(user.roleId).toBe("volunteer");
      expect(user.isActive).toBe(true);
      // password_hash must not leak through the domain object.
      expect(user).not.toHaveProperty("passwordHash");
      expect(user).not.toHaveProperty("password_hash");
    });

    it("stores encrypted identifier (raw bytes != plaintext) with real encryptor", async () => {
      // Reconstruct the service with the real encryptor for this test.
      const encSessions = createDbSessionRepository(
        testDb.db,
        testSessionTokenizer,
        testSealedBox,
      );
      const encService = createAuthService(
        testDb.db,
        hasher,
        encSessions,
        testFieldEncryptor,
        testSealedBox,
        testBlindIndexer,
        testSessionTokenizer,
        TEST_ORG_ID,
      );

      await encService.register({
        identifier: "enc-check-user",
        password: "anothersecretpass1",
        displayName: "Enc Check",
        roleId: "volunteer",
      });

      // Read raw row to verify ciphertext.
      const rawRow = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where(
          "identifier_hash",
          "=",
          testBlindIndexer.hash("enc-check-user", TEST_ORG_ID),
        )
        .executeTakeFirstOrThrow();

      expect(rawRow.encrypted_identifier.toString("utf-8")).not.toBe(
        "enc-check-user",
      );
      expect(rawRow.encrypted_display_name.toString("utf-8")).not.toBe(
        "Enc Check",
      );
    });

    it("stores blind index hash for identifier", async () => {
      await service.register({
        identifier: "blind-index-user",
        password: "yetanothersecret1",
        displayName: "Blind Index",
        roleId: "volunteer",
      });

      const expectedHash = testBlindIndexer.hash(
        "blind-index-user",
        TEST_ORG_ID,
      );

      const row = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where("identifier_hash", "=", expectedHash)
        .executeTakeFirst();

      expect(row).not.toBeNull();
    });

    it("handles optional notificationEmail (null when omitted)", async () => {
      await service.register({
        identifier: "no-email-user",
        password: "secretpassword123",
        displayName: "No Email",
        roleId: "volunteer",
      });

      const row = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where(
          "identifier_hash",
          "=",
          testBlindIndexer.hash("no-email-user", TEST_ORG_ID),
        )
        .executeTakeFirstOrThrow();

      expect(row.encrypted_notification_addr).toBeNull();
    });

    it("handles optional notificationEmail (encrypted when provided)", async () => {
      await service.register({
        identifier: "has-email-user",
        password: "secretpassword123",
        displayName: "Has Email",
        notificationEmail: "test@example.com",
        roleId: "volunteer",
      });

      const row = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where(
          "identifier_hash",
          "=",
          testBlindIndexer.hash("has-email-user", TEST_ORG_ID),
        )
        .executeTakeFirstOrThrow();

      // With noopEncryptor, the buffer contains the plaintext.
      expect(row.encrypted_notification_addr).not.toBeNull();
      expect(row.encrypted_notification_addr?.toString("utf-8")).toBe(
        "test@example.com",
      );
    });

    it("rejects duplicate identifier with ConflictError", async () => {
      await service.register({
        identifier: "dup-user",
        password: "secretpassword123",
        displayName: "First",
        roleId: "volunteer",
      });

      await expect(
        service.register({
          identifier: "dup-user",
          password: "secretpassword456",
          displayName: "Second",
          roleId: "volunteer",
        }),
      ).rejects.toThrow(ConflictError);
    });

    // Implementation-coupled: mocks Kysely's insertInto chain to simulate
    // a non-constraint DB error (connection reset, disk full, etc.). This is
    // hard to trigger through the public API without infrastructure failure.
    // Accepted tradeoff: ensures the error propagation path works rather than
    // silently swallowing unexpected DB errors.
    it("re-throws non-unique-violation DB errors from insert", async () => {
      // Mocks insertInto().values().returningAll().executeTakeFirstOrThrow(). If this chain changes, update the mock.
      const insertSpy = vi.spyOn(testDb.db, "insertInto").mockReturnValue({
        values: () => ({
          returningAll: () => ({
            executeTakeFirstOrThrow: () =>
              Promise.reject(new Error("connection reset")),
          }),
        }),
      } as unknown as ReturnType<typeof testDb.db.insertInto>);

      await expect(
        service.register({
          identifier: "wont-insert",
          password: "irrelevantpassword1",
          displayName: "Wont Insert",
          roleId: "volunteer",
        }),
      ).rejects.toThrow("connection reset");

      insertSpy.mockRestore();
    });

    it("handles concurrent duplicate registrations (one succeeds, one throws ConflictError)", async () => {
      const results = await Promise.allSettled([
        service.register({
          identifier: "race-user",
          password: "racepassword12345",
          displayName: "Racer One",
          roleId: "volunteer",
        }),
        service.register({
          identifier: "race-user",
          password: "racepassword12345",
          displayName: "Racer Two",
          roleId: "volunteer",
        }),
      ]);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      const error = (rejected[0] as PromiseRejectedResult).reason;
      expect(error).toBeInstanceOf(ConflictError);
    });
  });

  // -----------------------------------------------------------------------
  // Login
  // -----------------------------------------------------------------------

  describe("login", () => {
    const LOGIN_ID = "login-user";
    const LOGIN_PWD = "correctpassword1";

    beforeAll(async () => {
      await service.register({
        identifier: LOGIN_ID,
        password: LOGIN_PWD,
        displayName: "Login User",
        roleId: "volunteer",
      });
    });

    it("succeeds with correct credentials", async () => {
      const result = await service.login({
        identifier: LOGIN_ID,
        password: LOGIN_PWD,
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
      });

      expect(result.user.identifier).toBe(LOGIN_ID);
      expect(result.session.userId).toBe(result.user.id);
      expect(result.session.token).toBeDefined();
    });

    it("fails with wrong password: AuthError", async () => {
      await expect(
        service.login({
          identifier: LOGIN_ID,
          password: "wrongpassword1234",
          ipAddress: "10.0.0.1",
          userAgent: "TestAgent/1.0",
        }),
      ).rejects.toThrow(AuthError);
    });

    it("fails with nonexistent identifier: same AuthError (no enumeration)", async () => {
      const err = service.login({
        identifier: "nonexistent-user-xyz",
        password: "anypassword12345",
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
      });

      await expect(err).rejects.toThrow(AuthError);
      await expect(err).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("fails with inactive user: same AuthError", async () => {
      // Register then deactivate.
      const user = await service.register({
        identifier: "inactive-login",
        password: "secretpassword123",
        displayName: "Inactive",
        roleId: "volunteer",
      });

      await testDb.db
        .updateTable("users")
        .set({ is_active: false })
        .where("id", "=", user.id)
        .execute();

      await expect(
        service.login({
          identifier: "inactive-login",
          password: "secretpassword123",
          ipAddress: "10.0.0.1",
          userAgent: "TestAgent/1.0",
        }),
      ).rejects.toThrow(AuthError);
    });

    it("cleans expired sessions after login (fire-and-forget)", async () => {
      // Create an expired session manually via the factory.
      const user = await service.register({
        identifier: "cleanup-test-user",
        password: "secretpassword123",
        displayName: "Cleanup",
        roleId: "volunteer",
      });

      // Insert an expired session directly.
      await sessions.create({
        token: "expired-tok-cleanup",
        userId: user.id,
        ipAddress: "127.0.0.1",
        userAgent: "old",
        expiresAt: new Date(Date.now() - 60_000),
      });

      // Login triggers fire-and-forget deleteExpired after session creation.
      await service.login({
        identifier: "cleanup-test-user",
        password: "secretpassword123",
        ipAddress: "10.0.0.2",
        userAgent: "TestAgent/1.0",
      });

      // Yield to the microtask queue so the fire-and-forget cleanup settles.
      await new Promise((resolve) => setTimeout(resolve, 50));

      // The expired session should be gone.
      const found = await sessions.findByToken("expired-tok-cleanup");
      expect(found).toBeNull();
    });

    // Wire contract: token is stored in the DB sessions table and sent as a cookie value; format change requires session migration
    it("generates 64-char hex token", async () => {
      const result = await service.login({
        identifier: LOGIN_ID,
        password: LOGIN_PWD,
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
      });

      expect(result.session.token).toHaveLength(64);
      expect(result.session.token).toMatch(/^[0-9a-f]{64}$/);
    });

    it("session expires approximately SESSION_MAX_AGE_MS from now", async () => {
      const before = Date.now();
      const result = await service.login({
        identifier: LOGIN_ID,
        password: LOGIN_PWD,
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
      });
      const after = Date.now();

      const expiresMs = result.session.expiresAt.getTime();
      expect(expiresMs).toBeGreaterThanOrEqual(before + SESSION_MAX_AGE_MS);
      // Allow 5s of clock drift for slow CI.
      expect(expiresMs).toBeLessThanOrEqual(after + SESSION_MAX_AGE_MS + 5000);
    });
  });

  // -----------------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------------

  describe("logout", () => {
    it("deletes the session", async () => {
      await service.register({
        identifier: "logout-user",
        password: "secretpassword123",
        displayName: "Logout",
        roleId: "volunteer",
      });

      const { session } = await service.login({
        identifier: "logout-user",
        password: "secretpassword123",
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
      });

      await service.logout(session.token);

      const found = await sessions.findByToken(session.token);
      expect(found).toBeNull();
    });

    it("is idempotent (no error for nonexistent token)", async () => {
      await expect(
        service.logout("nonexistent-token-xyz"),
      ).resolves.toBeUndefined();
    });
  });

  // -----------------------------------------------------------------------
  // Validate session
  // -----------------------------------------------------------------------

  describe("validateSession", () => {
    it("returns user + session for valid token", async () => {
      const user = await service.register({
        identifier: "validate-user",
        password: "secretpassword123",
        displayName: "Validate",
        roleId: "volunteer",
      });

      const { session } = await service.login({
        identifier: "validate-user",
        password: "secretpassword123",
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
      });

      const result = await service.validateSession(
        session.token,
        "10.0.0.1",
        "TestAgent/1.0",
      );

      expect(result).not.toBeNull();
      expect(result?.user.id).toBe(user.id);
      expect(result?.session.token).toBe(session.token);
    });

    it("returns null for nonexistent token", async () => {
      const result = await service.validateSession(
        "no-such-token",
        "10.0.0.1",
        "TestAgent/1.0",
      );
      expect(result).toBeNull();
    });

    it("returns null and deletes expired session", async () => {
      const user = await service.register({
        identifier: "expired-session-user",
        password: "secretpassword123",
        displayName: "Expired",
        roleId: "volunteer",
      });

      // Create a session that is already expired.
      const expiredSession = await sessions.create({
        token: "expired-validate-tok",
        userId: user.id,
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
        expiresAt: new Date(Date.now() - 60_000),
      });

      const result = await service.validateSession(
        expiredSession.token,
        "10.0.0.1",
        "TestAgent/1.0",
      );
      expect(result).toBeNull();

      // Session should be deleted.
      const found = await sessions.findByToken(expiredSession.token);
      expect(found).toBeNull();
    });

    it("returns null when user is inactive", async () => {
      const user = await service.register({
        identifier: "inactive-validate-user",
        password: "secretpassword123",
        displayName: "Inactive Validate",
        roleId: "volunteer",
      });

      const { session } = await service.login({
        identifier: "inactive-validate-user",
        password: "secretpassword123",
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
      });

      // Deactivate user after login.
      await testDb.db
        .updateTable("users")
        .set({ is_active: false })
        .where("id", "=", user.id)
        .execute();

      const result = await service.validateSession(
        session.token,
        "10.0.0.1",
        "TestAgent/1.0",
      );
      expect(result).toBeNull();
    });

    it("session stays valid when IP changes (no hard lockout on roaming)", async () => {
      // Suppress expected console.warn from IP mismatch detection.
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);

      await service.register({
        identifier: "ip-mismatch-user",
        password: "secretpassword123",
        displayName: "IP Mismatch",
        roleId: "volunteer",
      });

      const { session } = await service.login({
        identifier: "ip-mismatch-user",
        password: "secretpassword123",
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
      });

      // Validate from a different IP. The observable behavior is that
      // the session remains valid (no lockout on mobile network roaming).
      const result = await service.validateSession(
        session.token,
        "192.168.0.99",
        "TestAgent/1.0",
      );

      expect(result).not.toBeNull();
      expect(result?.user.identifier).toBe("ip-mismatch-user");

      warnSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // Find user
  // -----------------------------------------------------------------------

  describe("findUserById", () => {
    it("returns UserRecord for existing user", async () => {
      const registered = await service.register({
        identifier: "find-user-test",
        password: "secretpassword123",
        displayName: "Find Me",
        roleId: "volunteer",
      });

      const found = await service.findUserById(registered.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(registered.id);
      expect(found?.identifier).toBe("find-user-test");
      expect(found?.encryptedDisplayName).toBeDefined();
    });

    it("returns null for nonexistent user", async () => {
      const found = await service.findUserById(
        "00000000-0000-0000-0000-000000000000",
      );
      expect(found).toBeNull();
    });
  });
});
