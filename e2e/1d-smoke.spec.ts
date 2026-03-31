import { test, expect } from "@playwright/test";

test.describe("1d-smoke", () => {
  test("page loads and renders shell structure", async ({ page }) => {
    await page.goto("/");

    // Konsta App root renders
    const appRoot = page.locator(".k-app").first();
    await expect(appRoot).toBeVisible();

    // Main content landmark exists
    const main = page.locator('[role="main"]');
    await expect(main).toBeAttached();

    // Bottom tab bar renders with correct tabs
    const tabbar = page.locator(".k-toolbar");
    await expect(tabbar).toBeAttached();

    for (const name of ["Home", "Tickets", "Calendar", "More"]) {
      await expect(tabbar.getByRole("link", { name })).toBeAttached();
    }
  });

  test("default theme is iOS and dark mode", async ({ page }) => {
    await page.goto("/");

    const appRoot = page.locator(".k-app").first();
    await expect(appRoot).toHaveClass(/k-ios/);

    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
  });
});
