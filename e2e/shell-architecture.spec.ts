import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { auditA11y, CRYPTO_TIMEOUT, login } from "./helpers";

test.describe.serial("shell architecture", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "shell-architecture");
    await page.close();
  });

  // ── Semantic landmarks ──────────────────────────────────────────────

  test("has main landmark", async () => {
    const main = page.locator("main");
    await expect(main).toBeAttached();
  });

  test("has banner landmark on navbar", async () => {
    const banner = page.locator('[role="banner"]');
    await expect(banner).toBeAttached();
    await expect(banner).toContainText("CARE-Y");
  });

  test("has tablist landmark on tabbar", async () => {
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeAttached();
    await expect(tablist).toHaveAttribute("aria-label", "Main navigation");
  });

  test("has toast container with role=status", async () => {
    const toast = page.locator("#toast-container");
    await expect(toast).toBeAttached();
    await expect(toast).toHaveAttribute("role", "status");
  });

  // ── ARIA live regions ───────────────────────────────────────────────

  test("has assertive and polite ARIA live regions", async () => {
    const assertive = page.locator("#live-assertive");
    await expect(assertive).toBeAttached();
    await expect(assertive).toHaveAttribute("aria-live", "assertive");
    await expect(assertive).toHaveAttribute("aria-atomic", "true");

    const polite = page.locator("#live-polite");
    await expect(polite).toBeAttached();
    await expect(polite).toHaveAttribute("aria-live", "polite");
    await expect(polite).toHaveAttribute("aria-atomic", "true");
  });

  // ── SVG filter ──────────────────────────────────────────────────────

  test("riso-ink SVG filter renders when riso theme is active", async () => {
    // The riso-ink filter only renders for the riso theme.
    // Default theme is "default", so skip if not riso.
    const visualTheme = await page.evaluate(() =>
      document.documentElement.classList.contains("theme-riso"),
    );
    if (!visualTheme) {
      test.skip();
      return;
    }
    const filter = page.locator("filter#riso-ink");
    await expect(filter).toBeAttached();
  });

  // ── Tab bar ─────────────────────────────────────────────────────────

  test("tab bar has 3 tabs", async () => {
    const tablist = page.getByRole("tablist");
    await expect(tablist).toBeAttached();

    for (const name of ["Overview", "Tickets", "Library"]) {
      const tab = tablist.getByRole("tab", { name });
      await expect(tab).toBeAttached();
    }
  });

  test("Overview tab is selected by default", async () => {
    const homeTab = page.getByRole("tab", { name: "Overview" });
    await expect(homeTab).toHaveAttribute("aria-selected", "true");
  });

  // ── Navbar ──────────────────────────────────────────────────────────

  test("navbar renders with title and action buttons", async () => {
    const navbar = page.getByRole("banner");
    await expect(navbar).toBeAttached();
    await expect(navbar).toContainText("CARE-Y");

    // Account button only renders on mobile; desktop uses the sidebar.
    await expect(navbar.getByRole("button", { name: "Search" })).toBeAttached();
    await expect(
      navbar.getByRole("button", { name: "Create new" }),
    ).toBeAttached();
  });

  // ── Accessibility ───────────────────────────────────────────────────

  test("page passes axe-core accessibility scan", async () => {
    await auditA11y(page);
  });
});
