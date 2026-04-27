import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .createTable("followup_reactions")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("followup_id", "uuid", (col) =>
      col.notNull().references("followups.id").onDelete("cascade"),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("reaction", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addUniqueConstraint("uq_followup_reactions_user_reaction", [
      "followup_id",
      "user_id",
      "reaction",
    ])
    .execute();

  await db.schema
    .createIndex("idx_followup_reactions_followup")
    .on("followup_reactions")
    .column("followup_id")
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema.dropTable("followup_reactions").execute();
}
