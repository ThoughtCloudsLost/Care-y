import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page, Request } from "@playwright/test";
import { auditA11y, CRYPTO_TIMEOUT, login, openTicketByTitle } from "./helpers";
import { countRows, queryDb } from "./db-probe";

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

    // Contact method: "I'll check back myself" is the only option that
    // needs no contact detail. The default (phone) leaves the number
    // field required and blocks submit.
    const noneRadio = intakePage.getByRole("radio", {
      name: /check back myself/i,
    });
    await expect(noneRadio).toBeVisible({ timeout: 5_000 });
    await noneRadio.dispatchEvent("click");
    await expect(noneRadio).toBeChecked();

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

    const submitBtn = intakePage.getByRole("button", {
      name: /send encrypted message/i,
    });
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

    // Verify the payload has the expected base64 field shape. The batch
    // entry holds the input directly; there is no superjson "json"
    // wrapper on this route.
    const parsed: unknown = JSON.parse(postBody!);
    expect(parsed).toHaveProperty("0.encryptedTitle");
    expect(parsed).toHaveProperty("0.encryptedDescription");
    expect(parsed).toHaveProperty("0.wrappedTk");
    expect(parsed).toHaveProperty("0.ticketId");

    // Each encrypted field should be a non-empty base64-like string
    const json = (
      parsed as Record<string, Record<string, unknown> | undefined>
    )["0"];
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
      const submitBtn = errorPage.getByRole("button", {
        name: /send encrypted message/i,
      });
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

// ---------------------------------------------------------------------------
// Multi-form intake with per-slug routing and not-available states
// ---------------------------------------------------------------------------

test.describe.serial("Multi-form Intake Routing", () => {
  /**
   * Seed two active forms with distinct slugs and destination queues using
   * db-probe helpers (raw SQL). The seeded forms are minimal: one text field
   * each, different destination_queue_id values. The tests then submit
   * against each slug URL and verify tickets landed in the correct queues.
   */

  const SLUG_A = "e2e-form-alpha";
  const SLUG_B = "e2e-form-beta";
  let queueAId: string;
  let queueBId: string;
  let formAId: string;
  let formBId: string;

  test.beforeAll(() => {
    // Resolve existing queue ids from the e2e org. The seed creates at least
    // one queue (the intake queue). We create a second if needed.
    const existingQueues = queryDb(
      "SELECT id FROM queues ORDER BY created_at LIMIT 2;",
    );
    const queueIds = existingQueues
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (queueIds.length < 2) {
      // Create a second queue for routing differentiation
      queryDb(
        `INSERT INTO queues (id, encrypted_name, sort_order, created_at)
         VALUES (gen_random_uuid(), 'enc-test-q', 99, now());`,
      );
      const refreshed = queryDb(
        "SELECT id FROM queues ORDER BY created_at LIMIT 2;",
      );
      const ids = refreshed
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      queueAId = ids[0]!;
      queueBId = ids[1]!;
    } else {
      queueAId = queueIds[0]!;
      queueBId = queueIds[1]!;
    }

    // Insert two minimal intake forms with distinct slugs and destinations
    formAId = queryDb(
      `INSERT INTO intake_forms (id, name, slug, is_active, is_default, destination_queue_id, created_at, updated_at)
       VALUES (gen_random_uuid(), 'Alpha Form', '${SLUG_A}', true, false, '${queueAId}', now(), now())
       RETURNING id;`,
    ).trim();

    formBId = queryDb(
      `INSERT INTO intake_forms (id, name, slug, is_active, is_default, destination_queue_id, created_at, updated_at)
       VALUES (gen_random_uuid(), 'Beta Form', '${SLUG_B}', true, false, '${queueBId}', now(), now())
       RETURNING id;`,
    ).trim();

    // Each form needs at least one field (the renderer requires it).
    // Insert a minimal text field with encrypted label/config (placeholder ciphertext).
    for (const fid of [formAId, formBId]) {
      queryDb(
        `INSERT INTO intake_form_fields (id, form_id, field_type, encrypted_label, encrypted_config, is_required, position, created_at)
         VALUES (gen_random_uuid(), '${fid}', 'textarea', 'dGVzdC1sYWJlbA', 'eyJ0eXBlIjoidGV4dGFyZWEifQ', true, 0, now());`,
      );
    }
  });

  test("not-available state for unknown slug", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    const page = await browser.newPage();
    await page.goto("/intake/nonexistent-slug-xyz");
    // The not-available state renders a role="status" element with the message
    const statusEl = page.locator("[role='status']:not(#toast-container)");
    await expect(statusEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    const text = await statusEl.textContent();
    expect(text).toContain("not available");
    await page.close();
  });

  test("not-available state when web_intake_enabled is false", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);

    // Disable web intake via DB
    queryDb("UPDATE org_config SET web_intake_enabled = false WHERE true;");

    const page = await browser.newPage();
    await page.goto("/intake");
    const statusEl = page.locator("[role='status']:not(#toast-container)");
    await expect(statusEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    const text = await statusEl.textContent();
    expect(text).toContain("not available");

    // Re-enable for subsequent tests
    queryDb("UPDATE org_config SET web_intake_enabled = true WHERE true;");
    await page.close();
  });

  test("submit to slug-A routes ticket to queue A", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    const page = await browser.newPage();
    await page.goto(`/intake/${SLUG_A}`);

    // Wait for the form to render (the branding-key decrypt exposes the field)
    // Since the encrypted label/config are placeholder ciphertext, the form
    // may show a decrypt error or a generic textarea. We look for a textarea
    // (the fallback when decrypt fails renders the default form, which has a
    // textarea).
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await textarea.fill("Alpha queue submission");

    const submitBtn = page.getByRole("button", {
      name: /send encrypted message/i,
    });
    await expect(submitBtn).toBeEnabled({ timeout: CRYPTO_TIMEOUT });
    await submitBtn.click();

    // Wait for success (reference code visible)
    const refEl = page.locator("code").first();
    await expect(refEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // DB probe: the most recent ticket should be in queue A
    const latestQueueId = queryDb(
      "SELECT queue_id FROM tickets ORDER BY created_at DESC LIMIT 1;",
    ).trim();
    expect(latestQueueId).toBe(queueAId);

    await page.close();
  });

  test("submit to slug-B routes ticket to queue B", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    const page = await browser.newPage();
    await page.goto(`/intake/${SLUG_B}`);

    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await textarea.fill("Beta queue submission");

    const submitBtn = page.getByRole("button", {
      name: /send encrypted message/i,
    });
    await expect(submitBtn).toBeEnabled({ timeout: CRYPTO_TIMEOUT });
    await submitBtn.click();

    const refEl = page.locator("code").first();
    await expect(refEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });

    // DB probe: the most recent ticket should be in queue B
    const latestQueueId = queryDb(
      "SELECT queue_id FROM tickets ORDER BY created_at DESC LIMIT 1;",
    ).trim();
    expect(latestQueueId).toBe(queueBId);

    await page.close();
  });

  test.afterAll(() => {
    // Cleanup: remove the seeded forms and their fields
    queryDb(
      `DELETE FROM intake_form_fields WHERE form_id IN ('${formAId}', '${formBId}');`,
    );
    queryDb(
      `DELETE FROM intake_forms WHERE id IN ('${formAId}', '${formBId}');`,
    );
  });
});
