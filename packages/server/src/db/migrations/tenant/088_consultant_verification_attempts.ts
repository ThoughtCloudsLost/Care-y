// Adds a verification_attempts counter to the consultants table.
// Mirrors the per-code attempt tracking in sms_codes and email_codes:
// wrong-code lockout after MAX_ATTEMPTS (3, matching 2FA code services)
// deletes the code and requires a fresh send.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("consultants")
    .addColumn("verification_attempts", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("consultants")
    .dropColumn("verification_attempts")
    .execute();
}
