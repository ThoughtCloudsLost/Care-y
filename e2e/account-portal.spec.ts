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
 * Encrypted Account portal E2E roundtrip.
 *
 * Intake half: an anonymous client submits the intake form with the
 * account opt-in and the request carries username, salt, public key,
 * auth hash, and ciphertexts, never the password. Client half: a fresh
 * context signs in at /account with the chosen credentials, reads the
 * seeded intake message, and sends an encrypted reply. Volunteer half:
 * the reply decrypts as a normal follow-up and converges (sealed wrap
 * deleted, key_generation null); a dual-copy reply back renders in the
 * account thread; an edit shows "(edited)". Upgrade half: a Secure Link
 * client accepts the in-portal offer, the old fragment link dies, and
 * the account login shows the same message history. Failure half:
 * unknown username and wrong password produce identical UI outcomes,
 * and a volunteer reset kills the login.
 *
 * Requires VITE_E2E_FAST_KDF=1 (set by the e2e Vite server) so the
 * account Argon2id runs at test parameters.
 */

const suffix = String(Date.now()).slice(-6);
const CLIENT_NAME = `E2E Account Client ${suffix}`;
const INTAKE_TITLE = `Web intake - ${CLIENT_NAME}`;
const INTAKE_MESSAGE = `Account intake message ${suffix}`;
const USERNAME = `e2e acct ${suffix}`;
const PASSWORD = `correct-horse-${suffix}`;
const WRONG_PASSWORD = "wrong-battery-staple-0"; // gitleaks:allow (test fixture, not a credential)
const CLIENT_REPLY = `Account client reply ${suffix}`;
const VOLUNTEER_MESSAGE = `Account volunteer reply ${suffix}`;
const UPGRADE_TICKET_TITLE = "Safety planning session";
const UPGRADE_USERNAME = `e2e upgrade ${suffix}`;
const UPGRADE_PASSWORD = `upgrade-pass-${suffix}`;
const UPGRADE_MESSAGE = `Pre-upgrade history ${suffix}`;

test.describe.serial("Encrypted Account Portal", () => {
  let intakePage: Page;
  let accountPage: Page;
  let volunteerPage: Page;
  let loginFailedText = "";
  let upgradeLink = "";

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    intakePage = await browser.newPage();
    await startCoverage(intakePage);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(intakePage, "account-intake");
    await intakePage.close();
  });

  // ── Intake half: opt-in creates the account atomically ───────────

  test("intake opt-in section is collapsed by default", async () => {
    await intakePage.goto("/intake");
    const optinToggle = intakePage.getByRole("button", {
      name: /add a secure account/i,
    });
    await expect(optinToggle).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(optinToggle).toHaveAttribute("aria-expanded", "false");
    await auditA11y(intakePage);
  });

  test("intake with account opt-in sends no password", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    let capturedRequest: Request | null = null;
    intakePage.on("request", (req) => {
      if (
        req.url().includes("clientPortal.submitIntake") &&
        req.method() === "POST"
      ) {
        capturedRequest = req;
      }
    });

    const nameInput = intakePage.getByLabel(/name/i);
    await expect(nameInput).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await nameInput.fill(CLIENT_NAME);
    const messageInput = intakePage.locator("textarea").first();
    await messageInput.fill(INTAKE_MESSAGE);

    // The default contact method (phone) leaves the number field
    // required, which blocks submit. The account is the reply channel
    // here, so no contact detail is needed.
    const noneRadio = intakePage.getByRole("radio", {
      name: /check back myself/i,
    });
    await expect(noneRadio).toBeVisible({ timeout: 5_000 });
    await noneRadio.dispatchEvent("click");

    // Expand the opt-in section and fill the account fields.
    const optinToggle = intakePage.getByRole("button", {
      name: /add a secure account/i,
    });
    await optinToggle.click();
    await expect(optinToggle).toHaveAttribute("aria-expanded", "true");

    const usernameInput = intakePage.getByRole("textbox", {
      name: /username/i,
    });
    await usernameInput.fill(USERNAME);
    const passwordInputs = intakePage.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(PASSWORD);
    await passwordInputs.nth(1).fill(PASSWORD);

    await auditA11y(intakePage);

    const submitBtn = intakePage.getByRole("button", {
      name: /send encrypted message/i,
    });
    await expect(submitBtn).toBeEnabled({ timeout: CRYPTO_TIMEOUT });
    await submitBtn.click();

    // Success state: reference code plus the username reminder.
    const referenceEl = intakePage.locator("code").first();
    await expect(referenceEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(intakePage.getByText(USERNAME).first()).toBeVisible();
    await expect(intakePage.getByText(/\/account/).first()).toBeVisible();

    // The submission carries the account registration material only:
    // username, salt, public key, auth hash, key check. Never the password.
    expect(capturedRequest).not.toBeNull();
    const body = capturedRequest!.postData() ?? "";
    expect(body).not.toContain(PASSWORD);
    expect(body).not.toContain(INTAKE_MESSAGE);
    expect(body).toContain("authHash");
    expect(body).toContain("publicKey");
    expect(body).toContain("salt");
    await auditA11y(intakePage);
  });

  test("DB: account row, account channel, and tier exist", async () => {
    const accountCount = queryDb(
      "SELECT count(*) FROM client_accounts;",
    ).trim();
    expect(Number(accountCount)).toBeGreaterThan(0);
    const channelCount = queryDb(
      `SELECT count(*) FROM portal_channels
       WHERE kind = 'account' AND status = 'active';`,
    ).trim();
    expect(Number(channelCount)).toBeGreaterThan(0);
    const tierCount = queryDb(
      "SELECT count(*) FROM clients WHERE communication_tier = 'account';",
    ).trim();
    expect(Number(tierCount)).toBeGreaterThan(0);
  });

  // ── Failure half: indistinguishable login failures ───────────────

  test("wrong password shows one generic failure", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    accountPage = await browser.newPage();
    await startCoverage(accountPage);

    await accountPage.goto("/account");
    const usernameInput = accountPage.getByLabel(/username/i);
    await expect(usernameInput).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await auditA11y(accountPage);

    await usernameInput.fill(USERNAME);
    await accountPage.getByLabel(/password/i).fill(WRONG_PASSWORD);
    await accountPage.getByRole("button", { name: /sign in/i }).click();

    const errorEl = accountPage.getByText(/did not match/i);
    await expect(errorEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    loginFailedText = ((await errorEl.textContent()) ?? "").trim();
    expect(loginFailedText.length).toBeGreaterThan(0);
  });

  test("unknown username shows the identical failure", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await accountPage.getByLabel(/username/i).fill(`nosuchuser ${suffix}`);
    await accountPage.getByLabel(/password/i).fill(WRONG_PASSWORD);
    await accountPage.getByRole("button", { name: /sign in/i }).click();

    const errorEl = accountPage.getByText(/did not match/i);
    await expect(errorEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    const unknownText = ((await errorEl.textContent()) ?? "").trim();
    expect(unknownText).toBe(loginFailedText);
  });

  // ── Client half: login, read, reply ──────────────────────────────

  test("correct login shows the seeded intake message", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await accountPage.getByLabel(/username/i).fill(USERNAME);
    await accountPage.getByLabel(/password/i).fill(PASSWORD);
    await accountPage.getByRole("button", { name: /sign in/i }).click();

    // The intake opt-in seeded the thread with a self copy of the
    // intake message; it decrypts under the account key.
    await expect(accountPage.getByText(INTAKE_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await auditA11y(accountPage);
  });

  test("client reply request carries only ciphertext", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    let replyRequest: Request | null = null;
    accountPage.on("request", (req) => {
      if (req.url().includes("accountReply") && req.method() === "POST") {
        replyRequest = req;
      }
    });

    const composer = accountPage.getByRole("textbox").first();
    await composer.click();
    await composer.pressSequentially(CLIENT_REPLY, { delay: 20 });
    await accountPage.getByRole("button", { name: /send/i }).last().click();

    await expect(accountPage.getByText(CLIENT_REPLY)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    expect(replyRequest).not.toBeNull();
    const body = replyRequest!.postData() ?? "";
    expect(body).not.toContain(CLIENT_REPLY);
    expect(body).toContain("wrappedTkTemp");
    expect(body).toContain("selfCopy");
  });

  // ── Volunteer half: convergence, dual-copy reply, edit ───────────

  test("volunteer sees the reply as a normal follow-up (converged)", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    volunteerPage = await browser.newPage();
    await startCoverage(volunteerPage);
    await login(volunteerPage);

    await volunteerPage.getByRole("tab", { name: "Tickets" }).click();
    await expect(volunteerPage.getByText(INTAKE_TITLE).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await openTicketByTitle(volunteerPage, INTAKE_TITLE);

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

  test("volunteer dual-copy reply reaches the account thread", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

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

    // A reload drops the page-memory keys: the client signs in again
    // (volunteer cold-start parity) and the dual-copy reply decrypts.
    await accountPage.reload();
    await accountPage.getByLabel(/username/i).fill(USERNAME);
    await accountPage.getByLabel(/password/i).fill(PASSWORD);
    await accountPage.getByRole("button", { name: /sign in/i }).click();
    await expect(accountPage.getByText(VOLUNTEER_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("edited volunteer message shows (edited) in the account thread", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    // Mark the volunteer message edited via the server-visible effect the
    // edit flow produces (edited_at on both rows); the interactive sheet
    // is covered by component tests.
    queryDb(
      `UPDATE followups SET edited_at = now()
       WHERE source = 'volunteer' AND type = 'message'
         AND id IN (SELECT followup_id FROM portal_messages
                    WHERE direction = 'to_client');`,
    );
    queryDb(
      `UPDATE portal_messages SET edited_at = now()
       WHERE direction = 'to_client';`,
    );

    await accountPage.reload();
    await accountPage.getByLabel(/username/i).fill(USERNAME);
    await accountPage.getByLabel(/password/i).fill(PASSWORD);
    await accountPage.getByRole("button", { name: /sign in/i }).click();
    await expect(accountPage.getByText(VOLUNTEER_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await expect(accountPage.getByText(/\(edited\)/).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── Upgrade half: Secure Link -> in-portal account creation ──────

  test("volunteer creates a Secure Link and enables the offer", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await volunteerPage.goto("/");
    await openTicketByTitle(volunteerPage, UPGRADE_TICKET_TITLE);

    const desktop = await isDesktopLayout(volunteerPage);
    if (!desktop) {
      const moreBtn = volunteerPage.getByRole("button", {
        name: /more actions/i,
      });
      await expect(moreBtn).toBeVisible({ timeout: 10_000 });
      await moreBtn.dispatchEvent("click");
    }

    const setupBtn = volunteerPage
      .getByRole("button", { name: /set up secure link/i })
      .first();
    await expect(setupBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await setupBtn.dispatchEvent("click");

    const sheet = volunteerPage.getByRole("dialog").last();
    await expect(sheet).toBeVisible({ timeout: 5_000 });
    const generateBtn = sheet.getByRole("button", {
      name: /set up secure link/i,
    });
    await generateBtn.dispatchEvent("click");

    const linkEl = sheet.locator("code.link-block");
    await expect(linkEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    upgradeLink = ((await linkEl.textContent()) ?? "").trim();
    expect(upgradeLink).toMatch(/\/portal\/[0-9a-f]{48}#[A-Za-z0-9_-]{32}/);
    await sheet.getByRole("button", { name: /done/i }).dispatchEvent("click");

    // Enable the in-portal account offer.
    const offerToggle = volunteerPage.getByText(/offer account upgrade/i);
    await expect(offerToggle).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await offerToggle.dispatchEvent("click");

    // Send a message so the upgrade has history to carry over.
    await volunteerPage.keyboard.press("Escape");
    await volunteerPage.waitForTimeout(300);
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
    await textarea.pressSequentially(UPGRADE_MESSAGE, { delay: 20 });
    const sendBtn = volunteerPage.getByRole("button", {
      name: /send message/i,
    });
    await expect(sendBtn).toBeEnabled({ timeout: 5_000 });
    await sendBtn.click();
    await expect(volunteerPage.getByText(UPGRADE_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("client upgrades in-portal and history survives", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    const upgradePage = await browser.newPage();
    await upgradePage.goto(upgradeLink);

    // No passphrase on this channel: the thread renders directly with
    // the upgrade offer card above it.
    await expect(upgradePage.getByText(UPGRADE_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    const card = upgradePage.getByText(/add a password to this conversation/i);
    await expect(card).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await card.click();
    await auditA11y(upgradePage);

    const usernameInput = upgradePage.getByRole("textbox", {
      name: /username/i,
    });
    await usernameInput.fill(UPGRADE_USERNAME);
    const passwordInputs = upgradePage.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(UPGRADE_PASSWORD);
    await passwordInputs.nth(1).fill(UPGRADE_PASSWORD);
    await upgradePage.getByRole("button", { name: /create account/i }).click();

    // Success state: username and the /account path, never the password.
    await expect(upgradePage.getByText(/your account is ready/i)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    const successBody = await upgradePage.content();
    expect(successBody).not.toContain(UPGRADE_PASSWORD);
    await upgradePage.close();

    // The old fragment link is dead (channel revoked by the upgrade).
    const deadPage = await browser.newPage();
    await deadPage.goto(upgradeLink);
    await expect(deadPage.getByText(/no longer active/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await deadPage.close();

    // The account login shows the SAME history, re-encrypted.
    const upgradedAccountPage = await browser.newPage();
    await upgradedAccountPage.goto("/account");
    await upgradedAccountPage.getByLabel(/username/i).fill(UPGRADE_USERNAME);
    await upgradedAccountPage.getByLabel(/password/i).fill(UPGRADE_PASSWORD);
    await upgradedAccountPage.getByRole("button", { name: /sign in/i }).click();
    await expect(upgradedAccountPage.getByText(UPGRADE_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await upgradedAccountPage.close();
  });

  // ── Reset half: volunteer reset kills the login ──────────────────

  test("volunteer reset removes the account and kills the login", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await volunteerPage.goto("/");
    await openTicketByTitle(volunteerPage, INTAKE_TITLE);

    const desktop = await isDesktopLayout(volunteerPage);
    if (!desktop) {
      const moreBtn = volunteerPage.getByRole("button", {
        name: /more actions/i,
      });
      await expect(moreBtn).toBeVisible({ timeout: 10_000 });
      await moreBtn.dispatchEvent("click");
    }

    const resetBtn = volunteerPage
      .getByRole("button", { name: /reset account/i })
      .first();
    await expect(resetBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await resetBtn.dispatchEvent("click");

    // ShellDialog confirm carries the history-loss warning.
    const confirmDialog = volunteerPage.getByRole("dialog").last();
    await expect(confirmDialog).toBeVisible({ timeout: 5_000 });
    const confirmBtn = confirmDialog.getByRole("button", {
      name: /reset/i,
    });
    await confirmBtn.dispatchEvent("click");

    // The reset deletes the intake client's account row and revokes its
    // channel while the upgrade-half account remains untouched.
    await volunteerPage.waitForTimeout(2_000);
    const revokedAccountChannels = queryDb(
      `SELECT count(*) FROM portal_channels
       WHERE kind = 'account' AND status = 'revoked';`,
    ).trim();
    expect(Number(revokedAccountChannels)).toBeGreaterThan(0);

    // The login now fails with the same generic message.
    await accountPage.reload();
    await accountPage.getByLabel(/username/i).fill(USERNAME);
    await accountPage.getByLabel(/password/i).fill(PASSWORD);
    await accountPage.getByRole("button", { name: /sign in/i }).click();
    await expect(accountPage.getByText(/did not match/i)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("quick exit stays responsive on the account page", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    const exitPage = await browser.newPage();
    await exitPage.goto("/account");
    const quickExit = exitPage.getByRole("button", {
      name: /leave this page/i,
    });
    await expect(quickExit).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await quickExit.click();
    await exitPage.waitForURL(/^(?!.*account).*$/, { timeout: 15_000 });
    expect(exitPage.url()).not.toContain("/account");
    await exitPage.close();
  });

  test("cleanup pages", async () => {
    await stopAndWriteCoverage(accountPage, "account-client");
    await accountPage.close();
    await stopAndWriteCoverage(volunteerPage, "account-volunteer");
    await volunteerPage.close();
  });
});
