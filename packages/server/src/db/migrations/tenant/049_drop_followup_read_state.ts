import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("followups")
    .dropColumn("encrypted_read_state")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("followups")
    .addColumn("encrypted_read_state", "bytea", (col) =>
      col.notNull().defaultTo("unread"),
    )
    .execute();
}
