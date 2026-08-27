// Extends the notification_outbox table for ticket lifecycle events.
//
// New columns:
//   note_type_id                    - nullable UUID, escalation context for
//                                     followup_added events with note type
//   encrypted_mentioned_pseudonyms  - nullable bytea, OPS-encrypted JSON array
//                                     of mentioned user IDs. Encrypted because
//                                     mentioned pseudonyms create a volunteer
//                                     interaction graph on the ticket. The
//                                     server decrypts transiently at drain time.
//   escalation_rule_id              - nullable UUID, for rule-based escalation
//                                     events (references escalation_rules)

import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("notification_outbox")
    .addColumn("note_type_id", "uuid")
    .execute();

  await db.schema
    .alterTable("notification_outbox")
    .addColumn("encrypted_mentioned_pseudonyms", "bytea")
    .execute();

  await db.schema
    .alterTable("notification_outbox")
    .addColumn("escalation_rule_id", "uuid")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("notification_outbox")
    .dropColumn("note_type_id")
    .execute();

  await db.schema
    .alterTable("notification_outbox")
    .dropColumn("encrypted_mentioned_pseudonyms")
    .execute();

  await db.schema
    .alterTable("notification_outbox")
    .dropColumn("escalation_rule_id")
    .execute();
}
