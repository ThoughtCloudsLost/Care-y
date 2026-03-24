import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("push_subscriptions")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("endpoint", "text", (col) => col.notNull())
    .addColumn("key_p256dh", "text", (col) => col.notNull())
    .addColumn("key_auth", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addUniqueConstraint("push_subscriptions_endpoint_unique", ["endpoint"])
    .execute();

  await db.schema
    .createIndex("push_subscriptions_user_id_idx")
    .on("push_subscriptions")
    .column("user_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("push_subscriptions").execute();
}
