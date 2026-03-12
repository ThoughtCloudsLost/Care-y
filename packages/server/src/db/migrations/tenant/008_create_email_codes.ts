// Email verification codes for 2FA.
// code_hash: scrypt hash of the 6-digit code.
// expires_at: absolute expiry (set at generation time).
// attempts: max 3 before code is invalidated.
// Rows deleted on successful verification, max attempts, or new code generation.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("email_codes")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("code_hash", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("attempts", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("consumed", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createIndex("idx_email_codes_active")
    .on("email_codes")
    .columns(["user_id", "consumed", "expires_at"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("email_codes").execute();
}
