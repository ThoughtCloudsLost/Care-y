/**
 * One-step dev environment setup. Cross-platform (macOS, Linux, Windows).
 *
 * Builds containers, runs migrations, bootstraps the dev org.
 * By default, only the org row + tenant schema are created (no users or
 * data), so the onboarding wizard is the entry point.
 *
 * Usage:
 *   pnpm dev:setup               # bootstrap only (org + schema, no seed)
 *   pnpm dev:setup --seed        # full seed (admin user, queues, clients, etc.)
 *   pnpm dev:setup --skip-build  # skip container rebuild (faster)
 *
 * Flags can be combined: pnpm dev:setup --skip-build --seed
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const skipBuild = process.argv.includes("--skip-build");
const fullSeed = process.argv.includes("--seed");

// Check /etc/hosts for dev hostname (needed for WebAuthn on mobile).
// Reads TAILSCALE_IP from client/.env.local so the hint is correct per-machine.
const DEV_HOSTNAME = "dev.care-y.local";
try {
  const hosts = readFileSync("/etc/hosts", "utf8");
  if (!hosts.includes(DEV_HOSTNAME)) {
    let ip = "YOUR_TAILSCALE_IP";
    try {
      const envLocal = readFileSync("packages/client/.env.local", "utf8");
      const m = envLocal.match(/^TAILSCALE_IP=(.+)$/m);
      if (m) ip = m[1].trim();
    } catch {
      // .env.local not set up yet
    }
    console.log(
      `\x1b[33m  ⚠ Missing /etc/hosts entry for ${DEV_HOSTNAME}\x1b[0m`,
    );
    console.log(`  WebAuthn (passkeys) won't work on mobile without it.`);
    console.log(
      `  Run once: sudo sh -c 'echo "${ip}   ${DEV_HOSTNAME}" >> /etc/hosts'\n`,
    );
  }
} catch {
  // /etc/hosts unreadable
}

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

// 5. Seed or bootstrap
if (fullSeed) {
  run("Seeding dev data", `${serverExec} tsx src/scripts/seed.ts`);
} else {
  run(
    "Bootstrapping dev org",
    `${serverExec} tsx src/scripts/seed.ts --bootstrap-only`,
  );
}

// 6. Tenant migrations (new schemas). On fresh DB the seed just created an
//    org schema that needs its table migrations applied.
run(
  "Running tenant migrations (new schemas)",
  `${serverExec} tsx src/db/migrate.ts --all-schemas`,
);

if (fullSeed) {
  console.log(`
==> Dev environment ready.
    API:     http://localhost:3000
    Mailpit: http://localhost:8025
    Dev org:  dev-org
    Admin:    admin.dev / dev-password-1234!

    Seeded: org, admin user, phone, queues, 120 clients (generated aliases)

    Start client:  pnpm --filter @care-y/client dev
    Run E2E tests: npx playwright test
`);
} else {
  console.log(`
==> Dev environment ready (bootstrap only).
    API:     http://localhost:3000
    Mailpit: http://localhost:8025
    Dev org:  dev-org (no users, no data)

    The setup URL (with token) was printed above by the seed script.
    After onboarding, run "pnpm seed" for test data.

    Start client:  pnpm --filter @care-y/client dev
    Mobile:        pnpm --filter @care-y/client dev:mobile
`);
}
