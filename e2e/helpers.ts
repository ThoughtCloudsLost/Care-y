import { expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHmac } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Crypto pipeline timeout: Argon2id + OPRF + ECIES + Worker decryption.
 *  With VITE_E2E_FAST_KDF=1 (set in playwright.config.ts), Argon2id takes <100ms
 *  instead of ~30s. 30s covers OPRF roundtrip, key derivation, and initial
 *  decryption even under heavy machine load (parallel dev server, Docker,
 *  concurrent test workers). */
export const CRYPTO_TIMEOUT = 30_000;

/** Failure in e2e infrastructure (the repo bans bare Error throws). */
export class E2eError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "E2eError";
  }
}

/** Bounding box of a visible element; throws if the element has none. */
export async function boxOf(
  locator: Locator,
): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new E2eError("Expected element to have a bounding box");
  }
  return box;
}

/** Seed credentials (must match dev seed script: packages/server/src/scripts/seed.ts). */
const DEV_USER = "admin.dev";
const DEV_PASSWORD = "dev-password-1234!";

/** Persisted TOTP secret (written during first-login enrollment, read by subsequent logins). */
const AUTH_DIR = join(process.cwd(), ".auth");
const TOTP_SECRET_PATH = join(AUTH_DIR, "totp-secret.txt");

function saveTotpSecret(secret: string): void {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, path is constant
  mkdirSync(AUTH_DIR, { recursive: true });
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, path is constant
  writeFileSync(TOTP_SECRET_PATH, secret, "utf-8");
}

export function loadTotpSecret(): string | null {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, path is constant
    return readFileSync(TOTP_SECRET_PATH, "utf-8").trim();
  } catch {
    return null;
  }
}

/**
 * Generate a TOTP code from a base32-encoded secret.
 * Matches the server's RFC 6238 implementation (HMAC-SHA1, 6 digits, 30s period).
 */
export function generateTotpCode(base32Secret: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const stripped = base32Secret.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const char of stripped) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 0xff);
    }
  }
  const secret = Buffer.from(output);

  const counter = Math.floor(Date.now() / 1000 / 30);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuf.writeUInt32BE(counter >>> 0, 4);

  const hmac = createHmac("sha1", secret).update(counterBuf).digest();
  const offset = hmac.readUInt8(hmac.length - 1) & 0x0f;
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;
  const otp = binary % 10 ** 6;
  return otp.toString().padStart(6, "0");
}

/**
 * Alias for generateTotpCode. The server's replay cache is bypassed in test
 * via TOTP_REPLAY_BYPASS=1, so no deduplication is needed on the client side.
 */
export function generateFreshTotpCode(secret: string): string {
  return generateTotpCode(secret);
}

/**
 * Log in via the login page and complete the full production auth flow.
 *
 * First login: credentials → crypto pipeline → redirect to /complete →
 *   security briefing (4 pages) → TOTP enrollment → backup codes → dashboard.
 *   TOTP secret is saved to .auth/totp-secret.txt for subsequent logins.
 *
 * Subsequent logins: credentials → inline 2FA challenge on /login →
 *   enter TOTP code (read secret from file) → crypto pipeline → dashboard.
 */
export interface LoginOptions {
  /** Return while the admin key-distribution gate is showing instead of
   *  failing on the missing app shell. Fresh orgs have no
   *  wrapped_org_keys row until the seed-data setup calls devSeedOrgKey;
   *  only that setup should pass this. */
  readonly allowOrgKeyWait?: boolean;
}

export async function login(
  page: Page,
  username = DEV_USER,
  password = DEV_PASSWORD,
  options: LoginOptions = {},
): Promise<void> {
  // reauth=1 bypasses the session check that redirects to / if already logged in.
  // Without it, pages sharing a browser context reuse the previous session.
  await page.goto("/login?reauth=1");

  // Capture login response for diagnostics
  const loginResponsePromise = page.waitForResponse(
    (r) => r.url().includes("auth.login") && r.status() === 200,
  );

  const submitBtn = page.getByRole("button", { name: /sign in/i });
  await submitBtn.waitFor({ state: "visible", timeout: 15_000 });
  await page.locator('input[autocomplete="username"]').fill(username);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await submitBtn.click();

  const loginResponse = await loginResponsePromise.catch(() => null);
  if (loginResponse) {
    // Body content stays out of logs (PII rule); size is enough for flake
    // debugging.
    const responseBytes = (await loginResponse.text().catch(() => "")).length;
    console.log(`[login] response received (${String(responseBytes)} bytes)`);
  }

  // After credential submission, three outcomes:
  // 1. Redirect to /complete (first login, needs onboarding + 2FA enrollment)
  // 2. 2FA challenge shown inline on /login (returning user, TOTP enrolled)
  // 3. Redirect to / (no 2FA required, session already verified)
  // 4. Error alert (invalid credentials)

  const result = await Promise.race([
    page
      .waitForURL(/\/complete$/, { timeout: CRYPTO_TIMEOUT })
      .then(() => "onboarding" as const),
    page
      .waitForURL(/:\d+\/$/, { timeout: CRYPTO_TIMEOUT })
      .then(() => "done" as const),
    page
      .getByText(/verify your identity/i)
      .waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT })
      .then(() => "2fa-challenge" as const),
    page
      .locator('[role="alert"]')
      .waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT })
      .then(async () => {
        const text = await page.locator('[role="alert"]').textContent();
        throw new E2eError(`Login failed: ${text ?? "(no text)"}`);
      }),
  ]);

  console.log(`[login] race resolved: ${result}, url: ${page.url()}`);

  if (result === "onboarding") {
    await completeOnboarding(page);
  } else if (result === "2fa-challenge") {
    await completeTwofaChallenge(page);
    // 2FA may redirect to /complete if onboarding is still needed.
    if (page.url().endsWith("/complete")) {
      await completeOnboarding(page);
    }
  }
  // result === "done": already on /, nothing to do

  // Wait for the app shell to fully render. The URL reaching / is not
  // sufficient: the (app) layout gates AppShell behind isAuthenticated
  // (meQuery must resolve) and safety-net effects can briefly redirect
  // back to /login during the first render cycle.
  console.log(`[login] waiting for tablist. URL: ${page.url()}`);
  const shellWaits: Promise<"shell" | "org-key-wait">[] = [
    page
      .locator('[role="tablist"]')
      .waitFor({ state: "attached", timeout: CRYPTO_TIMEOUT })
      .then(() => "shell" as const),
  ];
  if (options.allowOrgKeyWait === true) {
    // Fresh org: no wrapped_org_keys row exists until devSeedOrgKey
    // runs, so the (app) layout shows the key-distribution gate instead
    // of the shell. Return and let the caller seed the key; the gate
    // polls getWrappedOrgKey every 5s and then renders the shell.
    shellWaits.push(
      page
        .getByRole("heading", { name: /waiting for key distribution/i })
        .waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT })
        .then(() => "org-key-wait" as const),
    );
  }
  const shellState = await Promise.race(shellWaits);
  console.log(`[login] shell wait resolved: ${shellState}`);
}

/**
 * Complete the post-login onboarding wizard on /complete.
 * Steps are conditional: briefing only if not yet seen, 2FA only if not enrolled.
 * The wizard nav renders Next/Confirm as Konsta Link elements in the navbar.
 */
async function completeOnboarding(page: Page): Promise<void> {
  // Wait for the onboarding content to load.
  await page.waitForTimeout(2_000);
  if (page.url().endsWith("/")) return;

  // Step 1: Security briefing (4 sub-pages, if present)
  // Heading: "How CARE-Y Protects Your Data"
  const briefingHeading = page.getByText("How CARE-Y Protects Your Data");
  if (await briefingHeading.isVisible({ timeout: 3_000 }).catch(() => false)) {
    // Click through 3 sub-pages via the wizard navbar's "Next" link.
    // The onboarding layout marks its navbar with role="banner".
    for (let i = 0; i < 3; i++) {
      await page.getByRole("banner").getByText("Next").click();
      await page.waitForTimeout(300);
    }
    // Last page: "Confirm"
    await page.getByRole("banner").getByText("Confirm").click();
    await page.waitForTimeout(1_000);
  }

  if (page.url().endsWith("/")) return;

  // Step 2: TOTP enrollment (if present)
  // Heading: "Set Up Two-Factor Authentication"
  const twofaHeading = page.getByText("Set Up Two-Factor Authentication");
  if (await twofaHeading.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await enrollTotp(page);

    // After enrollment, "Next" in the wizard navbar finishes onboarding
    await page.getByRole("banner").getByText("Next").click();
  }

  await page.waitForURL(/\/$/, { timeout: CRYPTO_TIMEOUT });
}

/**
 * Enroll TOTP during onboarding: select authenticator app, extract secret,
 * generate code, verify, and dismiss the backup codes sheet.
 */
async function enrollTotp(page: Page): Promise<void> {
  // Click the TOTP option in the enrollment list (ListItem renders as <a>)
  const totpOption = page
    .locator("a")
    .filter({ hasText: /authenticator app/i });
  await totpOption.first().waitFor({ state: "visible", timeout: 10_000 });
  await totpOption.first().click();

  // Wait for the TOTP setup sheet (shows QR code + base32 secret)
  const secretEl = page.locator('[data-testid="totp-secret"]');
  await secretEl.waitFor({ state: "visible", timeout: 10_000 });
  const secret = await secretEl.textContent();
  if (secret === null || secret === "")
    throw new E2eError("TOTP secret not found on page");

  saveTotpSecret(secret);

  // Generate and enter TOTP code
  const code = generateTotpCode(secret);
  const codeInput = page.getByPlaceholder("000000");
  await codeInput.waitFor({ state: "visible", timeout: 5_000 });
  await codeInput.fill(code);

  // The verify/save button is in the TOTP sheet header (SoftButton).
  // Multiple sheets exist in the DOM simultaneously; scope to the one
  // containing the authenticator-app title to avoid hitting a stale ref.
  const totpSheet = page.getByRole("dialog", {
    name: /authenticator app|scan this code/i,
  });
  const verifyBtn = totpSheet.getByRole("button", { name: /verify/i });
  await verifyBtn.click();

  // Backup codes appear after FIRST enrollment only. On re-runs against
  // an already-seeded org the user already has codes, so the sheet may
  // not appear. Anchor on the copy button, not the sheet title: on
  // desktop viewports ShellSheet renders as a ShellPopup whose navbar
  // title is a plain div, not a heading.
  const backupVisible = await page
    .getByRole("button", { name: /copy all codes/i })
    .waitFor({ state: "visible", timeout: 10_000 })
    .then(() => true)
    .catch(() => false);

  if (backupVisible) {
    await dismissBackupCodesSheet(page);
  }
}

/**
 * Dismiss the backup-codes sheet shown after the first TOTP enrollment.
 *
 * While codes are on screen the sheet routes every dismissal (Escape,
 * backdrop tap, swipe) through a "Save your codes" confirm dialog, so
 * closing it takes two steps: trigger a dismiss, then click "I saved
 * them". Shell overlays stay mounted when closed but go inert with
 * visibility: hidden, so their content is only reachable by role while
 * open. Shell overlay backdrops (ShellBackdrop) render only while an
 * overlay is open; zero backdrops means nothing swallows the caller's
 * next click.
 */
export async function dismissBackupCodesSheet(page: Page): Promise<void> {
  // The confirm-on-dismiss routing only applies once the codes have
  // loaded; wait for them so the flow is deterministic.
  await page
    .getByRole("button", { name: /copy all codes/i })
    .waitFor({ state: "visible", timeout: 10_000 });

  // Escape reaches the sheet's focus trap and opens the confirm dialog.
  await page.keyboard.press("Escape");

  // Closed shell dialogs are inert and hidden, so this only ever
  // resolves to the open confirm dialog's button.
  const confirmBtn = page.getByRole("button", { name: /i saved them/i });
  await confirmBtn.waitFor({ state: "visible", timeout: 5_000 });
  await confirmBtn.click();

  // Overlay backdrops exist in the DOM only while their overlay is
  // open. Zero backdrops means the navbar Next link is clickable again.
  await expect(page.locator('[data-testid="shell-backdrop"]')).toHaveCount(0, {
    timeout: 10_000,
  });
}

/**
 * Complete the inline 2FA challenge on the login page.
 * Reads the saved TOTP secret, generates a code, and verifies.
 */
async function completeTwofaChallenge(page: Page): Promise<void> {
  const secret = loadTotpSecret();
  // eslint-disable-next-line security/detect-possible-timing-attacks -- null check, not crypto comparison
  if (secret === null) {
    throw new E2eError(
      "2FA challenge shown but no TOTP secret found. " +
        "Run the seed-data setup first to enroll TOTP.",
    );
  }

  const code = generateTotpCode(secret);
  console.log(
    `[2fa] generated code: ${code} (secret: ${secret.slice(0, 4)}...)`,
  );

  // TOTP is the default (first enrolled method). Placeholder is "000000".
  const codeInput = page.getByPlaceholder("000000");
  await codeInput.waitFor({ state: "visible", timeout: 10_000 });
  await codeInput.fill(code);

  // Intercept the verify response to confirm server accepted the code
  const verifyResponsePromise = page.waitForResponse(
    (r) => r.url().includes("twoFactor") && r.status() === 200,
  );
  await page.getByRole("button", { name: /verify/i }).click();
  console.log("[2fa] clicked verify button");

  const verifyResp = await verifyResponsePromise.catch(() => null);
  if (verifyResp) {
    const responseBytes = (await verifyResp.text().catch(() => "")).length;
    console.log(
      `[2fa] verify response received (${String(responseBytes)} bytes)`,
    );
  } else {
    console.log("[2fa] no verify response intercepted");
  }

  // After verification, crypto pipeline runs and redirects to / or /complete.
  // Race against error state: if crypto fails, the page shows role="alert".
  console.log("[2fa] waiting for URL to reach /...");
  const postVerify = await Promise.race([
    page
      .waitForURL(/\/(complete)?$/, { timeout: CRYPTO_TIMEOUT })
      .then(() => "navigated" as const),
    page
      .locator('[role="alert"]')
      .waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT })
      .then(async () => {
        const text = await page.locator('[role="alert"]').textContent();
        return `error:${text ?? "(no text)"}` as const;
      }),
  ]);
  if (postVerify.startsWith("error:")) {
    throw new E2eError(`2FA crypto pipeline failed: ${postVerify.slice(6)}`);
  }
  console.log(`[2fa] reached /. URL: ${page.url()}`);
}

/** Navigate to the ticket list and open a ticket by its decrypted title. */
export async function openTicketByTitle(
  page: Page,
  title: string,
): Promise<void> {
  const currentUrl = page.url();
  if (!currentUrl.endsWith("/tickets")) {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");
  }

  const card = page.locator('[data-testid="ticket-card-wrap"]', {
    hasText: title,
  });

  await expect(card).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  // Each card exposes a single "Open <ticket> <alias>" overlay button.
  await card.getByRole("button", { name: /^open /i }).click();

  // On desktop, ticket detail opens in a split-view pane via pushState
  // (URL stays at /tickets). On mobile, it navigates to /tickets/{uuid}.
  // Wait for the chat log to appear in either case.
  await expect(page.locator('[role="log"]')).toBeVisible({
    timeout: CRYPTO_TIMEOUT,
  });
}

/**
 * Locate the compose-actions (+) button in the active ticket detail pane.
 *
 * On desktop split-view, two compose buttons exist in the accessibility
 * tree: one in the detail pane and one in the ReplySheet popup (inert,
 * below the viewport in the left pane). The detail pane's compose is
 * wrapped in a .detail-compose div (display: contents) which survives
 * regardless of whether the split-pane container is mounted.
 * On mobile, only one compose button exists, so page-level scope works.
 */
export async function getDetailComposeButton(page: Page): Promise<Locator> {
  const detailCompose = page.locator(".detail-compose");
  const scope = (await detailCompose.count()) > 0 ? detailCompose : page;
  return scope.getByRole("button", { name: /compose actions/i });
}

/**
 * Click the compose-actions (+) button and wait for the compose dialog.
 *
 * Dismisses residual backdrops from prior tests (serial suite state
 * leakage), then clicks the scoped compose button and waits for the
 * compose actions dialog.
 *
 * Returns the compose dialog locator for chaining (e.g., selecting a mode).
 */
export async function openComposeActions(page: Page): Promise<Locator> {
  // Dismiss any residual backdrops from prior tests.
  for (let i = 0; i < 3; i++) {
    const backdrop = page
      .locator(".shell-backdrop:not(.pointer-events-none)")
      .first();
    if (!(await backdrop.isVisible({ timeout: 500 }).catch(() => false))) break;
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  const btn = await getDetailComposeButton(page);

  // dispatchEvent bypasses Playwright's viewport boundary check. The
  // compose button sits at the viewport's bottom edge by design, and
  // Playwright's strict check can reject elements at the exact boundary.
  // Safe here because the handler uses e.currentTarget (the element)
  // as the popover anchor, not mouse coordinates.
  await btn.dispatchEvent("click");

  const dialog = page.getByRole("dialog", { name: /compose actions/i });
  await expect(dialog).toBeVisible({ timeout: 3_000 });
  return dialog;
}

// ── Production UI helpers for data creation ──────────────────────────

export interface CreateTicketOptions {
  title: string;
  queue: string;
  priority?: "low" | "normal" | "high" | "urgent";
  description?: string;
}

/**
 * Return to /tickets after a collision redirect landed on a ticket
 * detail view. Desktop redirects /tickets/[id] back to /tickets on its
 * own (deep-link handling in the [id] page), so first give the URL a
 * moment to settle. Mobile stays on the detail view, where the navbar
 * Back button returns to the list.
 */
async function returnToTicketList(page: Page): Promise<void> {
  const settled = await expect(page)
    .toHaveURL("/tickets", { timeout: 3_000 })
    .then(() => true)
    .catch(() => false);
  if (settled) return;

  const backBtn = page.getByRole("button", { name: /back/i });
  if (await backBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await backBtn.click();
  } else {
    await page.getByRole("tab", { name: "Tickets" }).click();
  }
  await expect(page).toHaveURL("/tickets", { timeout: 10_000 });
}

/**
 * Create a ticket through the production new-ticket form.
 * Opens the sheet from the /tickets navbar, selects a client, fills the
 * form, submits, and waits for the list refetch. Exercises the full
 * crypto pipeline (CryptoBridge encrypts title/description in the Web
 * Worker). Retries with a different client when the selected one already
 * has an open ticket (client-side collision redirect or server 409).
 */
export async function createTicket(
  page: Page,
  opts: CreateTicketOptions,
): Promise<void> {
  // Navigate via SPA to avoid full reload which resets crypto Worker state.
  if (!page.url().includes("/tickets")) {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets", { timeout: 10_000 });
  }

  // Open the new-ticket sheet via the navbar button.
  const newTicketBtn = page.getByRole("button", { name: /new ticket/i });
  await newTicketBtn.waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT });
  await newTicketBtn.click();

  // Wait for the new-ticket sheet to open.
  const sheet = page.getByRole("dialog", { name: "New Ticket" });
  await expect(sheet).toBeVisible({ timeout: 15_000 });

  // Select client, fill form, and submit. Retries with a different client
  // if the search term has no matches, the submit preflight redirects to
  // the client's existing open ticket, or the server returns 409
  // (TICKET_ALREADY_OPEN).
  let needsFormFill = true;
  const maxAttempts = CLIENT_SEARCH_TERMS.length;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Ensure the sheet is open before each attempt.
    if (!(await sheet.isVisible({ timeout: 500 }).catch(() => false))) {
      await newTicketBtn.click();
      await expect(sheet).toBeVisible({ timeout: 15_000 });
      needsFormFill = true;
    }

    // Search for a client. Try the next term if no results appear.
    const searchTerm =
      CLIENT_SEARCH_TERMS.at(
        clientSearchIndex++ % CLIENT_SEARCH_TERMS.length,
      ) ?? "azure-";
    const clientInput = sheet.getByPlaceholder(/search by alias/i);
    await clientInput.click();
    await clientInput.fill("");
    await clientInput.pressSequentially(searchTerm, { delay: 30 });

    // Short wait for search results. If none appear, try the next term.
    // Scope to the dialog to avoid matching results in closed Konsta overlays.
    const firstResult = sheet.locator("[data-testid='client-result']").first();
    const resultsAppeared = await firstResult
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (!resultsAppeared) {
      console.log(
        `[createTicket] no results for "${searchTerm}" (attempt ${String(attempt + 1)}), trying next term`,
      );
      continue;
    }

    // Click the first result to select it.
    await firstResult.click();
    await expect(firstResult).not.toBeVisible({ timeout: 3_000 });

    // Wait for the selected alias to appear (confirms selection stuck).
    const aliasShown = await sheet
      .getByText(/^[a-z]+-[a-z]+-\d+$/)
      .first()
      .waitFor({ state: "visible", timeout: 3_000 })
      .then(() => true)
      .catch(() => false);
    if (!aliasShown) {
      console.log(
        `[createTicket] selection didn't stick for "${searchTerm}" (attempt ${String(attempt + 1)}), retrying`,
      );
      continue;
    }

    // Fill form fields on first attempt and after sheet reopens (fields reset).
    if (needsFormFill) {
      await sheet.getByPlaceholder(/brief description/i).fill(opts.title);
      if (opts.description != null) {
        await sheet.getByPlaceholder(/details/i).fill(opts.description);
      }
      if (opts.priority && opts.priority !== "normal") {
        await sheet
          .locator("li")
          .filter({ hasText: /priority/i })
          .locator("select")
          .selectOption(opts.priority);
      }
      const queueSelect = sheet
        .locator("li")
        .filter({ hasText: /queue/i })
        .locator("select");
      await queueSelect
        .locator(`option:text("${opts.queue}")`)
        .waitFor({ state: "attached", timeout: 10_000 });
      await queueSelect.selectOption({ label: opts.queue });
      needsFormFill = false;
    }

    // Blur combobox and let effects settle.
    await sheet.getByPlaceholder(/brief description/i).click();
    await page.waitForTimeout(300);

    // Watch for the tickets.create response (409 means retry), and also
    // capture the tickets.list refetch triggered by invalidateQueries on
    // success. All listeners must start BEFORE the click so no signal
    // slips past.
    const responsePromise = page
      .waitForResponse(
        (r) =>
          r.url().includes("tickets.create") && r.request().method() === "POST",
        { timeout: CRYPTO_TIMEOUT },
      )
      .catch(() => null);

    // Submit preflights resolveCreateTarget. When the selected client
    // already has an open ticket, no tickets.create request is sent at
    // all: the sheet closes and the app navigates to that open ticket
    // (collision redirect). The URL change is the only observable signal
    // on that path.
    const collisionPromise = page
      .waitForURL(/\/tickets\/[0-9a-f-]{36}$/, { timeout: CRYPTO_TIMEOUT })
      .then(() => "collision" as const)
      .catch(() => null);

    const listRefetchPromise = page
      .waitForResponse(
        (r) =>
          r.url().includes("tickets.list") &&
          r.request().method() === "POST" &&
          r.status() === 200,
        { timeout: CRYPTO_TIMEOUT },
      )
      .catch(() => null);

    const submitBtn = sheet.getByRole("button", { name: /create ticket/i });
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    const outcome = await Promise.race([responsePromise, collisionPromise]);

    if (outcome === "collision") {
      console.log(
        `[createTicket] collision redirect for "${searchTerm}" (attempt ${String(attempt + 1)}), returning to list and retrying`,
      );
      await returnToTicketList(page);
      continue;
    }

    if (outcome?.status() !== 409) {
      await expect(sheet).not.toBeVisible({ timeout: CRYPTO_TIMEOUT });
      await listRefetchPromise;
      return;
    }

    // 409: client already has an open ticket. Retry with a different client.
    console.log(
      `[createTicket] 409 on attempt ${String(attempt + 1)}, retrying`,
    );
    await page.waitForTimeout(1_000);
  }

  // All retries exhausted. Dismiss the sheet so subsequent tests don't
  // start with a stale overlay, then fail with a clear message.
  await page.keyboard.press("Escape");
  await sheet
    .waitFor({ state: "hidden", timeout: 5_000 })
    .catch(() => undefined);
  throw new E2eError(
    `createTicket exhausted ${String(maxAttempts)} retries. All matched clients already have open tickets.`,
  );
}

// Rotate through adjective prefixes to find clients without open tickets.
// With 120 clients drawn from 83 adjectives (~1.4 per adjective), any
// single term may not match. Use many full-adjective terms to maximize
// coverage. PID offset separates parallel workers.
const CLIENT_SEARCH_TERMS = [
  "azure-",
  "ivory-",
  "fleet-",
  "plush-",
  "proud-",
  "swift-",
  "bright-",
  "smooth-",
  "coral-",
  "opal-",
  "merry-",
  "rosy-",
  "snowy-",
  "jolly-",
  "noble-",
  "serene-",
  "humble-",
  "vivid-",
  "teal-",
  "sunny-",
  "steady-",
  "silver-",
  "sandy-",
  "lucid-",
  "dusky-",
  "early-",
  "gentle-",
  "solar-",
  "stone-",
  "open-",
];
let clientSearchIndex = process.pid % CLIENT_SEARCH_TERMS.length;

/**
 * Close any open split-view detail pane so the list gets full width.
 * Without this, the narrow list pane may not render all cards in the
 * virtual scroll window.
 */
async function closeSplitDetail(page: Page): Promise<void> {
  const closeBtn = page.getByRole("button", { name: /close detail/i });
  if (await closeBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await closeBtn.click();
    await closeBtn
      .waitFor({ state: "hidden", timeout: 3_000 })
      .catch(() => undefined);
  }
}

/**
 * Scroll the ticket list until a ticket with the given title is visible.
 * The VirtualList only renders items in the scroll viewport, so cards
 * below the fold aren't in the DOM until scrolled into view.
 */
async function scrollToTicket(page: Page, title: string): Promise<void> {
  const target = page.getByText(title).first();
  const scrollContainer = page.locator('[role="main"]');
  for (let attempt = 0; attempt < 10; attempt++) {
    if (await target.isVisible({ timeout: 500 }).catch(() => false)) return;
    await scrollContainer.evaluate((el) => {
      el.scrollBy(0, 300);
    });
    await page.waitForTimeout(200);
  }
  await expect(target).toBeVisible({ timeout: CRYPTO_TIMEOUT });
}

/**
 * Switch ticket list to "Cards" view mode. Action buttons (Take, Hold, Reply,
 * Call) only render in cards mode; compact list/table omit them.
 */
async function ensureCardsView(page: Page): Promise<void> {
  await closeSplitDetail(page);
  const cardsBtn = page.getByRole("button", { name: "Cards" });
  const pressed = await cardsBtn.getAttribute("aria-pressed");
  if (pressed !== "true") {
    await cardsBtn.click();
    await page
      .locator('[data-testid="card-actions"]')
      .first()
      .waitFor({ state: "visible", timeout: 10_000 });
  }
}

/**
 * Assign a ticket to self via the "Take" card action button on the ticket list.
 * Unassigned tickets show a one-tap "Take" button (no sheet, no crypto).
 * Requires "cards" view mode since action buttons only render there.
 */
export async function assignTicketToSelf(
  page: Page,
  title: string,
): Promise<void> {
  if (!page.url().includes("/tickets")) {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");
  }

  await ensureCardsView(page);
  await scrollToTicket(page, title);

  const card = page
    .locator('[data-testid="ticket-card-wrap"]', {
      hasText: title,
    })
    .first();
  await card.getByRole("button", { name: /take/i }).click();

  // Wait for the assignment to complete. Self-assignment renders the
  // literal assignee text "you" in the card's meta row.
  await expect(card.getByText("you", { exact: true })).toBeVisible({
    timeout: CRYPTO_TIMEOUT,
  });
}

/**
 * Put a ticket on hold via the card action button on the ticket list.
 * Requires "cards" view mode since action buttons only render there.
 */
export async function putTicketOnHold(
  page: Page,
  title: string,
): Promise<void> {
  if (!page.url().includes("/tickets")) {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");
  }

  await ensureCardsView(page);
  await scrollToTicket(page, title);

  const card = page
    .locator('[data-testid="ticket-card-wrap"]', {
      hasText: title,
    })
    .first();
  await card.getByRole("button", { name: /hold/i }).click();

  await page.waitForTimeout(1_000);
}

/** Navigate to /library/new via SPA tab + navbar button. Avoids full reload. */
export async function navigateToNewArticle(page: Page): Promise<void> {
  if (!page.url().includes("/library")) {
    await page.getByRole("tab", { name: /library/i }).click();
    await expect(page).toHaveURL("/library", { timeout: 10_000 });
  }
  const navNewBtn = page.getByRole("button", { name: /new article/i });
  await navNewBtn.waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT });
  // WebKit SPA navigations can leave click handlers unattached briefly
  // after the element is visible. A short wait lets the $effect that
  // wires onclick settle.
  await page.waitForTimeout(500);
  await navNewBtn.click();
  await expect(page).toHaveURL("/library/new", { timeout: 10_000 });
  await expect(page.getByText("New Article")).toBeVisible({ timeout: 10_000 });
}

export interface CreateKbArticleOptions {
  title: string;
  category: string;
  body?: string;
}

/**
 * Create a KB article through the production /library/new editor.
 * Fills title, selects category, types body, and publishes.
 */
export async function createKbArticle(
  page: Page,
  opts: CreateKbArticleOptions,
): Promise<void> {
  await navigateToNewArticle(page);

  // Fill title.
  await page.getByPlaceholder("Article title").fill(opts.title);

  // Select category.
  const catRow = page.getByText("Select category");
  await catRow.click();
  await expect(page.getByText(opts.category).last()).toBeVisible({
    timeout: 5_000,
  });
  await page.getByText(opts.category).last().click();

  // Type body content in the ProseMirror editor.
  const editor = page.locator("[role='textbox'][aria-multiline='true']");
  await editor.click();
  await page.keyboard.type(opts.body ?? `Content for ${opts.title}`);

  // Blur editor so Publish button is accessible.
  await page.getByPlaceholder("Article title").click();

  // Publish.
  const publishBtn = page.getByRole("button", { name: "Publish" });
  await expect(publishBtn).toBeVisible({ timeout: 5_000 });
  await publishBtn.click();

  // Wait for navigation back to library.
  await expect(page).toHaveURL("/library", { timeout: 15_000 });
}

/**
 * Simulates a long-press gesture (pointerdown then hold 600ms then pointerup).
 * Matches the 500ms threshold in TicketDetail's startLongPress + margin.
 */
export async function longPress(
  page: Page,
  locator: ReturnType<Page["locator"]>,
): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new E2eError("Element not found for long-press");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
}

/**
 * The one home for axe rule suppressions. Every entry is a documented
 * Konsta/shell gap that fires under the WCAG tag set; page-specific
 * suppressions go through AuditA11yOptions.disableRules at the call site
 * with a reason, never here.
 *
 * Best-practice-only rules that older per-spec audits disabled
 * (aria-dialog-name, page-has-heading-one, landmark-unique,
 * landmark-one-main) do not run under the WCAG tags at all, and closed
 * overlay portals are inert + visibility: hidden, so axe never evaluates
 * them (verified against axe-core 4.12).
 */
const SHARED_AXE_DISABLES: readonly string[] = [
  // DesktopSidebar's tablist wraps each tab in a row div beside a non-tab
  // chevron button; the grouping is deliberate shell structure.
  "aria-required-children",
  // Konsta internals set aria attributes on elements whose role prohibits
  // them (upstream library markup).
  "aria-prohibited-attr",
  // Konsta Page's main scroll container has no tabindex (shell-owned).
  "scrollable-region-focusable",
  // Konsta ListInput renders visual labels without for/id association,
  // leaving inputs unlabeled to this rule.
  "label",
  // Same ListInput gap for <select> elements.
  "select-name",
  // Konsta List renders <li> inside styled <div> wrappers.
  "listitem",
];

export interface AuditA11yOptions {
  /** Restrict the audit to one selector (AxeBuilder.include). */
  readonly include?: string;
  /** Extra selectors to exclude; pair each call-site entry with a reason. */
  readonly exclude?: readonly string[];
  /** Extra rule ids to disable; pair each call-site entry with a reason. */
  readonly disableRules?: readonly string[];
}

/**
 * Shared axe audit: full WCAG 2.2 AA tag set, the single suppression list
 * above, and the standard excludes (#splash is aria-hidden but still
 * trips contrast; [inert] marks closed overlay portals). Legacy mode is
 * kept because most suites share a browser.newPage() page, which axe's
 * cross-context injection cannot target.
 */
export async function auditA11y(
  page: Page,
  opts: AuditA11yOptions = {},
): Promise<void> {
  let builder = new AxeBuilder({ page })
    .setLegacyMode(true)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .exclude("#splash")
    .exclude("[inert]")
    .disableRules([...SHARED_AXE_DISABLES, ...(opts.disableRules ?? [])]);
  if (opts.include !== undefined) {
    builder = builder.include(opts.include);
  }
  for (const selector of opts.exclude ?? []) {
    builder = builder.exclude(selector);
  }
  const results = await builder.analyze();
  expect(results.violations).toEqual([]);
}
