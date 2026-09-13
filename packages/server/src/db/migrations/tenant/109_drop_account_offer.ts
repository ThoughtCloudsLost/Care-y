// Drops the account_offer column from portal_channels.
// The volunteer-side offer toggle is replaced by self-serve upgrade
// driven by the channel's kind and has_passphrase columns.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("portal_channels")
    .dropColumn("account_offer")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("portal_channels")
    .addColumn("account_offer", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();
}
