import type { Kysely } from "kysely";

// A system key marks a note type the product itself relies on. Today the
// only one is `disbursement`, the type every disbursement case note carries.
// The key is plaintext because the server has to find the type without the
// org key. Such a type is created once per org and never edited through the
// admin surface.
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("note_types")
    .addColumn("system_key", "text")
    .execute();

  await db.schema
    .createIndex("note_types_system_key_key")
    .unique()
    .on("note_types")
    .column("system_key")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("note_types_system_key_key").execute();
  await db.schema.alterTable("note_types").dropColumn("system_key").execute();
}
