// Tenant schema baseline.
//
// Builds every tenant table and index in its current shape. Columns are
// declared in the order Postgres stores them, so a pg_dump of a schema
// built here matches the schema the earlier incremental migrations
// produced. scripts/verify-migration-baseline.sh checks that match; run it
// after any edit to this file. New schema changes belong in a new
// migration after this one, never here.
//
// Every statement goes through the schema builder so the tenant migrator's
// withSchema() prefixing applies (Kysely #761). The sql fragments below are
// column types, defaults and CHECK expressions that name columns only,
// never tables, so they stay schema-safe.
//
// Tables are created in foreign-key dependency order. Constraint names that
// the old migrations set explicitly are kept verbatim.

import { sql, type Kysely } from "kysely";

// Inlined from RoleId.VOLUNTEER to avoid importing the shared barrel.
// Kysely's FileMigrationProvider uses native import(), which cannot resolve
// the .js->.ts extension mapping in the shared barrel's re-exports.
const VOLUNTEER_ROLE_ID = "dXwG0zR9BtJp";

export async function up(db: Kysely<unknown>): Promise<void> {
  // ── Volunteer accounts and authentication ─────────────────────────

  await db.schema
    .createTable("users")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("identifier_hash", "text", (col) => col.notNull().unique())
    .addColumn("encrypted_identifier", "bytea", (col) => col.notNull())
    .addColumn("password_hash", "text", (col) => col.notNull())
    .addColumn("encrypted_display_name", "bytea", (col) => col.notNull())
    .addColumn("encrypted_notification_addr", "bytea")
    .addColumn("role_id", "text", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("encrypted_preferred_locale", "bytea")
    .addColumn("has_seen_briefing", "boolean", (col) =>
      col.notNull().defaultTo(sql`false`),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    // Set on accounts an administrator creates with a temporary password.
    .addColumn("must_change_password", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();

  await db.schema
    .createIndex("idx_users_identifier_hash")
    .on("users")
    .column("identifier_hash")
    .execute();

  await db.schema
    .createTable("sessions")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("token", "text", (col) => col.notNull().unique())
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("encrypted_ip_address", "bytea", (col) => col.notNull())
    .addColumn("encrypted_user_agent", "bytea", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("twofa_verified", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("webauthn_challenge", "text")
    // HMAC tokens of the IP and user agent, for drift detection.
    .addColumn("ip_token", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("ua_token", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    // Failed second-factor guesses; the verify routes end the session at
    // the per-session cap.
    .addColumn("twofa_failed_attempts", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .execute();

  await db.schema
    .createIndex("idx_sessions_token")
    .on("sessions")
    .column("token")
    .execute();

  await db.schema
    .createIndex("idx_sessions_user_id")
    .on("sessions")
    .column("user_id")
    .execute();

  await db.schema
    .createIndex("idx_sessions_expires_at")
    .on("sessions")
    .column("expires_at")
    .execute();

  await db.schema
    .createTable("user_keys")
    .addColumn("user_id", "uuid", (col) =>
      col.primaryKey().references("users.id").onDelete("cascade"),
    )
    .addColumn("salt", "bytea", (col) => col.notNull())
    .addColumn("vol_public", "bytea")
    .addColumn("pq_public", "bytea") // ML-KEM-768, not yet populated
    .addColumn("key_version", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("rotated_at", "timestamptz")
    .addColumn("rotation_lock", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();

  await db.schema
    .createTable("webauthn_credentials")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("credential_id", "text", (col) => col.notNull().unique())
    .addColumn("public_key", "text", (col) => col.notNull())
    .addColumn("sign_count", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("transports", sql`text[]`)
    .addColumn("device_type", "text")
    .addColumn("backed_up", "boolean", (col) => col.defaultTo(false))
    .addColumn("aaguid", "text")
    .addColumn("ordinal", "integer", (col) => col.notNull())
    // Signature algorithm recorded at registration. No default: every
    // insert states the algorithm.
    .addColumn("algorithm", "text", (col) => col.notNull())
    .addCheckConstraint(
      "webauthn_credentials_valid_algorithm",
      sql`algorithm IN ('ES256', 'RS256')`,
    )
    .execute();

  await db.schema
    .createIndex("idx_webauthn_credentials_user_id")
    .on("webauthn_credentials")
    .column("user_id")
    .execute();

  // At most one confirmed and one pending TOTP secret per user.
  await db.schema
    .createTable("totp_secrets")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("encrypted_secret", "bytea", (col) => col.notNull())
    .addColumn("verified", "boolean", (col) => col.notNull().defaultTo(false))
    .addUniqueConstraint("totp_secrets_user_id_verified_key", [
      "user_id",
      "verified",
    ])
    .execute();

  await db.schema
    .createTable("email_codes")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("code_hash", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("attempts", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("consumed", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createIndex("idx_email_codes_active")
    .on("email_codes")
    .columns(["user_id", "consumed", "expires_at"])
    .execute();

  await db.schema
    .createTable("backup_codes")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("code_hash", "text", (col) => col.notNull())
    .addColumn("is_used", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createIndex("idx_backup_codes_user_id")
    .on("backup_codes")
    .column("user_id")
    .execute();

  await db.schema
    .createTable("two_factor_methods")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("method_type", "text", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    // Populated only when method_type = 'sms'.
    .addColumn("encrypted_sms_phone", "bytea")
    .addColumn("sms_phone_hash", "text")
    .execute();

  await db.schema
    .createIndex("idx_two_factor_methods_unique")
    .unique()
    .on("two_factor_methods")
    .columns(["user_id", "method_type"])
    .execute();

  // Per-volunteer ECIES-wrapped copies of the org secret key.
  await db.schema
    .createTable("wrapped_org_keys")
    .addColumn("user_id", "uuid", (col) =>
      col.primaryKey().references("users.id").onDelete("cascade"),
    )
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull()) // ristretto255, 32 bytes
    .addColumn("wrapped_key", "bytea", (col) => col.notNull())
    .addColumn("nonce", "bytea", (col) => col.notNull()) // 24 bytes
    .addColumn("key_version", "integer", (col) => col.notNull().defaultTo(1))
    .execute();

  await db.schema
    .createTable("sms_codes")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("code_hash", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("attempts", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("consumed", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createIndex("idx_sms_codes_active")
    .on("sms_codes")
    .columns(["user_id", "consumed", "expires_at"])
    .execute();

  // ── Client contact points and clients ─────────────────────────────

  await db.schema
    .createTable("phones")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("phone_hash", "text", (col) => col.notNull())
    .addColumn("encrypted_number", "bytea", (col) => col.notNull())
    .addColumn("locale", "text", (col) => col.notNull().defaultTo("en-US"))
    .addColumn("location_city", "text")
    .addColumn("location_region", "text")
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("phone_match_hash", "text")
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("is_shared_line", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .addColumn("index_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createIndex("phones_phone_hash_idx")
    .on("phones")
    .column("phone_hash")
    .unique()
    .execute();

  await db.schema
    .createTable("emails")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("email_hash", "text", (col) => col.notNull())
    .addColumn("encrypted_address", "bytea", (col) => col.notNull())
    .addColumn("locale", "text", (col) => col.notNull().defaultTo("en-US"))
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("email_match_hash", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("index_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createIndex("emails_email_hash_idx")
    .on("emails")
    .column("email_hash")
    .unique()
    .execute();

  await db.schema
    .createTable("clients")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    // Nullable: web-intake clients have no phone number.
    .addColumn("phone_id", "uuid", (col) =>
      col.references("phones.id").onDelete("restrict"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("merged_into", "uuid", (col) =>
      col.references("clients.id").onDelete("restrict"),
    )
    .addColumn("encrypted_alias", "bytea", (col) => col.notNull())
    // Browser-computed blind index. Nullable so webhook-created rows can
    // exist before a browser computes the hash.
    .addColumn("alias_hash", "text")
    .addColumn("communication_tier", "text", (col) =>
      col.notNull().defaultTo("sms_email"),
    )
    .addColumn("email_id", "uuid", (col) => col.references("emails.id"))
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .addColumn("index_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createIndex("clients_phone_id_idx")
    .on("clients")
    .column("phone_id")
    .execute();

  await db.schema
    .createIndex("clients_alias_hash_idx")
    .on("clients")
    .column("alias_hash")
    .unique()
    .execute();

  // ── Telephony configuration ───────────────────────────────────────

  await db.schema
    .createTable("phone_greetings")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("greeting_type", "text", (col) => col.notNull())
    .addColumn("locale", "text", (col) => col.notNull())
    .addColumn("text", "text", (col) => col.notNull())
    .addColumn("is_audio", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("audio_blob_key", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("phone_number", "text", (col) => col.notNull())
    .addColumn("audio_content_type", "text")
    .execute();

  await db.schema
    .createIndex("phone_greetings_number_locale_type_idx")
    .on("phone_greetings")
    .columns(["phone_number", "locale", "greeting_type"])
    .unique()
    .execute();

  await db.schema
    .createTable("sms_responses")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("response_type", "text", (col) => col.notNull())
    .addColumn("locale", "text", (col) => col.notNull())
    .addColumn("text", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("sms_responses_locale_type_idx")
    .on("sms_responses")
    .columns(["locale", "response_type"])
    .unique()
    .execute();

  // Volunteer reachability. ops_phone_hash is keyed under its own HKDF
  // label, distinct from the client phone index. A shared label would
  // surface volunteer numbers as client merge suggestions (ADR-065).
  // ops_encrypted_phone is present only when the volunteer opts into SMS
  // pings.
  await db.schema
    .createTable("consultants")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().unique().references("users.id").onDelete("restrict"),
    )
    .addColumn("encrypted_phone", "bytea")
    .addColumn("is_verified", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("verification_code_hash", "text")
    .addColumn("verification_expires_at", "timestamptz")
    .addColumn("preferred_call_method", "text", (col) =>
      col.notNull().defaultTo("phone_callback"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("ops_phone_hash", "text")
    .addColumn("ops_encrypted_phone", "bytea")
    .addColumn("sms_pings_enabled", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("verify_sends_hour_start", "timestamptz")
    .addColumn("verify_sends_in_hour", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn("verify_last_sent_at", "timestamptz")
    .addColumn("verification_attempts", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  // ── Queues, note types, org configuration ─────────────────────────

  await db.schema
    .createTable("queues")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("escalate_days", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("encrypted_name", "bytea", (col) => col.notNull())
    .addColumn("sort_order", "integer", (col) => col.notNull())
    // Nullable: clients render a default when absent.
    .addColumn("encrypted_color", "bytea")
    .addColumn("encrypted_icon", "bytea")
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createIndex("queues_sort_order_unique")
    .on("queues")
    .column("sort_order")
    .unique()
    .execute();

  await db.schema
    .createTable("note_types")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("encrypted_name", "bytea", (col) => col.notNull())
    .addColumn("encrypted_icon", "bytea", (col) => col.notNull())
    .addColumn("encrypted_escalation_targets", "bytea", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("requires_on_close", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("encrypted_description", "bytea")
    .addColumn("min_view_role", "text", (col) =>
      col.notNull().defaultTo(VOLUNTEER_ROLE_ID),
    )
    .addColumn("min_create_role", "text", (col) =>
      col.notNull().defaultTo(VOLUNTEER_ROLE_ID),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  // Singleton per tenant.
  await db.schema
    .createTable("org_config")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("pii_retention_days", "integer")
    .addColumn("org_public_key", "bytea") // Curve25519, 32 bytes. Null until first admin onboarding.
    .addColumn("default_country_code", "text", (col) =>
      col.notNull().defaultTo("+1"),
    )
    .addColumn("phone_outbound_sid", "text")
    .addColumn("phone_system_sid", "text")
    .addColumn("recommend_close_days", "integer")
    .addColumn("media_retention_days", "integer", (col) =>
      col.notNull().defaultTo(90),
    )
    .addColumn("media_purge_days", "integer", (col) =>
      col.notNull().defaultTo(30),
    )
    .addColumn("email_from_name", "text", (col) =>
      col.notNull().defaultTo("CARE-Y Hotline"),
    )
    .addColumn("email_from_address", "text", (col) =>
      col.notNull().defaultTo("notify@care-y.app"),
    )
    .addColumn("icon_192_blob_key", "text")
    .addColumn("icon_512_blob_key", "text")
    .addColumn("icon_maskable_blob_key", "text")
    .addColumn("default_note_type_id", "uuid", (col) =>
      col.references("note_types.id"),
    )
    .addColumn("intake_queue_id", "uuid", (col) => col.references("queues.id"))
    .addColumn("default_language", "text", (col) =>
      col.notNull().defaultTo(sql`'en'`),
    )
    .addColumn("getting_started_dismissed_at", "timestamptz")
    .addColumn("encrypted_terminology", "bytea")
    .addColumn("setup_completed", "boolean", (col) =>
      col.notNull().defaultTo(sql`false`),
    )
    // Kill switch for every public intake surface.
    .addColumn("web_intake_enabled", "boolean", (col) =>
      col.notNull().defaultTo(true),
    )
    .addColumn("portal_safe_exit_url", "text")
    // When false, bare /intake renders a not-available state instead of the
    // built-in two-field form.
    .addColumn("builtin_default_enabled", "boolean", (col) =>
      col.defaultTo(sql`true`).notNull(),
    )
    // Per-org client alias suffix counter, advanced with UPDATE ...
    // RETURNING through the query builder.
    .addColumn("next_alias_suffix", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    // Branding is plaintext (ADR-094).
    .addColumn("name", "text")
    .addColumn("logo", "bytea")
    .addColumn("primary_color", "text")
    .addColumn("accent_color", "text")
    .addColumn("client_text", "text")
    .addColumn("client_support_label", "text")
    .addColumn("email_reply_footer", "text")
    .addColumn("channel_sms_enabled", "boolean", (c) =>
      c.notNull().defaultTo(true),
    )
    .addColumn("channel_email_enabled", "boolean", (c) =>
      c.notNull().defaultTo(true),
    )
    .addColumn("channel_secure_link_enabled", "boolean", (c) =>
      c.notNull().defaultTo(true),
    )
    .addColumn("channel_voice_enabled", "boolean", (c) =>
      c.notNull().defaultTo(true),
    )
    .addColumn("channel_share_link_enabled", "boolean", (c) =>
      c.notNull().defaultTo(true),
    )
    // The org's generation pointer. org_key_generation below is the row
    // stamp for this row's own sealed columns.
    .addColumn("current_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  // ── Tickets and follow-ups ────────────────────────────────────────

  await db.schema
    .createTable("tickets")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("client_id", "uuid", (col) =>
      col.notNull().references("clients.id").onDelete("restrict"),
    )
    .addColumn("queue_id", "uuid", (col) =>
      col.notNull().references("queues.id").onDelete("restrict"),
    )
    .addColumn("status", "text", (col) => col.notNull().defaultTo("open"))
    .addColumn("priority", "text", (col) => col.notNull().defaultTo("normal"))
    .addColumn("on_hold", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("assigned_to", "text")
    .addColumn("encrypted_title", "bytea", (col) => col.notNull())
    .addColumn("encrypted_description", "bytea", (col) => col.notNull())
    .addColumn("key_generation", "uuid", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("tickets_client_id_idx")
    .on("tickets")
    .column("client_id")
    .execute();

  await db.schema
    .createIndex("tickets_queue_id_idx")
    .on("tickets")
    .column("queue_id")
    .execute();

  await db.schema
    .createIndex("tickets_status_idx")
    .on("tickets")
    .column("status")
    .execute();

  await db.schema
    .createTable("ticket_key_wraps")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("volunteer_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("restrict"),
    )
    .addColumn("key_generation", "uuid", (col) => col.notNull())
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull())
    .addColumn("nonce", "bytea", (col) => col.notNull())
    .addColumn("wrapped_key", "bytea", (col) => col.notNull())
    .addColumn("algorithm", "text", (col) =>
      col.notNull().defaultTo("ecies-ristretto255-v1"),
    )
    .execute();

  await db.schema
    .createIndex("tkw_unique_wrap")
    .unique()
    .on("ticket_key_wraps")
    .columns(["ticket_id", "volunteer_id", "key_generation"])
    .execute();

  // followups.type is text validated by Zod at the API boundary rather
  // than a Postgres enum, so new follow-up types need no migration.
  await db.schema
    .createTable("followups")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("source", "text", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("is_private", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("mentioned_pseudonyms", "jsonb", (col) =>
      col.notNull().defaultTo(sql`'[]'::jsonb`),
    )
    .addColumn("encrypted_content", "bytea", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("created_by", "uuid", (col) =>
      col.references("users.id").onDelete("restrict"),
    )
    .addColumn("deleted_at", "timestamptz")
    .addColumn("note_type_id", "uuid", (col) => col.references("note_types.id"))
    .addColumn("call_sid", "text")
    .addColumn("call_status", "text")
    .addColumn("call_duration_seconds", "integer")
    .addColumn("key_generation", "uuid")
    .addColumn("event_params", "jsonb")
    .addColumn("edited_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("followups_ticket_id_idx")
    .on("followups")
    .column("ticket_id")
    .execute();

  await db.schema
    .createIndex("followups_ticket_activity_idx")
    .on("followups")
    .columns(["ticket_id", "created_at desc"])
    .execute();

  await db.schema
    .createIndex("idx_followups_note_type_id")
    .on("followups")
    .column("note_type_id")
    .execute();

  await db.schema
    .createIndex("idx_followups_call_sid")
    .unique()
    .on("followups")
    .column("call_sid")
    .where("call_sid", "is not", null)
    .execute();

  // file_key_wrap: the file key encrypted under the follow-up's key. Null
  // marks the older envelope, where the blob itself is encrypted directly
  // under that key (ADR-089).
  await db.schema
    .createTable("recordings")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("followup_id", "uuid", (col) =>
      col.references("followups.id").onDelete("set null"),
    )
    .addColumn("blob_key", "text", (col) => col.notNull())
    .addColumn("size_bytes", "integer", (col) => col.notNull())
    .addColumn("duration_seconds", "integer")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("deleted_at", "timestamptz")
    .addColumn("file_key_wrap", "bytea")
    .execute();

  await db.schema
    .createIndex("recordings_ticket_id_idx")
    .on("recordings")
    .column("ticket_id")
    .execute();

  await db.schema
    .createIndex("recordings_followup_id_idx")
    .on("recordings")
    .column("followup_id")
    .execute();

  await db.schema
    .createTable("attachments")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("followup_id", "uuid", (col) =>
      col.references("followups.id").onDelete("set null"),
    )
    .addColumn("blob_key", "text", (col) => col.notNull())
    .addColumn("size_bytes", "integer", (col) => col.notNull())
    .addColumn("encrypted_filename", "bytea")
    .addColumn("content_type", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("deleted_at", "timestamptz")
    .addColumn("file_key_wrap", "bytea")
    .execute();

  await db.schema
    .createIndex("attachments_ticket_id_idx")
    .on("attachments")
    .column("ticket_id")
    .execute();

  await db.schema
    .createIndex("attachments_followup_id_idx")
    .on("attachments")
    .column("followup_id")
    .execute();

  await db.schema
    .createTable("ticket_dependencies")
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("depends_on_ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("td_unique_dep")
    .on("ticket_dependencies")
    .columns(["ticket_id", "depends_on_ticket_id"])
    .unique()
    .execute();

  await db.schema
    .createTable("preset_replies")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("encrypted_title", "bytea", (col) => col.notNull())
    .addColumn("encrypted_body", "bytea", (col) => col.notNull())
    .addColumn("queue_id", "uuid", (col) =>
      col.references("queues.id").onDelete("set null"),
    )
    .addColumn("created_by", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createTable("client_merge_events")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("primary_client_id", "uuid", (col) =>
      col.notNull().references("clients.id").onDelete("restrict"),
    )
    .addColumn("secondary_client_id", "uuid", (col) =>
      col.notNull().references("clients.id").onDelete("restrict"),
    )
    .addColumn("merged_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("snapshot", "bytea", (col) => col.notNull())
    .addColumn("undo_locked", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("is_undone", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createTable("queue_assignments")
    .addColumn("queue_id", "uuid", (col) =>
      col.notNull().references("queues.id").onDelete("cascade"),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .execute();

  await db.schema
    .createIndex("qa_unique_pair")
    .on("queue_assignments")
    .columns(["queue_id", "user_id"])
    .unique()
    .execute();

  await db.schema
    .createIndex("qa_user_id")
    .on("queue_assignments")
    .column("user_id")
    .execute();

  await db.schema
    .createTable("ticket_watchers")
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .execute();

  await db.schema
    .createIndex("tw_unique_pair")
    .on("ticket_watchers")
    .columns(["ticket_id", "user_id"])
    .unique()
    .execute();

  await db.schema
    .createIndex("tw_user_id")
    .on("ticket_watchers")
    .column("user_id")
    .execute();

  await db.schema
    .createTable("queue_watchers")
    .addColumn("queue_id", "uuid", (col) =>
      col.notNull().references("queues.id").onDelete("cascade"),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .execute();

  await db.schema
    .createIndex("qw_unique_pair")
    .on("queue_watchers")
    .columns(["queue_id", "user_id"])
    .unique()
    .execute();

  await db.schema
    .createIndex("qw_user_id")
    .on("queue_watchers")
    .column("user_id")
    .execute();

  // ── Knowledge base ────────────────────────────────────────────────

  await db.schema
    .createTable("kb_categories")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("encrypted_description", "bytea")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("encrypted_name", "bytea", (col) => col.notNull())
    .addColumn("sort_order", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createIndex("kb_categories_sort_order")
    .on("kb_categories")
    .column("sort_order")
    .unique()
    .execute();

  await db.schema
    .createTable("kb_items")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("category_id", "uuid", (col) =>
      col.notNull().references("kb_categories.id").onDelete("restrict"),
    )
    .addColumn("encrypted_title", "bytea", (col) => col.notNull())
    .addColumn("encrypted_body", "bytea", (col) => col.notNull())
    .addColumn("created_by", "text", (col) => col.notNull())
    .addColumn("vote_up_count", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("vote_down_count", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn("rating", "real", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("encrypted_excerpt", "bytea")
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createIndex("idx_kb_items_category_created")
    .on("kb_items")
    .columns(["category_id", "created_at"])
    .execute();

  await db.schema
    .createIndex("idx_kb_items_rating")
    .on("kb_items")
    .column("rating")
    .execute();

  // voter_id holds the voting user's id verbatim.
  await db.schema
    .createTable("kb_votes")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("kb_item_id", "uuid", (col) =>
      col.notNull().references("kb_items.id").onDelete("cascade"),
    )
    .addColumn("voter_id", "text", (col) => col.notNull())
    .addColumn("direction", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addUniqueConstraint("uq_kb_votes_item_voter", ["kb_item_id", "voter_id"])
    .execute();

  await db.schema
    .createTable("kb_attachments")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("item_id", "uuid", (col) =>
      col.notNull().references("kb_items.id").onDelete("cascade"),
    )
    .addColumn("blob_key", "text", (col) => col.notNull())
    .addColumn("size_bytes", "integer", (col) => col.notNull())
    .addColumn("encrypted_filename", "bytea")
    .addColumn("content_type", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("deleted_at", "timestamptz")
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createIndex("kb_attachments_item_id_idx")
    .on("kb_attachments")
    .column("item_id")
    .execute();

  // ── Notifications, audit, misc per-user state ─────────────────────

  await db.schema
    .createTable("push_subscriptions")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("endpoint", "text", (col) => col.notNull())
    .addColumn("key_p256dh", "text", (col) => col.notNull())
    .addColumn("key_auth", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addUniqueConstraint("push_subscriptions_endpoint_unique", ["endpoint"])
    .execute();

  await db.schema
    .createIndex("push_subscriptions_user_id_idx")
    .on("push_subscriptions")
    .column("user_id")
    .execute();

  await db.schema
    .createTable("audit_log")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("event_type", "text", (col) => col.notNull())
    .addColumn("actor_id", "uuid", (col) => col.notNull())
    .addColumn("ticket_id", "uuid")
    .addColumn("metadata", "jsonb", (col) => col.notNull().defaultTo("{}"))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("audit_log_event_type_idx")
    .on("audit_log")
    .column("event_type")
    .execute();

  await db.schema
    .createIndex("audit_log_actor_id_idx")
    .on("audit_log")
    .column("actor_id")
    .execute();

  await db.schema
    .createIndex("audit_log_ticket_id_idx")
    .on("audit_log")
    .column("ticket_id")
    .execute();

  await db.schema
    .createIndex("audit_log_created_at_idx")
    .on("audit_log")
    .column("created_at")
    .execute();

  await db.schema
    .createTable("push_challenges")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("session_token_hash", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("idx_push_challenges_user_pending")
    .on("push_challenges")
    .columns(["user_id", "status"])
    .where("status", "=", "pending")
    .execute();

  await db.schema
    .createTable("ticket_read_cursors")
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("encrypted_read_cursor", "bytea", (col) => col.notNull())
    .addPrimaryKeyConstraint("ticket_read_cursors_pk", ["ticket_id", "user_id"])
    .execute();

  await db.schema
    .createTable("phone_blocklist")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("phone_hash", "text", (col) => col.notNull().unique())
    .addColumn("encrypted_number", "bytea", (col) => col.notNull())
    .addColumn("added_by", "uuid", (col) =>
      col.notNull().references("users.id"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createIndex("phone_blocklist_phone_hash_idx")
    .on("phone_blocklist")
    .column("phone_hash")
    .execute();

  await db.schema
    .createTable("followup_reactions")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("followup_id", "uuid", (col) =>
      col.notNull().references("followups.id").onDelete("cascade"),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("reaction", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addUniqueConstraint("uq_followup_reactions_user_reaction", [
      "followup_id",
      "user_id",
      "reaction",
    ])
    .execute();

  await db.schema
    .createIndex("idx_followup_reactions_followup")
    .on("followup_reactions")
    .column("followup_id")
    .execute();

  // The invite link is shown once at creation; no sealed copy of the raw
  // token or the invitee's address is kept.
  await db.schema
    .createTable("invite_tokens")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("token_hash", "bytea", (col) => col.notNull().unique())
    .addColumn("invited_by", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("restrict"),
    )
    .addColumn("role_id", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("consumed_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("revoked_at", "timestamptz")
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  // One ECIES envelope per user, sealed to the user's own vol_public. No
  // timestamp column (metadata minimization, ADR-018).
  await db.schema
    .createTable("user_recent_views")
    .addColumn("user_id", "uuid", (col) =>
      col.primaryKey().references("users.id").onDelete("cascade"),
    )
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull()) // ristretto255, 32 bytes
    .addColumn("nonce", "bytea", (col) => col.notNull()) // 24 bytes
    .addColumn("wrapped_payload", "bytea", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("voicemail_quarantine")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("recording_sid", "text", (col) => col.notNull().unique())
    .addColumn("call_sid", "text", (col) => col.notNull())
    .addColumn("blob_key", "text", (col) => col.notNull())
    .addColumn("size_bytes", "integer", (col) => col.notNull())
    .addColumn("duration_seconds", "integer")
    .addColumn("reason", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    .addColumn("client_id", "uuid")
    .addColumn("encrypted_caller_number", "bytea")
    .addColumn("encrypted_called_number", "bytea")
    .addColumn("routed_ticket_id", "uuid")
    .addColumn("routed_followup_id", "uuid")
    .addColumn("resolved_by", "uuid")
    .addColumn("resolved_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  await db.schema
    .createIndex("voicemail_quarantine_status_idx")
    .on("voicemail_quarantine")
    .column("status")
    .execute();

  await db.schema
    .createIndex("voicemail_quarantine_created_at_idx")
    .on("voicemail_quarantine")
    .column("created_at")
    .execute();

  await db.schema
    .createTable("tracked_calls")
    .addColumn("call_sid", "text", (col) => col.primaryKey())
    .addColumn("ticket_id", "uuid")
    .addColumn("user_id", "uuid")
    .addColumn("direction", "text", (col) => col.notNull())
    .addColumn("client_id", "uuid")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("tracked_calls_created_at_idx")
    .on("tracked_calls")
    .column("created_at")
    .execute();

  // Each row is an explicit override. An absent global row means enabled;
  // an absent queue or ticket row inherits from the parent scope. SSE is
  // always delivered and has no channel value here.
  await db.schema
    .createTable("notification_preferences")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("scope_type", "text", (col) => col.notNull())
    .addColumn("scope_id", "uuid")
    .addColumn("event_type", "text", (col) => col.notNull())
    .addColumn("channel", "text", (col) => col.notNull())
    .addColumn("enabled", "boolean", (col) => col.notNull())
    .addUniqueConstraint(
      "notification_preferences_scope_unique",
      ["user_id", "scope_type", "scope_id", "event_type", "channel"],
      (b) => b.nullsNotDistinct(),
    )
    .addCheckConstraint(
      "notification_preferences_valid_scope_type",
      sql`scope_type IN ('global', 'queue', 'ticket')`,
    )
    .addCheckConstraint(
      "notification_preferences_valid_channel",
      sql`channel IN ('push', 'email', 'sms')`,
    )
    // scope_id is NULL exactly when scope_type is 'global'.
    .addCheckConstraint(
      "notification_preferences_scope_id_null_iff_global",
      sql`(scope_type = 'global') = (scope_id IS NULL)`,
    )
    .execute();

  await db.schema
    .createIndex("notification_preferences_dispatch_idx")
    .on("notification_preferences")
    .columns(["user_id", "event_type"])
    .execute();

  await db.schema
    .createTable("escalation_rules")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("queue_id", "uuid", (col) =>
      col.notNull().references("queues.id").onDelete("cascade"),
    )
    .addColumn("rule_type", "text", (col) => col.notNull())
    .addColumn("threshold_minutes", "integer", (col) => col.notNull())
    .addColumn("action", "text", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addCheckConstraint(
      "escalation_rules_valid_rule_type",
      sql`rule_type IN ('unassigned_duration', 'inactive_duration')`,
    )
    .addCheckConstraint(
      "escalation_rules_valid_action",
      sql`action IN ('notify_managers', 'notify_queue_watchers')`,
    )
    // The checker runs every 5 minutes.
    .addCheckConstraint(
      "escalation_rules_min_threshold",
      sql`threshold_minutes >= 5`,
    )
    .execute();

  await db.schema
    .createIndex("escalation_rules_queue_active_idx")
    .on("escalation_rules")
    .columns(["queue_id", "is_active"])
    .execute();

  // Idempotency ledger: each (rule, ticket) pair fires once ever.
  await db.schema
    .createTable("escalation_rule_firings")
    .addColumn("rule_id", "uuid", (col) =>
      col.notNull().references("escalation_rules.id").onDelete("cascade"),
    )
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("fired_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addPrimaryKeyConstraint("escalation_rule_firings_pk", [
      "rule_id",
      "ticket_id",
    ])
    .execute();

  // Deviations from the ROLE_CONFIG defaults. No CHECK on role_id or
  // permission: the valid sets live in code and grow append-only.
  await db.schema
    .createTable("role_permission_overrides")
    .addColumn("role_id", "text", (col) => col.notNull())
    .addColumn("permission", "text", (col) => col.notNull())
    .addColumn("enabled", "boolean", (col) => col.notNull())
    .addPrimaryKeyConstraint("role_permission_overrides_pk", [
      "role_id",
      "permission",
    ])
    .execute();

  // ── Intake forms ──────────────────────────────────────────────────

  await db.schema
    .createTable("intake_forms")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("slug", "text")
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("is_default", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("destination_queue_id", "uuid", (col) =>
      col.references("queues.id"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("encrypted_form_meta", "bytea")
    // Server-enforced closing time, compared against the server clock.
    .addColumn("closes_at", sql`timestamptz`)
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  // At most one default form per org.
  await db.schema
    .createIndex("uq_intake_forms_default")
    .on("intake_forms")
    .column("is_default")
    .where("is_default", "=", true)
    .unique()
    .execute();

  await db.schema
    .createIndex("uq_intake_forms_slug")
    .on("intake_forms")
    .column("slug")
    .unique()
    .execute();

  await db.schema
    .createTable("intake_form_fields")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("form_id", "uuid", (col) =>
      col.notNull().references("intake_forms.id").onDelete("cascade"),
    )
    .addColumn("position", "int2", (col) => col.notNull())
    .addColumn("field_type", "text", (col) => col.notNull())
    .addColumn("role", "text")
    .addColumn("encrypted_label", "bytea", (col) => col.notNull())
    .addColumn("encrypted_config", "bytea", (col) => col.notNull())
    .addColumn("is_required", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("routing_queue_ids", sql`uuid[]`)
    .addColumn("encrypted_escalation_recipient_ids", "bytea")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    // Client-minted key, unique per form so the delete-all and re-insert
    // save strategy can reuse keys.
    .addColumn("field_key", "text", (col) => col.notNull())
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .addUniqueConstraint("uq_form_field_position", ["form_id", "position"])
    .execute();

  await db.schema
    .createIndex("uq_intake_form_fields_key")
    .on("intake_form_fields")
    .columns(["form_id", "field_key"])
    .unique()
    .execute();

  await db.schema
    .createTable("intake_form_responses")
    .addColumn("ticket_id", "uuid", (col) =>
      col.primaryKey().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("form_id", "uuid", (col) =>
      col.notNull().references("intake_forms.id"),
    )
    .addColumn("encrypted_response", "bytea", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("idx_intake_form_responses_form_id")
    .on("intake_form_responses")
    .column("form_id")
    .execute();

  // Interim sealed-box wrap of the ticket key to the org public key,
  // converted to per-volunteer wraps on first volunteer open.
  await db.schema
    .createTable("intake_key_wraps")
    .addColumn("ticket_id", "uuid", (col) =>
      col.primaryKey().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("wrapped_tk", "bytea", (col) => col.notNull())
    .addColumn("algorithm", "text", (col) =>
      col.notNull().defaultTo("sealed-box-org-v1"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  // Single-row org-key-sealed blob of dismissed merge-candidate pairs.
  await db.schema
    .createTable("merge_candidate_dismissals")
    .addColumn("id", "integer", (col) =>
      col
        .primaryKey()
        .defaultTo(sql`1`)
        .check(sql`id = 1`),
    )
    .addColumn("encrypted_dismissals", "bytea", (col) => col.notNull())
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  // ── Client portal ─────────────────────────────────────────────────

  // channel_id is the hex lookup handle derived from the seed; auth_hash is
  // the BLAKE2b hash of the bearer token.
  await db.schema
    .createTable("portal_channels")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("client_id", "uuid", (col) =>
      col.notNull().references("clients.id").onDelete("cascade"),
    )
    .addColumn("channel_id", "text", (col) => col.notNull().unique())
    .addColumn("auth_hash", "bytea", (col) => col.notNull())
    .addColumn("client_public", "bytea", (col) => col.notNull())
    .addColumn("has_passphrase", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("key_check_ephemeral_point", "bytea", (col) => col.notNull())
    .addColumn("key_check_nonce", "bytea", (col) => col.notNull())
    .addColumn("key_check_ciphertext", "bytea", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().defaultTo("active"))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("last_seen_at", "timestamptz")
    .addColumn("last_notified_at", "timestamptz")
    .addColumn("revoked_at", "timestamptz")
    .addColumn("kind", "text", (col) => col.notNull().defaultTo("secure_link"))
    .execute();

  // At most one active channel per client.
  await db.schema
    .createIndex("uq_portal_channels_active_client")
    .on("portal_channels")
    .column("client_id")
    .where(sql.ref("status"), "=", "active")
    .unique()
    .execute();

  await db.schema
    .createTable("portal_messages")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("channel_id", "uuid", (col) =>
      col.notNull().references("portal_channels.id").onDelete("cascade"),
    )
    .addColumn("followup_id", "uuid", (col) =>
      col.notNull().references("followups.id").onDelete("cascade"),
    )
    .addColumn("direction", "text", (col) => col.notNull())
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull())
    .addColumn("nonce", "bytea", (col) => col.notNull())
    .addColumn("ciphertext", "bytea", (col) => col.notNull())
    .addColumn("edited_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("idx_portal_messages_channel_created")
    .on("portal_messages")
    .columns(["channel_id", "created_at"])
    .execute();

  // A channel holds at most one portal copy per follow-up (ADR-092).
  await db.schema
    .createIndex("uq_portal_messages_channel_followup")
    .on("portal_messages")
    .columns(["channel_id", "followup_id"])
    .unique()
    .execute();

  await db.schema
    .createTable("portal_reply_key_wraps")
    .addColumn("followup_id", "uuid", (col) =>
      col.primaryKey().references("followups.id").onDelete("cascade"),
    )
    .addColumn("wrapped_tk", "bytea", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .execute();

  // id is client-minted because the ciphertext is AAD-bound to it, so it
  // has no server default. No created_by column (ADR-018).
  await db.schema
    .createTable("share_links")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("ciphertext", "bytea")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("read_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("idx_share_links_expires_at")
    .on("share_links")
    .column("expires_at")
    .execute();

  // id is client-minted: the browser runs OPRF against it before the row
  // exists. No private key column by design.
  await db.schema
    .createTable("client_accounts")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("client_id", "uuid", (col) =>
      col.notNull().unique().references("clients.id").onDelete("cascade"),
    )
    .addColumn("username_hash", "text", (col) => col.notNull().unique())
    .addColumn("salt", "bytea", (col) => col.notNull())
    .addColumn("public_key", "bytea", (col) => col.notNull())
    .addColumn("auth_hash", "bytea", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // No IP or user agent columns: they would be pure metadata about the
  // highest-risk users.
  await db.schema
    .createTable("client_account_sessions")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("account_id", "uuid", (col) =>
      col.notNull().references("client_accounts.id").onDelete("cascade"),
    )
    .addColumn("token_hash", "bytea", (col) => col.notNull().unique())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createTable("form_assets")
    .addColumn("blob_id", "text", (col) => col.primaryKey())
    .addColumn("blob_key", "text", (col) => col.notNull())
    .addColumn("content_type", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Transactional outbox, written in the same transaction as the event it
  // announces. last_error never holds ciphertext or PII.
  await db.schema
    .createTable("notification_outbox")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("event_type", "text", (col) => col.notNull())
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("queue_id", "uuid", (col) => col.notNull())
    .addColumn("form_id", "uuid")
    .addColumn("actor_user_id", "uuid")
    .addColumn("status", "text", (col) => col.notNull().defaultTo("pending"))
    .addColumn("attempt_count", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("max_attempts", "integer", (col) => col.notNull().defaultTo(5))
    .addColumn("next_attempt_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("completed_at", "timestamptz")
    .addColumn("failed_at", "timestamptz")
    .addColumn("last_error", "text")
    .addColumn("note_type_id", "uuid")
    // OPS-encrypted: mentions form a volunteer interaction graph.
    .addColumn("encrypted_mentioned_pseudonyms", "bytea")
    .addColumn("escalation_rule_id", "uuid")
    .execute();

  await db.schema
    .createIndex("idx_notification_outbox_drain")
    .on("notification_outbox")
    .columns(["status", "next_attempt_at"])
    .execute();

  await db.schema
    .createIndex("idx_notification_outbox_ticket_id")
    .on("notification_outbox")
    .column("ticket_id")
    .execute();

  // The client's wrap of an attachment's file key, sealed to
  // portal_channels.client_public. The file is stored once.
  await db.schema
    .createTable("portal_attachments")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("attachment_id", "uuid", (col) =>
      col.notNull().references("attachments.id").onDelete("cascade"),
    )
    .addColumn("channel_id", "uuid", (col) =>
      col.notNull().references("portal_channels.id").onDelete("cascade"),
    )
    .addColumn("followup_id", "uuid", (col) =>
      col.notNull().references("followups.id").onDelete("cascade"),
    )
    .addColumn("direction", "text", (col) => col.notNull())
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull())
    .addColumn("nonce", "bytea", (col) => col.notNull())
    .addColumn("ciphertext", "bytea", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("uq_portal_attachments_channel_attachment")
    .on("portal_attachments")
    .columns(["channel_id", "attachment_id"])
    .unique()
    .execute();

  await db.schema
    .createIndex("idx_portal_attachments_channel_followup")
    .on("portal_attachments")
    .columns(["channel_id", "followup_id"])
    .execute();

  await db.schema
    .createTable("portal_recordings")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("recording_id", "uuid", (col) =>
      col.notNull().references("recordings.id").onDelete("cascade"),
    )
    .addColumn("channel_id", "uuid", (col) =>
      col.notNull().references("portal_channels.id").onDelete("cascade"),
    )
    .addColumn("followup_id", "uuid", (col) =>
      col.notNull().references("followups.id").onDelete("cascade"),
    )
    .addColumn("direction", "text", (col) => col.notNull())
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull())
    .addColumn("nonce", "bytea", (col) => col.notNull())
    .addColumn("ciphertext", "bytea", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("uq_portal_recordings_channel_recording")
    .on("portal_recordings")
    .columns(["channel_id", "recording_id"])
    .unique()
    .execute();

  await db.schema
    .createIndex("idx_portal_recordings_channel_followup")
    .on("portal_recordings")
    .columns(["channel_id", "followup_id"])
    .execute();

  await db.schema
    .createTable("email_reply_tokens")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("token_hash", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("revoked_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("email_reply_tokens_token_hash_idx")
    .on("email_reply_tokens")
    .column("token_hash")
    .unique()
    .execute();

  await db.schema
    .createIndex("email_reply_tokens_ticket_id_idx")
    .on("email_reply_tokens")
    .column("ticket_id")
    .execute();

  // ── Org key rotation and sealed per-user state ────────────────────

  // One row per generation written by org key rotation. prev_secret_ct,
  // when set, holds the previous generation's secret encrypted under the
  // new one.
  await db.schema
    .createTable("org_key_generations")
    .addColumn("generation", "int2", (col) => col.primaryKey())
    .addColumn("public_key", "bytea", (col) => col.notNull())
    .addColumn("prev_secret_ct", "bytea")
    .addColumn("prev_nonce", "bytea")
    .addColumn("rotated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  // Name and state are org-key sealed; color and icon are plaintext enum
  // values.
  await db.schema
    .createTable("saved_filters")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("owner_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("encrypted_name", "bytea", (col) => col.notNull())
    .addColumn("encrypted_state", "bytea", (col) => col.notNull())
    .addColumn("color", "varchar(20)", (col) => col.notNull())
    .addColumn("icon", "varchar(50)", (col) => col.notNull())
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("idx_saved_filters_owner_id")
    .on("saved_filters")
    .column("owner_id")
    .execute();

  // One ECIES envelope per (user, kind), sealed to the user's own
  // vol_public. No timestamp column (ADR-018).
  await db.schema
    .createTable("user_pref_blobs")
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("kind", "text", (col) => col.notNull())
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull()) // ristretto255, 32 bytes
    .addColumn("nonce", "bytea", (col) => col.notNull()) // 24 bytes
    .addColumn("wrapped_payload", "bytea", (col) => col.notNull())
    .addPrimaryKeyConstraint("user_pref_blobs_pk", ["user_id", "kind"])
    .execute();
}

// Reverse of up(): every table goes, dependents before the tables they
// reference. Indexes and constraints drop with their tables.
const TABLES_IN_CREATION_ORDER = [
  "users",
  "sessions",
  "user_keys",
  "webauthn_credentials",
  "totp_secrets",
  "email_codes",
  "backup_codes",
  "two_factor_methods",
  "wrapped_org_keys",
  "sms_codes",
  "phones",
  "emails",
  "clients",
  "phone_greetings",
  "sms_responses",
  "consultants",
  "queues",
  "note_types",
  "org_config",
  "tickets",
  "ticket_key_wraps",
  "followups",
  "recordings",
  "attachments",
  "ticket_dependencies",
  "preset_replies",
  "client_merge_events",
  "queue_assignments",
  "ticket_watchers",
  "queue_watchers",
  "kb_categories",
  "kb_items",
  "kb_votes",
  "kb_attachments",
  "push_subscriptions",
  "audit_log",
  "push_challenges",
  "ticket_read_cursors",
  "phone_blocklist",
  "followup_reactions",
  "invite_tokens",
  "user_recent_views",
  "voicemail_quarantine",
  "tracked_calls",
  "notification_preferences",
  "escalation_rules",
  "escalation_rule_firings",
  "role_permission_overrides",
  "intake_forms",
  "intake_form_fields",
  "intake_form_responses",
  "intake_key_wraps",
  "merge_candidate_dismissals",
  "portal_channels",
  "portal_messages",
  "portal_reply_key_wraps",
  "share_links",
  "client_accounts",
  "client_account_sessions",
  "form_assets",
  "notification_outbox",
  "portal_attachments",
  "portal_recordings",
  "email_reply_tokens",
  "org_key_generations",
  "saved_filters",
  "user_pref_blobs",
] as const;

export async function down(db: Kysely<unknown>): Promise<void> {
  for (const table of [...TABLES_IN_CREATION_ORDER].reverse()) {
    await db.schema.dropTable(table).execute();
  }
}
