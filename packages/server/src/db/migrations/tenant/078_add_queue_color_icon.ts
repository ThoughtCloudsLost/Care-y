import type { Kysely } from "kysely";

// Queue color and icon, org-key encrypted like encrypted_name (045).
// Nullable: rows created before this migration have no value and clients
// render a default. New queues always supply both (enforced at the API
// input schema; the server cannot produce ciphertext defaults).
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("queues")
    .addColumn("encrypted_color", "bytea")
    .addColumn("encrypted_icon", "bytea")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("queues").dropColumn("encrypted_color").execute();
  await db.schema.alterTable("queues").dropColumn("encrypted_icon").execute();
}
