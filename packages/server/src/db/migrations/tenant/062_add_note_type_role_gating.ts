import type { Kysely } from "kysely";

// Inlined from RoleId.VOLUNTEER to avoid importing the shared barrel.
// Kysely's FileMigrationProvider uses native import(), which cannot resolve
// the .js->.ts extension mapping in the shared barrel's re-exports.
const VOLUNTEER_ROLE_ID = "dXwG0zR9BtJp";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("note_types")
    .addColumn("min_view_role", "text", (col) =>
      col.notNull().defaultTo(VOLUNTEER_ROLE_ID),
    )
    .addColumn("min_create_role", "text", (col) =>
      col.notNull().defaultTo(VOLUNTEER_ROLE_ID),
    )
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("note_types")
    .dropColumn("min_create_role")
    .dropColumn("min_view_role")
    .execute();
}
