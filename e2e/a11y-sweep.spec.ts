/**
 * Accessibility sweep over the surfaces that have no dedicated e2e spec:
 * the admin pages, user settings, the library list, and the 404 page.
 * One login, then an axe audit per surface. Functional behavior for these
 * pages is covered by unit suites; this spec exists so WCAG regressions
 * on them fail CI the same way the dashboard and ticket audits do.
 */
import { test, expect, type Page } from "@playwright/test";
import { auditA11y, login, CRYPTO_TIMEOUT } from "./helpers.js";

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

  // The full audit configuration lives in auditA11y (helpers.ts).
  async function audit(): Promise<void> {
    await auditA11y(page);
  }

  test("admin hub passes the axe audit", async () => {
    // SPA navigation: page.goto() causes a full reload that resets the
    // crypto Worker session. Click the sidebar Admin tab instead.
    const adminTab = page.locator('[data-sidebar-id="admin"]');
    await adminTab.click();
    await expect(page).toHaveURL("/admin", { timeout: 10_000 });
    await expect(page.getByText("People").first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("admin people passes the axe audit", async () => {
    // Navigate via hub list items (SPA) to preserve crypto state.
    await page.getByText("People").first().click();
    await expect(page).toHaveURL("/admin/people", { timeout: 10_000 });
    await expect(page.getByText(/active/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("admin organization passes the axe audit", async () => {
    await page.goBack();
    await expect(page).toHaveURL("/admin", { timeout: 10_000 });
    await page.getByText("Organization").first().click();
    await expect(page).toHaveURL(/\/admin\/organization/, { timeout: 10_000 });
    await expect(page.getByText(/branding/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("admin communications passes the axe audit", async () => {
    await page.goBack();
    await expect(page).toHaveURL("/admin", { timeout: 10_000 });
    await page.getByText("Communications").first().click();
    await expect(page).toHaveURL(/\/admin\/communications/, {
      timeout: 10_000,
    });
    await expect(page.getByText(/telephony/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("admin hub passes the axe audit via sidebar", async () => {
    // Settings tab in the sidebar navigates to /admin.
    const settingsTab = page.locator('[data-sidebar-id="settings"]');
    await settingsTab.click();
    await expect(page).toHaveURL("/admin", { timeout: 10_000 });
    await expect(page.getByText(/admin/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("library list passes the axe audit", async () => {
    await page.getByRole("tab", { name: "Library" }).click();
    await expect(page).toHaveURL("/library", { timeout: 10_000 });
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
