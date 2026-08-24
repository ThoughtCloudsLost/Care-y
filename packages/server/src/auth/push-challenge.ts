/**
 * Push notification 2FA challenge service.
 *
 * Manages the lifecycle of push-based 2FA challenges: create, poll,
 * approve/deny, test push, and cleanup. Challenges are time-limited
 * (2 minutes) and bound to the creating session via HMAC-SHA256.
 *
 * Uses 5d's PushNotificationSender for delivery (empty-body pushes).
 * The service worker on the receiving device fetches pending challenges
 * via tRPC and shows an approve/deny notification.
 */

import { createHmac } from "node:crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { PushNotificationSender } from "../notifications/push.js";
import { InternalError } from "../errors.js";
import type {
  UserId,
  SessionToken,
  SessionTokenHash,
  PushChallengeId,
} from "@care-y/shared";

export type ChallengeStatus = "pending" | "approved" | "denied" | "expired";

const CHALLENGE_STATUSES = new Set<string>([
  "pending",
  "approved",
  "denied",
  "expired",
]);

function isChallengeStatus(value: string): value is ChallengeStatus {
  return CHALLENGE_STATUSES.has(value);
}

export interface SendChallengeResult {
  readonly challengeId: PushChallengeId | "";
  readonly sent: boolean;
}

export interface PollChallengeResult {
  readonly status: ChallengeStatus;
}

export interface PushChallengeService {
  /**
   * Creates a challenge and sends a push to all of the user's subscribed devices.
   * Returns the challenge ID for polling and whether the push was actually sent.
   * If the user has no push subscriptions, returns {sent: false}.
   */
  sendChallenge(
    userId: UserId,
    sessionToken: SessionToken,
  ): Promise<SendChallengeResult>;

  /**
   * Polls the status of a challenge. Verifies session binding.
   * Returns 'expired' if the challenge TTL has passed or session doesn't match.
   */
  pollChallenge(
    challengeId: PushChallengeId,
    sessionToken: SessionToken,
  ): Promise<PollChallengeResult>;

  /**
   * Approves a pending challenge. Called from the device that received the push.
   * Verifies the approving user matches the challenge's user.
   * Returns true if approval succeeded (challenge was still pending).
   */
  approveChallenge(
    challengeId: PushChallengeId,
    userId: UserId,
  ): Promise<boolean>;

  /**
   * Denies a pending challenge.
   * Returns true if denial succeeded (challenge was still pending).
   */
  denyChallenge(challengeId: PushChallengeId, userId: UserId): Promise<boolean>;

  /**
   * Sends a test push to verify enrollment. Returns true if at least one
   * subscription received the push (no 404/410 response).
   */
  sendTestPush(userId: UserId): Promise<boolean>;

  /**
   * Deletes all push challenges for a user (used during method removal).
   */
  deleteUserChallenges(userId: UserId): Promise<void>;

  /**
   * Cleans up expired challenges. Called lazily or on a schedule.
   */
  cleanupExpired(): Promise<number>;
}

const CHALLENGE_TTL_MS = 2 * 60 * 1000; // 2 minutes

/**
 * HMAC-SHA256 of the session token, used to bind challenges to sessions.
 * Uses the factory-injected HMAC key (derived via HKDF from OPS_SECRETS_KEY
 * at startup) so the mapping is unverifiable without server access.
 */
export function hashSessionToken(
  sessionToken: SessionToken,
  hmacKey: Buffer,
): SessionTokenHash {
  return createHmac("sha256", hmacKey)
    .update(sessionToken)
    .digest("hex") as SessionTokenHash;
}

export function createPushChallengeService(
  db: Kysely<TenantDatabase>,
  pushSender: PushNotificationSender,
  hmacKey: Buffer,
): PushChallengeService {
  return {
    async sendChallenge(userId, sessionToken) {
      // 1. Check if user has any push subscriptions
      const subscriptions = await db
        .selectFrom("push_subscriptions")
        .select("id")
        .where("user_id", "=", userId)
        .limit(1)
        .execute();

      if (subscriptions.length === 0) {
        return { challengeId: "", sent: false };
      }

      // 2. Invalidate any existing pending challenges for this user+session
      //    (prevents challenge accumulation from repeated send attempts)
      const tokenHash = hashSessionToken(sessionToken, hmacKey);
      await db
        .updateTable("push_challenges")
        .set({ status: "expired" })
        .where("user_id", "=", userId)
        .where("session_token_hash", "=", tokenHash)
        .where("status", "=", "pending")
        .execute();

      // 3. Create new challenge
      const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
      const result = await db
        .insertInto("push_challenges")
        .values({
          user_id: userId,
          session_token_hash: tokenHash,
          status: "pending",
          expires_at: expiresAt,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      // 4. Send push to all devices (fire-and-forget, failures are non-critical)
      void pushSender.sendToUsers(db, [userId], 120).catch(() => {
        // Push delivery failures are handled by PushNotificationSender
        // (expired subscriptions auto-removed). The challenge ID was
        // already returned; the user can still approve via the app
        // if they happen to have it open.
      });

      return { challengeId: result.id, sent: true };
    },

    async pollChallenge(challengeId, sessionToken) {
      const tokenHash = hashSessionToken(sessionToken, hmacKey);

      const challenge = await db
        .selectFrom("push_challenges")
        .select(["status", "expires_at", "session_token_hash"])
        .where("id", "=", challengeId)
        .executeTakeFirst();

      if (challenge?.session_token_hash !== tokenHash) {
        // Challenge doesn't exist or belongs to a different session.
        // Return expired to avoid leaking whether the ID exists.
        return { status: "expired" as const };
      }

      // Check TTL
      if (challenge.status === "pending" && challenge.expires_at < new Date()) {
        // Mark as expired in DB (lazy expiry)
        await db
          .updateTable("push_challenges")
          .set({ status: "expired" })
          .where("id", "=", challengeId)
          .where("status", "=", "pending")
          .execute();
        return { status: "expired" as const };
      }

      if (!isChallengeStatus(challenge.status)) {
        throw new InternalError(
          `Unexpected challenge status: ${challenge.status}`,
        );
      }
      return { status: challenge.status };
    },

    async approveChallenge(challengeId, userId) {
      // Atomic: only succeeds if challenge is still pending AND belongs to this user
      const result = await db
        .updateTable("push_challenges")
        .set({ status: "approved" })
        .where("id", "=", challengeId)
        .where("user_id", "=", userId)
        .where("status", "=", "pending")
        .where("expires_at", ">", new Date())
        .executeTakeFirst();

      return result.numUpdatedRows > 0n;
    },

    async denyChallenge(challengeId, userId) {
      const result = await db
        .updateTable("push_challenges")
        .set({ status: "denied" })
        .where("id", "=", challengeId)
        .where("user_id", "=", userId)
        .where("status", "=", "pending")
        .where("expires_at", ">", new Date())
        .executeTakeFirst();

      return result.numUpdatedRows > 0n;
    },

    async sendTestPush(userId) {
      const subscriptions = await db
        .selectFrom("push_subscriptions")
        .select("id")
        .where("user_id", "=", userId)
        .execute();

      if (subscriptions.length === 0) return false;

      // Send push and let PushNotificationSender clean up expired endpoints.
      await pushSender.sendToUsers(db, [userId], 30);

      // Re-check: if all subscriptions were removed (all 410), return false
      const remaining = await db
        .selectFrom("push_subscriptions")
        .select("id")
        .where("user_id", "=", userId)
        .limit(1)
        .execute();

      return remaining.length > 0;
    },

    async deleteUserChallenges(userId) {
      await db
        .deleteFrom("push_challenges")
        .where("user_id", "=", userId)
        .execute();
    },

    async cleanupExpired() {
      const result = await db
        .deleteFrom("push_challenges")
        .where("expires_at", "<", new Date())
        .where("status", "in", ["pending", "expired"])
        .executeTakeFirst();

      return Number(result.numDeletedRows);
    },
  };
}
