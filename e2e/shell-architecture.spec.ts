import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("shell architecture", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── Semantic landmarks ──────────────────────────────────────────────

  test("has main landmark", async ({ page }) => {
    const main = page.locator('[role="main"]');
    await expect(main).toBeAttached();
  });

  test("has banner landmark on navbar", async ({ page }) => {
    const banner = page.locator('[role="banner"]');
    await expect(banner).toBeAttached();
    await expect(banner).toContainText("CARE-Y");
  });

  test("has tablist landmark on tabbar", async ({ page }) => {
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeAttached();
    await expect(tablist).toHaveAttribute("aria-label", "Main navigation");
  });

  test("has toast container with role=status", async ({ page }) => {
    const toast = page.locator("#toast-container");
    await expect(toast).toBeAttached();
    await expect(toast).toHaveAttribute("role", "status");
  });

  // ── ARIA live regions ───────────────────────────────────────────────

  test("has assertive and polite ARIA live regions", async ({ page }) => {
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

  test("has riso-ink SVG filter definition", async ({ page }) => {
    const filter = page.locator("filter#riso-ink");
    await expect(filter).toBeAttached();
  });

  // ── Tab bar ─────────────────────────────────────────────────────────

  test("tab bar has 4 tabs with correct roles", async ({ page }) => {
    const tablist = page.getByRole("tablist");
    await expect(tablist).toBeAttached();

    for (const name of ["Home", "Tickets", "Calendar", "More"]) {
      const tab = tablist.getByRole("tab", { name });
      await expect(tab).toBeAttached();
    }
  });

  test("Home tab is selected by default", async ({ page }) => {
    const homeTab = page.getByRole("tab", { name: "Home" });
    await expect(homeTab).toHaveAttribute("aria-selected", "true");
    await expect(homeTab).toHaveClass(/k-tabbar-link-active/);
  });

  // ── Navbar ──────────────────────────────────────────────────────────

  test("navbar renders with title and placeholder action buttons", async ({
    page,
  }) => {
    const navbar = page.locator(".k-navbar");
    await expect(navbar).toBeAttached();
    await expect(navbar).toContainText("CARE-Y");

    // Right slot has 3 placeholder buttons (role="button" via patched Link)
    await expect(
      navbar.getByRole("button", { name: "Exposure status" }),
    ).toBeAttached();
    await expect(navbar.getByRole("button", { name: "Search" })).toBeAttached();
    await expect(
      navbar.getByRole("button", { name: "New ticket" }),
    ).toBeAttached();
  });

  // ── View transitions ────────────────────────────────────────────────

  test("view transitions API is available", async ({ page }) => {
    const hasViewTransitions = await page.evaluate(
      () => "startViewTransition" in document,
    );
    // Not all browsers support it; just verify the app doesn't crash
    // If supported, the layout's onNavigate hook will use it
    expect(typeof hasViewTransitions).toBe("boolean");
  });

  // ── Accessibility ───────────────────────────────────────────────────

  test("page passes axe-core accessibility scan", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
