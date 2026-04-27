import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("followups")
    .addColumn("call_sid", "text")
    .execute();

  await db.schema
    .alterTable("followups")
    .addColumn("call_status", "text")
    .execute();

  await db.schema
    .alterTable("followups")
    .addColumn("call_duration_seconds", "integer")
    .execute();

  await db.schema
    .createIndex("idx_followups_call_sid")
    .unique()
    .on("followups")
    .column("call_sid")
    .where("call_sid", "is not", null)
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropIndex("idx_followups_call_sid").execute();
  await db.schema
    .alterTable("followups")
    .dropColumn("call_duration_seconds")
    .execute();
  await db.schema.alterTable("followups").dropColumn("call_status").execute();
  await db.schema.alterTable("followups").dropColumn("call_sid").execute();
}
