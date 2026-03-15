import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("user_keys")
    .addColumn("vol_public", "bytea") // nullable initially: existing rows don't have it yet
    .addColumn("pq_public", "bytea") // nullable: ML-KEM-768, future v1.1
    .addColumn("key_version", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("rotated_at", "timestamptz")
    .addColumn("rotation_lock", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("user_keys").dropColumn("vol_public").execute();
  await db.schema.alterTable("user_keys").dropColumn("pq_public").execute();
  await db.schema.alterTable("user_keys").dropColumn("key_version").execute();
  await db.schema.alterTable("user_keys").dropColumn("rotated_at").execute();
  await db.schema.alterTable("user_keys").dropColumn("rotation_lock").execute();
}
