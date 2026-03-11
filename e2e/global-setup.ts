/**
 * Playwright global setup.
 *
 * Starts the tRPC API server as a child process and waits for it to accept
 * connections. Also runs the seed script if it exists. SvelteKit
 * dev server is handled by Playwright's webServer config.
 */

import { spawn, execSync } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const API_PORT = 3000;
const API_URL = `http://localhost:${String(API_PORT)}`;
const POLL_INTERVAL_MS = 250;
const MAX_WAIT_MS = 15_000;

let serverProcess: ChildProcess | null = null;

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
    `Server at ${url} did not respond within ${String(timeoutMs)}ms`,
  );
}

export default async function globalSetup(): Promise<void> {
  const rootDir = resolve(import.meta.dirname, "..");

  // Run seed script if it exists
  const seedPath = resolve(rootDir, "packages/server/src/scripts/seed.ts");
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- hardcoded path, not user input
  if (existsSync(seedPath)) {
    console.log("[e2e] Running seed script...");
    execSync("tsx --env-file=.env packages/server/src/scripts/seed.ts", {
      cwd: rootDir,
      stdio: "inherit",
    });
  }

  // Start tRPC server
  console.log("[e2e] Starting tRPC server...");
  serverProcess = spawn(
    "tsx",
    ["--env-file=.env", "packages/server/src/index.ts"],
    {
      cwd: rootDir,
      stdio: "pipe",
      shell: true,
    },
  );

  serverProcess.stdout?.on("data", (data: Buffer) => {
    process.stdout.write(`[api] ${data.toString()}`);
  });

  serverProcess.stderr?.on("data", (data: Buffer) => {
    process.stderr.write(`[api:err] ${data.toString()}`);
  });

  // Store PID so global-teardown can kill it
  process.env.E2E_API_PID = String(serverProcess.pid);

  await waitForServer(API_URL, MAX_WAIT_MS);
  console.log("[e2e] tRPC server ready");
}
