// Adds the org-settable name clients see above messages from the
// organization. Without it every portal reads the same generic words for
// every org.
//
// The value is ciphertext the browser produces and the browser reads; the
// server only stores and returns the bytes. It also rides the public
// branding blob so the portal can show it before any account exists, the
// same way encrypted_client_text does.
//
// Org-level by construction: this is a single column on org_config, so it
// cannot resolve to a volunteer pseudonym or any per-person identity. The
// portal thread renders no speaker identity and that does not change.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("encrypted_client_support_label", "bytea")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("encrypted_client_support_label")
    .execute();
}
