/**
 * Fullscreen mode walkthrough. Enters via the toolbar, checks the pill
 * chrome and handbook drawer navigation, and asserts the frame's
 * geometry restores on exit. Not part of the walk suite; runs against
 * a wide viewport where explore is the default mode and the frame
 * toolbar is visible.
 */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  ENGINE_BOOT_TIMEOUT,
  waitForPhoneBridge,
  readBridgeState,
} from "./helpers.js";

/**
 * Enter fullscreen through the frame toolbar.
 *
 * At the boot phone preset the frame is narrower than the collapse
 * width, so the fullscreen button is folded into the preset dropdown;
 * at wide footprints it is a direct left-zone button. Handles both,
 * like enterDesktopPreset.
 */
async function enterFullscreen(page: Page): Promise<void> {
  const directFs = page.getByRole("button", { name: "Full screen" });
  if (await directFs.isVisible().catch(() => false)) {
    await directFs.click();
    return;
  }
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

    await enterFullscreen(page);

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
    const contentsTrigger = drawer.locator("button.contents-trigger");
    await contentsTrigger.click();

    // The panel takes its width from the bar row, not from the trigger:
    // the trigger is a fraction of the drawer at this width, and a panel
    // sized to it wraps every section title over several lines.
    const panelBox = await drawer.locator(".contents-panel").boundingBox();
    const triggerBox = await contentsTrigger.boundingBox();
    const drawerBox = await drawer.boundingBox();
    if (panelBox === null || triggerBox === null || drawerBox === null) {
      throw new Error("drawer, trigger, or panel has no bounding box");
    }
    expect(panelBox.width).toBeGreaterThan(triggerBox.width);
    expect(panelBox.width).toBeGreaterThan(drawerBox.width * 0.8);
    // Contained: the panel rests on the drawer's gutters, never spilling
    // past either edge into the app beneath.
    expect(panelBox.x).toBeGreaterThanOrEqual(drawerBox.x);
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(
      drawerBox.x + drawerBox.width,
    );

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

  test("story leaves the DOM in fullscreen and comes back in place", async ({
    page,
  }) => {
    await page.goto("/#tickets");
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);
    await expect(page.locator(".floating-frame")).toBeVisible({
      timeout: 10_000,
    });

    const story = page.locator(".scroll-story");
    await expect(story).toHaveCount(1);

    await enterFullscreen(page);

    // Gone, not hidden: a story left mounted under the app gives the
    // page a second scroll container competing for the same input.
    await expect(story).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollHeight <= window.innerHeight + 1,
        ),
      )
      .toBe(true);

    // Exit restores it at the location fullscreen was holding.
    await page
      .locator(".frame-toolbar--fs")
      .getByRole("button", { name: "Exit full screen", exact: true })
      .click();
    await expect(story).toHaveCount(1);
    await expect
      .poll(() => page.evaluate(() => window.location.hash))
      .toBe("#tickets");
  });

  test("next-section pill docks in the drawer footer in fullscreen", async ({
    page,
  }) => {
    await page.goto("/#tickets");
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);
    await expect(page.locator(".floating-frame")).toBeVisible({
      timeout: 10_000,
    });
    await enterFullscreen(page);

    const drawer = page.locator(".handbook-drawer");
    await expect(drawer).toBeVisible();

    // The page's fixed pill went with the story; the drawer footer
    // carries it instead, below the prose and outside its scroll.
    await expect(page.locator(".next-pill-container")).toHaveCount(0);
    const pill = drawer
      .locator(".drawer-footer-dock")
      .getByRole("button", { name: /^Continue to / });
    await expect(pill).toBeVisible();

    // Same handler as the page pill: it drives the shared location.
    await pill.click();
    await expect
      .poll(() => page.evaluate(() => window.location.hash))
      .not.toBe("#tickets");
  });

  test("drawer narrower than its default folds data flow into the menu", async ({
    page,
  }) => {
    await page.goto("/#tickets");
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);
    await expect(page.locator(".floating-frame")).toBeVisible({
      timeout: 10_000,
    });
    await enterFullscreen(page);

    const drawer = page.locator(".handbook-drawer");
    const dock = drawer.locator(".drawer-topbar-dock");
    await expect(drawer).toBeVisible();

    // At the default width the toggle is a button in the row.
    await expect(dock.locator("button.flow-btn")).toBeVisible();

    // Shrink one keyboard step below the default. 24px is small enough
    // to stay well clear of the snap-close threshold, so the drawer is
    // narrower but still open.
    await drawer.locator(".drawer-resize-handle").focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(async () => {
        const box = await drawer.boundingBox();
        return box === null ? null : Math.round(box.width);
      })
      .toBeLessThan(320);
    await expect(drawer).toHaveClass(/handbook-drawer--open/);

    // The toggle has left the row for the overflow menu, still carrying
    // its pressed state.
    await expect(dock.locator("button.flow-btn")).toBeHidden();
    await dock.getByRole("button", { name: "More options" }).click();
    await expect(
      dock.getByRole("menuitemcheckbox", { name: "Data flow panel" }),
    ).toBeVisible();
  });

  test("dragging the drawer shut leaves nothing but the grip on screen", async ({
    page,
  }) => {
    await page.goto("/#tickets");
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);
    await expect(page.locator(".floating-frame")).toBeVisible({
      timeout: 10_000,
    });
    await enterFullscreen(page);

    const drawer = page.locator(".handbook-drawer");
    await expect(drawer).toHaveClass(/handbook-drawer--open/);

    const viewport = page.viewportSize();
    if (viewport === null) throw new Error("no viewport size");
    const handleBox = await drawer
      .locator(".drawer-resize-handle")
      .boundingBox();
    if (handleBox === null) throw new Error("handle has no bounding box");

    // Drag the handle to the window edge and release. Unlike closing
    // via the button, this settles the drawer shut at a sliver width,
    // which is what puts its contents wider than its own box.
    const y = handleBox.y + 120;
    await page.mouse.move(handleBox.x + handleBox.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(viewport.width - 3, y, { steps: 12 });
    await page.mouse.up();

    await expect(drawer).not.toHaveClass(/handbook-drawer--open/);
    await expect(
      drawer.getByRole("button", { name: "Close handbook" }),
    ).toBeHidden();

    // Nothing of the drawer paints left of its parked edge except the
    // resize handle, which reaches out there on purpose. Hit testing
    // rather than bounding boxes: a clipped element still reports its
    // full layout box, so only elementFromPoint shows what is painted.
    const stray = await page.evaluate(() => {
      const el = document.querySelector(".handbook-drawer");
      if (el === null) return "no-drawer";
      const box = el.getBoundingClientRect();
      for (const f of [0.2, 0.5, 0.85]) {
        const hit = document.elementFromPoint(
          box.left - 6,
          window.innerHeight * f,
        );
        if (
          hit !== null &&
          el.contains(hit) &&
          hit.closest(".drawer-resize-handle") === null
        ) {
          return hit.className || hit.tagName;
        }
      }
      return null;
    });
    expect(stray).toBeNull();
  });

  test("closed drawer parks a grip at the window edge that reopens it", async ({
    page,
  }) => {
    await page.goto("/#tickets");
    await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);
    await expect(page.locator(".floating-frame")).toBeVisible({
      timeout: 10_000,
    });
    await enterFullscreen(page);

    const drawer = page.locator(".handbook-drawer");
    const handle = drawer.locator(".drawer-resize-handle");
    await expect(drawer).toHaveClass(/handbook-drawer--open/);

    const viewport = page.viewportSize();
    if (viewport === null) throw new Error("no viewport size");

    await drawer.getByRole("button", { name: "Close handbook" }).click();
    await expect(drawer).not.toHaveClass(/handbook-drawer--open/);

    // Closed, the drawer parks rather than sliding fully away: the
    // handle stays on screen as the way back in, and announces itself
    // as an open control rather than a resize separator.
    await expect(handle).toHaveAttribute("aria-label", "Open handbook");
    await expect
      .poll(async () => {
        const box = await handle.boundingBox();
        return box === null ? null : box.x < viewport.width;
      })
      .toBe(true);

    // Clicking it brings the drawer back at a usable width.
    await handle.click();
    await expect(drawer).toHaveClass(/handbook-drawer--open/);
    await expect
      .poll(async () => {
        const box = await drawer.boundingBox();
        return box === null ? null : box.width;
      })
      .toBeGreaterThan(200);
  });
});
