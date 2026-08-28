// Portal attachments store a file once and wrap its key per reader.
//
// Two DDL groups:
//   1. attachments.file_key_wrap: the file key encrypted under the
//      follow-up's key. Null marks the older envelope, where the blob
//      itself is encrypted directly under that key, which is what MMS
//      ingest still writes. Every read path branches on this column
//      rather than inferring the envelope from where the row came from
//      (ADR-089).
//   2. portal_attachments: the client's wrap of the same file key,
//      sealed to portal_channels.client_public, carrying the filename in
//      the same sealed payload. One row per channel that may read the
//      file; the file itself is stored once, in the blob store, keyed by
//      the attachments row.

import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // 1. attachments.file_key_wrap
  await db.schema
    .alterTable("attachments")
    .addColumn("file_key_wrap", "bytea")
    .execute();

  // 2. portal_attachments
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

  // One wrap per file per channel. A second row would be a second answer
  // to "which key opens this for this reader", and the download path
  // would have no way to choose.
  await db.schema
    .createIndex("uq_portal_attachments_channel_attachment")
    .on("portal_attachments")
    .columns(["channel_id", "attachment_id"])
    .unique()
    .execute();

  // The thread reads a channel's files in follow-up order.
  await db.schema
    .createIndex("idx_portal_attachments_channel_followup")
    .on("portal_attachments")
    .columns(["channel_id", "followup_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("portal_attachments").execute();

  await db.schema
    .alterTable("attachments")
    .dropColumn("file_key_wrap")
    .execute();
}
