// Funds: envelope accounting containers (ADR-109).
//
// Everything that describes a fund (name, currency, provider link) sits in
// encrypted_payload, sealed with the org key. The running balance sits in
// encrypted_balance, sealed the same way and rewritten by the client with
// every entry; balance_version is the compare-and-set counter the server
// bumps on each of those writes so two concurrent entries cannot both
// apply against the same starting balance. The row itself says only that
// a fund exists and whether it is active. Funds are deactivated rather than
// deleted, so ledger entries always resolve to a fund.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("funds")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("encrypted_payload", "bytea", (col) => col.notNull())
    .addColumn("encrypted_balance", "bytea", (col) => col.notNull())
    .addColumn("balance_version", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("sort_order", "integer", (col) => col.notNull())
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("funds").execute();
}
