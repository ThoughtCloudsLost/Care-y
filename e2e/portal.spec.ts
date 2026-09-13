import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page, Request } from "@playwright/test";
import {
  auditA11y,
  clickComposeAction,
  CRYPTO_TIMEOUT,
  isDesktopLayout,
  login,
  openComposeActions,
  openTicketByTitle,
} from "./helpers";
import { countRows, queryDb } from "./db-probe";

/**
 * Secure Link portal E2E roundtrip.
 *
 * Volunteer half: upgrade a client to Secure Link with a passphrase,
 * capture the generated link and spoken words from the sheet, and assert
 * the registration request carries no seed. Client half: open the link in
 * a fresh context, pass the passphrase gate, read the thread, send a
 * reply, and assert the reply request contains only base64 fields.
 * Volunteer half again: the reply decrypts as a normal follow-up and the
 * sealed wrap converges (portal_reply_key_wraps empty, key_generation
 * null). Quick exit replaces the page with the safe URL.
 *
 * Requires VITE_E2E_FAST_KDF=1 (set by the e2e Vite server) so the
 * passphrase Argon2id runs at test parameters.
 */

const TICKET_TITLE = "Safety planning session";
const VOLUNTEER_MESSAGE = `Portal hello ${String(Date.now()).slice(-6)}`;
const CLIENT_REPLY = `Client portal reply ${String(Date.now()).slice(-6)}`;

test.describe.serial("Secure Link Portal", () => {
  let volunteerPage: Page;
  let portalPage: Page;
  let portalLink = "";
  let passphrase = "";

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    volunteerPage = await browser.newPage();
    await startCoverage(volunteerPage);
    await login(volunteerPage);
    await openTicketByTitle(volunteerPage, TICKET_TITLE);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(volunteerPage, "portal-volunteer");
    await volunteerPage.close();
    await portalPage.close();
  });

  // ── Volunteer half: upgrade + link generation ────────────────────

  test("tier section shows SMS/Email for a fresh client", async () => {
    const desktop = await isDesktopLayout(volunteerPage);
    if (!desktop) {
      const moreBtn = volunteerPage.getByRole("button", {
        name: /more actions/i,
      });
      await expect(moreBtn).toBeVisible({ timeout: 10_000 });
      await moreBtn.dispatchEvent("click");
    }
    // PortalTierSection renders the tier heading in the panel (aside on
    // desktop, popup on mobile).
    await expect(
      volunteerPage.getByText("Communication", { exact: true }).first(),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  test("upgrade with passphrase sends no seed to the server", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    let upgradeRequest: Request | null = null;
    volunteerPage.on("request", (req) => {
      if (
        req.url().includes("upgradeToSecureLink") &&
        req.method() === "POST"
      ) {
        upgradeRequest = req;
      }
    });

    const setupBtn = volunteerPage
      .getByRole("button", { name: /set up secure link/i })
      .first();
    await expect(setupBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await setupBtn.dispatchEvent("click");

    const sheet = volunteerPage.getByRole("dialog").last();
    await expect(sheet).toBeVisible({ timeout: 5_000 });

    // Enable the passphrase and capture the diceware words.
    const toggleLabel = sheet.getByText(/add a passphrase/i);
    await expect(toggleLabel).toBeVisible({ timeout: 5_000 });
    await toggleLabel.dispatchEvent("click");

    const wordsEl = sheet.locator(".words-display");
    await expect(wordsEl).toBeVisible({ timeout: 5_000 });
    passphrase = ((await wordsEl.textContent()) ?? "").trim();
    expect(passphrase.split(/\s+/).length).toBe(5);

    // Generate. With the fast KDF this completes quickly; the link then
    // renders in a copyable code block.
    const generateBtn = sheet.getByRole("button", {
      name: /set up secure link/i,
    });
    await generateBtn.dispatchEvent("click");

    const linkEl = sheet.locator("code.link-block");
    await expect(linkEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    portalLink = ((await linkEl.textContent()) ?? "").trim();
    expect(portalLink).toMatch(/\/portal\/[0-9a-f]{48}#[A-Za-z0-9_-]{32}/);

    // The registration payload carries the auth HASH and public key,
    // never the seed (the fragment) or the passphrase words.
    expect(upgradeRequest).not.toBeNull();
    const body = upgradeRequest!.postData() ?? "";
    const fragment = portalLink.split("#")[1]!;
    expect(body).not.toContain(fragment);
    for (const word of passphrase.split(/\s+/)) {
      expect(body).not.toContain(word);
    }
    expect(body).toContain("authHash");
    expect(body).toContain("clientPublic");

    // Close the sheet ("Done").
    const doneBtn = sheet.getByRole("button", { name: /done/i });
    await doneBtn.dispatchEvent("click");
  });

  test("volunteer sends an in-app reply (dual copy)", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    // Dismiss the panel popup if it is still open (mobile).
    await volunteerPage.keyboard.press("Escape");
    await volunteerPage.waitForTimeout(300);

    // "Reply to ..." is available because the client is now
    // portal-capable. Reload so the detail payload carries the flag.
    await volunteerPage.reload();
    await expect(volunteerPage.locator('[role="log"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    const dialog = await openComposeActions(volunteerPage);
    await clickComposeAction(dialog, /reply to/i);

    const textarea = volunteerPage.getByRole("textbox", {
      name: /type a reply/i,
    });
    await textarea.click();
    await textarea.pressSequentially(VOLUNTEER_MESSAGE, { delay: 20 });

    const sendBtn = volunteerPage.getByRole("button", {
      name: /send message/i,
    });
    await expect(sendBtn).toBeEnabled({ timeout: 5_000 });
    await sendBtn.click();

    await expect(volunteerPage.getByText(VOLUNTEER_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // DB probe: the client copy row exists (direction to_client).
    const copyCount = queryDb(
      "SELECT count(*) FROM portal_messages WHERE direction = 'to_client';",
    ).trim();
    expect(Number(copyCount)).toBeGreaterThan(0);
  });

  // ── Client half: portal page ─────────────────────────────────────

  test("portal link opens, passphrase gate rejects wrong words", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    portalPage = await browser.newPage();
    await startCoverage(portalPage);

    await portalPage.goto(portalLink);

    // Passphrase gate renders (the channel was created with a passphrase).
    const gateInput = portalPage.getByLabel(/passphrase/i);
    await expect(gateInput).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    await auditA11y(portalPage);

    // Wrong passphrase fails the key check client-side.
    await gateInput.fill("wrong words entirely nope zero");
    const submitBtn = portalPage.getByRole("button", { name: /send|unlock/i });
    await submitBtn.click();
    await expect(
      portalPage.getByText(/doesn't match|no funciono|check the words/i),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  test("correct passphrase unlocks the thread", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    const gateInput = portalPage.getByLabel(/passphrase/i);
    await gateInput.fill(passphrase);
    const submitBtn = portalPage.getByRole("button", { name: /send|unlock/i });
    await submitBtn.click();

    // The volunteer's dual-encrypted message decrypts in the thread.
    await expect(portalPage.getByText(VOLUNTEER_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await auditA11y(portalPage);
  });

  test("client reply request carries only ciphertext", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    let replyRequest: Request | null = null;
    portalPage.on("request", (req) => {
      if (req.url().includes("portalReply") && req.method() === "POST") {
        replyRequest = req;
      }
    });

    const composer = portalPage.getByRole("textbox").first();
    await composer.click();
    await composer.pressSequentially(CLIENT_REPLY, { delay: 20 });

    const sendBtn = portalPage.getByRole("button", { name: /send/i }).last();
    await sendBtn.click();

    // Optimistic append shows the reply in the thread.
    await expect(portalPage.getByText(CLIENT_REPLY)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    expect(replyRequest).not.toBeNull();
    const body = replyRequest!.postData() ?? "";
    expect(body).not.toContain(CLIENT_REPLY);
    expect(body).toContain("wrappedTkTemp");
    expect(body).toContain("selfCopy");
  });

  test("quick exit replaces the page with the safe URL", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    // Use a separate page so the main portalPage keeps its state.
    const exitPage = await browser.newPage();
    await exitPage.goto(portalLink);
    const quickExit = exitPage.getByRole("button", {
      name: /leave this page/i,
    });
    await expect(quickExit).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    await quickExit.click();
    // location.replace navigates away from the app origin entirely.
    await exitPage.waitForURL(/^(?!.*portal).*$/, { timeout: 15_000 });
    expect(exitPage.url()).not.toContain("/portal/");
    await exitPage.close();
  });

  // ── Volunteer half: convergence + edit ───────────────────────────

  test("client reply converges to a normal follow-up on open", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await volunteerPage.reload();
    await expect(volunteerPage.locator('[role="log"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // The reply decrypts in the volunteer timeline (sealed-wrap path).
    await expect(volunteerPage.getByText(CLIENT_REPLY)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Convergence: the background rewrap clears key_generation and
    // deletes the sealed wrap row.
    await volunteerPage.waitForTimeout(3_000);
    expect(countRows("portal_reply_key_wraps")).toBe(0);
    const pendingGenerations = queryDb(
      `SELECT count(*) FROM followups
       WHERE source = 'client' AND key_generation IS NOT NULL;`,
    ).trim();
    expect(Number(pendingGenerations)).toBe(0);
  });

  test("edited volunteer message shows (edited) in the portal", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    // Mark the volunteer message edited via the server-visible effect the
    // edit flow produces (edited_at on both rows), then verify the portal
    // renders the marker after a refetch. The interactive edit sheet is
    // covered by component tests; this asserts the cross-surface render.
    queryDb(
      `UPDATE followups SET edited_at = now()
       WHERE source = 'volunteer' AND type = 'message'
         AND id IN (SELECT followup_id FROM portal_messages WHERE direction = 'to_client');`,
    );
    queryDb(
      `UPDATE portal_messages SET edited_at = now() WHERE direction = 'to_client';`,
    );

    await portalPage.reload();
    const gateInput = portalPage.getByLabel(/passphrase/i);
    await expect(gateInput).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await gateInput.fill(passphrase);
    await portalPage.getByRole("button", { name: /send|unlock/i }).click();

    await expect(portalPage.getByText(VOLUNTEER_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await expect(portalPage.getByText(/\(edited\)/).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("revoked channel shows the dead-link state", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    queryDb(
      `UPDATE portal_channels SET status = 'revoked', revoked_at = now()
       WHERE status = 'active';`,
    );

    const deadPage = await browser.newPage();
    await deadPage.goto(portalLink);
    await expect(deadPage.getByText(/no longer active/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await auditA11y(deadPage);
    await deadPage.close();
  });
});
