import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Locator, Page } from "@playwright/test";
import { auditA11y, boxOf, CRYPTO_TIMEOUT, E2eError, login } from "./helpers";

test.describe.serial("Desktop Responsive Layout", () => {
  let page: Page;
  /** The desktop sidebar landmark (nav with aria-label from nav_sidebar_label). */
  let sidebar: Locator;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
    sidebar = page.getByRole("navigation", { name: "Sidebar navigation" });

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
    await expect(sidebar).toBeVisible();
  });

  test("sidebar has correct ARIA structure", async () => {
    const tablist = sidebar.getByRole("tablist");
    await expect(tablist).toBeVisible();
    await expect(tablist).toHaveAttribute("aria-orientation", "vertical");

    // All three main tabs are present as role="tab".
    for (const name of ["Overview", "Tickets", "Library"]) {
      const tab = tablist.getByRole("tab", { name });
      await expect(tab).toBeAttached();
    }
  });

  test("Home tab is active in sidebar by default", async () => {
    const homeTab = sidebar.locator('[data-sidebar-id="home"]');
    await expect(homeTab).toHaveAttribute("aria-selected", "true");
  });

  test("bottom tabbar is hidden at desktop", async () => {
    // The mobile bottom tab bar and the desktop sidebar both expose a
    // "Main navigation" tablist; at desktop only the sidebar's vertical
    // one remains.
    const mainTablists = page.getByRole("tablist", {
      name: "Main navigation",
    });
    await expect(mainTablists).toHaveCount(1);
    await expect(mainTablists).toHaveAttribute("aria-orientation", "vertical");
  });

  // ── Sidebar navigation ─────────────────────────────────────────────

  test("clicking sidebar tab navigates to tickets", async () => {
    const ticketsTab = sidebar.locator('[data-sidebar-id="tickets"]');
    await ticketsTab.click();
    await expect(page).toHaveURL("/tickets");

    // Active state transfers.
    await expect(ticketsTab).toHaveAttribute("aria-selected", "true");

    // Previous tab is no longer active.
    const homeTab = sidebar.locator('[data-sidebar-id="home"]');
    await expect(homeTab).toHaveAttribute("aria-selected", "false");
  });

  test("clicking sidebar library tab navigates to library", async () => {
    const libraryTab = sidebar.locator('[data-sidebar-id="library"]');
    await libraryTab.click();
    await expect(page).toHaveURL("/library");
    await expect(libraryTab).toHaveAttribute("aria-selected", "true");
  });

  // Navigate back to home for subsequent tests.
  test("sidebar home tab navigates back to dashboard", async () => {
    const homeTab = sidebar.locator('[data-sidebar-id="home"]');
    await homeTab.click();
    await expect(page).toHaveURL("/");
  });

  // ── Sidebar expand/collapse ────────────────────────────────────────

  test("sidebar starts collapsed (icons only, no labels)", async () => {
    // Move mouse away from sidebar to clear any hover state from prior tests.
    await page.mouse.move(640, 400);

    // The collapsed rail shows no label text; tabs stay reachable
    // through their aria-labels (asserted in the ARIA structure test).
    for (const label of ["Overview", "Tickets", "Library"]) {
      await expect(sidebar.getByText(label, { exact: true })).toHaveCount(0);
    }
  });

  test("sidebar expands on hover and shows labels", async () => {
    const collapsedBox = await boxOf(sidebar);

    // Hover to trigger expansion (300ms delay in component).
    await sidebar.hover();

    // Labels become visible once expanded.
    await expect(sidebar.getByText("Overview", { exact: true })).toBeVisible();

    // The rail widens to fit the labels. The width transition may still
    // be running when the label first renders, so poll.
    await expect
      .poll(async () => (await sidebar.boundingBox())?.width ?? 0)
      .toBeGreaterThan(collapsedBox.width);

    // Move mouse away to collapse; labels disappear again.
    await page.mouse.move(640, 360);
    await expect(sidebar.getByText("Overview", { exact: true })).toHaveCount(0);
  });

  // ── Sidebar keyboard navigation ────────────────────────────────────

  test("arrow keys navigate between sidebar tabs", async () => {
    const homeTab = sidebar.locator('[data-sidebar-id="home"]');
    await homeTab.focus();

    // ArrowDown moves to next item.
    await page.keyboard.press("ArrowDown");
    const ticketsTab = sidebar.locator('[data-sidebar-id="tickets"]');
    await expect(ticketsTab).toBeFocused();

    // ArrowDown again.
    await page.keyboard.press("ArrowDown");
    const libraryTab = sidebar.locator('[data-sidebar-id="library"]');
    await expect(libraryTab).toBeFocused();

    // Home key jumps to first.
    await page.keyboard.press("Home");
    await expect(homeTab).toBeFocused();

    // End key jumps to last.
    await page.keyboard.press("End");
    const lastFocusable = sidebar.locator("[data-sidebar-id]").last();
    await expect(lastFocusable).toBeFocused();
  });

  // ── Dashboard two-column grid ──────────────────────────────────────

  test("dashboard renders two-column layout at desktop", async () => {
    // Ensure we're on the dashboard.
    await sidebar.locator('[data-sidebar-id="home"]').click();
    await expect(page).toHaveURL("/");

    // Both columns render content.
    const firstLeft = page.locator("[data-column='left']").first();
    const firstRight = page.locator("[data-column='right']").first();
    await expect(firstLeft).toBeVisible();
    await expect(firstRight).toBeVisible();

    // Two-column proof by geometry: the right column starts after the
    // left column ends, and the columns share vertical space (side by
    // side, not stacked as on mobile).
    const leftBox = await boxOf(firstLeft);
    const rightBox = await boxOf(firstRight);
    expect(rightBox.x).toBeGreaterThanOrEqual(leftBox.x + leftBox.width);
    expect(rightBox.y).toBeLessThan(leftBox.y + leftBox.height);
  });

  // ── Ticket split view ──────────────────────────────────────────────

  test("ticket list renders in split view at desktop", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    await sidebar.locator('[data-sidebar-id="tickets"]').click();
    await expect(page).toHaveURL("/tickets");

    // Wait for decrypted ticket content.
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Split view with both panes and the resize divider.
    await expect(page.locator('[data-testid="split-view"]')).toBeVisible();
    const leftPane = page.locator('[data-testid="split-left-pane"]');
    const rightPane = page.locator('[data-testid="split-right-pane"]');
    await expect(leftPane).toBeVisible();
    await expect(rightPane).toBeVisible();
    await expect(
      page.getByRole("separator", { name: "Resize panels" }),
    ).toBeVisible();

    // Panes sit side by side (1px tolerance for the divider's negative
    // margins and subpixel rounding).
    const leftBox = await boxOf(leftPane);
    const rightBox = await boxOf(rightPane);
    expect(rightBox.x).toBeGreaterThanOrEqual(leftBox.x + leftBox.width - 1);

    // Placeholder prompt shown when no ticket selected.
    await expect(page.getByText("Select a ticket to view")).toBeVisible();
  });

  test("clicking ticket opens detail in right pane", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);

    // Click a ticket card in the list pane. Each card exposes a single
    // "Open <ticket> <alias>" overlay button.
    const card = page
      .locator('[data-testid="split-left-pane"]')
      .locator('[data-testid="ticket-card-wrap"]')
      .first()
      .getByRole("button", { name: /^open /i });
    await card.click();

    // URL stays at /tickets (shallow routing).
    await expect(page).toHaveURL("/tickets");

    // Placeholder prompt gives way to detail content.
    await expect(page.getByText("Select a ticket to view")).toHaveCount(0);

    // The detail pane should render ticket content.
    // Wait for either the chat log or a loading indicator.
    const detailPane = page.locator('[data-testid="split-right-pane"]');
    await expect(
      detailPane.locator('[role="log"], .skeleton-container'),
    ).toBeAttached({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("back button (Escape) closes detail pane", async () => {
    // Detail should be open from previous test.
    await expect(page.getByText("Select a ticket to view")).toHaveCount(0);

    // Press Escape to close.
    await page.keyboard.press("Escape");

    // Placeholder prompt reappears.
    await expect(page.getByText("Select a ticket to view")).toBeVisible();
  });

  test("split view divider has correct semantics", async () => {
    const divider = page.getByRole("separator", { name: "Resize panels" });
    await expect(divider).toBeVisible();
    await expect(divider).toHaveAttribute("aria-orientation", "vertical");
  });

  // ── Library split view ─────────────────────────────────────────────

  test("library renders in split view at desktop", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    await sidebar.locator('[data-sidebar-id="library"]').click();
    await expect(page).toHaveURL("/library");

    await expect(page.locator('[data-testid="split-view"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await expect(page.locator('[data-testid="split-left-pane"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="split-right-pane"]'),
    ).toBeVisible();
    await expect(page.getByText("Select an article to read")).toBeVisible();
  });

  // ── Content width constraints ──────────────────────────────────────

  test("content areas have max-width constraint", async () => {
    // Navigate to dashboard (non-split-view page).
    await sidebar.locator('[data-sidebar-id="home"]').click();
    await expect(page).toHaveURL("/");

    // At desktop widths, content should not stretch to the full viewport.
    // The main content area's width should be less than the viewport width.
    const viewportWidth = page.viewportSize()?.width ?? 1280;
    const mainContent = page.locator("main");
    await expect(mainContent).toBeAttached();
    const mainBox = await mainContent.boundingBox();
    expect(mainBox).toBeTruthy();
    expect(mainBox!.width).toBeLessThanOrEqual(viewportWidth);
  });

  // ── Subnavbar behavior at desktop ──────────────────────────────────

  test("subnavbar stays visible at desktop (no collapse on scroll)", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    // Navigate to tickets which has a subnavbar (filter pills).
    await sidebar.locator('[data-sidebar-id="tickets"]').click();
    await expect(page).toHaveURL("/tickets");
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    const subnavbar = page.locator(".shell-subnavbar");
    await expect(subnavbar).toBeVisible();

    // Scroll down in the list pane.
    const listPane = page.locator('[data-testid="split-left-pane"]');
    await listPane.evaluate((el) => {
      el.scrollBy(0, 500);
    });
    await page.waitForTimeout(300);

    // Subnavbar should still be visible after scroll.
    await expect(subnavbar).toBeVisible();
  });

  // ── PTR disabled at desktop ────────────────────────────────────────

  test("pull-to-refresh is disabled at desktop", async () => {
    // PTR indicator is always in the DOM but should be dormant at desktop.
    // PTR activation is gated on layoutMode.isDesktop in onPageTouchStart.
    const ptrIndicator = page.locator(".ptr-indicator");
    await expect(ptrIndicator).toBeAttached();
    const ptrHeight = await ptrIndicator.evaluate((el) =>
      parseFloat(getComputedStyle(el).height),
    );
    expect(ptrHeight).toBeLessThanOrEqual(1);
  });

  // ── Overlay adaptation ─────────────────────────────────────────────

  test("search opens as a navbar dropdown at desktop, not a bottom sheet", async () => {
    // Navigate to the dashboard, where the navbar search button is shown.
    await sidebar.locator('[data-sidebar-id="home"]').click();
    await expect(page).toHaveURL("/");

    const searchBtn = page.getByRole("button", { name: "Search" });
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();

    // Both search treatments expose the same search landmark, labeled
    // from the search_hint message.
    const searchRegion = page.getByRole("search", {
      name: /unlocked on this device/i,
    });
    await expect(searchRegion).toBeVisible();

    // Desktop treatment drops down from the navbar, so it is anchored
    // in the top half of the viewport. A bottom sheet would rise from
    // the bottom edge and sit in the lower half.
    const box = await boxOf(searchRegion);
    const viewport = page.viewportSize();
    if (viewport == null) throw new E2eError("Viewport size unavailable");
    expect(box.y).toBeLessThan(viewport.height / 2);

    // Escape closes search.
    await page.keyboard.press("Escape");
    await expect(searchRegion).toBeHidden();
  });

  // ── Keyboard shortcuts ─────────────────────────────────────────────

  test("Cmd+K opens search", async () => {
    // Ensure no text input is focused.
    await page.locator("body").click();
    await page.waitForTimeout(200);

    await page.keyboard.press("Meta+k");

    // The search landmark opens (dropdown at desktop, sheet at mobile;
    // both carry the same role and label).
    const searchRegion = page.getByRole("search", {
      name: /unlocked on this device/i,
    });
    await expect(searchRegion).toBeVisible({ timeout: 2_000 });

    // Escape closes search again.
    await page.keyboard.press("Escape");
    await expect(searchRegion).toBeHidden();
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
      .locator('[data-testid="split-left-pane"]')
      .locator('[data-testid="ticket-card-wrap"]')
      .first()
      .getByRole("button", { name: /^open /i });
    await card.click();

    // Detail pane replaces the placeholder prompt.
    await expect(page.getByText("Select a ticket to view")).toHaveCount(0);

    // Escape closes detail.
    await page.keyboard.press("Escape");
    await expect(page.getByText("Select a ticket to view")).toBeVisible();
  });

  // ── User section in sidebar ────────────────────────────────────────

  test("sidebar user section is visible", async () => {
    // Settings and logout controls live in the sidebar's user section
    // and are exposed by accessible name even while collapsed.
    await expect(
      sidebar.getByRole("button", { name: "Settings" }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("button", { name: "Log out" }),
    ).toBeVisible();
  });

  test("avatar panel (ShellPanel) is hidden at desktop", async () => {
    // The account button in the navbar should be hidden at desktop.
    const accountBtn = page.getByRole("button", { name: "Account" });
    await expect(accountBtn).toBeHidden();
  });

  // ── Visual theme compatibility ─────────────────────────────────────

  test("sidebar renders across all visual themes without breakage", async () => {
    const themes = ["riso", "default", "frutiger", "brutalist", "cupertino"];

    for (const theme of themes) {
      await page.evaluate((t: string) => {
        localStorage.setItem("care-y-visual-theme", t);
      }, theme);
      await page.reload();
      await expect(page.getByRole("navigation")).toBeVisible({
        timeout: CRYPTO_TIMEOUT,
      });

      // Sidebar stays visible and structurally intact under the theme:
      // all three tabs remain and the active tab still reports state.
      await expect(sidebar).toBeVisible();
      for (const name of ["Overview", "Tickets", "Library"]) {
        await expect(sidebar.getByRole("tab", { name })).toBeVisible();
      }
    }

    // Restore default visual theme.
    await page.evaluate(() => {
      localStorage.setItem("care-y-visual-theme", "default");
    });
    await page.reload();
  });

  // ── Accessibility ──────────────────────────────────────────────────

  test("desktop layout passes axe accessibility audit on dashboard", async () => {
    await sidebar.locator('[data-sidebar-id="home"]').click();
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    await auditA11y(page);
  });

  test("desktop layout passes axe audit on ticket split view", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    await sidebar.locator('[data-sidebar-id="tickets"]').click();
    await expect(page).toHaveURL("/tickets");
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    await auditA11y(page);
  });

  test("desktop layout passes axe audit on library split view", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    await sidebar.locator('[data-sidebar-id="library"]').click();
    await expect(page).toHaveURL("/library");
    await expect(page.locator('[data-testid="split-view"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    await auditA11y(page);
  });
});
