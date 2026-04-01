import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Dashboard (Home Tab)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── Stat cards ─────────────────────────────────────────────────────

  test("renders three stat cards", async ({ page }) => {
    // QueryLoader must resolve before stat cards appear.
    // With no seeded tickets, all counts are 0 but the cards still render.
    const statCards = page.locator(".stat-card");
    await expect(statCards).toHaveCount(3);
  });

  test("stat cards display labels from i18n", async ({ page }) => {
    // Verify i18n keys are wired (not hardcoded English).
    await expect(page.getByRole("button", { name: /my open/i })).toBeAttached();
    await expect(
      page.getByRole("button", { name: /unassigned/i }),
    ).toBeAttached();
    await expect(page.getByRole("button", { name: /on hold/i })).toBeAttached();
  });

  test("stat card navigates to tickets with filter param", async ({ page }) => {
    await page.getByRole("button", { name: /unassigned/i }).click();
    await expect(page).toHaveURL(/\/tickets\?filter=unassigned/);
  });

  // ── Tab navigation ─────────────────────────────────────────────────

  test("Tickets tab navigates to /tickets", async ({ page }) => {
    const ticketsTab = page.getByRole("tab", { name: "Tickets" });
    await ticketsTab.click();
    await expect(page).toHaveURL("/tickets");
  });

  test("Home tab navigates back to /", async ({ page }) => {
    // Navigate away first.
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");

    // Navigate back.
    await page.getByRole("tab", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("active tab reflects current URL on direct navigation", async ({
    page,
  }) => {
    await page.goto("/tickets");
    const ticketsTab = page.getByRole("tab", { name: "Tickets" });
    await expect(ticketsTab).toHaveAttribute("aria-selected", "true");
  });

  // ── Mock tickets page (relocated stub for 6c) ─────────────────────

  test("mock tickets page is accessible at /tickets", async ({ page }) => {
    await page.goto("/tickets");
    await expect(page.getByText("Tickets")).toBeVisible();
  });

  // ── Empty state ────────────────────────────────────────────────────

  test("shows empty state when no tickets exist", async ({ page }) => {
    // Without seeded tickets, preview lists render EmptyState.
    const emptyMessages = page.getByText("Nothing here right now");
    // Two preview sections (My Tickets, Needs Attention) each show empty state.
    await expect(emptyMessages.first()).toBeVisible();
  });

  // ── Notification slot ──────────────────────────────────────────────

  test("exposure notification slot exists but is hidden", async ({ page }) => {
    // The Konsta Notification is structurally present but opened={false}.
    // When hidden, Konsta sets display:none or similar. The element should
    // not be visible to the user.
    const notification = page.locator('[role="alert"]');
    await expect(notification).toBeAttached();
    await expect(notification).not.toBeVisible();
  });

  // ── Accessibility ──────────────────────────────────────────────────

  test("passes axe accessibility audit", async ({ page }) => {
    // Wait for content to settle (QueryLoader resolves or errors).
    await page.locator(".stat-card, .k-skeleton").first().waitFor();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
