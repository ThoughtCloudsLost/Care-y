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
import { queryDb } from "./db-probe";

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

/**
 * Run a SQL statement against the e2e org's tenant schema. Wraps queryDb
 * in a try/catch so a failing step logs a warning but does not abort the
 * entire setup (the same non-fatal contract the old inline blocks had).
 */
function setupSql(label: string, sql: string): void {
  console.log(`[e2e] ${label}...`);
  try {
    queryDb(sql);
  } catch {
    console.warn(`[e2e] Could not ${label.toLowerCase()} (non-fatal)`);
  }
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

  // Give the e2e org a client-facing name (org_config.name, plaintext per
  // ADR-094) so branding assertions can verify the real data flow:
  // org_config -> getPublicBranding -> client shell navbar. Idempotent.
  setupSql(
    "Setting e2e org display name",
    "UPDATE org_config SET name = 'E2E Test Org';",
  );

  // Delete ALL tickets. Same reasoning as the KB wipe below: tickets
  // created by specs (lifecycle, create, intake) accumulate across runs
  // because a surgical "non-seed ticket" discriminator cannot keep up
  // with every path that adds followups. The accumulated OPEN tickets
  // make createTicket churn through client search terms (every seeded
  // client already has an open ticket) and drift dashboard counts.
  // Every ticket-rooted table (followups, wraps, watchers, cursors,
  // attachments, recordings, portal_messages via followups) is ON
  // DELETE CASCADE, and seed-data.setup.ts re-creates the 14 seed
  // tickets each run (devSeedTickets seeds per-client when the client
  // has no ticket).
  setupSql("Cleaning E2E tickets", "DELETE FROM tickets;");

  // Delete all KB articles. They accumulate across runs (kb-create.spec.ts
  // and kb-editor.spec.ts each create articles) and eventually push seeded
  // articles past the page size, breaking tests that look for seed titles.
  // Articles are re-created client-side by seed-data.setup.ts on each run.
  // kb_votes and kb_attachments cascade from kb_items.
  setupSql("Cleaning stale E2E KB articles", "DELETE FROM kb_items;");

  // Delete non-default intake forms from prior runs. The multi-form routing
  // spec creates forms with known slugs (e2e-form-alpha, e2e-form-beta).
  // Stale forms cause slug-uniqueness conflicts on the next run.
  // intake_form_fields cascade from intake_forms via FK.
  setupSql(
    "Cleaning stale E2E intake forms",
    [
      "DELETE FROM intake_form_responses WHERE form_id IN (SELECT id FROM intake_forms WHERE is_default = false);",
      "DELETE FROM intake_forms WHERE is_default = false;",
    ].join("\n"),
  );

  // Point the org at an intake queue. The seed creates queues but leaves
  // org_config.intake_queue_id null, which an admin would set during
  // onboarding. Without it every public intake submission fails with
  // IntakeQueueNotConfiguredError and the form shows a generic "didn't
  // go through" error, so no intake flow can be tested at all.
  setupSql(
    "Ensuring intake queue is configured",
    "UPDATE org_config SET intake_queue_id = (SELECT id FROM queues ORDER BY sort_order, created_at LIMIT 1) WHERE intake_queue_id IS NULL;",
  );

  // Reset client communication tiers. The portal and share-link specs
  // both assume they are starting from a fresh SMS/Email client, but
  // upgrading one to Secure Link or Account persists in the org across
  // runs, after which "Set up secure link" is gone and the spec fails
  // looking for it. Each run recreates whatever channels it needs.
  setupSql(
    "Resetting communication tiers",
    [
      "DELETE FROM portal_messages;",
      "DELETE FROM portal_channels;",
      "DELETE FROM client_accounts;",
      "DELETE FROM share_links;",
      "UPDATE clients SET communication_tier = 'sms_email' WHERE communication_tier <> 'sms_email';",
    ].join("\n"),
  );

  // Clear per-run activity records. Every block above deletes an entity
  // specs create directly; these are the byproducts of running them at
  // all. A full suite writes an audit row per mutation, a session per
  // login (thirty-odd), and a recent-view per ticket opened, and nothing
  // anywhere removes them, so they are the part of the org that grows
  // without bound. An org left to accumulate reached the point where the
  // ticket list took tens of seconds to mount, which reads as a hung
  // navigation rather than as slow data: the URL simply never changes and
  // the assertion times out. Rebuilding the org fixed it, which also means
  // the specific table responsible was never isolated; the bound matters
  // more than the culprit.
  //
  // Nothing here is seed data or a fixture any spec expects to find
  // already present; each run recreates whatever it needs. Emails are
  // filtered rather than truncated because clients.email_id references
  // them without a cascade. Ticket-rooted activity (notification_outbox,
  // ticket_read_cursors, followup_reactions, intake_key_wraps) already
  // cascades from the ticket wipe above and is not repeated here.
  setupSql(
    "Clearing per-run activity records",
    [
      "DELETE FROM audit_log;",
      "DELETE FROM sessions;",
      "DELETE FROM user_recent_views;",
      "DELETE FROM merge_candidate_dismissals;",
      "DELETE FROM client_merge_events;",
      "DELETE FROM tracked_calls;",
      "DELETE FROM voicemail_quarantine;",
      "DELETE FROM push_subscriptions;",
      "DELETE FROM push_challenges;",
      "DELETE FROM invite_tokens;",
      "DELETE FROM emails AS e WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.email_id = e.id);",
    ].join("\n"),
  );

  console.log("[e2e] E2E org ready");
}
