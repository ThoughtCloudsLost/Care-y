/**
 * Accessibility sweep over the surfaces that have no dedicated e2e spec:
 * the admin pages, user settings, the library list, and the 404 page.
 * One login, then an axe audit per surface. Functional behavior for these
 * pages is covered by unit suites; this spec exists so WCAG regressions
 * on them fail CI the same way the dashboard and ticket audits do.
 */
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { login, CRYPTO_TIMEOUT } from "./helpers.js";

test.describe.serial("Accessibility sweep", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await login(page);
  });

  test.afterAll(async () => {
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await page.close();
  });

  // Legacy mode: this suite uses browser.newPage(), which axe's
  // cross-context injection cannot target (same pattern as dashboard).
  async function audit(): Promise<void> {
    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .analyze();
    expect(results.violations).toEqual([]);
  }

  test("admin hub passes the axe audit", async () => {
    await page.goto("/admin");
    await expect(page.getByText("People").first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("admin people passes the axe audit", async () => {
    await page.goto("/admin/people");
    await expect(page.getByText(/active/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("admin organization passes the axe audit", async () => {
    await page.goto("/admin/organization");
    await expect(page.getByText(/branding/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("admin communications passes the axe audit", async () => {
    await page.goto("/admin/communications");
    await expect(page.getByText(/telephony/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("user settings passes the axe audit", async () => {
    await page.goto("/more/settings");
    await expect(page.getByText(/password/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("library list passes the axe audit", async () => {
    await page.goto("/library");
    // Either articles render or the empty room does; both are stable.
    await expect(
      page.getByText(/nothing here yet|article/i).first(),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await audit();
  });

  test("404 page passes the axe audit", async () => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText("This page does not exist.")).toBeVisible();
    await audit();
  });
});
