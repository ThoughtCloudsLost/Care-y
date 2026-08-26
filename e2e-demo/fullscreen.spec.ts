/**
 * Fullscreen mode walkthrough. Enters via the toolbar, checks the pill
 * chrome and handbook drawer navigation, and asserts the frame's
 * geometry restores on exit. Not part of the walk suite; runs against
 * a wide viewport where explore is the default mode and the frame
 * toolbar is visible.
 */

import { test, expect } from "@playwright/test";
import {
  ENGINE_BOOT_TIMEOUT,
  waitForPhoneBridge,
  readBridgeState,
} from "./helpers.js";

test.describe("fullscreen mode", () => {
  test("enters via toolbar, drawer navigates, exit restores frame", async ({
    page,
  }) => {
    await page.goto("/#tickets");
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);

    const frame = page.locator(".floating-frame");
    await expect(frame).toBeVisible({ timeout: 10_000 });
    const before = await frame.boundingBox();
    if (before === null) throw new Error("frame has no bounding box");

    // Enter via the toolbar. At the boot phone preset the frame is
    // narrower than the collapse width, so the fullscreen button is
    // folded into the preset dropdown; at wide footprints it is a
    // direct left-zone button. Handle both, like enterDesktopPreset.
    const directFs = page.getByRole("button", { name: "Full screen" });
    if (await directFs.isVisible().catch(() => false)) {
      await directFs.click();
    } else {
      const trigger = page
        .getByRole("button", { name: "Phone size" })
        .and(page.locator('[aria-haspopup="menu"]'))
        .locator("visible=true")
        .first();
      await trigger.waitFor({ state: "visible", timeout: 5_000 });
      await trigger.click();
      const item = page.getByRole("menuitem", { name: "Full screen" });
      await item.waitFor({ state: "visible", timeout: 5_000 });
      await item.click();
    }

    // The frame covers the viewport and carries the fullscreen class.
    await expect(frame).toHaveClass(/floating-frame--fs/);
    const viewport = page.viewportSize();
    if (viewport === null) throw new Error("no viewport size");
    await expect
      .poll(async () => {
        const box = await frame.boundingBox();
        return box === null
          ? null
          : Math.round(box.width) >= viewport.width - 1 &&
              Math.round(box.height) >= viewport.height - 1;
      })
      .toBe(true);

    // Boundary chrome: the toolbar is in its floating pill state and
    // the normal-mode entry button is gone from it. Exact name match:
    // the pill's "Exit full screen" button contains this substring.
    const pill = page.locator(".frame-toolbar--fs");
    await expect(pill).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Full screen", exact: true }),
    ).toHaveCount(0);

    // The drawer defaults to open on programmatic entry.
    const drawer = page.locator(".handbook-drawer");
    await expect(drawer).toBeVisible();

    // The drawer hosts the TopBar while open. At the default drawer
    // width the bar uses its phone layout (prev/next hidden), so
    // navigation goes through the contents picker, driving the same
    // canonical location record (the URL hash).
    await drawer.locator("button.contents-trigger").click();
    await drawer.getByRole("menuitemradio", { name: "Ticket detail" }).click();
    await expect
      .poll(() => page.evaluate(() => window.location.hash))
      .toBe("#ticket-detail");

    // The phone stays live underneath: the bridge still reports state.
    const state = await readBridgeState(page);
    expect(state).not.toBeNull();

    // Exit via the pill: the frame returns to its pre-entry geometry.
    await pill
      .getByRole("button", { name: "Exit full screen", exact: true })
      .click();
    await expect(frame).not.toHaveClass(/floating-frame--fs/);
    await expect
      .poll(async () => {
        const box = await frame.boundingBox();
        return box === null
          ? null
          : Math.abs(box.width - before.width) <= 1 &&
              Math.abs(box.height - before.height) <= 1 &&
              Math.abs(box.x - before.x) <= 1 &&
              Math.abs(box.y - before.y) <= 1;
      })
      .toBe(true);

    // The pill is gone once fullscreen ends.
    await expect(pill).toHaveCount(0);
  });
});
