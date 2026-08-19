/**
 * Entry page: verifies the demo's landing state before the visitor
 * enters the story. The entry page is visible when the URL has no hash;
 * sub clicks are inert; the next-section pill dismisses the entry and
 * transitions to the login section.
 */

import { test, expect } from "@playwright/test";
import {
  ENGINE_BOOT_TIMEOUT,
  waitForPhoneBridge,
  readBridgeState,
} from "./helpers.js";

test.describe("entry page", () => {
  test("renders entry page, boots engine, dismisses via next pill", async ({
    page,
  }) => {
    // Navigate with no hash: entry page is visible
    await page.goto("/");

    // The entry section title "How CARE-Y works" is the stable marker.
    // SectionIntro renders it as h2.section-title.
    const entryTitle = page.locator("h2.section-title");
    await expect(entryTitle).toBeVisible({ timeout: 10_000 });
    await expect(entryTitle).toContainText("How CARE-Y works");

    // Wait for the phone engine to boot. Log the measured time so
    // future timeout tuning has a baseline.
    const bootStart = Date.now();
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);
    const bootMs = Date.now() - bootStart;
    console.log(`Engine boot: ${String(bootMs)}ms`);

    // Read bridge state: should be at init origin while entry is visible
    const initState = await readBridgeState(page);
    expect(initState.origin).toBe("init");

    // Entry sub clicks are inert by construction: the SectionRail
    // renders its entries as static spans, never buttons, while the
    // entry page is visible (SectionRail interactive=false). Assert
    // that shape and that the bridge stayed at its boot origin.
    const railButtons = page.locator("nav.section-rail button.rail-item");
    const railStatics = page.locator("nav.section-rail span.rail-item--static");
    await expect(railStatics.first()).toBeVisible({ timeout: 5_000 });
    await expect(railButtons).toHaveCount(0);
    const afterEntry = await readBridgeState(page);
    expect(afterEntry.origin).toBe("init");

    // Click the next-section pill to dismiss the entry page.
    // The pill contains text like "next: Sign in" (demo_section_next
    // with the login section title). It is rendered as button.next-pill.
    const nextPill = page.locator("button.next-pill");
    await expect(nextPill).toBeVisible({ timeout: 5_000 });
    await nextPill.click();

    // Entry page is dismissed: the entry title ("How CARE-Y works")
    // should be gone, replaced by the login section.
    await expect(entryTitle).not.toContainText("How CARE-Y works", {
      timeout: 5_000,
    });

    // The login section title should now be visible
    const loginTitle = page.locator("h2.section-title");
    await expect(loginTitle).toBeVisible();
  });
});
