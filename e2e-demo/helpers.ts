/**
 * Shared helpers for the demo e2e suite. All helpers operate on the
 * outer demo page; phone-iframe interactions run via page.evaluate or
 * page.waitForFunction, which execute in the browser and cannot close
 * over Node-side imports.
 */

import type { Page } from "@playwright/test";
import type { DemoBridgeState } from "../packages/demo/src/lib/bridge.js";
import type { PulseLogEntry } from "../packages/demo/src/lib/pulse-log.js";
import type { HighlightLogEntry } from "../packages/demo/src/lib/highlight-log.js";

// -----------------------------------------------------------------------
// Custom error (repo bans bare Error throws)
// -----------------------------------------------------------------------

export class DemoE2eError extends Error {
  override readonly name = "DemoE2eError";
}

// -----------------------------------------------------------------------
// Timeout constants
// -----------------------------------------------------------------------

/** PGlite boots in the browser; 120s matches the Node smoke budget. */
export const ENGINE_BOOT_TIMEOUT = 120_000;

/** Max wait for the bridge state to converge after a sub click. */
export const CONVERGENCE_TIMEOUT = 15_000;

/** Budget for the login-to-dashboard transition (auth fast-forward). */
export const LOGIN_FLOW_TIMEOUT = 60_000;

// -----------------------------------------------------------------------
// Bridge access
// -----------------------------------------------------------------------

/**
 * Wait until the phone iframe's bridge is live and the engine has
 * finished booting. Returns once `engineReady` is true.
 */
export async function waitForPhoneBridge(
  page: Page,
  timeout: number = ENGINE_BOOT_TIMEOUT,
): Promise<void> {
  await page.waitForFunction(
    () => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        "iframe.phone-iframe",
      );
      if (iframe === null) return false;
      const win = iframe.contentWindow;
      if (win === null) return false;
      const bridge = win.demoBridge;
      if (bridge === undefined) return false;

      // Subscribe fires synchronously with current state
      let ready = false;
      const unsub = bridge.subscribe((state) => {
        ready = state.engineReady;
      });
      unsub();
      return ready;
    },
    undefined,
    { timeout },
  );
}

/** Snapshot the bridge state. Throws if the bridge is absent. */
export async function readBridgeState(page: Page): Promise<DemoBridgeState> {
  const state = await page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.phone-iframe",
    );
    if (iframe === null) return null;
    const win = iframe.contentWindow;
    if (win === null) return null;
    const bridge = win.demoBridge;
    if (bridge === undefined) return null;

    // Collected via an array: assignment to a captured let inside the
    // listener would leave the variable narrowed to its initializer.
    const snapshots: DemoBridgeState[] = [];
    const unsub = bridge.subscribe((s) => {
      // Spread into a plain object for serialization
      snapshots.push({ ...s, location: { ...s.location } });
    });
    unsub();
    return snapshots[0] ?? null;
  });

  if (state === null) {
    throw new DemoE2eError("Phone bridge is not available");
  }
  return state;
}

// -----------------------------------------------------------------------
// Convergence
// -----------------------------------------------------------------------

/** Serializable subset of the expected bridge state. */
export interface ConvergenceExpectation {
  sectionId?: string;
  subSlug?: string;
  feature?: string;
  /** Exact string, {nonNull: true} sentinel, or null for "must be null". */
  detail?: string | { nonNull: true } | null;
  searchOpen?: boolean;
  loginStage?: string | null;
}

interface ConvergenceOpts {
  timeout?: number;
  /** Require locationSeq >= this value before checking fields. */
  minLocationSeq?: number;
}

/**
 * Wait until the bridge state matches all fields in `expected`.
 * Re-reads the bridge on timeout to include the last observed state
 * in the error message.
 */
export async function awaitConvergence(
  page: Page,
  expected: ConvergenceExpectation,
  opts: ConvergenceOpts = {},
): Promise<void> {
  const timeout = opts.timeout ?? CONVERGENCE_TIMEOUT;
  const minSeq = opts.minLocationSeq ?? 0;

  // Serialize the expectation for the browser predicate
  const serialized = {
    sectionId: expected.sectionId,
    subSlug: expected.subSlug,
    feature: expected.feature,
    detailExact:
      expected.detail === undefined
        ? undefined
        : expected.detail === null
          ? "__null__"
          : typeof expected.detail === "string"
            ? expected.detail
            : undefined,
    detailNonNull:
      expected.detail !== undefined &&
      expected.detail !== null &&
      typeof expected.detail === "object" &&
      "nonNull" in expected.detail
        ? true
        : false,
    searchOpen: expected.searchOpen,
    loginStage: expected.loginStage,
    minSeq,
  };

  try {
    await page.waitForFunction(
      (exp) => {
        const iframe = document.querySelector<HTMLIFrameElement>(
          "iframe.phone-iframe",
        );
        if (iframe === null) return false;
        const win = iframe.contentWindow;
        if (win === null) return false;
        const bridge = win.demoBridge;
        if (bridge === undefined) return false;

        let match = false;
        const unsub = bridge.subscribe((s) => {
          if (s.locationSeq < exp.minSeq) return;

          if (
            exp.sectionId !== undefined &&
            s.location.sectionId !== exp.sectionId
          )
            return;
          if (exp.subSlug !== undefined && s.location.subSlug !== exp.subSlug)
            return;
          if (exp.feature !== undefined && s.feature !== exp.feature) return;

          // Detail matching
          if (exp.detailNonNull) {
            if (s.detail === null) return;
          } else if (exp.detailExact !== undefined) {
            if (exp.detailExact === "__null__") {
              if (s.detail !== null) return;
            } else {
              if (s.detail !== exp.detailExact) return;
            }
          }

          if (exp.searchOpen !== undefined && s.searchOpen !== exp.searchOpen)
            return;
          if (exp.loginStage !== undefined) {
            if (exp.loginStage === null) {
              if (s.loginStage !== null) return;
            } else if (s.loginStage !== exp.loginStage) {
              return;
            }
          }

          match = true;
        });
        unsub();
        return match;
      },
      serialized,
      { timeout },
    );
  } catch {
    // Re-read to include the last observed state in the error
    let lastState: string;
    try {
      const snap = await readBridgeState(page);
      lastState = JSON.stringify(snap, null, 2);
    } catch {
      lastState = "(bridge unavailable)";
    }
    throw new DemoE2eError(
      `Convergence timeout (${String(timeout)}ms). ` +
        `Expected: ${JSON.stringify(expected)}. ` +
        `Last bridge state: ${lastState}`,
    );
  }
}

// -----------------------------------------------------------------------
// Navigation controls
//
// The story renders ONE section per page (App.svelte pageSections).
// Sections switch via the TopBar tabs (nav.section-tabs, one button
// per SECTIONS entry, in order) and subs via the SectionRail buttons
// (nav.section-rail, one button per sub, in order; rendered only on
// wide layouts and only when the section has more than one sub).
//
// These are the supported page-click paths. Clicking the flow text
// headings is NOT viable from automation: any programmatic scroll or
// focus() feeds the scrollspy, whose debounced settle re-selects the
// sub at the reading line and overrides the click.
// -----------------------------------------------------------------------

/**
 * Switch sections by clicking the TopBar tab at `sectionIndex`
 * (SECTIONS order). Tabs are always-visible buttons, so a plain
 * locator click is safe.
 */
export async function clickSectionTab(
  page: Page,
  sectionIndex: number,
): Promise<void> {
  const tab = page
    .locator("nav.section-tabs button.section-tab")
    .nth(sectionIndex);
  await tab.waitFor({ state: "visible", timeout: 5_000 });
  await tab.click();
}

/**
 * Select a sub-section by clicking the SectionRail button at
 * `subIndex` (the active section's subs, in taxonomy order). The rail
 * only renders on wide layouts for multi-sub sections; callers must
 * skip single-sub sections.
 */
export async function clickRailSub(
  page: Page,
  subIndex: number,
): Promise<void> {
  const item = page.locator("nav.section-rail button.rail-item").nth(subIndex);
  await item.waitFor({ state: "visible", timeout: 5_000 });
  await item.click();
}

// -----------------------------------------------------------------------
// Frame presets
// -----------------------------------------------------------------------

/**
 * Switch the phone frame to the desktop preset via its toolbar button
 * and wait until the iframe's viewport has crossed the client's
 * 1024px desktop breakpoint (the preset yields ~1350px, see
 * DESKTOP_PRESET in frame-geometry.svelte.ts). The client app inside
 * the iframe then renders its desktop shell.
 */
export async function enterDesktopPreset(page: Page): Promise<void> {
  const button = page.getByRole("button", { name: "Desktop size" });
  await button.waitFor({ state: "visible", timeout: 5_000 });
  await button.click();

  await page.waitForFunction(
    () => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        "iframe.phone-iframe",
      );
      const win = iframe?.contentWindow;
      if (win === null || win === undefined) return false;
      return win.matchMedia("(min-width: 1024px)").matches;
    },
    undefined,
    { timeout: 15_000 },
  );

  // Shrink the frame's visual footprint. At the full desktop preset
  // (760x475) in the test viewport, the frame covers the reading line
  // and the flow hole leaves only a narrow text column; rail clicks
  // then fail to converge (the alignment target and the derived
  // selection disagree around the hole). Shrinking is purely visual:
  // the iframe keeps its 1350x844 desktop viewport, so every screen
  // still renders the desktop shell.
  const shrink = page.getByRole("button", { name: "Shrink the frame" });
  await shrink.waitFor({ state: "visible", timeout: 5_000 });
  await shrink.click();
}

// -----------------------------------------------------------------------
// Pulse log access
// -----------------------------------------------------------------------

/**
 * Read the pulse log from the phone iframe window. Returns null when
 * the log array is undefined (pulse-log.ts not wired yet).
 */
export async function readPulseLog(
  page: Page,
): Promise<PulseLogEntry[] | null> {
  const result = await page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.phone-iframe",
    );
    if (iframe === null) return null;
    const win = iframe.contentWindow;
    if (win === null) return null;

    // The pulse-log module's global Window augmentation types this
    const log = win.__demoPulseLog;
    if (log === undefined) return null;
    // Copy the known fields so the result serializes cleanly. The
    // target snapshot rides along for the walk's viewport assertion.
    return log.map((entry) => ({
      topic: entry.topic,
      outcome: entry.outcome,
      target:
        entry.target === undefined
          ? undefined
          : {
              tag: entry.target.tag,
              label: entry.target.label,
              inViewport: entry.target.inViewport,
              rect: { ...entry.target.rect },
              navChrome: entry.target.navChrome,
            },
    }));
  });

  return result;
}

// -----------------------------------------------------------------------
// Highlight log access
// -----------------------------------------------------------------------

/**
 * Read the sub-section highlight log from the phone iframe window.
 * Returns null when the array is undefined (no highlight has run yet).
 *
 * Separate from the pulse log because a highlight is keyed by
 * sub-section rather than by topic, and several sub-sections carry no
 * topic at all.
 */
export async function readHighlightLog(
  page: Page,
): Promise<HighlightLogEntry[] | null> {
  return page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.phone-iframe",
    );
    if (iframe === null) return null;
    const win = iframe.contentWindow;
    if (win === null) return null;

    const log = win.__demoHighlightLog;
    if (log === undefined) return null;
    return log.map((entry) => ({
      sectionId: entry.sectionId,
      subSlug: entry.subSlug,
      outcome: entry.outcome,
      target:
        entry.target === undefined
          ? undefined
          : {
              tag: entry.target.tag,
              inViewport: entry.target.inViewport,
              rect: { ...entry.target.rect },
            },
    }));
  });
}

/** Whether a highlight ring is currently drawn inside the phone. */
export async function hasVisibleRing(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.phone-iframe",
    );
    const doc = iframe?.contentDocument ?? null;
    if (doc === null) return false;
    return doc.querySelector('[data-demo-highlight-ring="true"]') !== null;
  });
}
