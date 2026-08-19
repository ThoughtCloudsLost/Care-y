import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the demo scroll-story suite. Spins up the
 * demo Vite dev server on :5175 and runs a single serial Chromium
 * project that walks every section and sub-section.
 */
export default defineConfig({
  testDir: "e2e-demo",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:5175",
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Spelled out instead of `run dev -- --port ...`: pnpm forwards the
    // "--" separator into the compound script, so vite would treat the
    // flags as positional arguments and stay on its default port.
    command:
      "pnpm --filter @care-y/client run build:paraglide && pnpm --filter @care-y/demo exec vite --port 5175 --strictPort",
    url: "http://localhost:5175",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
