import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { CRYPTO_TIMEOUT, login } from "./helpers";

test.describe.serial("1d-smoke", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "1d-smoke");
    await page.close();
  });

  test("page loads and renders shell structure", async () => {
    // Konsta App root renders
    const appRoot = page.locator('[data-testid="app-root"]').first();
    await expect(appRoot).toBeVisible();

    // Main content landmark exists
    const main = page.locator("main");
    await expect(main).toBeAttached();

    // At desktop (1280px), the sidebar replaces the bottom tabbar.
    // Both render a tablist with the same tabs.
    const tabbar = page.getByRole("tablist");
    await expect(tabbar).toBeAttached();

    for (const name of ["Overview", "Tickets", "Library"]) {
      await expect(tabbar.getByRole("tab", { name })).toBeAttached();
    }
  });

  test("default theme is iOS and dark mode", async () => {
    // data-ui-theme is the app's documented theme contract on the App
    // root (ThemeProvider.svelte), asserted instead of Konsta's
    // internal .k-* classes.
    const appRoot = page.locator('[data-testid="app-root"]').first();
    await expect(appRoot).toHaveAttribute("data-ui-theme", "ios");

    // Dark mode is observable through the root color-scheme, which the
    // theme store sets (theme.svelte.ts applyScheme) and the browser
    // consumes when rendering native widgets and scrollbars.
    const colorScheme = await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    );
    expect(colorScheme).toBe("dark");
  });
});
