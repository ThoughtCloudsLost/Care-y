import type { Kysely } from "kysely";

interface MigrationCategoriesDb {
  kb_categories: {
    id: string;
    name: string;
    sort_order: number;
    encrypted_name: Buffer | null;
  };
}

export async function up(db: Kysely<unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Kysely migrations receive Kysely<unknown>; typed DML requires narrowing (see 014)
  const typedDb = db as unknown as Kysely<MigrationCategoriesDb>;

  // 1. Add encrypted_name as nullable (existing rows get NULL temporarily)
  await db.schema
    .alterTable("kb_categories")
    .addColumn("encrypted_name", "bytea")
    .execute();

  // 2. Add sort_order with default 0 (backfilled below)
  await db.schema
    .alterTable("kb_categories")
    .addColumn("sort_order", "integer", (col) => col.notNull().defaultTo(0))
    .execute();

  // 3. Backfill sort_order from current alphabetical name ordering.
  //    Uses Kysely query builder so withSchema is respected.
  const rows = await typedDb
    .selectFrom("kb_categories")
    .select("id")
    .orderBy("name", "asc")
    .execute();

  let sortOrder = 1;
  for (const row of rows) {
    await typedDb
      .updateTable("kb_categories")
      .set({ sort_order: sortOrder, encrypted_name: Buffer.from("") })
      .where("id", "=", row.id)
      .execute();
    sortOrder += 1;
  }

  // 4. Drop the plaintext name column
  await db.schema.alterTable("kb_categories").dropColumn("name").execute();

  // 5. Set encrypted_name to NOT NULL (all rows now have a value)
  await db.schema
    .alterTable("kb_categories")
    .alterColumn("encrypted_name", (ac) => ac.setNotNull())
    .execute();

  // 6. Unique index on sort_order
  await db.schema
    .createIndex("kb_categories_sort_order")
    .on("kb_categories")
    .column("sort_order")
    .unique()
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("kb_categories_sort_order").execute();

  await db.schema
    .alterTable("kb_categories")
    .addColumn("name", "text", (col) => col.notNull().defaultTo(""))
    .execute();

  await db.schema
    .alterTable("kb_categories")
    .dropColumn("encrypted_name")
    .execute();

  await db.schema
    .alterTable("kb_categories")
    .dropColumn("sort_order")
    .execute();
}
