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
    await openTicketByTitle(page, "Lifecycle: assign test");

    // The assignment should create a system event in the timeline.
    await expect(
      page.locator('[role="status"]', { hasText: /assigned/i }),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  // ── Hold flow ───────────────────────────────────────────────────

  test("put ticket on hold via card action button", async () => {
    // Navigate back to ticket list.
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");

    // First assign it (hold requires assignment).
    await assignTicketToSelf(page, "Lifecycle: hold test");
    await putTicketOnHold(page, "Lifecycle: hold test");
  });

  test("held ticket shows hold event in timeline", async () => {
    await openTicketByTitle(page, "Lifecycle: hold test");

    await expect(
      page.locator('[role="status"]', { hasText: /hold/i }),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });
});
