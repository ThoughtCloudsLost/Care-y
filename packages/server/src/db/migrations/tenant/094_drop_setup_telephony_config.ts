// Drop org_config.setup_telephony_config.
//
// The column was written by an onboarding endpoint that no client ever
// called, and nothing read it back. The wizard configures telephony through
// the platform telephony_config table instead. The write path is removed
// alongside this migration; the column was empty everywhere.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("setup_telephony_config")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("setup_telephony_config", "bytea")
    .execute();
}
