import { sql, type Kysely } from "kysely";

/**
 * Creates the deletion_requests table in the public schema.
 *
 * One row per org erasure request. The erasure CLI records each completed
 * step in its timestamp column and resumes from the first null one, so a
 * failed run picks up where it stopped.
 *
 * org_id carries no foreign key to orgs: erasure deletes the orgs row while
 * this row is still processing, and the row has to outlive it.
 *
 * The partial unique index allows one live request (pending or processing)
 * per org. Cancelled and done rows stay as history and do not block a new
 * request.
 *
 * The row holds ids and timestamps only. provider_subaccount_sid is the
 * managed-mode telephony subaccount, captured before the telephony_config
 * row is deleted so a failed closure can be retried; it stays null for an
 * org that brings its own account or has no telephony. last_error is an
 * error class name, never a message.
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("deletion_requests")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("org_id", "uuid", (col) => col.notNull())
    .addColumn("requested_by", "uuid")
    .addColumn("requested_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("cooling_off_until", "timestamptz", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("cancelled_by", "uuid")
    .addColumn("cancelled_at", "timestamptz")
    .addColumn("snapshot_at", "timestamptz")
    .addColumn("blobs_deleted_at", "timestamptz")
    .addColumn("schema_dropped_at", "timestamptz")
    .addColumn("rows_deleted_at", "timestamptz")
    .addColumn("subaccount_closed_at", "timestamptz")
    .addColumn("provider_subaccount_sid", "text")
    .addColumn("last_error", "text")
    .execute();

  await db.schema
    .createIndex("idx_deletion_requests_org_live")
    .on("deletion_requests")
    .column("org_id")
    .unique()
    // status is not an index column, so the builder's typed column list does
    // not include it; sql.ref names it, as the Kysely createIndex docs show.
    .where(sql.ref("status"), "in", ["pending", "processing"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("deletion_requests").execute();
}
