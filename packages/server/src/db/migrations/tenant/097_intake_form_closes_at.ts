// Nullable closes_at column on intake_forms.
//
// Server-enforced plaintext timestamp for form closing dates. The server
// compares this against its own clock in resolvePublicForm and
// createIntakeTicket to reject submissions after the closing date.
//
// Plaintext is correct here (code-standards "when adding a timestamp
// column" test): the server must act autonomously to reject submissions
// without any human in the loop.

import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("intake_forms")
    .addColumn("closes_at", sql`timestamptz`)
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("intake_forms").dropColumn("closes_at").execute();
}
