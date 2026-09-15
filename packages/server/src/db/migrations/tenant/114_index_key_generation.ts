// Blind-index key generation stamp for duplicate-detection hash columns.
//
// After org key rotation, the three blind indexes (alias_hash,
// phone_match_hash, email_match_hash) are HMAC'd client-side under keys
// derived from the org secret. Rotation silently invalidates them: stale
// hashes produce missing matches, never false ones, and nothing throws.
//
// This stamp is deliberately separate from org_key_generation: a row's
// sealed ciphertext and its blind index can be current at different
// moments, and one stamp would let either hide the other from the sweep.

import type { Kysely } from "kysely";

const INDEX_STAMPED_TABLES = ["clients", "phones", "emails"] as const;

export async function up(db: Kysely<unknown>): Promise<void> {
  for (const table of INDEX_STAMPED_TABLES) {
    await db.schema
      .alterTable(table)
      .addColumn("index_key_generation", "int2", (col) =>
        col.notNull().defaultTo(1),
      )
      .execute();
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  for (const table of [...INDEX_STAMPED_TABLES].reverse()) {
    await db.schema
      .alterTable(table)
      .dropColumn("index_key_generation")
      .execute();
  }
}
