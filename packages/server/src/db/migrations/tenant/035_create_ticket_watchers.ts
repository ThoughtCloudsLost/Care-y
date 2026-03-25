import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ticket_watchers")
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .execute();

  await db.schema
    .createIndex("tw_unique_pair")
    .on("ticket_watchers")
    .columns(["ticket_id", "user_id"])
    .unique()
    .execute();

  // Reverse lookup: "which tickets is this user watching?"
  await db.schema
    .createIndex("tw_user_id")
    .on("ticket_watchers")
    .column("user_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("tw_user_id").execute();
  await db.schema.dropIndex("tw_unique_pair").execute();
  await db.schema.dropTable("ticket_watchers").execute();
}
