// Backup codes for 2FA recovery.
// 8 codes per user, one-time use, hashed at rest.
// Regeneration: DELETE all for user, INSERT 8 new.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("backup_codes")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("code_hash", "text", (col) => col.notNull())
    .addColumn("is_used", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createIndex("idx_backup_codes_user_id")
    .on("backup_codes")
    .column("user_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("backup_codes").execute();
}
