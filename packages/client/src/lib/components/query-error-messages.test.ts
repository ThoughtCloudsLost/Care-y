/**
 * Tests for the extracted error-code-to-message mapping.
 *
 * Table-driven over every ErrorCode value so that adding a new code without
 * a mapping decision causes a compile-time failure (the Record type) and a
 * test-time failure (the completeness check below).
 */

import { describe, it, expect } from "vitest";
import { ErrorCode, type ErrorCodeType } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import {
  errorCodeMap,
  isErrorCode,
  getErrorMessage,
} from "./query-error-messages.js";

// ---------------------------------------------------------------------------
// Completeness guard: every ErrorCode value must have a mapping entry.
// If a new code is added to ErrorCode without updating errorCodeMap, the
// Record<ErrorCodeType, ...> type catches it at compile time. This runtime
// check is a belt-and-suspenders guard that also catches accidental key
// deletion or misspelling.
// ---------------------------------------------------------------------------

const allCodes = Object.values(ErrorCode);

describe("errorCodeMap completeness", () => {
  it("has an entry for every ErrorCode value", () => {
    for (const code of allCodes) {
      expect(
        errorCodeMap,
        `missing mapping for ErrorCode.${code}`,
      ).toHaveProperty(code);
    }
  });

  it("has no extra keys beyond ErrorCode values", () => {
    const mapKeys = Object.keys(errorCodeMap);
    const codeSet = new Set<string>(allCodes);
    for (const key of mapKeys) {
      expect(codeSet.has(key), `unexpected key "${key}" in errorCodeMap`).toBe(
        true,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Per-code mapping table: asserts each code resolves to the expected
// Paraglide English string. Uses the real message functions, not key names.
// ---------------------------------------------------------------------------

const terms = withTerms();

const expectedMessages: Array<{ code: ErrorCodeType; expected: string }> = [
  // Auth / session
  { code: ErrorCode.NOT_AUTHENTICATED, expected: m.error_not_authenticated() },
  { code: ErrorCode.TWOFA_REQUIRED, expected: m.error_twofa_required() },
  {
    code: ErrorCode.INSUFFICIENT_PERMISSIONS,
    expected: m.error_insufficient_permissions(),
  },
  {
    code: ErrorCode.INVALID_CREDENTIALS,
    expected: m.error_invalid_credentials(),
  },
  {
    code: ErrorCode.ACCOUNT_ALREADY_EXISTS,
    expected: m.error_account_already_exists(),
  },
  { code: ErrorCode.USER_NOT_FOUND, expected: m.error_user_not_found() },
  {
    code: ErrorCode.CANNOT_CHANGE_OWN_ROLE,
    expected: m.error_cannot_change_own_role(),
  },
  {
    code: ErrorCode.CANNOT_DEMOTE_LAST_ADMIN,
    expected: m.error_cannot_demote_last_admin(),
  },
  {
    code: ErrorCode.ONLY_ADMINS_CAN_ASSIGN_ROLES,
    expected: m.error_only_admins_can_assign_roles(),
  },
  {
    code: ErrorCode.LOGIN_RATE_LIMITED,
    expected: m.error_login_rate_limited(),
  },
  {
    code: ErrorCode.REQUEST_RATE_LIMITED,
    expected: m.error_request_rate_limited(),
  },

  // Verification codes
  {
    code: ErrorCode.RATE_LIMIT_COOLDOWN,
    expected: m.error_rate_limit_cooldown(),
  },
  { code: ErrorCode.RATE_LIMIT_HOURLY, expected: m.error_rate_limit_hourly() },
  { code: ErrorCode.NO_ACTIVE_CODE, expected: m.error_no_active_code() },
  { code: ErrorCode.TOO_MANY_ATTEMPTS, expected: m.error_too_many_attempts() },

  // Two-factor
  {
    code: ErrorCode.SMS_2FA_NOT_AVAILABLE,
    expected: m.error_sms_2fa_not_available(),
  },
  {
    code: ErrorCode.PUSH_2FA_NOT_AVAILABLE,
    expected: m.error_push_2fa_not_available(),
  },
  {
    code: ErrorCode.SMS_NOT_CONFIGURED,
    expected: m.error_sms_not_configured(),
  },
  {
    code: ErrorCode.WEBAUTHN_CHALLENGE_NOT_FOUND,
    expected: m.error_webauthn_challenge_not_found(),
  },
  { code: ErrorCode.TOTP_NOT_ENROLLED, expected: m.error_totp_not_enrolled() },
  { code: ErrorCode.NO_PENDING_TOTP, expected: m.error_no_pending_totp() },
  {
    code: ErrorCode.CANNOT_REMOVE_LAST_2FA,
    expected: m.error_cannot_remove_last_2fa(),
  },
  {
    code: ErrorCode.NO_METHODS_ENROLLED,
    expected: m.error_no_methods_enrolled(),
  },
  { code: ErrorCode.NO_BACKUP_CODES, expected: m.error_no_backup_codes() },
  {
    code: ErrorCode.UNKNOWN_CREDENTIAL,
    expected: m.error_unknown_credential(),
  },
  {
    code: ErrorCode.NO_NOTIFICATION_EMAIL,
    expected: m.error_no_notification_email(),
  },
  {
    code: ErrorCode.NO_SMS_PHONE_ENROLLED,
    expected: m.error_no_sms_phone_enrolled(),
  },
  {
    code: ErrorCode.NO_PUSH_SUBSCRIPTIONS,
    expected: m.error_no_push_subscriptions(),
  },
  {
    code: ErrorCode.NO_PHONE_NUMBERS_CONFIGURED,
    expected: m.error_no_phone_numbers_configured(),
  },

  // Tickets
  {
    code: ErrorCode.TICKET_NOT_FOUND,
    expected: m.error_ticket_not_found(terms),
  },
  {
    code: ErrorCode.TICKET_NOT_FOUND_OR_CLOSED,
    expected: m.error_ticket_not_found_or_closed(terms),
  },
  {
    code: ErrorCode.TICKET_NOT_FOUND_OR_OPEN,
    expected: m.error_ticket_not_found_or_open(terms),
  },
  {
    code: ErrorCode.TICKET_UNRESOLVED_DEPS,
    expected: m.error_ticket_unresolved_deps(terms),
  },
  {
    code: ErrorCode.CANNOT_ASSIGN_CLOSED_TICKET,
    expected: m.error_cannot_assign_closed_ticket(terms),
  },
  {
    code: ErrorCode.CANNOT_TAKE_CLOSED_TICKET,
    expected: m.error_cannot_take_closed_ticket(terms),
  },
  {
    code: ErrorCode.TICKET_ALREADY_OPEN,
    expected: m.error_ticket_already_open(terms),
  },
  {
    code: ErrorCode.TICKET_CREATE_TARGET_CHANGED,
    expected: m.error_ticket_create_target_changed(terms),
  },
  { code: ErrorCode.TOKEN_EXPIRED, expected: m.error_token_expired() },
  {
    code: ErrorCode.TICKET_ALREADY_ASSIGNED,
    expected: m.error_ticket_already_assigned(terms),
  },
  {
    code: ErrorCode.NOT_ASSIGNED_TO_TICKET,
    expected: m.error_not_assigned_to_ticket(terms),
  },
  {
    code: ErrorCode.INVALID_TARGET_USER,
    expected: m.error_invalid_target_user(),
  },
  {
    code: ErrorCode.SELF_DEPENDENCY,
    expected: m.error_self_dependency(terms),
  },
  {
    code: ErrorCode.CIRCULAR_DEPENDENCY,
    expected: m.error_circular_dependency(),
  },
  {
    code: ErrorCode.DEPENDENCY_TICKET_NOT_FOUND,
    expected: m.error_dependency_ticket_not_found(terms),
  },
  {
    code: ErrorCode.FOLLOWUP_NOT_FOUND,
    expected: m.error_followup_not_found(),
  },
  {
    code: ErrorCode.FOLLOWUP_NOT_EDITABLE,
    expected: m.error_followup_not_editable(),
  },
  {
    code: ErrorCode.FOLLOWUP_NOT_DELETABLE,
    expected: m.error_followup_not_deletable(),
  },
  {
    code: ErrorCode.FOLLOWUP_NOT_OWNED,
    expected: m.error_followup_not_owned(),
  },
  {
    code: ErrorCode.CANNOT_FOLLOWUP_CLOSED_TICKET,
    expected: m.error_cannot_followup_closed_ticket(terms),
  },

  // Clients / merge
  {
    code: ErrorCode.CLIENT_NOT_FOUND,
    expected: m.error_client_not_found(terms),
  },
  { code: ErrorCode.CLIENT_MERGED, expected: m.error_client_merged(terms) },
  {
    code: ErrorCode.CANNOT_MERGE_INTO_SELF,
    expected: m.error_cannot_merge_into_self(terms),
  },
  {
    code: ErrorCode.PRIMARY_CLIENT_NOT_FOUND,
    expected: m.error_primary_client_not_found(terms),
  },
  {
    code: ErrorCode.SECONDARY_CLIENT_NOT_FOUND,
    expected: m.error_secondary_client_not_found(terms),
  },
  {
    code: ErrorCode.SECONDARY_ALREADY_MERGED,
    expected: m.error_secondary_already_merged(terms),
  },
  {
    code: ErrorCode.MERGE_UNRESOLVED_DEPS,
    expected: m.error_merge_unresolved_deps(terms),
  },
  {
    code: ErrorCode.MERGE_EVENT_NOT_FOUND,
    expected: m.error_merge_event_not_found(),
  },
  {
    code: ErrorCode.MERGE_ALREADY_UNDONE,
    expected: m.error_merge_already_undone(),
  },
  { code: ErrorCode.MERGE_UNDO_LOCKED, expected: m.error_merge_undo_locked() },
  {
    code: ErrorCode.ALIAS_GENERATION_FAILED,
    expected: m.error_alias_generation_failed(terms),
  },

  // Admin: user management
  {
    code: ErrorCode.CANNOT_DEACTIVATE_SELF,
    expected: m.error_cannot_deactivate_self(),
  },
  {
    code: ErrorCode.CANNOT_DEACTIVATE_LAST_ADMIN,
    expected: m.error_cannot_deactivate_last_admin(),
  },

  // Profile
  {
    code: ErrorCode.USERNAME_ALREADY_TAKEN,
    expected: m.error_username_already_taken(),
  },

  // Queues / presets / media
  {
    code: ErrorCode.QUEUE_NOT_FOUND,
    expected: m.error_queue_not_found(terms),
  },
  {
    code: ErrorCode.CANNOT_DELETE_LAST_QUEUE,
    expected: m.error_cannot_delete_last_queue(terms),
  },
  {
    code: ErrorCode.QUEUE_HAS_TICKETS,
    expected: m.error_queue_has_tickets(terms),
  },
  {
    code: ErrorCode.PRESET_REPLY_NOT_FOUND,
    expected: m.error_preset_reply_not_found(),
  },
  {
    code: ErrorCode.RECORDING_NOT_FOUND,
    expected: m.error_recording_not_found(),
  },
  {
    code: ErrorCode.ATTACHMENT_NOT_FOUND,
    expected: m.error_attachment_not_found(),
  },
  {
    code: ErrorCode.NOTE_TYPE_NOT_FOUND,
    expected: m.error_note_type_not_found(),
  },
  {
    code: ErrorCode.CANNOT_DEACTIVATE_DEFAULT_NOTE_TYPE,
    expected: m.error_cannot_deactivate_default_note_type(),
  },
  // Intentional quirk: INSUFFICIENT_ROLE maps to the generic error
  // message to avoid leaking role structure information.
  { code: ErrorCode.INSUFFICIENT_ROLE, expected: m.error_generic() },

  // Knowledge base
  {
    code: ErrorCode.KB_CATEGORY_NOT_FOUND,
    expected: m.error_kb_category_not_found(),
  },
  {
    code: ErrorCode.KB_ARTICLE_NOT_FOUND,
    expected: m.error_kb_article_not_found(),
  },
  {
    code: ErrorCode.KB_ATTACHMENT_NOT_FOUND,
    expected: m.error_kb_attachment_not_found(),
  },

  // Onboarding
  {
    code: ErrorCode.ORG_ALREADY_SETUP,
    expected: m.error_org_already_setup(),
  },
  {
    code: ErrorCode.ORG_KEYPAIR_MISSING,
    expected: m.error_org_keypair_missing(),
  },
  {
    code: ErrorCode.INVALID_INVITE_TOKEN,
    expected: m.error_invalid_invite_token(),
  },
  { code: ErrorCode.INVITE_NOT_FOUND, expected: m.error_invite_not_found() },
  {
    code: ErrorCode.INVALID_SETUP_TOKEN,
    expected: m.onboarding_setup_invalid_link(),
  },
  {
    code: ErrorCode.BOOTSTRAP_RATE_LIMITED,
    expected: m.error_bootstrap_rate_limited(),
  },

  // Telephony
  {
    code: ErrorCode.TELEPHONY_NOT_CONFIGURED,
    expected: m.error_telephony_not_configured(),
  },
  {
    code: ErrorCode.NO_CONSULTANT_REGISTRATION,
    expected: m.error_no_consultant_registration(),
  },
  {
    code: ErrorCode.INVALID_VERIFICATION_CODE,
    expected: m.error_invalid_verification_code(),
  },
  {
    code: ErrorCode.GREETING_NOT_FOUND,
    expected: m.error_greeting_not_found(),
  },
  {
    code: ErrorCode.SMS_RESPONSE_NOT_FOUND,
    expected: m.error_sms_response_not_found(),
  },
];

describe("errorCodeMap per-code mapping", () => {
  for (const { code, expected } of expectedMessages) {
    it(`maps ${code} to the correct translated message`, () => {
      const result = errorCodeMap[code]();
      expect(result).toBe(expected);
    });
  }

  it("INSUFFICIENT_ROLE maps to the same string as error_generic (intentional)", () => {
    const result = errorCodeMap[ErrorCode.INSUFFICIENT_ROLE]();
    expect(result).toBe(m.error_generic());
  });
});

// ---------------------------------------------------------------------------
// isErrorCode type guard
// ---------------------------------------------------------------------------

describe("isErrorCode", () => {
  it("returns true for a valid ErrorCode string", () => {
    expect(isErrorCode("NOT_AUTHENTICATED")).toBe(true);
  });

  it("returns true for every ErrorCode value", () => {
    for (const code of allCodes) {
      expect(isErrorCode(code)).toBe(true);
    }
  });

  it("returns false for an unrecognized string", () => {
    expect(isErrorCode("TOTALLY_MADE_UP_CODE")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isErrorCode("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getErrorMessage
// ---------------------------------------------------------------------------

describe("getErrorMessage", () => {
  it("returns the mapped message for an Error with a known code", () => {
    const err = new Error("RATE_LIMIT_COOLDOWN");
    expect(getErrorMessage(err)).toBe(m.error_rate_limit_cooldown());
  });

  it("returns the generic message for an Error with an unknown code", () => {
    const err = new Error("UNKNOWN_CODE_XYZ");
    expect(getErrorMessage(err)).toBe(m.error_generic());
  });

  it("returns the generic message for a non-Error input (string)", () => {
    expect(getErrorMessage("some string")).toBe(m.error_generic());
  });

  it("returns the generic message for a non-Error input (null)", () => {
    expect(getErrorMessage(null)).toBe(m.error_generic());
  });

  it("returns the generic message for a non-Error input (number)", () => {
    expect(getErrorMessage(42)).toBe(m.error_generic());
  });

  it("returns the generic message for undefined", () => {
    expect(getErrorMessage(undefined)).toBe(m.error_generic());
  });
});
