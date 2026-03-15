import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("oprf_config")
    .addColumn("id", "integer", (col) =>
      col
        .primaryKey()
        .defaultTo(1)
        .check(sql`id = 1`),
    )
    .addColumn("server_a_url", "text", (col) => col.notNull())
    .addColumn("server_b_url", "text", (col) => col.notNull())
    .addColumn("refresh_epoch", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("last_refresh_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("oprf_config").execute();
}
