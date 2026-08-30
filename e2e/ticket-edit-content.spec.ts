import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import {
  CRYPTO_TIMEOUT,
  login,
  openTicketByTitle,
  openTicketInfoPanel,
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

    // "Edit ticket" lives in the ticket info dialog at every width; the
    // helper opens it via "View info" / "More actions" and is a no-op
    // when the marker is already visible.
    await openTicketInfoPanel(page, /edit ticket/i);
    await expect(page.getByText(/edit ticket/i)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("tap 'Edit ticket' opens the edit sheet with prefilled content", async () => {
    const editItem = page.getByText(/edit ticket/i).first();
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

    // Toast confirms the save. The same string also lands in the a11y
    // live region, so scope to the toast container to stay strict-mode
    // clean.
    await expect(
      page.getByTestId("shell-toasts").getByText(/content saved/i),
    ).toBeVisible({
      timeout: 5_000,
    });
  });

  test("case header shows updated title after save", async () => {
    // The case header (or wherever the title renders) should show the
    // updated title. The decrypt cache was seeded, so this is immediate.
    // .first(): the split view shows the title in the pane heading AND
    // the list row.
    await expect(page.getByText(UPDATED_TITLE).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("updated title persists after full reload", async () => {
    // A reload drops the volunteer's in-memory keys; sign in again so
    // the fresh decrypt pipeline proves the edit persisted server-side.
    await page.reload();
    await login(page);
    await expect(page.getByText(UPDATED_TITLE).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("restore original title for test idempotency", async () => {
    // Re-open the ticket after the reload + re-login landed on the
    // dashboard.
    await openTicketByTitle(page, UPDATED_TITLE);

    await openTicketInfoPanel(page, /edit ticket/i);

    const editItem = page.getByText(/edit ticket/i).first();
    await expect(editItem).toBeVisible({ timeout: 5_000 });
    await editItem.click();

    const titleInput = page.locator("input[type='text']").first();
    await expect(titleInput).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await titleInput.fill(SEEDED_TITLE);

    const saveButton = page.getByRole("button", { name: /save/i });
    await expect(saveButton).toBeEnabled({ timeout: 3_000 });
    await saveButton.click();

    await expect(
      page.getByTestId("shell-toasts").getByText(/content saved/i),
    ).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByText(SEEDED_TITLE).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });
});
