// @care-y/shared - barrel export
// Shared types, Zod schemas, and enums consumed by all packages.

/** Placeholder constant to verify cross-package imports work. */
export const PACKAGE_NAME = "@care-y/shared" as const;

// --- Authentication schemas ---
export {
  RESERVED_SLUGS,
  orgSlugSchema,
  createOrgInputSchema,
} from "./schemas/org.js";

// --- Utilities ---
export { extractSubdomain } from "./utils/subdomain.js";

export {
  emailSchema,
  notificationEmailSchema,
  passwordSchema,
  displayNameSchema,
  identifierSchema,
  loginInputSchema,
  registerInputSchema,
  getSaltInputSchema,
  getSaltOutputSchema,
  assignRoleInputSchema,
  setPiiRetentionInputSchema,
} from "./schemas/auth.js";

// --- Roles and permissions ---
export {
  RoleId,
  type RoleIdValue,
  ROLE_ID_VALUES,
  ROLE_ID_VALUES_TUPLE,
  Permission,
} from "./roles.js";

// --- Two-factor authentication ---
export {
  TwoFactorMethod,
  METHOD_INFO,
  type TwoFactorMethodType,
  type WebauthnCategory,
  type TwoFactorMethodInfo,
  type EnrolledMethod,
  type TwoFactorStatus,
} from "./two-factor-types.js";

export {
  totpVerifySchema,
  emailCodeVerifySchema,
  smsEnrollSchema,
  smsCodeVerifySchema,
  backupCodeVerifySchema,
  webauthnRegistrationResponseSchema,
  webauthnAssertionResponseSchema,
  removeMethodSchema,
  enrolledMethodResponseSchema,
  twoFactorStatusResponseSchema,
  pushChallengeIdSchema,
  pushApprovalSchema,
  type TotpVerifyInput,
  type EmailCodeVerifyInput,
  type SmsEnrollInput,
  type SmsCodeVerifyInput,
  type BackupCodeVerifyInput,
  type WebauthnRegistrationResponse,
  type WebauthnAssertionResponse,
  type RemoveMethodInput,
  type PushChallengeIdInput,
  type PushApprovalInput,
} from "./schemas/two-factor.js";

// --- Key management schemas ---
export {
  initCryptoKeysSchema,
  uploadVolPublicSchema,
  passwordChangeKeysSchema,
  uploadOrgPublicKeySchema,
  type InitCryptoKeysInput,
  type UploadVolPublicInput,
  type PasswordChangeKeysInput,
  type UploadOrgPublicKeyInput,
} from "./schemas/keys.js";

// --- OPRF schemas ---
export {
  oprfEvaluateInputSchema,
  oprfEvaluateOutputSchema,
  powChallengeSchema,
  type OprfEvaluateInput,
  type OprfEvaluateOutput,
  type PowChallenge,
} from "./schemas/oprf.js";

// --- Telephony: country codes ---
export {
  E164_COUNTRY_CODES,
  isValidCountryCode,
} from "./telephony/country-codes.js";

// --- Telephony schemas ---
export {
  telephonyProviderSchema,
  saveTelephonyConfigInputSchema,
  updateCountryCodeInputSchema,
  maskedTelephonyConfigSchema,
  maskedPhoneNumberSchema,
  type TelephonyProviderType,
  type SaveTelephonyConfigInput,
  type UpdateCountryCodeInput,
  type MaskedTelephonyConfigOutput,
  createManagedTelephonyInputSchema,
  type CreateManagedTelephonyInput,
} from "./schemas/telephony.js";

// --- Telephony content schemas ---
export {
  greetingTypeSchema,
  createGreetingInputSchema,
  updateGreetingInputSchema,
  deleteGreetingInputSchema,
  listGreetingsInputSchema,
  smsResponseTypeSchema,
  createSmsResponseInputSchema,
  updateSmsResponseInputSchema,
  deleteSmsResponseInputSchema,
  listSmsResponsesInputSchema,
  preferredCallMethodSchema,
  registerConsultantInputSchema,
  updateConsultantInputSchema,
  verifyConsultantInputSchema,
  type GreetingType,
  type CreateGreetingInput,
  type UpdateGreetingInput,
  type DeleteGreetingInput,
  type ListGreetingsInput,
  type SmsResponseType,
  type CreateSmsResponseInput,
  type UpdateSmsResponseInput,
  type DeleteSmsResponseInput,
  type ListSmsResponsesInput,
  type PreferredCallMethod,
  type RegisterConsultantInput,
  type UpdateConsultantInput,
  type VerifyConsultantInput,
} from "./schemas/telephony-content.js";

// --- Relay schemas ---
export {
  relaySmsInputSchema,
  relaySmsOutputSchema,
  relayCallInputSchema,
  relayCallOutputSchema,
  relayWebrtcTokenOutputSchema,
  type RelaySmsInput,
  type RelaySmsOutput,
  type RelayCallInput,
  type RelayCallOutput,
  type RelayWebrtcTokenOutput,
} from "./schemas/relay.js";

// --- Ticket schemas ---
export {
  ticketStatusSchema,
  ticketPrioritySchema,
  followUpSourceSchema,
  followUpTypeSchema,
  createTicketInputSchema,
  createFollowUpInputSchema,
  markReadInputSchema,
  updateTicketInputSchema,
  createQueueInputSchema,
  updateQueueInputSchema,
  createPresetReplyInputSchema,
  updatePresetReplyInputSchema,
  addDependencyInputSchema,
  mergeClientsInputSchema,
  undoMergeInputSchema,
  uploadAttachmentInputSchema,
  ticketListInputSchema,
  followUpListInputSchema,
  assignTicketInputSchema,
  takeTicketInputSchema,
  releaseTicketInputSchema,
  watchTicketInputSchema,
  queueWatcherInputSchema,
  queueAssignmentInputSchema,
  type TicketStatus,
  type TicketPriority,
  type FollowUpSource,
  type FollowUpType,
  type CreateTicketInput,
  type CreateFollowUpInput,
  type MarkReadInput,
  type UpdateTicketInput,
  type CreateQueueInput,
  type UpdateQueueInput,
  type CreatePresetReplyInput,
  type UpdatePresetReplyInput,
  type AddDependencyInput,
  type MergeClientsInput,
  type UndoMergeInput,
  type UploadAttachmentInput,
  type TicketListInput,
  type FollowUpListInput,
  type AssignTicketInput,
  type TakeTicketInput,
  type ReleaseTicketInput,
  type WatchTicketInput,
  type QueueWatcherInput,
  type QueueAssignmentInput,
} from "./schemas/tickets.js";

// --- Knowledge Base schemas ---
export {
  createKbCategoryInputSchema,
  updateKbCategoryInputSchema,
  createKbItemInputSchema,
  updateKbItemInputSchema,
  kbItemListInputSchema,
  voteDirectionSchema,
  castVoteInputSchema,
  removeVoteInputSchema,
  type CreateKbCategoryInput,
  type UpdateKbCategoryInput,
  type CreateKbItemInput,
  type UpdateKbItemInput,
  type KbItemListInput,
  type VoteDirection,
  type CastVoteInput,
  type RemoveVoteInput,
} from "./schemas/kb.js";

// --- Notification, search, audit schemas ---
export {
  notificationEventTypeSchema,
  sseEventSchema,
  pushSubscriptionInputSchema,
  unsubscribePushInputSchema,
  metadataSearchInputSchema,
  contentSearchInputSchema,
  auditEventTypeSchema,
  auditLogQueryInputSchema,
  type NotificationEventType,
  type SseEvent,
  type PushSubscriptionInput,
  type UnsubscribePushInput,
  type MetadataSearchInput,
  type ContentSearchInput,
  type AuditEventType,
  type AuditLogQueryInput,
} from "./schemas/notifications.js";

// --- Browser call service interface ---
export type {
  BrowserCallState,
  BrowserCallEvents,
  BrowserCallService,
} from "./telephony/browser-call.js";

export { ErrorCode, type ErrorCodeType } from "./error-codes.js";
