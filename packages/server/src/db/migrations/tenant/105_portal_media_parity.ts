// Portal media parity: recordings gain a file-key wrap column and a
// portal carrier table, mirroring the attachment pattern (ADR-089,
// ADR-092).
//
// Two DDL groups:
//   1. recordings.file_key_wrap: the file key encrypted under the
//      follow-up's key. Null marks the older envelope, where the blob
//      itself is encrypted directly under that key (the same
//      discriminator attachments use, ADR-089).
//   2. portal_recordings: the client's wrap of the same file key,
//      sealed to portal_channels.client_public. One row per channel
//      that may read the recording; the recording itself is stored
//      once, in the blob store, keyed by the recordings row.

import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // 1. recordings.file_key_wrap
  await db.schema
    .alterTable("recordings")
    .addColumn("file_key_wrap", "bytea")
    .execute();

  // 2. portal_recordings
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

  // One wrap per recording per channel.
  await db.schema
    .createIndex("uq_portal_recordings_channel_recording")
    .on("portal_recordings")
    .columns(["channel_id", "recording_id"])
    .unique()
    .execute();

  // The thread reads a channel's recordings in follow-up order.
  await db.schema
    .createIndex("idx_portal_recordings_channel_followup")
    .on("portal_recordings")
    .columns(["channel_id", "followup_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("portal_recordings").execute();

  await db.schema
    .alterTable("recordings")
    .dropColumn("file_key_wrap")
    .execute();
}
