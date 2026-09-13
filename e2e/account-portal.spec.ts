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
  login,
  openComposeActions,
  openTicketByTitle,
  reopenTicketByTitle,
  openTicketInfoPanel,
} from "./helpers";
import {
  countRows,
  markVolunteerMessagesEdited,
  queryDb,
  resetCommunicationTiers,
} from "./db-probe";

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
 * client opens the drawer-driven UpgradeChooser, sees both upgrade paths
 * (add passphrase, create account), completes the account creation, the
 * old fragment link dies, and the account login shows the same message
 * history. Failure half: unknown username and wrong password produce
 * identical UI outcomes, and a volunteer reset kills the login.
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
    // All browser projects share one org: an earlier project's run left
    // the upgrade-half client ("Safety planning session") upgraded, and
    // its "Set up secure link" flow needs a fresh SMS/Email client.
    resetCommunicationTiers();
    intakePage = await browser.newPage();
    await startCoverage(intakePage);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(intakePage, "account-intake");
    await intakePage.close();
    // accountPage and volunteerPage are created mid-suite; close them
    // here (lifecycle, not a test) so a close failure reports as
    // teardown, not test red.
    await stopCoverageAndClose(accountPage, "account-client");
    await stopCoverageAndClose(volunteerPage, "account-volunteer");
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
    // PRECONDITION: resetCommunicationTiers() in beforeAll truncated
    // portal_channels/client_accounts and reset every tier, so these
    // unscoped counts can only be satisfied by rows this file created.
    // If another test ever seeds an account earlier in this file, scope
    // these by the intake client's id instead.
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
    const usernameInput = accountPage.getByPlaceholder(/username/i);
    await expect(usernameInput).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await auditA11y(accountPage);

    await usernameInput.fill(USERNAME);
    await accountPage.getByPlaceholder(/password/i).fill(WRONG_PASSWORD);
    await accountPage.getByRole("button", { name: /sign in/i }).click();

    const errorEl = accountPage.getByText(/did not match/i);
    await expect(errorEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    loginFailedText = ((await errorEl.textContent()) ?? "").trim();
    expect(loginFailedText.length).toBeGreaterThan(0);
  });

  test("unknown username shows the identical failure", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await accountPage
      .getByPlaceholder(/username/i)
      .fill(`nosuchuser ${suffix}`);
    await accountPage.getByPlaceholder(/password/i).fill(WRONG_PASSWORD);
    await accountPage.getByRole("button", { name: /sign in/i }).click();

    const errorEl = accountPage.getByText(/did not match/i);
    await expect(errorEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    const unknownText = ((await errorEl.textContent()) ?? "").trim();
    expect(unknownText).toBe(loginFailedText);
  });

  // ── Client half: login, read, reply ──────────────────────────────

  test("correct login shows the seeded intake message", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await accountPage.getByPlaceholder(/username/i).fill(USERNAME);
    await accountPage.getByPlaceholder(/password/i).fill(PASSWORD);
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

    // Register the request predicate BEFORE the triggering action so the
    // tRPC httpBatchLink POST is captured even if it fires on a later tick.
    const replyRequestPromise = accountPage.waitForRequest(
      (req) => req.url().includes("accountReply") && req.method() === "POST",
      { timeout: CRYPTO_TIMEOUT },
    );

    const composer = accountPage.getByRole("textbox").first();
    await composer.click();
    await composer.pressSequentially(CLIENT_REPLY, { delay: 20 });
    await accountPage.getByRole("button", { name: /send/i }).last().click();

    await expect(accountPage.getByText(CLIENT_REPLY)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    const replyRequest = await replyRequestPromise;
    const body = replyRequest.postData() ?? "";
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
    await accountPage.getByPlaceholder(/username/i).fill(USERNAME);
    await accountPage.getByPlaceholder(/password/i).fill(PASSWORD);
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
    markVolunteerMessagesEdited();

    await accountPage.reload();
    await accountPage.getByPlaceholder(/username/i).fill(USERNAME);
    await accountPage.getByPlaceholder(/password/i).fill(PASSWORD);
    await accountPage.getByRole("button", { name: /sign in/i }).click();
    await expect(accountPage.getByText(VOLUNTEER_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await expect(accountPage.getByText(/\(edited\)/).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── Upgrade half: Secure Link setup + chooser flow ───────────────

  test("volunteer creates a Secure Link for the upgrade client", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    // In-app navigation, never goto: a hard load drops the volunteer's
    // in-memory keys and bricks the session (same repair as the portal
    // spec's convergence test).
    await reopenTicketByTitle(volunteerPage, UPGRADE_TICKET_TITLE);

    // The tier section sits behind "More actions" in the detail overlay
    // at every width (portal.spec.ts precedent), not just on mobile.
    await openTicketInfoPanel(volunteerPage, "Communication");

    const linkResult = await createSecureLink(volunteerPage);
    upgradeLink = linkResult.link;

    // Send a message so the upgrade has history to carry over. Navigate
    // away and back in-app: a reload drops the in-memory keys. The detail
    // refetch also picks up the channel created above, which gates the
    // "Reply to" compose action.
    await reopenTicketByTitle(volunteerPage, UPGRADE_TICKET_TITLE);
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

  test("client upgrades via the chooser and history survives", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 6);

    const upgradePage = await browser.newPage();
    await startCoverage(upgradePage);
    await upgradePage.goto(upgradeLink);

    // No passphrase on this channel: the thread renders directly.
    await expect(upgradePage.getByText(UPGRADE_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Open the drawer. The client shell identity area is a button
    // with the "Menu" label (portal_menu_label).
    const drawerBtn = upgradePage
      .getByRole("button", { name: /menu/i })
      .first();
    await expect(drawerBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await drawerBtn.click();

    // The upgrade entry in the drawer carries data-testid="drawer-action-upgrade".
    const upgradeEntry = upgradePage.locator(
      '[data-testid="drawer-action-upgrade"]',
    );
    await expect(upgradeEntry).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await upgradeEntry.click();

    // UpgradeChooser opens with both paths (bare link = both options).
    // Scope by content rather than `.last()`: the moment the chooser
    // closes, `.last()` re-resolves to the account form dialog that
    // opens next, and the dismissal assertion would wait on that.
    const chooser = upgradePage
      .getByRole("dialog")
      .filter({ has: upgradePage.locator('[data-testid="upgrade-body"]') });
    await expect(chooser).toBeVisible({ timeout: 5_000 });

    await expect(
      chooser.locator('[data-testid="upgrade-add-passphrase"]'),
    ).toBeVisible({ timeout: 3_000 });
    await expect(
      chooser.locator('[data-testid="upgrade-create-account"]'),
    ).toBeVisible({ timeout: 3_000 });
    await expect(chooser.locator('[data-testid="upgrade-body"]')).toBeVisible();

    // Bare link includes the passphrase paragraph.
    await expect(
      chooser.locator('[data-testid="upgrade-passphrase-paragraph"]'),
    ).toBeVisible();

    await auditA11y(upgradePage);

    // Selecting "Create an account" closes the chooser and opens the
    // AccountCreateForm sheet.
    await chooser.locator('[data-testid="upgrade-create-account"]').click();
    await expect(chooser).not.toBeVisible({ timeout: 5_000 });

    const form = upgradePage.getByRole("dialog", {
      name: /create an account/i,
    });
    await expect(
      form.locator('[data-testid="account-create-username"]'),
    ).toBeVisible({ timeout: 5_000 });
    await auditA11y(upgradePage);

    const usernameInput = form.getByRole("textbox", { name: /username/i });
    await usernameInput.fill(UPGRADE_USERNAME);
    const passwordInputs = form.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(UPGRADE_PASSWORD);
    await passwordInputs.nth(1).fill(UPGRADE_PASSWORD);
    await form.getByRole("button", { name: /set up account/i }).click();

    // Success state: username and the /account path, never the password.
    await expect(upgradePage.getByText(/your account is ready/i)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    const successBody = await upgradePage.content();
    expect(successBody).not.toContain(UPGRADE_PASSWORD);
    await stopCoverageAndClose(upgradePage, "account-upgrade-chooser");

    // The old fragment link is dead (channel revoked by the upgrade).
    const deadPage = await browser.newPage();
    await startCoverage(deadPage);
    await deadPage.goto(upgradeLink);
    await expect(deadPage.getByText(/no longer active/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await stopCoverageAndClose(deadPage, "account-upgrade-dead-link");

    // The account login shows the SAME history, re-encrypted.
    const upgradedAccountPage = await browser.newPage();
    await startCoverage(upgradedAccountPage);
    await upgradedAccountPage.goto("/account");
    await upgradedAccountPage
      .getByPlaceholder(/username/i)
      .fill(UPGRADE_USERNAME);
    await upgradedAccountPage
      .getByPlaceholder(/password/i)
      .fill(UPGRADE_PASSWORD);
    await upgradedAccountPage.getByRole("button", { name: /sign in/i }).click();
    await expect(upgradedAccountPage.getByText(UPGRADE_MESSAGE)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await stopCoverageAndClose(upgradedAccountPage, "account-upgraded-login");
  });

  // ── Reset half: volunteer reset kills the login ──────────────────

  test("volunteer reset removes the account and kills the login", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await reopenTicketByTitle(volunteerPage, INTAKE_TITLE);

    // Same panel repair as the Secure Link test: the tier section sits
    // behind "More actions" at every width.
    await openTicketInfoPanel(volunteerPage, "Communication");

    // Desktop split view renders a second, hidden tier section instance;
    // dispatchEvent would reach the hidden copy and open its dialog
    // inside the hidden subtree. Scope to the visible instance and use a
    // real click so actionability checks apply.
    const resetBtn = volunteerPage
      .getByRole("button", { name: /reset account/i })
      .filter({ visible: true })
      .first();
    await expect(resetBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await resetBtn.click();

    // ShellDialog confirm carries the history-loss warning. The portaled
    // shell-dialog-root wrapper is a zero-size div (its fixed-position
    // children carry the visuals), so Playwright reports it hidden even
    // while open; assert on the inner content, never the wrapper.
    const confirmDialog = volunteerPage
      .getByRole("dialog")
      .filter({ hasText: /reset this account/i });
    await expect(confirmDialog.getByText(/reset this account/i)).toBeVisible({
      timeout: 5_000,
    });
    const confirmBtn = confirmDialog.getByRole("button", {
      name: /reset/i,
    });
    await confirmBtn.dispatchEvent("click");

    // The reset deletes the intake client's account row and revokes its
    // channel. PRECONDITION: resetCommunicationTiers() in beforeAll
    // truncated portal_channels, so a revoked account channel here can
    // only be the one this file created. Poll, not a fixed sleep.
    await expect
      .poll(
        () =>
          Number(
            queryDb(
              `SELECT count(*) FROM portal_channels
               WHERE kind = 'account' AND status = 'revoked';`,
            ).trim(),
          ),
        { timeout: 15_000 },
      )
      .toBeGreaterThan(0);

    // The login now fails with the same generic message.
    await accountPage.reload();
    await accountPage.getByPlaceholder(/username/i).fill(USERNAME);
    await accountPage.getByPlaceholder(/password/i).fill(PASSWORD);
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
    await startCoverage(exitPage);
    await exitPage.goto("/account");
    const quickExit = exitPage.getByRole("button", {
      name: /leave this page/i,
    });
    await expect(quickExit).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Collect before the click, never after: quick exit leaves the origin,
    // and the renderer's V8 coverage dies with the page it was recorded on.
    await stopAndWriteCoverage(exitPage, "account-quick-exit");

    await quickExit.click();
    await exitPage.waitForURL(/^(?!.*account).*$/, { timeout: 15_000 });
    expect(exitPage.url()).not.toContain("/account");
    await exitPage.close();
  });
});
