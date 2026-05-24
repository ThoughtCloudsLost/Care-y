/**
 * Playwright global teardown.
 *
 * No-op. Docker services and the e2e org stay running for fast re-runs.
 * To reset the e2e org: pnpm dev:db:clean (wipes everything).
 */

export default async function globalTeardown(): Promise<void> {
  // The e2e org persists in the dev DB for fast re-runs.
  // The seed is idempotent, so the next run skips existing data.
}
