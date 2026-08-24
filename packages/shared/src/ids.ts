/**
 * Branded identifier types.
 *
 * Every identifier in this codebase used to be a bare `string`, so an org UUID,
 * an `org_<uuid>` schema name, a `PN...` provider SID, and an E.164 number were
 * one type as far as the compiler was concerned. Four shipped defects came from
 * that (see ADR-074). These brands make the wrong value fail to compile.
 *
 * Brands are declared with Zod's `.brand()` so one declaration serves both the
 * wire schema and the database column type. `db/types.ts` imports the types;
 * tRPC inputs use the schemas and therefore arrive already branded, with no
 * cast at the boundary.
 *
 * Assignability runs one way only: a branded value is assignable to `string`,
 * so the hundreds of pass-through parameters typed `string` keep compiling. A
 * plain `string` is not assignable to a brand, and one brand is not assignable
 * to another. That asymmetry is the whole mechanism.
 *
 * Two rules for anyone extending this file:
 *
 *   1. Foreign key columns take the brand of the primary key they reference,
 *      never a brand of their own. That is what makes a mismatched `.where()`
 *      predicate a compile error rather than a query that returns nothing.
 *   2. Hash brands are one per key-derivation domain, not one per column. Two
 *      columns filled by the same keyed function share a brand; two columns
 *      filled by deliberately separated functions must not. Merging them would
 *      encode the wrong invariant and make a future violation compile.
 *
 * Mint identifiers through the factories at the bottom of this file rather than
 * casting. A cast onto a brand is the only way to launder a wrong value through
 * this system, so casts are lint-blocked outside this module.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Org identity
//
// The three columns of `public.orgs`, and the origin of the defect class.
// `id` keys the platform tables, `schema_name` names the tenant schema, and
// `slug` is the mutable user-facing handle. All three are strings and all
// three have been passed where another belonged.
// ---------------------------------------------------------------------------

/** `public.orgs.id`. Keys every platform table, `telephony_config` among them. */
export const orgIdSchema = z.uuid().brand<"OrgId">();
export type OrgId = z.infer<typeof orgIdSchema>;

/**
 * `public.orgs.schema_name`, of the form `org_<uuid>`. Names the tenant schema
 * passed to `tenantDb()`. Never a valid value for a `uuid` column: Postgres
 * rejects it outright, which is how the schema-name-passed-as-org-id defect
 * class was first noticed.
 */
export const orgSchemaNameSchema = z
  .string()
  .regex(/^org_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  .brand<"OrgSchema">();
export type OrgSchema = z.infer<typeof orgSchemaNameSchema>;

/**
 * `public.orgs.slug`. Mutable and user-facing, so it must never be used as a
 * cryptographic salt or a stable key. Prefer OrgId wherever identity matters.
 */
export const orgSlugIdSchema = z.string().min(1).brand<"OrgSlug">();
export type OrgSlug = z.infer<typeof orgSlugIdSchema>;

// ---------------------------------------------------------------------------
// Identity and access
// ---------------------------------------------------------------------------

/** `users.id`. Also `*.user_id`, `ticket_key_wraps.volunteer_id`, `audit_log.actor_id`. */
export const userIdSchema = z.uuid().brand<"UserId">();
export type UserId = z.infer<typeof userIdSchema>;

// Role ids are deliberately absent from this file. They are not UUIDs and not
// open-ended: `roles.ts` defines them as a closed set of three opaque values
// with a `RoleIdValue` union and a `z.enum` schema in `schemas/tickets.ts`.
// A union of three literals is strictly stronger than a brand, since it
// constrains the value as well as its provenance, so role columns use
// `RoleIdValue` and branding them would be a downgrade.

/** `sessions.id`, the row key. Not the bearer token, which is `sessions.token`. */
export const sessionIdSchema = z.uuid().brand<"SessionId">();
export type SessionId = z.infer<typeof sessionIdSchema>;

/**
 * `sessions.token`. The bearer credential presented by the client, distinct
 * from the row's `id`. Both are strings on the same row, and looking a session
 * up by the wrong one fails closed but silently.
 */
export const sessionTokenSchema = z.string().min(1).brand<"SessionToken">();
export type SessionToken = z.infer<typeof sessionTokenSchema>;

/**
 * `sessions.ip_token`. Session-binding fingerprint derived from the client IP.
 * Sits directly beside `ua_token` on the same row with the same shape, so the
 * two are interchangeable by eye and by type.
 */
export const ipTokenSchema = z.string().min(1).brand<"IpToken">();
export type IpToken = z.infer<typeof ipTokenSchema>;

/** `sessions.ua_token`. The user-agent counterpart to IpToken. */
export const uaTokenSchema = z.string().min(1).brand<"UaToken">();
export type UaToken = z.infer<typeof uaTokenSchema>;

/** `sessions.webauthn_challenge`. Ephemeral, single-use, never a credential. */
export const webauthnChallengeSchema = z
  .string()
  .min(1)
  .brand<"WebauthnChallenge">();
export type WebauthnChallenge = z.infer<typeof webauthnChallengeSchema>;

/** `invite_tokens.id`. */
export const inviteTokenIdSchema = z.uuid().brand<"InviteTokenId">();
export type InviteTokenId = z.infer<typeof inviteTokenIdSchema>;

// ---------------------------------------------------------------------------
// Two-factor authentication
// ---------------------------------------------------------------------------

/** `webauthn_credentials.id`, the row key. */
export const webauthnCredentialRowIdSchema = z
  .uuid()
  .brand<"WebauthnCredentialRowId">();
export type WebauthnCredentialRowId = z.infer<
  typeof webauthnCredentialRowIdSchema
>;

/**
 * `webauthn_credentials.credential_id`, supplied by the authenticator. Base64url,
 * not a UUID, and not the row key. The two live side by side on the same row.
 */
export const webauthnCredentialIdSchema = z
  .string()
  .min(1)
  .brand<"WebauthnCredentialId">();
export type WebauthnCredentialId = z.infer<typeof webauthnCredentialIdSchema>;

/** `totp_secrets.id`. */
export const totpSecretIdSchema = z.uuid().brand<"TotpSecretId">();
export type TotpSecretId = z.infer<typeof totpSecretIdSchema>;

/** `email_codes.id`. */
export const emailCodeIdSchema = z.uuid().brand<"EmailCodeId">();
export type EmailCodeId = z.infer<typeof emailCodeIdSchema>;

/** `sms_codes.id`. */
export const smsCodeIdSchema = z.uuid().brand<"SmsCodeId">();
export type SmsCodeId = z.infer<typeof smsCodeIdSchema>;

/** `backup_codes.id`. */
export const backupCodeIdSchema = z.uuid().brand<"BackupCodeId">();
export type BackupCodeId = z.infer<typeof backupCodeIdSchema>;

/** `two_factor_methods.id`. */
export const twoFactorMethodIdSchema = z.uuid().brand<"TwoFactorMethodId">();
export type TwoFactorMethodId = z.infer<typeof twoFactorMethodIdSchema>;

/** `push_subscriptions.id`. */
export const pushSubscriptionIdSchema = z.uuid().brand<"PushSubscriptionId">();
export type PushSubscriptionId = z.infer<typeof pushSubscriptionIdSchema>;

/**
 * `push_challenges.id`.
 *
 * The schema is intentionally not re-exported from the package barrel:
 * `schemas/two-factor.ts` already exports a `pushChallengeIdSchema`, which is
 * an object wrapper for a route input rather than the id itself. Two different
 * shapes under one name is how this project got here, so only the type is
 * published and anything needing the raw schema imports it from this module.
 */
export const pushChallengeIdSchema = z.uuid().brand<"PushChallengeId">();
export type PushChallengeId = z.infer<typeof pushChallengeIdSchema>;

// ---------------------------------------------------------------------------
// Clients, phones, and case records
// ---------------------------------------------------------------------------

/**
 * `clients.id`. Also `tickets.client_id`, `portal_channels.client_id`,
 * `client_accounts.client_id`, and both columns of `client_merge_events`.
 *
 * The merge-event pair is the case brands cannot separate: `primary_client_id`
 * and `secondary_client_id` are both ClientId, so swapping them still compiles.
 * Call sites that take both use a named parameter object instead.
 */
export const clientIdSchema = z.uuid().brand<"ClientId">();
export type ClientId = z.infer<typeof clientIdSchema>;

/** `phones.id`, `clients.phone_id`. */
export const phoneIdSchema = z.uuid().brand<"PhoneId">();
export type PhoneId = z.infer<typeof phoneIdSchema>;

/** `queues.id`, and every `*.queue_id` including `org_config.intake_queue_id`. */
export const queueIdSchema = z.uuid().brand<"QueueId">();
export type QueueId = z.infer<typeof queueIdSchema>;

/**
 * `tickets.id`, and every `*.ticket_id`.
 *
 * `ticket_dependencies` holds two of these (`ticket_id`, `depends_on_ticket_id`),
 * which brands cannot tell apart. Those call sites use named parameters.
 */
export const ticketIdSchema = z.uuid().brand<"TicketId">();
export type TicketId = z.infer<typeof ticketIdSchema>;

/** `followups.id`, and every `*.followup_id`. */
export const followupIdSchema = z.uuid().brand<"FollowupId">();
export type FollowupId = z.infer<typeof followupIdSchema>;

/** `note_types.id`, `followups.note_type_id`, `org_config.default_note_type_id`. */
export const noteTypeIdSchema = z.uuid().brand<"NoteTypeId">();
export type NoteTypeId = z.infer<typeof noteTypeIdSchema>;

/** `recordings.id`. */
export const recordingIdSchema = z.uuid().brand<"RecordingId">();
export type RecordingId = z.infer<typeof recordingIdSchema>;

/** `attachments.id`. */
export const attachmentIdSchema = z.uuid().brand<"AttachmentId">();
export type AttachmentId = z.infer<typeof attachmentIdSchema>;

/** `followup_reactions.id`. */
export const followupReactionIdSchema = z.uuid().brand<"FollowupReactionId">();
export type FollowupReactionId = z.infer<typeof followupReactionIdSchema>;

/** `ticket_key_wraps.id`. */
export const ticketKeyWrapIdSchema = z.uuid().brand<"TicketKeyWrapId">();
export type TicketKeyWrapId = z.infer<typeof ticketKeyWrapIdSchema>;

/** `client_merge_events.id`. */
export const clientMergeEventIdSchema = z.uuid().brand<"ClientMergeEventId">();
export type ClientMergeEventId = z.infer<typeof clientMergeEventIdSchema>;

/** `preset_replies.id`. */
export const presetReplyIdSchema = z.uuid().brand<"PresetReplyId">();
export type PresetReplyId = z.infer<typeof presetReplyIdSchema>;

/** `audit_log.id`. */
export const auditLogIdSchema = z.uuid().brand<"AuditLogId">();
export type AuditLogId = z.infer<typeof auditLogIdSchema>;

// ---------------------------------------------------------------------------
// Knowledge base
// ---------------------------------------------------------------------------

/** `kb_categories.id`, `kb_items.category_id`. */
export const kbCategoryIdSchema = z.uuid().brand<"KbCategoryId">();
export type KbCategoryId = z.infer<typeof kbCategoryIdSchema>;

/** `kb_items.id`, `kb_votes.kb_item_id`, `kb_attachments.item_id`. */
export const kbItemIdSchema = z.uuid().brand<"KbItemId">();
export type KbItemId = z.infer<typeof kbItemIdSchema>;

/** `kb_votes.id`. */
export const kbVoteIdSchema = z.uuid().brand<"KbVoteId">();
export type KbVoteId = z.infer<typeof kbVoteIdSchema>;

/** `kb_attachments.id`. */
export const kbAttachmentIdSchema = z.uuid().brand<"KbAttachmentId">();
export type KbAttachmentId = z.infer<typeof kbAttachmentIdSchema>;

// ---------------------------------------------------------------------------
// Storage and crypto lifecycle
// ---------------------------------------------------------------------------

/**
 * A BlobStore object key. Recordings, attachments, KB attachments, quarantined
 * voicemail, greeting audio, and branding icons all hold one, all in columns
 * typed identically. Handing the wrong key to the store returns the wrong file
 * rather than an error, so these are worth keeping apart from row ids.
 */
export const blobKeySchema = z.string().min(1).brand<"BlobKey">();
export type BlobKey = z.infer<typeof blobKeySchema>;

/**
 * A crypto-shred generation marker, shared by `tickets.key_generation`,
 * `followups.key_generation`, and `ticket_key_wraps.key_generation`. The three
 * are compared directly against each other in the rewrap path, which is exactly
 * the cross-table equality that a brand protects.
 */
export const keyGenerationSchema = z.uuid().brand<"KeyGeneration">();
export type KeyGeneration = z.infer<typeof keyGenerationSchema>;

// ---------------------------------------------------------------------------
// Escalation, notifications, and configuration
// ---------------------------------------------------------------------------

/** `escalation_rules.id`, `escalation_rule_firings.rule_id`. */
export const escalationRuleIdSchema = z.uuid().brand<"EscalationRuleId">();
export type EscalationRuleId = z.infer<typeof escalationRuleIdSchema>;

/** `notification_preferences.id`. */
export const notificationPreferenceIdSchema = z
  .uuid()
  .brand<"NotificationPreferenceId">();
export type NotificationPreferenceId = z.infer<
  typeof notificationPreferenceIdSchema
>;

/**
 * `notification_preferences.scope_id`, which is genuinely polymorphic: it holds
 * a queue id when `scope_type` is `"queue"` and a ticket id when it is
 * `"ticket"`. A union rather than a brand of its own, because the value really
 * is one of two things and the discriminant lives in a sibling column.
 */
export type NotificationScopeId = QueueId | TicketId;

/** `org_config.id`. */
export const orgConfigIdSchema = z.uuid().brand<"OrgConfigId">();
export type OrgConfigId = z.infer<typeof orgConfigIdSchema>;

/** `pending_jobs.id`, returned by `JobQueue.enqueue`. */
export const jobIdSchema = z.uuid().brand<"JobId">();
export type JobId = z.infer<typeof jobIdSchema>;

/** `oprf_audit_log.id`. */
export const oprfAuditIdSchema = z.uuid().brand<"OprfAuditId">();
export type OprfAuditId = z.infer<typeof oprfAuditIdSchema>;

// ---------------------------------------------------------------------------
// Intake forms
// ---------------------------------------------------------------------------

/** `intake_forms.id`, `intake_form_fields.form_id`, `intake_form_responses.form_id`. */
export const intakeFormIdSchema = z.uuid().brand<"IntakeFormId">();
export type IntakeFormId = z.infer<typeof intakeFormIdSchema>;

/** `intake_form_fields.id`. */
export const intakeFormFieldIdSchema = z.uuid().brand<"IntakeFormFieldId">();
export type IntakeFormFieldId = z.infer<typeof intakeFormFieldIdSchema>;

// `intake_forms.slug` is deliberately not branded here. A validated
// `intakeFormSlugSchema` already exists in `./schemas/intake-forms.js` with the
// real kebab-case rules, and duplicating it weaker would be worse than leaving
// it plain. Its brand belongs on that schema, appended when the column is
// annotated, so there stays exactly one definition of what a form slug is.

// ---------------------------------------------------------------------------
// Client portal
//
// `portal_channels` carries two identity columns whose names collide across
// tables: its own `channel_id` is the bearer secret, while
// `portal_messages.channel_id` is a foreign key to `portal_channels.id`. Same
// column name, two different value spaces. Separating them here is what stops
// a query from silently matching nothing.
// ---------------------------------------------------------------------------

/** `portal_channels.id`, and `portal_messages.channel_id` which references it. */
export const channelRowIdSchema = z.uuid().brand<"ChannelRowId">();
export type ChannelRowId = z.infer<typeof channelRowIdSchema>;

/**
 * `portal_channels.channel_id`. A random hex bearer token that appears in the
 * client's URL, not a row key. Anything that treats this as a foreign key is
 * a bug, and anything that logs it is a disclosure.
 */
export const channelSecretSchema = z
  .string()
  .regex(/^[0-9a-f]+$/)
  .brand<"ChannelSecret">();
export type ChannelSecret = z.infer<typeof channelSecretSchema>;

/** `portal_messages.id`. */
export const portalMessageIdSchema = z.uuid().brand<"PortalMessageId">();
export type PortalMessageId = z.infer<typeof portalMessageIdSchema>;

/** `client_accounts.id`, `client_account_sessions.account_id`. */
export const clientAccountIdSchema = z.uuid().brand<"ClientAccountId">();
export type ClientAccountId = z.infer<typeof clientAccountIdSchema>;

/** `client_account_sessions.id`. */
export const clientAccountSessionIdSchema = z
  .uuid()
  .brand<"ClientAccountSessionId">();
export type ClientAccountSessionId = z.infer<
  typeof clientAccountSessionIdSchema
>;

/**
 * `share_links.id`. Client-minted and AAD-bound to the share ciphertext, so a
 * substituted id fails the AEAD tag check rather than returning another
 * client's content. Distinct from `share_links.ticket_id`, which is a TicketId.
 */
export const shareIdSchema = z.uuid().brand<"ShareId">();
export type ShareId = z.infer<typeof shareIdSchema>;

// ---------------------------------------------------------------------------
// Telephony
// ---------------------------------------------------------------------------

/** `voicemail_quarantine.id`. */
export const voicemailQuarantineIdSchema = z
  .uuid()
  .brand<"VoicemailQuarantineId">();
export type VoicemailQuarantineId = z.infer<typeof voicemailQuarantineIdSchema>;

/** `consultants.id`. */
export const consultantIdSchema = z.uuid().brand<"ConsultantId">();
export type ConsultantId = z.infer<typeof consultantIdSchema>;

/** `phone_greetings.id`. */
export const phoneGreetingIdSchema = z.uuid().brand<"PhoneGreetingId">();
export type PhoneGreetingId = z.infer<typeof phoneGreetingIdSchema>;

/** `sms_responses.id`. */
export const smsResponseIdSchema = z.uuid().brand<"SmsResponseId">();
export type SmsResponseId = z.infer<typeof smsResponseIdSchema>;

/** `phone_blocklist.id`. */
export const phoneBlocklistIdSchema = z.uuid().brand<"PhoneBlocklistId">();
export type PhoneBlocklistId = z.infer<typeof phoneBlocklistIdSchema>;

/**
 * A provider-issued phone number SID (`PN...` on Twilio, an opaque id on
 * SignalWire). Stored in `org_config.phone_outbound_sid` and
 * `phone_system_sid`. Emphatically not a dialable number: the phone purpose
 * resolver matches these against provisioned numbers, and a normalizer that
 * lets a number stand in as a SID makes that match silently wrong.
 */
export const phoneSidSchema = z.string().min(1).brand<"PhoneSid">();
export type PhoneSid = z.infer<typeof phoneSidSchema>;

/** A provider call SID. `followups.call_sid`, `tracked_calls.call_sid`, `voicemail_quarantine.call_sid`. */
export const callSidSchema = z.string().min(1).brand<"CallSid">();
export type CallSid = z.infer<typeof callSidSchema>;

/** A provider recording SID. `voicemail_quarantine.recording_sid`. */
export const recordingSidSchema = z.string().min(1).brand<"RecordingSid">();
export type RecordingSid = z.infer<typeof recordingSidSchema>;

/**
 * A dialable phone number in E.164 form. No database column holds one in
 * plaintext (numbers are stored encrypted), but service signatures pass them
 * constantly alongside SIDs, which is where the two get confused.
 */
export const e164Schema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/)
  .brand<"E164">();
export type E164 = z.infer<typeof e164Schema>;

// ---------------------------------------------------------------------------
// Keyed digests
//
// One brand per key-derivation domain, not one per column. Columns filled by
// the same keyed function share a brand. Columns filled by deliberately
// separated functions must not, because merging them would make a future
// domain-separation violation compile cleanly.
// ---------------------------------------------------------------------------

/**
 * Blind index over a login identifier, keyed from `OPS_SECRETS_KEY` and salted
 * per org. `users.identifier_hash`.
 */
export const identifierHashSchema = z.string().brand<"IdentifierHash">();
export type IdentifierHash = z.infer<typeof identifierHashSchema>;

/**
 * Blind index over a client portal username. Same indexer as IdentifierHash but
 * a different entity's identity, kept separate so the two cannot be compared.
 * `client_accounts.username_hash`.
 */
export const usernameHashSchema = z.string().brand<"UsernameHash">();
export type UsernameHash = z.infer<typeof usernameHashSchema>;

/**
 * Blind index over a client phone number, shared indexer. `phones.phone_hash`,
 * `phone_blocklist.phone_hash`, `two_factor_methods.sms_phone_hash`. All three
 * are the same domain by design: the blocklist check and the client lookup must
 * agree on the same number.
 */
export const phoneHashSchema = z.string().brand<"PhoneHash">();
export type PhoneHash = z.infer<typeof phoneHashSchema>;

/**
 * Browser-computed HMAC over a normalized phone number, keyed from the org
 * secret under its own HKDF label (ADR-069). The server can neither compute nor
 * invert it. Never interchangeable with PhoneHash, which is OPS-keyed.
 * `phones.phone_match_hash`.
 */
export const phoneMatchHashSchema = z.string().brand<"PhoneMatchHash">();
export type PhoneMatchHash = z.infer<typeof phoneMatchHashSchema>;

/**
 * Browser-computed HMAC over a normalized client alias, under the alias index
 * label. `clients.alias_hash`.
 */
export const aliasHashSchema = z.string().brand<"AliasHash">();
export type AliasHash = z.infer<typeof aliasHashSchema>;

/**
 * Blind index over a volunteer's verified phone, computed with a deliberately
 * separate indexer under ADR-065 so volunteer numbers can never surface as
 * client merge suggestions. Giving this the same brand as PhoneHash would
 * encode the violation into the type system. `consultants.ops_phone_hash`.
 */
export const opsPhoneHashSchema = z.string().brand<"OpsPhoneHash">();
export type OpsPhoneHash = z.infer<typeof opsPhoneHashSchema>;

/**
 * Slow-KDF digest of a user password. Shares no domain with any blind index,
 * and the distinction matters: verifying a password against an HMAC, or
 * indexing on a KDF output, are both security bugs. `users.password_hash`.
 */
export const passwordHashSchema = z.string().brand<"PasswordHash">();
export type PasswordHash = z.infer<typeof passwordHashSchema>;

/**
 * Scrypt digest of a one-time verification code, via the shared code hasher.
 * `email_codes.code_hash`, `sms_codes.code_hash`, `backup_codes.code_hash`.
 */
export const codeHashSchema = z.string().brand<"CodeHash">();
export type CodeHash = z.infer<typeof codeHashSchema>;

/**
 * Digest of a consultant verification code, produced by a separate local
 * function rather than the shared code hasher, so it is its own domain.
 * `consultants.verification_code_hash`.
 */
export const verificationCodeHashSchema = z
  .string()
  .brand<"VerificationCodeHash">();
export type VerificationCodeHash = z.infer<typeof verificationCodeHashSchema>;

/**
 * HMAC of a session token under the push challenge key, binding a challenge to
 * the session that requested it. `push_challenges.session_token_hash`.
 */
export const sessionTokenHashSchema = z.string().brand<"SessionTokenHash">();
export type SessionTokenHash = z.infer<typeof sessionTokenHashSchema>;

/**
 * Keyed digest of a client IP, recorded on OPRF evaluations so brute-force
 * attempts can be correlated without retaining the address itself.
 * `oprf_audit_log.hashed_ip`. Its own domain: never an IpToken, which serves
 * session binding rather than audit.
 */
export const hashedIpSchema = z.string().brand<"HashedIp">();
export type HashedIp = z.infer<typeof hashedIpSchema>;

// ---------------------------------------------------------------------------
// Factories
//
// Identifiers minted in application code go through these rather than a cast,
// so `as` never appears at a mint site. `crypto.randomUUID` is available in
// Node and in browser secure contexts, so one factory serves both packages.
//
// Primary keys the database generates need no factory: they arrive branded from
// the row type.
// ---------------------------------------------------------------------------

function randomId(): string {
  return globalThis.crypto.randomUUID();
}

/** Mint an org id. Server-side, at org creation. */
export function newOrgId(): OrgId {
  return randomId() as OrgId;
}

/** Derive the tenant schema name for an org. The only correct way to build one. */
export function orgSchemaFor(orgId: OrgId): OrgSchema {
  return `org_${orgId}` as OrgSchema;
}

/** Mint a ticket id. Client-minted for intake so the id can be AAD-bound. */
export function newTicketId(): TicketId {
  return randomId() as TicketId;
}

/** Mint a follow-up id. AAD-bound to its content ciphertext. */
export function newFollowupId(): FollowupId {
  return randomId() as FollowupId;
}

/**
 * Mint an optimistic-UI placeholder for a follow-up that has not been
 * persisted yet.
 *
 * The value is `pending-<uuid>` and deliberately violates the UUID shape the
 * FollowupId brand otherwise guarantees: the prefix is how reconciliation
 * recognizes and drops the placeholder once the server row arrives (see
 * create-send-message.svelte.ts). It exists only inside client query caches
 * and must never be sent to the server or parsed with followupIdSchema, both
 * of which reject it.
 */
export function newPendingFollowupId(): FollowupId {
  return `pending-${randomId()}` as FollowupId;
}

/** Mint an attachment id. */
export function newAttachmentId(): AttachmentId {
  return randomId() as AttachmentId;
}

/** Mint a recording id. */
export function newRecordingId(): RecordingId {
  return randomId() as RecordingId;
}

/** Mint a voicemail quarantine id. */
export function newVoicemailQuarantineId(): VoicemailQuarantineId {
  return randomId() as VoicemailQuarantineId;
}

/** Mint a share link id. Client-minted and AAD-bound to the share ciphertext. */
export function newShareId(): ShareId {
  return randomId() as ShareId;
}

/** Mint a client account id. */
export function newClientAccountId(): ClientAccountId {
  return randomId() as ClientAccountId;
}

/**
 * Mint a crypto-shred generation marker.
 *
 * Unlike the id factories above this one does not identify a row, it opens a
 * new generation: every key wrap and follow-up stamped with the value belongs
 * to the same shred cycle and is compared against the others by equality. A
 * ticket and its wraps disagreeing on this value is unrecoverable, so it is
 * minted once per cycle and threaded through rather than regenerated.
 */
export function newKeyGeneration(): KeyGeneration {
  return randomId() as KeyGeneration;
}
