/**
 * Layer 3: KB article creation through the production editor.
 *
 * Tests the full create-article flow: navigate to /library/new,
 * fill title, select category, type body in ProseMirror editor,
 * and publish. Verifies the article appears in the library list
 * with a decrypted title.
 *
 * The seed-data setup creates KB articles via the server-side
 * devSeedKb mutation. This suite exercises the browser-side
 * creation flow that uses sealForOrgKey in the crypto Worker.
 */

import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import { CRYPTO_TIMEOUT, login, createKbArticle } from "./helpers";

test.describe.serial("KB article creation (production UI)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 4);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "3c-kb-create");
    await page.close();
  });

  test("create an article in the Procedures category", async () => {
    await createKbArticle(page, {
      title: "UI-created procedures article",
      category: "Procedures",
      body: "Step one: verify your environment is ready.",
    });
  });

  test("created article appears in library list", async () => {
    await expect(page.getByText("UI-created procedures article")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });

  test("create an article in the Safety category", async () => {
    await createKbArticle(page, {
      title: "UI-created safety article",
      category: "Safety",
      body: "This article covers safety planning fundamentals.",
    });
  });

  test("both UI-created articles visible alongside seeded articles", async () => {
    // SPA navigation to preserve crypto Worker state.
    await page.getByRole("tab", { name: /knowledge base/i }).click();
    await expect(page).toHaveURL("/library", { timeout: 10_000 });
    await expect(page.getByText("UI-created procedures article")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
    await expect(page.getByText("UI-created safety article")).toBeVisible();

    // Seeded articles should also be visible.
    await expect(page.getByText("Intake call checklist")).toBeVisible({
      timeout: CRYPTO_TIMEOUT,
    });
  });
});
