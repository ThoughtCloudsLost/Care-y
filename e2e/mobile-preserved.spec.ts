import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { CRYPTO_TIMEOUT, login } from "./helpers";

test.describe.serial("Mobile Layout Preserved (regression)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);

    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "mobile-preserved");
    await page.close();
  });

  // ── No sidebar at mobile ───────────────────────────────────────────

  test("sidebar is not rendered at mobile viewport", async () => {
    const sidebar = page.locator(".desktop-sidebar");
    await expect(sidebar).toHaveCount(0);
  });

  // ── Bottom tabbar present ──────────────────────────────────────────

  test("bottom tabbar is visible at mobile", async () => {
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();

    for (const name of ["Overview", "Tickets", "Library"]) {
      await expect(tablist.getByRole("tab", { name })).toBeAttached();
    }
  });

  // ── Account button in navbar ───────────────────────────────────────

  test("account button is visible in navbar at mobile", async () => {
    const accountBtn = page.getByRole("button", { name: "Account" });
    await expect(accountBtn).toBeVisible();
  });

  // ── No split view at mobile ────────────────────────────────────────

  test("ticket list renders full-page, not split view", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");

    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // No split view container.
    const splitContainer = page.locator(".split-view-container");
    await expect(splitContainer).toHaveCount(0);
  });

  test("tapping ticket navigates to full-page detail", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    const card = page.locator("button.card-open-link").first();
    await card.click();

    // Full-page navigation to /tickets/{id}, not shallow routing.
    await expect(page).toHaveURL(/\/tickets\/[0-9a-f-]{36}/);

    // Navigate back.
    await page.getByRole("button", { name: /back/i }).click();
    await expect(page).toHaveURL("/tickets");
  });

  // ── No split view in library ───────────────────────────────────────

  test("library renders full-page, not split view", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    await page.getByRole("tab", { name: "Library" }).click();
    await expect(page).toHaveURL("/library");
    await page.waitForTimeout(2_000);

    const splitContainer = page.locator(".split-view-container");
    await expect(splitContainer).toHaveCount(0);
  });

  // ── Dashboard single column ────────────────────────────────────────

  test("dashboard is single column at mobile", async () => {
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page).toHaveURL("/");

    const dashboard = page.locator(".dashboard");
    const display = await dashboard.evaluate(
      (el) => window.getComputedStyle(el).display,
    );
    // At mobile, dashboard uses block or flex, not grid.
    expect(display).not.toBe("grid");
  });

  // ── Keyboard shortcuts not active at mobile ────────────────────────

  test("number key shortcuts do not switch tabs at mobile", async () => {
    await page.locator("body").click();
    await page.waitForTimeout(200);

    // Press "2" which would switch to Tickets at desktop.
    await page.keyboard.press("2");
    await page.waitForTimeout(500);

    // Should still be on dashboard (shortcuts only activate at desktop).
    await expect(page).toHaveURL("/");
  });
});
