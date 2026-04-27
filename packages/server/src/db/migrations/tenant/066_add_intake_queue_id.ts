import type { Kysely } from "kysely";

export async function up(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("intake_queue_id", "uuid", (col) => col.references("queues.id"))
    .execute();
}

export async function down(db: Kysely<never>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("intake_queue_id")
    .execute();
}
