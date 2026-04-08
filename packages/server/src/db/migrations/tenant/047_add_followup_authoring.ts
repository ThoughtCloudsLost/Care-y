import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("followups")
    .addColumn("created_by", "uuid", (col) =>
      col.references("users.id").onDelete("restrict"),
    )
    .addColumn("deleted_at", "timestamptz")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("followups")
    .dropColumn("created_by")
    .dropColumn("deleted_at")
    .execute();
}
