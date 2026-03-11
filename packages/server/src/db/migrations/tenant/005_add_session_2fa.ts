// Adds 2FA columns to sessions table.
// twofa_verified: false means session has not completed 2FA verification.
// webauthn_challenge: temporary challenge storage for WebAuthn registration/assertion.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("sessions")
    .addColumn("twofa_verified", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();

  await db.schema
    .alterTable("sessions")
    .addColumn("webauthn_challenge", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("sessions")
    .dropColumn("webauthn_challenge")
    .execute();

  await db.schema.alterTable("sessions").dropColumn("twofa_verified").execute();
}
