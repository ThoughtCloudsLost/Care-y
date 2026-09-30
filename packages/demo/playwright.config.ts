import { defineConfig, devices } from "@playwright/test";

// Boots the demo in a real browser, once under the dev server and once
// against the built dist. The two load modules in different orders (the
// dev server serves each module on its own and prebundles dependencies
// into shared chunks; the build bundles them), so a load-order fault can
// show up in either one alone. The preview project needs a prior
// "pnpm --filter @care-y/demo run build".

const isCi = process.env.CI === "true";
const DEV_PORT = 5190;
const PREVIEW_PORT = 5191;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: isCi,
  retries: 0,
  workers: 1,
  reporter: isCi ? "list" : "html",
  timeout: 90_000,
  use: {
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "dev",
      use: { baseURL: `http://localhost:${String(DEV_PORT)}` },
    },
    {
      name: "preview",
      use: { baseURL: `http://localhost:${String(PREVIEW_PORT)}` },
    },
  ],
  webServer: [
    {
      command: `pnpm --filter @care-y/client run build:paraglide && vite --port ${String(DEV_PORT)} --strictPort`,
      url: `http://localhost:${String(DEV_PORT)}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `vite preview --port ${String(PREVIEW_PORT)} --strictPort`,
      url: `http://localhost:${String(PREVIEW_PORT)}`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
