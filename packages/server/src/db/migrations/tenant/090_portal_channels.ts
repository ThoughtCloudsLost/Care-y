// Portal channels, portal messages, portal reply key wraps, and column
// additions for the communication tier model.
//
// Five DDL groups:
//   1. portal_channels: per-client portal state. channel_id is the
//      hex lookup handle derived from the seed; auth_hash is the
//      BLAKE2b hash of the bearer token. The partial unique index on
//      (client_id) WHERE status = 'active' enforces one active channel
//      per client at the database level.
//   2. portal_messages: ECIES-encrypted client copies of conversation
//      follow-ups, both directions. Keyed to the channel and linked
//      to the canonical follow-up row.
//   3. portal_reply_key_wraps: per-follow-up sealed-box wrap of the
//      ephemeral tk_temp used by client replies. Consumed and deleted
//      on first volunteer open (ADR-041 convergence).
//   4. clients.communication_tier: text enum column (sms_email default).
//   5. followups.edited_at: nullable timestamp for in-app message edits.
//   6. org_config.portal_safe_exit_url: org-configurable quick-exit URL.

import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // 1. portal_channels
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
    .execute();

  // Partial unique: at most one active channel per client.
  await db.schema
    .createIndex("uq_portal_channels_active_client")
    .on("portal_channels")
    .column("client_id")
    .where(sql.ref("status"), "=", "active")
    .unique()
    .execute();

  // 2. portal_messages
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

  // 3. portal_reply_key_wraps
  await db.schema
    .createTable("portal_reply_key_wraps")
    .addColumn("followup_id", "uuid", (col) =>
      col.primaryKey().references("followups.id").onDelete("cascade"),
    )
    .addColumn("wrapped_tk", "bytea", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // 4. clients.communication_tier
  await db.schema
    .alterTable("clients")
    .addColumn("communication_tier", "text", (col) =>
      col.notNull().defaultTo("sms_email"),
    )
    .execute();

  // 5. followups.edited_at
  await db.schema
    .alterTable("followups")
    .addColumn("edited_at", "timestamptz")
    .execute();

  // 6. org_config.portal_safe_exit_url
  await db.schema
    .alterTable("org_config")
    .addColumn("portal_safe_exit_url", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop column additions (reverse order)
  await db.schema
    .alterTable("org_config")
    .dropColumn("portal_safe_exit_url")
    .execute();

  await db.schema.alterTable("followups").dropColumn("edited_at").execute();

  await db.schema
    .alterTable("clients")
    .dropColumn("communication_tier")
    .execute();

  // Drop tables in reverse dependency order
  await db.schema.dropTable("portal_reply_key_wraps").execute();
  await db.schema.dropTable("portal_messages").execute();
  await db.schema.dropTable("portal_channels").execute();
}
