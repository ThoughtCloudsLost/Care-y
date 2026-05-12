import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("invite_tokens")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("token_hash", "bytea", (col) => col.notNull().unique())
    .addColumn("invited_by", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("restrict"),
    )
    .addColumn("encrypted_email", "bytea")
    .addColumn("role_id", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("consumed_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("invite_tokens").execute();
}
