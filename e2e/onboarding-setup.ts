/**
 * Playwright setup project for onboarding E2E tests.
 *
 * Creates a bare org (schema + migrations, no admin/keypair/data) for testing
 * the full setup wizard from scratch. Captures the setup token and writes it
 * to .auth/setup-token.txt for onboarding.spec.ts to read.
 *
 * The e2e-onboard schema is dropped by global-teardown.ts after each run.
 */

import { test as setup, expect } from "@playwright/test";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { E2eError } from "./helpers";

const ONBOARD_ORG_SLUG = "e2e-onboard";
const AUTH_DIR = join(process.cwd(), ".auth");
const SETUP_TOKEN_PATH = join(AUTH_DIR, "setup-token.txt");
const ORG_ID_PATH = join(AUTH_DIR, "onboard-org-id.txt");

const COMPOSE = "docker compose";
const DB_EXEC = `${COMPOSE} exec -T db psql -U care_y -d care_y`;
const SERVER_EXEC = [
  COMPOSE,
  "exec",
  `-e SEED_ORG_SLUG=${ONBOARD_ORG_SLUG}`,
  "-e SEED_SKIP_ADMIN=1",
  "app pnpm --filter @care-y/server exec",
].join(" ");

setup("provision bare onboarding org", () => {
  setup.setTimeout(60_000);

  // Clean up stale e2e-onboard org from a previous crashed run.
  // Drop the tenant schema first (if it exists), then delete the orgs row.
  console.log("[onboarding-setup] Cleaning stale e2e-onboard org...");
  try {
    const cleanupSql = [
      "DO $fn$ DECLARE s TEXT; BEGIN",
      `SELECT schema_name INTO s FROM orgs WHERE slug = '${ONBOARD_ORG_SLUG}';`,
      "IF s IS NOT NULL THEN",
      "EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', s);",
      `DELETE FROM orgs WHERE slug = '${ONBOARD_ORG_SLUG}';`,
      "END IF; END $fn$;",
    ].join("\n");
    execSync(DB_EXEC, {
      input: cleanupSql,
      stdio: ["pipe", "inherit", "inherit"],
      cwd: process.cwd(),
    });
  } catch {
    console.warn("[onboarding-setup] Stale cleanup failed (non-fatal)");
  }

  // Seed the bare org. SEED_SKIP_ADMIN=1 creates org + migrations but no
  // admin user, keypair, queues, clients, KB, or note types.
  console.log("[onboarding-setup] Seeding bare onboarding org...");
  const seedCmd = `${SERVER_EXEC} tsx src/scripts/seed.ts`;

  const seedOutput = execSync(seedCmd, {
    cwd: process.cwd(),
    encoding: "utf-8",
    timeout: 30_000,
  });

  console.log("[onboarding-setup] Seed output:", seedOutput);

  // Parse ORG_ID and SETUP_TOKEN from seed stdout.
  const orgIdMatch = /^ORG_ID=(.+)$/m.exec(seedOutput);
  const tokenMatch = /^SETUP_TOKEN=(.+)$/m.exec(seedOutput);

  const orgId = orgIdMatch?.[1]?.trim();
  const setupToken = tokenMatch?.[1]?.trim();

  expect(orgId, "Seed script must output ORG_ID=<uuid>").toBeTruthy();
  expect(
    setupToken,
    "Seed script must output SETUP_TOKEN=<token>",
  ).toBeTruthy();

  if (orgId === undefined || setupToken === undefined) {
    throw new E2eError("Seed output parsing failed (unreachable after expect)");
  }

  console.log(
    `[onboarding-setup] org=${orgId}, token=${setupToken.slice(0, 8)}...`,
  );

  // Write token and org ID to .auth/ for onboarding specs.
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, path is constant
  mkdirSync(AUTH_DIR, { recursive: true });
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, path is constant
  writeFileSync(SETUP_TOKEN_PATH, setupToken, "utf-8");
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, path is constant
  writeFileSync(ORG_ID_PATH, orgId, "utf-8");

  console.log(
    "[onboarding-setup] Setup token written to .auth/setup-token.txt",
  );
  console.log("[onboarding-setup] Org ID written to .auth/onboard-org-id.txt");
});
