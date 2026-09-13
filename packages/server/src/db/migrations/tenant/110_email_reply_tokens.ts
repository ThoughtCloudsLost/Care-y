import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("email_reply_tokens")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(db.fn("gen_random_uuid")),
    )
    .addColumn("ticket_id", "uuid", (col) =>
      col.notNull().references("tickets.id").onDelete("cascade"),
    )
    .addColumn("token_hash", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .addColumn("revoked_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("email_reply_tokens_token_hash_idx")
    .on("email_reply_tokens")
    .column("token_hash")
    .unique()
    .execute();

  await db.schema
    .createIndex("email_reply_tokens_ticket_id_idx")
    .on("email_reply_tokens")
    .column("ticket_id")
    .execute();

  await db.schema
    .alterTable("org_config")
    .addColumn("email_reply_footer", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("email_reply_footer")
    .execute();

  await db.schema.dropIndex("email_reply_tokens_ticket_id_idx").execute();
  await db.schema.dropIndex("email_reply_tokens_token_hash_idx").execute();
  await db.schema.dropTable("email_reply_tokens").execute();
}
