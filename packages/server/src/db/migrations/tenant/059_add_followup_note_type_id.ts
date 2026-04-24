import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("followups")
    .addColumn("note_type_id", "uuid", (col) => col.references("note_types.id"))
    .execute();

  await db.schema
    .createIndex("idx_followups_note_type_id")
    .on("followups")
    .column("note_type_id")
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropIndex("idx_followups_note_type_id").execute();
  await db.schema.alterTable("followups").dropColumn("note_type_id").execute();
}
