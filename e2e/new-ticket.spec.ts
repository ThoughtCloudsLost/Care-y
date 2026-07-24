import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { auditA11y, CRYPTO_TIMEOUT, login } from "./helpers";

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

  test("form renders priority select with all options", async () => {
    const sheet = page.getByRole("dialog", { name: "New Ticket" });
    const prioritySelect = sheet
      .locator("li")
      .filter({ hasText: /priority/i })
      .locator("select");
    await expect(prioritySelect).toBeAttached();
    const options = prioritySelect.locator("option");
    await expect(options).toHaveCount(4);
    await expect(options.nth(0)).toHaveText("Low");
    await expect(options.nth(1)).toHaveText("Normal");
    await expect(options.nth(2)).toHaveText("High");
    await expect(options.nth(3)).toHaveText("Urgent");
  });

  test("form renders queue selector", async () => {
    await expect(page.getByText(/queue/i).first()).toBeVisible();
  });

  test("form renders client selector", async () => {
    await expect(page.getByText(/client/i).first()).toBeVisible();
  });

  // ── 4. Cancel ──────────────────────────────────────────────────

  test("dismiss closes popup without submission", async () => {
    const dialog = page.getByRole("dialog", { name: "New Ticket" });
    await expect(dialog).toBeVisible();

    // On desktop, ShellPopup replaces the default close button with
    // headerRight (the submit button). Dismiss via Escape instead.
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  });

  // ── 5. Accessibility ──────────────────────────────────────────

  test("new ticket popup passes axe-core accessibility scan", async () => {
    // After dismiss, we're on /tickets (the dashboard navigates there).
    // Reopen the new-ticket sheet via the navbar button.
    const newTicketBtn = page.getByRole("button", { name: /new ticket/i });
    await newTicketBtn.waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT });
    await newTicketBtn.click();

    await expect(page.getByPlaceholder(/brief description/i)).toBeVisible({
      timeout: 5000,
    });

    await auditA11y(page, {
      include: '[role="dialog"][aria-label="New Ticket"]',
    });

    // Close the sheet via Escape.
    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder(/brief description/i)).not.toBeVisible({
      timeout: 3000,
    });
  });
});
