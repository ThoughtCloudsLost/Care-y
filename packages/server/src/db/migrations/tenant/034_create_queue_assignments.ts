import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("queue_assignments")
    .addColumn("queue_id", "uuid", (col) =>
      col.notNull().references("queues.id").onDelete("cascade"),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .execute();

  await db.schema
    .createIndex("qa_unique_pair")
    .on("queue_assignments")
    .columns(["queue_id", "user_id"])
    .unique()
    .execute();

  // Reverse lookup: "which queues is this user in?"
  await db.schema
    .createIndex("qa_user_id")
    .on("queue_assignments")
    .column("user_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("qa_user_id").execute();
  await db.schema.dropIndex("qa_unique_pair").execute();
  await db.schema.dropTable("queue_assignments").execute();
}
