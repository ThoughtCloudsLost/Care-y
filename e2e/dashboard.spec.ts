import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login } from "./helpers";

test.describe.serial("Dashboard (Home Tab)", () => {
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
    await stopAndWriteCoverage(page, "dashboard");
    await page.close();
  });

  // ── Section count badges (real data) ──────────────────────────────

  test("section badges show correct counts from seeded tickets", async () => {
    // My Tickets: 5 assigned non-hold tickets
    const myTickets = page.locator("#section-my-tickets [data-count]");
    await expect(myTickets).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(myTickets).toHaveAttribute("data-count", "5");

    // Unassigned: 6 tickets with no assignee
    const unassigned = page.locator("#section-unassigned [data-count]");
    await expect(unassigned).toBeVisible();
    await expect(unassigned).toHaveAttribute("data-count", "6");

    // On Hold: 2 tickets (shelter callback, court date)
    const onHold = page.locator("#section-on-hold [data-count]");
    await expect(onHold).toBeVisible();
    await expect(onHold).toHaveAttribute("data-count", "2");
  });

  // ── Decryption (full pipeline) ────────────────────────────────────

  test("decrypted ticket title is visible", async () => {
    // Already verified in beforeAll, but this is the explicit assertion.
    // Proves: OPRF -> deriveKeys -> ECIES unwrap -> secretbox decrypt.
    await expect(page.getByText("Help with housing")).toBeVisible();
  });

  test("ticket without key wrap shows encrypted placeholder", async () => {
    // Ticket with withKeyWrap: false has no key wrap. The title falls
    // back to the i18n placeholder "Encrypted ticket" with a help icon.
    await expect(page.getByText("Encrypted ticket")).toBeVisible();
  });

  // ── Section heading labels (i18n) ─────────────────────────────────

  test("section headings display labels from i18n", async () => {
    await expect(
      page.getByRole("button", { name: /my tickets/i }),
    ).toBeAttached();
    await expect(
      page.getByRole("button", { name: /unassigned/i }),
    ).toBeAttached();
    await expect(page.getByRole("button", { name: /on hold/i })).toBeAttached();
  });

  // ── Notification slot ─────────────────────────────────────────────

  test("exposure notification slot exists but is hidden", async () => {
    const notification = page.locator('[role="alert"]');
    await expect(notification).toBeAttached();
    // Konsta Notification with opened=false renders with opacity-0 and
    // pointer-events-none. Playwright considers opacity-0 elements "visible"
    // (non-zero bounding box), so check the computed style instead.
    await expect(notification).toHaveCSS("opacity", "0");
    await expect(notification).toHaveCSS("pointer-events", "none");
  });

  // ── Section "See all" navigation ────────────────────────────────────

  test("'See all' link navigates to tickets with filter param", async () => {
    const unassignedSection = page.locator("#section-unassigned");
    const seeAll = unassignedSection.getByRole("link", { name: /see all/i });
    await expect(seeAll).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await seeAll.click();
    await expect(page).toHaveURL(/\/tickets\?filter=unassigned/);
  });

  // Navigate back to dashboard via Home tab (SPA navigation, like a real user)
  test("Home tab navigates back from tickets filter", async () => {
    await page.getByRole("tab", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  // ── Tab navigation ────────────────────────────────────────────────

  test("Tickets tab navigates to /tickets", async () => {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");
  });

  test("tickets page shows content", async () => {
    await expect(page.getByText("Tickets")).toBeVisible();
  });

  test("Home tab navigates back to /", async () => {
    await page.getByRole("tab", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  // ── Direct URL navigation (rare but real scenario) ────────────────

  test("active tab reflects current URL on direct navigation", async () => {
    await page.goto("/tickets");
    const ticketsTab = page.getByRole("tab", { name: "Tickets" });
    await expect(ticketsTab).toHaveAttribute("aria-selected", "true");

    // Navigate back for next test
    await page.getByRole("tab", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  // ── Accessibility ─────────────────────────────────────────────────

  test("passes axe accessibility audit after decryption settles", async () => {
    // Ensure we're on the dashboard with decrypted content visible.
    await page.goto("/");
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Legacy mode avoids axe-core's cross-context injection which requires
    // pages created via browser.newContext(). The serial suite uses
    // browser.newPage() to inherit project-level config (viewport, baseURL).
    // Exclude Konsta UI internal a11y issues (unlabeled searchbar button,
    // toolbar outside landmark) tracked separately from dashboard tests.
    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
