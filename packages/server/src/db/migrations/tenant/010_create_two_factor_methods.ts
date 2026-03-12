// Registry of enrolled 2FA methods per user.
// Used by enforcement middleware and method selection UI.
// UNIQUE(user_id, method_type) prevents duplicate enrollments.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("two_factor_methods")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("method_type", "text", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .execute();

  await db.schema
    .createIndex("idx_two_factor_methods_unique")
    .unique()
    .on("two_factor_methods")
    .columns(["user_id", "method_type"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("two_factor_methods").execute();
}
