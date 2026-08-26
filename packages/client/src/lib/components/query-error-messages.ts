/**
 * Error-code-to-message mapping extracted from QueryError.svelte.
 *
 * Maps every ErrorCode value to a localized user-facing string via Paraglide.
 * The component imports these three exports; tests exercise them directly.
 */

import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import { ErrorCode, type ErrorCodeType } from "@care-y/shared";

export const errorCodeMap: Record<ErrorCodeType, () => string> = {
  // Auth / session
  [ErrorCode.NOT_AUTHENTICATED]: () => m.error_not_authenticated(),
  [ErrorCode.TWOFA_REQUIRED]: () => m.error_twofa_required(),
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: () =>
    m.error_insufficient_permissions(),
  [ErrorCode.INVALID_CREDENTIALS]: () => m.error_invalid_credentials(),
  [ErrorCode.ACCOUNT_ALREADY_EXISTS]: () => m.error_account_already_exists(),
  [ErrorCode.USER_NOT_FOUND]: () => m.error_user_not_found(),
  [ErrorCode.CANNOT_CHANGE_OWN_ROLE]: () => m.error_cannot_change_own_role(),
  [ErrorCode.CANNOT_DEMOTE_LAST_ADMIN]: () =>
    m.error_cannot_demote_last_admin(),
  [ErrorCode.ONLY_ADMINS_CAN_ASSIGN_ROLES]: () =>
    m.error_only_admins_can_assign_roles(),
  [ErrorCode.LOGIN_RATE_LIMITED]: () => m.error_login_rate_limited(),
  [ErrorCode.REQUEST_RATE_LIMITED]: () => m.error_request_rate_limited(),

  // Verification codes
  [ErrorCode.RATE_LIMIT_COOLDOWN]: () => m.error_rate_limit_cooldown(),
  [ErrorCode.RATE_LIMIT_HOURLY]: () => m.error_rate_limit_hourly(),
  [ErrorCode.NO_ACTIVE_CODE]: () => m.error_no_active_code(),
  [ErrorCode.TOO_MANY_ATTEMPTS]: () => m.error_too_many_attempts(),

  // Two-factor
  [ErrorCode.SMS_2FA_NOT_AVAILABLE]: () => m.error_sms_2fa_not_available(),
  [ErrorCode.PUSH_2FA_NOT_AVAILABLE]: () => m.error_push_2fa_not_available(),
  [ErrorCode.SMS_NOT_CONFIGURED]: () => m.error_sms_not_configured(),
  [ErrorCode.WEBAUTHN_CHALLENGE_NOT_FOUND]: () =>
    m.error_webauthn_challenge_not_found(),
  [ErrorCode.TOTP_NOT_ENROLLED]: () => m.error_totp_not_enrolled(),
  [ErrorCode.NO_PENDING_TOTP]: () => m.error_no_pending_totp(),
  [ErrorCode.CANNOT_REMOVE_LAST_2FA]: () => m.error_cannot_remove_last_2fa(),
  [ErrorCode.NO_METHODS_ENROLLED]: () => m.error_no_methods_enrolled(),
  [ErrorCode.NO_BACKUP_CODES]: () => m.error_no_backup_codes(),
  [ErrorCode.UNKNOWN_CREDENTIAL]: () => m.error_unknown_credential(),
  [ErrorCode.NO_NOTIFICATION_EMAIL]: () => m.error_no_notification_email(),
  [ErrorCode.NO_SMS_PHONE_ENROLLED]: () => m.error_no_sms_phone_enrolled(),
  [ErrorCode.NO_PUSH_SUBSCRIPTIONS]: () => m.error_no_push_subscriptions(),
  [ErrorCode.NO_PHONE_NUMBERS_CONFIGURED]: () =>
    m.error_no_phone_numbers_configured(),

  // Tickets
  [ErrorCode.TICKET_NOT_FOUND]: () => m.error_ticket_not_found(withTerms()),
  [ErrorCode.TICKET_NOT_FOUND_OR_CLOSED]: () =>
    m.error_ticket_not_found_or_closed(withTerms()),
  [ErrorCode.TICKET_NOT_FOUND_OR_OPEN]: () =>
    m.error_ticket_not_found_or_open(withTerms()),
  [ErrorCode.TICKET_UNRESOLVED_DEPS]: () =>
    m.error_ticket_unresolved_deps(withTerms()),
  [ErrorCode.CANNOT_ASSIGN_CLOSED_TICKET]: () =>
    m.error_cannot_assign_closed_ticket(withTerms()),
  [ErrorCode.CANNOT_TAKE_CLOSED_TICKET]: () =>
    m.error_cannot_take_closed_ticket(withTerms()),
  [ErrorCode.TICKET_ALREADY_OPEN]: () =>
    m.error_ticket_already_open(withTerms()),
  [ErrorCode.TICKET_KEY_GENERATION_STALE]: () =>
    m.error_ticket_key_generation_stale(withTerms()),
  [ErrorCode.TICKET_CREATE_TARGET_CHANGED]: () =>
    m.error_ticket_create_target_changed(withTerms()),
  [ErrorCode.TOKEN_EXPIRED]: () => m.error_token_expired(),
  [ErrorCode.TICKET_ALREADY_ASSIGNED]: () =>
    m.error_ticket_already_assigned(withTerms()),
  [ErrorCode.NOT_ASSIGNED_TO_TICKET]: () =>
    m.error_not_assigned_to_ticket(withTerms()),
  [ErrorCode.INVALID_TARGET_USER]: () => m.error_invalid_target_user(),
  [ErrorCode.SELF_DEPENDENCY]: () => m.error_self_dependency(withTerms()),
  [ErrorCode.CIRCULAR_DEPENDENCY]: () => m.error_circular_dependency(),
  [ErrorCode.DEPENDENCY_TICKET_NOT_FOUND]: () =>
    m.error_dependency_ticket_not_found(withTerms()),
  [ErrorCode.FOLLOWUP_NOT_FOUND]: () => m.error_followup_not_found(),
  [ErrorCode.FOLLOWUP_NOT_EDITABLE]: () => m.error_followup_not_editable(),
  [ErrorCode.FOLLOWUP_NOT_DELETABLE]: () => m.error_followup_not_deletable(),
  [ErrorCode.FOLLOWUP_NOT_OWNED]: () => m.error_followup_not_owned(),
  [ErrorCode.CANNOT_FOLLOWUP_CLOSED_TICKET]: () =>
    m.error_cannot_followup_closed_ticket(withTerms()),

  // Clients / merge
  [ErrorCode.CLIENT_NOT_FOUND]: () => m.error_client_not_found(withTerms()),
  [ErrorCode.CLIENT_MERGED]: () => m.error_client_merged(withTerms()),
  [ErrorCode.CANNOT_MERGE_INTO_SELF]: () =>
    m.error_cannot_merge_into_self(withTerms()),
  [ErrorCode.PRIMARY_CLIENT_NOT_FOUND]: () =>
    m.error_primary_client_not_found(withTerms()),
  [ErrorCode.SECONDARY_CLIENT_NOT_FOUND]: () =>
    m.error_secondary_client_not_found(withTerms()),
  [ErrorCode.SECONDARY_ALREADY_MERGED]: () =>
    m.error_secondary_already_merged(withTerms()),
  [ErrorCode.MERGE_UNRESOLVED_DEPS]: () =>
    m.error_merge_unresolved_deps(withTerms()),
  [ErrorCode.MERGE_EVENT_NOT_FOUND]: () => m.error_merge_event_not_found(),
  [ErrorCode.MERGE_ALREADY_UNDONE]: () => m.error_merge_already_undone(),
  [ErrorCode.MERGE_UNDO_LOCKED]: () => m.error_merge_undo_locked(),
  [ErrorCode.ALIAS_GENERATION_FAILED]: () =>
    m.error_alias_generation_failed(withTerms()),
  [ErrorCode.CLIENT_ALIAS_CONFLICT]: () => m.error_client_alias_conflict(),
  [ErrorCode.PHONE_HASH_CONFLICT]: () =>
    m.error_phone_hash_conflict(withTerms()),

  // Admin: user management
  [ErrorCode.CANNOT_DEACTIVATE_SELF]: () => m.error_cannot_deactivate_self(),
  [ErrorCode.CANNOT_DEACTIVATE_LAST_ADMIN]: () =>
    m.error_cannot_deactivate_last_admin(),

  // Profile
  [ErrorCode.USERNAME_ALREADY_TAKEN]: () => m.error_username_already_taken(),

  // Queues / presets / media
  [ErrorCode.QUEUE_NOT_FOUND]: () => m.error_queue_not_found(withTerms()),
  [ErrorCode.CANNOT_DELETE_LAST_QUEUE]: () =>
    m.error_cannot_delete_last_queue(withTerms()),
  [ErrorCode.QUEUE_HAS_TICKETS]: () => m.error_queue_has_tickets(withTerms()),
  [ErrorCode.PRESET_REPLY_NOT_FOUND]: () => m.error_preset_reply_not_found(),
  [ErrorCode.RECORDING_NOT_FOUND]: () => m.error_recording_not_found(),
  [ErrorCode.ATTACHMENT_NOT_FOUND]: () => m.error_attachment_not_found(),
  [ErrorCode.NOTE_TYPE_NOT_FOUND]: () => m.error_note_type_not_found(),
  [ErrorCode.CANNOT_DEACTIVATE_DEFAULT_NOTE_TYPE]: () =>
    m.error_cannot_deactivate_default_note_type(),
  // Intentional: INSUFFICIENT_ROLE maps to the generic error message.
  // The specific permission error is not shown to users to avoid
  // leaking role structure information.
  [ErrorCode.INSUFFICIENT_ROLE]: () => m.error_generic(),

  // Knowledge base
  [ErrorCode.KB_CATEGORY_NOT_FOUND]: () => m.error_kb_category_not_found(),
  [ErrorCode.KB_ARTICLE_NOT_FOUND]: () => m.error_kb_article_not_found(),
  [ErrorCode.KB_ATTACHMENT_NOT_FOUND]: () => m.error_kb_attachment_not_found(),

  // Onboarding
  [ErrorCode.ORG_ALREADY_SETUP]: () => m.error_org_already_setup(),
  [ErrorCode.ORG_KEYPAIR_MISSING]: () => m.error_org_keypair_missing(),
  [ErrorCode.INVALID_INVITE_TOKEN]: () => m.error_invalid_invite_token(),
  [ErrorCode.INVITE_NOT_FOUND]: () => m.error_invite_not_found(),
  [ErrorCode.INVALID_SETUP_TOKEN]: () => m.onboarding_setup_invalid_link(),
  [ErrorCode.BOOTSTRAP_RATE_LIMITED]: () => m.error_bootstrap_rate_limited(),

  // Telephony
  [ErrorCode.TELEPHONY_NOT_CONFIGURED]: () =>
    m.error_telephony_not_configured(),
  [ErrorCode.NO_CONSULTANT_REGISTRATION]: () =>
    m.error_no_consultant_registration(),
  [ErrorCode.INVALID_VERIFICATION_CODE]: () =>
    m.error_invalid_verification_code(),
  [ErrorCode.GREETING_NOT_FOUND]: () => m.error_greeting_not_found(),
  [ErrorCode.SMS_RESPONSE_NOT_FOUND]: () => m.error_sms_response_not_found(),

  // Consultant phone verification
  [ErrorCode.REVERIFICATION_REQUIRED]: () => m.error_reverification_required(),
  [ErrorCode.CONSULTANT_NOT_VERIFIED]: () => m.error_consultant_not_verified(),

  // Role permission overrides
  [ErrorCode.PERMISSION_LOCKED]: () => m.error_permission_locked(),

  // Intake forms
  [ErrorCode.FORM_HAS_RESPONSES]: () => m.error_form_has_responses(),
  [ErrorCode.INTAKE_SLUG_TAKEN]: () => m.error_intake_slug_taken(),
  [ErrorCode.INTAKE_DISABLED]: () => m.error_intake_disabled(),
  [ErrorCode.INTAKE_FORM_CLOSED]: () => m.error_intake_form_closed(),

  // Portal channels
  [ErrorCode.PORTAL_CHANNEL_EXISTS]: () =>
    m.error_portal_channel_exists(withTerms()),
  // Deliberately generic: the portal surface never distinguishes
  // unknown, revoked, and bad-auth channels.
  [ErrorCode.PORTAL_CHANNEL_NOT_FOUND]: () => m.error_generic(),

  // Client accounts
  [ErrorCode.ACCOUNT_USERNAME_TAKEN]: () => m.error_account_username_taken(),
};

/** Type guard: returns true when the string is a recognized ErrorCode value. */
export function isErrorCode(value: string): value is ErrorCodeType {
  return value in errorCodeMap;
}

/**
 * Resolves an unknown error to a user-facing localized message string.
 *
 * When the error is an Error whose message is a recognized ErrorCode, the
 * corresponding translated message is returned. All other inputs (non-Error
 * values, Errors with unrecognized messages) fall back to the generic error
 * message.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error && isErrorCode(err.message)) {
    return errorCodeMap[err.message]();
  }
  return m.error_generic();
}
