import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { CRYPTO_TIMEOUT, login, openTicketByTitle } from "./helpers";

test.describe.serial("Ticket Reply (Encrypted Message Send)", () => {
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
    await stopAndWriteCoverage(page, "ticket-reply");
    await page.close();
  });

  // ── 1. Navigate to ticket detail ───────────────────────────────

  test("opens a ticket with decrypted content", async () => {
    await openTicketByTitle(page, "Help with housing");
  });

  // ── 2. Messagebar visible ─────────────────────────────────────

  test("messagebar is visible at the bottom of the chat view", async () => {
    // Wait for ticket messages to fully decrypt and render.
    await expect(page.locator('[role="log"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // The send button has aria-label matching i18n ticket_send ("Send message").
    const sendBtn = page.getByRole("button", { name: /send message/i });
    await expect(sendBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  // ── 3. Type and send a reply ──────────────────────────────────

  test("can type a message in the compose bar", async () => {
    // The messagebar textarea has a unique placeholder from i18n.
    // Use click + pressSequentially so Konsta Messagebar's value binding
    // updates (fill() sets value programmatically which may bypass it).
    const textarea = page.getByRole("textbox", { name: /type a reply/i });
    await textarea.click();
    await textarea.pressSequentially("E2E test reply message", { delay: 20 });
    await expect(textarea).toHaveValue("E2E test reply message");
  });

  test("send button triggers encryption and message appears in chat", async () => {
    const sendBtn = page.getByRole("button", { name: /send message/i });
    // Wait for the send button to become enabled (crypto pipeline ready).
    await expect(sendBtn).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 5_000,
    });
    await sendBtn.click();

    // Wait for the optimistic message to appear in the chat log.
    await expect(page.getByText("E2E test reply message")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── 4. Messagebar clears after send ───────────────────────────

  test("messagebar clears after successful send", async () => {
    const textarea = page.getByRole("textbox");
    await expect(textarea).toHaveValue("", { timeout: 5000 });
  });

  // ── 5. Reply appears as volunteer bubble ──────────────────────

  test("reply renders inside the chat log region", async () => {
    // The chat log has role="log". Verify the reply text is inside it.
    const chatLog = page.locator('[role="log"]');
    await expect(chatLog.getByText("E2E test reply message")).toBeVisible({
      timeout: 5000,
    });
  });
});
