// Share links table: one-time encrypted content links sent by volunteers to
// clients. The ciphertext column is cleared at consume time (read tombstone
// pattern); the row is deleted by the daily cleanup job after expiry.
//
// id is client-minted (crypto.randomUUID) because the ciphertext is AAD-bound
// to the share id. A server-minted id could never match the AAD the browser
// baked in, so no defaultTo(gen_random_uuid()).
//
// No created_by column: authorship lives in the share_link follow-up
// (metadata minimization, ADR-018).

import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("share_links")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("ciphertext", "bytea")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("read_at", "timestamptz")
    .execute();

  // Cleanup job scans by expiry across tenants daily
  await db.schema
    .createIndex("idx_share_links_expires_at")
    .on("share_links")
    .column("expires_at")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("share_links").execute();
}
