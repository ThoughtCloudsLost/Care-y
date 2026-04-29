import type { Kysely } from "kysely";

// followups.type is a text column validated by Zod (followUpTypeSchema) at the
// API boundary. New type values (sms_outbound, sms_inbound, phone_call, voicemail)
// require no schema change. A PostgreSQL enum would add migration friction for
// each new value without additional safety beyond what Zod provides.
export async function up(_db: Kysely<never>): Promise<void> {
  /* no-op: text column validated by Zod, no schema change needed */
}

export async function down(_db: Kysely<never>): Promise<void> {
  /* no-op: text column validated by Zod, no schema change needed */
}
