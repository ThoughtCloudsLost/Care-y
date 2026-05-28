import { expect, type Page } from "@playwright/test";
import { createHmac } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/** Crypto pipeline timeout: Argon2id + OPRF + ECIES + Worker decryption. */
export const CRYPTO_TIMEOUT = 60_000;

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
 * Log in via the login page and complete the full production auth flow.
 *
 * First login: credentials → crypto pipeline → redirect to /complete →
 *   security briefing (4 pages) → TOTP enrollment → backup codes → dashboard.
 *   TOTP secret is saved to .auth/totp-secret.txt for subsequent logins.
 *
 * Subsequent logins: credentials → inline 2FA challenge on /login →
 *   enter TOTP code (read secret from file) → crypto pipeline → dashboard.
 */
export async function login(
  page: Page,
  username = DEV_USER,
  password = DEV_PASSWORD,
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
    const body = await loginResponse.text().catch(() => "");
    console.log(`[login] response (first 300): ${body.slice(0, 300)}`);
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
        throw new Error(`Login failed: ${text ?? "(no text)"}`);
      }),
  ]);

  console.log(`[login] race resolved: ${result}, url: ${page.url()}`);

  if (result === "onboarding") {
    await completeOnboarding(page);
  } else if (result === "2fa-challenge") {
    await completeTwofaChallenge(page);
  }
  // result === "done": already on /, nothing to do

  // Wait for the app shell to fully render. The URL reaching / is not
  // sufficient: the (app) layout gates AppShell behind isAuthenticated
  // (meQuery must resolve) and safety-net effects can briefly redirect
  // back to /login during the first render cycle.
  console.log(`[login] waiting for tablist. URL: ${page.url()}`);
  await page.locator('[role="tablist"]').waitFor({
    state: "attached",
    timeout: CRYPTO_TIMEOUT,
  });
  console.log("[login] tablist found, login complete");
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
    // Click through 3 sub-pages via navbar "Next" link
    for (let i = 0; i < 3; i++) {
      await page.locator(".k-navbar").getByText("Next").click();
      await page.waitForTimeout(300);
    }
    // Last page: "Confirm"
    await page.locator(".k-navbar").getByText("Confirm").click();
    await page.waitForTimeout(1_000);
  }

  if (page.url().endsWith("/")) return;

  // Step 2: TOTP enrollment (if present)
  // Heading: "Set Up Two-Factor Authentication"
  const twofaHeading = page.getByText("Set Up Two-Factor Authentication");
  if (await twofaHeading.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await enrollTotp(page);

    // After enrollment, "Next" in navbar finishes onboarding
    await page.locator(".k-navbar").getByText("Next").click();
  }

  await page.waitForURL(/\/$/, { timeout: 15_000 });
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
  const secretEl = page.locator(".secret-text");
  await secretEl.waitFor({ state: "visible", timeout: 10_000 });
  const secret = await secretEl.textContent();
  if (secret === null || secret === "")
    throw new Error("TOTP secret not found on page");

  saveTotpSecret(secret);

  // Generate and enter TOTP code
  const code = generateTotpCode(secret);
  const codeInput = page.getByPlaceholder("000000");
  await codeInput.waitFor({ state: "visible", timeout: 5_000 });
  await codeInput.fill(code);

  // The verify/save button is in the sheet header (SoftButton)
  const verifyBtn = page.locator(".sheet-header-action").getByText(/verify/i);
  await verifyBtn.click();

  // Backup codes sheet appears after first enrollment.
  // Target the sheet heading specifically to avoid matching body text.
  const backupHeading = page.getByRole("heading", { name: /backup codes/i });
  await backupHeading.waitFor({ state: "visible", timeout: 10_000 });

  // Dismiss the sheet. Retry Escape in a loop because the sheet's open
  // animation may still be running, absorbing the first keypress.
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Escape");
    const hidden = await backupHeading
      .waitFor({ state: "hidden", timeout: 1_000 })
      .then(() => true)
      .catch(() => false);
    if (hidden) break;
  }
}

/**
 * Complete the inline 2FA challenge on the login page.
 * Reads the saved TOTP secret, generates a code, and verifies.
 */
async function completeTwofaChallenge(page: Page): Promise<void> {
  const secret = loadTotpSecret();
  // eslint-disable-next-line security/detect-possible-timing-attacks -- null check, not crypto comparison
  if (secret === null) {
    throw new Error(
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
    const body = await verifyResp.text().catch(() => "(read error)");
    console.log(`[2fa] verify response: ${body.slice(0, 200)}`);
  } else {
    console.log("[2fa] no verify response intercepted");
  }

  // After verification, crypto pipeline runs and redirects to /
  console.log("[2fa] waiting for URL to reach /...");
  await page.waitForURL(/\/$/, { timeout: CRYPTO_TIMEOUT });
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

  await expect(page.getByText(title)).toBeVisible({
    timeout: CRYPTO_TIMEOUT,
  });

  const card = page.locator('[data-testid="ticket-card-wrap"]', {
    hasText: title,
  });
  const inner = card.locator('[data-testid="card-inner"]');

  await inner.click();

  await expect(page).toHaveURL(/\/tickets\/[0-9a-f-]{36}/, {
    timeout: 10_000,
  });
  await expect(page.locator('[role="log"]')).toBeVisible({
    timeout: CRYPTO_TIMEOUT,
  });
}

// ── Production UI helpers for data creation ──────────────────────────

export interface CreateTicketOptions {
  title: string;
  queue: string;
  priority?: "low" | "normal" | "high" | "urgent";
  description?: string;
}

/**
 * Create a ticket through the production new-ticket form.
 * Navigates to /tickets?action=new-ticket, fills the form, submits,
 * and waits for the success toast. Exercises the full crypto pipeline
 * (CryptoBridge encrypts title/description in the Web Worker).
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

  // Select a client: type in the search field and pick the first result.
  const clientInput = sheet.getByPlaceholder(/search by alias/i);
  await clientInput.fill("a");
  const firstResult = sheet.locator("[data-testid='client-result']").first();
  await firstResult.waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT });
  await firstResult.click();

  // Fill title (required).
  await sheet.getByLabel(/title/i).fill(opts.title);

  // Fill description (optional).
  if (opts.description != null) {
    await sheet.getByLabel(/description/i).fill(opts.description);
  }

  // Select priority if not default.
  if (opts.priority && opts.priority !== "normal") {
    await sheet.getByLabel(/priority/i).selectOption(opts.priority);
  }

  // Select queue (required). Queue names are decrypted from org key.
  await sheet.getByLabel(/queue/i).selectOption({ label: opts.queue });

  // Submit.
  const submitBtn = sheet.getByRole("button", { name: /create ticket/i });
  await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
  await submitBtn.click();

  // Wait for the success toast and sheet to close.
  await expect(page.getByText(/ticket created/i)).toBeVisible({
    timeout: CRYPTO_TIMEOUT,
  });
  await expect(sheet).not.toBeVisible({ timeout: 5_000 });
}

/**
 * Assign a ticket to self via the card action button on the ticket list.
 * The "Assign" button triggers the take/assign flow.
 */
export async function assignTicketToSelf(
  page: Page,
  title: string,
): Promise<void> {
  if (!page.url().includes("/tickets")) {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");
  }

  await expect(page.getByText(title)).toBeVisible({ timeout: CRYPTO_TIMEOUT });

  const card = page.locator('[data-testid="ticket-card-wrap"]', {
    hasText: title,
  });
  await card.getByRole("button", { name: /assign/i }).click();

  // Wait for assignment to reflect (card should update).
  await page.waitForTimeout(1_000);
}

/**
 * Put a ticket on hold via the card action button on the ticket list.
 */
export async function putTicketOnHold(
  page: Page,
  title: string,
): Promise<void> {
  if (!page.url().includes("/tickets")) {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");
  }

  await expect(page.getByText(title)).toBeVisible({ timeout: CRYPTO_TIMEOUT });

  const card = page.locator('[data-testid="ticket-card-wrap"]', {
    hasText: title,
  });
  await card.getByRole("button", { name: /hold/i }).click();

  await page.waitForTimeout(1_000);
}

/** Navigate to /library/new via SPA tab + navbar button. Avoids full reload. */
export async function navigateToNewArticle(page: Page): Promise<void> {
  if (!page.url().includes("/library")) {
    await page.getByRole("tab", { name: /knowledge base/i }).click();
    await expect(page).toHaveURL("/library", { timeout: 10_000 });
  }
  const navNewBtn = page.getByRole("button", { name: /new article/i });
  await navNewBtn.waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT });
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
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element not found for long-press");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
}
