/**
 * One-step dev environment setup. Cross-platform (macOS, Linux, Windows).
 *
 * Builds containers, runs migrations, seeds the database, starts everything.
 *
 * Usage:
 *   pnpm dev:setup               # full setup (build + migrate + seed)
 *   pnpm dev:setup --skip-build  # skip rebuild (faster, uses existing images)
 *
 * After this completes:
 *   - tRPC server at http://localhost:3000 (Docker)
 *   - PostgreSQL running (internal, not exposed to host)
 *   - OPRF sidecars running
 *   - Mailpit UI at http://localhost:8025
 *   - Dev org "dev-org" and admin user "admin@dev.local" seeded
 *   - Start the client separately: pnpm --filter @care-y/client dev
 */

import { execSync } from "node:child_process";

const skipBuild = process.argv.includes("--skip-build");

function run(label, cmd) {
  console.log(`  ${label}...`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
  } catch {
    console.error(`\n  FAILED: ${label}`);
    console.error(`  Command: ${cmd}\n`);
    process.exit(1);
  }
}

const compose = "docker compose";
const app = "app";
const serverExec = `${compose} exec ${app} pnpm --filter @care-y/server exec`;

console.log("==> Starting dev environment...\n");

// 1. Build and start containers
if (skipBuild) {
  run("Starting containers (skip build)", `${compose} up -d`);
} else {
  run("Building and starting containers", `${compose} up -d --build`);
}

// 2. Wait for DB (compose depends_on handles it, but verify explicitly)
run(
  "Waiting for database",
  `${compose} exec db pg_isready -U postgres -q --timeout=30`,
);

// 3. Platform migrations
run(
  "Running platform migrations",
  `${serverExec} tsx src/db/migrate.ts --platform`,
);

// 4. Tenant migrations (existing org schemas). Migrates tables before seed
//    writes to them. No-ops on a fresh DB (no org schemas yet).
run(
  "Running tenant migrations",
  `${serverExec} tsx src/db/migrate.ts --all-schemas`,
);

// 5. Seed dev data (idempotent: creates org/schema if needed, then data)
run("Seeding dev data", `${serverExec} tsx src/scripts/seed.ts`);

// 6. Tenant migrations (new schemas). On fresh DB the seed just created an
//    org schema that needs its table migrations applied.
run(
  "Running tenant migrations (new schemas)",
  `${serverExec} tsx src/db/migrate.ts --all-schemas`,
);

console.log(`
==> Dev environment ready.
    API:     http://localhost:3000
    Mailpit: http://localhost:8025
    Dev org:  dev-org
    Admin:    admin.dev / dev-password-1234!

    Seeded: org, admin user, phone, queues, 12 clients (generated aliases)
    Crypto, org keypair rotation, KB articles, and tickets are created by
    auto-login on first browser page load.

    Start client:  pnpm --filter @care-y/client dev
    Run E2E tests: npx playwright test
`);
