import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login } from "./helpers";

test.describe.serial("Universal Search", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "search");
    await page.close();
  });

  // ── 1. Sheet opening ───────────────────────────────────────────

  test("search icon opens sheet with recents/hint", async () => {
    // Tap search icon in the navbar.
    await page.getByRole("button", { name: "Search" }).click();

    // Sheet should slide up with the hint text (no recents on fresh session).
    const sheet = page.locator("[role='search']");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText(/search.*tickets/i)).toBeVisible();
  });

  // ── 2. Typing shows results ────────────────────────────────────

  test("typing shows ticket results in horizontal strip", async () => {
    // Type a known seeded ticket title substring.
    const searchbar = page.locator("input[type='text']").last();
    await searchbar.fill("housing");

    // Ticket cards should appear in the results sheet.
    const sheet = page.locator("[role='search']");
    await expect(sheet.getByText("Tickets", { exact: true })).toBeVisible();
    await expect(sheet.getByText("Help with housing")).toBeVisible({
      timeout: 5_000,
    });
  });

  // ── 3. Tapping a result navigates ──────────────────────────────

  test("tapping a result navigates to ticket detail", async () => {
    // The result card from the previous test should still be visible.
    const sheet = page.locator("[role='search']");
    await sheet.getByText("Help with housing").click();

    // Should navigate to the ticket detail page.
    await expect(page).toHaveURL(/\/tickets\/.+/, { timeout: 10_000 });

    // Sheet should be dismissed (allow time for closing animation).
    await expect(sheet).not.toBeVisible({ timeout: 5_000 });
  });

  // ── 4. Recent searches ─────────────────────────────────────────

  test("recent searches appear after navigating back", async () => {
    // We're on the ticket detail page (tabbar overridden). Go back first.
    const backBtn = page.getByRole("button", { name: "Back" });
    if (await backBtn.isVisible().catch(() => false)) {
      await backBtn.click();
    }
    // Navigate to Home tab (SPA) to preserve crypto Worker state.
    await page.getByRole("tab", { name: "Home" }).click();
    await expect(page).toHaveURL("/");

    // Open search again.
    await page.getByRole("button", { name: "Search" }).click();

    const sheet = page.locator("[role='search']");
    await expect(sheet).toBeVisible();

    // "housing" should appear in recents (was added when we tapped the result).
    await expect(sheet.getByText("housing")).toBeVisible();
  });

  test("tapping a recent search fills the searchbar and shows results", async () => {
    const sheet = page.locator("[role='search']");

    // Tap the "housing" recent.
    await sheet.getByText("housing").click();

    // Results should appear again.
    await expect(sheet.getByText("Help with housing")).toBeVisible({
      timeout: 5_000,
    });
  });

  // ── 5. Dismissal ───────────────────────────────────────────────

  test("escape dismisses sheet and searchbar", async () => {
    await page.keyboard.press("Escape");

    const sheet = page.locator("[role='search']");
    await expect(sheet).not.toBeVisible();
  });

  // ── 6. No results ──────────────────────────────────────────────

  test("no results state shows empty message", async () => {
    // Open search and type something that matches nothing.
    await page.getByRole("button", { name: "Search" }).click();
    const searchbar = page.locator("input[type='text']").last();
    await searchbar.fill("xyznonexistent123");

    const sheet = page.locator("[role='search']");
    await expect(sheet.getByText(/No results for/)).toBeVisible();

    // Close search for cleanup.
    await page.keyboard.press("Escape");
  });

  // ── 7. Accessibility ───────────────────────────────────────────

  test("accessibility: sheet has role=search, results have role=list", async () => {
    await page.getByRole("button", { name: "Search" }).click();
    const searchbar = page.locator("input[type='text']").last();
    await searchbar.fill("housing");

    // Wait for results to appear.
    const sheet = page.locator("[role='search']");
    await expect(sheet.getByText("Help with housing")).toBeVisible({
      timeout: 5_000,
    });

    // Run axe-core on the search overlay.
    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .include("[role='search']")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .disableRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);

    // Verify ARIA landmarks present.
    await expect(sheet.locator("[role='list']").first()).toBeVisible();

    // Cleanup.
    await page.keyboard.press("Escape");
  });
});
