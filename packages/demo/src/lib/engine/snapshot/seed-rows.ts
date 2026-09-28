/**
 * Loads a seed snapshot's rows (rows.bin.gz) into a PGlite database the
 * product's migrations have just built. The demo boot calls this after
 * running the migrations, and the snapshot smoke test calls it to prove
 * the build round-trips.
 *
 * Statements are compiled with Kysely's query builder and run through
 * PGlite directly, inside one PGlite transaction, so a failed load leaves
 * no rows behind and nothing else can interleave with it.
 *
 * Every text value is Postgres's own text output for its column, sent as
 * an untyped parameter. Postgres infers each parameter's type from the
 * target column and parses the text back to the identical value. PGlite's
 * serializers (0.5.8) accept that text as a plain string for every type,
 * and turn a Uint8Array into bytea, so bytes columns go in as raw bytes.
 *
 * Migrations insert no rows into an empty database; the builder checks
 * that on every build. The load therefore uses plain INSERTs with no
 * conflict rule, and a row that collides with an existing key fails the
 * load instead of being silently merged.
 */

import type { PGlite } from "@electric-sql/pglite";
import {
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  type CompiledQuery,
} from "kysely";
import {
  decodeSeedSnapshotRows,
  type SeedSnapshotManifest,
  type SeedSnapshotRowsTable,
  type SeedSnapshotTable,
  type SeedSnapshotValue,
} from "@care-y/shared/dev/seed-snapshot.js";

import { SeedSnapshotLoadError } from "../errors.js";
import { DEMO_ORG_SCHEMA } from "../server/seed-structure.js";

/** The schema the platform migrations write to (Postgres's default). */
export const PLATFORM_SCHEMA = "public";

/** The only schemas a snapshot may carry rows for. */
export const SEED_SNAPSHOT_SCHEMAS: readonly string[] = [
  PLATFORM_SCHEMA,
  DEMO_ORG_SCHEMA,
];

/**
 * Any table by name with columns of any type, for statements over tables
 * the code only learns at run time.
 */
export type LooseDatabase = Record<string, Record<string, unknown>>;

/**
 * A Kysely instance that only compiles Postgres statements and never
 * executes them (Kysely's DummyDriver). Callers run the compiled SQL
 * through PGlite themselves, which lets them choose PGlite's per-query
 * parsers and use its own transaction.
 */
export function createStatementCompiler<DB>(): Kysely<DB> {
  return new Kysely<DB>({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => new DummyDriver(),
      createIntrospector: (db: Kysely<DB>) => new PostgresIntrospector(db),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
  });
}

async function pipeBytes(
  bytes: Uint8Array,
  transform: CompressionStream | DecompressionStream,
): Promise<Uint8Array<ArrayBuffer>> {
  const stream = new Blob([new Uint8Array(bytes)])
    .stream()
    .pipeThrough(transform);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Gzip bytes with the platform's CompressionStream (browser and Node). */
export async function gzipBytes(
  bytes: Uint8Array,
): Promise<Uint8Array<ArrayBuffer>> {
  return pipeBytes(bytes, new CompressionStream("gzip"));
}

/** Gunzip bytes with the platform's DecompressionStream. */
export async function gunzipBytes(
  bytes: Uint8Array,
): Promise<Uint8Array<ArrayBuffer>> {
  return pipeBytes(bytes, new DecompressionStream("gzip"));
}

/**
 * Postgres caps one statement at 65,535 bind parameters. Batches stay well
 * under it, and under a byte budget so one statement never holds more
 * than a few megabytes of ciphertext.
 */
const MAX_BATCH_PARAMETERS = 30_000;
const MAX_BATCH_BYTES = 4 * 1024 * 1024;

function valueBytes(value: SeedSnapshotValue): number {
  if (value === null) return 0;
  return typeof value === "string" ? value.length : value.byteLength;
}

/** The table's rows as INSERT statements, in row order. */
export function compileSeedRowInserts(
  compiler: Kysely<LooseDatabase>,
  table: SeedSnapshotTable,
): CompiledQuery[] {
  const columnCount = table.columns.length;
  if (table.rows.length === 0) return [];
  if (columnCount === 0) {
    throw new SeedSnapshotLoadError(
      `Table ${table.schema}.${table.table} has rows but no columns`,
    );
  }
  const rowsPerBatch = Math.max(
    1,
    Math.floor(MAX_BATCH_PARAMETERS / columnCount),
  );

  const statements: CompiledQuery[] = [];
  let batch: Record<string, SeedSnapshotValue>[] = [];
  let batchBytes = 0;
  const flush = (): void => {
    if (batch.length === 0) return;
    statements.push(
      compiler
        .withSchema(table.schema)
        .insertInto(table.table)
        .values(batch)
        .compile(),
    );
    batch = [];
    batchBytes = 0;
  };

  for (const row of table.rows) {
    const record = new Map<string, SeedSnapshotValue>();
    let rowBytes = 0;
    for (const [c, column] of table.columns.entries()) {
      const value = row.at(c) ?? null;
      record.set(column.name, value);
      rowBytes += valueBytes(value);
    }
    if (
      batch.length >= rowsPerBatch ||
      (batch.length > 0 && batchBytes + rowBytes > MAX_BATCH_BYTES)
    ) {
      flush();
    }
    batch.push(Object.fromEntries(record));
    batchBytes += rowBytes;
  }
  flush();
  return statements;
}

function assertMatchesManifest(
  tables: readonly SeedSnapshotTable[],
  expected: readonly SeedSnapshotRowsTable[],
): void {
  if (tables.length !== expected.length) {
    throw new SeedSnapshotLoadError(
      `The rows file holds ${String(tables.length)} tables; the manifest lists ${String(expected.length)}`,
    );
  }
  for (const [i, table] of tables.entries()) {
    const listed = expected.at(i);
    const name = `${table.schema}.${table.table}`;
    if (listed === undefined) {
      throw new SeedSnapshotLoadError(
        `Table ${String(i)} of the rows file is ${name}, not the manifest's`,
      );
    }
    if (listed.schema !== table.schema || listed.table !== table.table) {
      throw new SeedSnapshotLoadError(
        `Table ${String(i)} of the rows file is ${name}, not the manifest's`,
      );
    }
    if (listed.rowCount !== table.rows.length) {
      throw new SeedSnapshotLoadError(
        `Table ${name} holds ${String(table.rows.length)} rows; the manifest lists ${String(listed.rowCount)}`,
      );
    }
    if (!SEED_SNAPSHOT_SCHEMAS.includes(table.schema)) {
      throw new SeedSnapshotLoadError(
        `Table ${name} is outside the demo's schemas`,
      );
    }
  }
}

export interface SeedSnapshotRowsLoadResult {
  /** Tables that received rows. */
  readonly tables: number;
  readonly rows: number;
}

/**
 * Insert a snapshot's rows into `pg`, whose schemas the product's
 * migrations have just created and which holds no other rows yet.
 * `gzippedRows` is the rows.bin.gz file's bytes and `manifest` the
 * snapshot's parsed manifest; the file must list exactly the manifest's
 * tables, in the manifest's order, with its row counts.
 *
 * Throws {@link SeedSnapshotLoadError} when the file does not decode or
 * match the manifest, or an insert fails. The load is one transaction,
 * so nothing is left behind on failure.
 */
export async function loadSeedSnapshotRows(
  pg: PGlite,
  gzippedRows: Uint8Array,
  manifest: SeedSnapshotManifest,
): Promise<SeedSnapshotRowsLoadResult> {
  let tables: SeedSnapshotTable[];
  try {
    tables = decodeSeedSnapshotRows(await gunzipBytes(gzippedRows));
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new SeedSnapshotLoadError(
      `The snapshot rows file does not decode: ${reason}`,
      { cause: err },
    );
  }
  assertMatchesManifest(tables, manifest.rows.tables);

  const compiler = createStatementCompiler<LooseDatabase>();
  let loadedTables = 0;
  let loadedRows = 0;
  let current = "";
  try {
    await pg.transaction(async (tx) => {
      for (const table of tables) {
        if (table.rows.length === 0) continue;
        current = `${table.schema}.${table.table}`;
        for (const statement of compileSeedRowInserts(compiler, table)) {
          await tx.query(statement.sql, [...statement.parameters]);
        }
        loadedTables++;
        loadedRows += table.rows.length;
      }
    });
  } catch (err: unknown) {
    if (err instanceof SeedSnapshotLoadError) throw err;
    const reason = err instanceof Error ? err.message : String(err);
    throw new SeedSnapshotLoadError(
      `Loading the snapshot rows failed at ${current}: ${reason}`,
      { cause: err },
    );
  }
  return { tables: loadedTables, rows: loadedRows };
}
