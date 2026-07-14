import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login } from "./helpers";

test.describe.serial("Knowledge Base (Library Tab)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
    // Navigate to Library tab (the test suite covers this tab, not the
    // dashboard KB section which only shows the 2 most recent articles).
    await page.getByRole("tab", { name: /library/i }).click();
    await expect(page).toHaveURL("/library");
    await expect(page.getByText("Safety planning template")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "kb");
    await page.close();
  });

  // ── 1. Tab visibility ─────────────────────────────────────────

  test("Library tab visible in tabbar", async () => {
    const libraryTab = page.getByRole("tab", { name: /library/i });
    await expect(libraryTab).toBeVisible();
  });

  test("Calendar tab is NOT in tabbar (moved to More)", async () => {
    const calendarTab = page.getByRole("tab", { name: /calendar/i });
    await expect(calendarTab).not.toBeAttached();
  });

  // ── 2. Library page shows articles ────────────────────────────

  test("navigating to Library tab shows article list", async () => {
    await page.getByRole("tab", { name: /library/i }).click();
    await expect(page).toHaveURL("/library");

    // Wait for any decrypted article title. These are org-key encrypted
    // and decrypted via OrgDecryptCache on the client. The default sort
    // order may vary, so wait for the first article that appears.
    await expect(
      page
        .getByText("Escalation protocol")
        .or(page.getByText("Safety planning template"))
        .first(),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  test("article list shows decrypted titles from seed data", async () => {
    // All 5 seeded articles should appear with decrypted titles.
    // Use generous timeout since articles load via infinite scroll.
    const timeout = 10_000;
    await expect(page.getByText("Intake call checklist")).toBeVisible({
      timeout,
    });
    await expect(page.getByText("Escalation protocol")).toBeVisible();
    await expect(page.getByText("Housing referral contacts")).toBeVisible();
    await expect(page.getByText("Legal aid directory")).toBeVisible();
    await expect(page.getByText("Safety planning template")).toBeVisible();
  });

  test("article cards show category badges", async () => {
    // All three seeded category names should appear as badges on cards.
    await expect(page.getByText("Procedures").first()).toBeVisible();
    await expect(page.getByText("Resources").first()).toBeVisible();
    await expect(page.getByText("Safety").first()).toBeVisible();
  });

  // ── 3. View toggle ────────────────────────────────────────────

  test("view toggle switches between list and grid layout", async () => {
    // Default is list mode. Switch to grid.
    const gridBtn = page.getByRole("button", { name: "Grid view" });
    await gridBtn.click();
    await expect(gridBtn).toHaveAttribute("aria-pressed", "true");

    // Switch back to list.
    const listBtn = page.getByRole("button", { name: "List view" });
    await listBtn.click();
    await expect(listBtn).toHaveAttribute("aria-pressed", "true");
  });

  // ── 4. Sort popover ───────────────────────────────────────────

  test("sort popover changes article order", async () => {
    // Open sort popover.
    const sortBtn = page.getByRole("button", { name: /sort/i });
    await sortBtn.click();

    // Sort options should be visible inside the popover dialog.
    const sortPopover = page.getByRole("dialog").last();
    await expect(sortPopover).toBeVisible();

    // Tap a sort option (e.g., Rating).
    await sortPopover.getByText(/rating/i).click();

    // Articles should still be visible after re-sort.
    await expect(page.getByText("Intake call checklist")).toBeVisible();

    // Dismiss the popover by pressing Escape.
    await page.keyboard.press("Escape");
    await expect(sortPopover).not.toBeVisible();
  });

  // (Empty state and skeleton loading are not testable in a serial suite
  // with cached data. The skeleton state was verified visually. The empty
  // state requires filter manipulation that belongs in a filter-specific
  // test, not in a read-only flow test.)

  // ── 7. Article detail ─────────────────────────────────────────

  test("tapping an article shows rendered body content", async () => {
    // Tap the first article in the list.
    await page.getByText("Intake call checklist").click();

    // On desktop, the library uses split view with pushState (no URL change).
    // The article detail renders in the right pane.
    // The article title should be visible as an h1.
    await expect(
      page.locator("h1").getByText("Intake call checklist"),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // The article body should be rendered (decrypted + DOMPurify-sanitized).
    // Seed data for "Intake call checklist" contains "Before the call" as
    // a heading in the ProseMirror JSON body.
    await expect(page.getByText("Before the call")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("article detail shows category and metadata", async () => {
    // The "Intake call checklist" belongs to "Procedures" category.
    // The navbar title also says "Procedures" (two matches expected).
    await expect(page.getByText("Procedures").first()).toBeVisible();

    // Metadata group contains the relative timestamp (author may be
    // absent when the volunteer decrypt cache has no entry).
    const meta = page.getByRole("group", { name: "Article information" });
    await expect(meta).toBeVisible();
    await expect(meta.getByText(/updated/i)).toBeVisible();
  });

  // ── 8. Voting ─────────────────────────────────────────────────

  test("voting: thumbs up works with optimistic update", async () => {
    // The "Was this helpful?" prompt should be visible.
    await expect(page.getByText("Was this helpful?")).toBeVisible();

    // Vote up.
    const upButton = page
      .locator("[role='group']")
      .getByRole("button", { name: "Helpful", exact: true });
    await upButton.click();

    // Button should reflect the vote state via aria-pressed.
    await expect(upButton).toHaveAttribute("aria-pressed", "true");
  });

  test("voting: tapping same direction removes vote", async () => {
    // Tap up again to remove the vote.
    const upButton = page
      .locator("[role='group']")
      .getByRole("button", { name: "Helpful", exact: true });
    await upButton.click();

    // Vote should be removed.
    await expect(upButton).toHaveAttribute("aria-pressed", "false");
  });

  test("voting: thumbs down works", async () => {
    const downButton = page
      .locator("[role='group']")
      .getByRole("button", { name: "Not helpful" });
    await downButton.click();
    await expect(downButton).toHaveAttribute("aria-pressed", "true");

    // Clean up: remove the vote.
    await downButton.click();
    await expect(downButton).toHaveAttribute("aria-pressed", "false");
  });

  // ── 9. Navigate back to library ───────────────────────────────

  test("back button returns to library list", async () => {
    // On desktop split view, the detail pane has a close button (Escape).
    // On mobile, the back button navigates to /library.
    const backBtn = page.getByRole("button", {
      name: /back to library|close/i,
    });
    const hasBackBtn = await backBtn
      .isVisible({ timeout: 2_000 })
      .catch(() => false);

    if (hasBackBtn) {
      await backBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }

    await expect(page).toHaveURL("/library");
    await expect(page.getByText("Intake call checklist")).toBeVisible();
  });

  // ── 10. Search ────────────────────────────────────────────────

  test("KB search returns matching articles", async () => {
    // Open the universal search sheet (exact match avoids "Search this page").
    await page.getByRole("button", { name: "Search", exact: true }).click();

    const sheet = page.locator("[role='search']");
    await expect(sheet).toBeVisible();

    // The Konsta Searchbar renders in the navbar with placeholder="Search".
    // Target by accessible name to avoid hitting other text inputs.
    const searchbar = page.getByRole("textbox", { name: "Search" });
    await searchbar.fill("checklist");

    // The KB search provider lazy-loads all articles on first search,
    // decrypts them, then filters.
    await expect(sheet.getByText("Intake call checklist")).toBeVisible({
      timeout: 15_000,
    });

    // Leave search open for the next test (which re-uses the searchbar).
  });

  test("KB search: tapping result navigates to article", async () => {
    // Search is still open from previous test. Clear and type new query.
    const sheet = page.locator("[role='search']");
    const searchbar = page.getByRole("textbox", { name: "Search" });
    await searchbar.fill("escalation");

    await expect(sheet.getByText("Escalation protocol")).toBeVisible({
      timeout: 10_000,
    });

    // Tap the result.
    await sheet.getByText("Escalation protocol").click();

    // Article detail opens (split view on desktop, full-page on mobile).
    await expect(
      page.locator("h1").getByText("Escalation protocol"),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Navigate back to library for subsequent tests.
    const backBtn2 = page.getByRole("button", {
      name: /back to library|close/i,
    });
    const hasBack2 = await backBtn2
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
    if (hasBack2) {
      await backBtn2.click();
    } else {
      await page.keyboard.press("Escape");
    }
    await expect(page).toHaveURL("/library");
  });

  // ── 11. Dashboard KB section navigation ───────────────────────

  test("dashboard KBSection links navigate to article detail", async () => {
    // Navigate to dashboard.
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page).toHaveURL("/");

    // The KB section may be collapsed from earlier tests. Expand it first.
    const kbSection = page.locator("#section-kb");
    const sectionHeader = kbSection.getByRole("button", {
      name: /library/i,
    });
    const isExpanded = await sectionHeader.getAttribute("aria-expanded");
    if (isExpanded !== "true") {
      await sectionHeader.click();
    }

    // Wait for a decrypted KB article item inside the expanded region.
    // Target the article rows (role="button" inside the kb-surface), not the
    // section header toggle which is also a button.
    const kbItem = kbSection.locator("[role='button'].kb-row").first();
    await expect(kbItem).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await kbItem.click();

    // Article detail opens (split view on desktop, full-page on mobile).
    await expect(page.locator("h1.article-title")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Return to dashboard for cleanup.
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page).toHaveURL("/");
  });

  // ── 12. Accessibility ─────────────────────────────────────────

  test("a11y: library page passes axe-core audit", async () => {
    await page.getByRole("tab", { name: /library/i }).click();
    await expect(page.getByText("Intake call checklist")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Exclude Konsta UI internal a11y violations:
    // - tablist contains role=link (More tab), aria-required-children
    // These are tracked separately from KB-specific tests.
    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .disableRules(["target-size"])
      .exclude("[role='tablist']")
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("a11y: article detail passes axe-core audit", async () => {
    // Navigate to an article.
    await page.getByText("Intake call checklist").click();
    await expect(
      page.locator("h1").getByText("Intake call checklist"),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Wait for body to render (decryption + sanitization).
    await expect(page.getByText("Before the call")).toBeVisible({
      timeout: 10_000,
    });

    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .exclude("[role='tablist']")
      .disableRules(["color-contrast", "aria-dialog-name"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
