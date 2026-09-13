import { test, expect } from "./coverage-fixture";
import {
  startCoverage,
  stopAndWriteCoverage,
  stopCoverageAndClose,
} from "./coverage-fixture";
import type { Page, Request } from "@playwright/test";
import {
  auditA11y,
  clickComposeAction,
  createSecureLink,
  CRYPTO_TIMEOUT,
  expectPortalReady,
  openTicketInfoPanel,
  login,
  openComposeActions,
  openTicketByTitle,
  reopenTicketByTitle,
} from "./helpers";
import {
  countRows,
  markVolunteerMessagesEdited,
  queryDb,
  resetCommunicationTiers,
} from "./db-probe";

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

// "Safety planning session" belongs to account-portal.spec's upgrade
// half; this spec uses its own seeded ticket so the two upgrade flows
// never fight over one client's tier.
const TICKET_TITLE = "Benefits application help";
const VOLUNTEER_MESSAGE = `Portal hello ${String(Date.now()).slice(-6)}`;
const CLIENT_REPLY = `Client portal reply ${String(Date.now()).slice(-6)}`;

test.describe.serial("Secure Link Portal", () => {
  let volunteerPage: Page;
  let portalPage: Page;
  let portalLink = "";
  let passphrase = "";

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    // All browser projects share one org: an earlier project's run left
    // this spec's client upgraded, and "Set up secure link" only renders
    // for a fresh SMS/Email client.
    resetCommunicationTiers();
    volunteerPage = await browser.newPage();
    await startCoverage(volunteerPage);
    await login(volunteerPage);
    await openTicketByTitle(volunteerPage, TICKET_TITLE);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(volunteerPage, "portal-volunteer");
    await volunteerPage.close();
    // The client-context page carries the portal route's only coverage;
    // closing it without collecting drops the whole (client) portal page
    // from the merge.
    await stopAndWriteCoverage(portalPage, "portal-client");
    await portalPage.close();
  });

  // ── Volunteer half: upgrade + link generation ────────────────────

  test("tier section shows SMS/Email for a fresh client", async () => {
    // PortalTierSection renders the tier name inside the info panel,
    // which sits behind "More actions" in the detail overlay at every
    // width. Assert the tier NAME, not the panel heading: the helper
    // returns early when the heading is already visible, so a heading
    // assertion would only restate the helper's precondition.
    await openTicketInfoPanel(volunteerPage, "Communication");
    await expect(
      volunteerPage.getByText("SMS / Email", { exact: true }).first(),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  test("upgrade with passphrase sends no seed to the server", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    // Defensive reopen: the panel from the previous test can close on a
    // background refetch; the helper is a no-op when it is still open.
    await openTicketInfoPanel(volunteerPage, "Communication");

    let upgradeRequest: Request | null = null;
    volunteerPage.on("request", (req) => {
      if (
        req.url().includes("upgradeToSecureLink") &&
        req.method() === "POST"
      ) {
        upgradeRequest = req;
      }
    });

    const result = await createSecureLink(volunteerPage, {
      withPassphrase: true,
    });
    portalLink = result.link;
    passphrase = result.passphrase;

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
  });

  test("volunteer sends an in-app reply (dual copy)", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    // Dismiss the panel popup if it is still open (mobile).
    await volunteerPage.keyboard.press("Escape");
    await volunteerPage.waitForTimeout(300);

    // "Reply to ..." is available because the client is now
    // portal-capable, and the detail payload has to be refetched to
    // carry the flag; without it the volunteer sends an ordinary reply
    // and no client copy is written.
    await reopenTicketByTitle(volunteerPage, TICKET_TITLE);

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
    await expectPortalReady(portalPage, gateInput);

    await auditA11y(portalPage);

    // Wrong passphrase fails the key check client-side.
    await gateInput.fill("wrong words entirely nope zero");
    const submitBtn = portalPage.getByRole("button", {
      name: /continue|unlock/i,
    });
    await submitBtn.click();
    await expect(
      portalPage.getByText(/doesn't match|no funciono|check the words/i),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  test("correct passphrase unlocks the thread", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    const gateInput = portalPage.getByLabel(/passphrase/i);
    await gateInput.fill(passphrase);
    const submitBtn = portalPage.getByRole("button", {
      name: /continue|unlock/i,
    });
    await submitBtn.click();

    // The volunteer's dual-encrypted message decrypts in the thread.
    await expect(portalPage.getByText(VOLUNTEER_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await auditA11y(portalPage);
  });

  test("client reply request carries only ciphertext", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    // Register the request predicate BEFORE the triggering action so the
    // tRPC httpBatchLink POST is captured even if it fires on a later tick.
    const replyRequestPromise = portalPage.waitForRequest(
      (req) => req.url().includes("portalReply") && req.method() === "POST",
      { timeout: CRYPTO_TIMEOUT },
    );

    const composer = portalPage.getByRole("textbox").first();
    await composer.click();
    await composer.pressSequentially(CLIENT_REPLY, { delay: 20 });

    const sendBtn = portalPage.getByRole("button", { name: /send/i }).last();
    await sendBtn.click();

    // Optimistic append shows the reply in the thread.
    await expect(portalPage.getByText(CLIENT_REPLY)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    const replyRequest = await replyRequestPromise;
    const body = replyRequest.postData() ?? "";
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
    await startCoverage(exitPage);
    await exitPage.goto(portalLink);
    const quickExit = exitPage.getByRole("button", {
      name: /leave this page/i,
    });
    await expect(quickExit).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Collect before the click, never after: quick exit leaves the origin,
    // and the renderer's V8 coverage dies with the page it was recorded on.
    await stopAndWriteCoverage(exitPage, "portal-quick-exit");

    await quickExit.click();
    // location.replace navigates away from the app origin entirely.
    await exitPage.waitForURL(/^(?!.*portal).*$/, { timeout: 15_000 });
    expect(exitPage.url()).not.toContain("/portal/");
    await exitPage.close();
  });

  // ── Volunteer half: convergence + edit ───────────────────────────

  test("client reply converges to a normal follow-up on open", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    // Navigate away and back inside the app instead of reloading: a
    // reload drops the volunteer's in-memory keys and bricks the session
    // (same repair as the dual-copy test above).
    await reopenTicketByTitle(volunteerPage, TICKET_TITLE);

    // The reply decrypts in the volunteer timeline (sealed-wrap path).
    await expect(volunteerPage.getByText(CLIENT_REPLY)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Convergence: the background rewrap clears key_generation and
    // deletes the sealed wrap row. Poll instead of a fixed sleep (a
    // flake source under CI load).
    await expect
      .poll(() => countRows("portal_reply_key_wraps"), { timeout: 15_000 })
      .toBe(0);
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
    markVolunteerMessagesEdited();

    // Re-open the saved link rather than reloading: fragment custody
    // strips location.hash after parsing, so a bare reload lands on the
    // missing-fragment state. Step through another path first, because
    // navigating from /portal/<id> to /portal/<id>#fragment differs only
    // in the hash and the browser treats it as a same-document
    // navigation, leaving the old session (and its stale message cache)
    // alive. The intermediate is a real page rather than about:blank:
    // firefox fails the about:blank hop with "interrupted by another
    // navigation to about:blank".
    await portalPage.goto("/intake");
    await portalPage.goto(portalLink);
    const gateInput = portalPage.getByLabel(/passphrase/i);
    await expectPortalReady(portalPage, gateInput);
    await gateInput.fill(passphrase);
    await portalPage.getByRole("button", { name: /continue|unlock/i }).click();

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
    await startCoverage(deadPage);
    await deadPage.goto(portalLink);
    await expectPortalReady(
      deadPage,
      deadPage.getByText(/no longer active/i).first(),
    );
    await auditA11y(deadPage);
    await stopCoverageAndClose(deadPage, "portal-revoked-link");
  });
});
