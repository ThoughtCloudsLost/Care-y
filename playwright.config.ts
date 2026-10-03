import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Coverage-mode runs carry V8-coverage overhead on an 8 GB machine and
  // flake on tight timeouts under load (disjoint single-test failures per
  // run); one retry absorbs that the same way CI's retries do. Plain local
  // runs keep zero retries so regressions stay loud.
  retries: process.env.CI ? 2 : process.env.E2E_COVERAGE ? 1 : 0,
  workers: 1,
  reporter: "html",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  timeout: 90_000,
  use: {
    baseURL: "http://localhost:5174",
    // On a runner the first attempt is the one worth reading, and a retry
    // of the seed setup cannot pass (see the seed-data project), so CI keeps
    // the trace of any failed attempt. Locally the first retry is enough.
    trace: process.env.CI ? "retain-on-failure" : "on-first-retry",
  },
  projects: [
    // ── Main E2E suite (e2e-org, fully seeded) ──
    {
      name: "seed-data",
      testMatch: "seed-data.setup.ts",
      use: { ...devices["Desktop Chrome"] },
      // A retry re-runs the seed replay, which issues a new org key; the
      // seed volunteer's wrap from the first attempt is then stale and the
      // locked ticket step cannot decrypt a queue name. A retry can never
      // pass, so it only hides the first attempt's failure and costs minutes.
      retries: 0,
    },
    {
      name: "chromium",
      testIgnore: /onboarding|first-login|mobile-preserved/,
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["seed-data"],
    },
    {
      name: "firefox",
      testIgnore: /onboarding|first-login|mobile-preserved/,
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["seed-data"],
    },
    {
      name: "webkit-mobile",
      testIgnore: /onboarding|first-login|desktop-layout/,
      use: { ...devices["iPhone 13"] },
      dependencies: ["seed-data"],
    },
    // ── Onboarding E2E suite (e2e-onboard, bare org) ──
    {
      name: "onboarding-setup",
      testMatch: "onboarding-setup.ts",
    },
    {
      name: "onboarding",
      testMatch: "onboarding.spec.ts",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["onboarding-setup"],
    },
    {
      name: "first-login",
      testMatch: "first-login.spec.ts",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["onboarding"],
    },
  ],
  webServer: {
    command: "pnpm --filter @care-y/client exec vite dev --port 5174",
    url: "http://localhost:5174",
    reuseExistingServer: false,
    // Surface the dev server's own log in the run output: "/trpc" proxy
    // errors and "new dependencies optimized" reload notices are invisible
    // in both the app container logs and the page, and full-run triage
    // needed exactly these lines. stderr is piped by default; stdout is not.
    stdout: "pipe",
    timeout: 120_000,
    env: { VITE_ORG_SLUG: "e2e-org", VITE_E2E_FAST_KDF: "1" },
  },
});
