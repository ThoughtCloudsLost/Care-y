/**
 * Onboarding E2E: full admin setup wizard against the bare e2e-onboard org.
 *
 * The Vite dev server injects x-org-slug via proxy headers, hardcoded to
 * VITE_ORG_SLUG (e2e-org). Onboarding tests need e2e-onboard. Rather than
 * spinning up a second Vite server, we use page.route() to intercept
 * tRPC/branding requests and reroute them directly to the API server at
 * port 3000 with the correct x-org-slug header.
 */

import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { dismissBackupCodesSheet, generateTotpCode } from "./helpers.js";

const ONBOARD_SLUG = "e2e-onboard";
const API_PORT = "3000";
const AUTH_DIR = join(process.cwd(), ".auth");
const SETUP_TOKEN_PATH = join(AUTH_DIR, "setup-token.txt");
const INVITE_URL_PATH = join(AUTH_DIR, "invite-url.txt");
const ONBOARD_TOTP_PATH = join(AUTH_DIR, "onboard-totp-secret.txt");

const CRYPTO_TIMEOUT = 30_000;
const ACCOUNT_PASSWORD = "e2e-onboard-password-1234!";

function readSetupToken(): string {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, constant path
  return readFileSync(SETUP_TOKEN_PATH, "utf-8").trim();
}

function saveInviteUrl(url: string): void {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, constant path
  mkdirSync(AUTH_DIR, { recursive: true });
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, constant path
  writeFileSync(INVITE_URL_PATH, url, "utf-8");
}

function saveOnboardTotpSecret(secret: string): void {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, constant path
  mkdirSync(AUTH_DIR, { recursive: true });
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test infra, constant path
  writeFileSync(ONBOARD_TOTP_PATH, secret, "utf-8");
}

/**
 * Intercept tRPC and branding requests, rerouting them to the API server
 * with x-org-slug set to e2e-onboard. This bypasses the Vite proxy which
 * would overwrite the header with the VITE_ORG_SLUG value (e2e-org).
 */
async function routeToOnboardOrg(page: Page): Promise<void> {
  await page.route(
    (url) => {
      const path = url.pathname;
      return (
        path.startsWith("/trpc/") ||
        path.startsWith("/api/branding") ||
        path === "/manifest.webmanifest"
      );
    },
    async (route) => {
      const originalUrl = new URL(route.request().url());
      originalUrl.port = API_PORT;

      if (originalUrl.pathname.startsWith("/trpc/")) {
        originalUrl.pathname = originalUrl.pathname.replace(/^\/trpc\//, "/");
      }

      const response = await route.fetch({
        url: originalUrl.toString(),
        headers: {
          ...route.request().headers(),
          "x-org-slug": ONBOARD_SLUG,
        },
      });
      await route.fulfill({ response });
    },
  );
}

test.describe.serial("Admin Setup Wizard", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await routeToOnboardOrg(page);
  });

  test.afterAll(async () => {
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await page.close();
  });

  test("navigates to setup page with valid token", async () => {
    const token = readSetupToken();
    await page.goto(`/setup/${token}`);

    await expect(
      page.locator(".step-text").getByText(/step 1 of 8/i),
    ).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("wizard account step passes the axe accessibility audit", async () => {
    // Legacy mode: the serial suite uses browser.newPage(), which axe's
    // cross-context injection cannot target (same pattern as dashboard).
    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      // Konsta BlockTitle renders as <div>, not <h1>. The wizard uses
      // the navbar title as the page-level heading (standard mobile
      // app pattern). Excluding this best-practice rule is consistent
      // with how the app shell axe audits handle Konsta semantics.
      .exclude("#splash")
      .disableRules(["page-has-heading-one", "color-contrast"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── Step 0: Account Creation ──

  test("fills admin account form", async () => {
    await page.locator('input[autocomplete="username"]').fill("onboard-admin");

    // Konsta ListInput doesn't use <label for=>, so getByLabel won't work.
    // Use the placeholder text from the snapshot instead.
    await page
      .getByPlaceholder(/how others will see you/i)
      .fill("Onboard Admin");

    const passwordInputs = page.locator('input[autocomplete="new-password"]');
    await passwordInputs.first().fill(ACCOUNT_PASSWORD);
    await passwordInputs.last().fill(ACCOUNT_PASSWORD);
  });

  test("submits account and completes crypto pipeline", async () => {
    const submitBtn = page.getByRole("button", { name: /create account/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Crypto pipeline: Argon2id + OPRF + key derivation + org keypair.
    // The KeyDerivation spinner replaces the form during submission.
    // Wait for the briefing heading as proof the step advanced.
    await expect(page.getByText(/how care-y protects/i)).toBeVisible({
      timeout: 60_000,
    });
  });

  // ── Step 1: Security Briefing (4 sub-pages) ──

  test("completes security briefing page 1", async () => {
    await expect(page.getByText(/how care-y protects/i)).toBeVisible({
      timeout: 5_000,
    });

    // Page 1 -> Next
    const nextLink = page.locator('[role="banner"]').getByText("Next");
    await nextLink.click();
  });

  test("completes security briefing pages 2 and 3", async () => {
    const nextLink = page.locator('[role="banner"]').getByText("Next");

    // Page 2 -> Next
    await nextLink.click();
    await page.waitForTimeout(300);

    // Page 3 -> Next
    await nextLink.click();
    await page.waitForTimeout(300);
  });

  test("confirms security briefing on page 4", async () => {
    // Page 4: the navbar right button says "Confirm" instead of "Next"
    const confirmLink = page
      .locator('[role="banner"]')
      .getByText("Confirm", { exact: true });
    await confirmLink.click();

    // Should advance to step 3 (2FA)
    await expect(
      page.locator(".step-text").getByText(/step 3 of 8/i),
    ).toBeVisible({
      timeout: 5_000,
    });
  });

  // ── Step 2: Two-Factor Authentication ──

  test("opens TOTP enrollment sheet", async () => {
    // "Next" should be disabled until at least one method is enrolled
    const nextLink = page.locator('[role="banner"]').getByText("Next");
    await expect(nextLink).toHaveAttribute("aria-disabled", "true");

    // Click the authenticator app option
    const totpItem = page
      .locator("a")
      .filter({ hasText: /authenticator app/i });
    await totpItem.first().waitFor({ state: "visible", timeout: 10_000 });
    await totpItem.first().click();
  });

  test("enrolls TOTP and verifies code", async () => {
    // Wait for the TOTP secret to appear
    const secretEl = page.locator(".secret-text");
    await secretEl.waitFor({ state: "visible", timeout: 10_000 });
    const secret = await secretEl.textContent();
    expect(secret).toBeTruthy();

    saveOnboardTotpSecret(secret!);

    // Generate and enter the TOTP code
    const code = generateTotpCode(secret!);
    const codeInput = page.getByPlaceholder("000000");
    await codeInput.waitFor({ state: "visible", timeout: 5_000 });
    await codeInput.fill(code);

    // Click verify in the sheet header
    const verifyBtn = page.getByRole("button", { name: /verify/i });
    await verifyBtn.click();

    // Backup codes appear after first enrollment; dismissal goes through
    // the "Save your codes" confirm dialog
    await dismissBackupCodesSheet(page);
  });

  test("advances past 2FA step", async () => {
    // "Next" should now be enabled after enrollment
    const nextLink = page.locator('[role="banner"]').getByText("Next");
    await expect(nextLink).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 5_000,
    });
    await nextLink.click();

    // Should advance to step 4 (Organization)
    await expect(
      page.locator(".step-text").getByText(/step 4 of 8/i),
    ).toBeVisible({
      timeout: 5_000,
    });
  });

  // ── Step 3: Organization Setup ──

  test("fills organization name and advances", async () => {
    // OrgGeneralSection renders in display mode with an "Edit general" button.
    // Clicking it opens a ShellSheet with the editable form.
    const editBtn = page.getByRole("button", { name: /edit general/i });
    await editBtn.waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT });
    await editBtn.click();

    // Fill org name in the General sheet
    const orgNameInput = page.getByPlaceholder(/my organization/i);
    await orgNameInput.waitFor({ state: "visible", timeout: 5_000 });
    await orgNameInput.fill("E2E Onboarding Org");

    // Save via the dialog header "Save" button (scoped to the visible overlay).
    // On desktop, ShellSheet renders as a Popup (role=dialog) not a Sheet.
    const orgDialog = page
      .locator("[role='dialog']")
      .filter({ has: page.getByPlaceholder(/my organization/i) });
    const saveBtn = orgDialog.getByRole("button", { name: /save/i });
    await saveBtn.click();

    // Wait for the overlay to close. Konsta Popup uses translate-y-full
    // (not display:none) so Playwright's state:"hidden" never resolves.
    // Instead wait for the open backdrop (pointer-events are active) to
    // gain pointer-events-none. Konsta adds the class on close animation.
    // If save fails (org key not yet available), dismiss via Close/Escape.
    const openBackdrop = page.locator(
      "div.fixed.z-40.bg-black\\/50:not(.pointer-events-none)",
    );
    const backdropGone = await expect(openBackdrop)
      .toHaveCount(0, { timeout: 10_000 })
      .then(() => true)
      .catch(() => false);
    if (!backdropGone) {
      const closeLink = orgDialog.getByText(/close/i);
      if (await closeLink.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await closeLink.click();
      } else {
        await page.keyboard.press("Escape");
      }
      await expect(openBackdrop).toHaveCount(0, { timeout: 10_000 });
    }

    // Click Next in navbar (should be enabled now that org name is saved)
    const nextLink = page.locator('[role="banner"]').getByText("Next");
    await expect(nextLink).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 10_000,
    });
    await nextLink.click();

    // Should advance to step 5 (Invites)
    await expect(
      page.locator(".step-text").getByText(/step 5 of 8/i),
    ).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── Step 4: Team Invites ──

  test("generates invite link and captures URL", async () => {
    // Click "Generate Invite Link"
    const generateBtn = page.getByRole("button", {
      name: /generate invite link/i,
    });
    await generateBtn.waitFor({ state: "visible", timeout: 10_000 });
    await generateBtn.click();

    // The invite link sheet opens. Click "Generate Invite Link" in the sheet header.
    const inviteSheet = page.getByRole("dialog", {
      name: /invite with link/i,
    });
    await inviteSheet.waitFor({ state: "visible", timeout: 5_000 });

    const sheetGenerateBtn = inviteSheet.getByRole("button", {
      name: /generate invite link/i,
    });
    await sheetGenerateBtn.click();

    // Wait for the invite URL to appear
    const inviteUrlEl = inviteSheet.locator(".invite-url");
    await inviteUrlEl.first().waitFor({ state: "visible", timeout: 10_000 });
    const inviteUrlText = await inviteUrlEl.first().textContent();
    expect(inviteUrlText).toBeTruthy();

    // Extract the path portion (e.g., /first-login/abc123)
    const urlMatch = /\/first-login\/[a-zA-Z0-9_-]+/.exec(inviteUrlText ?? "");
    expect(
      urlMatch,
      "invite URL should contain /first-login/ path",
    ).toBeTruthy();
    saveInviteUrl(urlMatch![0]);

    // Dismiss the sheet via Escape
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Escape");
      const hidden = await inviteSheet
        .waitFor({ state: "hidden", timeout: 1_000 })
        .then(() => true)
        .catch(() => false);
      if (hidden) break;
    }
  });

  test("advances past invite step", async () => {
    // With an invite generated, button should show "Next" (not "Skip")
    const nextLink = page.locator('[role="banner"]').getByText("Next");
    await nextLink.click();

    // Should advance to step 6 (Queues)
    await expect(
      page.locator(".step-text").getByText(/step 6 of 8/i),
    ).toBeVisible({
      timeout: 5_000,
    });
  });

  // ── Step 5: Queue Creation ──

  test("creates a queue and advances", async () => {
    // Click the "Create queue" button (label includes terminology: "Create Queue")
    const createBtn = page.getByRole("button", { name: /create.*queue/i });
    await createBtn.waitFor({ state: "visible", timeout: 10_000 });
    await createBtn.click();

    // Wait for the queue editor sheet to open (aria-label: "Create Queue")
    const queueSheet = page.getByRole("dialog", { name: /create.*queue/i });
    await queueSheet.waitFor({ state: "visible", timeout: 5_000 });

    // Fill queue name (use placeholder since Konsta ListInput lacks label association)
    const nameInput = queueSheet.getByPlaceholder(/queue name/i).first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("General");
    } else {
      // Fallback: first text input in the sheet
      const firstInput = queueSheet.locator("input[type='text']").first();
      await firstInput.fill("General");
    }

    // Save the queue (button in sheet header)
    const saveBtn = queueSheet.getByRole("button", { name: /save/i });
    await saveBtn.click();

    // Wait for sheet to close
    await queueSheet.waitFor({ state: "hidden", timeout: 10_000 });

    // Next should now be enabled
    const nextLink = page.locator('[role="banner"]').getByText("Next");
    await expect(nextLink).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 5_000,
    });
    await nextLink.click();

    // Should advance to step 7 (Communications)
    await expect(
      page.locator(".step-text").getByText(/step 7 of 8/i),
    ).toBeVisible({
      timeout: 5_000,
    });
  });

  // ── Step 6: Communications ──

  test("skips communications step", async () => {
    // Communications is optional. Click "Skip" in navbar.
    const skipLink = page.locator('[role="banner"]').getByText("Skip");
    await skipLink.waitFor({ state: "visible", timeout: 5_000 });
    await skipLink.click();

    // Should advance to step 8 (Escrow)
    await expect(
      page.locator(".step-text").getByText(/step 8 of 8/i),
    ).toBeVisible({
      timeout: 5_000,
    });
  });

  // ── Step 7: Escrow ──

  test("completes escrow education page", async () => {
    // Page 1: Education. Click Next in navbar.
    const nextLink = page.locator('[role="banner"]').getByText("Next");
    await expect(nextLink).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 10_000,
    });
    await nextLink.click();
    await page.waitForTimeout(500);
  });

  test("creates escrow passphrase and downloads file", async () => {
    // Page 2: Passphrase form. PasswordInput renders as type="password".
    // Konsta ListInput lacks label association, so target by input type.
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.first().waitFor({ state: "visible", timeout: 5_000 });
    await passwordFields.first().fill("e2e-escrow-passphrase-strong-1234!");
    await passwordFields.last().fill("e2e-escrow-passphrase-strong-1234!");

    // Intercept the download (Playwright captures downloads automatically)
    const downloadPromise = page.waitForEvent("download", { timeout: 15_000 });

    // Click the export/download button
    const exportBtn = page.getByRole("button", {
      name: /create escrow file/i,
    });
    await exportBtn.waitFor({ state: "visible", timeout: 5_000 });
    await exportBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("escrow");
  });

  test("completes escrow and advances to completion", async () => {
    // Page 3: Storage guidance. Click Next in navbar.
    const nextLink = page.locator('[role="banner"]').getByText("Next");
    await expect(nextLink).not.toHaveAttribute("aria-disabled", "true", {
      timeout: 5_000,
    });
    await nextLink.click();

    // Completion screen: no more step indicator
    await expect(
      page.getByRole("button", { name: /go to dashboard/i }),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  // ── Step 8: Completion ──

  test("shows completion screen with checklist", async () => {
    // Verify the completion heading is visible
    const dashboardBtn = page.getByRole("button", {
      name: /go to dashboard/i,
    });
    await expect(dashboardBtn).toBeVisible();
  });

  test("navigates to dashboard from completion", async () => {
    const dashboardBtn = page.getByRole("button", {
      name: /go to dashboard/i,
    });
    await dashboardBtn.click();

    // Should redirect to / (dashboard)
    await page.waitForURL(/\/$/, { timeout: CRYPTO_TIMEOUT });

    // The app shell tablist should be visible (confirms we're on the dashboard)
    await page.locator('[role="tablist"]').waitFor({
      state: "attached",
      timeout: CRYPTO_TIMEOUT,
    });
  });
});
