/**
 * Playwright global teardown.
 *
 * No-op. Docker services stay running (started by `pnpm dev:setup`).
 */

export default async function globalTeardown(): Promise<void> {
  // Docker services are managed externally. Nothing to clean up.
}
