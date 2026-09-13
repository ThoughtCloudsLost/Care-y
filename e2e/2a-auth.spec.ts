/**
 * E2E tests for the login page.
 *
 * Requires the tRPC server + SvelteKit dev server running (handled by
 * global-setup and playwright.config.ts webServer). Also requires a seeded
 * DB with dev-org + admin user (see seed script).
 *
 * Each test includes axe-core WCAG 2.1 AA checks.
 */

import { test, expect } from "./coverage-fixture";
import {
  auditA11y,
  CRYPTO_TIMEOUT,
  E2eError,
  loadTotpSecret,
  generateTotpCode,
} from "./helpers";

// Seed credentials (must match seed script: packages/server/src/scripts/seed.ts)
const DEV_USER = "admin.dev";
const DEV_PASSWORD = "dev-password-1234!";

test.describe("2a-auth: login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    // The login form is gated behind an onboarding status query.
    // Wait for the submit button before any assertions.
    await page
      .getByRole("button", { name: /sign in/i })
      .waitFor({ state: "visible", timeout: 15_000 });
  });

  test("renders login form with username and password fields", async ({
    page,
  }) => {
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
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

  test("valid credentials redirect past login", async ({ page }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    await page.locator('input[autocomplete="username"]').fill(DEV_USER);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(DEV_PASSWORD);

    await page.getByRole("button", { name: /sign in/i }).click();

    // Handle inline 2FA challenge (seeded admin has TOTP enrolled).
    const twofaHeading = page.getByText(/verify your identity/i);
    await twofaHeading.waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT });
    const secret = loadTotpSecret();
    if (!secret) throw new E2eError("No TOTP secret found");
    const codeInput = page.getByPlaceholder("000000");
    await codeInput.fill(generateTotpCode(secret));
    await page.getByRole("button", { name: /verify/i }).click();

    // Seeded admin may land on / or /complete depending on onboarding state.
    // Race against error state to avoid silent 30s timeout on code rejection.
    const postVerify = await Promise.race([
      page
        .waitForURL(/\/(complete)?$/, { timeout: CRYPTO_TIMEOUT })
        .then(() => "navigated" as const),
      page
        .locator('[role="alert"]')
        .waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT })
        .then(async () => {
          const text = await page.locator('[role="alert"]').textContent();
          return `error:${text ?? ""}` as const;
        }),
    ]);
    expect(postVerify).toBe("navigated");
  });

  test("session persists after login (auth.me succeeds)", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    await page.locator('input[autocomplete="username"]').fill(DEV_USER);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(DEV_PASSWORD);

    await page.getByRole("button", { name: /sign in/i }).click();

    // Handle inline 2FA challenge.
    const twofaHeading = page.getByText(/verify your identity/i);
    await twofaHeading.waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT });
    const secret = loadTotpSecret();
    if (!secret) throw new E2eError("No TOTP secret found");
    const codeInput = page.getByPlaceholder("000000");
    await codeInput.fill(generateTotpCode(secret));
    await page.getByRole("button", { name: /verify/i }).click();

    await page.waitForURL(/\/(complete)?$/, { timeout: CRYPTO_TIMEOUT });

    const meResponse = await page.evaluate(async () => {
      const res = await fetch("/trpc/auth.me", {
        credentials: "include",
        headers: { "x-org-slug": "e2e-org" },
      });
      return res.json() as Promise<unknown>;
    });

    expect(meResponse).toHaveProperty("result");
  });

  test("form is replaced by progress indicator while request is in flight", async ({
    page,
  }) => {
    await page.locator('input[autocomplete="username"]').fill("someuser");
    await page
      .locator('input[autocomplete="current-password"]')
      .fill("somepassword12345");

    const submitBtn = page.getByRole("button", { name: /sign in/i });

    await page.route("**/trpc/**", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.continue();
    });

    await submitBtn.click();

    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    await expect(submitBtn).not.toBeVisible();
  });

  test("login page passes WCAG 2.2 AA a11y audit", async ({ page }) => {
    await auditA11y(page);
  });

  test("error state passes WCAG 2.1 AA a11y audit", async ({ page }) => {
    await page.locator('input[autocomplete="username"]').fill("baduser");
    await page
      .locator('input[autocomplete="current-password"]')
      .fill("wrongpassword12345");

    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible();

    await auditA11y(page);
  });
});

/**
 * Two-factor challenge error handling.
 *
 * The challenge's WebAuthn, push, SMS, and email branches need real
 * authenticators or delivery channels, so they stay out of e2e. The TOTP
 * rejection path is reachable and carries the surface's error handling:
 * a wrong code must not advance the session, must announce assertively,
 * and must leave the challenge usable for a retry with a valid code.
 */
test.describe.serial("2a-auth: two-factor challenge", () => {
  test("wrong TOTP code shows an error and a retry succeeds", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await page.goto("/login");
    await page
      .getByRole("button", { name: /sign in/i })
      .waitFor({ state: "visible", timeout: 15_000 });

    await page.locator('input[autocomplete="username"]').fill(DEV_USER);
    await page
      .locator('input[autocomplete="current-password"]')
      .fill(DEV_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    await page
      .getByText(/verify your identity/i)
      .waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT });

    // A code the authenticator would never produce. The server rejects
    // it and the component surfaces the generic message: the wording is
    // deliberately non-specific so it cannot confirm which factor failed.
    const codeInput = page.getByPlaceholder("000000");
    await codeInput.fill("000000");
    await page.getByRole("button", { name: /verify/i }).click();

    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(alert).toContainText("Invalid code");

    // The rejection must not have advanced the session.
    await expect(page).toHaveURL(/\/login/);

    // The challenge stays usable: a valid code still completes the login.
    const secret = loadTotpSecret();
    if (!secret) throw new E2eError("No TOTP secret found");
    await codeInput.fill(generateTotpCode(secret));
    await page.getByRole("button", { name: /verify/i }).click();
    await page.waitForURL(/\/(complete)?$/, { timeout: CRYPTO_TIMEOUT });
  });
});
