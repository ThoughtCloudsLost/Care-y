/**
 * Playwright global teardown.
 *
 * The main e2e-org persists for fast re-runs (idempotent seed).
 * The e2e-onboard org is dropped after each run so onboarding tests
 * always start against a fresh, empty org.
 */

import { execSync } from "node:child_process";

const ONBOARD_ORG_SLUG = "e2e-onboard";
const COMPOSE = "docker compose";
const DB_EXEC = `${COMPOSE} exec -T db psql -U care_y -d care_y`;

export default async function globalTeardown(): Promise<void> {
  // Drop the e2e-onboard tenant schema and orgs row.
  // Failures are non-fatal (the org may not exist if onboarding tests weren't run).
  try {
    const sql = [
      "DO $fn$ DECLARE s TEXT; BEGIN",
      `SELECT schema_name INTO s FROM orgs WHERE slug = '${ONBOARD_ORG_SLUG}';`,
      "IF s IS NOT NULL THEN",
      "EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', s);",
      `DELETE FROM orgs WHERE slug = '${ONBOARD_ORG_SLUG}';`,
      "END IF; END $fn$;",
    ].join("\n");
    execSync(DB_EXEC, {
      input: sql,
      stdio: ["pipe", "inherit", "inherit"],
      cwd: process.cwd(),
    });
    console.log("[teardown] Dropped e2e-onboard org");
  } catch {
    console.warn("[teardown] Could not drop e2e-onboard org (non-fatal)");
  }
}
