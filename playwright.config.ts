import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "seed-data",
      testMatch: "seed-data.setup.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["seed-data"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["seed-data"],
    },
    {
      name: "webkit-mobile",
      use: { ...devices["iPhone 13"] },
      dependencies: ["seed-data"],
    },
  ],
  webServer: {
    command: "pnpm --filter @care-y/client exec vite dev --port 5174",
    url: "http://localhost:5174",
    reuseExistingServer: false,
    timeout: 120_000,
    env: { VITE_ORG_SLUG: "e2e-org" },
  },
});
