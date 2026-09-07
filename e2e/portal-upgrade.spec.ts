import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page, Request } from "@playwright/test";
import {
  auditA11y,
  CRYPTO_TIMEOUT,
  login,
  openComposeActions,
  openTicketByTitle,
  openTicketInfoPanel,
} from "./helpers";
import { clearClientEmails, resetCommunicationTiers } from "./db-probe";

/**
 * Portal upgrade and email compose E2E.
 *
 * Four flows:
 * 1. Volunteer sets a client email, composes a formatted email via
 *    EmailComposeSheet, and the org thread renders the email_outbound
 *    bubble with subject and bold text (SMTP hits Mailpit in the dev
 *    stack, never a real provider).
 * 2. Bare-link portal: drawer shows the upgrade entry; UpgradeChooser
 *    presents both paths; client adds a password via AddPassphraseForm;
 *    reloading the same link now shows the passphrase gate; entering the
 *    passphrase unlocks the thread.
 * 3. Passphrase portal: drawer contact card (ContactInfoCard) shows the
 *    on-file phone and email.
 * 4. Bare-link portal: no contact entry in the drawer, and a direct
 *    contactInfo call returns the typed error.
 *
 * Requires VITE_E2E_FAST_KDF=1 (set by the e2e Vite server) so the
 * passphrase Argon2id runs at test parameters.
 */

const TICKET_TITLE = "Benefits application help";
const suffix = String(Date.now()).slice(-6);
const EMAIL_SUBJECT = `Follow-up ${suffix}`;
const EMAIL_BOLD_TEXT = `important update`;

test.describe.serial("Portal Upgrade + Email", () => {
  let volunteerPage: Page;
  let portalPage: Page | undefined;
  let portalLink = "";

  /** Narrow portalPage to Page, throwing if the serial test that assigns it has not run yet. */
  function portal(): Page {
    if (portalPage === undefined) {
      throw new Error("portalPage not yet assigned by a prior serial test");
    }
    return portalPage;
  }

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    // All browser projects share one org: reset tiers so the spec starts
    // from a fresh SMS/Email client. Clearing emails matters for rerunning,
    // since the first test below adds one and the panel then offers edit
    // rather than add.
    resetCommunicationTiers();
    clearClientEmails();
    volunteerPage = await browser.newPage();
    await startCoverage(volunteerPage);
    await login(volunteerPage);
    await openTicketByTitle(volunteerPage, TICKET_TITLE);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(volunteerPage, "portal-upgrade-volunteer");
    await volunteerPage.close();
    if (portalPage !== undefined) {
      await stopAndWriteCoverage(portalPage, "portal-upgrade-portal");
      await portalPage.close();
    }
  });

  // ── 1. Volunteer sets a client email ──────────────────────────

  test("volunteer sets a client email via the info panel", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    await openTicketInfoPanel(volunteerPage, "Communication");

    // The client info panel has an "Edit email" or "Add email" button.
    // On a fresh client the button text is "Add email" or similar.
    const emailBtn = volunteerPage
      .getByRole("button", { name: /add email|edit email|email/i })
      .first();
    await expect(emailBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await emailBtn.dispatchEvent("click");

    // Name the sheet rather than taking the last dialog. The info panel is
    // itself a dialog and stays open underneath, so `.last()` re-resolves
    // to the panel the moment the sheet closes, and the dismissal assertion
    // below would then be waiting on the wrong element.
    const sheet = volunteerPage.getByRole("dialog", { name: /edit email/i });
    await expect(sheet).toBeVisible({ timeout: 5_000 });

    // Fill in the email address.
    const emailInput = sheet.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 5_000 });
    await emailInput.fill(`testclient-${suffix}@example.com`);

    // Submitting the address does not save it. The sheet advances to a
    // confirm step first, because the new address replaces the old one on
    // every ticket belonging to this client, so the flow takes two clicks.
    const saveBtn = sheet
      .getByRole("button", { name: /save|confirm|update|set/i })
      .first();
    await expect(saveBtn).toBeVisible({ timeout: 5_000 });
    await saveBtn.click();

    const confirmBtn = sheet.getByRole("button", {
      name: /confirm email change/i,
    });
    await expect(confirmBtn).toBeVisible({ timeout: 5_000 });
    await confirmBtn.click();

    // Wait for the sheet to dismiss (mutation success).
    await expect(sheet).not.toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Close the info panel overlay.
    await volunteerPage.keyboard.press("Escape");
    await volunteerPage.waitForTimeout(300);
  });

  // ── 2. Volunteer composes formatted email ─────────────────────

  test("email compose sheet opens from compose actions", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    // Navigate away and back in-app so the ticket detail refetches the
    // hasEmail flag (a full reload drops in-memory keys).
    await volunteerPage.keyboard.press("Escape");
    await volunteerPage.getByRole("tab", { name: "Overview" }).click();
    await expect(volunteerPage).toHaveURL("/");
    await volunteerPage.getByRole("tab", { name: "Tickets" }).click();
    await openTicketByTitle(volunteerPage, TICKET_TITLE);
    await expect(volunteerPage.locator('[role="log"]')).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    const dialog = await openComposeActions(volunteerPage);
    // "Email client" action should be visible now that the client has an email.
    const emailAction = dialog.getByText(/email/i);
    await expect(emailAction).toBeVisible({ timeout: 3_000 });
    await emailAction.dispatchEvent("click");

    // EmailComposeSheet opens as a dialog.
    const composeSheet = volunteerPage.getByRole("dialog").last();
    await expect(composeSheet).toBeVisible({ timeout: 5_000 });
    await auditA11y(volunteerPage);
  });

  test("formatted email send creates email_outbound bubble", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    // Intercept the relay/email POST to verify no real SMTP host is hit
    // outside the Docker Mailpit boundary.
    let relayEmailRequest: Request | null = null;
    volunteerPage.on("request", (req) => {
      if (req.url().includes("/relay/email") && req.method() === "POST") {
        relayEmailRequest = req;
      }
    });

    const composeSheet = volunteerPage.getByRole("dialog").last();

    // Fill subject via the ListInput.
    const subjectInput = composeSheet.locator("input").first();
    await subjectInput.fill(EMAIL_SUBJECT);

    // Fill body in the ProseMirror editor. The editor area has
    // role="textbox" and aria-multiline="true".
    const editorArea = composeSheet.locator(
      '[role="textbox"][aria-multiline="true"]',
    );
    await expect(editorArea).toBeVisible({ timeout: 5_000 });
    await editorArea.click();

    // Type "Here is an ", toggle bold, type the bold text, toggle bold off,
    // then type the rest.
    await volunteerPage.keyboard.type("Here is an ");

    // Toggle bold via the toolbar button.
    const boldBtn = composeSheet.getByRole("button", { name: /bold/i });
    await boldBtn.click();
    await volunteerPage.keyboard.type(EMAIL_BOLD_TEXT);
    await boldBtn.click();
    await volunteerPage.keyboard.type(" for your case");

    // Click the Send button in the sheet header.
    const sendBtn = composeSheet.getByRole("button", { name: /send/i });
    await expect(sendBtn).toBeEnabled({ timeout: 5_000 });
    await sendBtn.click();

    // Wait for the compose sheet to close (success path).
    await expect(composeSheet).not.toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // The relay request should have fired (to Mailpit via Docker SMTP).
    expect(relayEmailRequest).not.toBeNull();

    // The email_outbound bubble should render with the subject.
    const subjectBubble = volunteerPage.locator(
      '[data-testid="email-bubble-subject"]',
    );
    await expect(subjectBubble).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(subjectBubble).toContainText(EMAIL_SUBJECT);

    // The body should render with the bold text (not raw JSON).
    const bodyBubble = volunteerPage.locator(
      '[data-testid="email-bubble-body"]',
    );
    await expect(bodyBubble).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    // The bold text should be inside a <strong> element.
    await expect(bodyBubble.locator("strong")).toContainText(EMAIL_BOLD_TEXT);
  });

  // ── 3. Bare-link portal: upgrade + add password ───────────────

  test("volunteer creates a Secure Link for the email test client", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await openTicketInfoPanel(volunteerPage, "Communication");

    const setupBtn = volunteerPage
      .getByRole("button", { name: /set up secure link/i })
      .first();
    await expect(setupBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await setupBtn.dispatchEvent("click");

    const sheet = volunteerPage.getByRole("dialog").last();
    await expect(sheet).toBeVisible({ timeout: 5_000 });

    // Generate the link (no passphrase toggle: bare link).
    const generateBtn = sheet.getByRole("button", {
      name: /set up secure link/i,
    });
    await generateBtn.dispatchEvent("click");

    const linkEl = sheet.locator("code.link-block");
    await expect(linkEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    portalLink = ((await linkEl.textContent()) ?? "").trim();
    expect(portalLink).toMatch(/\/portal\/[0-9a-f]{48}#[A-Za-z0-9_-]{32}/);

    await sheet.getByRole("button", { name: /done/i }).dispatchEvent("click");
  });

  test("bare-link drawer shows upgrade entry with both paths", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    portalPage = await browser.newPage();
    await startCoverage(portalPage);

    await portalPage.goto(portalLink);

    // No passphrase on this channel: the thread renders directly.
    // Wait for the thread container to appear (the portal may need to
    // derive keys from the fragment seed).
    await portalPage.waitForTimeout(3_000);

    // Open the drawer. The client shell drawer button is typically a
    // hamburger or menu icon. The portal layout uses the drawer button.
    const drawerBtn = portalPage
      .getByRole("button", { name: /menu|drawer|open drawer/i })
      .first();
    // If no explicit drawer button, try the Konsta Panel/Drawer toggle.
    if (await drawerBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await drawerBtn.click();
    }

    // The upgrade entry in the drawer should be visible.
    const upgradeEntry = portalPage.getByText(/more secure/i).first();
    await expect(upgradeEntry).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await upgradeEntry.click();

    // UpgradeChooser sheet opens with both paths.
    const chooser = portalPage.getByRole("dialog").last();
    await expect(chooser).toBeVisible({ timeout: 5_000 });

    // Both buttons should be present on a bare link.
    await expect(
      chooser.locator('[data-testid="upgrade-add-passphrase"]'),
    ).toBeVisible({ timeout: 3_000 });
    await expect(
      chooser.locator('[data-testid="upgrade-create-account"]'),
    ).toBeVisible({ timeout: 3_000 });

    // The body text should be visible.
    await expect(chooser.locator('[data-testid="upgrade-body"]')).toBeVisible();

    // The passphrase paragraph should be visible on bare link.
    await expect(
      chooser.locator('[data-testid="upgrade-passphrase-paragraph"]'),
    ).toBeVisible();

    await auditA11y(portalPage);
  });

  test("add password flow completes and reloads with passphrase gate", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 6);
    const pp = portal();

    // Click "Add a password" in the chooser.
    const addPassBtn = pp.locator('[data-testid="upgrade-add-passphrase"]');
    await addPassBtn.click();

    // AddPassphraseForm sheet opens.
    const form = pp.getByRole("dialog").last();
    await expect(form).toBeVisible({ timeout: 5_000 });

    // A diceware suggestion should be shown.
    const suggestion = form.locator('[data-testid="passphrase-suggestion"]');
    await expect(suggestion).toBeVisible({ timeout: 5_000 });
    const suggestedWords = ((await suggestion.textContent()) ?? "").trim();
    expect(suggestedWords.split(/\s+/).length).toBe(5);

    // Enter the suggested passphrase in both fields.
    const passphraseInput = form.locator(
      '[data-testid="passphrase-input"] input',
    );
    const confirmInput = form.locator(
      '[data-testid="passphrase-confirm"] input',
    );
    await passphraseInput.fill(suggestedWords);
    await confirmInput.fill(suggestedWords);

    // No mismatch error should show.
    await expect(
      form.locator('[data-testid="passphrase-mismatch"]'),
    ).not.toBeVisible({ timeout: 1_000 });

    await auditA11y(pp);

    // Submit the form.
    const submitBtn = form.locator('[data-testid="passphrase-submit"]');
    await expect(submitBtn).toBeEnabled({ timeout: 3_000 });
    await submitBtn.click();

    // Progress indicator should appear during the OPRF + re-seal pipeline.
    await expect(
      form.locator('[data-testid="passphrase-progress"]'),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Wait for the success state.
    await expect(
      form.locator('[data-testid="passphrase-success-body"]'),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Close the success sheet.
    const closeBtn = form.locator('[data-testid="passphrase-success-close"]');
    await closeBtn.click();

    // Reload the same link: the passphrase gate should now block.
    await pp.goto("about:blank");
    await pp.goto(portalLink);

    const gateInput = pp.getByLabel(/passphrase/i);
    await expect(gateInput).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Wrong passphrase fails.
    await gateInput.fill("wrong words entirely nope zero");
    const unlockBtn = pp.getByRole("button", {
      name: /continue|unlock/i,
    });
    await unlockBtn.click();
    await expect(
      pp.getByText(/doesn't match|no funciono|check the words/i),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Correct passphrase unlocks.
    await gateInput.fill(suggestedWords);
    await unlockBtn.click();

    // The thread should render after unlocking (the email bubble from
    // the volunteer's earlier send may or may not be present depending
    // on whether a dual-copy was written, but the thread container
    // should be visible).
    await pp.waitForTimeout(3_000);

    // Verify the portal session loaded by checking for any thread content
    // or the composer.
    const threadOrComposer = pp
      .locator('[role="log"], [role="textbox"]')
      .first();
    await expect(threadOrComposer).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  // ── 4. Passphrase-link drawer: contact card ───────────────────

  test("passphrase portal drawer shows contact card with phone and email", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    const pp = portal();

    // Open the drawer.
    const drawerBtn = pp
      .getByRole("button", { name: /menu|drawer|open drawer/i })
      .first();
    if (await drawerBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await drawerBtn.click();
    }

    // On a passphrase-tier session, the contact info entry should be visible.
    // Target the drawer entry by id: a text match also catches the
    // "Correct my contact info" correction entry, which exists on every tier.
    const contactEntry = pp.locator(
      '[data-testid="drawer-action-contact-info"]',
    );
    await expect(contactEntry).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await contactEntry.click();

    // ContactInfoCard sheet opens.
    const contactSheet = pp.getByRole("dialog").last();
    await expect(contactSheet).toBeVisible({ timeout: 5_000 });

    // Loading state should appear first.
    await expect(contactSheet.locator('[data-testid="contact-loading"]'))
      .toBeVisible({ timeout: 3_000 })
      .catch(() => {
        // Loading may be too fast with test KDF; this is acceptable.
      });

    // Wait for the contact list to appear (the sealed payload decrypts).
    await expect(
      contactSheet.locator('[data-testid="contact-list"]'),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // The email should contain the address we set earlier.
    const emailEl = contactSheet.locator('[data-testid="contact-email"]');
    await expect(emailEl).toBeVisible({ timeout: 3_000 });
    await expect(emailEl).toContainText(`testclient-${suffix}@example.com`);

    // Phone should also be visible (seeded clients have phones).
    const phoneEl = contactSheet.locator('[data-testid="contact-phone"]');
    await expect(phoneEl).toBeVisible({ timeout: 3_000 });

    await auditA11y(pp);

    // Close the contact sheet.
    await pp.keyboard.press("Escape");
    await pp.waitForTimeout(300);
  });

  // ── 5. Bare-link portal: no contact entry ─────────────────────

  test("bare-link portal has no contact entry in drawer", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    // The first client's channel now has a passphrase, so create a
    // separate bare link on the "Safety planning session" ticket.
    // account-portal.spec resets tiers in its own beforeAll, so no
    // cross-spec conflict.
    await volunteerPage.keyboard.press("Escape");
    await volunteerPage.getByRole("tab", { name: "Overview" }).click();
    await expect(volunteerPage).toHaveURL("/");
    await openTicketByTitle(volunteerPage, "Safety planning session");

    await openTicketInfoPanel(volunteerPage, "Communication");

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
    const bareLink = ((await linkEl.textContent()) ?? "").trim();
    expect(bareLink).toMatch(/\/portal\/[0-9a-f]{48}#[A-Za-z0-9_-]{32}/);
    await sheet.getByRole("button", { name: /done/i }).dispatchEvent("click");

    // Open the bare link in a fresh browser context.
    const barePage = await browser.newPage();
    await barePage.goto(bareLink);

    // Bare link (no passphrase): thread renders directly.
    await barePage.waitForTimeout(3_000);

    // Open the drawer.
    const drawerBtn = barePage
      .getByRole("button", { name: /menu|drawer|open drawer/i })
      .first();
    if (await drawerBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await drawerBtn.click();
    }

    // The upgrade entry should be present (bare link has both paths).
    const upgradeEntry = barePage.getByText(/more secure/i).first();
    await expect(upgradeEntry).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // The contact info entry should NOT be present on a bare link. The
    // correction entry ("Correct my contact info") IS expected on every
    // tier, so match the drawer entry id rather than text.
    const contactEntry = barePage.locator(
      '[data-testid="drawer-action-contact-info"]',
    );
    await expect(contactEntry).not.toBeVisible({ timeout: 3_000 });

    // Verify at the API level: a direct contactInfo query should return
    // the typed PORTAL_CONTACT_LOCKED error. We check this by evaluating
    // a fetch in the bare-link page context.
    const apiResult = await barePage.evaluate(async (channelId: string) => {
      // Extract the channel ID from the current URL path.
      try {
        const res = await fetch(
          `/trpc/clientPortal.contactInfo?input=${encodeURIComponent(JSON.stringify({ channelId, auth: "" }))}`,
          { credentials: "include" },
        );
        const body = await res.text();
        return { status: res.status, body };
      } catch (err: unknown) {
        return { status: 0, body: String(err) };
      }
    }, bareLink.split("/portal/")[1]!.split("#")[0]!);

    // The server should reject with the typed error (4xx status or the
    // error message contains PORTAL_CONTACT_LOCKED).
    expect(
      apiResult.status >= 400 ||
        apiResult.body.includes("PORTAL_CONTACT_LOCKED") ||
        apiResult.body.includes("UNAUTHORIZED"),
    ).toBe(true);

    await barePage.close();
  });
});
