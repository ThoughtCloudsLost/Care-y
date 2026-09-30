/**
 * Reads every seeded row out of the snapshot builder's PGlite database,
 * for rows.bin.gz. Build time only; the demo boot loads the result with
 * seed-rows.ts.
 *
 * Tables, columns and foreign keys come from the Postgres catalog, so a
 * new migration is picked up without touching this file. Every statement
 * is built with Kysely. Catalog reads go through a typed description of
 * the few pg_catalog columns used here, and table reads through a loose
 * one. PGlite runs them so that each query can choose its own parsers.
 *
 * Values leave Postgres as its own text output for every type except
 * bytea, which stays raw bytes. That keeps each value exact (timestamptz
 * keeps its microseconds, json its exact text, arrays and nulls as they
 * are) without this file knowing any column's type.
 */

import type { ParserOptions, PGlite } from "@electric-sql/pglite";
import type { CompiledQuery, Kysely } from "kysely";
import {
  DEFAULT_MIGRATION_LOCK_TABLE,
  DEFAULT_MIGRATION_TABLE,
} from "kysely/migration";
import type {
  SeedSnapshotColumn,
  SeedSnapshotTable,
  SeedSnapshotValue,
} from "@care-y/shared/dev/seed-snapshot.js";

import { SeedSnapshotBuildError } from "../errors.js";
import {
  SEED_SNAPSHOT_SCHEMAS,
  createStatementCompiler,
  type LooseDatabase,
} from "./seed-rows.js";

const BYTEA_OID = 17;

/**
 * Kysely's migration bookkeeping. Boot writes these rows itself when it
 * runs the migrations. The snapshot leaves them out.
 */
const BOOKKEEPING_TABLES: ReadonlySet<string> = new Set([
  DEFAULT_MIGRATION_TABLE,
  DEFAULT_MIGRATION_LOCK_TABLE,
]);

/** The pg_catalog columns read here, and only those. */
interface CatalogDatabase {
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
    attisdropped: boolean;
    attgenerated: string;
    attidentity: string;
  };
  "pg_catalog.pg_constraint": {
    conrelid: number;
    confrelid: number;
    contype: string;
    conkey: number[] | null;
    confkey: number[] | null;
  };
  "pg_catalog.pg_type": { oid: number };
}

// ── Result guards ───────────────────────────────────────────────────

function fail(message: string): never {
  throw new SeedSnapshotBuildError(message);
}

function asNumber(value: unknown, what: string): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value)) return Number(value);
  return fail(`Catalog ${what} is not a number`);
}

function asString(value: unknown, what: string): string {
  return typeof value === "string"
    ? value
    : fail(`Catalog ${what} is not text`);
}

/** An int2[] column, whether PGlite parsed it or left its text form. */
function asIntArray(value: unknown, what: string): number[] {
  if (Array.isArray(value)) {
    return value.map((v: unknown) => asNumber(v, what));
  }
  if (typeof value === "string" && /^\{[\d,]*\}$/.test(value)) {
    const inner = value.slice(1, -1);
    return inner === "" ? [] : inner.split(",").map((v) => asNumber(v, what));
  }
  return fail(`Catalog ${what} is not an integer array`);
}

async function runRows(
  pg: PGlite,
  compiled: CompiledQuery,
  parsers?: ParserOptions,
): Promise<{
  rows: unknown[][];
  fields: { name: string; dataTypeID: number }[];
}> {
  const result = await pg.query<unknown[]>(
    compiled.sql,
    [...compiled.parameters],
    parsers === undefined
      ? { rowMode: "array" }
      : { rowMode: "array", parsers },
  );
  return { rows: result.rows, fields: result.fields };
}

// ── Catalog ─────────────────────────────────────────────────────────

interface CatalogTable {
  readonly oid: number;
  readonly schema: string;
  readonly table: string;
  /** Insertable columns in attnum order, keyed by attnum. */
  readonly columns: Map<number, string>;
}

interface ForeignKey {
  readonly child: number;
  readonly parent: number;
  readonly childColumns: readonly number[];
  readonly parentColumns: readonly number[];
}

interface Catalog {
  readonly tables: Map<number, CatalogTable>;
  readonly foreignKeys: readonly ForeignKey[];
  readonly typeOids: readonly number[];
}

async function readCatalog(pg: PGlite): Promise<Catalog> {
  const catalog = createStatementCompiler<CatalogDatabase>();

  const namespaces = await runRows(
    pg,
    catalog
      .selectFrom("pg_catalog.pg_namespace")
      .select(["oid", "nspname"])
      .where("nspname", "in", [...SEED_SNAPSHOT_SCHEMAS])
      .compile(),
  );
  const schemaByOid = new Map<number, string>();
  for (const [oid, name] of namespaces.rows) {
    schemaByOid.set(asNumber(oid, "namespace oid"), asString(name, "nspname"));
  }
  for (const schema of SEED_SNAPSHOT_SCHEMAS) {
    if (![...schemaByOid.values()].includes(schema)) {
      fail(`Schema ${schema} does not exist in the build database`);
    }
  }

  const relations = await runRows(
    pg,
    catalog
      .selectFrom("pg_catalog.pg_class")
      .select(["oid", "relname", "relnamespace", "relkind"])
      .where("relnamespace", "in", [...schemaByOid.keys()])
      .where("relkind", "in", ["r", "p", "S"])
      .compile(),
  );
  const tables = new Map<number, CatalogTable>();
  for (const [oid, relname, relnamespace, relkind] of relations.rows) {
    const schema =
      schemaByOid.get(asNumber(relnamespace, "relnamespace")) ??
      fail("A relation's namespace is not one of the demo's schemas");
    const table = asString(relname, "relname");
    // Loaded rows do not advance a sequence, so a sequence would hand out
    // values the snapshot already holds. The schemas have none today.
    if (asString(relkind, "relkind") === "S") {
      fail(
        `Sequence ${schema}.${table} exists; the snapshot format cannot carry its position`,
      );
    }
    if (BOOKKEEPING_TABLES.has(table)) continue;
    const tableOid = asNumber(oid, "relation oid");
    tables.set(tableOid, {
      oid: tableOid,
      schema,
      table,
      columns: new Map(),
    });
  }
  if (tables.size === 0) fail("The build database has no tables to export");

  const attributes = await runRows(
    pg,
    catalog
      .selectFrom("pg_catalog.pg_attribute")
      .select(["attrelid", "attname", "attnum", "attgenerated", "attidentity"])
      .where("attrelid", "in", [...tables.keys()])
      .where("attnum", ">", 0)
      .where("attisdropped", "=", false)
      .orderBy("attrelid")
      .orderBy("attnum")
      .compile(),
  );
  for (const [
    attrelid,
    attname,
    attnum,
    attgenerated,
    attidentity,
  ] of attributes.rows) {
    const table =
      tables.get(asNumber(attrelid, "attrelid")) ??
      fail("A column belongs to an unknown table");
    const name = asString(attname, "attname");
    // A generated column is computed on insert and cannot be written.
    if (asString(attgenerated, "attgenerated") !== "") continue;
    // GENERATED ALWAYS AS IDENTITY refuses explicit values on insert.
    if (asString(attidentity, "attidentity") === "a") {
      fail(
        `Column ${table.schema}.${table.table}.${name} is an always-identity column; loading cannot write it`,
      );
    }
    table.columns.set(asNumber(attnum, "attnum"), name);
  }

  const constraints = await runRows(
    pg,
    catalog
      .selectFrom("pg_catalog.pg_constraint")
      .select(["conrelid", "confrelid", "conkey", "confkey"])
      .where("contype", "=", "f")
      .where("conrelid", "in", [...tables.keys()])
      .compile(),
  );
  const foreignKeys: ForeignKey[] = [];
  for (const [conrelid, confrelid, conkey, confkey] of constraints.rows) {
    foreignKeys.push({
      child: asNumber(conrelid, "conrelid"),
      parent: asNumber(confrelid, "confrelid"),
      childColumns: asIntArray(conkey, "conkey"),
      parentColumns: asIntArray(confkey, "confkey"),
    });
  }

  const types = await runRows(
    pg,
    catalog.selectFrom("pg_catalog.pg_type").select("oid").compile(),
  );
  const typeOids = types.rows.map(([oid]) => asNumber(oid, "type oid"));

  return { tables, foreignKeys, typeOids };
}

// ── Ordering ────────────────────────────────────────────────────────

function qualified(table: CatalogTable): string {
  return `${table.schema}.${table.table}`;
}

/**
 * Tables ordered so every table comes after the tables its foreign keys
 * point at. Ties break by qualified name, so the order is stable from
 * build to build. A self-reference is handled by row order instead
 * ({@link orderSelfReferencingRows}); a cycle across tables fails.
 */
function orderTables(catalog: Catalog): CatalogTable[] {
  const parents = new Map<number, Set<number>>();
  const children = new Map<number, Set<number>>();
  for (const oid of catalog.tables.keys()) {
    parents.set(oid, new Set());
    children.set(oid, new Set());
  }
  for (const fk of catalog.foreignKeys) {
    if (fk.child === fk.parent) continue;
    if (!catalog.tables.has(fk.parent)) {
      const child = catalog.tables.get(fk.child);
      fail(
        `${child === undefined ? "A table" : qualified(child)} references a table outside the snapshot`,
      );
    }
    parents.get(fk.child)?.add(fk.parent);
    children.get(fk.parent)?.add(fk.child);
  }

  const byName = (a: number, b: number): number =>
    qualified(catalog.tables.get(a) ?? fail("Unknown table")).localeCompare(
      qualified(catalog.tables.get(b) ?? fail("Unknown table")),
    );
  const ready = [...catalog.tables.keys()]
    .filter((oid) => parents.get(oid)?.size === 0)
    .sort(byName);
  const ordered: CatalogTable[] = [];
  while (ready.length > 0) {
    const oid = ready.shift();
    if (oid === undefined) break;
    const table = catalog.tables.get(oid) ?? fail("Unknown table");
    ordered.push(table);
    for (const child of children.get(oid) ?? []) {
      const pending = parents.get(child);
      pending?.delete(oid);
      if (pending?.size === 0) {
        ready.push(child);
        ready.sort(byName);
      }
    }
  }
  if (ordered.length !== catalog.tables.size) {
    const stuck = [...catalog.tables.values()]
      .filter((t) => !ordered.includes(t))
      .map(qualified)
      .join(", ");
    fail(`Foreign keys form a cycle between ${stuck}`);
  }
  return ordered;
}

function valueKey(value: SeedSnapshotValue): string {
  if (value === null) return "";
  if (typeof value === "string") return `t${value}`;
  return `b${Array.from(value, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Rows ordered so a row a self-referencing foreign key points at comes
 * before the row pointing at it. Rows keep their order otherwise.
 */
function orderSelfReferencingRows(
  table: CatalogTable,
  rows: SeedSnapshotValue[][],
  selfKeys: readonly { from: number[]; to: number[] }[],
): SeedSnapshotValue[][] {
  if (selfKeys.length === 0) return rows;
  const keyOf = (
    row: SeedSnapshotValue[],
    columns: number[],
  ): string | null => {
    const parts: string[] = [];
    for (const c of columns) {
      const value = row.at(c) ?? null;
      // Under MATCH SIMPLE a NULL anywhere in the key means no reference.
      if (value === null) return null;
      parts.push(valueKey(value));
    }
    return JSON.stringify(parts);
  };

  const dependsOn = rows.map(() => new Set<number>());
  for (const { from, to } of selfKeys) {
    const rowByKey = new Map<string, number>();
    rows.forEach((row, i) => {
      const key = keyOf(row, to);
      if (key !== null) rowByKey.set(key, i);
    });
    rows.forEach((row, i) => {
      const key = keyOf(row, from);
      const target = key === null ? undefined : rowByKey.get(key);
      if (target !== undefined && target !== i) dependsOn.at(i)?.add(target);
    });
  }

  const placed = new Set<number>();
  const ordered: SeedSnapshotValue[][] = [];
  while (ordered.length < rows.length) {
    const before = ordered.length;
    rows.forEach((row, i) => {
      if (placed.has(i)) return;
      const deps = dependsOn.at(i) ?? new Set<number>();
      if ([...deps].every((d) => placed.has(d))) {
        placed.add(i);
        ordered.push(row);
      }
    });
    if (ordered.length === before) {
      fail(`Rows of ${qualified(table)} reference each other in a cycle`);
    }
  }
  return ordered;
}

// ── Export ──────────────────────────────────────────────────────────

async function readTable(
  pg: PGlite,
  compiler: Kysely<LooseDatabase>,
  table: CatalogTable,
  textParsers: ParserOptions,
  selfKeys: readonly ForeignKey[],
): Promise<SeedSnapshotTable> {
  const result = await runRows(
    pg,
    compiler
      .withSchema(table.schema)
      .selectFrom(table.table)
      .selectAll()
      .compile(),
    textParsers,
  );
  const insertable = new Set(table.columns.values());
  const kept: { index: number; column: SeedSnapshotColumn }[] = [];
  for (const [index, field] of result.fields.entries()) {
    if (!insertable.has(field.name)) continue;
    kept.push({
      index,
      column: {
        name: field.name,
        kind: field.dataTypeID === BYTEA_OID ? "bytes" : "text",
      },
    });
  }
  if (kept.length !== insertable.size) {
    fail(
      `Reading ${qualified(table)} returned different columns than the catalog lists`,
    );
  }

  const rows = result.rows.map((raw) =>
    kept.map(({ index, column }): SeedSnapshotValue => {
      const value: unknown = raw.at(index);
      if (value === null || value === undefined) return null;
      if (column.kind === "bytes" && value instanceof Uint8Array) return value;
      if (column.kind === "text" && typeof value === "string") return value;
      return fail(
        `Column ${qualified(table)}.${column.name} returned a value that is not ${column.kind}`,
      );
    }),
  );

  // Self-references by position in the kept columns.
  const positionOf = new Map<number, number>();
  for (const [attnum, name] of table.columns) {
    const position = kept.findIndex((k) => k.column.name === name);
    if (position !== -1) positionOf.set(attnum, position);
  }
  const selfPositions = selfKeys.map((fk) => ({
    from: fk.childColumns.map(
      (a) =>
        positionOf.get(a) ??
        fail(
          `A foreign key of ${qualified(table)} names a column that is not exported`,
        ),
    ),
    to: fk.parentColumns.map(
      (a) =>
        positionOf.get(a) ??
        fail(
          `A foreign key of ${qualified(table)} names a column that is not exported`,
        ),
    ),
  }));

  return {
    schema: table.schema,
    table: table.table,
    columns: kept.map((k) => k.column),
    rows: orderSelfReferencingRows(table, rows, selfPositions),
  };
}

/**
 * Every table in the demo's schemas except Kysely's migration
 * bookkeeping, with all of its rows, in an order that satisfies every
 * foreign key. Tables with no rows are included, so the manifest lists
 * the full set.
 *
 * Throws {@link SeedSnapshotBuildError} when the schema holds a sequence,
 * an always-identity column, a foreign key to a table outside the demo's
 * schemas, or a foreign key cycle. The format cannot carry any of them.
 */
export async function exportSeedSnapshotRows(
  pg: PGlite,
): Promise<SeedSnapshotTable[]> {
  const catalog = await readCatalog(pg);
  const ordered = orderTables(catalog);

  // Every type keeps its text form except bytea, which PGlite's default
  // parser already returns as raw bytes.
  const identity = (value: string): string => value;
  const textParsers: ParserOptions = Object.fromEntries(
    catalog.typeOids
      .filter((oid) => oid !== BYTEA_OID)
      .map((oid) => [oid, identity]),
  );

  const compiler = createStatementCompiler<LooseDatabase>();
  const out: SeedSnapshotTable[] = [];
  for (const table of ordered) {
    const selfKeys = catalog.foreignKeys.filter(
      (fk) => fk.child === table.oid && fk.parent === table.oid,
    );
    out.push(await readTable(pg, compiler, table, textParsers, selfKeys));
  }
  return out;
}
