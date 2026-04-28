import { expect, type Page } from "@playwright/test";

/** Crypto pipeline timeout: Argon2id + OPRF + ECIES + Worker decryption. */
export const CRYPTO_TIMEOUT = 60_000;

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
