import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login } from "./helpers";

test.describe.serial("Universal Search", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
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
    // Type a known seeded ticket title substring into the search overlay input.
    // The Konsta Searchbar is inside the .search-overlay container.
    const searchbar = page.locator(".search-overlay input[type='text']");
    await searchbar.waitFor({ state: "visible", timeout: 5_000 });
    await searchbar.fill("housing");

    // Ticket cards should appear in the results.
    const sheet = page.locator("[role='search']");
    await expect(sheet.getByText("Tickets", { exact: true })).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await expect(sheet.getByText("Help with housing")).toBeVisible({
      timeout: 5_000,
    });
  });

  // ── 3. Tapping a result navigates ──────────────────────────────

  test("tapping a result navigates to ticket detail", async () => {
    // The result card from the previous test should still be visible.
    const sheet = page.locator("[role='search']");
    // Click the card's accessible overlay button (not the text, which sits
    // below the overlay in z-order and may not trigger the tap handler).
    const cardBtn = sheet
      .getByRole("button", {
        name: /open ticket/i,
      })
      .first();
    await expect(cardBtn).toBeVisible({ timeout: 5_000 });
    await cardBtn.click();

    // On desktop, ticket detail opens in split view (URL may stay at /tickets).
    // Wait for the chat log to appear as confirmation of navigation.
    await expect(page.locator('[role="log"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Search overlay should be dismissed.
    await expect(sheet).not.toBeVisible({ timeout: 10_000 });
  });

  // ── 4. Recent searches ─────────────────────────────────────────

  test("recent searches appear after navigating back", async () => {
    // We're on the ticket detail page (tabbar overridden). Go back first.
    const backBtn = page.getByRole("button", { name: "Back" });
    if (await backBtn.isVisible().catch(() => false)) {
      await backBtn.click();
    }
    // Navigate to Home tab (SPA) to preserve crypto Worker state.
    await page.getByRole("tab", { name: "Overview" }).click();
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

  test("dismiss closes sheet and searchbar", async () => {
    // On desktop, search renders as a dropdown with a backdrop. Click
    // the backdrop to dismiss. On mobile, the ShellSheet handles Escape.
    // Tab-to-same-URL (Overview -> /) is a no-op and won't trigger
    // afterNavigate, so navigate to a genuinely different route instead.
    const backdrop = page.locator(".search-dropdown-backdrop");
    if (await backdrop.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await backdrop.click({ force: true });
    } else {
      await page.getByRole("tab", { name: /tickets/i }).click();
      await expect(page).toHaveURL("/tickets", { timeout: 5_000 });
    }

    const sheet = page.locator("[role='search']");
    await expect(sheet).not.toBeVisible({ timeout: 5_000 });
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
