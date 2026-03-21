import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ticket_key_wraps")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("volunteer_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("restrict"),
    )
    .addColumn("key_generation", "uuid", (col) => col.notNull())
    .addColumn("ephemeral_point", "bytea", (col) => col.notNull())
    .addColumn("nonce", "bytea", (col) => col.notNull())
    .addColumn("wrapped_key", "bytea", (col) => col.notNull())
    .addColumn("algorithm", "text", (col) =>
      col.notNull().defaultTo("ecies-ristretto255-v1"),
    )
    .execute();

  await db.schema
    .createIndex("tkw_unique_wrap")
    .unique()
    .on("ticket_key_wraps")
    .columns(["ticket_id", "volunteer_id", "key_generation"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("tkw_unique_wrap").execute();
  await db.schema.dropTable("ticket_key_wraps").execute();
}
