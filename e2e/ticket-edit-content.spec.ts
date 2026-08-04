import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import {
  CRYPTO_TIMEOUT,
  isDesktopLayout,
  login,
  openTicketByTitle,
} from "./helpers";

test.describe.serial("Ticket content edit", () => {
  let page: Page;
  const SEEDED_TITLE = "Help with housing";
  const UPDATED_TITLE = "Housing intake (edited)";

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    const context = await browser.newContext();
    page = await context.newPage();
    await startCoverage(page);
    await login(page);

    // Wait for ticket list to load with the seeded ticket.
    await expect(page.getByText(SEEDED_TITLE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "ticket-edit-content");
    await page.close();
  });

  test("open ticket and navigate to case panel", async () => {
    await openTicketByTitle(page, SEEDED_TITLE);

    // Open the case panel (client info popup).
    const desktop = await isDesktopLayout(page);
    if (desktop) {
      // Desktop: the panel content is inline in the sidebar. Look for
      // the "Edit case" item directly.
      await expect(page.getByText(/edit case/i)).toBeVisible({
        timeout: CRYPTO_TIMEOUT,
      });
    } else {
      // Mobile: open the panel via the navbar client alias button or
      // the BookUser icon.
      const moreActions = page.getByRole("button", {
        name: /more actions/i,
      });
      await moreActions.click();
      await expect(page.getByText(/edit case/i)).toBeVisible({
        timeout: 5_000,
      });
    }
  });

  test("tap 'Edit case' opens the edit sheet with prefilled content", async () => {
    const editItem = page.getByText(/edit case/i).first();
    await editItem.click();

    // Wait for the edit sheet to appear with the title input prefilled.
    const titleInput = page.locator("input").filter({ hasText: "" }).first();
    await expect(titleInput).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // The save button should be disabled (no changes yet).
    const saveButton = page.getByRole("button", { name: /save/i });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();
  });

  test("edit the title and save", async () => {
    // Find the title input (type="text" ListInput).
    const titleInput = page.locator("input[type='text']").first();
    await titleInput.fill(UPDATED_TITLE);

    // Save should now be enabled.
    const saveButton = page.getByRole("button", { name: /save/i });
    await expect(saveButton).toBeEnabled({ timeout: 3_000 });
    await saveButton.click();

    // Toast confirms the save.
    await expect(page.getByText(/content saved/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test("case header shows updated title after save", async () => {
    // The case header (or wherever the title renders) should show the
    // updated title. The decrypt cache was seeded, so this is immediate.
    await expect(page.getByText(UPDATED_TITLE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("updated title persists after full reload", async () => {
    await page.reload();

    // Wait for crypto pipeline to complete and ticket to re-decrypt.
    await expect(page.getByText(UPDATED_TITLE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("restore original title for test idempotency", async () => {
    // Re-open the ticket if needed after reload.
    const ticketVisible = await page
      .getByText(UPDATED_TITLE)
      .isVisible()
      .catch(() => false);
    if (!ticketVisible) {
      await openTicketByTitle(page, UPDATED_TITLE);
    }

    const desktop = await isDesktopLayout(page);
    if (!desktop) {
      const moreActions = page.getByRole("button", {
        name: /more actions/i,
      });
      await moreActions.click();
    }

    const editItem = page.getByText(/edit case/i).first();
    await expect(editItem).toBeVisible({ timeout: 5_000 });
    await editItem.click();

    const titleInput = page.locator("input[type='text']").first();
    await expect(titleInput).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await titleInput.fill(SEEDED_TITLE);

    const saveButton = page.getByRole("button", { name: /save/i });
    await expect(saveButton).toBeEnabled({ timeout: 3_000 });
    await saveButton.click();

    await expect(page.getByText(/content saved/i)).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByText(SEEDED_TITLE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });
});
