/**
 * Hand-written Kysely dialect over PGlite's .query(sql, params).
 *
 * PGlite is single-connection: the driver serializes acquires with a
 * promise queue. A transaction holds the connection until commit/rollback;
 * queued queries wait. This prevents deadlocks from concurrent TanStack
 * Query fetches while ensuring transactional isolation.
 *
 * Replicates two behaviors from packages/server/src/db/db.ts:
 *   1. INT8 (bigint, OID 20) parsed to number
 *   2. bytea returned as Buffer (wraps Uint8Array)
 *
 * Parameters of type Buffer are converted to Uint8Array before reaching
 * PGlite (PGlite does not recognize Node Buffer).
 */

import { DemoEngineError } from "../errors.js";
import { traceFlowLocal, buildFlowDetail } from "../../flow-events.js";
import type { FlowDetailRowInput } from "../../flow-events.js";
import type {
  DatabaseConnection,
  DatabaseIntrospector,
  Dialect,
  DialectAdapterBase,
  Driver,
  QueryResult,
  QueryCompiler,
  TransactionSettings,
} from "kysely";
import {
  CompiledQuery,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import type { PGlite, Results } from "@electric-sql/pglite";

// OID for INT8 (bigint) in Postgres
const INT8_OID = 20;

/**
 * Convert PGlite result rows:
 *   - Uint8Array fields become Buffer (bytea columns)
 *   - INT8 string values become number
 */
function processRow(
  row: Record<string, unknown>,
  fields: { name: string; dataTypeID: number }[],
): Record<string, unknown> {
  const processed: Record<string, unknown> = {};
  for (const field of fields) {
    const val = row[field.name];
    if (val instanceof Uint8Array && !(val instanceof Buffer)) {
      processed[field.name] = Buffer.from(val);
    } else if (field.dataTypeID === INT8_OID && typeof val === "string") {
      processed[field.name] = parseInt(val, 10);
    } else if (field.dataTypeID === INT8_OID && typeof val === "number") {
      processed[field.name] = val;
    } else {
      processed[field.name] = val;
    }
  }
  return processed;
}

/** Convert Buffer params to Uint8Array for PGlite. */
function convertParams(
  params: readonly unknown[] | undefined,
): unknown[] | undefined {
  if (!params) return undefined;
  return params.map((p) => {
    if (Buffer.isBuffer(p)) return new Uint8Array(p);
    return p;
  });
}

// ── Flow-band labelling ─────────────────────────────────────────────

const SQL_VERB = /^\s*\(*\s*([a-z]+)/i;
const SQL_FROM = /\bfrom\s+([^\s(),;]+)/i;
const SQL_INTO = /\binto\s+([^\s(),;]+)/i;
const SQL_UPDATE = /\bupdate\s+([^\s(),;]+)/i;
const SQL_UPDATE_ONLY = /\bupdate\s+only\s+([^\s(),;]+)/i;

/** Drop quoting and the schema qualifier from a table reference. */
function bareTable(reference: string): string {
  const parts = reference.replace(/"/g, "").split(".");
  return parts.at(-1) ?? reference;
}

/** Leading verb plus primary table, or a clipped slice of the statement. */
function describeSql(sql: string): string {
  const flat = sql.replace(/\s+/g, " ").trim();
  const verbMatch = SQL_VERB.exec(flat);
  if (verbMatch === null) return flat.slice(0, 40);
  const verb = (verbMatch.at(1) ?? "").toUpperCase();

  let tableMatch: RegExpExecArray | null = null;
  if (verb === "SELECT" || verb === "DELETE") tableMatch = SQL_FROM.exec(flat);
  else if (verb === "INSERT") tableMatch = SQL_INTO.exec(flat);
  else if (verb === "UPDATE") {
    tableMatch = SQL_UPDATE.exec(flat);
    if ((tableMatch?.at(1) ?? "").toLowerCase() === "only") {
      tableMatch = SQL_UPDATE_ONLY.exec(flat);
    }
  }

  const table = tableMatch === null ? null : (tableMatch.at(1) ?? null);
  if (table === null) return verb === "" ? flat.slice(0, 40) : verb;
  return `${verb} ${bareTable(table)}`;
}

/** Hex head of a byte parameter. Full ciphertext would flood the band. */
function describeBytes(bytes: Uint8Array): string {
  const head = Array.from(bytes.slice(0, 6))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `bytes(${String(bytes.length)}) ${head}`;
}

/**
 * Render bound parameters for the band. Encrypted columns arrive as
 * ciphertext bytes, which is the point of showing them, so nothing is
 * filtered here.
 */
function previewParams(params: readonly unknown[] | undefined): string | null {
  if (params === undefined || params.length === 0) return null;
  return params
    .map((param): string => {
      if (param === null) return "null";
      if (param === undefined) return "undefined";
      if (param instanceof Uint8Array) return describeBytes(param);
      if (param instanceof Date) return param.toISOString();
      if (typeof param === "string") {
        return param.length > 24 ? `"${param.slice(0, 24)}..."` : `"${param}"`;
      }
      if (
        typeof param === "number" ||
        typeof param === "boolean" ||
        typeof param === "bigint"
      ) {
        return String(param);
      }
      return "[object]";
    })
    .join(", ");
}

/** Classify a single bound parameter into a detail row. */
function buildParamRows(
  params: readonly unknown[] | undefined,
): FlowDetailRowInput[] {
  if (params === undefined || params.length === 0) return [];
  return params.map((param, i): FlowDetailRowInput => {
    const name = `$${String(i + 1)}`;
    if (param === null || param === undefined) {
      return { name, value: String(param), kind: "metadata" };
    }
    if (param instanceof Uint8Array) {
      return {
        name,
        value: describeBytes(param),
        kind: "ciphertext",
        bytes: param.length,
      };
    }
    if (param instanceof Date) {
      return { name, value: param.toISOString(), kind: "metadata" };
    }
    if (typeof param === "string") {
      const display =
        param.length > 24 ? `"${param.slice(0, 24)}..."` : `"${param}"`;
      return { name, value: display, kind: "plaintext" };
    }
    if (
      typeof param === "number" ||
      typeof param === "boolean" ||
      typeof param === "bigint"
    ) {
      return { name, value: String(param), kind: "metadata" };
    }
    return { name, value: "[object]", kind: "metadata" };
  });
}

/** Build result-side detail rows from a PGlite result. */
function buildResultRows(
  result: Results<Record<string, unknown>>,
): FlowDetailRowInput[] {
  const rows: FlowDetailRowInput[] = [
    {
      name: "rows returned",
      value: String(result.rows.length),
      kind: "metadata",
    },
    {
      name: "column count",
      value: String(result.fields.length),
      kind: "metadata",
    },
  ];
  // affectedRows is undefined for SELECT statements
  if (result.affectedRows !== undefined) {
    rows.push({
      name: "rows affected",
      value: String(result.affectedRows),
      kind: "metadata",
    });
  }
  return rows;
}

// ── Connection serialization queue ──────────────────────────────────

class PGliteConnection implements DatabaseConnection {
  constructor(private readonly pg: PGlite) {}

  async executeQuery<R>(compiledQuery: {
    readonly sql: string;
    readonly parameters: readonly unknown[];
  }): Promise<QueryResult<R>> {
    const params = convertParams(compiledQuery.parameters);

    const sql = compiledQuery.sql;
    const result: Results<Record<string, unknown>> = await traceFlowLocal(
      {
        lane: "db",
        label: () => describeSql(sql),
        // The statement text itself, which costs nothing to produce and
        // is exact: the same parameterized query run back to back over
        // different rows folds, while two different statements never do.
        // Never displayed; the detail carries the readable SQL.
        groupKey: sql,
        payloadPreview: () => previewParams(params) ?? "",
        resultDetail: (res) =>
          buildFlowDetail({
            source: sql,
            input: buildParamRows(params),
            result: buildResultRows(res),
          }),
      },
      async (): Promise<Results<Record<string, unknown>>> =>
        this.pg.query(sql, params as unknown[]),
    );

    const fields = result.fields;
    const rows = result.rows.map((row) => processRow(row, fields));

    return {
      rows: rows as R[],
      numAffectedRows:
        result.affectedRows !== undefined
          ? BigInt(result.affectedRows)
          : undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async *streamQuery<R>(
    _compiledQuery: CompiledQuery,
    _chunkSize: number,
  ): AsyncIterableIterator<QueryResult<R>> {
    throw new DemoEngineError("Streaming is not supported by PGlite dialect");
  }
}

// ── Driver with connection serialization ────────────────────────────

class PGliteDriver implements Driver {
  private readonly connection: PGliteConnection;
  private acquireQueue: {
    resolve: (conn: DatabaseConnection) => void;
  }[] = [];
  private connectionHeld = false;

  constructor(pg: PGlite) {
    this.connection = new PGliteConnection(pg);
  }

  async init(): Promise<void> {
    // PGlite is already initialized
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    if (!this.connectionHeld) {
      this.connectionHeld = true;
      return this.connection;
    }

    // Queue the acquire: wait until the current holder releases
    return new Promise<DatabaseConnection>((resolve) => {
      this.acquireQueue.push({ resolve });
    });
  }

  async releaseConnection(): Promise<void> {
    const next = this.acquireQueue.shift();
    if (next) {
      // Hand the connection to the next waiter
      next.resolve(this.connection);
    } else {
      this.connectionHeld = false;
    }
    return Promise.resolve();
  }

  async beginTransaction(
    connection: DatabaseConnection,
    _settings: TransactionSettings,
  ): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("BEGIN"));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("COMMIT"));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("ROLLBACK"));
  }

  async destroy(): Promise<void> {
    // PGlite cleanup is handled externally
  }
}

// ── Dialect ─────────────────────────────────────────────────────────

export class PGliteDialect implements Dialect {
  private readonly pg: PGlite;

  constructor(pg: PGlite) {
    this.pg = pg;
  }

  createDriver(): Driver {
    return new PGliteDriver(this.pg);
  }

  createQueryCompiler(): QueryCompiler {
    return new PostgresQueryCompiler();
  }

  createAdapter(): DialectAdapterBase {
    return new PostgresAdapter();
  }

  createIntrospector(db: unknown): DatabaseIntrospector {
    return new PostgresIntrospector(
      db as ConstructorParameters<typeof PostgresIntrospector>[0],
    );
  }
}
