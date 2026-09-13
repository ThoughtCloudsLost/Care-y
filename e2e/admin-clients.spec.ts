import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { CRYPTO_TIMEOUT, login } from "./helpers";

/**
 * Admin clients, logs, and communications E2E.
 *
 * Covers the read-and-navigate admin surfaces the other specs never
 * reach: the People page's tab set (users, clients, roles), the clients
 * list with its detail sheet, the Logs page's call and audit tabs with
 * their filter bars, and the Communications page's telephony and
 * greetings sections.
 *
 * Fixture discipline: read-only. This spec creates and deletes nothing,
 * so it shares no mutable state with admin-forms.spec.ts and the two
 * can run in parallel workers.
 */

test.describe.serial("Admin Clients, Logs, Communications", () => {
  let page: Page;

  /** SPA hub navigation: page.goto would reload and drop the Worker session. */
  async function viaHub(
    destination: string,
    urlPattern: RegExp,
  ): Promise<void> {
    await page.locator('[data-sidebar-id="admin"]').click();
    await expect(page).toHaveURL("/admin", { timeout: 10_000 });
    // Hub rows are not interactive until the content loads past the
    // crypto unlock (same gate as a11y-sweep).
    await expect(page.getByText("People").first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await page.getByText(destination, { exact: true }).first().click();
    await expect(page).toHaveURL(urlPattern, { timeout: 10_000 });
  }

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "admin-clients");
    await page.close();
  });

  // ── People page: tab set ────────────────────────────────────────

  test("people page opens on the users tab", async () => {
    await viaHub("Users", /\/admin\/people/);

    const tablist = page.getByRole("tablist", { name: "People" });
    await expect(tablist).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(tablist.getByRole("tab", { name: "Users" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // The seeded org has the admin user plus volunteers; the panel
    // renders once their records decrypt.
    await expect(page.locator("#panel-users")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("clients tab lists clients with decrypted aliases", async () => {
    const tablist = page.getByRole("tablist", { name: "People" });
    await tablist.getByRole("tab", { name: "Clients" }).click();
    await expect(page.locator("#panel-clients")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // Seeded clients render as cards with decrypted adjective-noun-number
    // aliases (the decrypt pipeline ran if the pattern matches).
    const cards = page.locator(".client-card-wrap");
    await expect(cards.first()).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(page.getByText(/[a-z]+-[a-z]+-\d+/).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("client detail sheet shows alias, phone, and email sections", async () => {
    const editBtn = page
      .locator(".client-card-wrap")
      .first()
      .getByRole("button", { name: /edit client/i });
    await expect(editBtn).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await editBtn.click();

    // The detail sheet carries the three contact sections; their labels
    // are the section headings rather than input labels.
    await expect(page.getByText("Alias", { exact: true }).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await expect(
      page.getByText("Phone", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Email", { exact: true }).first(),
    ).toBeVisible();

    // Escape dismisses the sheet (org-app overlay contract; on client
    // pages Escape is quick exit instead).
    await page.keyboard.press("Escape");
    await expect(page.locator("#panel-clients")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("roles tab renders the permission matrix", async () => {
    const tablist = page.getByRole("tablist", { name: "People" });
    await tablist.getByRole("tab", { name: "Roles" }).click();
    await expect(page.locator("#panel-roles")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    // Role names are the matrix's row or column headers.
    await expect(page.getByText(/volunteer/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  // ── Logs page: calls and audit ──────────────────────────────────

  test("logs page renders the calls tab", async () => {
    // The hub splits this page into two destinations ("Call Log" and
    // "Audit Log"), each deep-linking to its tab.
    await viaHub("Call Log", /\/admin\/logs/);

    const tablist = page.getByRole("tablist", { name: "Logs" });
    await expect(tablist).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(tablist.getByRole("tab", { name: "Calls" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // Call rows render inside the tab panel as buttons carrying the
    // decrypted client alias, a relative time, and the call type. Accept
    // the empty state too: it is a legitimate state of the surface.
    const panel = page.getByRole("tabpanel", { name: "Calls" });
    await expect(
      panel
        .getByText(/voicemail|outbound|inbound/i)
        .first()
        .or(page.getByText("No calls found")),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  test("audit tab switch loads audit events", async () => {
    const tablist = page.getByRole("tablist", { name: "Logs" });
    await tablist.getByRole("tab", { name: "Audit" }).click();
    await expect(tablist.getByRole("tab", { name: "Audit" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // The tab is reflected in the URL so the view is linkable.
    await expect(page).toHaveURL(/tab=audit/, { timeout: 5_000 });

    // Earlier specs in this suite generate audit events (logins, form
    // saves), so either rows or the empty state is legitimate here.
    const auditPanel = page.getByRole("tabpanel", { name: "Audit" });
    await expect(
      auditPanel
        .getByRole("button")
        .first()
        .or(page.getByText("No audit events found")),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  test("logs filter bar exposes its pills", async () => {
    // The logs page reuses the shared filter layout; its pills are the
    // audit dimensions while the audit tab is active.
    const toolbar = page.getByRole("toolbar").first();
    await expect(toolbar).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await expect(toolbar.getByText("Date").first()).toBeVisible();
  });

  // ── Communications page: telephony and greetings ────────────────

  test("communications page renders telephony and greetings sections", async () => {
    await viaHub("Telephony", /\/admin\/communications/);

    await expect(page.getByText(/telephony/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    // Every section renders expanded on this page, so the greetings
    // heading is present without extra navigation.
    await expect(page.getByText(/greeting/i).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });
});
