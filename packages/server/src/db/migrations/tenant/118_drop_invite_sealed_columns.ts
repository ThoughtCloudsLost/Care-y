import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // The invite link is shown once, when it is created. Keeping a sealed copy
  // of the raw token let any holder of the org key recover a live link for
  // every pending invite, so the column goes.
  await db.schema
    .alterTable("invite_tokens")
    .dropColumn("encrypted_token")
    .execute();
  // No client ever wrote a sealed invitee email, so the column only ever
  // held nulls. Dropping it removes an unused PII slot from the table.
  await db.schema
    .alterTable("invite_tokens")
    .dropColumn("encrypted_email")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("invite_tokens")
    .addColumn("encrypted_email", "bytea")
    .execute();
  await db.schema
    .alterTable("invite_tokens")
    .addColumn("encrypted_token", "bytea")
    .execute();
}
