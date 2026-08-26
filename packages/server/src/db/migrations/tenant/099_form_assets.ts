// Form assets: metadata for encrypted blobs serving form rich-text
// images and banners. The blob_id is the UUID portion of the BlobStore
// key, used as the path parameter in the public serving URL.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("form_assets")
    .addColumn("blob_id", "text", (col) => col.primaryKey())
    .addColumn("blob_key", "text", (col) => col.notNull())
    .addColumn("content_type", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo("now()"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("form_assets").ifExists().execute();
}
