// TOTP secrets table. One secret per user (UNIQUE on user_id).
// encrypted_secret stored as bytea via FieldEncryptor (server-side crypto_secretbox).
// Server must decrypt to verify TOTP codes.

import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("totp_secrets")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().unique().references("users.id").onDelete("cascade"),
    )
    .addColumn("encrypted_secret", sql`bytea`, (col) => col.notNull())
    .addColumn("verified", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("totp_secrets").execute();
}
