import { sql, type Kysely } from "kysely";

// Typed DML narrowing: Kysely migrations receive Kysely<unknown>. Typed
// inserts/updates require narrowing to a concrete table interface. The
// `as unknown as Kysely<MigrationDb>` cast is the standard migration
// pattern established in 014 and used across all subsequent typed DML
// migrations (045, 052, 060). Correctness relies on column names matching
// the live schema at migration time, which the up/down pair guarantees.
interface MigrationClientsDb {
  clients: {
    id: string;
    encrypted_alias: Buffer;
    alias_hash: string | null;
    created_at: Date;
  };
}

export async function up(db: Kysely<unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Kysely migrations receive Kysely<unknown>; typed DML requires narrowing (see 014)
  const typedDb = db as unknown as Kysely<MigrationClientsDb>;

  // 1. Add encrypted_alias as nullable temporarily
  await db.schema
    .alterTable("clients")
    .addColumn("encrypted_alias", "bytea")
    .execute();

  // 2. Add alias_hash (nullable; unique index permits many NULLs so
  //    webhook-created rows can exist without a browser-computed hash)
  await db.schema
    .alterTable("clients")
    .addColumn("alias_hash", "text")
    .execute();

  // 3. Backfill encrypted_alias with empty bytes so NOT NULL can be set.
  //    Pre-deployment: no real data to preserve.
  await typedDb
    .updateTable("clients")
    .set({ encrypted_alias: Buffer.from("") })
    .execute();

  // 4. Drop the plaintext alias column (also drops its unique index)
  await db.schema.alterTable("clients").dropColumn("alias").execute();

  // 5. Set encrypted_alias to NOT NULL
  await db.schema
    .alterTable("clients")
    .alterColumn("encrypted_alias", (ac) => ac.setNotNull())
    .execute();

  // 6. Create unique index on alias_hash (mirrors phones_phone_hash_idx
  //    from 017_create_phones.ts:23-28)
  await db.schema
    .createIndex("clients_alias_hash_idx")
    .on("clients")
    .column("alias_hash")
    .unique()
    .execute();

  // 7. Per-org sequence for structurally unique generated alias suffixes.
  //    Kysely's schema builder has no CREATE SEQUENCE support; raw DDL
  //    runs through the schema search_path set by withSchema.
  await sql`CREATE SEQUENCE IF NOT EXISTS client_alias_seq START 1`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("clients_alias_hash_idx").execute();

  // Recreate plaintext alias column with empty default (pre-deployment,
  // no data to restore)
  await db.schema
    .alterTable("clients")
    .addColumn("alias", "text", (col) => col.notNull().defaultTo(""))
    .execute();

  await db.schema.alterTable("clients").dropColumn("encrypted_alias").execute();
  await db.schema.alterTable("clients").dropColumn("alias_hash").execute();

  await sql`DROP SEQUENCE IF EXISTS client_alias_seq`.execute(db);
}
