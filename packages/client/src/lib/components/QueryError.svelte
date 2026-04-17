<script lang="ts">
  import { Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { ErrorCode, type ErrorCodeType } from "@care-y/shared";

  let { error, onretry }: { error: unknown; onretry?: () => void } = $props();

  const errorCodeMap: Record<ErrorCodeType, () => string> = {
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
    [ErrorCode.NO_BACKUP_CODES]: () => m.error_no_backup_codes(),
    [ErrorCode.UNKNOWN_CREDENTIAL]: () => m.error_unknown_credential(),
    [ErrorCode.NO_NOTIFICATION_EMAIL]: () => m.error_no_notification_email(),
    [ErrorCode.NO_SMS_PHONE_ENROLLED]: () => m.error_no_sms_phone_enrolled(),
    [ErrorCode.NO_PUSH_SUBSCRIPTIONS]: () => m.error_no_push_subscriptions(),
    [ErrorCode.NO_PHONE_NUMBERS_CONFIGURED]: () =>
      m.error_no_phone_numbers_configured(),

    // Tickets
    [ErrorCode.TICKET_NOT_FOUND]: () => m.error_ticket_not_found(),
    [ErrorCode.TICKET_NOT_FOUND_OR_CLOSED]: () =>
      m.error_ticket_not_found_or_closed(),
    [ErrorCode.TICKET_NOT_FOUND_OR_OPEN]: () =>
      m.error_ticket_not_found_or_open(),
    [ErrorCode.TICKET_UNRESOLVED_DEPS]: () => m.error_ticket_unresolved_deps(),
    [ErrorCode.CANNOT_ASSIGN_CLOSED_TICKET]: () =>
      m.error_cannot_assign_closed_ticket(),
    [ErrorCode.CANNOT_TAKE_CLOSED_TICKET]: () =>
      m.error_cannot_take_closed_ticket(),
    [ErrorCode.TICKET_ALREADY_ASSIGNED]: () =>
      m.error_ticket_already_assigned(),
    [ErrorCode.NOT_ASSIGNED_TO_TICKET]: () => m.error_not_assigned_to_ticket(),
    [ErrorCode.INVALID_TARGET_USER]: () => m.error_invalid_target_user(),
    [ErrorCode.SELF_DEPENDENCY]: () => m.error_self_dependency(),
    [ErrorCode.CIRCULAR_DEPENDENCY]: () => m.error_circular_dependency(),
    [ErrorCode.DEPENDENCY_TICKET_NOT_FOUND]: () =>
      m.error_dependency_ticket_not_found(),
    [ErrorCode.FOLLOWUP_NOT_FOUND]: () => m.error_followup_not_found(),
    [ErrorCode.FOLLOWUP_NOT_EDITABLE]: () => m.error_followup_not_editable(),
    [ErrorCode.FOLLOWUP_NOT_DELETABLE]: () => m.error_followup_not_deletable(),
    [ErrorCode.FOLLOWUP_NOT_OWNED]: () => m.error_followup_not_owned(),
    [ErrorCode.CANNOT_FOLLOWUP_CLOSED_TICKET]: () =>
      m.error_cannot_followup_closed_ticket(),

    // Clients / merge
    [ErrorCode.CLIENT_NOT_FOUND]: () => m.error_client_not_found(),
    [ErrorCode.CLIENT_MERGED]: () => m.error_client_merged(),
    [ErrorCode.CANNOT_MERGE_INTO_SELF]: () => m.error_cannot_merge_into_self(),
    [ErrorCode.PRIMARY_CLIENT_NOT_FOUND]: () =>
      m.error_primary_client_not_found(),
    [ErrorCode.SECONDARY_CLIENT_NOT_FOUND]: () =>
      m.error_secondary_client_not_found(),
    [ErrorCode.SECONDARY_ALREADY_MERGED]: () =>
      m.error_secondary_already_merged(),
    [ErrorCode.MERGE_UNRESOLVED_DEPS]: () => m.error_merge_unresolved_deps(),
    [ErrorCode.MERGE_EVENT_NOT_FOUND]: () => m.error_merge_event_not_found(),
    [ErrorCode.MERGE_ALREADY_UNDONE]: () => m.error_merge_already_undone(),
    [ErrorCode.MERGE_UNDO_LOCKED]: () => m.error_merge_undo_locked(),
    [ErrorCode.ALIAS_GENERATION_FAILED]: () =>
      m.error_alias_generation_failed(),

    // Admin: user management
    [ErrorCode.CANNOT_DEACTIVATE_SELF]: () => m.error_cannot_deactivate_self(),
    [ErrorCode.CANNOT_DEACTIVATE_LAST_ADMIN]: () =>
      m.error_cannot_deactivate_last_admin(),

    // Queues / presets / media
    [ErrorCode.QUEUE_NOT_FOUND]: () => m.error_queue_not_found(),
    [ErrorCode.CANNOT_DELETE_LAST_QUEUE]: () =>
      m.error_cannot_delete_last_queue(),
    [ErrorCode.QUEUE_HAS_TICKETS]: () => m.error_queue_has_tickets(),
    [ErrorCode.PRESET_REPLY_NOT_FOUND]: () => m.error_preset_reply_not_found(),
    [ErrorCode.RECORDING_NOT_FOUND]: () => m.error_recording_not_found(),
    [ErrorCode.ATTACHMENT_NOT_FOUND]: () => m.error_attachment_not_found(),

    // Knowledge base
    [ErrorCode.KB_CATEGORY_NOT_FOUND]: () => m.error_kb_category_not_found(),
    [ErrorCode.KB_ARTICLE_NOT_FOUND]: () => m.error_kb_article_not_found(),
    [ErrorCode.KB_ATTACHMENT_NOT_FOUND]: () =>
      m.error_kb_attachment_not_found(),

    // Telephony
    [ErrorCode.TELEPHONY_NOT_CONFIGURED]: () =>
      m.error_telephony_not_configured(),
    [ErrorCode.NO_CONSULTANT_REGISTRATION]: () =>
      m.error_no_consultant_registration(),
    [ErrorCode.INVALID_VERIFICATION_CODE]: () =>
      m.error_invalid_verification_code(),
    [ErrorCode.GREETING_NOT_FOUND]: () => m.error_greeting_not_found(),
    [ErrorCode.SMS_RESPONSE_NOT_FOUND]: () => m.error_sms_response_not_found(),
  };

  function isErrorCode(value: string): value is ErrorCodeType {
    return value in errorCodeMap;
  }

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error && isErrorCode(err.message)) {
      return errorCodeMap[err.message]();
    }
    return m.error_generic();
  }
</script>

<Block class="text-center py-8">
  <p class="query-error-message">{getErrorMessage(error)}</p>
  {#if onretry}
    <button class="touch-feedback query-error-retry" onclick={onretry}>
      {m.app_retry()}
    </button>
  {/if}
</Block>

<style>
  .query-error-message {
    color: var(--muted);
  }

  .query-error-retry {
    margin-top: 1rem;
  }
</style>
