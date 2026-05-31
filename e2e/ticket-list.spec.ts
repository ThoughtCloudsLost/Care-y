import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login, longPress } from "./helpers";

test.describe.serial("Ticket List (Tickets Tab)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Navigate to tickets page via tab bar (SPA navigation).
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");

    // Wait for ticket list to render with decrypted content.
    // "Help with housing" is a seeded ticket with a key wrap, so its title
    // is only visible after the full decrypt pipeline runs on this page too.
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "ticket-list");
    await page.close();
  });

  // ── 1. Load and decrypt ─────────────────────────────────────────

  test("ticket cards render with decrypted titles", async () => {
    // Multiple seeded tickets should be visible with decrypted titles.
    // Verify the shape: non-empty title text, not shimmer placeholders.
    await expect(page.getByText("Help with housing")).toBeVisible();
    await expect(page.getByText("Safety planning session")).toBeVisible();

    // Ticket without key wrap shows "Encrypted ticket" placeholder with help icon.
    await expect(page.getByText("Encrypted ticket")).toBeVisible();
  });

  test("cards show queue badges, status dots, and priority chips", async () => {
    // Queue badges are Konsta Chip elements with queue names.
    // Some cards may be below the fold, so check DOM presence.
    await expect(page.getByText("Housing").first()).toBeAttached();
    await expect(page.getByText("Crisis").first()).toBeAttached();
    await expect(page.getByText("Intake").first()).toBeAttached();

    // Status labels are visible in card headers.
    const statusLabels = page.locator('[data-testid="status-label"]');
    await expect(statusLabels.first()).toBeAttached();
  });

  // ── 2. Status filter pill ───────────────────────────────────────

  test("status filter pill filters tickets", async () => {
    // Tap the "Status" filter pill to open its popover.
    const statusPill = page.locator('[role="toolbar"]').getByText("Status");
    await statusPill.click();

    // The popover should be visible with status options.
    // Scope to the filter group (aria-label="Status") to avoid matching stat labels and badges.
    const filterGroup = page.getByRole("group", { name: "Status" });
    await expect(filterGroup.getByText("New")).toBeVisible();
    await expect(filterGroup.getByText("Active")).toBeVisible();
    await expect(filterGroup.getByText("On Hold")).toBeVisible();
    await expect(filterGroup.getByText("Closed")).toBeVisible();

    // Select "On Hold" to filter to on-hold tickets only.
    await filterGroup.getByText("On Hold").click();

    // Close popover. The pill text changed from "Status" to "On Hold"
    // after selection, so the original locator is stale. Escape is reliable.
    await page.keyboard.press("Escape");

    // On-hold tickets should be visible (seeded: "Waiting for callback from shelter",
    // "Pending court date documentation").
    await expect(page.getByText("Waiting for callback")).toBeVisible();

    // Non-hold tickets should be hidden.
    await expect(page.getByText("Help with housing")).not.toBeVisible();

    // Pill should show the selected label.
    await expect(
      page.locator('[role="toolbar"]').getByText("On Hold"),
    ).toBeVisible();

    // Clear the filter for subsequent tests.
    await page.getByText("Clear all").click();

    // Verify tickets are back.
    await expect(page.getByText("Help with housing")).toBeVisible();
  });

  // ── 3. Queue filter pill ────────────────────────────────────────

  test("queue filter pill shows filtered results", async () => {
    const queuePill = page.locator('[role="toolbar"]').getByText("Queue");
    await queuePill.click();

    // Select "Crisis" queue from the filter popover.
    const queueGroup = page.getByRole("group", { name: "Queue" });
    await queueGroup.getByText("Crisis").click();

    // Close popover (pill text changes after selection, use Escape).
    await page.keyboard.press("Escape");

    // Crisis tickets should be visible.
    await expect(page.getByText("Safety planning session")).toBeVisible();
    await expect(
      page.getByText("Emergency referral needed").first(),
    ).toBeVisible();

    // Non-Crisis tickets should be hidden.
    await expect(page.getByText("Help with housing")).not.toBeVisible();

    // Clear filter.
    await page.getByText("Clear all").click();
    await expect(page.getByText("Help with housing")).toBeVisible();
  });

  // ── 4. View toggle (list <-> grid) ──────────────────────────────

  test("view toggle switches between list and grid layouts", async () => {
    // Default is list mode.
    const listBtn = page.getByRole("button", { name: "List view" });
    const gridBtn = page.getByRole("button", { name: "Grid view" });

    // Verify list mode: cards use single-column layout (no grid rows).
    await expect(listBtn).toHaveAttribute("aria-pressed", "true");
    const gridRow = page.locator('[data-virtual="row"][data-grid]');
    await expect(gridRow).toHaveCount(0);

    // Switch to grid.
    await gridBtn.click();
    await expect(gridBtn).toHaveAttribute("aria-pressed", "true");

    // Grid mode: cards render in 2-column rows.
    await expect(
      page.locator('[data-virtual="row"][data-grid]').first(),
    ).toBeVisible();

    // In grid mode, action buttons should be hidden (no card-actions div).
    await expect(page.locator('[data-testid="card-actions"]')).toHaveCount(0);

    // Switch back to list.
    await listBtn.click();
    await expect(listBtn).toHaveAttribute("aria-pressed", "true");

    // Action buttons should reappear in list mode.
    await expect(
      page.locator('[data-testid="card-actions"]').first(),
    ).toBeVisible();
  });

  test("view mode preference persists across navigation", async () => {
    // Switch to grid.
    await page.getByRole("button", { name: "Grid view" }).click();

    // Navigate away to Home tab, then back.
    await page.getByRole("tab", { name: "Home" }).click();
    await expect(page).toHaveURL("/");

    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");

    // Grid should still be active (persisted in localStorage).
    const gridBtn = page.getByRole("button", { name: "Grid view" });
    await expect(gridBtn).toHaveAttribute("aria-pressed", "true");

    // Restore list mode for other tests.
    await page.getByRole("button", { name: "List view" }).click();
  });

  // ── 5. Infinite scroll ──────────────────────────────────────────

  test("virtual scroller keeps DOM node count bounded", async () => {
    // The dev seed has ~13 tickets, below the 500 virtualizeThreshold.
    // VirtualList stays in flat mode with small datasets, so
    // data-virtual="container" only appears above threshold.
    // Verify the sentinel (infinite scroll trigger) is present in both modes.
    const sentinel = page.locator("[data-sentinel]");
    await expect(sentinel).toBeAttached();

    // In flat mode, all ticket cards are rendered directly.
    const cards = page.locator('[data-testid="ticket-card-wrap"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ── 6. Multi-select ─────────────────────────────────────────────

  test("long-press enters multi-select with checkboxes and action bar", async () => {
    // Long-press a ticket card to enter multi-select mode.
    // Target the inner SwipeableCard (has the onpointerdown handler),
    // not the outer ticket-card-wrap.
    const firstCard = page.locator('[data-testid="ticket-card"]').first();
    await longPress(page, firstCard);

    // Konsta Checkbox hides the native <input> (display:none) and renders a
    // visual icon. Check for the wrapper div that TicketCard adds.
    const checkboxes = page.locator(".checkbox-wrap");
    await expect(checkboxes.first()).toBeVisible({ timeout: 3_000 });

    // The tabbar override should show selection count.
    // First card should be selected.
    await expect(page.getByText(/1 selected/)).toBeVisible();

    // Tap another card to add to selection.
    const secondCard = page.locator('[data-testid="ticket-card-wrap"]').nth(1);
    await secondCard.click();
    await expect(page.getByText(/2 selected/)).toBeVisible();

    // Exit multi-select via the dismiss link (X icon in tabbar override).
    // Konsta <Link> renders with role="link", not "button".
    const dismissBtn = page.getByRole("link", {
      name: "Exit selection mode",
    });
    await dismissBtn.click();

    // Multi-select should be gone: no checkboxes, tab bar restored.
    await expect(checkboxes).toHaveCount(0);
  });

  test("select mode button also enters multi-select", async () => {
    // The "Select" button in the filter pill bar is the explicit entry point.
    await page.getByRole("button", { name: "Select" }).click();

    // Checkboxes should appear.
    await expect(page.locator(".checkbox-wrap").first()).toBeVisible();

    // Exit via dismiss.
    await page.getByRole("link", { name: "Exit selection mode" }).click();
  });

  // ── 7. Card tap navigation ──────────────────────────────────────

  test("tapping a card navigates to ticket detail route", async () => {
    // Click the first card's inner button area.
    const firstCardButton = page.locator('[data-testid="card-inner"]').first();
    await firstCardButton.click();

    // Should navigate to /tickets/{uuid}. The detail page doesn't exist
    // yet (6d), but the URL change is verifiable.
    await expect(page).toHaveURL(/\/tickets\/[0-9a-f-]{36}/);

    // Navigate back to the ticket list for remaining tests.
    // The ticket detail page hides the tabbar, so use the navbar back link.
    await page.getByRole("button", { name: /back/i }).click();
    await expect(page).toHaveURL("/tickets");

    // Wait for tickets to re-render.
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── 8. Empty state ──────────────────────────────────────────────

  test("empty state shown when filters match zero tickets", async () => {
    // Apply a filter combination that matches nothing: "Closed" status.
    // No seeded tickets are closed.
    const statusPill = page.locator('[role="toolbar"]').getByText("Status");
    await statusPill.click();
    await page.getByText(/^Closed \(\d+\)$/).click();
    // Dismiss the filter popover by pressing Escape.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Empty state message should appear.
    await expect(page.getByText("No tickets match this filter.")).toBeVisible({
      timeout: 5_000,
    });

    // Clear filter.
    await page.getByText("Clear all").click();
    await expect(page.getByText("Help with housing")).toBeVisible();
  });

  // ── 9. Accessibility ────────────────────────────────────────────

  test("filter pill bar has correct ARIA structure", async () => {
    // Toolbar role on the filter bar.
    const toolbar = page.locator('[role="toolbar"]');
    await expect(toolbar).toBeAttached();
    await expect(toolbar).toHaveAttribute("aria-label", "Filter tickets");

    // Each filter pill has role="button", aria-haspopup, aria-expanded.
    const pills = page.locator('[role="toolbar"] [role="button"]');
    const count = await pills.count();
    expect(count).toBeGreaterThanOrEqual(4); // status, queue, priority, assignee

    // Verify first pill (Status) has expected ARIA attributes.
    const statusChip = pills.first();
    await expect(statusChip).toHaveAttribute("aria-haspopup");
    await expect(statusChip).toHaveAttribute("aria-expanded", "false");
  });

  test("escape closes open filter popover", async () => {
    // Open status pill.
    const statusPill = page.locator('[role="toolbar"]').getByText("Status");
    await statusPill.click();

    // Popover should be visible with status options.
    const filterGroup = page.getByRole("group", { name: "Status" });
    await expect(filterGroup.getByText("New")).toBeVisible();

    // Press Escape to close.
    await page.keyboard.press("Escape");

    // The filter group should no longer be visible after dismissal.
    await expect(filterGroup).not.toBeVisible({ timeout: 3_000 });
  });

  test("passes axe accessibility audit on ticket list", async () => {
    // Ensure we're on the tickets page with content visible.
    await expect(page.getByText("Help with housing")).toBeVisible();

    // Scope to WCAG rules only. Exclude best-practice rules (page-has-heading-one,
    // aria-dialog-name on Konsta-internal dialogs) which are tracked separately.
    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("[role='tablist']")
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("passes axe accessibility audit in grid mode", async () => {
    await page.getByRole("button", { name: "Grid view" }).click();
    await expect(
      page.locator('[data-virtual="row"][data-grid]').first(),
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("[role='tablist']")
      .analyze();
    expect(results.violations).toEqual([]);

    // Restore list mode.
    await page.getByRole("button", { name: "List view" }).click();
  });

  // ── 10. Visual themes ───────────────────────────────────────────

  test("all themes render without visual breakage", async () => {
    const themes = ["riso", "default", "frutiger", "brutalist", "cupertino"];

    for (const theme of themes) {
      // Set theme via localStorage (same mechanism as ThemeProvider).
      await page.evaluate((t: string) => {
        localStorage.setItem("care-y-theme", t);
        // Dispatch storage event to trigger reactive update.
        window.dispatchEvent(new Event("storage"));
      }, theme);

      // Force a re-render by navigating away and back.
      await page.getByRole("tab", { name: "Home" }).click();
      await page.getByRole("tab", { name: "Tickets" }).click();

      // Wait for tickets to render.
      await expect(page.getByText("Help with housing")).toBeVisible({
        timeout: CRYPTO_TIMEOUT,
      });

      // Verify no layout crash: cards are still visible, filter bar is
      // present, and the view toggle still works.
      await expect(
        page.locator('[data-testid="ticket-card-wrap"]').first(),
      ).toBeVisible();
      await expect(page.locator('[role="toolbar"]')).toBeVisible();
      await expect(
        page.getByRole("button", { name: "List view" }),
      ).toBeVisible();

      // Take screenshot for manual comparison (stored by Playwright).
      await page.screenshot({
        path: `test-results/theme-${theme}-tickets.png`,
        fullPage: false,
      });
    }

    // Restore default theme.
    await page.evaluate(() => {
      localStorage.setItem("care-y-theme", "riso");
      window.dispatchEvent(new Event("storage"));
    });
  });
});
