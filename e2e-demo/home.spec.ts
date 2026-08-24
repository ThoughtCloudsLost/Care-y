/**
 * Home return: verifies the TopBar home button re-shows the entry
 * page without disturbing the phone state, and that normal navigation
 * resumes afterward.
 */

import { test, expect } from "@playwright/test";
import {
  ENGINE_BOOT_TIMEOUT,
  waitForPhoneBridge,
  readBridgeState,
  awaitConvergence,
} from "./helpers.js";

test.describe("home return", () => {
  test("returns to entry from a deep-linked section, then resumes navigation", async ({
    page,
  }) => {
    // Deep-link to a non-login section so the phone navigates there
    // after boot.
    await page.goto("/#tickets");

    // Wait for the engine and bridge to be ready.
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);

    // Wait for the story to settle on the tickets section.
    await awaitConvergence(page, { sectionId: "tickets" }, { timeout: 30_000 });

    // Wait for the phone to actually finish its boot fast-forward: a
    // deep link presents the story immediately while the phone keys
    // and signs in behind the splash, and "hydrated" only lands once
    // the splash lifts on the committed target screen.
    await page.waitForFunction(
      () => {
        const iframe = document.querySelector<HTMLIFrameElement>(
          "iframe.phone-iframe",
        );
        return (
          iframe?.contentDocument?.body.classList.contains("hydrated") === true
        );
      },
      undefined,
      { timeout: 30_000 },
    );

    // Snapshot the bridge state before clicking home.
    const preState = await readBridgeState(page);
    expect(preState.location.sectionId).toBe("tickets");
    const preLocationSeq = preState.locationSeq;

    // Click the home button (located by its accessible name from
    // the demo_home message in the default locale).
    const homeBtn = page.getByRole("button", { name: "Handbook introduction" });
    await expect(homeBtn).toBeVisible({ timeout: 5_000 });
    await homeBtn.click();

    // The entry title should be visible.
    const entryTitle = page.locator("h2.flow-block");
    await expect(entryTitle).toContainText("How CARE-Y works", {
      timeout: 5_000,
    });

    // The bridge location and locationSeq must be unchanged: the
    // home button does not touch the phone or bridge.
    const postState = await readBridgeState(page);
    expect(postState.location.sectionId).toBe("tickets");
    expect(postState.locationSeq).toBe(preLocationSeq);

    // The phone body should still have "hydrated" (splash remains lifted).
    const hydrated = await page.evaluate(() => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        "iframe.phone-iframe",
      );
      if (iframe === null) return false;
      const doc = iframe.contentDocument;
      if (doc === null) return false;
      return doc.body.classList.contains("hydrated");
    });
    expect(hydrated).toBe(true);

    // Wait ~1s and assert entry is still visible (no auto-re-dismiss).
    // Visibility is asserted on the painted line span: the h2 itself
    // is a zero-height flow anchor (absolute-positioned children).
    await page.waitForTimeout(1_000);
    await expect(entryTitle).toContainText("How CARE-Y works");
    await expect(entryTitle.locator(".flow-line").first()).toBeVisible();

    // Click a section tab and assert normal navigation resumes.
    // Use the first section tab (login, index 0).
    const loginTab = page
      .locator("nav.section-tabs button.section-tab")
      .first();
    await loginTab.click();

    // The entry title should be gone, replaced by the login section.
    await expect(entryTitle).not.toContainText("How CARE-Y works", {
      timeout: 5_000,
    });

    // The login section tab should now be active.
    const activeTab = page.locator(
      "nav.section-tabs button.section-tab-active",
    );
    await expect(activeTab).toBeVisible();
  });
});
