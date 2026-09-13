import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .addColumn("channel_sms_enabled", "boolean", (c) =>
      c.notNull().defaultTo(true),
    )
    .addColumn("channel_email_enabled", "boolean", (c) =>
      c.notNull().defaultTo(true),
    )
    .addColumn("channel_secure_link_enabled", "boolean", (c) =>
      c.notNull().defaultTo(true),
    )
    .addColumn("channel_voice_enabled", "boolean", (c) =>
      c.notNull().defaultTo(true),
    )
    .addColumn("channel_share_link_enabled", "boolean", (c) =>
      c.notNull().defaultTo(true),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("channel_sms_enabled")
    .dropColumn("channel_email_enabled")
    .dropColumn("channel_secure_link_enabled")
    .dropColumn("channel_voice_enabled")
    .dropColumn("channel_share_link_enabled")
    .execute();
}
