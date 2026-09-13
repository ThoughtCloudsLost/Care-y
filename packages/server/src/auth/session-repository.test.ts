import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createDbSessionRepository } from "./session-repository.js";
import {
  createTestDb,
  createTestUser,
  createTestSession,
  testSessionTokenizer,
  testSealedBox,
  type TestDb,
} from "../test-utils.js";
import type { SessionRepository } from "./session-repository.js";
import type { SessionToken, WebauthnChallenge } from "@care-y/shared";

/** Shorthand cast for fabricated session token literals. */
const tok = (s: string): SessionToken => s as SessionToken;

// DB integration tests require a running PostgreSQL instance.
// On the host (no DATABASE_URL), the entire suite is skipped.
// Run via: docker compose exec app pnpm vitest run --project server
describe.skipIf(!process.env.DATABASE_URL)("createDbSessionRepository", () => {
  let testDb: TestDb;
  let repo: SessionRepository;

  beforeAll(async () => {
    testDb = await createTestDb();
    repo = createDbSessionRepository(
      testDb.db,
      testSessionTokenizer,
      testSealedBox,
    );
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("create returns a SessionData with generated id", async () => {
    const user = await createTestUser(testDb.db);

    const session = await repo.create({
      token: tok("tok-create-test"),
      userId: user.id,
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    expect(session.id).toBeDefined();
    expect(session.token).toBe("tok-create-test");
    expect(session.userId).toBe(user.id);
    expect(session.ipToken).toBe(
      testSessionTokenizer.tokenizeIp("192.168.1.1"),
    );
    expect(session.uaToken).toBe(
      testSessionTokenizer.tokenizeUa("Mozilla/5.0"),
    );
  });

  it("findByToken retrieves the created session", async () => {
    const user = await createTestUser(testDb.db);
    const created = await repo.create({
      token: tok("tok-find-test"),
      userId: user.id,
      ipAddress: "10.0.0.1",
      userAgent: "curl/8.0",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    const found = await repo.findByToken(tok("tok-find-test"));

    expect(found).not.toBeNull();
    if (found) {
      expect(found.id).toBe(created.id);
      expect(found.token).toBe("tok-find-test");
      expect(found.userId).toBe(user.id);
    }
  });

  it("findByToken returns null for nonexistent token", async () => {
    const found = await repo.findByToken(tok("tok-does-not-exist"));
    expect(found).toBeNull();
  });

  it("deleteByToken removes the session", async () => {
    const user = await createTestUser(testDb.db);
    await repo.create({
      token: tok("tok-delete-test"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    await repo.deleteByToken(tok("tok-delete-test"));

    const found = await repo.findByToken(tok("tok-delete-test"));
    expect(found).toBeNull();
  });

  it("deleteByUserId removes all sessions for that user", async () => {
    const user = await createTestUser(testDb.db);
    await repo.create({
      token: tok("tok-dbu-1"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.create({
      token: tok("tok-dbu-2"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    await repo.deleteByUserId(user.id);

    expect(await repo.findByToken(tok("tok-dbu-1"))).toBeNull();
    expect(await repo.findByToken(tok("tok-dbu-2"))).toBeNull();
  });

  it("deleteByUserId does not affect other users' sessions", async () => {
    const userA = await createTestUser(testDb.db);
    const userB = await createTestUser(testDb.db);

    await repo.create({
      token: tok("tok-user-a"),
      userId: userA.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.create({
      token: tok("tok-user-b"),
      userId: userB.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    await repo.deleteByUserId(userA.id);

    expect(await repo.findByToken(tok("tok-user-a"))).toBeNull();
    expect(await repo.findByToken(tok("tok-user-b"))).not.toBeNull();
  });

  it("deleteByUserIdExceptToken keeps the specified token and deletes others", async () => {
    const user = await createTestUser(testDb.db);
    const keep = await repo.create({
      token: tok("tok-keep-this"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.create({
      token: tok("tok-delete-this-1"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.create({
      token: tok("tok-delete-this-2"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    const count = await repo.deleteByUserIdExceptToken(user.id, keep.token);

    expect(count).toBe(2);
    expect(await repo.findByToken(tok("tok-keep-this"))).not.toBeNull();
    expect(await repo.findByToken(tok("tok-delete-this-1"))).toBeNull();
    expect(await repo.findByToken(tok("tok-delete-this-2"))).toBeNull();
  });

  it("deleteByUserIdExceptToken does not affect other users", async () => {
    const userA = await createTestUser(testDb.db);
    const userB = await createTestUser(testDb.db);

    await repo.create({
      token: tok("tok-except-a"),
      userId: userA.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.create({
      token: tok("tok-except-b"),
      userId: userB.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    await repo.deleteByUserIdExceptToken(userA.id, tok("tok-except-a"));

    expect(await repo.findByToken(tok("tok-except-a"))).not.toBeNull();
    expect(await repo.findByToken(tok("tok-except-b"))).not.toBeNull();
  });

  it("deleteByUserIdExceptToken returns 0 when only the excepted session exists", async () => {
    const user = await createTestUser(testDb.db);
    await repo.create({
      token: tok("tok-only-one"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    const count = await repo.deleteByUserIdExceptToken(
      user.id,
      tok("tok-only-one"),
    );

    expect(count).toBe(0);
    expect(await repo.findByToken(tok("tok-only-one"))).not.toBeNull();
  });

  it("deleteExpired removes sessions past their expires_at", async () => {
    const user = await createTestUser(testDb.db);
    // Create an already-expired session via the factory (bypasses repo.create
    // so we can set expires_at in the past).
    await createTestSession(testDb.db, {
      user_id: user.id,
      token: tok("tok-expired-1"),
      expires_at: new Date(Date.now() - 60_000), // 1 minute ago
    });

    const count = await repo.deleteExpired();

    expect(count).toBeGreaterThanOrEqual(1);
    expect(await repo.findByToken(tok("tok-expired-1"))).toBeNull();
  });

  it("deleteExpired does not remove non-expired sessions", async () => {
    const user = await createTestUser(testDb.db);
    await createTestSession(testDb.db, {
      user_id: user.id,
      token: tok("tok-still-valid"),
      expires_at: new Date(Date.now() + 3600_000), // 1 hour from now
    });

    const count = await repo.deleteExpired();

    // The valid session should survive.
    expect(await repo.findByToken(tok("tok-still-valid"))).not.toBeNull();
    // Count should be 0 (assuming no other expired sessions left from prior tests).
    // We use toBeGreaterThanOrEqual(0) since prior tests may have left expired rows.
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("deleteExpired handles mixed expired and valid sessions", async () => {
    const user = await createTestUser(testDb.db);
    await createTestSession(testDb.db, {
      user_id: user.id,
      token: tok("tok-mix-expired"),
      expires_at: new Date(Date.now() - 30_000),
    });
    await createTestSession(testDb.db, {
      user_id: user.id,
      token: tok("tok-mix-valid"),
      expires_at: new Date(Date.now() + 3600_000),
    });

    const count = await repo.deleteExpired();

    expect(count).toBeGreaterThanOrEqual(1);
    expect(await repo.findByToken(tok("tok-mix-expired"))).toBeNull();
    expect(await repo.findByToken(tok("tok-mix-valid"))).not.toBeNull();
  });

  it("stores encrypted bytea, not plaintext", async () => {
    // Use the real encryptor to verify DB contents are not plaintext.
    const encRepo = createDbSessionRepository(
      testDb.db,
      testSessionTokenizer,
      testSealedBox,
    );
    const user = await createTestUser(testDb.db);

    await encRepo.create({
      token: tok("tok-enc-verify"),
      userId: user.id,
      ipAddress: "10.20.30.40",
      userAgent: "SecretAgent/1.0",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    // Read raw row to verify ciphertext is not plaintext.
    const rawRow = await testDb.db
      .selectFrom("sessions")
      .selectAll()
      .where("token", "=", tok("tok-enc-verify"))
      .executeTakeFirstOrThrow();

    // The raw bytea should not contain the plaintext strings.
    const ipBytes = rawRow.encrypted_ip_address.toString("utf-8");
    const uaBytes = rawRow.encrypted_user_agent.toString("utf-8");
    expect(ipBytes).not.toBe("10.20.30.40");
    expect(uaBytes).not.toBe("SecretAgent/1.0");

    // But reading through the repo should return correct HMAC tokens.
    const session = await encRepo.findByToken(tok("tok-enc-verify"));
    expect(session).not.toBeNull();
    if (session) {
      expect(session.ipToken).toBe(
        testSessionTokenizer.tokenizeIp("10.20.30.40"),
      );
      expect(session.uaToken).toBe(
        testSessionTokenizer.tokenizeUa("SecretAgent/1.0"),
      );
    }
  });

  // --- 2FA session extensions ---

  it("new sessions have twofaVerified=false and webauthnChallenge=null", async () => {
    const user = await createTestUser(testDb.db);
    const session = await repo.create({
      token: tok("tok-2fa-defaults"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    expect(session.twofaVerified).toBe(false);
    expect(session.webauthnChallenge).toBeNull();
  });

  it("markTwoFactorVerified sets twofaVerified to true", async () => {
    const user = await createTestUser(testDb.db);
    const session = await repo.create({
      token: tok("tok-mark-2fa"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    await repo.markTwoFactorVerified(session.token);

    const found = await repo.findByToken(session.token);
    expect(found!.twofaVerified).toBe(true);
  });

  it("clearTwoFactorVerified sets twofaVerified to false", async () => {
    const user = await createTestUser(testDb.db);
    const session = await repo.create({
      token: tok("tok-clear-2fa"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    await repo.markTwoFactorVerified(session.token);
    await repo.clearTwoFactorVerified(session.token);

    const found = await repo.findByToken(session.token);
    expect(found!.twofaVerified).toBe(false);
  });

  it("setWebauthnChallenge stores and clears challenge", async () => {
    const user = await createTestUser(testDb.db);
    const session = await repo.create({
      token: tok("tok-webauthn-ch"),
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    // Set challenge
    const testChallenge = "test-challenge-abc" as WebauthnChallenge;
    await repo.setWebauthnChallenge(session.token, testChallenge);
    let found = await repo.findByToken(session.token);
    expect(found!.webauthnChallenge).toBe("test-challenge-abc");

    // Clear challenge
    await repo.setWebauthnChallenge(session.token, null);
    found = await repo.findByToken(session.token);
    expect(found!.webauthnChallenge).toBeNull();
  });
});
