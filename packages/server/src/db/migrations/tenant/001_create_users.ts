import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("identifier_hash", "text", (col) => col.notNull().unique())
    .addColumn("encrypted_identifier", sql`bytea`, (col) => col.notNull())
    .addColumn("password_hash", "text", (col) => col.notNull())
    .addColumn("encrypted_display_name", sql`bytea`, (col) => col.notNull())
    .addColumn("encrypted_notification_addr", sql`bytea`)
    .addColumn("role_id", "text", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("idx_users_identifier_hash")
    .on("users")
    .column("identifier_hash")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
