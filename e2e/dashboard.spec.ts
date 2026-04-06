import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Auto-login runs registerCrypto + loginCrypto + devSeedTickets on first
// page load. All assertions wait for the full crypto pipeline to complete.
// Timeout for crypto-dependent assertions accounts for Argon2id (64 MiB WASM)
// + OPRF round-trips + ECIES key wrapping + Worker decryption.
// registerCrypto runs Argon2id on main thread (~3-5s), then loginCrypto
// runs Argon2id again in the Worker (~3-5s), plus OPRF round-trips,
// ticket seeding, and decryption. 60s is generous but safe.
const CRYPTO_TIMEOUT = 60_000;

// Serial tests with a shared page model a real user session: one login,
// then SPA navigation. The Worker stays KEYED across test navigations.
test.describe.serial("Dashboard (Home Tab)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("/");
    // Wait for the full crypto pipeline to complete.
    // "Help with housing" visible means: auto-login succeeded, registerCrypto
    // stored user_keys, loginCrypto put Worker in KEYED state, devSeedTickets
    // created tickets with ECIES key wraps, ticket list fetched, and Worker
    // decrypted the title. If this text appears, the entire pipeline worked.
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ── Stat cards (real data) ────────────────────────────────────────

  test("stat cards show correct counts from seeded tickets", async () => {
    const statCards = page.locator(".stat-card");
    await expect(statCards).toHaveCount(3);

    // My Open: tickets 1 (Sparrow) + 4 (Robin) = 2
    await expect(page.getByRole("button", { name: /my open/i })).toContainText(
      "2",
    );

    // Unassigned: ticket 2 (Wren) = 1
    await expect(
      page.getByRole("button", { name: /unassigned/i }),
    ).toContainText("1");

    // On Hold: ticket 3 (Finch) = 1
    await expect(page.getByRole("button", { name: /on hold/i })).toContainText(
      "1",
    );
  });

  // ── Decryption (full pipeline) ────────────────────────────────────

  test("decrypted ticket title is visible", async () => {
    // Already verified in beforeAll, but this is the explicit assertion.
    // Proves: OPRF -> deriveKeys -> ECIES unwrap -> secretbox decrypt.
    await expect(page.getByText("Help with housing")).toBeVisible();
  });

  test("ticket without key wrap shows encrypted placeholder", async () => {
    // Ticket with withKeyWrap: false has no key wrap. The title falls
    // back to the i18n placeholder "Encrypted ticket" with a help icon.
    await expect(page.getByText("Encrypted ticket")).toBeVisible();
  });

  // ── Stat card labels (i18n) ───────────────────────────────────────

  test("stat cards display labels from i18n", async () => {
    await expect(page.getByRole("button", { name: /my open/i })).toBeAttached();
    await expect(
      page.getByRole("button", { name: /unassigned/i }),
    ).toBeAttached();
    await expect(page.getByRole("button", { name: /on hold/i })).toBeAttached();
  });

  // ── Notification slot ─────────────────────────────────────────────

  test("exposure notification slot exists but is hidden", async () => {
    const notification = page.locator('[role="alert"]');
    await expect(notification).toBeAttached();
    // Konsta Notification with opened=false renders with opacity-0 and
    // pointer-events-none. Playwright considers opacity-0 elements "visible"
    // (non-zero bounding box), so check the computed style instead.
    await expect(notification).toHaveCSS("opacity", "0");
    await expect(notification).toHaveCSS("pointer-events", "none");
  });

  // ── Stat card navigation ──────────────────────────────────────────

  test("stat card navigates to tickets with filter param", async () => {
    await page.getByRole("button", { name: /unassigned/i }).click();
    await expect(page).toHaveURL(/\/tickets\?filter=unassigned/);
  });

  // Navigate back to dashboard via Home tab (SPA navigation, like a real user)
  test("Home tab navigates back from tickets filter", async () => {
    await page.getByRole("tab", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  // ── Tab navigation ────────────────────────────────────────────────

  test("Tickets tab navigates to /tickets", async () => {
    await page.getByRole("tab", { name: "Tickets" }).click();
    await expect(page).toHaveURL("/tickets");
  });

  test("tickets page shows content", async () => {
    await expect(page.getByText("Tickets")).toBeVisible();
  });

  test("Home tab navigates back to /", async () => {
    await page.getByRole("tab", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  // ── Direct URL navigation (rare but real scenario) ────────────────

  test("active tab reflects current URL on direct navigation", async () => {
    await page.goto("/tickets");
    const ticketsTab = page.getByRole("tab", { name: "Tickets" });
    await expect(ticketsTab).toHaveAttribute("aria-selected", "true");

    // Navigate back for next test
    await page.getByRole("tab", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  // ── Accessibility ─────────────────────────────────────────────────

  test("passes axe accessibility audit after decryption settles", async () => {
    // Ensure we're on the dashboard with decrypted content visible.
    await page.goto("/");
    await expect(page.getByText("Help with housing")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Legacy mode avoids axe-core's cross-context injection which requires
    // pages created via browser.newContext(). The serial suite uses
    // browser.newPage() to inherit project-level config (viewport, baseURL).
    // Exclude Konsta UI internal a11y issues (unlabeled searchbar button,
    // toolbar outside landmark) tracked separately from dashboard tests.
    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
