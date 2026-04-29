import { test, expect, type Page } from "@playwright/test";
import { CRYPTO_TIMEOUT, openTicketByTitle } from "./helpers";

test.describe.serial("Ticket Reply (Encrypted Message Send)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("/");

    // Wait for crypto pipeline to complete on dashboard.
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ── 1. Navigate to ticket detail ───────────────────────────────

  test("opens a ticket with decrypted content", async () => {
    await openTicketByTitle(page, "Help with housing");
  });

  // ── 2. Messagebar visible ─────────────────────────────────────

  test("messagebar is visible at the bottom of the chat view", async () => {
    // The send button has aria-label="Send message".
    const sendBtn = page.getByRole("button", { name: /send message/i });
    await expect(sendBtn).toBeVisible();
  });

  // ── 3. Type and send a reply ──────────────────────────────────

  test("can type a message in the compose bar", async () => {
    // The messagebar textarea is the main text input in the chat view.
    const textarea = page.getByRole("textbox");
    await textarea.fill("E2E test reply message");
    await expect(textarea).toHaveValue("E2E test reply message");
  });

  test("send button triggers encryption and message appears in chat", async () => {
    const sendBtn = page.getByRole("button", { name: /send message/i });
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
