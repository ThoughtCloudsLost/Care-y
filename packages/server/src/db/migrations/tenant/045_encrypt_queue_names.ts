import type { Kysely } from "kysely";

interface MigrationQueuesDb {
  queues: {
    id: string;
    created_at: Date;
    sort_order: number;
    encrypted_name: Buffer | null;
  };
}

export async function up(db: Kysely<unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Kysely migrations receive Kysely<unknown>; typed DML requires narrowing (see 014)
  const typedDb = db as unknown as Kysely<MigrationQueuesDb>;

  // 1. Add encrypted_name as nullable (existing rows get NULL temporarily)
  await db.schema
    .alterTable("queues")
    .addColumn("encrypted_name", "bytea")
    .execute();

  // 2. Add sort_order with default 0 (backfilled below)
  await db.schema
    .alterTable("queues")
    .addColumn("sort_order", "integer", (col) => col.notNull().defaultTo(0))
    .execute();

  // 3. Backfill sort_order from creation order (1-based).
  //    Uses Kysely query builder so withSchema is respected.
  const rows = await typedDb
    .selectFrom("queues")
    .select("id")
    .orderBy("created_at", "asc")
    .execute();

  let sortOrder = 1;
  for (const row of rows) {
    await typedDb
      .updateTable("queues")
      .set({ sort_order: sortOrder, encrypted_name: Buffer.from("") })
      .where("id", "=", row.id)
      .execute();
    sortOrder += 1;
  }

  // 4. Drop the plaintext name column
  await db.schema.alterTable("queues").dropColumn("name").execute();

  // 5. Set encrypted_name to NOT NULL (all rows now have a value)
  await db.schema
    .alterTable("queues")
    .alterColumn("encrypted_name", (ac) => ac.setNotNull())
    .execute();

  // 6. Remove sort_order default
  await db.schema
    .alterTable("queues")
    .alterColumn("sort_order", (ac) => ac.dropDefault())
    .execute();

  // 7. Unique sort_order across all queues
  await db.schema
    .createIndex("queues_sort_order_unique")
    .on("queues")
    .column("sort_order")
    .unique()
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("queues_sort_order_unique").execute();

  await db.schema
    .alterTable("queues")
    .addColumn("name", "text", (col) => col.notNull().defaultTo(""))
    .execute();

  await db.schema.alterTable("queues").dropColumn("encrypted_name").execute();
  await db.schema.alterTable("queues").dropColumn("sort_order").execute();
}
