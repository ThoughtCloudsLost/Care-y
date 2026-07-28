/**
 * Shim for packages/server/src/db/db.ts
 *
 * Exports the same surface (db, tenantDb) backed by PGlite.
 * The PGlite instance is set by the engine before any imports run.
 *
 * Mirrors: packages/server/src/db/db.ts:1-39
 */

import { DemoEngineError } from "../errors.js";
import { Kysely } from "kysely";
import type {
  PlatformDatabase,
  TenantDatabase,
} from "../../../../../server/src/db/types.js";
import { PGliteDialect } from "./pglite-dialect.js";
import type { PGlite } from "@electric-sql/pglite";

let _db: Kysely<PlatformDatabase> | null = null;

/**
 * Called by engine.ts after PGlite is constructed but before any code
 * that imports `db` or `tenantDb` runs.
 */
export function initDb(pg: PGlite): void {
  _db = new Kysely<PlatformDatabase>({
    dialect: new PGliteDialect(pg),
  });
}

export function getDb(): Kysely<PlatformDatabase> {
  if (!_db) {
    throw new DemoEngineError("DB shim: initDb() has not been called yet");
  }
  return _db;
}

// Lazy getter. Module-level `db` is accessed after initDb has been called.
// Using a getter property on a proxy so imports see the live value.

/** Platform-level Kysely instance. */
export const db: Kysely<PlatformDatabase> = new Proxy(
  {} as Kysely<PlatformDatabase>,
  {
    get(_target, prop) {
      // Receiver must be the real instance: Kysely's getters read #private
      // fields, which throw if invoked with the Proxy as `this`.
      const real = getDb();
      const value: unknown = Reflect.get(real, prop, real);
      if (typeof value === "function") {
        return (value as (...args: unknown[]) => unknown).bind(real);
      }
      return value;
    },
  },
);

/** Returns a schema-scoped Kysely instance for a tenant schema. */
export function tenantDb(orgSchema: string): Kysely<TenantDatabase> {
  return getDb().withSchema(orgSchema) as unknown as Kysely<TenantDatabase>;
}
