import type { Kysely } from "kysely";

// Queue-to-fund mapping, org-key sealed like encrypted_color. The server
// never reads which fund a queue maps to. Nullable: a queue without a fund
// preselects nothing.
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("queues")
    .addColumn("encrypted_fund_id", "bytea")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("queues")
    .dropColumn("encrypted_fund_id")
    .execute();
}
