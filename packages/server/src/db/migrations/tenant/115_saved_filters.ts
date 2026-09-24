// Shared saved filters: org-key-sealed filter name and state.
//
// Each row is owned by one volunteer, readable by anyone with VIEW_CASES.
// The server holds ciphertext for name and state. Color and icon are
// plaintext display metadata (enum values, not PII).
// org_key_generation tracks the key generation at write time for the
// reseal engine.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("saved_filters")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("owner_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("encrypted_name", "bytea", (col) => col.notNull())
    .addColumn("encrypted_state", "bytea", (col) => col.notNull())
    .addColumn("color", "varchar(20)", (col) => col.notNull())
    .addColumn("icon", "varchar(50)", (col) => col.notNull())
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("idx_saved_filters_owner_id")
    .on("saved_filters")
    .column("owner_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("saved_filters").execute();
}
