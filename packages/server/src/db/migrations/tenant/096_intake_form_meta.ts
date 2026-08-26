// Nullable encrypted_form_meta column on intake_forms.
//
// Stores an encrypted blob of form-level descriptive content (description,
// submit message, closed message). Encrypted under the client-branding key
// (same tier as per-field encrypted_label/encrypted_config). The server
// stores and returns this blob as-is without decryption.
//
// Storage type is bytea, matching the existing encrypted field columns
// (encrypted_label, encrypted_config) from migration 089.
//
// No back-compat bridges; the product is not deployed and dev DBs reset.

import { type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("intake_forms")
    .addColumn("encrypted_form_meta", "bytea")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("intake_forms")
    .dropColumn("encrypted_form_meta")
    .execute();
}
