// Fund ledger: one row per balance record (ADR-109).
//
// The row carries no fund id, no user column and no time of day. The fund,
// signed amount, entry type, exact time and author all live inside
// encrypted_payload, sealed with the org key. entry_date is a date, not a
// timestamptz: inside one transaction Postgres stamps every row with the
// same now(), which would pair a ledger row with the case note written
// beside it. The id is minted by the client so the case note can name it.

import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("fund_ledger")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("encrypted_payload", "bytea", (col) => col.notNull())
    .addColumn("org_key_generation", "int2", (col) =>
      col.notNull().defaultTo(1),
    )
    // CURRENT_DATE is an SQL keyword, not a function, so db.fn cannot
    // produce it. The expression names no table and is schema-safe.
    .addColumn("entry_date", "date", (col) =>
      col.notNull().defaultTo(sql`current_date`),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("fund_ledger").execute();
}
