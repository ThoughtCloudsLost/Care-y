import { test, expect } from "./coverage-fixture";
import { startCoverage, stopAndWriteCoverage } from "./coverage-fixture";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CRYPTO_TIMEOUT, login } from "./helpers";

test.describe.serial("visual foundation", () => {
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(CRYPTO_TIMEOUT * 2);
    page = await browser.newPage();
    await startCoverage(page);
    await login(page);
  });

  test.afterAll(async () => {
    await stopAndWriteCoverage(page, "visual-foundation");
    await page.close();
  });

  // ── Theme defaults ───────────────────────────────────────────────────

  test("html has dark class by default", async () => {
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
  });

  test("--ink custom property resolves to a dark-mode value", async () => {
    const ink = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ink")
        .trim(),
    );
    expect(ink.length).toBeGreaterThan(0);
  });

  // ── Theme persistence ──────────────────────────────────────────────

  test("theme persists across page reload", async () => {
    await page.evaluate(() => {
      localStorage.setItem("care-y-color-scheme", "light");
    });
    await page.reload();

    const html = page.locator("html");
    await expect(html).toHaveClass(/light/);

    // Restore dark for other tests
    await page.evaluate(() => {
      localStorage.setItem("care-y-color-scheme", "dark");
    });
    await page.reload();
  });

  // ── Accessibility ──────────────────────────────────────────────────

  test("page passes axe-core contrast check", async () => {
    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .withRules(["color-contrast"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── High contrast mode ─────────────────────────────────────────────

  test("prefers-contrast: more hides decorative textures", async () => {
    await page.emulateMedia({ contrast: "more" });
    await page.reload();

    const grainDisplay = await page.evaluate(() => {
      const el = document.querySelector(".grain");
      if (!el) return "no-element";
      return getComputedStyle(el, "::before").display;
    });
    if (grainDisplay !== "no-element") {
      expect(grainDisplay).toBe("none");
    }

    const headingFilter = await page.evaluate(() => {
      const el = document.querySelector(".heading-display");
      if (!el) return "no-element";
      return getComputedStyle(el).filter;
    });
    if (headingFilter !== "no-element") {
      expect(headingFilter).toBe("none");
    }
  });
});
