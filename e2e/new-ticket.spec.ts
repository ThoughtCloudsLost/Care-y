import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login } from "./helpers";

test.describe.serial("New Ticket (Create Flow)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "new-ticket");
    await page.close();
  });

  // ── 1. Open new ticket popup ───────────────────────────────────

  test("'+' button opens create popover with 'New Ticket' option", async () => {
    // Dashboard navbar has a "+" button with aria-label "Create new".
    const createBtn = page.getByRole("button", { name: /create new/i });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // Popover should show "New Ticket" option.
    await expect(page.getByText(/new ticket/i)).toBeVisible();
  });

  test("selecting 'New Ticket' from popover opens the popup form", async () => {
    await page.getByText(/new ticket/i).click();

    // The NewTicketController popup should open with form fields.
    await expect(page.getByPlaceholder(/brief description/i)).toBeVisible({
      timeout: 5000,
    });
  });

  // ── 2. Form validation ─────────────────────────────────────────

  test("submit without filling fields shows validation errors", async () => {
    const submitBtn = page.getByRole("button", { name: /create ticket/i });
    await submitBtn.click();

    // Validation errors should appear for required fields.
    await expect(page.getByText(/title is required/i)).toBeVisible();
  });

  // ── 3. Form fields ────────────────────────────────────────────

  test("form renders priority segmented control with all options", async () => {
    await expect(page.getByText(/low/i).first()).toBeVisible();
    await expect(page.getByText(/normal/i).first()).toBeVisible();
    await expect(page.getByText(/high/i).first()).toBeVisible();
    await expect(page.getByText(/urgent/i).first()).toBeVisible();
  });

  test("form renders queue selector", async () => {
    await expect(page.getByText(/queue/i).first()).toBeVisible();
  });

  test("form renders client selector", async () => {
    await expect(page.getByText(/client/i).first()).toBeVisible();
  });

  // ── 4. Cancel ──────────────────────────────────────────────────

  test("cancel dismisses popup without submission", async () => {
    const cancelBtn = page.getByRole("button", { name: /cancel/i });
    await cancelBtn.click();

    // Popup should close. The form fields should no longer be visible.
    await expect(page.getByPlaceholder(/brief description/i)).not.toBeVisible({
      timeout: 3000,
    });
  });

  // ── 5. Accessibility ──────────────────────────────────────────

  test("new ticket popup passes axe-core accessibility scan", async () => {
    // Reopen the popup.
    const createBtn = page.getByRole("button", { name: /create new/i });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    await page.getByText(/new ticket/i).click();

    await expect(page.getByPlaceholder(/brief description/i)).toBeVisible({
      timeout: 5000,
    });

    const results = await new AxeBuilder({ page })
      .include('[data-testid="popup-dialog"]')
      .disableRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);

    // Close the popup.
    const cancelBtn = page.getByRole("button", { name: /cancel/i });
    await cancelBtn.click();
    await expect(page.getByPlaceholder(/brief description/i)).not.toBeVisible({
      timeout: 3000,
    });
  });
});
