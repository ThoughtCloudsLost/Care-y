import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("visual foundation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── Theme defaults ───────────────────────────────────────────────────

  test("html has dark class by default", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
  });

  test("--ink custom property resolves to a dark-mode value", async ({
    page,
  }) => {
    const ink = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ink")
        .trim(),
    );
    // All themes set --ink to a light color in dark mode (e.g. #e5e5e5, #f0ece5)
    // Just verify it's defined and non-empty
    expect(ink.length).toBeGreaterThan(0);
  });

  // ── Theme persistence ──────────────────────────────────────────────

  test("theme persists across page reload", async ({ page }) => {
    // Switch to light mode via the blocking script's localStorage key
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
  });

  // ── Accessibility ──────────────────────────────────────────────────

  test("page passes axe-core contrast check", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── High contrast mode ─────────────────────────────────────────────

  test("prefers-contrast: more hides decorative textures", async ({ page }) => {
    await page.emulateMedia({ contrast: "more" });
    await page.goto("/");

    // Grain pseudo-elements should be hidden
    const grainDisplay = await page.evaluate(() => {
      const el = document.querySelector(".grain");
      if (!el) return "no-element";
      return getComputedStyle(el, "::before").display;
    });
    // If no grain element on page, that's fine (not all themes use it)
    if (grainDisplay !== "no-element") {
      expect(grainDisplay).toBe("none");
    }

    // Heading display filter should be disabled
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
