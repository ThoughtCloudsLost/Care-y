// Rename kb_votes.voter_pseudonym to voter_id.
//
// The column stores ctx.user.id verbatim. The old name implied an HMAC-derived
// pseudonym that was never implemented. This rename makes the name honest.
//
// The UNIQUE constraint uq_kb_votes_item_voter on (kb_item_id, voter_pseudonym)
// survives the rename automatically: Postgres tracks constraint columns by
// internal OID, not by name. No constraint recreation needed.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("kb_votes")
    .renameColumn("voter_pseudonym", "voter_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("kb_votes")
    .renameColumn("voter_id", "voter_pseudonym")
    .execute();
}
