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
import { E2eError } from "./helpers";

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

  throw new E2eError(
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

  // Delete stale E2E-created tickets to prevent TICKET_ALREADY_OPEN collisions
  // and count drift in dashboard assertions. Seed tickets are created by
  // devSeedTickets and always have user-authored followups (source != 'system').
  // E2E-created tickets either have zero followups or only system followups
  // (from take/assign actions). Delete both patterns.
  console.log("[e2e] Cleaning stale E2E tickets...");
  try {
    const sql = [
      "DO $fn$ DECLARE s TEXT; BEGIN",
      `SELECT schema_name INTO s FROM orgs WHERE slug = '${E2E_ORG_SLUG}';`,
      "IF s IS NOT NULL THEN",
      // Identify non-seed tickets: those with no user-authored followups.
      "EXECUTE format('DELETE FROM %I.followups WHERE ticket_id IN (SELECT id FROM %I.tickets t WHERE NOT EXISTS (SELECT 1 FROM %I.followups f WHERE f.ticket_id = t.id AND f.source != ''system''))', s, s, s);",
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

  // Delete all KB articles. They accumulate across runs (kb-create.spec.ts
  // and kb-editor.spec.ts each create articles) and eventually push seeded
  // articles past the page size, breaking tests that look for seed titles.
  // Articles are re-created client-side by seed-data.setup.ts on each run.
  // kb_votes and kb_attachments cascade from kb_items.
  console.log("[e2e] Cleaning stale E2E KB articles...");
  try {
    const kbSql = [
      "DO $fn$ DECLARE s TEXT; BEGIN",
      `SELECT schema_name INTO s FROM orgs WHERE slug = '${E2E_ORG_SLUG}';`,
      "IF s IS NOT NULL THEN",
      "EXECUTE format('DELETE FROM %I.kb_items', s);",
      "END IF; END $fn$;",
    ].join("\n");
    execSync(`${COMPOSE} exec -T db psql -U care_y -d care_y`, {
      input: kbSql,
      stdio: ["pipe", "inherit", "inherit"],
      cwd: process.cwd(),
    });
  } catch {
    console.warn("[e2e] Could not clean stale KB articles (non-fatal)");
  }

  // Point the org at an intake queue. The seed creates queues but leaves
  // org_config.intake_queue_id null, which an admin would set during
  // onboarding. Without it every public intake submission fails with
  // IntakeQueueNotConfiguredError and the form shows a generic "didn't
  // go through" error, so no intake flow can be tested at all.
  console.log("[e2e] Ensuring intake queue is configured...");
  try {
    const queueSql = [
      "DO $fn$ DECLARE s TEXT; BEGIN",
      `SELECT schema_name INTO s FROM orgs WHERE slug = '${E2E_ORG_SLUG}';`,
      "IF s IS NOT NULL THEN",
      "EXECUTE format('UPDATE %I.org_config SET intake_queue_id = (SELECT id FROM %I.queues ORDER BY sort_order, created_at LIMIT 1) WHERE intake_queue_id IS NULL', s, s);",
      "END IF; END $fn$;",
    ].join("\n");
    execSync(
      `${COMPOSE} exec -T db psql -U care_y -d care_y -v ON_ERROR_STOP=1`,
      {
        input: queueSql,
        stdio: ["pipe", "inherit", "inherit"],
        cwd: process.cwd(),
      },
    );
  } catch {
    console.warn("[e2e] Could not configure intake queue (non-fatal)");
  }

  // Reset client communication tiers. The portal and share-link specs
  // both assume they are starting from a fresh SMS/Email client, but
  // upgrading one to Secure Link or Account persists in the org across
  // runs, after which "Set up secure link" is gone and the spec fails
  // looking for it. Each run recreates whatever channels it needs.
  console.log("[e2e] Resetting client communication tiers...");
  try {
    const tierSql = [
      "DO $fn$ DECLARE s TEXT; BEGIN",
      `SELECT schema_name INTO s FROM orgs WHERE slug = '${E2E_ORG_SLUG}';`,
      "IF s IS NOT NULL THEN",
      "EXECUTE format('DELETE FROM %I.portal_messages', s);",
      "EXECUTE format('DELETE FROM %I.portal_channels', s);",
      "EXECUTE format('DELETE FROM %I.client_accounts', s);",
      "EXECUTE format('DELETE FROM %I.share_links', s);",
      "EXECUTE format('UPDATE %I.clients SET communication_tier = ''sms_email'' WHERE communication_tier <> ''sms_email''', s);",
      "END IF; END $fn$;",
    ].join("\n");
    execSync(
      `${COMPOSE} exec -T db psql -U care_y -d care_y -v ON_ERROR_STOP=1`,
      {
        input: tierSql,
        stdio: ["pipe", "inherit", "inherit"],
        cwd: process.cwd(),
      },
    );
  } catch {
    console.warn("[e2e] Could not reset client tiers (non-fatal)");
  }

  console.log("[e2e] E2E org ready");
}
