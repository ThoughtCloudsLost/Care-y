import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { auditA11y, CRYPTO_TIMEOUT, login } from "./helpers";
import { LOCKED_TICKET_TITLE } from "./replay-tickets";

test.describe.serial("Dashboard (Overview Tab)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
    await expect(page.getByText("Help with housing").first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "dashboard");
    await page.close();
  });

  // ── Section count badges (real data) ──────────────────────────────

  test("section badges show correct counts from seeded tickets", async () => {
    // My Tickets: the seed replay assigns well over 5 open tickets to the
    // seeding admin; the floor stays low so lifecycle specs in an earlier
    // browser project cannot push it out of range.
    const myTickets = page.locator("#section-my-tickets [data-count]");
    await expect(myTickets).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    const myCount = Number(await myTickets.getAttribute("data-count"));
    expect(myCount).toBeGreaterThanOrEqual(5);

    // Unassigned: at least 6 tickets with no assignee (the replay leaves
    // far more unassigned, and earlier specs may add their own).
    const unassigned = page.locator("#section-unassigned [data-count]");
    await expect(unassigned).toBeVisible();
    const unassignedCount = Number(await unassigned.getAttribute("data-count"));
    expect(unassignedCount).toBeGreaterThanOrEqual(6);

    // On Hold: at least 2. The replay puts several tickets on hold, and
    // lifecycle specs in an earlier browser project may add one.
    const onHold = page.locator("#section-on-hold [data-count]");
    await expect(onHold).toBeVisible();
    const holdCount = Number(await onHold.getAttribute("data-count"));
    expect(holdCount).toBeGreaterThanOrEqual(2);
  });

  // ── Decryption (full pipeline) ────────────────────────────────────

  test("decrypted ticket title is visible", async () => {
    // Already verified in beforeAll, but this is the explicit assertion.
    // Proves: OPRF -> deriveKeys -> ECIES unwrap -> secretbox decrypt.
    // .first(): the same ticket legitimately renders in both the
    // needs-attention and my-tickets dashboard regions.
    await expect(page.getByText("Help with housing").first()).toBeVisible();
  });

  test("ticket without key wrap shows encrypted placeholder", async () => {
    // seed-data.setup.ts has a volunteer create an urgent, unassigned
    // ticket while the admin is out of its queue, so the admin holds no
    // key wrap for it. It leads Needs attention, and its title falls back
    // to the i18n placeholder "Locked ticket" with a help icon.
    await expect(page.getByText("Locked ticket").first()).toBeVisible();
    await expect(page.getByText(LOCKED_TICKET_TITLE)).toHaveCount(0);
  });

  // ── Section heading labels (i18n) ─────────────────────────────────

  test("section headings display labels from i18n", async () => {
    // A stacked lane heads with its collapse toggle; lanes side by side
    // (a wide dashboard) head with a plain heading. Anchored: each
    // section's filter button is named "Filter <heading>".
    const main = page.getByRole("main");
    for (const name of [/^my tickets/i, /^unassigned/i, /^on hold/i]) {
      await expect(
        main
          .getByRole("button", { name })
          .or(main.getByRole("heading", { level: 2, name })),
      ).toBeAttached();
    }
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

  test("'See all' link opens the tickets page filtered to the section", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    const unassignedSection = page.locator("#section-unassigned");
    await unassignedSection.scrollIntoViewIfNeeded();

    // Stacked, the unassigned section starts collapsed: expand it first.
    // Side by side, lanes do not collapse and have no toggle.
    const toggle = unassignedSection.getByRole("button", {
      name: /^unassigned/i,
    });
    if (
      (await toggle.count()) > 0 &&
      (await toggle.getAttribute("aria-expanded")) !== "true"
    ) {
      await toggle.click();
    }

    const seeAll = unassignedSection.getByRole("button", { name: /see all/i });
    await expect(seeAll).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await seeAll.click();
    // The section's filters travel in memory, never in the URL.
    await expect(page).toHaveURL(/\/tickets$/, { timeout: 10_000 });
  });

  // Navigate back to dashboard via Overview tab (SPA navigation, like a real user)
  test("Overview tab navigates back from the filtered tickets page", async () => {
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page).toHaveURL("/");
  });

  // ── Tab navigation ────────────────────────────────────────────────

  test("Tickets tab navigates to /tickets", async () => {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");
  });

  test("tickets page shows content", async () => {
    await expect(
      page.getByRole("region").getByText("Tickets", { exact: true }),
    ).toBeVisible();
  });

  test("Overview tab navigates back to /", async () => {
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page).toHaveURL("/");
  });

  // ── Direct URL navigation (rare but real scenario) ────────────────

  test("active tab reflects current URL after SPA navigation", async () => {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");
    const ticketsTab = page.getByRole("tab", { name: "Tickets" });
    await expect(ticketsTab).toHaveAttribute("aria-selected", "true");

    // Navigate back for next test
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page).toHaveURL("/");
  });

  // ── Accessibility ─────────────────────────────────────────────────

  test("passes axe accessibility audit after decryption settles", async () => {
    // Ensure we're on the dashboard with decrypted content visible.
    // Use SPA navigation to preserve crypto Worker state.
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Help with housing").first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Legacy mode avoids axe-core's cross-context injection which requires
    // pages created via browser.newContext(). The serial suite uses
    // browser.newPage() to inherit project-level config (viewport, baseURL).
    await auditA11y(page);
  });
});
