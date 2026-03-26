import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("shell architecture", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── Semantic landmarks ──────────────────────────────────────────────

  test("has main landmark", async ({ page }) => {
    const main = page.locator("main#main-content");
    await expect(main).toBeAttached();
  });

  test("has two nav landmarks with distinct aria-labels", async ({ page }) => {
    const navs = page.locator("nav");
    await expect(navs).toHaveCount(2);

    const labels = await navs.evaluateAll((els) =>
      els.map((el) => el.getAttribute("aria-label")),
    );
    expect(labels).toContain("Main navigation");
    expect(labels).toContain("Page navigation");
    // Labels must be distinct
    expect(new Set(labels).size).toBe(2);
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

  test("tab bar has role=tablist with 4 tabs", async ({ page }) => {
    const tablist = page.getByRole("tablist");
    await expect(tablist).toBeAttached();

    const tabs = tablist.getByRole("tab");
    await expect(tabs).toHaveCount(4);
  });

  test("Home tab is selected by default", async ({ page }) => {
    const homeTab = page.getByRole("tab", { name: "Home" });
    await expect(homeTab).toHaveAttribute("aria-selected", "true");
    await expect(homeTab).toHaveAttribute("tabindex", "0");

    // Other tabs are not selected and have tabindex -1
    for (const name of ["Tickets", "Calendar", "More"]) {
      const tab = page.getByRole("tab", { name });
      await expect(tab).toHaveAttribute("aria-selected", "false");
      await expect(tab).toHaveAttribute("tabindex", "-1");
    }
  });

  test("arrow keys move tab selection", async ({ page }) => {
    const homeTab = page.getByRole("tab", { name: "Home" });
    // Click to ensure focus lands on the tab
    await homeTab.click();
    await expect(homeTab).toBeFocused();

    // ArrowRight moves to Tickets
    await page.keyboard.press("ArrowRight");
    const ticketsTab = page.getByRole("tab", { name: "Tickets" });
    await expect(ticketsTab).toHaveAttribute("aria-selected", "true");
    await expect(ticketsTab).toBeFocused();

    // ArrowRight moves to Calendar
    await page.keyboard.press("ArrowRight");
    const calendarTab = page.getByRole("tab", { name: "Calendar" });
    await expect(calendarTab).toHaveAttribute("aria-selected", "true");
    await expect(calendarTab).toBeFocused();

    // ArrowRight moves to More
    await page.keyboard.press("ArrowRight");
    const moreTab = page.getByRole("tab", { name: "More" });
    await expect(moreTab).toHaveAttribute("aria-selected", "true");
    await expect(moreTab).toBeFocused();

    // ArrowRight wraps to Home
    await page.keyboard.press("ArrowRight");
    await expect(homeTab).toHaveAttribute("aria-selected", "true");
    await expect(homeTab).toBeFocused();
  });

  test("Home and End keys jump to first/last tab", async ({ page }) => {
    const homeTab = page.getByRole("tab", { name: "Home" });
    await homeTab.click();
    await expect(homeTab).toBeFocused();

    await page.keyboard.press("End");
    const moreTab = page.getByRole("tab", { name: "More" });
    await expect(moreTab).toHaveAttribute("aria-selected", "true");
    await expect(moreTab).toBeFocused();

    await page.keyboard.press("Home");
    await expect(homeTab).toHaveAttribute("aria-selected", "true");
    await expect(homeTab).toBeFocused();
  });

  // ── Navbar ──────────────────────────────────────────────────────────

  test("navbar renders with placeholder icons", async ({ page }) => {
    const nav = page.locator('nav[aria-label="Page navigation"]');
    await expect(nav).toBeAttached();

    // Right slot has 3 placeholder buttons
    await expect(
      nav.getByRole("button", { name: "Exposure status" }),
    ).toBeAttached();
    await expect(nav.getByRole("button", { name: "Search" })).toBeAttached();
    await expect(
      nav.getByRole("button", { name: "New ticket" }),
    ).toBeAttached();
  });

  // ── Tab grouping layout ─────────────────────────────────────────────

  test("More tab has margin-left auto for right alignment", async ({
    page,
  }) => {
    const moreTab = page.getByRole("tab", { name: "More" });
    // Verify the CSS class that applies margin-left: auto is present
    await expect(moreTab).toHaveClass(/tabbar-tab-more/);
  });

  // ── Accessibility ───────────────────────────────────────────────────

  test("page passes axe-core accessibility scan", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
