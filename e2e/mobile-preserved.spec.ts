import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { boxOf, CRYPTO_TIMEOUT, E2eError, login } from "./helpers";

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
    // AppShell mounts DesktopSidebar only when layoutMode.isDesktop, so
    // at a mobile viewport the sidebar landmark is absent entirely. The
    // same role/name locator is positively asserted by the desktop
    // suite, which keeps this absence check meaningful.
    const sidebar = page.getByRole("navigation", {
      name: "Sidebar navigation",
    });
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

    // No split view at mobile. The split-view testid is positively
    // asserted by the desktop suite, keeping this absence check
    // meaningful.
    const splitView = page.locator('[data-testid="split-view"]');
    await expect(splitView).toHaveCount(0);
  });

  test("tapping ticket navigates to full-page detail", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    // Each ticket card exposes a single "Open <ticket> <alias>" overlay
    // button.
    const card = page
      .locator('[data-testid="ticket-card-wrap"]')
      .first()
      .getByRole("button", { name: /^open /i });
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
    // Wait for library content to load. On mobile, articles render
    // directly (no split view), so wait for the article count badge
    // that appears once the list decrypts.
    await expect(page.locator(".stat-item")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    const splitView = page.locator('[data-testid="split-view"]');
    await expect(splitView).toHaveCount(0);
  });

  // ── Dashboard single column ────────────────────────────────────────

  test("dashboard is single column at mobile", async () => {
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page).toHaveURL("/");

    // The dashboard tags its sections with data-column for the desktop
    // two-column layout; the desktop suite proves they sit side by side
    // there.
    const firstLeft = page.locator("[data-column='left']").first();
    const firstRight = page.locator("[data-column='right']").first();
    await expect(firstLeft).toBeVisible();
    await expect(firstRight).toBeVisible();

    const viewport = page.viewportSize();
    if (viewport == null) throw new E2eError("Viewport size unavailable");

    // Single-column proof by geometry: each section spans more than
    // half the viewport width (so two cannot fit side by side), and
    // the right-column section stacks below the left-column one
    // instead of sharing vertical space beside it.
    const leftBox = await boxOf(firstLeft);
    const rightBox = await boxOf(firstRight);
    expect(leftBox.width).toBeGreaterThan(viewport.width / 2);
    expect(rightBox.width).toBeGreaterThan(viewport.width / 2);
    expect(rightBox.y).toBeGreaterThanOrEqual(leftBox.y + leftBox.height);
  });

  // ── Keyboard shortcuts not active at mobile ────────────────────────

  test("number key shortcuts do not switch tabs at mobile", async () => {
    // Ensure we start from the dashboard.
    if (!page.url().endsWith("/")) {
      await page.getByRole("tab", { name: "Overview" }).click();
      await expect(page).toHaveURL("/", { timeout: 5_000 });
    }

    await page.waitForTimeout(200);

    // Press "2" which would switch to Tickets at desktop.
    await page.keyboard.press("2");
    await page.waitForTimeout(500);

    // Should still be on dashboard (shortcuts only activate at desktop).
    await expect(page).toHaveURL("/");
  });
});
