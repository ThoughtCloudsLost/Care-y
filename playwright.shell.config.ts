import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for frontend-only tests (no API server, no DB).
 * Used for shell architecture, design system, and layout tests that
 * only need the SvelteKit dev server.
 */
export default defineConfig({
  testDir: "e2e",
  testMatch: /shell|smoke/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  webServer: {
    command: "pnpm --filter @care-y/client dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
