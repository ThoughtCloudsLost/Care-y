import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("icon_192_blob_key", "text")
    .addColumn("icon_512_blob_key", "text")
    .addColumn("icon_maskable_blob_key", "text")
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("icon_192_blob_key")
    .dropColumn("icon_512_blob_key")
    .dropColumn("icon_maskable_blob_key")
    .execute();
}
