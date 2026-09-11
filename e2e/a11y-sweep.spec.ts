/**
 * Accessibility sweep over the surfaces that have no dedicated e2e spec:
 * the admin pages, user settings, the library list, and the 404 page.
 * One login, then an axe audit per surface. Functional behavior for these
 * pages is covered by unit suites; this spec exists so WCAG regressions
 * on them fail CI the same way the dashboard and ticket audits do.
 */
import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { auditA11y, login, CRYPTO_TIMEOUT } from "./helpers.js";

test.describe.serial("Accessibility sweep", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "a11y-sweep");
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await page.close();
  });

  // The full audit configuration lives in auditA11y (helpers.ts).
  async function audit(): Promise<void> {
    await auditA11y(page);
  }

  // Mobile layouts render no desktop sidebar, and the /admin hub page has
  // no mobile navigation entry at all: the mobile admin surface is the
  // Account panel (navbar identity button -> AvatarPanel), which links
  // straight to the sub-pages. Admin sub-page audits therefore navigate
  // via the panel on mobile, hub audits run on the desktop projects only,
  // and the panel itself gets a mobile-only audit below.
  const isMobileProject = (): boolean =>
    test.info().project.name === "webkit-mobile";

  // Opens the Account panel and taps a destination item (SPA navigation,
  // preserves the crypto Worker session, same as the sidebar path).
  async function panelNavigate(
    item: string,
    urlPattern: RegExp,
  ): Promise<void> {
    await page.getByTestId("shell-identity").click();
    await page.getByText(item, { exact: true }).click();
    await expect(page).toHaveURL(urlPattern, { timeout: 10_000 });
  }

  test("admin hub passes the axe audit", async () => {
    test.skip(isMobileProject(), "the /admin hub has no mobile nav entry");
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
    if (isMobileProject()) {
      await panelNavigate("Users", /\/admin\/people/);
    } else {
      // Navigate via hub list items (SPA) to preserve crypto state.
      await page.getByText("People").first().click();
      await expect(page).toHaveURL("/admin/people", { timeout: 10_000 });
    }
    await expect(page.getByText(/active/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("admin organization passes the axe audit", async () => {
    if (isMobileProject()) {
      await panelNavigate("General", /\/admin\/organization/);
    } else {
      await page.goBack();
      await expect(page).toHaveURL("/admin", { timeout: 10_000 });
      await page.getByText("Organization").first().click();
      await expect(page).toHaveURL(/\/admin\/organization/, {
        timeout: 10_000,
      });
    }
    await expect(page.getByText(/branding/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("admin communications passes the axe audit", async () => {
    if (isMobileProject()) {
      await panelNavigate("Telephony", /\/admin\/communications/);
    } else {
      await page.goBack();
      await expect(page).toHaveURL("/admin", { timeout: 10_000 });
      await page.getByText("Communications").first().click();
      await expect(page).toHaveURL(/\/admin\/communications/, {
        timeout: 10_000,
      });
    }
    await expect(page.getByText(/telephony/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("admin hub passes the axe audit via sidebar", async () => {
    test.skip(isMobileProject(), "the /admin hub has no mobile nav entry");
    const adminTab = page.locator('[data-sidebar-id="admin"]');
    await adminTab.click();
    await expect(page).toHaveURL("/admin", { timeout: 10_000 });
    await expect(page.getByText(/admin/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await audit();
  });

  test("account panel passes the axe audit", async () => {
    // The panel is the mobile admin nav surface; desktop hides the
    // identity button (identityHidden), so this is mobile-only.
    test.skip(!isMobileProject(), "the Account panel only exists on mobile");
    await page.getByTestId("shell-identity").click();
    await expect(page.getByText("Users", { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await audit();
    // ShellPanel closes on Escape; leave the page clean for the next test.
    await page.keyboard.press("Escape");
    await expect(page.getByText("Users", { exact: true })).not.toBeVisible({
      timeout: 5_000,
    });
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
