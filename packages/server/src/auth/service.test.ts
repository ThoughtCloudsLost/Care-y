import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  createTestDb,
  noopEncryptor,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  testSealedBox,
  testUnseal,
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
import {
  AuthError,
  ConflictError,
  CryptoError,
  ForbiddenError,
  NotFoundError,
} from "../errors.js";
import { RoleId, type UserId, type SessionToken } from "@care-y/shared";
import { createTestSession } from "../test-utils.js";

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
        roleId: RoleId.VOLUNTEER,
      });

      expect(user.id).toBeDefined();
      expect(testUnseal(user.encryptedIdentifier)).toBe("alice");
      expect(user.encryptedDisplayName).toBeDefined();
      expect(user.encryptedDisplayName.length).toBeGreaterThan(0);
      expect(user.roleId).toBe(RoleId.VOLUNTEER);
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
        roleId: RoleId.VOLUNTEER,
      });

      // Read raw row to verify ciphertext.
      const rawRow = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where(
          "identifier_hash",
          "=",
          testBlindIndexer.hashIdentifier("enc-check-user", TEST_ORG_ID),
        )
        .executeTakeFirstOrThrow();

      expect(rawRow.encrypted_identifier.toString("utf-8")).not.toBe(
        "enc-check-user",
      );
      expect(rawRow.encrypted_display_name.toString("utf-8")).not.toBe(
        "Enc Check",
      );
    });

    it("seals the identifier so only the org key can read it back", async () => {
      const user = await service.register({
        identifier: "sealed-ident-user",
        password: "secretpassword123",
        displayName: "Sealed Ident",
        roleId: RoleId.VOLUNTEER,
      });

      const rawRow = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where(
          "identifier_hash",
          "=",
          testBlindIndexer.hashIdentifier("sealed-ident-user", TEST_ORG_ID),
        )
        .executeTakeFirstOrThrow();

      // Stored bytes are a sealed box: not plaintext, not decryptable
      // with the server's OPS field key, recoverable only with the org
      // secret key (the client-side path).
      expect(rawRow.encrypted_identifier.toString("utf-8")).not.toBe(
        "sealed-ident-user",
      );
      expect(() =>
        testFieldEncryptor.decrypt(rawRow.encrypted_identifier),
      ).toThrow(CryptoError);
      expect(testUnseal(rawRow.encrypted_identifier)).toBe("sealed-ident-user");

      // The domain object carries only ciphertext, never a plaintext
      // identifier property.
      expect(user).not.toHaveProperty("identifier");
      expect(testUnseal(user.encryptedIdentifier)).toBe("sealed-ident-user");
    });

    it("stores blind index hash for identifier", async () => {
      await service.register({
        identifier: "blind-index-user",
        password: "yetanothersecret1",
        displayName: "Blind Index",
        roleId: RoleId.VOLUNTEER,
      });

      const expectedHash = testBlindIndexer.hashIdentifier(
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
        roleId: RoleId.VOLUNTEER,
      });

      const row = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where(
          "identifier_hash",
          "=",
          testBlindIndexer.hashIdentifier("no-email-user", TEST_ORG_ID),
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
        roleId: RoleId.VOLUNTEER,
      });

      const row = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where(
          "identifier_hash",
          "=",
          testBlindIndexer.hashIdentifier("has-email-user", TEST_ORG_ID),
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
        roleId: RoleId.VOLUNTEER,
      });

      await expect(
        service.register({
          identifier: "dup-user",
          password: "secretpassword456",
          displayName: "Second",
          roleId: RoleId.VOLUNTEER,
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
          roleId: RoleId.VOLUNTEER,
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
          roleId: RoleId.VOLUNTEER,
        }),
        service.register({
          identifier: "race-user",
          password: "racepassword12345",
          displayName: "Racer Two",
          roleId: RoleId.VOLUNTEER,
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
        roleId: RoleId.VOLUNTEER,
      });
    });

    it("succeeds with correct credentials", async () => {
      const result = await service.login({
        identifier: LOGIN_ID,
        password: LOGIN_PWD,
        ipAddress: "10.0.0.1",
        userAgent: "TestAgent/1.0",
      });

      expect(testUnseal(result.user.encryptedIdentifier)).toBe(LOGIN_ID);
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
        roleId: RoleId.VOLUNTEER,
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
        roleId: RoleId.VOLUNTEER,
      });

      // Insert an expired session directly.
      await sessions.create({
        token: "expired-tok-cleanup" as SessionToken,
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

      // Yield so the fire-and-forget cleanup settles (DB round-trip under Docker load).
      await new Promise((resolve) => setTimeout(resolve, 200));

      // The expired session should be gone.
      const found = await sessions.findByToken(
        "expired-tok-cleanup" as SessionToken,
      );
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
        roleId: RoleId.VOLUNTEER,
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
        service.logout("nonexistent-token-xyz" as SessionToken),
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
        roleId: RoleId.VOLUNTEER,
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
        "no-such-token" as SessionToken,
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
        roleId: RoleId.VOLUNTEER,
      });

      // Create a session that is already expired.
      const expiredSession = await sessions.create({
        token: "expired-validate-tok" as SessionToken,
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
        roleId: RoleId.VOLUNTEER,
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
        roleId: RoleId.VOLUNTEER,
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
      expect(testUnseal(result?.user.encryptedIdentifier ?? "")).toBe(
        "ip-mismatch-user",
      );

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
        roleId: RoleId.VOLUNTEER,
      });

      const found = await service.findUserById(registered.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(registered.id);
      expect(testUnseal(found?.encryptedIdentifier ?? "")).toBe(
        "find-user-test",
      );
      expect(found?.encryptedDisplayName).toBeDefined();
    });

    it("returns null for nonexistent user", async () => {
      const found = await service.findUserById(
        "00000000-0000-0000-0000-000000000000" as UserId,
      );
      expect(found).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // setUserActive
  // -----------------------------------------------------------------------

  describe("setUserActive", () => {
    const ACTOR_ID = "00000000-0000-4000-8000-000000000001" as UserId;

    it("deactivates a user", async () => {
      const user = await service.register({
        identifier: "deact-target",
        password: "secretpassword123",
        displayName: "Deactivate Me",
        roleId: RoleId.VOLUNTEER,
      });

      const updated = await service.setUserActive(ACTOR_ID, user.id, false);
      expect(updated.isActive).toBe(false);
    });

    it("reactivates a user without restoring wrapped keys", async () => {
      const user = await service.register({
        identifier: "react-target",
        password: "secretpassword123",
        displayName: "Reactivate Me",
        roleId: RoleId.VOLUNTEER,
      });

      await service.setUserActive(ACTOR_ID, user.id, false);
      const reactivated = await service.setUserActive(ACTOR_ID, user.id, true);
      expect(reactivated.isActive).toBe(true);

      const wrappedKeys = await testDb.db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();
      expect(wrappedKeys).toHaveLength(0);
    });

    it("deletes sessions on deactivation", async () => {
      const user = await service.register({
        identifier: "deact-sessions",
        password: "secretpassword123",
        displayName: "Session Test",
        roleId: RoleId.VOLUNTEER,
      });

      await createTestSession(testDb.db, { user_id: user.id });
      await createTestSession(testDb.db, { user_id: user.id });

      await service.setUserActive(ACTOR_ID, user.id, false);

      const remaining = await testDb.db
        .selectFrom("sessions")
        .selectAll()
        .where("user_id", "=", user.id)
        .execute();
      expect(remaining).toHaveLength(0);
    });

    it("throws CANNOT_DEACTIVATE_SELF when actor deactivates themselves", async () => {
      const user = await service.register({
        identifier: "self-deact",
        password: "secretpassword123",
        displayName: "Self",
        roleId: RoleId.ADMIN,
      });

      await expect(
        service.setUserActive(user.id, user.id, false),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });

    it("allows self-reactivation (actorId === userId with isActive=true)", async () => {
      const user = await service.register({
        identifier: "self-react",
        password: "secretpassword123",
        displayName: "Self Reactivate",
        roleId: RoleId.VOLUNTEER,
      });

      await service.setUserActive(ACTOR_ID, user.id, false);
      const reactivated = await service.setUserActive(user.id, user.id, true);
      expect(reactivated.isActive).toBe(true);
    });

    it("throws CANNOT_DEACTIVATE_LAST_ADMIN when deactivating the sole admin", async () => {
      const freshDb = await createTestDb();
      const freshSessions = createDbSessionRepository(
        freshDb.db,
        testSessionTokenizer,
        testSealedBox,
      );
      const freshService = createAuthService(
        freshDb.db,
        hasher,
        freshSessions,
        noopEncryptor,
        testSealedBox,
        testBlindIndexer,
        testSessionTokenizer,
        TEST_ORG_ID,
      );

      const admin = await freshService.register({
        identifier: "sole-admin",
        password: "secretpassword123",
        displayName: "Only Admin",
        roleId: RoleId.ADMIN,
      });

      await expect(
        freshService.setUserActive(ACTOR_ID, admin.id, false),
      ).rejects.toBeInstanceOf(ForbiddenError);

      await freshDb.cleanup();
    });

    it("throws USER_NOT_FOUND for nonexistent user", async () => {
      await expect(
        service.setUserActive(
          ACTOR_ID,
          "00000000-0000-0000-0000-000000000000" as UserId,
          false,
        ),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  // --- IP-change 2FA clear (line 274-275) ---

  describe("validateSession IP change", () => {
    it("clears 2FA when IP changes on a 2FA-verified session", async () => {
      const user = await service.register({
        identifier: "ip-change-user",
        password: "supersecretpasswd1",
        displayName: "IP Change",
        roleId: RoleId.VOLUNTEER,
      });

      const { session } = await service.login({
        identifier: "ip-change-user",
        password: "supersecretpasswd1",
        ipAddress: "10.0.0.1",
        userAgent: "test-agent",
      });

      // Mark session as 2FA verified
      await testDb.db
        .updateTable("sessions")
        .set({ twofa_verified: true })
        .where("token", "=", session.token)
        .execute();

      // Validate from a different IP
      const result = await service.validateSession(
        session.token,
        "10.0.0.2",
        "test-agent",
      );

      expect(result).not.toBeNull();
      expect(result!.user.id).toBe(user.id);
      // 2FA should be cleared due to IP change
      expect(result!.session.twofaVerified).toBe(false);
    });

    it("keeps 2FA when only UA changes (IP unchanged)", async () => {
      await service.register({
        identifier: "ua-change-user",
        password: "supersecretpasswd1",
        displayName: "UA Change",
        roleId: RoleId.VOLUNTEER,
      });

      const { session } = await service.login({
        identifier: "ua-change-user",
        password: "supersecretpasswd1",
        ipAddress: "10.0.0.5",
        userAgent: "original-agent",
      });

      // Mark as 2FA verified
      await testDb.db
        .updateTable("sessions")
        .set({ twofa_verified: true })
        .where("token", "=", session.token)
        .execute();

      // Validate with same IP but different UA
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const result = await service.validateSession(
        session.token,
        "10.0.0.5",
        "different-agent",
      );
      warnSpy.mockRestore();

      expect(result).not.toBeNull();
      // IP did not change, so 2FA stays verified
      expect(result!.session.twofaVerified).toBe(true);
    });
  });

  // --- updateUsername unique constraint violation (line 569-575) ---

  describe("updateUsername", () => {
    it("throws ConflictError when new username already exists", async () => {
      await service.register({
        identifier: "existing-username",
        password: "supersecretpasswd1",
        displayName: "Existing",
        roleId: RoleId.VOLUNTEER,
      });

      const user2 = await service.register({
        identifier: "rename-me-user",
        password: "supersecretpasswd1",
        displayName: "Rename Me",
        roleId: RoleId.VOLUNTEER,
      });

      await expect(
        service.updateUsername(
          user2.id,
          "existing-username",
          "supersecretpasswd1",
        ),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("throws AuthError when current password is wrong", async () => {
      const user = await service.register({
        identifier: "bad-pass-rename",
        password: "supersecretpasswd1",
        displayName: "Bad Pass",
        roleId: RoleId.VOLUNTEER,
      });

      await expect(
        service.updateUsername(user.id, "new-name", "wrongpassword123"),
      ).rejects.toBeInstanceOf(AuthError);
    });

    it("succeeds with correct password and new unique identifier", async () => {
      const user = await service.register({
        identifier: "good-rename-user",
        password: "supersecretpasswd1",
        displayName: "Good Rename",
        roleId: RoleId.VOLUNTEER,
      });

      await service.updateUsername(
        user.id,
        "renamed-user",
        "supersecretpasswd1",
      );

      // Should be able to login with the new identifier
      const { user: loginUser } = await service.login({
        identifier: "renamed-user",
        password: "supersecretpasswd1",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
      });
      expect(loginUser.id).toBe(user.id);
    });

    it("works without password verification (admin path)", async () => {
      const user = await service.register({
        identifier: "admin-rename-target",
        password: "supersecretpasswd1",
        displayName: "Admin Rename",
        roleId: RoleId.VOLUNTEER,
      });

      // Omit currentPassword (admin-service path)
      await service.updateUsername(user.id, "admin-renamed-user");

      const { user: loginUser } = await service.login({
        identifier: "admin-renamed-user",
        password: "supersecretpasswd1",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
      });
      expect(loginUser.id).toBe(user.id);
    });

    it("throws NotFoundError for inactive user", async () => {
      const user = await service.register({
        identifier: "inactive-rename",
        password: "supersecretpasswd1",
        displayName: "Inactive",
        roleId: RoleId.VOLUNTEER,
      });

      // Deactivate user (need an actor)
      const actor = await service.register({
        identifier: "actor-for-deactivate",
        password: "supersecretpasswd1",
        displayName: "Actor",
        roleId: RoleId.ADMIN,
      });
      await service.setUserActive(actor.id, user.id, false);

      await expect(
        service.updateUsername(user.id, "new-name"),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  // --- updatePasswordHash (line 587) ---

  describe("updatePasswordHash", () => {
    it("changes password and kills other sessions", async () => {
      const user = await service.register({
        identifier: "pass-change-user",
        password: "supersecretpasswd1",
        displayName: "Pass Change",
        roleId: RoleId.VOLUNTEER,
      });

      const { session: s1 } = await service.login({
        identifier: "pass-change-user",
        password: "supersecretpasswd1",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
      });

      // Create a second session
      const { session: s2 } = await service.login({
        identifier: "pass-change-user",
        password: "supersecretpasswd1",
        ipAddress: "127.0.0.2",
        userAgent: "test-agent",
      });

      await service.updatePasswordHash(
        user.id,
        s1.token,
        "supersecretpasswd1",
        "newpassword12345678",
      );

      // s1 should still be valid
      const valid1 = await service.validateSession(
        s1.token,
        "127.0.0.1",
        "test-agent",
      );
      expect(valid1).not.toBeNull();

      // s2 should be killed
      const valid2 = await service.validateSession(
        s2.token,
        "127.0.0.2",
        "test-agent",
      );
      expect(valid2).toBeNull();

      // New password should work
      const { user: loggedIn } = await service.login({
        identifier: "pass-change-user",
        password: "newpassword12345678",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
      });
      expect(loggedIn.id).toBe(user.id);
    });

    it("rejects wrong current password", async () => {
      const user = await service.register({
        identifier: "bad-pass-change",
        password: "supersecretpasswd1",
        displayName: "Bad Pass Change",
        roleId: RoleId.VOLUNTEER,
      });

      const { session } = await service.login({
        identifier: "bad-pass-change",
        password: "supersecretpasswd1",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
      });

      await expect(
        service.updatePasswordHash(
          user.id,
          session.token,
          "wrongpassword12345",
          "newpassword12345678",
        ),
      ).rejects.toBeInstanceOf(AuthError);
    });

    it("rejects inactive user", async () => {
      const user = await service.register({
        identifier: "inactive-pass-change",
        password: "supersecretpasswd1",
        displayName: "Inactive Pass",
        roleId: RoleId.VOLUNTEER,
      });

      const { session } = await service.login({
        identifier: "inactive-pass-change",
        password: "supersecretpasswd1",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
      });

      // Deactivate user
      const actor = await service.register({
        identifier: "actor-pass-deact",
        password: "supersecretpasswd1",
        displayName: "Actor",
        roleId: RoleId.ADMIN,
      });
      await service.setUserActive(actor.id, user.id, false);

      await expect(
        service.updatePasswordHash(
          user.id,
          session.token,
          "supersecretpasswd1",
          "newpassword12345678",
        ),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  // --- updateDisplayName (line 544) ---

  describe("updateDisplayName", () => {
    it("throws NotFoundError for inactive user", async () => {
      const user = await service.register({
        identifier: "dn-inactive",
        password: "supersecretpasswd1",
        displayName: "DN Inactive",
        roleId: RoleId.VOLUNTEER,
      });

      // Deactivate
      const actor = await service.register({
        identifier: "actor-dn-deact",
        password: "supersecretpasswd1",
        displayName: "Actor",
        roleId: RoleId.ADMIN,
      });
      await service.setUserActive(actor.id, user.id, false);

      await expect(
        service.updateDisplayName(user.id, Buffer.from("new-name")),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  // --- validateSession with deactivated user (line 412) ---

  describe("validateSession deactivated user", () => {
    it("invalidates session when user is deactivated", async () => {
      const user = await service.register({
        identifier: "deact-validate",
        password: "supersecretpasswd1",
        displayName: "Deact Validate",
        roleId: RoleId.VOLUNTEER,
      });

      const { session } = await service.login({
        identifier: "deact-validate",
        password: "supersecretpasswd1",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
      });

      // Manually deactivate (bypasses session kill for test isolation)
      await testDb.db
        .updateTable("users")
        .set({ is_active: false })
        .where("id", "=", user.id)
        .execute();

      const result = await service.validateSession(
        session.token,
        "127.0.0.1",
        "test-agent",
      );
      expect(result).toBeNull();
    });
  });
});
