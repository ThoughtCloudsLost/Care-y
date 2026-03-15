import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("users").dropColumn("created_at").execute();
  await db.schema.alterTable("users").dropColumn("updated_at").execute();
  await db.schema.alterTable("sessions").dropColumn("created_at").execute();
  await db.schema.alterTable("user_keys").dropColumn("created_at").execute();
  await db.schema.alterTable("org_config").dropColumn("updated_at").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("users")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
  await db.schema
    .alterTable("users")
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
  await db.schema
    .alterTable("sessions")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
  await db.schema
    .alterTable("user_keys")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
  await db.schema
    .alterTable("org_config")
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now")),
    )
    .execute();
}
