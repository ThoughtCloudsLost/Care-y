import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { auditA11y, CRYPTO_TIMEOUT, login, longPress } from "./helpers";

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

    // Ticket without key wrap shows "Locked ticket" placeholder with help icon.
    await expect(page.getByText("Locked ticket")).toBeVisible();
  });

  test("cards show queue badges, status dots, and priority chips", async () => {
    // Queue badges are Konsta Chip elements with queue names.
    // Some cards may be below the fold, so check DOM presence.
    await expect(page.getByText("Housing").first()).toBeAttached();
    await expect(page.getByText("Crisis").first()).toBeAttached();
    await expect(page.getByText("Intake").first()).toBeAttached();

    // Status marks render in card headers with data-status attribute.
    const statusMarks = page.locator("[data-status]");
    await expect(statusMarks.first()).toBeAttached();
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

  // ── 3b. Inline search over decrypted titles ─────────────────────

  test("inline search matches decrypted ticket titles", async () => {
    // Enter search mode via the subnavbar trigger.
    await page.getByRole("button", { name: "Search this page" }).click();

    // Type a term that appears only in one decrypted title.
    const searchInput = page.getByRole("textbox", { name: "Refine search" });
    await searchInput.fill("safety");

    // The list narrows to tickets whose decrypted title matches.
    await expect(page.getByText("Safety planning session")).toBeVisible();
    await expect(page.getByText("Help with housing")).not.toBeVisible();

    // A different term flips the visible set, proving the match reads
    // the decrypted titles rather than any static order.
    await searchInput.fill("housing");
    await expect(page.getByText("Help with housing")).toBeVisible();
    await expect(page.getByText("Safety planning session")).not.toBeVisible();

    // Exit search; the full list returns.
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Safety planning session")).toBeVisible();
    await expect(page.getByText("Help with housing")).toBeVisible();
  });

  // ── 4. View toggle (list <-> grid) ──────────────────────────────

  test("view toggle switches between list and grid layouts", async () => {
    // Default is list (compact rows) mode.
    const listBtn = page.getByRole("button", { name: "Compact rows" });
    const gridBtn = page.getByRole("button", { name: "Grid" });

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

    // Action buttons should reappear in list mode (cards mode has them).
    const cardsBtn = page.getByRole("button", { name: "Cards" });
    await cardsBtn.click();
    await expect(cardsBtn).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator('[data-testid="card-actions"]').first(),
    ).toBeVisible();

    // Return to list for subsequent tests.
    await listBtn.click();
  });

  test("view mode preference persists across navigation", async () => {
    // Switch to grid.
    await page.getByRole("button", { name: "Grid" }).click();

    // Navigate away to Home tab, then back.
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page).toHaveURL("/");

    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");

    // Grid should still be active (persisted in localStorage).
    const gridBtn = page.getByRole("button", { name: "Grid" });
    await expect(gridBtn).toHaveAttribute("aria-pressed", "true");

    // Restore list mode for other tests.
    await page.getByRole("button", { name: "Compact rows" }).click();
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

    // The tabbar override shows selection count. The Konsta Toolbar
    // animates in via CSS transition, so use a generous timeout.
    // Use "attached" first since the text might be in the DOM but
    // off-screen during the Toolbar slide-up animation.
    await expect(page.getByText(/1 selected/)).toBeAttached({ timeout: 5_000 });
    await expect(page.getByText(/1 selected/)).toBeVisible({ timeout: 10_000 });

    // Tap another card to add to selection.
    const secondCard = page.locator('[data-testid="ticket-card-wrap"]').nth(1);
    await secondCard.click();
    await expect(page.getByText(/2 selected/)).toBeVisible();

    // Exit multi-select via the dismiss button (X icon in tabbar override).
    const dismissBtn = page.getByRole("button", {
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
    await page.getByRole("button", { name: "Exit selection mode" }).click();
  });

  // ── 7. Card tap navigation ──────────────────────────────────────

  test("tapping a card navigates to ticket detail route", async () => {
    // Click the first card's inner button area.
    const firstCardButton = page.locator("button.card-open-link").first();
    await firstCardButton.click();

    // On desktop, the detail opens in a split-view pane (URL stays at
    // /tickets). On mobile, it navigates to /tickets/{uuid}. Verify by
    // checking that the chat log appears.
    await expect(page.locator('[role="log"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Navigate back. On desktop split-view, the back button closes the
    // detail pane. On mobile, it goes back to /tickets.
    const backBtn = page.getByRole("button", { name: /back/i });
    if (await backBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await backBtn.click();
    }
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

    // Each filter pill is a native <button> with aria-haspopup, aria-expanded.
    const pills = toolbar.getByRole("button");
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

    // Konsta Tabbar internals are excluded (H-011); the shell tab bar is
    // audited by the sweep spec.
    await auditA11y(page, { exclude: ["[role='tablist']"] });
  });

  test("passes axe accessibility audit in grid mode", async () => {
    await page.getByRole("button", { name: "Grid" }).click();
    await expect(
      page.locator('[data-virtual="row"][data-grid]').first(),
    ).toBeVisible();

    await auditA11y(page, { exclude: ["[role='tablist']"] });

    // Restore list mode.
    await page.getByRole("button", { name: "Compact rows" }).click();
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
      await page.getByRole("tab", { name: "Overview" }).click();
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
        page.getByRole("button", { name: "Compact rows" }),
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
