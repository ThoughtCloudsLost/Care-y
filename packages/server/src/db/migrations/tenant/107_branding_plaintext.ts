// Moves org branding from encrypted blobs to plaintext columns (ADR-094).
// Nothing is deployed, so there is no data migration or backfill.
// encrypted_terminology, org_public_key, icon blob keys, and
// portal_safe_exit_url are untouched.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("encrypted_name")
    .dropColumn("encrypted_logo")
    .dropColumn("encrypted_primary_color")
    .dropColumn("encrypted_accent_color")
    .dropColumn("encrypted_client_text")
    .dropColumn("encrypted_client_support_label")
    .dropColumn("client_encrypted_branding")
    .execute();

  await db.schema
    .alterTable("org_config")
    .addColumn("name", "text")
    .addColumn("logo", "bytea")
    .addColumn("primary_color", "text")
    .addColumn("accent_color", "text")
    .addColumn("client_text", "text")
    .addColumn("client_support_label", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("name")
    .dropColumn("logo")
    .dropColumn("primary_color")
    .dropColumn("accent_color")
    .dropColumn("client_text")
    .dropColumn("client_support_label")
    .execute();

  await db.schema
    .alterTable("org_config")
    .addColumn("encrypted_name", "bytea")
    .addColumn("encrypted_logo", "bytea")
    .addColumn("encrypted_primary_color", "bytea")
    .addColumn("encrypted_accent_color", "bytea")
    .addColumn("encrypted_client_text", "bytea")
    .addColumn("encrypted_client_support_label", "bytea")
    .addColumn("client_encrypted_branding", "bytea")
    .execute();
}
