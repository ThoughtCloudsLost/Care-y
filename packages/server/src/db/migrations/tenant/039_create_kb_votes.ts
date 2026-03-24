import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("kb_votes")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("kb_item_id", "uuid", (col) =>
      col.notNull().references("kb_items.id").onDelete("cascade"),
    )
    .addColumn("voter_pseudonym", "text", (col) => col.notNull())
    .addColumn("direction", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addUniqueConstraint("uq_kb_votes_item_voter", [
      "kb_item_id",
      "voter_pseudonym",
    ])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("kb_votes").execute();
}
