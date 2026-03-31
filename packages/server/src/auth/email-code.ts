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
import type { TenantDatabase, EmailCodesTable } from "../db/types.js";
import type { EmailSender } from "../email/email-sender.js";
import { RateLimitError, ValidationError } from "../errors.js";
import { toCount } from "../db/query-utils.js";
import { createScryptHasher } from "./scrypt-hash.js";

const CODE_DIGITS = 6;
const CODE_MAX = 10 ** CODE_DIGITS; // 1,000,000
const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 60 * 1000; // 1 minute between codes
const HOURLY_LIMIT = 5;
const HOURLY_WINDOW_MS = 60 * 60 * 1000;
const CODE_KEY_BYTES = 32;

const codeHasher = createScryptHasher(CODE_KEY_BYTES);

export interface EmailCodeService {
  /**
   * Generates a new code, hashes it, stores it, and sends it via email.
   * Deletes any existing active codes for the user first.
   * Enforces rate limiting (1/60s, 5/hour).
   */
  sendCode(userId: string, email: string): Promise<void>;

  /**
   * Verifies a code. Increments attempt counter on failure.
   * Deletes the code row on success or when max attempts exhausted.
   * Returns true if the code is valid.
   */
  verifyCode(userId: string, code: string): Promise<boolean>;
}

function generateCode(): string {
  return randomInt(CODE_MAX).toString().padStart(CODE_DIGITS, "0");
}

export function createEmailCodeService(
  db: Kysely<TenantDatabase>,
  emailSender: EmailSender,
): EmailCodeService {
  /** Throws RateLimitError if the most recent code was sent less than 60s ago. */
  async function enforceCooldown(userId: string, now: Date): Promise<void> {
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
      throw new RateLimitError(
        "Please wait before requesting another code.",
        retryAfter,
      );
    }
  }

  /** Throws RateLimitError if the user has hit 5 codes in the last hour. */
  async function enforceHourlyLimit(userId: string, now: Date): Promise<void> {
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
      throw new RateLimitError(
        "Too many codes requested. Please try again later.",
        3600,
      );
    }
  }

  /** Replaces any active codes with a fresh one. Returns the plaintext code. */
  async function replaceActiveCode(userId: string, now: Date): Promise<string> {
    await db
      .deleteFrom("email_codes")
      .where("user_id", "=", userId)
      .where("consumed", "=", false)
      .execute();

    const code = generateCode();
    const codeHash = await codeHasher.hash(code);
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
  async function deleteCodeById(codeId: string): Promise<void> {
    await db.deleteFrom("email_codes").where("id", "=", codeId).execute();
  }

  /** Finds the active (unconsumed, unexpired) code for a user, or throws. */
  async function findActiveCodeOrThrow(
    userId: string,
  ): Promise<Selectable<EmailCodesTable>> {
    const row = await db
      .selectFrom("email_codes")
      .selectAll()
      .where("user_id", "=", userId)
      .where("consumed", "=", false)
      .where("expires_at", ">", new Date())
      .executeTakeFirst();

    if (!row) {
      throw new ValidationError(
        "No active verification code. Please request a new one.",
      );
    }

    if (row.attempts >= MAX_ATTEMPTS) {
      await deleteCodeById(row.id);
      throw new ValidationError(
        "Too many attempts. Please request a new code.",
      );
    }

    return row;
  }

  return {
    async sendCode(userId: string, email: string): Promise<void> {
      const now = new Date();

      await enforceCooldown(userId, now);
      await enforceHourlyLimit(userId, now);

      const code = await replaceActiveCode(userId, now);

      await emailSender.send({
        to: email,
        subject: "Your verification code",
        text: `Your verification code is: ${code}\n\nThis code expires in 5 minutes. If you did not request this code, you can safely ignore this email.`,
        html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 5 minutes. If you did not request this code, you can safely ignore this email.</p>`,
      });
    },

    async verifyCode(userId: string, code: string): Promise<boolean> {
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
        throw new ValidationError(
          "Too many attempts. Please request a new code.",
        );
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
