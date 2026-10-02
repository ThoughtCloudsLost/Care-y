/**
 * Moves every seeded time forward by the gap between the snapshot's build
 * time and the demo's load time, so the seed reads as written just before
 * the visitor arrived rather than whenever the snapshot was built. The
 * demo boot calls this right after loading the snapshot's rows.
 *
 * Every timestamp, timestamptz and date column in the demo's schemas is
 * shifted by the same amount, future times such as expiries included, so
 * the gaps between times stay exactly as the seed wrote them. Columns come
 * from the Postgres catalog, so a new migration's time columns are shifted
 * without touching this file. The schema stores no time as an epoch integer and
 * none of its json columns carry one, so these columns are every
 * plaintext time the seed writes.
 *
 * Two kinds of encrypted payload hold an absolute time: the per-account
 * read cursor and each fund ledger entry's recorded time. SQL cannot reach
 * inside ciphertext; read-cursor-reseal.ts and fund-ledger-reseal.ts shift
 * those after sign-in.
 *
 * Statements are built with Kysely (a typed description of the few
 * pg_catalog columns read here, and a loose one for the tables) and run
 * through PGlite inside one transaction, as seed-rows.ts loads the rows.
 */

import type { PGlite } from "@electric-sql/pglite";
import { sql, type CompiledQuery, type RawBuilder } from "kysely";
import {
  DEFAULT_MIGRATION_LOCK_TABLE,
  DEFAULT_MIGRATION_TABLE,
} from "kysely/migration";

import { SeedSnapshotLoadError } from "../errors.js";
import {
  SEED_SNAPSHOT_SCHEMAS,
  createStatementCompiler,
  type LooseDatabase,
} from "./seed-rows.js";

/** The pg_catalog columns read here, and only those. */
interface TimeCatalogDatabase {
  "pg_catalog.pg_namespace": { oid: number; nspname: string };
  "pg_catalog.pg_class": {
    oid: number;
    relname: string;
    relnamespace: number;
    relkind: string;
  };
  "pg_catalog.pg_attribute": {
    attrelid: number;
    attname: string;
    attnum: number;
    atttypid: number;
    attisdropped: boolean;
    attgenerated: string;
  };
  "pg_catalog.pg_type": { oid: number; typname: string };
}

/**
 * Postgres's names for timestamp, timestamptz and date. A date plus an
 * interval is a timestamp, which the assignment casts back to the
 * column's date.
 */
const TIME_TYPE_NAMES: readonly string[] = ["timestamp", "timestamptz", "date"];

/** Kysely's migration bookkeeping, which boot writes itself. */
const BOOKKEEPING_TABLES: ReadonlySet<string> = new Set([
  DEFAULT_MIGRATION_TABLE,
  DEFAULT_MIGRATION_LOCK_TABLE,
]);

export interface SeedTimeColumns {
  readonly schema: string;
  readonly table: string;
  readonly columns: readonly string[];
}

function asText(value: unknown, what: string): string {
  if (typeof value === "string") return value;
  throw new SeedSnapshotLoadError(`Catalog ${what} is not text`);
}

/**
 * Every writable timestamp and timestamptz column in the demo's schemas,
 * grouped by table, in schema, table and column order.
 */
export async function listSeedTimeColumns(
  pg: PGlite,
): Promise<SeedTimeColumns[]> {
  const catalog = createStatementCompiler<TimeCatalogDatabase>();
  const compiled = catalog
    .selectFrom("pg_catalog.pg_attribute as a")
    .innerJoin("pg_catalog.pg_class as c", "c.oid", "a.attrelid")
    .innerJoin("pg_catalog.pg_namespace as n", "n.oid", "c.relnamespace")
    .innerJoin("pg_catalog.pg_type as t", "t.oid", "a.atttypid")
    .select(["n.nspname", "c.relname", "a.attname", "a.attgenerated"])
    .where("n.nspname", "in", [...SEED_SNAPSHOT_SCHEMAS])
    .where("c.relkind", "in", ["r", "p"])
    .where("t.typname", "in", [...TIME_TYPE_NAMES])
    .where("a.attnum", ">", 0)
    .where("a.attisdropped", "=", false)
    .orderBy("n.nspname")
    .orderBy("c.relname")
    .orderBy("a.attnum")
    .compile();

  const result = await pg.query<unknown[]>(
    compiled.sql,
    [...compiled.parameters],
    { rowMode: "array" },
  );

  const byTable = new Map<
    string,
    { schema: string; table: string; columns: string[] }
  >();
  for (const [nspname, relname, attname, attgenerated] of result.rows) {
    const schema = asText(nspname, "nspname");
    const table = asText(relname, "relname");
    const column = asText(attname, "attname");
    if (BOOKKEEPING_TABLES.has(table)) continue;
    // A generated column is computed from the others and cannot be set.
    if (asText(attgenerated, "attgenerated") !== "") continue;
    const key = `${schema}.${table}`;
    const entry = byTable.get(key) ?? { schema, table, columns: [] };
    entry.columns.push(column);
    byTable.set(key, entry);
  }
  return [...byTable.values()];
}

/**
 * One UPDATE per table moving each of its time columns by `deltaMs`.
 * NULL stays NULL.
 */
export function compileSeedTimeShift(
  tables: readonly SeedTimeColumns[],
  deltaMs: number,
): CompiledQuery[] {
  const compiler = createStatementCompiler<LooseDatabase>();
  const interval = sql`make_interval(secs => ${deltaMs / 1000})`;
  return tables.map((entry) => {
    const assignments = new Map<string, RawBuilder<unknown>>();
    for (const column of entry.columns) {
      assignments.set(column, sql`${sql.ref(column)} + ${interval}`);
    }
    return compiler
      .withSchema(entry.schema)
      .updateTable(entry.table)
      .set(Object.fromEntries(assignments))
      .compile();
  });
}

export interface SeedTimeShiftResult {
  readonly tables: number;
  readonly columns: number;
}

/**
 * Shift every seeded time by `deltaMs` in one transaction. Throws
 * {@link SeedSnapshotLoadError} when the catalog read or an update fails;
 * a failed shift changes nothing.
 */
export async function shiftSeedTimes(
  pg: PGlite,
  deltaMs: number,
): Promise<SeedTimeShiftResult> {
  if (!Number.isFinite(deltaMs)) {
    throw new SeedSnapshotLoadError(
      "The seed time shift is not a finite number",
    );
  }
  let current = "";
  try {
    const tables = await listSeedTimeColumns(pg);
    const statements = compileSeedTimeShift(tables, deltaMs);
    await pg.transaction(async (tx) => {
      for (const [i, statement] of statements.entries()) {
        const entry = tables.at(i);
        current = entry === undefined ? "" : `${entry.schema}.${entry.table}`;
        await tx.query(statement.sql, [...statement.parameters]);
      }
    });
    return {
      tables: tables.length,
      columns: tables.reduce((sum, t) => sum + t.columns.length, 0),
    };
  } catch (err: unknown) {
    if (err instanceof SeedSnapshotLoadError) throw err;
    const reason = err instanceof Error ? err.message : String(err);
    throw new SeedSnapshotLoadError(
      `Shifting the seed times failed${current === "" ? "" : ` at ${current}`}: ${reason}`,
      { cause: err },
    );
  }
}
