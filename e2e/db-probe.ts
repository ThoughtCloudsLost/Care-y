/**
 * Minimal DB probe for e2e assertions that need to inspect database state.
 *
 * Uses `docker compose exec -T db psql` (the same pattern as global-setup.ts)
 * to run SQL against the e2e tenant schema. This avoids importing any server
 * code or database driver into the Playwright process.
 *
 * NEVER log or return PII or ciphertext content from queries. Only use this
 * for structural assertions (row counts, column existence, null checks).
 */

import { execSync } from "node:child_process";

const COMPOSE = "docker compose";
const E2E_ORG_SLUG = "e2e-org";

/**
 * Run a SQL query against the e2e org's tenant schema and return stdout.
 * The query is executed inside the Docker db container via psql.
 * Output format is unaligned tuples (-t -A) for easy parsing.
 */
export function queryDb(sql: string): string {
  // Resolve the tenant schema name for the e2e org, then run the query
  // within that schema. The DO block sets the search_path so callers
  // can reference tenant tables without schema qualification.
  const wrapped = [
    "DO $probe$ DECLARE s TEXT; BEGIN",
    `SELECT schema_name INTO s FROM orgs WHERE slug = '${E2E_ORG_SLUG}';`,
    "IF s IS NULL THEN RAISE EXCEPTION 'e2e org not found'; END IF;",
    `EXECUTE format('SET search_path TO %I, public', s);`,
    "END $probe$;",
    sql,
  ].join("\n");

  const result = execSync(
    `${COMPOSE} exec -T db psql -U care_y -d care_y -t -A`,
    {
      input: wrapped,
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    },
  );

  return result.trim();
}

/**
 * Count rows in a tenant table matching an optional WHERE clause.
 */
export function countRows(table: string, where?: string): number {
  const clause = where != null ? ` WHERE ${where}` : "";
  const result = queryDb(`SELECT count(*) FROM ${table}${clause};`);
  return Number(result);
}
