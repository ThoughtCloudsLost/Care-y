import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("consultants")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().unique().references("users.id").onDelete("restrict"),
    )
    .addColumn("encrypted_phone", "bytea", (col) => col.notNull())
    .addColumn("phone_hash", "text", (col) => col.notNull())
    .addColumn("is_verified", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("verification_code_hash", "text")
    .addColumn("verification_expires_at", "timestamptz")
    .addColumn("preferred_call_method", "text", (col) =>
      col.notNull().defaultTo("phone_callback"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("consultants").execute();
}
