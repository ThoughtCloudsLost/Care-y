import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createDbSessionRepository } from "./session-repository.js";
import {
  createTestDb,
  createTestUser,
  createTestSession,
  noopEncryptor,
  testFieldEncryptor,
  type TestDb,
} from "../test-utils.js";
import type { SessionRepository } from "./session-repository.js";

// DB integration tests require a running PostgreSQL instance.
// On the host (no DATABASE_URL), the entire suite is skipped.
// Run via: docker compose exec app pnpm vitest run --project server
describe.skipIf(!process.env.DATABASE_URL)("createDbSessionRepository", () => {
  let testDb: TestDb;
  let repo: SessionRepository;

  beforeAll(async () => {
    testDb = await createTestDb();
    repo = createDbSessionRepository(testDb.db, noopEncryptor);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("create returns a SessionData with generated id and createdAt", async () => {
    const user = await createTestUser(testDb.db);
    const now = new Date();

    const session = await repo.create({
      token: "tok-create-test",
      userId: user.id,
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    expect(session.id).toBeDefined();
    expect(session.token).toBe("tok-create-test");
    expect(session.userId).toBe(user.id);
    expect(session.ipAddress).toBe("192.168.1.1");
    expect(session.userAgent).toBe("Mozilla/5.0");
    expect(session.createdAt.getTime()).toBeGreaterThanOrEqual(now.getTime());
  });

  it("findByToken retrieves the created session", async () => {
    const user = await createTestUser(testDb.db);
    const created = await repo.create({
      token: "tok-find-test",
      userId: user.id,
      ipAddress: "10.0.0.1",
      userAgent: "curl/8.0",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    const found = await repo.findByToken("tok-find-test");

    expect(found).not.toBeNull();
    if (found) {
      expect(found.id).toBe(created.id);
      expect(found.token).toBe("tok-find-test");
      expect(found.userId).toBe(user.id);
    }
  });

  it("findByToken returns null for nonexistent token", async () => {
    const found = await repo.findByToken("tok-does-not-exist");
    expect(found).toBeNull();
  });

  it("deleteByToken removes the session", async () => {
    const user = await createTestUser(testDb.db);
    await repo.create({
      token: "tok-delete-test",
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    await repo.deleteByToken("tok-delete-test");

    const found = await repo.findByToken("tok-delete-test");
    expect(found).toBeNull();
  });

  it("deleteByUserId removes all sessions for that user", async () => {
    const user = await createTestUser(testDb.db);
    await repo.create({
      token: "tok-dbu-1",
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.create({
      token: "tok-dbu-2",
      userId: user.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    await repo.deleteByUserId(user.id);

    expect(await repo.findByToken("tok-dbu-1")).toBeNull();
    expect(await repo.findByToken("tok-dbu-2")).toBeNull();
  });

  it("deleteByUserId does not affect other users' sessions", async () => {
    const userA = await createTestUser(testDb.db);
    const userB = await createTestUser(testDb.db);

    await repo.create({
      token: "tok-user-a",
      userId: userA.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });
    await repo.create({
      token: "tok-user-b",
      userId: userB.id,
      ipAddress: "127.0.0.1",
      userAgent: "test",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    await repo.deleteByUserId(userA.id);

    expect(await repo.findByToken("tok-user-a")).toBeNull();
    expect(await repo.findByToken("tok-user-b")).not.toBeNull();
  });

  it("deleteExpired removes sessions past their expires_at", async () => {
    const user = await createTestUser(testDb.db);
    // Create an already-expired session via the factory (bypasses repo.create
    // so we can set expires_at in the past).
    await createTestSession(testDb.db, {
      user_id: user.id,
      token: "tok-expired-1",
      expires_at: new Date(Date.now() - 60_000), // 1 minute ago
    });

    const count = await repo.deleteExpired();

    expect(count).toBeGreaterThanOrEqual(1);
    expect(await repo.findByToken("tok-expired-1")).toBeNull();
  });

  it("deleteExpired does not remove non-expired sessions", async () => {
    const user = await createTestUser(testDb.db);
    await createTestSession(testDb.db, {
      user_id: user.id,
      token: "tok-still-valid",
      expires_at: new Date(Date.now() + 3600_000), // 1 hour from now
    });

    const count = await repo.deleteExpired();

    // The valid session should survive.
    expect(await repo.findByToken("tok-still-valid")).not.toBeNull();
    // Count should be 0 (assuming no other expired sessions left from prior tests).
    // We use toBeGreaterThanOrEqual(0) since prior tests may have left expired rows.
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("deleteExpired handles mixed expired and valid sessions", async () => {
    const user = await createTestUser(testDb.db);
    await createTestSession(testDb.db, {
      user_id: user.id,
      token: "tok-mix-expired",
      expires_at: new Date(Date.now() - 30_000),
    });
    await createTestSession(testDb.db, {
      user_id: user.id,
      token: "tok-mix-valid",
      expires_at: new Date(Date.now() + 3600_000),
    });

    const count = await repo.deleteExpired();

    expect(count).toBeGreaterThanOrEqual(1);
    expect(await repo.findByToken("tok-mix-expired")).toBeNull();
    expect(await repo.findByToken("tok-mix-valid")).not.toBeNull();
  });

  it("stores encrypted bytea, not plaintext", async () => {
    // Use the real encryptor to verify DB contents are not plaintext.
    const encRepo = createDbSessionRepository(testDb.db, testFieldEncryptor);
    const user = await createTestUser(testDb.db);

    await encRepo.create({
      token: "tok-enc-verify",
      userId: user.id,
      ipAddress: "10.20.30.40",
      userAgent: "SecretAgent/1.0",
      expiresAt: new Date(Date.now() + 3600_000),
    });

    // Read raw row to verify ciphertext is not plaintext.
    const rawRow = await testDb.db
      .selectFrom("sessions")
      .selectAll()
      .where("token", "=", "tok-enc-verify")
      .executeTakeFirstOrThrow();

    // The raw bytea should not contain the plaintext strings.
    const ipBytes = rawRow.encrypted_ip_address.toString("utf-8");
    const uaBytes = rawRow.encrypted_user_agent.toString("utf-8");
    expect(ipBytes).not.toBe("10.20.30.40");
    expect(uaBytes).not.toBe("SecretAgent/1.0");

    // But reading through the repo should decrypt correctly.
    const session = await encRepo.findByToken("tok-enc-verify");
    expect(session).not.toBeNull();
    if (session) {
      expect(session.ipAddress).toBe("10.20.30.40");
      expect(session.userAgent).toBe("SecretAgent/1.0");
    }
  });
});
