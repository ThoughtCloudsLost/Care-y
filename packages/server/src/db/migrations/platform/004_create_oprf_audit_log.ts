import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("oprf_audit_log")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) => col.notNull())
    .addColumn("hashed_ip", "text", (col) => col.notNull())
    .addColumn("reason", "text", (col) => col.notNull())
    .addColumn("timestamp", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("idx_oprf_audit_log_user_id_timestamp")
    .on("oprf_audit_log")
    .columns(["user_id", "timestamp"])
    .execute();

  await db.schema
    .createIndex("idx_oprf_audit_log_timestamp")
    .on("oprf_audit_log")
    .column("timestamp")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("oprf_audit_log").execute();
}
