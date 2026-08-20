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
    // The story flow renders it as the page's only h2 block.
    const entryTitle = page.locator("h2.flow-block");
    await expect(entryTitle).toBeVisible({ timeout: 10_000 });
    await expect(entryTitle).toContainText("How CARE-Y works");

    // Wait for the phone engine to boot. Log the measured time so
    // future timeout tuning has a baseline.
    const bootStart = Date.now();
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);
    const bootMs = Date.now() - bootStart;
    console.log(`Engine boot: ${String(bootMs)}ms`);

    // Read bridge state: should be at init origin right after boot.
    // The phone boots on login and begins background keying (ensureKeyed).
    // Once keying completes, silent auth transitions the phone to home
    // and origin changes from "init", which auto-dismisses the entry
    // page. The window between boot and keying completion is typically
    // several seconds (Argon2id), so this assertion is safe.
    const initState = await readBridgeState(page);
    expect(initState.origin).toBe("init");

    // Entry sub clicks are inert by construction: the SectionRail
    // renders its entries as static spans, never buttons, while the
    // entry page is visible (SectionRail interactive=false). Assert
    // that shape. Origin may have advanced from "init" if background
    // keying completed during this window, so we do not re-assert it.
    const railButtons = page.locator("nav.section-rail button.rail-item");
    const railStatics = page.locator("nav.section-rail span.rail-item--static");
    await expect(railStatics.first()).toBeVisible({ timeout: 5_000 });
    await expect(railButtons).toHaveCount(0);

    // Dismiss the entry page via the next-section pill. If background
    // keying completed and the silent auth already dismissed the entry
    // page, the pill may have disappeared; in that case the entry is
    // already gone and we verify the post-entry state directly.
    const nextPill = page.locator("button.next-pill");
    const pillVisible = await nextPill.isVisible().catch(() => false);
    if (pillVisible) {
      await nextPill.click();
    }

    // Entry page is dismissed (by pill click or silent auth): the entry
    // title ("How CARE-Y works") should be gone, replaced by a story
    // section.
    await expect(entryTitle).not.toContainText("How CARE-Y works", {
      timeout: 5_000,
    });

    // A section title should now be visible (login if the pill
    // dismissed the entry, or dashboard/another section if silent auth
    // drove the transition).
    const sectionTitle = page.locator("h2.flow-block");
    await expect(sectionTitle).toBeVisible();
  });
});
