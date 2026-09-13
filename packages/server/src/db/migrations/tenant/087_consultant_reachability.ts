// Consultant reachability columns for the volunteer phone verification and
// SMS notification ping flow.
//
// Six new columns support three capabilities:
//   1. ops_phone_hash: a server-side blind index of the verified phone number,
//      keyed under the HKDF label "consultant-phone-index". This label is
//      distinct from the "phone-index" label used by the phones table
//      (client phone numbers). The two domains must never share a label;
//      a shared label would surface volunteer numbers as client merge
//      suggestions (ADR-065 domain separation rationale).
//   2. ops_encrypted_phone: an OPS-tier encrypted copy of the phone number,
//      present only when the volunteer opts into SMS notification pings.
//      This mirrors users.encrypted_notification_addr (also OPS-tier) and
//      carries the same accepted risk: DB + OPS_SECRETS_KEY seizure reveals
//      the number. Opt-in preserves the "server cannot read volunteer
//      numbers" property for everyone who does not want pings.
//   3. sms_pings_enabled + rate-limit state: the opt-in flag and per-user
//      verification rate-limit counters (hourly window + cooldown anchor).
//
// encrypted_phone (the org-tier sealed box) becomes nullable because the
// register flow no longer carries phone fields (ADR-065: single write path).
// The relay verification endpoint writes encrypted_phone, ops_phone_hash,
// and ops_encrypted_phone from one plaintext Buffer in one transaction.
//
// The legacy phone_hash column (client-computed, from migration 021) is
// dropped. No consumer exists in the codebase, no UI ever populated it, and
// no production data exists (CARE-Y does not deploy until all phases land).
// Keeping a dead second hash domain beside the live ops_phone_hash is the
// mixing hazard the blind-index rules exist to prevent (ADR-065).

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Add the six new reachability columns.
  await db.schema
    .alterTable("consultants")
    .addColumn("ops_phone_hash", "text")
    .addColumn("ops_encrypted_phone", "bytea")
    .addColumn("sms_pings_enabled", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("verify_sends_hour_start", "timestamptz")
    .addColumn("verify_sends_in_hour", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn("verify_last_sent_at", "timestamptz")
    .execute();

  // Make encrypted_phone nullable. The register flow no longer provides it;
  // the relay verification endpoint writes it later (ADR-065).
  await db.schema
    .alterTable("consultants")
    .alterColumn("encrypted_phone", (col) => col.dropNotNull())
    .execute();

  // Drop the legacy client-computed hash column (ADR-065).
  await db.schema.alterTable("consultants").dropColumn("phone_hash").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Re-add phone_hash as nullable text. The original NOT NULL constraint
  // from migration 021 cannot be restored without data.
  await db.schema
    .alterTable("consultants")
    .addColumn("phone_hash", "text")
    .execute();

  // Restore encrypted_phone NOT NULL. Rows inserted without a phone since
  // the up() migration will block this if they still exist; down() is a
  // best-effort dev tool, not a production guarantee.
  await db.schema
    .alterTable("consultants")
    .alterColumn("encrypted_phone", (col) => col.setNotNull())
    .execute();

  // Drop the six reachability columns.
  await db.schema
    .alterTable("consultants")
    .dropColumn("ops_phone_hash")
    .dropColumn("ops_encrypted_phone")
    .dropColumn("sms_pings_enabled")
    .dropColumn("verify_sends_hour_start")
    .dropColumn("verify_sends_in_hour")
    .dropColumn("verify_last_sent_at")
    .execute();
}
