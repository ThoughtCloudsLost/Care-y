/**
 * E2E tests for the login page.
 *
 * Requires the tRPC server + SvelteKit dev server running (handled by
 * global-setup and playwright.config.ts webServer). Also requires a seeded
 * DB with dev-org + admin user (see seed script).
 *
 * Each test includes axe-core WCAG 2.1 AA checks.
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Seed credentials (must match seed script)
const DEV_USER = "admin";
const DEV_PASSWORD = "devpassword123!";

test.describe("2a-auth: login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders login form with username and password fields", async ({
    page,
  }) => {
    await expect(page.getByText("Sign in", { exact: false })).toBeVisible();
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
    await expect(
      page.locator('input[autocomplete="current-password"]'),
    ).toBeVisible();
  });

  test("submit button is disabled when fields are empty", async ({ page }) => {
    const submitBtn = page.getByRole("button", { name: /sign in/i });
    await expect(submitBtn).toBeDisabled();
  });

  test("submit button enables when both fields have values", async ({
    page,
  }) => {
    await page.locator('input[autocomplete="username"]').fill("someuser");
    await page
      .locator('input[autocomplete="current-password"]')
      .fill("somepassword12345");

    const submitBtn = page.getByRole("button", { name: /sign in/i });
    await expect(submitBtn).toBeEnabled();
  });

  test("shows generic error for invalid credentials with role='alert'", async ({
    page,
  }) => {
    await page.locator('input[autocomplete="username"]').fill("nonexistent");
    await page
      .locator('input[autocomplete="current-password"]')
      .fill("wrongpassword12345");

    await page.getByRole("button", { name: /sign in/i }).click();

    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText("Invalid username or password");
  });

  test("valid credentials redirect to /", async ({ page }) => {
    await page.locator('input[autocomplete="username"]').fill(DEV_USER);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(DEV_PASSWORD);

    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL("/", { timeout: 10_000 });
    expect(page.url()).toMatch(/\/$/);
  });

  test("session persists after login (auth.me succeeds)", async ({ page }) => {
    await page.locator('input[autocomplete="username"]').fill(DEV_USER);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(DEV_PASSWORD);

    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("/", { timeout: 10_000 });

    // Call auth.me via the tRPC proxy to confirm session is active
    const meResponse = await page.evaluate(async () => {
      const res = await fetch("/trpc/auth.me", {
        credentials: "include",
      });
      return res.json() as Promise<unknown>;
    });

    expect(meResponse).toHaveProperty("result");
  });

  test("submit button is disabled while request is in flight", async ({
    page,
  }) => {
    await page.locator('input[autocomplete="username"]').fill("someuser");
    await page
      .locator('input[autocomplete="current-password"]')
      .fill("somepassword12345");

    const submitBtn = page.getByRole("button", { name: /sign in/i });

    // Intercept to delay the response so we can observe the disabled state
    await page.route("**/trpc/**", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.continue();
    });

    await submitBtn.click();

    // Button should show loading text while waiting
    await expect(
      page.getByRole("button", { name: /signing in/i }),
    ).toBeDisabled();
  });

  test("login page passes WCAG 2.1 AA a11y audit", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("error state passes WCAG 2.1 AA a11y audit", async ({ page }) => {
    // Trigger an error state first
    await page.locator('input[autocomplete="username"]').fill("baduser");
    await page
      .locator('input[autocomplete="current-password"]')
      .fill("wrongpassword12345");

    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
