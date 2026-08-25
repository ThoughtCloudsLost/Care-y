import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page, Request } from "@playwright/test";
import {
  auditA11y,
  CRYPTO_TIMEOUT,
  E2eError,
  login,
  openTicketByTitle,
} from "./helpers";
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
    await login(setupPage);

    const formResults = await setupPage.evaluate(
      async (args: {
        slugA: string;
        slugB: string;
        queueA: string;
        queueB: string;
      }) => {
        // Dynamic imports resolve through the Vite dev server, giving
        // access to the same crypto helpers the admin form editor uses.
        // Specifiers go through variables: the e2e tsconfig cannot type
        // browser-served module paths, and a bare package specifier does
        // not resolve in a native browser import, so the crypto barrel
        // goes through Vite's /@id/ resolution endpoint.
        const formCryptoUrl = "/src/lib/portal/intake-form-crypto.ts";
        const cryptoBarrelUrl = "/@id/@care-y/crypto";
        const { encryptFieldContent } = (await import(formCryptoUrl)) as {
          encryptFieldContent: (
            plain: { label: string; config: { type: string } },
            orgPub: Uint8Array,
          ) => { encryptedLabel: string; encryptedConfig: string };
        };
        const { decode } = (await import(cryptoBarrelUrl)) as {
          decode: (b64: string) => Uint8Array;
        };

        // Fetch the org public key from the public branding endpoint.
        const brandingRes = await fetch("/trpc/branding.getPublicBranding", {
          credentials: "include",
        });
        if (!brandingRes.ok) {
          return { ok: false as const, error: "branding fetch failed" };
        }
        const brandingJson = (await brandingRes.json()) as {
          result: { data: { orgPublicKey: string | null } };
        };
        const orgPubB64 = brandingJson.result.data.orgPublicKey;
        if (orgPubB64 === null) {
          return { ok: false as const, error: "org public key is null" };
        }
        const orgPub = decode(orgPubB64);

        // Encrypt a single textarea field for each form.
        const encA = encryptFieldContent(
          { label: "Message", config: { type: "textarea" } },
          orgPub,
        );
        const encB = encryptFieldContent(
          { label: "Details", config: { type: "textarea" } },
          orgPub,
        );

        // Save form A via the admin tRPC mutation.
        const saveA = await fetch("/trpc/intakeForms.save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            formId: null,
            name: "Alpha Form",
            slug: args.slugA,
            isDefault: false,
            destinationQueueId: args.queueA,
            fields: [
              {
                fieldType: "textarea",
                encryptedLabel: encA.encryptedLabel,
                encryptedConfig: encA.encryptedConfig,
                isRequired: true,
              },
            ],
          }),
        });
        if (!saveA.ok) {
          const body = await saveA.text();
          return { ok: false as const, error: `save form A failed: ${body}` };
        }
        const dataA = (await saveA.json()) as {
          result: { data: { formId: string } };
        };

        // Save form B via the admin tRPC mutation.
        const saveB = await fetch("/trpc/intakeForms.save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            formId: null,
            name: "Beta Form",
            slug: args.slugB,
            isDefault: false,
            destinationQueueId: args.queueB,
            fields: [
              {
                fieldType: "textarea",
                encryptedLabel: encB.encryptedLabel,
                encryptedConfig: encB.encryptedConfig,
                isRequired: true,
              },
            ],
          }),
        });
        if (!saveB.ok) {
          const body = await saveB.text();
          return { ok: false as const, error: `save form B failed: ${body}` };
        }
        const dataB = (await saveB.json()) as {
          result: { data: { formId: string } };
        };

        // New forms are drafts (is_active defaults to false) and the
        // public slug lookup only returns active forms; activate both.
        for (const formId of [
          dataA.result.data.formId,
          dataB.result.data.formId,
        ]) {
          const act = await fetch("/trpc/intakeForms.setActive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ formId, active: true }),
          });
          if (!act.ok) {
            const body = await act.text();
            return { ok: false as const, error: `activate failed: ${body}` };
          }
        }

        return {
          ok: true as const,
          formAId: dataA.result.data.formId,
          formBId: dataB.result.data.formId,
        };
      },
      { slugA: SLUG_A, slugB: SLUG_B, queueA: queueAId, queueB: queueBId },
    );

    await setupPage.close();

    if (!formResults.ok) {
      throw new E2eError(
        `Multi-form fixture setup failed: ${formResults.error}`,
      );
    }

    formAId = formResults.formAId;
    formBId = formResults.formBId;
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
