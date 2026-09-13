import type { Kysely } from "kysely";

/**
 * Widen oprf_audit_log.user_id from uuid to text.
 *
 * Per-tag OPRF evaluation (ADR-091) audits under the evaluation
 * subject, which is a tag string ("volunteer:<uuid>", "account:<uuid>",
 * "channel:<orgUuid>:<channelId>"), not always a bare uuid. The column
 * keeps its name; uuid values remain valid text. Postgres converts
 * uuid to text without a USING clause (verified against postgres:16).
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("oprf_audit_log")
    .alterColumn("user_id", (ac) => ac.setDataType("text"))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("oprf_audit_log")
    .alterColumn("user_id", (ac) => ac.setDataType("uuid"))
    .execute();
}
