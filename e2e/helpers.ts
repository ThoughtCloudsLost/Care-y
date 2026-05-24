import { expect, type Page } from "@playwright/test";

/** Crypto pipeline timeout: Argon2id + OPRF + ECIES + Worker decryption. */
export const CRYPTO_TIMEOUT = 60_000;

/** Seed credentials (must match dev seed script: packages/server/src/scripts/seed.ts). */
const DEV_USER = "admin.dev";
const DEV_PASSWORD = "dev-password-1234!";

/**
 * Log in via the login page and wait for the full crypto pipeline
 * to complete (redirect to "/" means Argon2id + OPRF + key derivation
 * finished and the Worker is in KEYED state).
 */
export async function login(
  page: Page,
  username = DEV_USER,
  password = DEV_PASSWORD,
): Promise<void> {
  await page.goto("/login");
  // The login form is gated behind an onboarding status query.
  // Wait for the form to render before interacting.
  const submitBtn = page.getByRole("button", { name: /sign in/i });
  await submitBtn.waitFor({ state: "visible", timeout: 15_000 });
  await page.locator('input[autocomplete="username"]').fill(username);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await submitBtn.click();

  // Race: URL changes (success) or an error alert appears (failure).
  // The seeded admin may land on / or /complete depending on onboarding state.
  await Promise.race([
    page.waitForURL(/\/(complete)?$/, { timeout: CRYPTO_TIMEOUT }),
    page
      .locator('[role="alert"]')
      .waitFor({ state: "visible", timeout: CRYPTO_TIMEOUT })
      .then(async () => {
        const text = await page.locator('[role="alert"]').textContent();
        throw new Error(`Login failed with error: ${text ?? "(no text)"}`);
      }),
  ]);

  // If redirected to /complete (onboarding), navigate to / for tests.
  if (page.url().includes("/complete")) {
    await page.goto("/");
  }
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

  const card = page.locator('[data-testid="ticket-card"]', { hasText: title });
  await card.locator('[data-testid="card-inner"]').click();

  await expect(page).toHaveURL(/\/tickets\/[0-9a-f-]{36}/);
  await expect(page.locator('[role="log"]')).toBeVisible({
    timeout: CRYPTO_TIMEOUT,
  });
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
