import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("queue_watchers")
    .addColumn("queue_id", "uuid", (col) =>
      col.notNull().references("queues.id").onDelete("cascade"),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .execute();

  await db.schema
    .createIndex("qw_unique_pair")
    .on("queue_watchers")
    .columns(["queue_id", "user_id"])
    .unique()
    .execute();

  // Reverse lookup: "which queues is this user watching?"
  await db.schema
    .createIndex("qw_user_id")
    .on("queue_watchers")
    .column("user_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("qw_user_id").execute();
  await db.schema.dropIndex("qw_unique_pair").execute();
  await db.schema.dropTable("queue_watchers").execute();
}
