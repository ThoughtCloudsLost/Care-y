import type { Kysely } from "kysely";
import { RoleId } from "@care-y/shared";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("note_types")
    .addColumn("min_view_role", "text", (col) =>
      col.notNull().defaultTo(RoleId.VOLUNTEER),
    )
    .addColumn("min_create_role", "text", (col) =>
      col.notNull().defaultTo(RoleId.VOLUNTEER),
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
