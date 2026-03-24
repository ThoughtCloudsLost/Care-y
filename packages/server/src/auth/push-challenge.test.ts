import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, type TestDb, TEST_OPS_KEY } from "../test-utils.js";
import {
  createPushChallengeService,
  hashSessionToken,
  type PushChallengeService,
} from "./push-challenge.js";
import type { PushNotificationSender } from "../notifications/push.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { hkdfSync } from "node:crypto";
import {
  pushChallengeIdSchema,
  pushApprovalSchema,
  AVAILABLE_METHODS,
  STUBBED_METHODS,
  METHOD_INFO,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Test HMAC key (derived the same way as production, from test OPS key)
// ---------------------------------------------------------------------------

const TEST_HMAC_KEY = Buffer.from(
  hkdfSync(
    "sha256",
    TEST_OPS_KEY,
    Buffer.alloc(0),
    "care-y-push-challenge-v1",
    32,
  ),
);

// ---------------------------------------------------------------------------
// Mock PushNotificationSender
// ---------------------------------------------------------------------------

function createMockPushSender(
  options: { allExpired?: boolean } = {},
): PushNotificationSender {
  return {
    async sendToUsers(tDb, userIds, _ttl) {
      if (options.allExpired) {
        for (const uid of userIds) {
          await (tDb as Kysely<TenantDatabase>)
            .deleteFrom("push_subscriptions")
            .where("user_id", "=", uid)
            .execute();
        }
      }
    },
    async removeSubscription(tDb, endpoint) {
      await (tDb as Kysely<TenantDatabase>)
        .deleteFrom("push_subscriptions")
        .where("endpoint", "=", endpoint)
        .execute();
    },
  };
}

// ---------------------------------------------------------------------------
// Unit tests (no DB required)
// ---------------------------------------------------------------------------

describe("hashSessionToken", () => {
  it("produces deterministic output for the same input", () => {
    const key = Buffer.alloc(32, 0xab);
    const hash1 = hashSessionToken("session-abc", key);
    const hash2 = hashSessionToken("session-abc", key);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex
  });

  it("produces different output for different tokens", () => {
    const key = Buffer.alloc(32, 0xab);
    const hash1 = hashSessionToken("session-abc", key);
    const hash2 = hashSessionToken("session-xyz", key);
    expect(hash1).not.toBe(hash2);
  });

  it("produces different output for different keys", () => {
    const key1 = Buffer.alloc(32, 0xab);
    const key2 = Buffer.alloc(32, 0xcd);
    const hash1 = hashSessionToken("session-abc", key1);
    const hash2 = hashSessionToken("session-abc", key2);
    expect(hash1).not.toBe(hash2);
  });
});

describe("push Zod schemas", () => {
  it("pushChallengeIdSchema accepts a valid UUID", () => {
    const result = pushChallengeIdSchema.safeParse({
      challengeId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("pushChallengeIdSchema rejects a non-UUID", () => {
    const result = pushChallengeIdSchema.safeParse({
      challengeId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("pushApprovalSchema accepts a valid UUID", () => {
    const result = pushApprovalSchema.safeParse({
      challengeId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("pushApprovalSchema rejects a non-UUID", () => {
    const result = pushApprovalSchema.safeParse({
      challengeId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("two-factor method availability", () => {
  it("AVAILABLE_METHODS includes push", () => {
    expect(AVAILABLE_METHODS).toContain("push");
  });

  it("STUBBED_METHODS is empty", () => {
    expect(STUBBED_METHODS).toHaveLength(0);
  });

  it("METHOD_INFO marks push as available", () => {
    const pushInfo = METHOD_INFO.find((m) => m.type === "push");
    expect(pushInfo).toBeDefined();
    expect(pushInfo?.available).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)("PushChallengeService", () => {
  let testDb: TestDb;
  let service: PushChallengeService;
  let testUserId: string;
  const SESSION_TOKEN_A = "session-token-a";
  const SESSION_TOKEN_B = "session-token-b";

  beforeAll(async () => {
    testDb = await createTestDb();
    const mockSender = createMockPushSender();
    service = createPushChallengeService(testDb.db, mockSender, TEST_HMAC_KEY);

    // Seed org_config (required by test infrastructure)
    await testDb.db
      .insertInto("org_config")
      .values({ pii_retention_days: null })
      .execute();

    // Create a test user
    const user = await testDb.db
      .insertInto("users")
      .values({
        identifier_hash: "test-hash-push-001",
        encrypted_identifier: Buffer.from("encrypted-id"),
        password_hash: "scrypt:" + "aa".repeat(16) + ":" + "bb".repeat(64),
        encrypted_display_name: Buffer.from("encrypted-name"),
        role_id: "volunteer",
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    testUserId = user.id;

    // Create a push subscription for the test user
    await testDb.db
      .insertInto("push_subscriptions")
      .values({
        user_id: testUserId,
        endpoint: "https://push.example.com/test-endpoint",
        key_p256dh: "test-p256dh-key",
        key_auth: "test-auth-key",
      })
      .execute();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  // --- sendChallenge ---

  it("creates a pending challenge and returns sent: true", async () => {
    const result = await service.sendChallenge(testUserId, SESSION_TOKEN_A);
    expect(result.sent).toBe(true);
    expect(result.challengeId).toBeTruthy();

    // Verify DB row
    const row = await testDb.db
      .selectFrom("push_challenges")
      .selectAll()
      .where("id", "=", result.challengeId)
      .executeTakeFirstOrThrow();
    expect(row.status).toBe("pending");
    expect(row.user_id).toBe(testUserId);
    expect(row.expires_at.getTime()).toBeGreaterThan(Date.now());
  });

  it("returns sent: false when user has no subscriptions", async () => {
    // Create a second user with no subscriptions
    const user2 = await testDb.db
      .insertInto("users")
      .values({
        identifier_hash: "test-hash-push-002",
        encrypted_identifier: Buffer.from("encrypted-id-2"),
        password_hash: "scrypt:" + "aa".repeat(16) + ":" + "bb".repeat(64),
        encrypted_display_name: Buffer.from("encrypted-name-2"),
        role_id: "volunteer",
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const result = await service.sendChallenge(user2.id, SESSION_TOKEN_A);
    expect(result.sent).toBe(false);
    expect(result.challengeId).toBe("");

    // Verify no challenge row was created
    const rows = await testDb.db
      .selectFrom("push_challenges")
      .selectAll()
      .where("user_id", "=", user2.id)
      .execute();
    expect(rows).toHaveLength(0);
  });

  it("invalidates previous pending challenges for same user+session", async () => {
    const first = await service.sendChallenge(testUserId, SESSION_TOKEN_A);
    const second = await service.sendChallenge(testUserId, SESSION_TOKEN_A);

    expect(first.challengeId).not.toBe(second.challengeId);

    // First challenge should now be expired
    const firstRow = await testDb.db
      .selectFrom("push_challenges")
      .select("status")
      .where("id", "=", first.challengeId)
      .executeTakeFirstOrThrow();
    expect(firstRow.status).toBe("expired");

    // Second should still be pending
    const secondRow = await testDb.db
      .selectFrom("push_challenges")
      .select("status")
      .where("id", "=", second.challengeId)
      .executeTakeFirstOrThrow();
    expect(secondRow.status).toBe("pending");
  });

  // --- pollChallenge ---

  it("returns pending for a fresh challenge", async () => {
    const { challengeId } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );
    const result = await service.pollChallenge(challengeId, SESSION_TOKEN_A);
    expect(result.status).toBe("pending");
  });

  it("returns expired for a challenge from a different session", async () => {
    const { challengeId } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );
    // Poll with a different session token
    const result = await service.pollChallenge(challengeId, SESSION_TOKEN_B);
    expect(result.status).toBe("expired");
  });

  it("returns expired for a nonexistent challenge ID", async () => {
    const result = await service.pollChallenge(
      "00000000-0000-0000-0000-000000000000",
      SESSION_TOKEN_A,
    );
    expect(result.status).toBe("expired");
  });

  it("returns expired for a challenge past its TTL", async () => {
    const { challengeId } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );

    // Manually set expires_at to the past
    await testDb.db
      .updateTable("push_challenges")
      .set({ expires_at: new Date(Date.now() - 1000) })
      .where("id", "=", challengeId)
      .execute();

    const result = await service.pollChallenge(challengeId, SESSION_TOKEN_A);
    expect(result.status).toBe("expired");

    // DB row should also be marked expired (lazy expiry)
    const row = await testDb.db
      .selectFrom("push_challenges")
      .select("status")
      .where("id", "=", challengeId)
      .executeTakeFirstOrThrow();
    expect(row.status).toBe("expired");
  });

  // --- approveChallenge ---

  it("atomically approves a pending challenge", async () => {
    const { challengeId } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );
    const approved = await service.approveChallenge(challengeId, testUserId);
    expect(approved).toBe(true);

    const result = await service.pollChallenge(challengeId, SESSION_TOKEN_A);
    expect(result.status).toBe("approved");
  });

  it("returns false when approving an already-approved challenge", async () => {
    const { challengeId } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );
    await service.approveChallenge(challengeId, testUserId);
    const secondApproval = await service.approveChallenge(
      challengeId,
      testUserId,
    );
    expect(secondApproval).toBe(false);
  });

  it("returns false when approving with wrong userId", async () => {
    const { challengeId } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );
    const result = await service.approveChallenge(
      challengeId,
      "00000000-0000-0000-0000-999999999999",
    );
    expect(result).toBe(false);
  });

  it("returns false when approving an expired challenge", async () => {
    const { challengeId } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );
    await testDb.db
      .updateTable("push_challenges")
      .set({ expires_at: new Date(Date.now() - 1000) })
      .where("id", "=", challengeId)
      .execute();

    const result = await service.approveChallenge(challengeId, testUserId);
    expect(result).toBe(false);
  });

  // --- denyChallenge ---

  it("denies a pending challenge", async () => {
    const { challengeId } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );
    const denied = await service.denyChallenge(challengeId, testUserId);
    expect(denied).toBe(true);

    const result = await service.pollChallenge(challengeId, SESSION_TOKEN_A);
    expect(result.status).toBe("denied");
  });

  it("returns false when denying a non-pending challenge", async () => {
    const { challengeId } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );
    await service.approveChallenge(challengeId, testUserId);
    const denied = await service.denyChallenge(challengeId, testUserId);
    expect(denied).toBe(false);
  });

  // --- deleteUserChallenges ---

  it("removes all challenges for a user", async () => {
    await service.sendChallenge(testUserId, SESSION_TOKEN_A);
    await service.sendChallenge(testUserId, SESSION_TOKEN_B);

    await service.deleteUserChallenges(testUserId);

    const rows = await testDb.db
      .selectFrom("push_challenges")
      .selectAll()
      .where("user_id", "=", testUserId)
      .execute();
    expect(rows).toHaveLength(0);
  });

  // --- cleanupExpired ---

  it("deletes expired and pending-past-TTL rows", async () => {
    // Create some challenges and expire them
    const { challengeId: c1 } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );
    const { challengeId: c2 } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_B,
    );

    // Mark both as expired in the past
    await testDb.db
      .updateTable("push_challenges")
      .set({
        expires_at: new Date(Date.now() - 60_000),
        status: "expired",
      })
      .where("id", "in", [c1, c2])
      .execute();

    const deleted = await service.cleanupExpired();
    expect(deleted).toBeGreaterThanOrEqual(2);
  });

  // --- sendTestPush ---

  it("returns true when user has working subscriptions", async () => {
    // Ensure the test user still has a subscription
    const subs = await testDb.db
      .selectFrom("push_subscriptions")
      .select("id")
      .where("user_id", "=", testUserId)
      .execute();

    if (subs.length === 0) {
      await testDb.db
        .insertInto("push_subscriptions")
        .values({
          user_id: testUserId,
          endpoint: "https://push.example.com/test-endpoint-2",
          key_p256dh: "test-p256dh-key",
          key_auth: "test-auth-key",
        })
        .execute();
    }

    const result = await service.sendTestPush(testUserId);
    expect(result).toBe(true);
  });

  it("returns false when user has no subscriptions", async () => {
    // Create a user with no subscriptions
    const user3 = await testDb.db
      .insertInto("users")
      .values({
        identifier_hash: "test-hash-push-003",
        encrypted_identifier: Buffer.from("encrypted-id-3"),
        password_hash: "scrypt:" + "aa".repeat(16) + ":" + "bb".repeat(64),
        encrypted_display_name: Buffer.from("encrypted-name-3"),
        role_id: "volunteer",
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const result = await service.sendTestPush(user3.id);
    expect(result).toBe(false);
  });

  it("returns false when all subscriptions are expired (410)", async () => {
    // Create a user with a subscription, using the allExpired mock sender
    const user4 = await testDb.db
      .insertInto("users")
      .values({
        identifier_hash: "test-hash-push-004",
        encrypted_identifier: Buffer.from("encrypted-id-4"),
        password_hash: "scrypt:" + "aa".repeat(16) + ":" + "bb".repeat(64),
        encrypted_display_name: Buffer.from("encrypted-name-4"),
        role_id: "volunteer",
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    await testDb.db
      .insertInto("push_subscriptions")
      .values({
        user_id: user4.id,
        endpoint: "https://push.example.com/expired-endpoint",
        key_p256dh: "test-p256dh-key",
        key_auth: "test-auth-key",
      })
      .execute();

    // Use a sender that simulates all endpoints being expired
    const expiredSender = createMockPushSender({ allExpired: true });
    const expiredService = createPushChallengeService(
      testDb.db,
      expiredSender,
      TEST_HMAC_KEY,
    );

    const result = await expiredService.sendTestPush(user4.id);
    expect(result).toBe(false);
  });

  // --- Happy path: full flow ---

  it("completes the full approve flow: send -> poll (pending) -> approve -> poll (approved)", async () => {
    const { challengeId, sent } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );
    expect(sent).toBe(true);

    const pending = await service.pollChallenge(challengeId, SESSION_TOKEN_A);
    expect(pending.status).toBe("pending");

    const approved = await service.approveChallenge(challengeId, testUserId);
    expect(approved).toBe(true);

    const final = await service.pollChallenge(challengeId, SESSION_TOKEN_A);
    expect(final.status).toBe("approved");
  });

  it("completes the full deny flow: send -> deny -> poll (denied)", async () => {
    const { challengeId } = await service.sendChallenge(
      testUserId,
      SESSION_TOKEN_A,
    );

    const denied = await service.denyChallenge(challengeId, testUserId);
    expect(denied).toBe(true);

    const result = await service.pollChallenge(challengeId, SESSION_TOKEN_A);
    expect(result.status).toBe("denied");
  });
});
