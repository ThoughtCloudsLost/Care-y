/**
 * Email verification code service for 2FA.
 *
 * Generates 6-digit numeric codes, hashes them with scrypt before storage,
 * and verifies with timing-safe comparison. Codes expire after 5 minutes
 * and allow 3 verification attempts. Rows are deleted on successful
 * verification or when max attempts are exhausted (ADR-017).
 *
 * Rate limiting: max 1 code per 60 seconds per user, max 5 per hour.
 * Enforced at the service layer.
 */

import { randomInt } from "node:crypto";
import type { Kysely, Selectable } from "kysely";
import { ErrorCode } from "@care-y/shared";
import {
  email_verification_subject,
  email_verification_body,
  email_verification_html,
} from "@care-y/shared/paraglide/messages.js";
import type { Locale } from "@care-y/shared/paraglide/runtime.js";
import type { TenantDatabase, EmailCodesTable } from "../db/types.js";
import type { EmailSender } from "../email/email-sender.js";
import { RateLimitError, ValidationError } from "../errors.js";
import { toCount } from "../db/query-utils.js";
import { createCodeHasher } from "./password.js";
import type { UserId, EmailCodeId } from "@care-y/shared";

const CODE_DIGITS = 6;
const CODE_MAX = 10 ** CODE_DIGITS; // 1,000,000
const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 60 * 1000; // 1 minute between codes
const HOURLY_LIMIT = 5;
const HOURLY_WINDOW_MS = 60 * 60 * 1000;

const codeHasher = createCodeHasher();

export interface EmailCodeService {
  /**
   * Generates a new code, hashes it, stores it, and sends it via email.
   * Deletes any existing active codes for the user first.
   * Enforces rate limiting (1/60s, 5/hour).
   *
   * @param locale - The user's locale for the email template (e.g., "en", "es").
   */
  sendCode(userId: UserId, email: string, locale?: Locale): Promise<void>;

  /**
   * Verifies a code. Increments attempt counter on failure.
   * Deletes the code row on success or when max attempts exhausted.
   * Returns true if the code is valid.
   */
  verifyCode(userId: UserId, code: string): Promise<boolean>;
}

function generateCode(): string {
  return randomInt(CODE_MAX).toString().padStart(CODE_DIGITS, "0");
}

export function createEmailCodeService(
  db: Kysely<TenantDatabase>,
  emailSender: EmailSender,
): EmailCodeService {
  /** Throws RateLimitError if the most recent code was sent less than 60s ago. */
  async function enforceCooldown(userId: UserId, now: Date): Promise<void> {
    const recentCode = await db
      .selectFrom("email_codes")
      .select("expires_at")
      .where("user_id", "=", userId)
      .where("consumed", "=", false)
      .where("expires_at", ">", now)
      .orderBy("expires_at", "desc")
      .executeTakeFirst();

    if (!recentCode) return;

    // Code was created at (expires_at - EXPIRY_MS). Check if within cooldown.
    const createdAt = recentCode.expires_at.getTime() - EXPIRY_MS;
    const elapsed = now.getTime() - createdAt;
    if (elapsed < COOLDOWN_MS) {
      const retryAfter = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      throw new RateLimitError(ErrorCode.RATE_LIMIT_COOLDOWN, retryAfter);
    }
  }

  /** Throws RateLimitError if the user has hit 5 codes in the last hour. */
  async function enforceHourlyLimit(userId: UserId, now: Date): Promise<void> {
    const hourAgo = new Date(now.getTime() - HOURLY_WINDOW_MS);
    // Since created_at = expires_at - EXPIRY_MS, a code created after hourAgo
    // has expires_at > hourAgo + EXPIRY_MS
    const hourlyThreshold = new Date(hourAgo.getTime() + EXPIRY_MS);
    const { count } = await db
      .selectFrom("email_codes")
      .select(db.fn.countAll().as("count"))
      .where("user_id", "=", userId)
      .where("expires_at", ">", hourlyThreshold)
      .executeTakeFirstOrThrow();

    if (toCount({ count }) >= HOURLY_LIMIT) {
      throw new RateLimitError(ErrorCode.RATE_LIMIT_HOURLY, 3600);
    }
  }

  /** Replaces any active codes with a fresh one. Returns the plaintext code. */
  async function replaceActiveCode(userId: UserId, now: Date): Promise<string> {
    await db
      .deleteFrom("email_codes")
      .where("user_id", "=", userId)
      .where("consumed", "=", false)
      .execute();

    const code = generateCode();
    const codeHash = await codeHasher.hashCode(code);
    const expiresAt = new Date(now.getTime() + EXPIRY_MS);

    await db
      .insertInto("email_codes")
      .values({
        user_id: userId,
        code_hash: codeHash,
        expires_at: expiresAt,
      })
      .execute();

    return code;
  }

  /** Deletes a code row by ID. Used on success and max-attempts exhaustion. */
  async function deleteCodeById(codeId: EmailCodeId): Promise<void> {
    await db.deleteFrom("email_codes").where("id", "=", codeId).execute();
  }

  /** Finds the active (unconsumed, unexpired) code for a user, or throws. */
  async function findActiveCodeOrThrow(
    userId: UserId,
  ): Promise<Selectable<EmailCodesTable>> {
    const row = await db
      .selectFrom("email_codes")
      .selectAll()
      .where("user_id", "=", userId)
      .where("consumed", "=", false)
      .where("expires_at", ">", new Date())
      .executeTakeFirst();

    if (!row) {
      throw new ValidationError(ErrorCode.NO_ACTIVE_CODE);
    }

    if (row.attempts >= MAX_ATTEMPTS) {
      await deleteCodeById(row.id);
      throw new ValidationError(ErrorCode.TOO_MANY_ATTEMPTS);
    }

    return row;
  }

  return {
    async sendCode(
      userId: UserId,
      email: string,
      locale: Locale = "en",
    ): Promise<void> {
      const now = new Date();

      await enforceCooldown(userId, now);
      await enforceHourlyLimit(userId, now);

      const code = await replaceActiveCode(userId, now);

      const loc = { locale };
      await emailSender.send({
        to: email,
        subject: email_verification_subject({}, loc),
        text: email_verification_body({ code }, loc),
        html: email_verification_html({ code }, loc),
      });
    },

    async verifyCode(userId: UserId, code: string): Promise<boolean> {
      const row = await findActiveCodeOrThrow(userId);
      const valid = await codeHasher.verify(code, row.code_hash);

      if (valid) {
        await deleteCodeById(row.id);
        return true;
      }

      // Increment attempt counter; delete if max reached
      const newAttempts = row.attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        await deleteCodeById(row.id);
        throw new ValidationError(ErrorCode.TOO_MANY_ATTEMPTS);
      }

      await db
        .updateTable("email_codes")
        .set({ attempts: newAttempts })
        .where("id", "=", row.id)
        .execute();

      return false;
    },
  };
}
