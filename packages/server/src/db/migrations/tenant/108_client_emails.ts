import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("emails")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("email_hash", "text", (col) => col.notNull())
    .addColumn("encrypted_address", "bytea", (col) => col.notNull())
    .addColumn("locale", "text", (col) => col.notNull().defaultTo("en-US"))
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("email_match_hash", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("emails_email_hash_idx")
    .on("emails")
    .column("email_hash")
    .unique()
    .execute();

  await db.schema
    .alterTable("clients")
    .addColumn("email_id", "uuid", (col) => col.references("emails.id"))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("clients").dropColumn("email_id").execute();
  await db.schema.dropIndex("emails_email_hash_idx").execute();
  await db.schema.dropTable("emails").execute();
}
