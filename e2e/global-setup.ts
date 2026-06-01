/**
 * Playwright global setup.
 *
 * 1. Verifies the Docker API server is running (started by `pnpm dev:setup`).
 * 2. Seeds the e2e org (`e2e-org`) if it doesn't exist. The seed is idempotent,
 *    so repeated runs are fast. The e2e org uses a separate tenant schema from
 *    the dev org (`dev-org`), keeping manual test data untouched.
 *
 * SvelteKit dev server is handled by Playwright's webServer config, which sets
 * VITE_ORG_SLUG=e2e-org so the Vite proxy and tRPC client resolve to the
 * e2e tenant schema.
 */

import { execSync } from "node:child_process";

const API_PORT = 3000;
const API_URL = `http://localhost:${String(API_PORT)}`;
const POLL_INTERVAL_MS = 250;
const MAX_WAIT_MS = 30_000;

const E2E_ORG_SLUG = "e2e-org";
const COMPOSE = "docker compose";
const SERVER_EXEC = `${COMPOSE} exec -e SEED_ORG_SLUG=${E2E_ORG_SLUG} app pnpm --filter @care-y/server exec`;

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(
    `Server at ${url} did not respond within ${String(timeoutMs)}ms. Run 'pnpm dev:setup' first.`,
  );
}

function run(label: string, cmd: string): void {
  console.log(`[e2e] ${label}...`);
  execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
}

export default async function globalSetup(): Promise<void> {
  console.log("[e2e] Waiting for Docker API server...");
  await waitForServer(`${API_URL}/health`, MAX_WAIT_MS);
  console.log("[e2e] tRPC server ready");

  console.log(`[e2e] Seeding e2e org (${E2E_ORG_SLUG})...`);
  run(
    "Running tenant migrations",
    `${SERVER_EXEC} tsx src/db/migrate.ts --all-schemas`,
  );
  run(`Seeding ${E2E_ORG_SLUG}`, `${SERVER_EXEC} tsx src/scripts/seed.ts`);
  run(
    "Running tenant migrations (new schemas)",
    `${SERVER_EXEC} tsx src/db/migrate.ts --all-schemas`,
  );

  // Delete stale E2E-created tickets to prevent TICKET_ALREADY_OPEN collisions.
  // E2E-created tickets have zero followups, while seed tickets always have
  // at least one (devAutoLogin creates messages during seed).
  // Pipe SQL via stdin to avoid shell quoting issues with PL/pgSQL $$ blocks.
  console.log("[e2e] Cleaning stale E2E tickets...");
  try {
    const sql = [
      "DO $fn$ DECLARE s TEXT; BEGIN",
      `SELECT schema_name INTO s FROM orgs WHERE slug = '${E2E_ORG_SLUG}';`,
      "IF s IS NOT NULL THEN",
      "EXECUTE format('DELETE FROM %I.ticket_key_wraps WHERE ticket_id IN (SELECT id FROM %I.tickets t WHERE NOT EXISTS (SELECT 1 FROM %I.followups f WHERE f.ticket_id = t.id))', s, s, s);",
      "EXECUTE format('DELETE FROM %I.ticket_watchers WHERE ticket_id IN (SELECT id FROM %I.tickets t WHERE NOT EXISTS (SELECT 1 FROM %I.followups f WHERE f.ticket_id = t.id))', s, s, s);",
      "EXECUTE format('DELETE FROM %I.ticket_read_cursors WHERE ticket_id IN (SELECT id FROM %I.tickets t WHERE NOT EXISTS (SELECT 1 FROM %I.followups f WHERE f.ticket_id = t.id))', s, s, s);",
      "EXECUTE format('DELETE FROM %I.tickets t WHERE NOT EXISTS (SELECT 1 FROM %I.followups f WHERE f.ticket_id = t.id)', s, s);",
      "END IF; END $fn$;",
    ].join("\n");
    execSync(`${COMPOSE} exec -T db psql -U care_y -d care_y`, {
      input: sql,
      stdio: ["pipe", "inherit", "inherit"],
      cwd: process.cwd(),
    });
  } catch {
    console.warn("[e2e] Could not clean stale tickets (non-fatal)");
  }

  console.log("[e2e] E2E org ready");
}
