// v0.1.3 recorded a disbursement as an internal note of a system note type
// (migration 006): a note_types row whose plaintext system_key let the server
// find the product's own record type in tenant data. The record is now its
// own follow-up type, `disbursement`, written by the fund service alone
// (plan 19, ADR-136 amending ADR-109). This migration retypes those notes,
// removes the system type rows, and drops the key column and its index.
//
// What the rows reveal does not grow. A follow-up typed `disbursement` says
// a case received a fund record, which the system_key join already said.
// The envelope (amount, fund, ledger pointer, note text) stays sealed under
// the ticket key in encrypted_content and is never read here. The deleted
// note_types rows held only sealed names and icons the product created;
// admins could not retire them, so no admin action is lost. A migration runs
// with no actor, so the deletion writes no audit row: it is a schema change,
// not an org-state change made by a person.
//
// Every statement goes through the schema builder or the query builder, so
// the tenant migrator's withSchema() prefixing applies to each object name
// (Kysely #761). No sql fragment appears in this file.
//
// down recreates the column and its unique index only. The retyped rows stay
// `disbursement` and the deleted type rows are not restored, because the
// system type's sealed name and icon cannot be rebuilt without the org key.

import type { Kysely } from "kysely";

interface MigrationDisbursementDb {
  followups: { type: string; note_type_id: string | null };
  note_types: { id: string; system_key: string | null };
}

export async function up(db: Kysely<unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Kysely migrations receive Kysely<unknown>; typed DML requires narrowing (see 014)
  const typedDb = db as unknown as Kysely<MigrationDisbursementDb>;

  // 1. Retype every follow-up that carries a system note type. This reads
  // system_key, so it runs before the type rows and the column go.
  await typedDb
    .updateTable("followups")
    .set({ type: "disbursement", note_type_id: null })
    .where("note_type_id", "in", (eb) =>
      eb
        .selectFrom("note_types")
        .select("id")
        .where("system_key", "is not", null),
    )
    .execute();

  // 2. Remove the system type rows now that no follow-up points at them.
  await typedDb
    .deleteFrom("note_types")
    .where("system_key", "is not", null)
    .execute();

  // 3. Drop the index and column migration 006 added, by the same names.
  await db.schema.dropIndex("note_types_system_key_key").execute();
  await db.schema.alterTable("note_types").dropColumn("system_key").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("note_types")
    .addColumn("system_key", "text")
    .execute();

  await db.schema
    .createIndex("note_types_system_key_key")
    .unique()
    .on("note_types")
    .column("system_key")
    .execute();
}
