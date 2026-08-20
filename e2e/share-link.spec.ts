import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page, Request } from "@playwright/test";
import {
  auditA11y,
  CRYPTO_TIMEOUT,
  isDesktopLayout,
  login,
  openTicketByTitle,
} from "./helpers";
import { queryDb } from "./db-probe";

/**
 * One-time share link E2E roundtrip.
 *
 * URL capture strategy: relay request interception. All seeded clients
 * share a phone record, so the share-link sheet opens in SMS mode. The
 * volunteer browser POSTs to /relay/sms with a JSON body containing the
 * full share URL (including the fragment key). We intercept that request
 * to capture the URL. The server uses a mock telephony provider in the
 * e2e environment, so no real SMS is sent.
 *
 * Flow:
 *   1. Volunteer logs in, opens a seeded ticket, opens the panel, taps
 *      "Send secure link", types content, and sends.
 *   2. The share URL is captured from the intercepted relay request body.
 *   3. DB probe: share_links row exists, ciphertext is non-null and does
 *      not contain the plaintext bytes, read_at is null.
 *   4. A fresh unauthenticated context opens the URL: decrypted content
 *      is visible, org branding navbar is present, the URL bar no longer
 *      contains the fragment.
 *   5. A second fresh context opens the same URL: "already opened"
 *      message, no content. DB probe: ciphertext is null, read_at is set.
 *   6. Back in the volunteer context: the timeline shows the share_link
 *      bubble with the content and the status flips to "Opened" after
 *      query invalidation/refetch.
 *   7. Axe sweeps on the share page in both content and terminal states.
 *
 * Uses the e2e-org seeded by global-setup.ts. The share page runs in the
 * (client) layout with org-scoped branding. Sequential second-open only;
 * the concurrency race is covered by Vitest in the service tests.
 */

const TICKET_TITLE = "Help with housing";
const SHARE_CONTENT = `Safe house address: 42 Harbor Way, ring twice. ${String(Date.now()).slice(-6)}`;

test.describe.serial("One-Time Share Link", () => {
  let volunteerPage: Page;
  let shareUrl = "";

  // ── Volunteer: compose and send the share link ──────────────────

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    volunteerPage = await browser.newPage();
    await startCoverage(volunteerPage);
    await login(volunteerPage);
    await openTicketByTitle(volunteerPage, TICKET_TITLE);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(volunteerPage, "share-link-volunteer");
    await volunteerPage.close();
  });

  test("volunteer opens panel and taps 'Send secure link'", async () => {
    // Open the ticket panel (popup on mobile, aside on desktop).
    const desktop = await isDesktopLayout(volunteerPage);
    if (!desktop) {
      const moreBtn = volunteerPage.getByRole("button", {
        name: /more actions/i,
      });
      await expect(moreBtn).toBeVisible({ timeout: 10_000 });
      await moreBtn.dispatchEvent("click");
    }

    // Wait for the panel content to render, then tap the share link row.
    const shareRow = volunteerPage.getByText("Send secure link");
    await expect(shareRow.first()).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await shareRow.first().click();

    // The share sheet opens (panel dismisses first on mobile).
    const sheet = volunteerPage.getByRole("dialog", {
      name: /send secure link/i,
    });
    await expect(sheet).toBeVisible({ timeout: 5_000 });
  });

  test("volunteer types content and sends via SMS", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    // Set up request interception to capture the relay SMS body.
    let relayRequest: Request | null = null;
    volunteerPage.on("request", (req) => {
      if (req.url().includes("/relay/sms") && req.method() === "POST") {
        relayRequest = req;
      }
    });

    const sheet = volunteerPage.getByRole("dialog", {
      name: /send secure link/i,
    });

    // Fill the textarea.
    const textarea = sheet.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.click();
    await textarea.fill(SHARE_CONTENT);

    // The Send button should be enabled (SMS mode, content present).
    const sendBtn = sheet.getByRole("button", { name: /send by sms/i });
    await expect(sendBtn).toBeEnabled({ timeout: 5_000 });
    await sendBtn.click();

    // Wait for the sheet to dismiss (success path).
    await expect(sheet).not.toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Extract the share URL from the intercepted relay request.
    expect(relayRequest).not.toBeNull();
    const postBody = relayRequest!.postData() ?? "";
    // The SMS body has the form: "You have a secure message: <url>"
    const urlMatch = /https?:\/\/[^\s"]+\/share\/[^\s"]+#[^\s"]+/.exec(
      postBody,
    );
    expect(urlMatch).not.toBeNull();
    shareUrl = urlMatch![0]!;

    // Sanity: URL has both a share id and a fragment key.
    expect(shareUrl).toContain("/share/");
    expect(shareUrl).toContain("#");
  });

  // ── DB probe: pre-open state ────────────────────────────────────

  test("DB: share_links row exists with ciphertext, read_at null", async () => {
    // Extract the share id from the URL path segment.
    const shareId = shareUrl.split("/share/")[1]!.split("#")[0]!;
    expect(shareId).toBeTruthy();

    // Row exists and has not been read.
    const readAt = queryDb(
      `SELECT read_at FROM share_links WHERE id = '${shareId}';`,
    ).trim();
    expect(readAt).toBe("");

    // Ciphertext is non-null.
    const ciphertextPresent = queryDb(
      `SELECT (ciphertext IS NOT NULL) AS has_ct FROM share_links WHERE id = '${shareId}';`,
    ).trim();
    expect(ciphertextPresent).toBe("t");

    // Ciphertext does not contain the plaintext bytes.
    // Convert the content to hex and check it is NOT a substring of the
    // stored ciphertext hex. This confirms encryption at rest.
    const plainHex = Buffer.from(SHARE_CONTENT, "utf-8").toString("hex");
    const ctHex = queryDb(
      `SELECT encode(ciphertext, 'hex') FROM share_links WHERE id = '${shareId}';`,
    ).trim();
    expect(ctHex).not.toContain(plainHex);
  });

  // ── Client: first open (fresh unauthenticated context) ──────────

  test("client opens share link, content visible with branding", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    const clientPage = await browser.newPage();
    await startCoverage(clientPage);

    await clientPage.goto(shareUrl);

    // Content should be visible after decryption.
    await expect(clientPage.getByText(SHARE_CONTENT).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // The heading "A message for you" should be present.
    const heading = clientPage.getByText("A message for you");
    await expect(heading).toBeVisible({ timeout: 5_000 });

    // The one-time notice should be visible.
    await expect(
      clientPage.getByText(/cannot be opened again/i).first(),
    ).toBeVisible({ timeout: 5_000 });

    // Org branding navbar should be present (inherited from (client) layout).
    const navbar = clientPage.getByRole("banner");
    await expect(navbar).toBeVisible({ timeout: 5_000 });

    // Fragment should be stripped from the URL bar after load.
    const currentUrl = clientPage.url();
    expect(currentUrl).not.toContain("#");

    // Axe sweep on the content state.
    await auditA11y(clientPage);

    await stopAndWriteCoverage(clientPage, "share-link-client-open");
    await clientPage.close();
  });

  // ── Second open: already-opened terminal state ──────────────────

  test("second open shows 'already opened' with no content", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    const secondPage = await browser.newPage();
    await startCoverage(secondPage);

    await secondPage.goto(shareUrl);

    // Should show the "already opened" terminal message.
    await expect(
      secondPage.getByText(/already been opened/i).first(),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Content should NOT be visible.
    await expect(secondPage.getByText(SHARE_CONTENT)).not.toBeVisible({
      timeout: 3_000,
    });

    // Axe sweep on the terminal state.
    await auditA11y(secondPage);

    await stopAndWriteCoverage(secondPage, "share-link-client-second");
    await secondPage.close();
  });

  // ── DB probe: post-open state ───────────────────────────────────

  test("DB: ciphertext null and read_at set after first open", async () => {
    const shareId = shareUrl.split("/share/")[1]!.split("#")[0]!;

    // read_at should be set (non-empty).
    const readAt = queryDb(
      `SELECT read_at FROM share_links WHERE id = '${shareId}';`,
    ).trim();
    expect(readAt.length).toBeGreaterThan(0);

    // Ciphertext should be null (cleared after consumption).
    const ciphertextPresent = queryDb(
      `SELECT (ciphertext IS NOT NULL) AS has_ct FROM share_links WHERE id = '${shareId}';`,
    ).trim();
    expect(ciphertextPresent).toBe("f");
  });

  // ── Volunteer: timeline shows share_link bubble ─────────────────

  test("volunteer timeline shows share_link bubble with 'Opened' status", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    // Reload the ticket detail to trigger fresh data fetch.
    await volunteerPage.reload();
    await expect(volunteerPage.locator('[role="log"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // The share content should appear in the timeline (decrypted via
    // the ticket-key follow-up copy).
    await expect(volunteerPage.getByText(SHARE_CONTENT).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // The status line should show "Opened" (the share has been consumed).
    await expect(volunteerPage.getByText(/opened/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });
});
