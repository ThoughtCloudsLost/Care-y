/**
 * Layer 3: Ticket lifecycle management through the production UI.
 *
 * Tests assign-to-self and put-on-hold flows via the ticket card
 * action buttons. These state changes generate system events in
 * the ticket timeline (unlike the devSeedTickets direct DB inserts).
 */

import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import {
  CRYPTO_TIMEOUT,
  login,
  createTicket,
  assignTicketToSelf,
  putTicketOnHold,
  openTicketByTitle,
} from "./helpers";

test.describe.serial("ticket lifecycle (production UI)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "3b-ticket-lifecycle");
    await page.close();
  });

  // ── Create tickets for lifecycle tests ──────────────────────────

  test("create a ticket to assign", async () => {
    await createTicket(page, {
      title: "Lifecycle: assign test",
      queue: "Intake",
    });
  });

  test("create a ticket to put on hold", async () => {
    await createTicket(page, {
      title: "Lifecycle: hold test",
      queue: "Housing",
    });
  });

  // ── Assign flow ─────────────────────────────────────────────────

  test("assign ticket to self via card action button", async () => {
    await assignTicketToSelf(page, "Lifecycle: assign test");
  });

  test("assigned ticket shows in detail with assignment event", async () => {
    test.setTimeout(CRYPTO_TIMEOUT * 12);
    await openTicketByTitle(page, "Lifecycle: assign test");

    // The system event from take() appears as a follow-up with type
    // "assignment_change". Scope to the chat log to avoid matching the
    // global toast container.
    const chatLog = page.locator('[role="log"]');
    await expect(
      chatLog.locator('[role="status"]', { hasText: /assigned/i }),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT * 2 });

    // The SSE connection may drop and show "Reconnecting..." overlay.
    // Wait for it to resolve before navigating.
    const reconnecting = page.getByText("Reconnecting");
    await expect(reconnecting)
      .toBeHidden({ timeout: CRYPTO_TIMEOUT * 2 })
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional: banner may not exist
      .catch(() => {});

    // Return to ticket list for the hold flow tests.
    // In split-view, the Back button is in the inert navbar context.
    // Use Escape to close the detail pane (clears pushState).
    const backBtn = page.getByRole("button", { name: /back/i });
    if (await backBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await backBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }
    await expect(page).toHaveURL("/tickets");
  });

  // ── Hold flow ───────────────────────────────────────────────────

  test("put ticket on hold via card action button", async () => {
    await assignTicketToSelf(page, "Lifecycle: hold test");
    await putTicketOnHold(page, "Lifecycle: hold test");
  });

  test("held ticket shows hold event in timeline", async () => {
    test.setTimeout(CRYPTO_TIMEOUT * 12);
    await openTicketByTitle(page, "Lifecycle: hold test");

    const chatLog = page.locator('[role="log"]');
    await expect(
      chatLog.locator('[role="status"]', { hasText: /hold/i }),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT * 2 });
  });
});
