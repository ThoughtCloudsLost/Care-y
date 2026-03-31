import { test, expect } from "@playwright/test";

test.describe("1d-smoke", () => {
  test("page loads and renders Konsta Tabbar", async ({ page }) => {
    await page.goto("/");

    // Konsta UI Tabbar renders as Toolbar with class "k-toolbar"
    const tabbar = page.locator(".k-toolbar").first();
    await expect(tabbar).toBeVisible();

    // All three tab links are present inside the toolbar
    await expect(tabbar.getByText("Inbox")).toBeVisible();
    await expect(tabbar.getByText("Tickets")).toBeVisible();
    await expect(tabbar.getByText("Schedule")).toBeVisible();
  });

  test("theme toggle switches between iOS and Material", async ({ page }) => {
    await page.goto("/");

    // Konsta UI App root has k-app with k-ios or k-material
    const appRoot = page.locator(".k-app").first();
    await expect(appRoot).toBeVisible();

    // Default theme is iOS
    await expect(appRoot).toHaveClass(/k-ios/);

    // Verify the button text confirms current theme is iOS
    const toggleBtn = page.getByRole("button", {
      name: /switch to material/i,
    });
    await expect(toggleBtn).toBeVisible();

    // Click the toggle button
    await toggleBtn.click();

    // Wait for Svelte reactivity to propagate and re-render
    await expect(appRoot).toHaveClass(/k-material/, { timeout: 5000 });
  });
});
