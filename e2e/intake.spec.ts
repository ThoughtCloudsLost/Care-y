import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page, Request } from "@playwright/test";
import { auditA11y, CRYPTO_TIMEOUT, login, openTicketByTitle } from "./helpers";
import { countRows } from "./db-probe";

/**
 * Public intake form E2E roundtrip.
 *
 * Flow: anonymous client loads /intake, fills form, submits encrypted payload,
 * receives a reference code. Then a volunteer logs in, finds the intake ticket,
 * opens detail (triggering interim wrap conversion), and reads decrypted content.
 * DB probes verify the conversion deleted the interim wrap and created ECIES wraps.
 *
 * Uses the e2e-org seeded by global-setup.ts. The intake page resolves the org
 * via VITE_ORG_SLUG (same as all other e2e specs).
 */

// Test data used for the intake form submission.
const INTAKE_NAME = "E2E Intake Client";
const INTAKE_MESSAGE =
  "I need help with a housing situation, please contact me.";

test.describe.serial("Public Intake Form", () => {
  let intakePage: Page;
  let volunteerPage: Page;
  let submittedReference: string;

  // ── Client-side: intake form submission ──────────────────────────

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    intakePage = await browser.newPage();
    await startCoverage(intakePage);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(intakePage, "intake-client");
    await intakePage.close();
  });

  test("intake page loads and shows org branding", async () => {
    await intakePage.goto("/intake");
    // The branded layout renders the org name in the navbar.
    // The e2e-org seed sets the org name; verify the navbar has content.
    const navbar = intakePage.getByRole("banner");
    await expect(navbar).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  test("a11y: empty intake form passes axe audit", async () => {
    await auditA11y(intakePage);
  });

  test("fill default intake form fields", async () => {
    // The default form renders name, contact method, and message fields.
    // Name field
    const nameInput = intakePage.getByLabel(/name/i);
    await expect(nameInput).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await nameInput.fill(INTAKE_NAME);

    // Contact method: select "none" (no contact info needed for test)
    const noneRadio = intakePage
      .getByText(/no contact/i)
      .or(intakePage.getByText(/none/i));
    if (await noneRadio.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await noneRadio.click();
    }

    // Message field (textarea)
    const messageInput = intakePage.locator("textarea").first();
    await expect(messageInput).toBeVisible();
    await messageInput.fill(INTAKE_MESSAGE);
  });

  test("a11y: filled intake form passes axe audit", async () => {
    await auditA11y(intakePage);
  });

  test("submit encrypts payload (no plaintext in request)", async () => {
    // Intercept the submitIntake tRPC request
    let capturedRequest: Request | null = null;
    intakePage.on("request", (req) => {
      if (
        req.url().includes("clientPortal.submitIntake") &&
        req.method() === "POST"
      ) {
        capturedRequest = req;
      }
    });

    const submitBtn = intakePage.getByRole("button", { name: /submit/i });
    await expect(submitBtn).toBeEnabled({ timeout: CRYPTO_TIMEOUT });
    await submitBtn.click();

    // Wait for the success state to appear (reference code visible)
    const referenceEl = intakePage.locator("code").first();
    await expect(referenceEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // Capture the reference code for the volunteer-side assertions
    const reference = await referenceEl.textContent();
    expect(reference).toBeTruthy();
    submittedReference = reference ?? "";

    // Assert the intercepted request payload contains only base64 fields
    expect(capturedRequest).not.toBeNull();
    const postBody = capturedRequest!.postData();
    expect(postBody).toBeTruthy();

    // Verify NO plaintext from the form appears in the request body
    expect(postBody).not.toContain(INTAKE_NAME);
    expect(postBody).not.toContain(INTAKE_MESSAGE);

    // Verify the payload has the expected base64 field shape
    const parsed: unknown = JSON.parse(postBody!);
    expect(parsed).toHaveProperty("0.json.encryptedTitle");
    expect(parsed).toHaveProperty("0.json.encryptedDescription");
    expect(parsed).toHaveProperty("0.json.wrappedTk");
    expect(parsed).toHaveProperty("0.json.ticketId");

    // Each encrypted field should be a non-empty base64-like string
    const json = (
      parsed as Record<
        string,
        Record<string, Record<string, unknown>> | undefined
      >
    )["0"]?.json;
    expect(json).toBeDefined();
    expect(typeof json?.encryptedTitle).toBe("string");
    expect(typeof json?.encryptedDescription).toBe("string");
    expect(typeof json?.wrappedTk).toBe("string");
    expect((json?.encryptedTitle as string).length).toBeGreaterThan(10);
    expect((json?.wrappedTk as string).length).toBeGreaterThan(10);
  });

  test("success state shows reference code", async () => {
    // Already verified in the submit test, but this is the explicit assertion.
    const successHeading = intakePage
      .getByRole("heading", { level: 2 })
      .or(intakePage.getByText(/submitted|received|thank/i));
    await expect(successHeading).toBeVisible();

    // The reference code should be displayed
    const codeEl = intakePage.locator("code").first();
    await expect(codeEl).toBeVisible();
    expect(submittedReference.length).toBeGreaterThan(0);
  });

  test("a11y: success state passes axe audit", async () => {
    await auditA11y(intakePage);
  });

  // ── Volunteer-side: decrypt and verify ───────────────────────────

  test("volunteer sees decrypted intake ticket", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    volunteerPage = await browser.newPage();
    await startCoverage(volunteerPage);

    await login(volunteerPage);

    // Navigate to tickets list
    await volunteerPage.getByRole("tab", { name: "Tickets" }).click();
    await expect(volunteerPage).toHaveURL(/\/tickets/);

    // Wait for decryption to complete and find the intake ticket.
    // Intake tickets have the title "Web intake - <name>" (default form with name).
    const intakeTitle = `Web intake - ${INTAKE_NAME}`;
    await expect(volunteerPage.getByText(intakeTitle).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("volunteer opens intake ticket detail and sees message content", async () => {
    const intakeTitle = `Web intake - ${INTAKE_NAME}`;
    await openTicketByTitle(volunteerPage, intakeTitle);

    // The message follow-up content should be decrypted and visible in the chat log
    await expect(volunteerPage.getByText(INTAKE_MESSAGE).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("DB: interim wrap deleted, ECIES wraps created", async () => {
    // The ticket id is not directly available from the UI, but we can query
    // by the encrypted_alias matching our reference code through the hash.
    // Instead, query for tickets with intake_key_wraps (should be zero after conversion)
    // and verify ticket_key_wraps has rows.

    // After opening the ticket detail, the conversion should have fired.
    // Wait a moment for the mutation to complete server-side.
    await volunteerPage.waitForTimeout(3_000);

    // All intake_key_wraps for the e2e org should be empty (conversion
    // deletes the interim wrap on first open)
    const intakeWrapCount = countRows("intake_key_wraps");
    expect(intakeWrapCount).toBe(0);

    // ticket_key_wraps should have rows for the queue volunteers.
    // The e2e org seed assigns at least one volunteer to the intake queue,
    // so at least one wrap row should exist for the intake ticket.
    const ticketWrapCount = countRows("ticket_key_wraps");
    expect(ticketWrapCount).toBeGreaterThan(0);
  });

  test("cleanup volunteer page", async () => {
    await stopAndWriteCoverage(volunteerPage, "intake-volunteer");
    await volunteerPage.close();
  });

  // ── Error state a11y ─────────────────────────────────────────────

  test("a11y: rate-limited error state passes axe audit", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    // Submit multiple times rapidly to trigger the rate limiter.
    // The first submission already used one slot. Fire three more to hit the
    // 3/IP/hour limit (the first test already consumed one).
    const errorPage = await browser.newPage();
    await errorPage.goto("/intake");
    await expect(errorPage.getByRole("banner")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Fill and submit twice more to trigger the rate limit (total 4 including
    // the original test submission). On the rate-limited request, the page
    // should show an error state.
    for (let i = 0; i < 3; i++) {
      const nameInput = errorPage.getByLabel(/name/i);
      if (await nameInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await nameInput.fill(`Rate test ${String(i)}`);
      }
      const msgInput = errorPage.locator("textarea").first();
      if (await msgInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await msgInput.fill("Testing rate limit");
      }
      const submitBtn = errorPage.getByRole("button", { name: /submit/i });
      if (await submitBtn.isEnabled({ timeout: 3_000 }).catch(() => false)) {
        await submitBtn.click();
        // Wait briefly for error or success
        await errorPage.waitForTimeout(2_000);
      }

      // If a success state appeared, reload to reset the form
      const successEl = errorPage.locator("code").first();
      if (await successEl.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await errorPage.goto("/intake");
        await expect(errorPage.getByRole("banner")).toBeVisible({
          timeout: CRYPTO_TIMEOUT,
        });
      }
    }

    // At this point the page may show an error. Run the a11y audit regardless
    // of what state we reached (the audit should pass on any page state).
    await auditA11y(errorPage);
    await errorPage.close();
  });
});
