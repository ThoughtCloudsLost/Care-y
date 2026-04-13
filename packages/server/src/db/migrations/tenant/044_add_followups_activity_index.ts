import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createIndex("followups_ticket_activity_idx")
    .on("followups")
    .columns(["ticket_id", "created_at desc"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("followups_ticket_activity_idx").execute();
}
