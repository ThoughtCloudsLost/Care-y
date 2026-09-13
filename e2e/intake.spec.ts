import { test, expect } from "./coverage-fixture";
import {
  startCoverage,
  stopAndWriteCoverage,
  stopCoverageAndClose,
} from "./coverage-fixture";
import type { Page, Request } from "@playwright/test";
import { auditA11y, CRYPTO_TIMEOUT, login, openTicketByTitle } from "./helpers";
import { countRows, queryDb } from "./db-probe";
import { createIntakeFormFixture } from "./intake-fixtures";

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

// Test data used for the intake form submission. The suffix keeps the
// decrypted title unique across runs: web-intake tickets carry a
// client-authored followup, so the global-setup stale-ticket sweep
// (which keys on "no user-authored followups") never removes them.
const suffix = String(Date.now()).slice(-6);
const INTAKE_NAME = `E2E Intake Client ${suffix}`;
const INTAKE_MESSAGE = `I need help with a housing situation ${suffix}, please contact me.`;

test.describe.serial("Public Intake Form", () => {
  let intakePage: Page;
  let volunteerPage: Page;

  // ── Client-side: intake form submission ──────────────────────────

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    intakePage = await browser.newPage();
    await startCoverage(intakePage);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(intakePage, "intake-client");
    await intakePage.close();
    // volunteerPage is created mid-suite; clean it up here (lifecycle,
    // not a test) so a close failure reports as teardown, not test red.
    await stopCoverageAndClose(volunteerPage, "intake-volunteer");
  });

  test("intake page loads and shows org branding", async () => {
    await intakePage.goto("/intake");
    // The branded layout renders the org name (org_config.name, set by
    // global-setup) in the navbar. A bare banner-role check would pass
    // with branding entirely broken.
    const navbar = intakePage.getByRole("banner");
    await expect(navbar).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(navbar.getByText("E2E Test Org")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
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

    // The reference code must be non-empty
    const reference = await referenceEl.textContent();
    expect(reference).toBeTruthy();

    // Assert the intercepted request payload contains only base64 fields
    expect(capturedRequest).not.toBeNull();
    const postBody = capturedRequest!.postData();
    expect(postBody).toBeTruthy();

    // Verify NO plaintext from the form appears in the request body
    expect(postBody).not.toContain(INTAKE_NAME);
    expect(postBody).not.toContain(INTAKE_MESSAGE);

    // Verify the payload has the expected base64 field shape. The field
    // names are API contract; the batch envelope is not. Read the entry
    // defensively so switching httpBatchLink to a non-batched link (same
    // observable behavior) does not break this. There is no superjson
    // "json" wrapper on this route.
    const parsed = JSON.parse(postBody!) as Record<
      string,
      Record<string, unknown> | undefined
    >;
    const json = parsed["0"] ?? (parsed as Record<string, unknown>);
    expect(json).toHaveProperty("encryptedTitle");
    expect(json).toHaveProperty("encryptedDescription");
    expect(json).toHaveProperty("wrappedTk");
    expect(json).toHaveProperty("ticketId");

    // Each encrypted field should be a non-empty base64-like string
    expect(typeof json.encryptedTitle).toBe("string");
    expect(typeof json.encryptedDescription).toBe("string");
    expect(typeof json.wrappedTk).toBe("string");
    expect((json.encryptedTitle as string).length).toBeGreaterThan(10);
    expect((json.wrappedTk as string).length).toBeGreaterThan(10);
  });

  // No separate "success state shows reference code" test: the submit
  // test already asserts the reference code is visible and non-empty,
  // and the a11y audit below runs against the same success state.
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

  let intakeWrapCountBeforeOpen = 0;

  test("volunteer opens intake ticket detail and sees message content", async () => {
    const intakeTitle = `Web intake - ${INTAKE_NAME}`;

    // Capture the wrap count before the detail open fires the conversion.
    // Other specs' unconverted intake tickets may hold rows too, so the
    // conversion assertion checks the delta, not an absolute zero.
    intakeWrapCountBeforeOpen = countRows("intake_key_wraps");
    expect(intakeWrapCountBeforeOpen).toBeGreaterThan(0);

    await openTicketByTitle(volunteerPage, intakeTitle);

    // The message follow-up content should be decrypted and visible in the chat log
    await expect(volunteerPage.getByText(INTAKE_MESSAGE).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("DB: interim wrap deleted, ECIES wraps created", async () => {
    // After opening the ticket detail, the conversion should have fired.
    // Wait a moment for the mutation to complete server-side.
    await volunteerPage.waitForTimeout(3_000);

    // This ticket's interim wrap is deleted by the conversion (delta of
    // exactly one against the pre-open count).
    const intakeWrapCount = countRows("intake_key_wraps");
    expect(intakeWrapCount).toBe(intakeWrapCountBeforeOpen - 1);

    // ticket_key_wraps must gain rows for THIS ticket's queue volunteers.
    // Scoped to the intake ticket (the newest tickets row; safe under the
    // suite's workers:1 and this file's sequential order): the seed already
    // guarantees tenant-wide wrap rows exist, so an unscoped count(*) > 0
    // could never fail.
    const ticketWrapCount = countRows(
      "ticket_key_wraps",
      "ticket_id = (SELECT id FROM tickets ORDER BY created_at DESC LIMIT 1)",
    );
    expect(ticketWrapCount).toBeGreaterThan(0);
  });

  // ── Error state a11y ─────────────────────────────────────────────

  // The dev/e2e stack runs with INTAKE_SUBMISSION_LIMIT=500
  // (docker-compose.yml), so the 3/IP/hour production limit cannot trip
  // here and the rate-limited error state is unreachable in this
  // environment. This test audits the form after multiple successful
  // submissions (the state the spec leaves the page in), not the
  // rate-limited error state.
  test("a11y: intake form after multiple submissions passes axe audit", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    const errorPage = await browser.newPage();
    await startCoverage(errorPage);
    await errorPage.goto("/intake");
    await expect(errorPage.getByRole("banner")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    await auditA11y(errorPage);
    await stopCoverageAndClose(errorPage, "intake-post-submit");
  });
});

// ---------------------------------------------------------------------------
// Multi-form intake with per-slug routing and not-available states
// ---------------------------------------------------------------------------

test.describe.serial("Multi-form Intake Routing", () => {
  /**
   * Seed two active forms with distinct slugs and destination queues.
   * Forms are created from a logged-in browser context so field labels and
   * configs are encrypted with the real org branding key (the same path the
   * admin form editor uses). Raw SQL cannot produce decryptable ciphertext
   * because the branding key is derived from the org public key, which only
   * exists in browser sessions.
   *
   * Queue fixtures still use raw SQL because queue names are never rendered
   * in these tests; only queue IDs matter for the routing assertion.
   */

  const SLUG_A = "e2e-form-alpha";
  const SLUG_B = "e2e-form-beta";
  let queueAId: string;
  let queueBId: string;
  let formAId: string;
  let formBId: string;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

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

    // Create both forms from a logged-in browser page so the field
    // labels and configs are encrypted with the real branding key.
    const setupPage = await browser.newPage();
    await startCoverage(setupPage);
    await login(setupPage);

    const resultA = await createIntakeFormFixture(setupPage, {
      name: "Alpha Form",
      slug: SLUG_A,
      destinationQueueId: queueAId,
      fields: [
        { label: "Message", config: { type: "textarea" }, required: true },
      ],
    });
    formAId = resultA.formId;

    const resultB = await createIntakeFormFixture(setupPage, {
      name: "Beta Form",
      slug: SLUG_B,
      destinationQueueId: queueBId,
      fields: [
        { label: "Details", config: { type: "textarea" }, required: true },
      ],
    });
    formBId = resultB.formId;

    await stopCoverageAndClose(setupPage, "intake-multiform-setup");
  });

  test("not-available state for unknown slug", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    const page = await browser.newPage();
    await startCoverage(page);
    await page.goto("/intake/nonexistent-slug-xyz");
    // The not-available state renders a role="status" element with the message
    const statusEl = page.locator("[role='status']:not(#toast-container)");
    await expect(statusEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    const text = await statusEl.textContent();
    expect(text).toContain("not available");
    await stopCoverageAndClose(page, "intake-unknown-slug");
  });

  test("not-available state when web_intake_enabled is false", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);

    // Disable web intake via DB
    queryDb("UPDATE org_config SET web_intake_enabled = false WHERE true;");

    const page = await browser.newPage();
    await startCoverage(page);
    await page.goto("/intake");
    const statusEl = page.locator("[role='status']:not(#toast-container)");
    await expect(statusEl).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    const text = await statusEl.textContent();
    expect(text).toContain("not available");

    // Re-enable for subsequent tests
    queryDb("UPDATE org_config SET web_intake_enabled = true WHERE true;");
    await stopCoverageAndClose(page, "intake-web-disabled");
  });

  test("submit to slug-A routes ticket to queue A", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    const page = await browser.newPage();
    await startCoverage(page);
    await page.goto(`/intake/${SLUG_A}`);

    // Wait for the form to render. The branding-key decrypt decodes the
    // encrypted field label and config, then the renderer shows a textarea.
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

    await stopCoverageAndClose(page, "intake-route-slug-a");
  });

  test("submit to slug-B routes ticket to queue B", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    const page = await browser.newPage();
    await startCoverage(page);
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

    await stopCoverageAndClose(page, "intake-route-slug-b");
  });

  test.afterAll(() => {
    // Remove responses that reference these forms (no cascade on form_id FK),
    // then the forms themselves. Fields cascade via FK from intake_forms.
    queryDb(
      `DELETE FROM intake_form_responses WHERE form_id IN ('${formAId}', '${formBId}');`,
    );
    queryDb(
      `DELETE FROM intake_forms WHERE id IN ('${formAId}', '${formBId}');`,
    );
  });
});

/**
 * Field-type validation matrix on a purpose-built multi-page form.
 *
 * One form carries every data field type plus a conditionally visible
 * field and a page break, so the client-side validation paths (required
 * per type, email/phone/number formats, number range, page-scoped
 * validation on Next) and the pagination machinery all execute against
 * real encrypted field configs. The fixture is built browser-side with
 * the same encrypt-and-save path as the multi-form suite above.
 */
test.describe.serial("Intake validation matrix", () => {
  const SLUG_V = "e2e-form-validation";
  let formVId: string;
  let page: Page;

  // Field keys are minted here so tests can reference them in comments;
  // the browser fixture receives the labels and shapes only.
  const LABELS = {
    email: "Contact email",
    phone: "Contact phone",
    amount: "How many people",
    topic: "Topic",
    urgent: "Urgent details",
    tags: "Areas of need",
    consent: "I agree to be contacted",
    date: "Preferred date",
    message: "Your message",
    details: "Anything else",
  } as const;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    const setupPage = await browser.newPage();
    await startCoverage(setupPage);
    await login(setupPage);

    // The topic field key is minted here so the urgent field's
    // visibleWhen can reference it by key.
    const topicKey = crypto.randomUUID();

    const result = await createIntakeFormFixture(setupPage, {
      name: "Validation Matrix Form",
      slug: SLUG_V,
      fields: [
        {
          label: LABELS.email,
          config: { type: "text", subtype: "email" },
          required: true,
        },
        {
          label: LABELS.phone,
          config: { type: "text", subtype: "phone" },
          required: false,
        },
        {
          label: LABELS.amount,
          config: {
            type: "text",
            subtype: "number",
            numberRange: { min: 1, max: 5 },
          },
          required: false,
        },
        {
          label: LABELS.topic,
          fieldKey: topicKey,
          config: {
            type: "select",
            options: [
              { key: "opt-urgent", label: { en: "Urgent help" } },
              { key: "opt-normal", label: { en: "General question" } },
            ],
          },
          required: true,
        },
        {
          label: LABELS.urgent,
          config: { type: "text" },
          required: true,
          visibleWhen: {
            version: 2,
            groups: [
              [
                {
                  fieldKey: topicKey,
                  operator: "equals",
                  optionKey: "opt-urgent",
                },
              ],
            ],
          },
        },
        {
          label: LABELS.tags,
          config: {
            type: "multiselect",
            options: [
              { key: "k-housing", label: { en: "Housing" } },
              { key: "k-legal", label: { en: "Legal" } },
            ],
          },
          required: true,
        },
        {
          label: LABELS.consent,
          config: { type: "checkbox", requiredTrue: true },
          required: true,
        },
        { label: LABELS.date, config: { type: "date" }, required: true },
        {
          label: LABELS.message,
          config: { type: "textarea" },
          required: true,
        },
        {
          label: "More details",
          config: { type: "pageBreak", title: { en: "More details" } },
          required: false,
        },
        {
          label: LABELS.details,
          config: { type: "textarea" },
          required: true,
        },
      ],
    });
    await stopCoverageAndClose(setupPage, "intake-validation-setup");
    formVId = result.formId;

    page = await browser.newPage();
    await startCoverage(page);
  });

  test.afterAll(async () => {
    await stopCoverageAndClose(page, "intake-validation");
    queryDb(`DELETE FROM intake_form_responses WHERE form_id = '${formVId}';`);
    queryDb(`DELETE FROM intake_forms WHERE id = '${formVId}';`);
  });

  test("empty Next surfaces required errors per field type", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    await page.goto(`/intake/${SLUG_V}`);

    // Form decrypted and rendered once the first labeled input appears.
    await expect(page.getByLabel(LABELS.email)).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    await page.getByTestId("intake-page-next").click();

    // Required errors: textarea carries its own message, the other field
    // types share the generic one. The hidden conditional field must NOT
    // produce an error (validation skips invisible fields).
    await expect(
      page.getByText("Please write a message so we know how to help."),
    ).toBeVisible({ timeout: 5_000 });
    const genericErrors = page.getByText("This field is required.", {
      exact: true,
    });
    // Six sources: field errors for email, topic, tags, consent, and
    // date, plus the polite live-region announcement that echoes the
    // same string on a failed Next. The hidden urgent-details field
    // would make it seven if visibility leaked into validation.
    await expect(genericErrors).toHaveCount(6, { timeout: 5_000 });
  });

  test("format validation for email, phone, and number range", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);

    await page.getByLabel(LABELS.email).fill("not-an-email");
    await page.getByLabel(LABELS.phone).fill("12");
    await page.getByTestId("intake-page-next").click();

    await expect(page.getByText("Enter a valid email address.")).toBeVisible({
      timeout: 5_000,
    });
    await expect(
      page.getByText("Enter a phone number like +1 555 000 1234."),
    ).toBeVisible({ timeout: 5_000 });

    // No NaN case: the number subtype renders input[type=number], and
    // the browser refuses non-numeric text before the validator can see
    // it, so that branch guards non-UI input only.

    // Range checks: above max, then below min.
    await page.getByLabel(LABELS.amount).fill("9");
    await page.getByTestId("intake-page-next").click();
    await expect(page.getByText("Value must be at most 5.")).toBeVisible({
      timeout: 5_000,
    });
    await page.getByLabel(LABELS.amount).fill("0");
    await page.getByTestId("intake-page-next").click();
    await expect(page.getByText("Value must be at least 1.")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("conditional field appears with its trigger and validates", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);

    // Selecting the urgent topic reveals the conditional field.
    await page.getByLabel(LABELS.topic).selectOption("opt-urgent");
    await expect(page.getByLabel(LABELS.urgent)).toBeVisible({
      timeout: 5_000,
    });

    // Switching back hides it again.
    await page.getByLabel(LABELS.topic).selectOption("opt-normal");
    await expect(page.getByLabel(LABELS.urgent)).not.toBeVisible({
      timeout: 5_000,
    });
  });

  test("multi-page navigation preserves values and submits", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);

    await page.getByLabel(LABELS.email).fill("rt-intake@example.test");
    await page.getByLabel(LABELS.phone).fill("+1 555 000 2222");
    await page.getByLabel(LABELS.amount).fill("3");
    // Multiselect options and the consent row render as Konsta checkbox
    // list items; the visible text is the click target.
    await page.getByText("Housing", { exact: true }).click();
    // Required fields render with a trailing asterisk ("... *"), so the
    // consent row needs a substring match, which getByText does by
    // default for a string argument.
    await page.getByText(LABELS.consent).click();
    await page.getByLabel(LABELS.date).fill("2026-01-15");
    await page.getByLabel(LABELS.message).fill("Validation matrix message");

    await page.getByTestId("intake-page-next").click();

    // Page 2: the page-break title renders and Back is available.
    await expect(page.getByText("More details").first()).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByTestId("intake-page-back")).toBeVisible({
      timeout: 5_000,
    });

    // Back retains page-1 values.
    await page.getByTestId("intake-page-back").click();
    await expect(page.getByLabel(LABELS.email)).toHaveValue(
      "rt-intake@example.test",
      { timeout: 5_000 },
    );
    await page.getByTestId("intake-page-next").click();

    // Submit with the last page empty: its required textarea blocks.
    await page.getByTestId("intake-submit").click();
    await expect(
      page.getByText("Please write a message so we know how to help."),
    ).toBeVisible({ timeout: 5_000 });

    await page.getByLabel(LABELS.details).fill("Nothing further");
    await page.getByTestId("intake-submit").click();

    // Success renders the reference code, same contract as the routing
    // tests above.
    await expect(page.locator("code").first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });
});
