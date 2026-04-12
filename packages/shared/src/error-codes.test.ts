import { describe, expect, it } from "vitest";
import { ErrorCode, type ErrorCodeType } from "./error-codes.js";

describe("ErrorCode", () => {
  it("has all expected members", () => {
    const expected: ErrorCodeType[] = [
      // Auth / session
      "NOT_AUTHENTICATED",
      "TWOFA_REQUIRED",
      "INSUFFICIENT_PERMISSIONS",
      "INVALID_CREDENTIALS",
      "ACCOUNT_ALREADY_EXISTS",
      "USER_NOT_FOUND",
      "CANNOT_CHANGE_OWN_ROLE",
      "CANNOT_DEMOTE_LAST_ADMIN",
      "ONLY_ADMINS_CAN_ASSIGN_ROLES",
      "LOGIN_RATE_LIMITED",
      "REQUEST_RATE_LIMITED",

      // Verification codes
      "RATE_LIMIT_COOLDOWN",
      "RATE_LIMIT_HOURLY",
      "NO_ACTIVE_CODE",
      "TOO_MANY_ATTEMPTS",

      // Two-factor
      "SMS_2FA_NOT_AVAILABLE",
      "PUSH_2FA_NOT_AVAILABLE",
      "SMS_NOT_CONFIGURED",
      "WEBAUTHN_CHALLENGE_NOT_FOUND",
      "TOTP_NOT_ENROLLED",
      "NO_PENDING_TOTP",
      "CANNOT_REMOVE_LAST_2FA",
      "NO_BACKUP_CODES",
      "UNKNOWN_CREDENTIAL",
      "NO_NOTIFICATION_EMAIL",
      "NO_SMS_PHONE_ENROLLED",
      "NO_PUSH_SUBSCRIPTIONS",
      "NO_PHONE_NUMBERS_CONFIGURED",

      // Tickets
      "TICKET_NOT_FOUND",
      "TICKET_NOT_FOUND_OR_CLOSED",
      "TICKET_NOT_FOUND_OR_OPEN",
      "TICKET_UNRESOLVED_DEPS",
      "CANNOT_ASSIGN_CLOSED_TICKET",
      "CANNOT_TAKE_CLOSED_TICKET",
      "TICKET_ALREADY_ASSIGNED",
      "NOT_ASSIGNED_TO_TICKET",
      "INVALID_TARGET_USER",
      "SELF_DEPENDENCY",
      "CIRCULAR_DEPENDENCY",
      "DEPENDENCY_TICKET_NOT_FOUND",
      "FOLLOWUP_NOT_FOUND",
      "FOLLOWUP_NOT_EDITABLE",
      "FOLLOWUP_NOT_DELETABLE",
      "FOLLOWUP_NOT_OWNED",
      "CANNOT_FOLLOWUP_CLOSED_TICKET",

      // Clients / merge
      "CLIENT_NOT_FOUND",
      "CLIENT_MERGED",
      "CANNOT_MERGE_INTO_SELF",
      "PRIMARY_CLIENT_NOT_FOUND",
      "SECONDARY_CLIENT_NOT_FOUND",
      "SECONDARY_ALREADY_MERGED",
      "MERGE_UNRESOLVED_DEPS",
      "MERGE_EVENT_NOT_FOUND",
      "MERGE_ALREADY_UNDONE",
      "MERGE_UNDO_LOCKED",
      "ALIAS_GENERATION_FAILED",

      // Queues / presets / media
      "QUEUE_NOT_FOUND",
      "PRESET_REPLY_NOT_FOUND",
      "RECORDING_NOT_FOUND",
      "ATTACHMENT_NOT_FOUND",

      // Knowledge base
      "KB_CATEGORY_NOT_FOUND",
      "KB_ARTICLE_NOT_FOUND",

      // Telephony
      "TELEPHONY_NOT_CONFIGURED",
      "NO_CONSULTANT_REGISTRATION",
      "INVALID_VERIFICATION_CODE",
      "GREETING_NOT_FOUND",
      "SMS_RESPONSE_NOT_FOUND",
    ];
    const actual = Object.values(ErrorCode);
    expect(actual).toEqual(expect.arrayContaining(expected));
    expect(actual).toHaveLength(expected.length);
  });

  it("values match their keys (no typos)", () => {
    for (const [key, value] of Object.entries(ErrorCode)) {
      expect(key).toBe(value);
    }
  });
});
