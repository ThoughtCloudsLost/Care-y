// Org-level toggle for the built-in default intake form.
//
// When false, bare /intake renders a not-available state instead of the
// hardcoded two-field fallback. Custom slug routes are unaffected.
// Defaults to true so existing orgs keep current behavior.

import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("builtin_default_enabled", "boolean", (col) =>
      col.defaultTo(sql`true`).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("builtin_default_enabled")
    .execute();
}
