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
  PASSWORD_MIN_LENGTH,
  passwordSchema,
  displayNameSchema,
  identifierSchema,
  loginInputSchema,
  registerInputSchema,
  getSaltInputSchema,
  getSaltOutputSchema,
  assignRoleInputSchema,
  setPiiRetentionInputSchema,
  setUserActiveInputSchema,
  listUsersOutputItemSchema,
} from "./schemas/auth.js";

// --- Roles and permissions ---
export {
  RoleId,
  type RoleIdValue,
  ROLE_ID_VALUES,
  ROLE_ID_VALUES_TUPLE,
  ROLE_LEVEL,
  meetsRoleThreshold,
  getAllowedRoleIds,
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
  emailEnrollSchema,
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
  type EmailEnrollInput,
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
  rotateOrgKeySchema,
  type InitCryptoKeysInput,
  type UploadVolPublicInput,
  type PasswordChangeKeysInput,
  type UploadOrgPublicKeyInput,
  type RotateOrgKeyInput,
} from "./schemas/keys.js";

// --- Profile schemas ---
export {
  updateDisplayNameSchema,
  adminUpdateDisplayNameSchema,
  updateUsernameSchema,
  adminUpdateUsernameSchema,
  updatePasswordHashSchema,
  changePasswordSchema,
  type UpdateDisplayNameInput,
  type AdminUpdateDisplayNameInput,
  type UpdateUsernameInput,
  type AdminUpdateUsernameInput,
  type UpdatePasswordHashInput,
  type ChangePasswordInput,
} from "./schemas/profile.js";

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
  E164_COUNTRY_CODE_OPTIONS,
  isValidCountryCode,
  type CountryCodeOption,
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
  addToBlocklistInputSchema,
  type AddToBlocklistInput,
  removeFromBlocklistInputSchema,
  type RemoveFromBlocklistInput,
  setPhonePurposeInputSchema,
  type SetPhonePurposeInput,
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
  GREETING_AUDIO_MAX_BYTES,
  greetingAudioContentTypeSchema,
  uploadGreetingAudioInputSchema,
  createAudioGreetingInputSchema,
  type GreetingAudioContentType,
  type UploadGreetingAudioInput,
  type CreateAudioGreetingInput,
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
  ticketSortFieldSchema,
  sortDirectionSchema,
  followUpSourceSchema,
  followUpTypeSchema,
  keyWrapSchema,
  createTicketInputSchema,
  createFollowUpInputSchema,
  updateReadCursorInputSchema,
  updateTicketInputSchema,
  MAX_ESCALATION_DAYS,
  createQueueInputSchema,
  updateQueueInputSchema,
  reorderQueuesInputSchema,
  deleteQueueInputSchema,
  createPresetReplyInputSchema,
  updatePresetReplyInputSchema,
  addDependencyInputSchema,
  mergeClientsInputSchema,
  undoMergeInputSchema,
  uploadAttachmentInputSchema,
  ticketListInputSchema,
  recentFollowUpsInputSchema,
  followUpListInputSchema,
  followUpSummaryInputSchema,
  followUpsByIdsInputSchema,
  listParticipantsInputSchema,
  recordingListInputSchema,
  attachmentListInputSchema,
  assignTicketInputSchema,
  takeTicketInputSchema,
  releaseTicketInputSchema,
  assignToInputSchema,
  watchTicketInputSchema,
  queueWatcherInputSchema,
  queueAssignmentInputSchema,
  type TicketStatus,
  type TicketPriority,
  type TicketSortField,
  type SortDirection,
  type FollowUpSource,
  type FollowUpType,
  callStatusSchema,
  type CallStatus,
  type KeyWrap,
  type CreateTicketInput,
  type CreateFollowUpInput,
  type UpdateReadCursorInput,
  type UpdateTicketInput,
  type CreateQueueInput,
  type UpdateQueueInput,
  type ReorderQueuesInput,
  type DeleteQueueInput,
  type CreatePresetReplyInput,
  type UpdatePresetReplyInput,
  type AddDependencyInput,
  type MergeClientsInput,
  type UndoMergeInput,
  type UploadAttachmentInput,
  type TicketListInput,
  type RecentFollowUpsInput,
  type FollowUpListInput,
  type RecordingListInput,
  type AttachmentListInput,
  type AssignTicketInput,
  type TakeTicketInput,
  type ReleaseTicketInput,
  type AssignToInput,
  type WatchTicketInput,
  type QueueWatcherInput,
  type QueueAssignmentInput,
  updateInternalNoteInputSchema,
  deleteInternalNoteInputSchema,
  type UpdateInternalNoteInput,
  type DeleteInternalNoteInput,
  displayStatusSchema,
  savedFilterStateSchema,
  savedFilterColorSchema,
  savedFilterRecordSchema,
  type DisplayFilterStatus,
  type SavedFilterState,
  type SavedFilterColor,
  type SavedFilterRecord,
  ticketActionSchema,
  type TicketAction,
  escalationTargetSchema,
  roleIdSchema,
  createNoteTypeInputSchema,
  updateNoteTypeInputSchema,
  type EscalationTarget,
  type CreateNoteTypeInput,
  type UpdateNoteTypeInput,
  REACTION_TYPES,
  type ReactionType,
  reactionTypeSchema,
  toggleReactionInputSchema,
  type ToggleReactionInput,
  type ReactionSummary,
  searchClientsInputSchema,
  type SearchClientsInput,
} from "./schemas/tickets.js";

// --- Knowledge Base schemas ---
export {
  createKbCategoryInputSchema,
  updateKbCategoryInputSchema,
  createKbItemInputSchema,
  updateKbItemInputSchema,
  kbSortFieldSchema,
  kbItemListInputSchema,
  kbSavedFilterStateSchema,
  voteDirectionSchema,
  castVoteInputSchema,
  removeVoteInputSchema,
  uploadKbAttachmentInputSchema,
  downloadKbAttachmentInputSchema,
  listKbAttachmentsInputSchema,
  kbContentTypeSchema,
  KB_ATTACHMENT_MAX_BYTES,
  KB_MAX_ATTACHMENTS_PER_ARTICLE,
  KB_ALLOWED_CONTENT_TYPES,
  type CreateKbCategoryInput,
  type UpdateKbCategoryInput,
  type CreateKbItemInput,
  type UpdateKbItemInput,
  type KbSortField,
  type KbItemListInput,
  type KbSavedFilterState,
  type VoteDirection,
  type CastVoteInput,
  type RemoveVoteInput,
  type UploadKbAttachmentInput,
  type DownloadKbAttachmentInput,
  type ListKbAttachmentsInput,
  type KbAllowedContentType,
  listKbBodiesInputSchema,
  type ListKbBodiesInput,
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

// --- Reports schemas ---
export {
  queueStatSchema,
  monthlyVolumeSchema,
  monthlyResolutionSchema,
  priorityStatSchema,
  type QueueStat,
  type MonthlyVolume,
  type MonthlyResolution,
  type PriorityStat,
} from "./schemas/reports.js";

// --- Branding schemas ---
export {
  saveBrandingFieldInputSchema,
  uploadIconsInputSchema,
  type BrandingField,
  type SaveBrandingFieldInput,
  type UploadIconsInput,
  type BrandingData,
} from "./schemas/branding.js";

// --- Onboarding schemas ---
export {
  bootstrapAdminInputSchema,
  updateOrgBasicsInputSchema,
  validateInviteInputSchema,
  registerFromInviteInputSchema,
  generateInviteInputSchema,
  revokeInviteInputSchema,
  saveTelephonyChoiceInputSchema,
  wrapOrgKeyForUserSchema,
  unwrappedUserSchema,
  type BootstrapAdminInput,
  type UpdateOrgBasicsInput,
  type ValidateInviteInput,
  type RegisterFromInviteInput,
  type GenerateInviteInput,
  type RevokeInviteInput,
  type SaveTelephonyChoiceInput,
  type WrapOrgKeyForUserInput,
  type UnwrappedUser,
} from "./schemas/onboarding.js";

// --- Terminology schemas ---
export {
  terminologyLabelsSchema,
  terminologyConfigSchema,
  TERMINOLOGY_DEFAULTS,
  TERMINOLOGY_DEFAULTS_EN,
  TERMINOLOGY_SUGGESTIONS,
  type TerminologyLabels,
  type TerminologyConfig,
} from "./schemas/terminology.js";
