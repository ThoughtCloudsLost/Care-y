import { test, expect } from "@playwright/test";

test.describe("1d-smoke", () => {
  test("page loads and renders shell structure", async ({ page }) => {
    await page.goto("/");

    // Konsta App root renders
    const appRoot = page.locator(".k-app").first();
    await expect(appRoot).toBeVisible();

    // Main content landmark exists
    const main = page.locator("main#main-content");
    await expect(main).toBeAttached();

    // Bottom tab bar renders with correct tabs
    const tablist = page.getByRole("tablist");
    await expect(tablist).toBeAttached();

    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(4);
    await expect(page.getByRole("tab", { name: "Home" })).toBeAttached();
    await expect(page.getByRole("tab", { name: "Tickets" })).toBeAttached();
    await expect(page.getByRole("tab", { name: "Calendar" })).toBeAttached();
    await expect(page.getByRole("tab", { name: "More" })).toBeAttached();
  });

  test("default theme is iOS and dark mode", async ({ page }) => {
    await page.goto("/");

    const appRoot = page.locator(".k-app").first();
    await expect(appRoot).toHaveClass(/k-ios/);

    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
  });
});
