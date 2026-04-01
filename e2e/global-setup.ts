/**
 * Playwright global setup.
 *
 * Verifies the Docker API server is running (started by `pnpm dev:setup`).
 * dev:setup handles containers, migrations, and seed data. Auto-login
 * handles crypto key registration, login, and test ticket seeding on
 * first browser page load. SvelteKit dev server is handled by
 * Playwright's webServer config.
 */

const API_PORT = 3000;
const API_URL = `http://localhost:${String(API_PORT)}`;
const POLL_INTERVAL_MS = 250;
const MAX_WAIT_MS = 30_000;

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

export default async function globalSetup(): Promise<void> {
  console.log("[e2e] Waiting for Docker API server...");
  await waitForServer(`${API_URL}/health`, MAX_WAIT_MS);
  console.log("[e2e] tRPC server ready");
}
