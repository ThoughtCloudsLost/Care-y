// Replaces the cross-tenant client_alias_seq (a PostgreSQL sequence
// misplaced in the public schema) with a counter column on org_config.
//
// The original sequence was created via unqualified raw SQL in migration
// 083, which bypasses Kysely's WithSchemaPlugin (Kysely #761) and
// resolves to public. Every org on the instance shared one counter.
//
// The replacement column uses UPDATE ... RETURNING through the query
// builder, which WithSchemaPlugin qualifies correctly. This removes the
// last object-naming raw SQL from the tenant migration set.
//
// Each tenant's counter is seeded from the outgoing sequence's
// last_value, the only number that bounds the suffixes already issued
// across every org. Step 2 explains why the client count does not.
//
// The public.client_alias_seq is dropped because no code references it
// after this migration. Qualifying it as public.client_alias_seq is
// required here: an unqualified DROP would resolve to public anyway, but
// the explicit qualification makes the target verifiable by a reader and
// passes the raw-SQL lint rule.

import { sql, type Kysely } from "kysely";

interface MigrationOrgConfigDb {
  org_config: {
    next_alias_suffix: number;
  };
}

export async function up(db: Kysely<unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Kysely migrations receive Kysely<unknown>; typed DML requires narrowing (see 045)
  const typedDb = db as unknown as Kysely<MigrationOrgConfigDb>;

  // 1. Add the counter column, defaulting to 0.
  await db.schema
    .alterTable("org_config")
    .addColumn("next_alias_suffix", "integer", (col) =>
      col.notNull().defaultTo(0),
    )
    .execute();

  // 2. Seed the counter from the outgoing shared sequence.
  //
  //    The suffixes this org already holds cannot be read back: the alias
  //    text is encrypted and opaque to the server. Counting clients does
  //    not bound them either, because the sequence was shared, so an org
  //    with three clients may hold suffixes 5, 27 and 104 while other
  //    orgs consumed the values in between.
  //
  //    The sequence's own last_value is the one number that is an upper
  //    bound on every suffix ever issued to every org, so starting each
  //    tenant there cannot reissue a suffix this org already holds. The
  //    cost is that per-org numbering starts high rather than at 1.
  //
  //    A database where the sequence never existed is a fresh install:
  //    no aliases have been issued, and 0 is correct.
  const sequenceRow = await sql<{
    last_value: string | null;
  }>`SELECT last_value FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'client_alias_seq'`.execute(
    db,
  );

  const startValue = Number(sequenceRow.rows[0]?.last_value ?? 0);

  await typedDb
    .updateTable("org_config")
    .set({ next_alias_suffix: startValue })
    .execute();

  // 3. Drop the misplaced public-schema sequence. IF EXISTS guards
  //    against environments where migration 083 never created it
  //    (e.g., test schemas created after the 083 fix).
  //
  //    The sql expression names only the public-schema object, never
  //    a tenant object, so it is schema-safe.
  await sql`DROP SEQUENCE IF EXISTS public.client_alias_seq`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("org_config")
    .dropColumn("next_alias_suffix")
    .execute();
}
