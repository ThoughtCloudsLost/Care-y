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
    // The story flow renders it as the page's only h2 block. The h2
    // itself is a zero-height flow anchor (absolute-positioned line
    // spans), so visibility is asserted on the painted span.
    const entryTitle = page.locator("h2.flow-block");
    const entryTitleLine = entryTitle.locator(".flow-line").first();
    await expect(entryTitleLine).toBeVisible({ timeout: 10_000 });
    await expect(entryTitle).toContainText("How CARE-Y works");

    // Wait for the phone engine to boot. Log the measured time so
    // future timeout tuning has a baseline.
    const bootStart = Date.now();
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);
    const bootMs = Date.now() - bootStart;
    console.log(`Engine boot: ${String(bootMs)}ms`);

    // Read bridge state: should be at init origin right after boot.
    // The phone boots on login and begins background keying (ensureKeyed).
    // Once keying completes, the splash lifts to reveal the login form
    // as the ready state, but origin stays "init" and no navigation
    // occurs, so the entry page remains visible.
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

    // Dismiss the entry page via the next-section pill.
    const nextPill = page.locator("button.next-pill");
    await expect(nextPill).toBeVisible({ timeout: 5_000 });
    await nextPill.click();

    // Entry page is dismissed: the entry title ("How CARE-Y works")
    // should be gone, replaced by a story section.
    await expect(entryTitle).not.toContainText("How CARE-Y works", {
      timeout: 5_000,
    });

    // A section title should now be visible (login, since the pill
    // dismissed the entry).
    const sectionTitle = page.locator("h2.flow-block .flow-line").first();
    await expect(sectionTitle).toBeVisible();
  });

  test("ready state: splash lifts while entry stays visible", async ({
    page,
  }) => {
    await page.goto("/");

    // Entry title must be visible on a fresh load with no hash. The
    // h2 is a zero-height flow anchor; the painted line span is the
    // visible element.
    const entryTitle = page.locator("h2.flow-block");
    await expect(entryTitle.locator(".flow-line").first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(entryTitle).toContainText("How CARE-Y works");

    // Wait for the phone engine to boot (bridge becomes available).
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);

    // Wait for the phone iframe body to get the "hydrated" class,
    // which signals the splash has lifted and the app is showing
    // its real content.
    await page.waitForFunction(
      () => {
        const iframe = document.querySelector<HTMLIFrameElement>(
          "iframe.phone-iframe",
        );
        if (iframe === null) return false;
        const doc = iframe.contentDocument;
        if (doc === null) return false;
        return doc.body.classList.contains("hydrated");
      },
      undefined,
      { timeout: 30_000 },
    );

    // The entry title must still be visible after the splash lifted.
    // Boot no longer navigates the phone, so the entry page remains.
    await expect(entryTitle).toContainText("How CARE-Y works");
    await expect(entryTitle.locator(".flow-line").first()).toBeVisible();
  });
});
