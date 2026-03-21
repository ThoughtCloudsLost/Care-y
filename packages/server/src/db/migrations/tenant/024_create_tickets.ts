import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("tickets")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("client_id", "uuid", (col) =>
      col.notNull().references("clients.id").onDelete("restrict"),
    )
    .addColumn("queue_id", "uuid", (col) =>
      col.notNull().references("queues.id").onDelete("restrict"),
    )
    .addColumn("status", "text", (col) => col.notNull().defaultTo("open"))
    .addColumn("priority", "text", (col) => col.notNull().defaultTo("normal"))
    .addColumn("on_hold", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("assigned_to", "text")
    .addColumn("encrypted_title", "bytea", (col) => col.notNull())
    .addColumn("encrypted_description", "bytea", (col) => col.notNull())
    .addColumn("key_generation", "uuid", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();

  await db.schema
    .createIndex("tickets_client_id_idx")
    .on("tickets")
    .column("client_id")
    .execute();

  await db.schema
    .createIndex("tickets_queue_id_idx")
    .on("tickets")
    .column("queue_id")
    .execute();

  await db.schema
    .createIndex("tickets_status_idx")
    .on("tickets")
    .column("status")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("tickets_status_idx").execute();
  await db.schema.dropIndex("tickets_queue_id_idx").execute();
  await db.schema.dropIndex("tickets_client_id_idx").execute();
  await db.schema.dropTable("tickets").execute();
}
