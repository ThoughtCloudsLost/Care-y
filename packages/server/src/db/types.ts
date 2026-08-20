// Database interfaces. Do NOT overwrite with kysely-codegen output.
// If kysely-codegen is run for verification, its output is comparison-only and never committed.

// PlatformDatabase: tables in the `public` schema (shared across all orgs).
// TenantDatabase: tables in per-org `org_<uuid>` schemas.
// Both interfaces are append-only. Never rename or remove existing entries.

// Type conventions:
//   Generated<T>           - auto-increment or server-generated column (omitted on insert)
//   ColumnType<S,I,U>      - different select/insert/update types
//   Buffer                 - encrypted bytea column

import type { ColumnType, Generated } from "kysely";
import type { TicketStatus, TicketPriority } from "@care-y/shared";

export interface OrgsTable {
  id: Generated<string>;
  slug: string;
  schema_name: string;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  setup_token_hash: Buffer | null;
}

// --- OPRF infrastructure ---

export interface OprfConfigTable {
  id: number;
  server_a_url: string;
  server_b_url: string;
  refresh_epoch: number;
  last_refresh_at: Date | null;
  created_at: Date;
}

export interface OprfAuditLogTable {
  id: Generated<string>;
  user_id: string;
  hashed_ip: string;
  reason: string;
  timestamp: Generated<Date>;
}

// --- Job queue infrastructure ---

export interface PendingJobsTable {
  id: Generated<string>;
  queue: string;
  payload: Record<string, unknown>;
  status: ColumnType<string, string | undefined, string>;
  retry_count: ColumnType<number, number | undefined, number>;
  max_retries: ColumnType<number, number | undefined, number>;
  backoff: ColumnType<string, string | undefined, string>;
  base_delay_ms: ColumnType<number, number | undefined, number>;
  next_attempt: ColumnType<Date, Date | undefined, Date>;
  created_at: ColumnType<Date, Date | undefined, Date>;
  started_at: Date | null;
  completed_at: Date | null;
  failed_at: Date | null;
  error: string | null;
}

// --- Telephony config ---

export interface TelephonyConfigTable {
  org_id: string;
  provider: string;
  config: Buffer; // encrypted JSON blob (nonce || ciphertext)
  key_version: ColumnType<number, number | undefined, number>;
  created_at: ColumnType<Date, Date | undefined, Date>;
  updated_at: ColumnType<Date, Date | undefined, Date>;
}

export interface PlatformDatabase {
  orgs: OrgsTable;
  oprf_config: OprfConfigTable;
  oprf_audit_log: OprfAuditLogTable;
  pending_jobs: PendingJobsTable;
  telephony_config: TelephonyConfigTable;
  vapid_config: VapidConfigTable;
  // Production (deletion_requests)
}

export interface UsersTable {
  id: Generated<string>;
  identifier_hash: string;
  encrypted_identifier: Buffer;
  password_hash: string;
  encrypted_display_name: Buffer;
  encrypted_notification_addr: Buffer | null;
  encrypted_preferred_locale: Buffer | null;
  role_id: string;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  has_seen_briefing: ColumnType<boolean, boolean | undefined, boolean>;
}

export interface SessionsTable {
  id: Generated<string>;
  token: string;
  user_id: string;
  encrypted_ip_address: Buffer;
  encrypted_user_agent: Buffer;
  ip_token: string;
  ua_token: string;
  expires_at: Date;
  twofa_verified: ColumnType<boolean, boolean | undefined, boolean>;
  webauthn_challenge: string | null;
}

export interface OrgConfigTable {
  id: Generated<string>;
  encrypted_name: Buffer | null;
  encrypted_logo: Buffer | null;
  encrypted_primary_color: Buffer | null;
  encrypted_accent_color: Buffer | null;
  encrypted_client_text: Buffer | null;
  client_encrypted_branding: Buffer | null;
  pii_retention_days: number | null;
  org_public_key: Buffer | null; // Curve25519 (32 bytes), null until first admin onboarding
  default_country_code: ColumnType<string, string | undefined, string>;
  phone_outbound_sid: string | null;
  phone_system_sid: string | null;
  recommend_close_days: number | null;
  media_retention_days: ColumnType<number, number | undefined, number>;
  media_purge_days: ColumnType<number, number | undefined, number>;
  // Email branding (notification sender identity per org)
  email_from_name: ColumnType<string, string | undefined, string>;
  email_from_address: ColumnType<string, string | undefined, string>;
  // PWA icon blob keys (ADR-024)
  icon_192_blob_key: string | null;
  icon_512_blob_key: string | null;
  icon_maskable_blob_key: string | null;
  default_language: ColumnType<string, string | undefined, string>;
  setup_telephony_config: Buffer | null; // encrypted JSON blob (nonce || ciphertext), set during wizard
  encrypted_terminology: Buffer | null; // encrypted JSON blob (nonce || ciphertext), per-language labels
  default_note_type_id: string | null;
  intake_queue_id: string | null;
  web_intake_enabled: ColumnType<boolean, boolean | undefined, boolean>;
  getting_started_dismissed_at: ColumnType<
    Date | null,
    Date | null | undefined,
    Date | null
  >;
  setup_completed: ColumnType<boolean, boolean | undefined, boolean>;
  portal_safe_exit_url: string | null;
}

// --- User keys (full interface, replaces UserKeysStubTable) ---
// Stub created with user_id + salt, then extended via ALTER TABLE migration.
export interface UserKeysTable {
  user_id: string;
  salt: Buffer;
  vol_public: Buffer | null; // ristretto255 point (32 bytes), null until first login
  pq_public: Buffer | null; // ML-KEM-768 (1184 bytes), null until PQ phase
  key_version: ColumnType<number, number | undefined, number>;
  rotated_at: Date | null;
  rotation_lock: ColumnType<boolean, boolean | undefined, boolean>;
}

// --- Wrapped org keys (per-volunteer encrypted copies of org secret key) ---
export interface WrappedOrgKeysTable {
  user_id: string;
  ephemeral_point: Buffer; // ristretto255, 32 bytes (ECIES ephemeral public point)
  wrapped_key: Buffer; // ECIES-wrapped org private key
  nonce: Buffer; // 24 bytes
  key_version: ColumnType<number, number | undefined, number>;
}

// --- Ticket key wraps (CREATE TABLE in migration 025) ---
// Each volunteer gets one wrap per ticket per key_generation.
export interface TicketKeyWrapsTable {
  id: Generated<string>;
  ticket_id: string;
  volunteer_id: string;
  key_generation: string; // UUID, groups wraps by crypto-shred/reopen cycle (ADR-018)
  ephemeral_point: Buffer; // ristretto255, 32 bytes
  nonce: Buffer; // 24 bytes
  wrapped_key: Buffer; // ECIES-wrapped ticket key
  algorithm: string; // "ecies-ristretto255-v1"
}

// --- WebAuthn credentials ---
export interface WebauthnCredentialsTable {
  id: Generated<string>;
  user_id: string;
  credential_id: string;
  public_key: string;
  sign_count: ColumnType<number, number | undefined, number>;
  transports: string[] | null;
  device_type: string | null;
  backed_up: ColumnType<boolean, boolean | undefined, boolean>;
  aaguid: string | null;
  ordinal: number;
}

// --- TOTP secrets ---
export interface TotpSecretsTable {
  id: Generated<string>;
  user_id: string;
  encrypted_secret: Buffer;
  verified: ColumnType<boolean, boolean | undefined, boolean>;
}

// --- Email verification codes ---
export interface EmailCodesTable {
  id: Generated<string>;
  user_id: string;
  code_hash: string;
  expires_at: Date;
  attempts: ColumnType<number, number | undefined, number>;
  consumed: ColumnType<boolean, boolean | undefined, boolean>;
}

// --- Backup codes ---
export interface BackupCodesTable {
  id: Generated<string>;
  user_id: string;
  code_hash: string;
  is_used: ColumnType<boolean, boolean | undefined, boolean>;
}

// --- SMS verification codes ---
export interface SmsCodesTable {
  id: Generated<string>;
  user_id: string;
  code_hash: string;
  expires_at: Date;
  attempts: ColumnType<number, number | undefined, number>;
  consumed: ColumnType<boolean, boolean | undefined, boolean>;
}

// --- 2FA method registry ---
export interface TwoFactorMethodsTable {
  id: Generated<string>;
  user_id: string;
  method_type: string;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  encrypted_sms_phone: Buffer | null; // Only populated when method_type = 'sms'
  sms_phone_hash: string | null; // BlindIndexer hash, only when method_type = 'sms'
}

// Telephony data models

export interface PhonesTable {
  id: Generated<string>;
  phone_hash: string;
  encrypted_number: Buffer;
  phone_match_hash: string | null;
  locale: string;
  location_city: string | null;
  location_region: string | null;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface ClientsTable {
  id: Generated<string>;
  encrypted_alias: Buffer;
  alias_hash: string | null;
  phone_id: string | null;
  merged_into: string | null;
  communication_tier: ColumnType<string, string | undefined, string>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface PhoneGreetingsTable {
  id: Generated<string>;
  phone_number: string;
  greeting_type: string;
  locale: string;
  text: string;
  is_audio: ColumnType<boolean, boolean | undefined, boolean>;
  audio_blob_key: string | null;
  audio_content_type: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface SmsResponsesTable {
  id: Generated<string>;
  response_type: string;
  locale: string;
  text: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface ConsultantsTable {
  id: Generated<string>;
  user_id: string;
  encrypted_phone: ColumnType<
    Buffer | null,
    Buffer | null | undefined,
    Buffer | null
  >;
  is_verified: ColumnType<boolean, boolean | undefined, boolean>;
  verification_code_hash: string | null;
  verification_expires_at: Date | null;
  preferred_call_method: string;
  ops_phone_hash: string | null;
  ops_encrypted_phone: Buffer | null;
  sms_pings_enabled: ColumnType<boolean, boolean | undefined, boolean>;
  verify_sends_hour_start: Date | null;
  verify_sends_in_hour: ColumnType<number, number | undefined, number>;
  verify_last_sent_at: Date | null;
  verification_attempts: ColumnType<number, number | undefined, number>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// --- Ticket Data Models ---

export interface QueuesTable {
  id: Generated<string>;
  encrypted_name: Buffer;
  sort_order: number;
  escalate_days: ColumnType<number, number | undefined, number>;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: Generated<Date>;
  encrypted_color: Buffer | null; // org-key sealed picker token, null pre-078
  encrypted_icon: Buffer | null; // org-key sealed picker token, null pre-078
}

export interface TicketsTable {
  id: Generated<string>;
  client_id: string;
  queue_id: string;
  status: ColumnType<TicketStatus, TicketStatus | undefined, TicketStatus>;
  priority: ColumnType<
    TicketPriority,
    TicketPriority | undefined,
    TicketPriority
  >;
  on_hold: ColumnType<boolean, boolean | undefined, boolean>;
  assigned_to: string | null;
  encrypted_title: Buffer;
  encrypted_description: Buffer;
  key_generation: string;
  created_at: Generated<Date>;
}

export interface FollowupsTable {
  id: Generated<string>;
  ticket_id: string;
  source: string;
  type: string;
  is_private: ColumnType<boolean, boolean | undefined, boolean>;
  mentioned_pseudonyms: ColumnType<
    string[],
    string | string[] | undefined,
    string | string[]
  >;
  encrypted_content: Buffer;
  created_by: string | null;
  deleted_at: Date | null;
  created_at: Generated<Date>;
  note_type_id: string | null;
  call_sid: string | null;
  call_status: string | null;
  call_duration_seconds: number | null;
  key_generation: string | null;
  edited_at: Date | null;
  event_params: ColumnType<
    Record<string, unknown> | null,
    Record<string, unknown> | null | undefined,
    Record<string, unknown> | null
  >;
}

export interface RecordingsTable {
  id: Generated<string>;
  ticket_id: string;
  followup_id: string | null;
  blob_key: string;
  size_bytes: number;
  duration_seconds: number | null;
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface AttachmentsTable {
  id: Generated<string>;
  ticket_id: string;
  followup_id: string | null;
  blob_key: string;
  size_bytes: number;
  encrypted_filename: Buffer | null;
  content_type: string | null;
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface TicketDependenciesTable {
  ticket_id: string;
  depends_on_ticket_id: string;
  created_at: Generated<Date>;
}

export interface PresetRepliesTable {
  id: Generated<string>;
  encrypted_title: Buffer;
  encrypted_body: Buffer;
  queue_id: string | null;
  created_by: string;
  created_at: Generated<Date>;
}

export interface ClientMergeEventsTable {
  id: Generated<string>;
  primary_client_id: string;
  secondary_client_id: string;
  merged_at: Generated<Date>;
  snapshot: Buffer;
  undo_locked: ColumnType<boolean, boolean | undefined, boolean>;
  is_undone: ColumnType<boolean, boolean | undefined, boolean>;
}

// --- Knowledge Base ---

export interface KBCategoriesTable {
  id: Generated<string>;
  encrypted_name: Buffer;
  sort_order: number;
  encrypted_description: Buffer | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface KBItemsTable {
  id: Generated<string>;
  category_id: string;
  encrypted_title: Buffer;
  encrypted_body: Buffer;
  encrypted_excerpt: Buffer | null;
  created_by: string;
  vote_up_count: ColumnType<number, number | undefined, number>;
  vote_down_count: ColumnType<number, number | undefined, number>;
  rating: ColumnType<number, number | undefined, number>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface KBVotesTable {
  id: Generated<string>;
  kb_item_id: string;
  voter_pseudonym: string;
  direction: string;
  created_at: Generated<Date>;
}

export interface KBAttachmentsTable {
  id: Generated<string>;
  item_id: string;
  blob_key: string;
  size_bytes: number;
  encrypted_filename: Buffer | null;
  content_type: string | null;
  created_at: Generated<Date>;
  deleted_at: Date | null;
}

export interface QueueAssignmentsTable {
  queue_id: string;
  user_id: string;
}

export interface TicketWatchersTable {
  ticket_id: string;
  user_id: string;
}

export interface QueueWatchersTable {
  queue_id: string;
  user_id: string;
}

// --- Push notifications ---

export interface PushSubscriptionsTable {
  id: Generated<string>;
  user_id: string;
  endpoint: string;
  key_p256dh: string;
  key_auth: string;
  created_at: Generated<Date>;
}

// --- Push 2FA challenges ---

export interface PushChallengesTable {
  id: Generated<string>;
  user_id: string;
  session_token_hash: string; // HMAC-SHA256 of the session token
  status: string; // 'pending' | 'approved' | 'denied' | 'expired'
  expires_at: Date;
}

// --- Read cursors ---

export interface TicketReadCursorsTable {
  ticket_id: string;
  user_id: string;
  encrypted_read_cursor: Buffer;
}

// --- Phone blocklist ---

export interface PhoneBlocklistTable {
  id: Generated<string>;
  phone_hash: string;
  encrypted_number: Buffer;
  added_by: string;
  created_at: ColumnType<Date, Date | undefined, never>;
}

// --- Note types (internal note categorization + escalation routing) ---

export interface NoteTypesTable {
  id: Generated<string>;
  encrypted_name: Buffer;
  encrypted_icon: Buffer;
  encrypted_description: Buffer | null;
  encrypted_escalation_targets: Buffer;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  requires_on_close: ColumnType<boolean, boolean | undefined, boolean>;
  min_view_role: ColumnType<string, string | undefined, string>;
  min_create_role: ColumnType<string, string | undefined, string>;
  created_at: Generated<Date>;
}

export interface FollowupReactionsTable {
  id: Generated<string>;
  followup_id: string;
  user_id: string;
  reaction: string;
  created_at: Generated<Date>;
}

// --- Audit log ---

export interface AuditLogTable {
  id: Generated<string>;
  event_type: string;
  actor_id: string;
  ticket_id: string | null;
  metadata: Record<string, unknown>;
  created_at: Generated<Date>;
}

// --- VAPID (platform-wide Web Push identity) ---

export interface VapidConfigTable {
  id: number;
  public_key: string; // base64url-encoded P-256 uncompressed public key
  encrypted_private_key: Buffer; // nonce(24) || ciphertext (SecretsEncryptor format)
  key_version: ColumnType<number, number | undefined, number>;
  created_at: Generated<Date>;
}

// --- Invite tokens (onboarding) ---
export interface InviteTokensTable {
  id: Generated<string>;
  token_hash: Buffer;
  invited_by: string;
  encrypted_email: Buffer | null;
  role_id: string;
  expires_at: Date;
  consumed_at: Date | null;
  revoked_at: Date | null;
  encrypted_token: Buffer | null;
  created_at: Generated<Date>;
}

// --- Recently viewed history (per-user encrypted blob) ---
// Single ECIES envelope sealed to the user's own vol_public. The server
// stores ciphertext only; recency ordering lives inside the payload.
// No timestamp column (metadata minimization, ADR-018).
export interface UserRecentViewsTable {
  user_id: string;
  ephemeral_point: Buffer; // ristretto255, 32 bytes
  nonce: Buffer; // 24 bytes
  wrapped_payload: Buffer;
}

// --- Voicemail quarantine ---

export interface VoicemailQuarantineTable {
  id: Generated<string>;
  recording_sid: string;
  call_sid: string;
  blob_key: string;
  size_bytes: number;
  duration_seconds: number | null;
  reason: string;
  status: ColumnType<string, string | undefined, string>;
  client_id: string | null;
  encrypted_caller_number: Buffer | null;
  encrypted_called_number: Buffer | null;
  routed_ticket_id: string | null;
  routed_followup_id: string | null;
  resolved_by: string | null;
  resolved_at: Date | null;
  created_at: Generated<Date>;
}

// --- Tracked calls ---

export interface TrackedCallsTable {
  call_sid: string;
  ticket_id: string | null;
  user_id: string | null;
  direction: string;
  client_id: string | null;
  created_at: Generated<Date>;
}

// --- Notification preferences ---

export interface NotificationPreferencesTable {
  id: Generated<string>;
  user_id: string;
  scope_type: string;
  scope_id: string | null;
  event_type: string;
  channel: string;
  enabled: boolean;
}

// --- Escalation rules ---

export interface EscalationRulesTable {
  id: Generated<string>;
  queue_id: string;
  rule_type: string;
  threshold_minutes: number;
  action: string;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: Generated<Date>;
}

export interface EscalationRuleFiringsTable {
  rule_id: string;
  ticket_id: string;
  fired_at: Generated<Date>;
}

// --- Role permission overrides ---

export interface RolePermissionOverridesTable {
  role_id: string;
  permission: string;
  enabled: boolean;
}

// --- Intake forms (dynamic form definitions + responses + interim key wraps) ---

export interface IntakeFormsTable {
  id: Generated<string>;
  name: string;
  slug: string | null;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  is_default: ColumnType<boolean, boolean | undefined, boolean>;
  destination_queue_id: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface IntakeFormFieldsTable {
  id: Generated<string>;
  form_id: string;
  position: number;
  field_type: string;
  role: string | null;
  encrypted_label: Buffer;
  encrypted_config: Buffer;
  is_required: ColumnType<boolean, boolean | undefined, boolean>;
  routing_queue_ids: string[] | null;
  encrypted_escalation_recipient_ids: Buffer | null;
  created_at: Generated<Date>;
}

// --- Merge candidate dismissals (org-key-sealed blob) ---

export interface MergeCandidateDismissalsTable {
  id: ColumnType<number, number | undefined, never>;
  encrypted_dismissals: Buffer;
  updated_at: Generated<Date>;
}

export interface IntakeFormResponsesTable {
  ticket_id: string;
  form_id: string;
  encrypted_response: Buffer;
  created_at: Generated<Date>;
}

export interface IntakeKeyWrapsTable {
  ticket_id: string;
  wrapped_tk: Buffer;
  algorithm: Generated<string>;
  created_at: Generated<Date>;
}

// --- Share links (one-time encrypted content links) ---

export interface ShareLinksTable {
  id: string;
  ticket_id: string;
  ciphertext: Buffer | null;
  created_at: Generated<Date>;
  expires_at: Date;
  read_at: Date | null;
}

// --- Portal channels (communication tier, encrypted client copies) ---

export interface PortalChannelsTable {
  id: Generated<string>;
  client_id: string;
  channel_id: string;
  auth_hash: Buffer;
  client_public: Buffer;
  has_passphrase: ColumnType<boolean, boolean | undefined, boolean>;
  key_check_ephemeral_point: Buffer;
  key_check_nonce: Buffer;
  key_check_ciphertext: Buffer;
  status: ColumnType<string, string | undefined, string>;
  kind: ColumnType<string, string | undefined, string>;
  account_offer: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: Generated<Date>;
  last_seen_at: Date | null;
  last_notified_at: Date | null;
  revoked_at: Date | null;
}

export interface PortalMessagesTable {
  id: Generated<string>;
  channel_id: string;
  followup_id: string;
  direction: string;
  ephemeral_point: Buffer;
  nonce: Buffer;
  ciphertext: Buffer;
  edited_at: Date | null;
  created_at: Generated<Date>;
}

export interface PortalReplyKeyWrapsTable {
  followup_id: string;
  wrapped_tk: Buffer;
  created_at: Generated<Date>;
}

// --- Client accounts (encrypted account portal) ---

export interface ClientAccountsTable {
  id: string; // client-minted UUID; OPRF runs against this before the row exists
  client_id: string;
  username_hash: string;
  salt: Buffer;
  public_key: Buffer;
  auth_hash: Buffer;
  created_at: Generated<Date>;
}

export interface ClientAccountSessionsTable {
  id: Generated<string>;
  account_id: string;
  token_hash: Buffer;
  expires_at: Date;
  created_at: Generated<Date>;
}

export interface TenantDatabase {
  users: UsersTable;
  sessions: SessionsTable;
  org_config: OrgConfigTable;
  user_keys: UserKeysTable;
  webauthn_credentials: WebauthnCredentialsTable;
  totp_secrets: TotpSecretsTable;
  email_codes: EmailCodesTable;
  sms_codes: SmsCodesTable;
  backup_codes: BackupCodesTable;
  two_factor_methods: TwoFactorMethodsTable;
  wrapped_org_keys: WrappedOrgKeysTable;
  ticket_key_wraps: TicketKeyWrapsTable;
  // Telephony data models
  phones: PhonesTable;
  clients: ClientsTable;
  phone_greetings: PhoneGreetingsTable;
  sms_responses: SmsResponsesTable;
  consultants: ConsultantsTable;
  // Ticket data models
  queues: QueuesTable;
  tickets: TicketsTable;
  followups: FollowupsTable;
  recordings: RecordingsTable;
  attachments: AttachmentsTable;
  ticket_dependencies: TicketDependenciesTable;
  preset_replies: PresetRepliesTable;
  client_merge_events: ClientMergeEventsTable;
  // Knowledge Base
  kb_categories: KBCategoriesTable;
  kb_items: KBItemsTable;
  kb_votes: KBVotesTable;
  kb_attachments: KBAttachmentsTable;
  // Workflow join tables
  queue_assignments: QueueAssignmentsTable;
  ticket_watchers: TicketWatchersTable;
  queue_watchers: QueueWatchersTable;
  // Read state
  ticket_read_cursors: TicketReadCursorsTable;
  // Notifications
  push_subscriptions: PushSubscriptionsTable;
  push_challenges: PushChallengesTable;
  audit_log: AuditLogTable;
  phone_blocklist: PhoneBlocklistTable;
  // Note types (internal note categorization)
  note_types: NoteTypesTable;
  followup_reactions: FollowupReactionsTable;
  // Onboarding
  invite_tokens: InviteTokensTable;
  // Recently viewed history
  user_recent_views: UserRecentViewsTable;
  // Voicemail quarantine
  voicemail_quarantine: VoicemailQuarantineTable;
  tracked_calls: TrackedCallsTable;
  // Notification preferences
  notification_preferences: NotificationPreferencesTable;
  // Escalation rules
  escalation_rules: EscalationRulesTable;
  escalation_rule_firings: EscalationRuleFiringsTable;
  // Role permission overrides
  role_permission_overrides: RolePermissionOverridesTable;
  // Shifts (shifts, shift_occurrences)
  // Intake forms
  intake_forms: IntakeFormsTable;
  intake_form_fields: IntakeFormFieldsTable;
  intake_form_responses: IntakeFormResponsesTable;
  intake_key_wraps: IntakeKeyWrapsTable;
  // Merge candidate dismissals
  merge_candidate_dismissals: MergeCandidateDismissalsTable;
  // Client portal
  portal_channels: PortalChannelsTable;
  portal_messages: PortalMessagesTable;
  portal_reply_key_wraps: PortalReplyKeyWrapsTable;
  // Client portal (share links)
  share_links: ShareLinksTable;
  // Client accounts (encrypted account portal)
  client_accounts: ClientAccountsTable;
  client_account_sessions: ClientAccountSessionsTable;
}
