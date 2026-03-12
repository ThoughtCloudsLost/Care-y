// WebAuthn credentials table for passkey registration and assertion.
// credential_id and public_key stored as base64url-encoded TEXT.
// sign_count tracks authenticator counter for clone detection.

import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("webauthn_credentials")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("credential_id", "text", (col) => col.notNull().unique())
    .addColumn("public_key", "text", (col) => col.notNull())
    .addColumn("sign_count", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("transports", sql`text[]`)
    .addColumn("device_type", "text")
    .addColumn("backed_up", "boolean", (col) => col.defaultTo(false))
    .addColumn("aaguid", "text")
    .addColumn("ordinal", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("idx_webauthn_credentials_user_id")
    .on("webauthn_credentials")
    .column("user_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("webauthn_credentials").execute();
}
