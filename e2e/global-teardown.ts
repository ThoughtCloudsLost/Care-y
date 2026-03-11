/**
 * Playwright global teardown.
 *
 * Kills the tRPC API server started by global-setup.
 */

export default async function globalTeardown(): Promise<void> {
  const pid = process.env.E2E_API_PID;
  if (!pid) return;

  console.log(`[e2e] Stopping tRPC server (PID ${pid})...`);

  try {
    process.kill(Number(pid), "SIGTERM");
  } catch {
    // Process already exited
  }
}
