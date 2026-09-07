import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import {
  clickComposeAction,
  CRYPTO_TIMEOUT,
  login,
  openComposeActions,
  openTicketByTitle,
} from "./helpers";
import { queryDb } from "./db-probe";

const REPLY_SUFFIX = String(Date.now()).slice(-6);
const REPLY_TEXT = `E2E reply ${REPLY_SUFFIX}`;

/**
 * "Reply to client" only appears for portal-capable clients (an active
 * portal channel exists). Give the ticket's client an active channel so
 * the compose option renders. The channel row carries placeholder key
 * material: these tests exercise the volunteer send path, not the portal.
 *
 * client_public must be a valid ristretto255 encoding, not random bytes:
 * the reply path seals a dual copy to it (sealPortalCopy), and libsodium
 * rejects invalid points, which fails the whole send. The ristretto255
 * generator from RFC 9496 section 4 is a structurally valid stand-in;
 * nothing here ever decrypts the portal copy. The row is replaced on
 * every run so a bad key from an older seed cannot persist.
 */
const RISTRETTO_GENERATOR_HEX =
  "e2f2ae0a6abc4e71a884a961c500515f58e30b6aa582dd8db6a65945e08d2d76";

function makeClientPortalCapable(ticketId: string): void {
  queryDb(
    `UPDATE clients SET communication_tier = 'secure_link'
     WHERE id = (SELECT client_id FROM tickets WHERE id = '${ticketId}');`,
  );
  queryDb(
    `DELETE FROM portal_channels
     WHERE client_id = (SELECT client_id FROM tickets WHERE id = '${ticketId}');`,
  );
  queryDb(
    `INSERT INTO portal_channels
       (client_id, channel_id, auth_hash, client_public,
        key_check_ephemeral_point, key_check_nonce, key_check_ciphertext)
     SELECT client_id,
       substr(md5(random()::text) || md5(random()::text), 1, 48),
       decode(md5(random()::text) || md5(random()::text), 'hex'),
       decode('${RISTRETTO_GENERATOR_HEX}', 'hex'),
       decode(md5(random()::text) || md5(random()::text), 'hex'),
       decode(substr(md5(random()::text) || md5(random()::text), 1, 48), 'hex'),
       decode(md5(random()::text) || md5(random()::text), 'hex')
     FROM tickets WHERE id = '${ticketId}';`,
  );
}

test.describe.serial("Ticket Reply (Encrypted Message Send)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
    await expect(page.getByText("Help with housing").first()).toBeVisible({
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

    // Grant the client portal capability so "Reply to client" renders,
    // then reload so the detail payload picks up the new flag.
    // On desktop the split pane keeps the URL at /tickets, so step into
    // the full view to get the ticket id into the URL.
    let ticketId = /\/tickets\/([0-9a-f-]{36})/.exec(page.url())?.[1];
    if (ticketId === undefined) {
      await page.getByRole("button", { name: "Open full view" }).click();
      await expect(page).toHaveURL(/\/tickets\/[0-9a-f-]{36}/, {
        timeout: 10_000,
      });
      ticketId = /\/tickets\/([0-9a-f-]{36})/.exec(page.url())?.[1];
    }
    expect(ticketId).toBeTruthy();
    makeClientPortalCapable(ticketId!);

    // The channel was inserted via SQL behind the app's back, so no
    // query invalidation carries the portalCapable flag into the cached
    // detail payload (portal.spec's navigate-away-and-back works only
    // because the real upgrade mutation invalidates). Reload for a cold
    // cache and sign in again, since a reload drops the in-memory keys.
    await page.reload();
    await login(page);
    await openTicketByTitle(page, "Help with housing");
    await expect(page.locator('[role="log"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── 2. Messagebar visible ─────────────────────────────────────

  test("messagebar is visible at the bottom of the chat view", async () => {
    // Wait for ticket messages to fully decrypt and render.
    await expect(page.locator('[role="log"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Compose bar starts collapsed; only the + (compose actions) button is visible.
    // Scope to main content to avoid matching the split-view secondary messagebar.
    const composeBtn = page
      .getByRole("main")
      .getByRole("button", { name: /compose actions/i });
    await expect(composeBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  // ── 3. Type and send a reply ──────────────────────────────────

  test("can type a message in the compose bar", async () => {
    // Activate reply mode from the collapsed compose bar.
    const dialog = await openComposeActions(page);
    await clickComposeAction(dialog, /reply to/i);

    // The messagebar textarea has a unique placeholder from i18n.
    // Use click + pressSequentially so Konsta Messagebar's value binding
    // updates (fill() sets value programmatically which may bypass it).
    const textarea = page.getByRole("textbox", { name: /type a reply/i });
    await textarea.click();
    await textarea.pressSequentially(REPLY_TEXT, { delay: 20 });
    await expect(textarea).toHaveValue(REPLY_TEXT);
  });

  test("send button triggers encryption and message appears in chat", async () => {
    const sendBtn = page.getByRole("button", { name: /send message/i });
    await expect(sendBtn).toBeEnabled({ timeout: 5_000 });
    await sendBtn.click();

    // Wait for the optimistic message to appear in the chat log.
    await expect(page.getByText(REPLY_TEXT)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── 4. Messagebar clears after send ───────────────────────────

  test("messagebar clears after successful send", async () => {
    const textarea = page.getByRole("textbox", { name: /type a reply/i });
    await expect(textarea).toHaveValue("", { timeout: 5000 });
  });

  // ── 5. Reply appears as volunteer bubble ──────────────────────

  test("reply renders inside the chat log region", async () => {
    // The chat log has role="log". Verify the reply text is inside it.
    const chatLog = page.locator('[role="log"]');
    await expect(chatLog.getByText(REPLY_TEXT)).toBeVisible({
      timeout: 5000,
    });
  });
});
