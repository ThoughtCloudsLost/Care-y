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

import { HealthCheckError } from "../errors.js";
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

// ── Connection serialization queue ──────────────────────────────────

class PGliteConnection implements DatabaseConnection {
  constructor(private readonly pg: PGlite) {}

  async executeQuery<R>(compiledQuery: {
    readonly sql: string;
    readonly parameters: readonly unknown[];
  }): Promise<QueryResult<R>> {
    const params = convertParams(compiledQuery.parameters);

    const result: Results<Record<string, unknown>> = await this.pg.query(
      compiledQuery.sql,
      params as unknown[],
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
  async *streamQuery(): AsyncIterableIterator<QueryResult<unknown>> {
    throw new HealthCheckError("Streaming is not supported by PGlite dialect");
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
    await connection.executeQuery({ sql: "BEGIN", parameters: [] });
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery({ sql: "COMMIT", parameters: [] });
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery({ sql: "ROLLBACK", parameters: [] });
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
      db as Parameters<typeof PostgresIntrospector.prototype.constructor>[0],
    );
  }
}
