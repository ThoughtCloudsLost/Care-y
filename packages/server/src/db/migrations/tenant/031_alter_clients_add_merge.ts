import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("clients")
    .addColumn("merged_into", "uuid", (col) =>
      col.references("clients.id").onDelete("restrict"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("clients").dropColumn("merged_into").execute();
}
