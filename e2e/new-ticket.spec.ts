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
    const popover = page.getByRole("dialog", { name: /create new/i });
    await expect(
      popover.getByText("New Ticket", { exact: true }),
    ).toBeVisible();
  });

  test("selecting 'New Ticket' from popover opens the popup form", async () => {
    const popover = page.getByRole("dialog", { name: /create new/i });
    await popover.getByText("New Ticket", { exact: true }).click();

    // The NewTicketController popup should open with form fields.
    await expect(page.getByPlaceholder(/brief description/i)).toBeVisible({
      timeout: 5000,
    });
  });

  // ── 2. Form validation ─────────────────────────────────────────

  test("submit button is disabled when form is empty", async () => {
    const submitBtn = page.getByRole("button", { name: /create ticket/i });
    await expect(submitBtn).toBeDisabled();
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

  test("dismiss closes sheet without submission", async () => {
    // The new ticket form opens in a ShellSheet. Blur inputs first so
    // Escape reaches the sheet's focus trap (not swallowed by the input).
    await page.locator("body").click({ position: { x: 0, y: 0 } });
    await page.keyboard.press("Escape");

    // Sheet should close. The form fields should no longer be visible.
    await expect(page.getByPlaceholder(/brief description/i)).not.toBeVisible({
      timeout: 5000,
    });
  });

  // ── 5. Accessibility ──────────────────────────────────────────

  test("new ticket popup passes axe-core accessibility scan", async () => {
    // Reopen the popup.
    const createBtn = page.getByRole("button", { name: /create new/i });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const popover = page.getByRole("dialog", { name: /create new/i });
    await popover.getByText("New Ticket", { exact: true }).click();

    await expect(page.getByPlaceholder(/brief description/i)).toBeVisible({
      timeout: 5000,
    });

    const results = await new AxeBuilder({ page })
      .include('[role="dialog"][aria-label="New Ticket"]')
      .disableRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);

    // Close the sheet via Escape.
    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder(/brief description/i)).not.toBeVisible({
      timeout: 3000,
    });
  });
});
