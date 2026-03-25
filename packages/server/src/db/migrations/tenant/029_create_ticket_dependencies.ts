import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ticket_dependencies")
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("depends_on_ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("td_unique_dep")
    .on("ticket_dependencies")
    .columns(["ticket_id", "depends_on_ticket_id"])
    .unique()
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("td_unique_dep").execute();
  await db.schema.dropTable("ticket_dependencies").execute();
}
