import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("default_note_type_id", "uuid", (col) =>
      col.references("note_types.id"),
    )
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("default_note_type_id")
    .execute();
}
