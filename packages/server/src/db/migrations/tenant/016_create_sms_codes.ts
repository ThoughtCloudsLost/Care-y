// SMS verification codes for 2FA.
// Same structure as email_codes: scrypt-hashed 6-digit code, expiry, attempt tracking.
// Also adds encrypted_sms_phone and sms_phone_hash to two_factor_methods
// for storing the enrolled SMS phone number alongside the method registration.

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("sms_codes")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("code_hash", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("attempts", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("consumed", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createIndex("idx_sms_codes_active")
    .on("sms_codes")
    .columns(["user_id", "consumed", "expires_at"])
    .execute();

  // Store the enrolled SMS phone on the method registration row.
  // Nullable: only populated when method_type = 'sms'.
  // encrypted_sms_phone: FieldEncryptor-encrypted E.164 number.
  // sms_phone_hash: BlindIndexer hash for duplicate detection.
  await db.schema
    .alterTable("two_factor_methods")
    .addColumn("encrypted_sms_phone", "bytea")
    .execute();

  await db.schema
    .alterTable("two_factor_methods")
    .addColumn("sms_phone_hash", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("two_factor_methods")
    .dropColumn("sms_phone_hash")
    .execute();

  await db.schema
    .alterTable("two_factor_methods")
    .dropColumn("encrypted_sms_phone")
    .execute();

  await db.schema.dropTable("sms_codes").execute();
}
