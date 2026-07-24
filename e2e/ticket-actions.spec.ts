import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import {
  auditA11y,
  CRYPTO_TIMEOUT,
  login,
  openComposeActions,
  openTicketByTitle,
} from "./helpers";

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
    const dialog = await openComposeActions(page);

    // The actions sheet should show "Text Client" among the options.
    await expect(dialog.getByText(/text client/i)).toBeVisible({
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

    // SMS compose mode indicator visible in the messagebar header.
    await expect(page.getByText(/texting client via SMS/i)).toBeVisible({
      timeout: 3000,
    });

    // Send button should be present but disabled (empty body).
    const sendBtn = page.getByRole("button", { name: /send sms/i });
    await expect(sendBtn).toBeVisible();
    await expect(sendBtn).toBeDisabled();
  });

  // ── 3. SMS compose ────────────────────────────────────────────

  test("SMS compose sheet shows char count", async () => {
    await expect(page.getByText(/0 \/ 1600/)).toBeVisible();
  });

  test("cancel closes SMS compose mode", async () => {
    // SMS compose is now inline in the messagebar. The "Dismiss compose"
    // button exits the mode.
    const dismissBtn = page.getByRole("button", { name: /dismiss compose/i });
    await dismissBtn.waitFor({ state: "visible", timeout: 5_000 });
    await dismissBtn.click();

    // Wait for the compose mode indicator to disappear.
    await expect(page.getByText(/texting client via SMS/i)).not.toBeVisible({
      timeout: 15_000,
    });
  });

  // ── 4. Exposure hint not repeated ─────────────────────────────

  test("reopening SMS compose does not show exposure hint again", async () => {
    // Reopen compose actions.
    const dialog = await openComposeActions(page);
    await dialog.getByText(/text client/i).click();

    // Hint should NOT appear since it was already dismissed this session.
    // The SMS compose mode opens directly.
    await expect(page.getByText(/texting client via SMS/i)).toBeVisible({
      timeout: 3000,
    });

    // Verify the exposure hint is NOT showing.
    await expect(
      page.locator('[data-testid="exposure-dismiss"]'),
    ).not.toBeVisible({ timeout: 1000 });

    // Dismiss the inline SMS compose mode.
    const dismissBtn = page.getByRole("button", { name: /dismiss compose/i });
    await dismissBtn.waitFor({ state: "visible", timeout: 5_000 });
    await dismissBtn.click();
  });

  // ── 5. Call options via panel ──────────────────────────────────

  test("call action from client panel opens call options sheet", async () => {
    // Wait for any SMS compose overlay to fully clear from prior tests.
    await expect(page.getByText(/texting client via SMS/i)).not.toBeVisible({
      timeout: 5_000,
    });

    // Open the client info panel via the header button.
    // On desktop split-view, the alias button is replaced by "More actions".
    const panel = page.locator('[role="dialog"]').filter({
      hasText: "Help with housing",
    });
    if (!(await panel.isVisible().catch(() => false))) {
      const clientInfoBtn = page.getByRole("button", {
        name: /view info|more actions/i,
      });
      await expect(clientInfoBtn).toBeVisible({ timeout: 5_000 });
      await clientInfoBtn.click();
    }
    await expect(panel).toBeVisible({ timeout: 3000 });

    // In the panel, find the "Call" button and click it.
    const callBtn = panel.getByRole("button", { name: "Call" });
    await expect(callBtn).toBeVisible({ timeout: 3000 });
    await callBtn.click();

    // Call options sheet should show "Call via browser" at minimum.
    const callSheet = page.getByRole("dialog", { name: /call options/i });
    await expect(callSheet.getByText(/call via browser/i)).toBeVisible({
      timeout: 5000,
    });

    // Clean up: dismiss call sheet. The panel was already closed by the
    // oncall handler before the call sheet opened.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // On desktop split-view, Escape can cascade and close the detail pane.
    // Re-open the ticket if the detail compose bar is no longer mounted.
    if ((await page.locator(".detail-compose").count()) === 0) {
      await openTicketByTitle(page, "Help with housing");
    }
  });

  // ── 6. Accessibility scan ─────────────────────────────────────

  test("SMS compose sheet passes axe-core accessibility scan", async () => {
    const dialog = await openComposeActions(page);
    await dialog.getByText(/text client/i).click();

    await expect(page.getByText(/texting client via SMS/i)).toBeVisible({
      timeout: 3000,
    });

    // Konsta Tabbar internals are excluded (aria-selected on role=button
    // links, H-011); the shell tab bar is audited by the sweep spec.
    await auditA11y(page, { exclude: ["[role='tablist']"] });

    // Cleanup: dismiss the SMS compose sheet (last test, page may be closing).
    if (!page.isClosed()) {
      await page.keyboard.press("Escape");
    }
  });
});
