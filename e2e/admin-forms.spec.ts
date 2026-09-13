import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { CRYPTO_TIMEOUT, login, navigateToAdminSection } from "./helpers";

/**
 * Admin form builder E2E.
 *
 * Walks the form-builder surface end to end: create a form in the editor
 * (name, slug, fields of several types), configure a field through the
 * config sheet (label, options), reorder fields, exercise the preview
 * state switcher, save, toggle active state from the organization
 * section, open the empty responses viewer, and delete the form.
 *
 * Fixture discipline: this spec creates and deletes its own form
 * ("E2E Builder Form"); it shares no mutable entities with
 * admin-clients.spec.ts so the two can run in parallel workers.
 */

const FORM_NAME = "E2E Builder Form";
const FORM_SLUG = `e2e-builder-${String(Date.now()).slice(-6)}`;

test.describe.serial("Admin Form Builder", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);

    // SPA navigation via the sidebar (page.goto would reload and drop
    // the crypto Worker session; same convention as a11y-sweep).
    await navigateToAdminSection(page, "Intake Forms", /\/admin\/organization/);
    await expect(page.getByText("Intake Forms").first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "admin-forms");
    await page.close();
  });

  test("create-form editor builds a multi-field form", async ({}, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 3);

    await page.getByRole("button", { name: /create new form/i }).click();
    await expect(page).toHaveURL(/\/admin\/forms/, { timeout: 10_000 });

    await page.getByPlaceholder("e.g. Main Intake").fill(FORM_NAME);
    await page.getByPlaceholder("e.g. crisis-line").fill(FORM_SLUG);

    // Add a Text field, a Text area, and a Dropdown. Picking a type
    // immediately opens the Configure dialog for the new field, so each
    // iteration configures inline and closes with Done.
    const fields: readonly (readonly [string, string])[] = [
      ["Text", "Contact name"],
      ["Text area", "Details"],
      ["Dropdown", "Topic"],
    ];
    for (const [typeLabel, question] of fields) {
      await page.getByRole("button", { name: /add field/i }).click();
      const picker = page.getByRole("dialog").last();
      await expect(picker).toBeVisible({ timeout: 5_000 });
      await picker
        .locator("li")
        .filter({ has: page.getByText(typeLabel, { exact: true }) })
        .first()
        .dispatchEvent("click");

      const config = page.getByRole("dialog", { name: /configure field/i });
      await expect(config).toBeVisible({ timeout: 5_000 });
      await config
        .getByPlaceholder("e.g. What is the best way to reach you?")
        .fill(question);
      if (typeLabel === "Dropdown") {
        // A new dropdown starts with one option row; add a second.
        await config
          .locator("li")
          .filter({ hasText: "Option 1" })
          .locator('input[type="text"]')
          .fill("Urgent");
        await config.getByRole("button", { name: /add option/i }).click();
        await config
          .locator("li")
          .filter({ hasText: "Option 2" })
          .locator('input[type="text"]')
          .fill("General");
      }
      await config.getByRole("button", { name: /^done$/i }).click();
      await expect(config).not.toBeVisible({ timeout: 5_000 });
    }

    // Three field rows exist, each with a Configure affordance.
    await expect(page.getByRole("button", { name: "Configure" })).toHaveCount(
      3,
      { timeout: 10_000 },
    );
  });

  test("reopened config sheet shows persisted values and edits stick", async () => {
    // The dropdown is the last-added row; reopening its sheet shows the
    // values entered during creation.
    await page.getByRole("button", { name: "Configure" }).last().click();

    const sheet = page.getByRole("dialog", { name: /configure field/i });
    await expect(sheet).toBeVisible({ timeout: 5_000 });

    const question = sheet.getByPlaceholder(
      "e.g. What is the best way to reach you?",
    );
    await expect(question).toHaveValue("Topic");
    await expect(
      sheet
        .locator("li")
        .filter({ hasText: "Option 1" })
        .locator('input[type="text"]'),
    ).toHaveValue("Urgent");

    await question.fill("Topic area");
    await sheet.getByRole("button", { name: /^done$/i }).click();
    await expect(sheet).not.toBeVisible({ timeout: 5_000 });

    // The edit propagates to the live preview. The label renders there
    // in three roles (sr-only label, block title, placeholder option),
    // so take the first match rather than pinning one of them.
    await expect(
      page
        .getByTestId("split-right-pane")
        .getByText("Topic area", { exact: true })
        .first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("move controls reorder fields", async () => {
    // Move the last field up one slot and back down; both directions
    // execute the reorder handlers.
    await page.getByRole("button", { name: "Move up" }).last().click();
    await page.getByRole("button", { name: "Move down" }).first().click();
    // The rows still all exist after the round trip.
    await expect(page.getByRole("button", { name: "Configure" })).toHaveCount(
      3,
    );
  });

  test("preview switcher walks the form, submitted, and closed states", async () => {
    const switcher = page.getByTestId("preview-state-switcher");
    await expect(switcher).toBeVisible({ timeout: 10_000 });
    const preview = page.getByTestId("split-right-pane");

    // Each state replaces the preview content with its own UI.
    await switcher.getByText("Submitted", { exact: true }).click();
    await expect(preview.getByText(/submitted/i).first()).toBeVisible({
      timeout: 5_000,
    });

    await switcher.getByText("Closed", { exact: true }).click();
    await expect(preview.getByText(/closed|no longer/i).first()).toBeVisible({
      timeout: 5_000,
    });

    // Returning to Form re-renders the live field preview.
    await switcher.getByText("Form", { exact: true }).click();
    await expect(preview.getByText("Contact name").first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test("save persists the form", async () => {
    await page.getByRole("button", { name: /save form/i }).click();
    await expect(page.getByText("Form saved").first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("activate toggle flips the form active state", async () => {
    // Back to the organization section (SPA path via the hub).
    await navigateToAdminSection(page, "Intake Forms", /\/admin\/organization/);
    await expect(page.getByText(FORM_NAME).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    // The row's active toggle carries "<name> Active|Inactive" as its
    // accessible name. Assert the state round-trip rather than the
    // toasts: the toggle's starting direction depends on whether the
    // editor's save left the form active, and toasts are transient.
    const toggle = page.getByRole("checkbox", {
      name: new RegExp(`${FORM_NAME} (Active|Inactive)`),
    });
    await expect(toggle).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    const startedActive = await toggle.isChecked();

    await toggle.dispatchEvent("click");
    await expect(toggle).toBeChecked({
      checked: !startedActive,
      timeout: 10_000,
    });

    await toggle.dispatchEvent("click");
    await expect(toggle).toBeChecked({
      checked: startedActive,
      timeout: 10_000,
    });
  });

  test("responses viewer shows the empty state for a fresh form", async () => {
    // The row exposes View responses; the new form has no submissions.
    // Scope to the section's row container: the organization page keeps
    // every accordion section expanded, so a generic text filter is
    // ambiguous.
    const row = page.locator(".ifs-row").filter({ hasText: FORM_NAME });
    await expect(row).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await row.getByRole("button", { name: "View responses" }).click();
    await expect(page).toHaveURL(/\/admin\/forms\/responses/, {
      timeout: 10_000,
    });
    await expect(
      page.getByText("No responses have been submitted for this form."),
    ).toBeVisible({ timeout: CRYPTO_TIMEOUT });
  });

  test("delete removes the form after confirmation", async () => {
    // Back to the organization section, then delete the fixture form.
    await navigateToAdminSection(page, "Intake Forms", /\/admin\/organization/);
    await expect(page.getByText(FORM_NAME).first()).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });

    const row = page.locator(".ifs-row").filter({ hasText: FORM_NAME });
    await expect(row).toBeVisible({ timeout: CRYPTO_TIMEOUT });
    await row.getByRole("button", { name: "Delete form" }).click();

    // ShellDialog's root is a zero-box positioning wrapper (it stays
    // mounted and flips inert), so assert on its content rather than the
    // container, and scope the confirm button inside it: the row's own
    // delete button shares the same accessible name.
    const dialog = page.locator('.shell-dialog-root[aria-modal="true"]');
    await expect(dialog.getByText(/permanently delete this form/i)).toBeVisible(
      { timeout: 5_000 },
    );
    await dialog.getByRole("button", { name: "Delete form" }).click();

    await expect(page.getByText("Form deleted").first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(FORM_NAME)).not.toBeVisible({
      timeout: 10_000,
    });
  });
});
