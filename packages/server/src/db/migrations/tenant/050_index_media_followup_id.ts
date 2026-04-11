import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createIndex("recordings_followup_id_idx")
    .on("recordings")
    .column("followup_id")
    .execute();
  await db.schema
    .createIndex("attachments_followup_id_idx")
    .on("attachments")
    .column("followup_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("recordings_followup_id_idx").execute();
  await db.schema.dropIndex("attachments_followup_id_idx").execute();
}
