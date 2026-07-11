/**
 * Layer 3: Ticket creation through the production UI.
 *
 * Tests the full create ticket flow: open form, select client, fill fields,
 * submit (triggers CryptoBridge encryption in the Web Worker), and verify
 * the ticket appears in the list with a decrypted title.
 *
 * These tests exercise the same code paths a real user would use.
 * The seed-data setup project provides structural data (clients, queues)
 * but does NOT create tickets through the UI.
 */

import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { CRYPTO_TIMEOUT, login, createTicket } from "./helpers";

test.describe.serial("ticket creation (production UI)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "3a-ticket-create");
    await page.close();
  });

  test("create ticket form opens from dashboard", async () => {
    // After login(), we're already on /. Avoid page.goto("/") which causes
    // a full reload and resets crypto Worker state.
    if (!page.url().endsWith("/")) {
      await page.getByRole("tab", { name: "Now" }).click();
      await expect(page).toHaveURL("/", { timeout: 10_000 });
    }

    const createBtn = page.getByRole("button", { name: "Create new" });
    await createBtn.waitFor({ state: "visible", timeout: 10_000 });
    await createBtn.click();

    // The popover shows create options. Pick "New Ticket".
    const popover = page.getByRole("dialog", { name: /create new/i });
    await expect(popover).toBeVisible({ timeout: 5_000 });
    await popover.getByText("New Ticket", { exact: true }).click();

    // Should navigate to /tickets with the new-ticket sheet open.
    await expect(page).toHaveURL(/\/tickets/, { timeout: 10_000 });
    await expect(page.getByRole("dialog", { name: "New Ticket" })).toBeVisible({
      timeout: 10_000,
    });

    // Close the sheet for subsequent tests.
    await page.keyboard.press("Escape");
  });

  test("create a ticket through the production form", async () => {
    await createTicket(page, {
      title: "UI-created test ticket",
      queue: "Intake",
      priority: "normal",
      description: "Created through the production UI by E2E test",
    });
  });

  test("UI-created ticket appears in the ticket list", async () => {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");

    await expect(page.getByText("UI-created test ticket").first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("create a high-priority crisis ticket", async () => {
    await createTicket(page, {
      title: "Crisis escalation test",
      queue: "Crisis",
      priority: "high",
    });
  });

  test("create a low-priority housing ticket", async () => {
    await createTicket(page, {
      title: "Housing referral test",
      queue: "Housing",
      priority: "low",
    });
  });
});
