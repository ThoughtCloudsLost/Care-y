import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login, openTicketByTitle } from "./helpers";

test.describe.serial("Ticket Actions (Call + SMS)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    const context = await browser.newContext();
    page = await context.newPage();
    await startCoverage(page);
    await login(page);
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await openTicketByTitle(page, "Help with housing");
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "ticket-actions");
    await page.close();
  });

  // ── 1. Compose actions sheet ──────────────────────────────────

  test("compose actions button opens sheet with 'Text Client' option", async () => {
    // The messagebar "+" button has aria-label "Compose actions".
    const composeActionsBtn = page.getByRole("button", {
      name: /compose actions/i,
    });
    await expect(composeActionsBtn).toBeVisible();
    await composeActionsBtn.click();

    // The actions sheet should show "Text Client" among the options.
    await expect(page.getByText(/text client/i)).toBeVisible({
      timeout: 3000,
    });
  });

  // ── 2. SMS exposure hint ──────────────────────────────────────

  test("tapping 'Text Client' shows exposure hint on first use", async () => {
    await page.getByText(/text client/i).click();

    // The exposure hint Toast should appear with the SMS warning.
    await expect(page.getByText(/SMS is not encrypted/i)).toBeVisible({
      timeout: 3000,
    });
  });

  test("exposure hint has dismiss button", async () => {
    const dismissBtn = page.locator('[data-testid="exposure-dismiss"]');
    await expect(dismissBtn).toBeVisible();
    await expect(dismissBtn).toHaveText(/got it/i);
  });

  test("dismissing exposure hint opens SMS compose sheet", async () => {
    const dismissBtn = page.locator('[data-testid="exposure-dismiss"]');
    await dismissBtn.click();

    // SMS compose sheet should now be visible with the plaintext warning.
    await expect(page.getByText(/SMS messages are not encrypted/i)).toBeVisible(
      { timeout: 3000 },
    );

    // Send button should be present but disabled (empty body).
    const sendBtn = page.getByRole("button", { name: /send sms/i });
    await expect(sendBtn).toBeVisible();
    await expect(sendBtn).toBeDisabled();
  });

  // ── 3. SMS compose ────────────────────────────────────────────

  test("SMS compose sheet shows char count", async () => {
    await expect(page.getByText(/0 \/ 1600/)).toBeVisible();
  });

  test("cancel closes SMS compose sheet", async () => {
    const smsSheet = page.getByLabel(/text client/i);
    const cancelBtn = smsSheet.getByRole("button", { name: /cancel/i });
    await cancelBtn.click();

    // The SMS compose content should no longer be visible.
    await expect(
      page.getByText(/SMS messages are not encrypted/i),
    ).not.toBeVisible({ timeout: 3000 });
  });

  // ── 4. Exposure hint not repeated ─────────────────────────────

  test("reopening SMS compose does not show exposure hint again", async () => {
    // Reopen compose actions.
    const composeActionsBtn = page.getByRole("button", {
      name: /compose actions/i,
    });
    await expect(composeActionsBtn).toBeVisible();
    await composeActionsBtn.click();

    await page.getByText(/text client/i).click();

    // Hint should NOT appear since it was already dismissed this session.
    // The SMS Sheet should open directly.
    await expect(page.getByText(/SMS messages are not encrypted/i)).toBeVisible(
      { timeout: 3000 },
    );

    // Verify the exposure hint is NOT showing.
    await expect(
      page.locator('[data-testid="exposure-dismiss"]'),
    ).not.toBeVisible({ timeout: 1000 });

    // Close SMS sheet (scope to the Text Client sheet to avoid other cancel buttons).
    const smsSheet = page.getByLabel(/text client/i);
    const cancelBtn = smsSheet.getByRole("button", { name: /cancel/i });
    await cancelBtn.click();
  });

  // ── 5. Call options via panel ──────────────────────────────────

  test("call action from client panel opens call options sheet", async () => {
    // Dismiss any lingering sheets/toasts from prior SMS compose tests.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Open the client info panel via the header button.
    const panel = page.locator('[role="dialog"]').filter({
      hasText: "Help with housing",
    });
    if (!(await panel.isVisible().catch(() => false))) {
      const clientInfoBtn = page.getByRole("button", {
        name: /view info/i,
      });
      await expect(clientInfoBtn).toBeVisible();
      await clientInfoBtn.click();
    }
    await expect(panel).toBeVisible({ timeout: 3000 });

    // In the panel, find the "Call" button and click it.
    // The button may be below the viewport in the panel's scroll container,
    // so use evaluate to click programmatically.
    const callBtn = panel.getByRole("button", { name: "Call" });
    await expect(callBtn).toBeVisible({ timeout: 3000 });
    await callBtn.evaluate((el) => {
      (el as HTMLElement).click();
    });

    // Call options sheet should show "Call via browser" at minimum.
    await expect(page.getByText(/call via browser/i)).toBeVisible({
      timeout: 5000,
    });

    // Clean up: dismiss call sheet and panel via keyboard.
    // Both overlays share z-40 backdrops, so backdrop clicks are unreliable.
    // Tab to the Cancel button and press Enter, then close the panel.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  // ── 6. Accessibility scan ─────────────────────────────────────

  test("SMS compose sheet passes axe-core accessibility scan", async () => {
    // Open SMS compose sheet.
    const composeActionsBtn = page.getByRole("button", {
      name: /compose actions/i,
    });
    await expect(composeActionsBtn).toBeVisible();
    await composeActionsBtn.click();

    await page.getByText(/text client/i).click();

    await expect(page.getByText(/SMS messages are not encrypted/i)).toBeVisible(
      { timeout: 3000 },
    );

    // Scope to WCAG rules only. Exclude best-practice rules (aria-dialog-name
    // on Konsta-internal dialogs) and color-contrast (tracked separately).
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .disableRules(["color-contrast"])
      .exclude("[role='tablist']")
      .analyze();

    expect(results.violations).toEqual([]);

    // Cleanup: dismiss the SMS compose sheet (last test, page may be closing).
    if (!page.isClosed()) {
      await page.keyboard.press("Escape");
    }
  });
});
