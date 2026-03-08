import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("sessions")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("token", "text", (col) => col.notNull().unique())
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("ip_address", "text", (col) => col.notNull())
    .addColumn("user_agent", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("idx_sessions_token")
    .on("sessions")
    .column("token")
    .execute();

  await db.schema
    .createIndex("idx_sessions_user_id")
    .on("sessions")
    .column("user_id")
    .execute();

  await db.schema
    .createIndex("idx_sessions_expires_at")
    .on("sessions")
    .column("expires_at")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("sessions").execute();
}
