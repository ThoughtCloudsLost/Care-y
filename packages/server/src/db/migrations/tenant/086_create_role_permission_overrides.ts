// Role permission overrides table. Each row records one deviation from
// the hardcoded ROLE_CONFIG defaults: a permission explicitly granted or
// revoked for a role. The table lives in the tenant schema, so org
// isolation is structural (ADR-004 .withSchema() model). No CHECK on
// role_id or permission values because the valid sets live in code and
// grow append-only; a DB CHECK would need a migration per new permission.
// Server-side Zod validation and the read-time merge are the guards.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("role_permission_overrides")
    .addColumn("role_id", "text", (col) => col.notNull())
    .addColumn("permission", "text", (col) => col.notNull())
    .addColumn("enabled", "boolean", (col) => col.notNull())
    .addPrimaryKeyConstraint("role_permission_overrides_pk", [
      "role_id",
      "permission",
    ])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("role_permission_overrides").execute();
}
