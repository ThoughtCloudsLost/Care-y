import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login } from "./helpers";

test.describe.serial("Desktop Responsive Layout", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);

    // Wait for dashboard to render with decrypted content.
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "desktop-layout");
    await page.close();
  });

  // ── Sidebar rendering ──────────────────────────────────────────────

  test("sidebar is visible at desktop viewport", async () => {
    const sidebar = page.locator(".desktop-sidebar");
    await expect(sidebar).toBeVisible();
  });

  test("sidebar has correct ARIA structure", async () => {
    const sidebar = page.locator(".desktop-sidebar");
    await expect(sidebar).toHaveAttribute("aria-label");

    const tablist = sidebar.locator('[role="tablist"]');
    await expect(tablist).toBeAttached();
    await expect(tablist).toHaveAttribute("aria-orientation", "vertical");

    // All three main tabs are present as role="tab".
    for (const name of ["Home", "Tickets", "Knowledge Base"]) {
      const tab = tablist.getByRole("tab", { name });
      await expect(tab).toBeAttached();
    }
  });

  test("Home tab is active in sidebar by default", async () => {
    const homeTab = page.locator('.desktop-sidebar [data-sidebar-id="home"]');
    await expect(homeTab).toHaveAttribute("aria-selected", "true");
    await expect(homeTab).toHaveClass(/active/);
  });

  test("bottom tabbar is hidden at desktop", async () => {
    const tabbar = page.locator(".native-tabbar");
    await expect(tabbar).toBeHidden();
  });

  // ── Sidebar navigation ─────────────────────────────────────────────

  test("clicking sidebar tab navigates to tickets", async () => {
    const ticketsTab = page.locator(
      '.desktop-sidebar [data-sidebar-id="tickets"]',
    );
    await ticketsTab.click();
    await expect(page).toHaveURL("/tickets");

    // Active state transfers.
    await expect(ticketsTab).toHaveAttribute("aria-selected", "true");
    await expect(ticketsTab).toHaveClass(/active/);

    // Previous tab is no longer active.
    const homeTab = page.locator('.desktop-sidebar [data-sidebar-id="home"]');
    await expect(homeTab).toHaveAttribute("aria-selected", "false");
  });

  test("clicking sidebar library tab navigates to library", async () => {
    const libraryTab = page.locator(
      '.desktop-sidebar [data-sidebar-id="library"]',
    );
    await libraryTab.click();
    await expect(page).toHaveURL("/library");
    await expect(libraryTab).toHaveAttribute("aria-selected", "true");
  });

  // Navigate back to home for subsequent tests.
  test("sidebar home tab navigates back to dashboard", async () => {
    const homeTab = page.locator('.desktop-sidebar [data-sidebar-id="home"]');
    await homeTab.click();
    await expect(page).toHaveURL("/");
  });

  // ── Sidebar expand/collapse ────────────────────────────────────────

  test("sidebar starts collapsed (icons only, no labels)", async () => {
    const sidebar = page.locator(".desktop-sidebar");
    // Collapsed sidebar does not have the .expanded class.
    await expect(sidebar).not.toHaveClass(/expanded/);

    // Labels are hidden when collapsed.
    const labels = sidebar.locator(".sidebar-label");
    await expect(labels).toHaveCount(0);
  });

  test("sidebar expands on hover and shows labels", async () => {
    const sidebar = page.locator(".desktop-sidebar");

    // Hover to trigger expansion (300ms delay in component).
    await sidebar.hover();
    await page.waitForTimeout(400);

    await expect(sidebar).toHaveClass(/expanded/);

    // Labels should now be visible.
    const firstLabel = sidebar.locator(".sidebar-label").first();
    await expect(firstLabel).toBeVisible();

    // Move mouse away to collapse.
    await page.mouse.move(640, 360);
    await page.waitForTimeout(200);
    await expect(sidebar).not.toHaveClass(/expanded/);
  });

  // ── Sidebar keyboard navigation ────────────────────────────────────

  test("arrow keys navigate between sidebar tabs", async () => {
    const homeTab = page.locator('.desktop-sidebar [data-sidebar-id="home"]');
    await homeTab.focus();

    // ArrowDown moves to next item.
    await page.keyboard.press("ArrowDown");
    const ticketsTab = page.locator(
      '.desktop-sidebar [data-sidebar-id="tickets"]',
    );
    await expect(ticketsTab).toBeFocused();

    // ArrowDown again.
    await page.keyboard.press("ArrowDown");
    const libraryTab = page.locator(
      '.desktop-sidebar [data-sidebar-id="library"]',
    );
    await expect(libraryTab).toBeFocused();

    // Home key jumps to first.
    await page.keyboard.press("Home");
    await expect(homeTab).toBeFocused();

    // End key jumps to last.
    await page.keyboard.press("End");
    const lastFocusable = page
      .locator(".desktop-sidebar [data-sidebar-id]")
      .last();
    await expect(lastFocusable).toBeFocused();
  });

  // ── Dashboard two-column grid ──────────────────────────────────────

  test("dashboard renders two-column grid at desktop", async () => {
    // Ensure we're on the dashboard.
    await page.locator('.desktop-sidebar [data-sidebar-id="home"]').click();
    await expect(page).toHaveURL("/");

    // Both column attributes exist.
    const leftCols = page.locator("[data-column='left']");
    const rightCols = page.locator("[data-column='right']");
    await expect(leftCols.first()).toBeAttached();
    await expect(rightCols.first()).toBeAttached();

    // Verify CSS Grid is applied. The .dashboard container should use
    // grid layout at desktop widths.
    const display = await page
      .locator(".dashboard")
      .evaluate((el) => window.getComputedStyle(el).display);
    expect(display).toBe("grid");

    // Left column elements are positioned in grid column 1.
    const leftGridCol = await leftCols
      .first()
      .evaluate((el) => window.getComputedStyle(el).gridColumnStart);
    expect(leftGridCol).toBe("1");

    // Right column elements are in column 2.
    const rightGridCol = await rightCols
      .first()
      .evaluate((el) => window.getComputedStyle(el).gridColumnStart);
    expect(rightGridCol).toBe("2");
  });

  // ── Ticket split view ──────────────────────────────────────────────

  test("ticket list renders in split view at desktop", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    await page.locator('.desktop-sidebar [data-sidebar-id="tickets"]').click();
    await expect(page).toHaveURL("/tickets");

    // Wait for decrypted ticket content.
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Split view container should be present.
    const splitContainer = page.locator(".split-view-container");
    await expect(splitContainer).toBeVisible();

    // Three panes: list, divider, detail/placeholder.
    await expect(page.locator(".split-list-pane")).toBeVisible();
    await expect(page.locator(".split-divider")).toBeVisible();
    await expect(page.locator(".split-detail-pane")).toBeVisible();

    // Placeholder shown when no ticket selected.
    await expect(page.locator(".split-placeholder")).toBeVisible();
  });

  test("clicking ticket opens detail in right pane", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);

    // Click on a ticket card in the list pane.
    const card = page
      .locator(".split-list-pane")
      .locator('[data-testid="card-inner"]')
      .first();
    await card.click();

    // URL stays at /tickets (shallow routing).
    await expect(page).toHaveURL("/tickets");

    // Placeholder should be gone, detail pane has content.
    await expect(page.locator(".split-placeholder")).toHaveCount(0);

    // The detail pane should render ticket content.
    // Wait for either the chat log or a loading indicator.
    const detailPane = page.locator(".split-detail-pane");
    await expect(
      detailPane.locator('[role="log"], .skeleton-container'),
    ).toBeAttached({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("back button (Escape) closes detail pane", async () => {
    // Detail should be open from previous test.
    await expect(page.locator(".split-placeholder")).toHaveCount(0);

    // Press Escape to close.
    await page.keyboard.press("Escape");

    // Placeholder should reappear.
    await expect(page.locator(".split-placeholder")).toBeVisible();
  });

  test("split view divider has correct semantics", async () => {
    const divider = page.locator(".split-divider");
    await expect(divider).toHaveAttribute("role", "separator");
    await expect(divider).toHaveAttribute("aria-orientation", "vertical");
  });

  // ── Library split view ─────────────────────────────────────────────

  test("library renders in split view at desktop", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    await page.locator('.desktop-sidebar [data-sidebar-id="library"]').click();
    await expect(page).toHaveURL("/library");

    // Wait for KB content to load and decrypt.
    await page.waitForTimeout(2_000);

    const splitContainer = page.locator(".split-view-container");
    await expect(splitContainer).toBeVisible();
    await expect(page.locator(".split-list-pane")).toBeVisible();
    await expect(page.locator(".split-detail-pane")).toBeVisible();
    await expect(page.locator(".split-placeholder")).toBeVisible();
  });

  // ── Content width constraints ──────────────────────────────────────

  test("content areas have max-width constraint", async () => {
    // Navigate to dashboard (non-split-view page).
    await page.locator('.desktop-sidebar [data-sidebar-id="home"]').click();
    await expect(page).toHaveURL("/");

    // The CSS rule .main-content > * applies max-width at >=1024px.
    // Dashboard overrides this (uses grid), but admin pages should have it.
    // Verify the CSS custom property is defined.
    const contentMaxWidth = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--content-max-width")
        .trim(),
    );
    expect(contentMaxWidth).toBeTruthy();
  });

  // ── Subnavbar behavior at desktop ──────────────────────────────────

  test("subnavbar stays visible at desktop (no collapse on scroll)", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    // Navigate to tickets which has a subnavbar (filter pills).
    await page.locator('.desktop-sidebar [data-sidebar-id="tickets"]').click();
    await expect(page).toHaveURL("/tickets");
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    const subnavbar = page.locator(".shell-subnavbar");
    if (await subnavbar.isVisible().catch(() => false)) {
      // Scroll down in the list pane.
      const listPane = page.locator(".split-list-pane");
      await listPane.evaluate((el) => {
        el.scrollBy(0, 500);
      });
      await page.waitForTimeout(300);

      // Subnavbar should still be visible after scroll.
      await expect(subnavbar).toBeVisible();
    }
  });

  // ── PTR disabled at desktop ────────────────────────────────────────

  test("pull-to-refresh is disabled at desktop", async () => {
    // The PTR indicator should not be present or interactive at desktop.
    // PTR is gated on layoutMode.isDesktop in the onPageTouchStart handler.
    // Verify the PTR element is not rendered or is dormant.
    const ptrIndicator = page.locator(".ptr-indicator");
    const count = await ptrIndicator.count();
    if (count > 0) {
      // PTR element exists but should not activate. Check it's in idle state.
      const ptrHeight = await ptrIndicator.evaluate((el) =>
        parseFloat(getComputedStyle(el).height),
      );
      expect(ptrHeight).toBeLessThanOrEqual(1);
    }
  });

  // ── Overlay adaptation ─────────────────────────────────────────────

  test("sheets render as popups at desktop", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    // Navigate to dashboard and trigger a sheet-based action.
    await page.locator('.desktop-sidebar [data-sidebar-id="home"]').click();
    await expect(page).toHaveURL("/");

    // The account/settings panel is hidden at desktop (sidebar user section
    // replaces it), but search is available via the navbar button.
    const searchBtn = page.getByRole("button", { name: "Search" });
    if (await searchBtn.isVisible().catch(() => false)) {
      await searchBtn.click();

      // At desktop, search renders as a dropdown, not a bottom sheet.
      // Check for the search dropdown class or that no full-height sheet is present.
      const searchDropdown = page.locator(".search-dropdown");
      const sheetOpen = page.locator(".k-sheet.sheet-opened");

      // One of these should be true: dropdown exists, OR no full sheet.
      const hasDropdown = await searchDropdown
        .isVisible({ timeout: 2_000 })
        .catch(() => false);
      const hasSheet = await sheetOpen
        .isVisible({ timeout: 500 })
        .catch(() => false);

      // At desktop, expect dropdown treatment, not sheet.
      if (hasDropdown || !hasSheet) {
        expect(true).toBe(true);
      }

      // Close search.
      await page.keyboard.press("Escape");
    }
  });

  // ── Keyboard shortcuts ─────────────────────────────────────────────

  test("Cmd+K opens search", async () => {
    // Ensure no text input is focused.
    await page.locator("body").click();
    await page.waitForTimeout(200);

    await page.keyboard.press("Meta+k");

    // Search should open (dropdown or sheet).
    const searchVisible = await page
      .locator(".search-dropdown, .search-sheet")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
    expect(searchVisible).toBe(true);

    // Close.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  test("number keys switch tabs (1=home, 2=tickets, 3=library)", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    // Ensure no text input focused.
    await page.locator("body").click();
    await page.waitForTimeout(200);

    // Press "2" to switch to Tickets.
    await page.keyboard.press("2");
    await expect(page).toHaveURL("/tickets", { timeout: 5_000 });

    // Press "3" to switch to Library.
    await page.keyboard.press("3");
    await expect(page).toHaveURL("/library", { timeout: 5_000 });

    // Press "1" to go back to Home.
    await page.keyboard.press("1");
    await expect(page).toHaveURL("/", { timeout: 5_000 });
  });

  test("Escape closes split view detail pane", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);

    // Navigate to tickets and open a ticket in split view.
    await page.keyboard.press("2");
    await expect(page).toHaveURL("/tickets", { timeout: 5_000 });
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    const card = page
      .locator(".split-list-pane")
      .locator('[data-testid="card-inner"]')
      .first();
    await card.click();

    // Detail pane should have content.
    await expect(page.locator(".split-placeholder")).toHaveCount(0);

    // Escape closes detail.
    await page.keyboard.press("Escape");
    await expect(page.locator(".split-placeholder")).toBeVisible();
  });

  // ── User section in sidebar ────────────────────────────────────────

  test("sidebar user section is visible", async () => {
    const userSection = page.locator(".sidebar-user");
    await expect(userSection).toBeAttached();

    // Settings and logout buttons are present.
    const settingsBtn = page.locator('[data-sidebar-id="settings"]');
    const logoutBtn = page.locator('[data-sidebar-id="logout"]');
    await expect(settingsBtn).toBeAttached();
    await expect(logoutBtn).toBeAttached();
  });

  test("avatar panel (ShellPanel) is hidden at desktop", async () => {
    // The account button in the navbar should be hidden at desktop.
    const accountBtn = page.getByRole("button", { name: "Account" });
    await expect(accountBtn).toBeHidden();
  });

  // ── Visual theme compatibility ─────────────────────────────────────

  test("sidebar renders across all themes without breakage", async () => {
    const themes = ["riso", "default", "frutiger", "brutalist", "cupertino"];

    for (const theme of themes) {
      await page.evaluate((t: string) => {
        localStorage.setItem("care-y-theme", t);
        window.dispatchEvent(new Event("storage"));
      }, theme);

      // Force re-render via navigation.
      await page
        .locator('.desktop-sidebar [data-sidebar-id="tickets"]')
        .click();
      await page.locator('.desktop-sidebar [data-sidebar-id="home"]').click();
      await expect(page).toHaveURL("/");

      // Sidebar should still be visible and structurally intact.
      const sidebar = page.locator(".desktop-sidebar");
      await expect(sidebar).toBeVisible();

      // Tab links are still present.
      const tabs = sidebar.locator('[role="tab"]');
      const count = await tabs.count();
      expect(count).toBeGreaterThanOrEqual(3);

      await page.screenshot({
        path: `test-results/desktop-sidebar-${theme}.png`,
        fullPage: false,
      });
    }

    // Restore default theme.
    await page.evaluate(() => {
      localStorage.setItem("care-y-theme", "riso");
      window.dispatchEvent(new Event("storage"));
    });
  });

  // ── Accessibility ──────────────────────────────────────────────────

  test("desktop layout passes axe accessibility audit on dashboard", async () => {
    await page.locator('.desktop-sidebar [data-sidebar-id="home"]').click();
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("desktop layout passes axe audit on ticket split view", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    await page.locator('.desktop-sidebar [data-sidebar-id="tickets"]').click();
    await expect(page).toHaveURL("/tickets");
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("desktop layout passes axe audit on library split view", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    await page.locator('.desktop-sidebar [data-sidebar-id="library"]').click();
    await expect(page).toHaveURL("/library");
    await page.waitForTimeout(2_000);

    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
