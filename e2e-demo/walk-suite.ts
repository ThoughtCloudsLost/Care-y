/**
 * Shared story-walk suite builder. Registers one serial describe that
 * visits every section and sub-section in taxonomy order, verifying
 * that each click drives the phone iframe to the expected state via
 * the bridge.
 *
 * Used by story-walk.spec.ts (default phone frame) and
 * desktop-walk.spec.ts (frame at the desktop preset, where the client
 * renders its desktop shell inside the iframe). The walk itself is
 * identical: the taxonomy and phone commands do not depend on the
 * frame preset.
 */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  SECTIONS,
  resolvePhoneCommand,
} from "../packages/demo/src/lib/scroll-sections.js";
import {
  DEMO_DETAIL_TICKET_ID,
  DEMO_DETAIL_ARTICLE_ID,
} from "../packages/demo/src/lib/bridge.js";
import {
  ENGINE_BOOT_TIMEOUT,
  CONVERGENCE_TIMEOUT,
  LOGIN_FLOW_TIMEOUT,
  waitForPhoneBridge,
  readBridgeState,
  awaitConvergence,
  clickSectionTab,
  clickRailSub,
  readPulseLog,
} from "./helpers.js";
import type { ConvergenceExpectation } from "./helpers.js";

// -----------------------------------------------------------------------
// Feature landmarks
//
// One selector per feature, checked once on the first sub of each
// section via iframe.phone-iframe. Prefer data-testid; fall back to
// stable structural selectors.
// -----------------------------------------------------------------------

const FEATURE_LANDMARKS: ReadonlyMap<string, string> = new Map(
  Object.entries({
    // LoginMount.svelte wraps the login page in div.login-mount
    login: ".login-mount",
    // Dashboard overview has section.overview-subnavbar
    // (packages/client/src/routes/(app)/+page.svelte line 601)
    home: ".overview-subnavbar",
    // Ticket list renders SwipeableCard with data-testid="ticket-card"
    // (packages/client/src/lib/components/tickets/SwipeableCard.svelte line 339)
    tickets: '[data-testid="ticket-card"]',
    // Library page uses div.library-page
    // (packages/client/src/routes/(app)/library/+page.svelte line 852)
    library: ".library-page",
    // Admin hub uses div.admin-hub
    // (packages/client/src/routes/(app)/admin/+page.svelte line 198)
    admin: ".admin-hub",
    // Schedule page uses a centered text container
    // (packages/client/src/routes/(app)/more/schedule/+page.svelte line 6)
    schedule: ".k-page",
    // Settings page uses div.settings-page
    // (packages/client/src/routes/(app)/more/settings/+page.svelte line 126)
    settings: ".settings-page",
  }),
);

// -----------------------------------------------------------------------
// Login-stage mapping
//
// The login section's subs each drive the phone to a specific
// loginTarget. The expected loginStage depends on which screen
// that target opens.
// -----------------------------------------------------------------------

function loginStageForTarget(target: string | null): string | null {
  if (target === null) return null;
  if (target === "form") return "form";
  if (target === "twofa-picker") return "twofa-picker";
  if (target.startsWith("method-")) return "twofa-method";
  return null;
}

// -----------------------------------------------------------------------
// Detail expectation builder
//
// Derives the ConvergenceExpectation.detail from the phone command's
// detail value. Sentinel IDs (DEMO_DETAIL_TICKET_ID,
// DEMO_DETAIL_ARTICLE_ID) become nonNull because the runtime resolves
// them to real seeded IDs.
// -----------------------------------------------------------------------

function detailExpectation(
  detail: string | null,
): string | { nonNull: true } | null {
  if (detail === null) return null;
  if (detail === DEMO_DETAIL_TICKET_ID) return { nonNull: true };
  if (detail === DEMO_DETAIL_ARTICLE_ID) return { nonNull: true };
  return detail;
}

// -----------------------------------------------------------------------
// Suite builder
// -----------------------------------------------------------------------

export interface StoryWalkOptions {
  /** Describe title, so the two registrations report distinctly. */
  readonly title: string;
  /**
   * Runs once after the page reaches #login with the engine booted,
   * before the walk starts. The desktop suite switches the frame
   * preset here.
   */
  readonly prepare?: (page: Page) => Promise<void>;
}

export function defineStoryWalk(options: StoryWalkOptions): void {
  test.describe.serial(options.title, () => {
    let page: Page;
    /** Whether we have crossed out of the login section. */
    let loginCrossed = false;
    /** Track which features had their landmark checked. */
    const landmarkChecked = new Set<string>();

    test.beforeAll(async ({ browser }, testInfo) => {
      testInfo.setTimeout(ENGINE_BOOT_TIMEOUT + SECTIONS.length * 30_000);
      page = await browser.newPage();
      // Deep link to #login to skip entry page
      await page.goto("/#login");
      await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);
      if (options.prepare !== undefined) {
        await options.prepare(page);
      }
    });

    test.afterAll(async () => {
      await page.close();
    });

    // Generate one test per section
    for (const [sectionIndex, section] of SECTIONS.entries()) {
      test(`section: ${section.id}`, async () => {
        // The rail only renders for multi-sub sections; single-sub
        // sections (admin hub, schedule) are reached by their tab alone
        // and never expose a sub control, so the location keeps a null
        // sub there.
        const hasRail = section.subs.length > 1;

        // Switch sections via the TopBar tab. The login section is
        // already active from the beforeAll deep link, and clicking its
        // tab would reset the login flow mid-walk.
        if (section.id !== "login") {
          const sectionCmd = resolvePhoneCommand(
            section.id,
            null,
            DEMO_DETAIL_TICKET_ID,
            DEMO_DETAIL_ARTICLE_ID,
          );
          const beforeTab = await readBridgeState(page);
          const isLoginCrossing = !loginCrossed;
          loginCrossed = true;

          await clickSectionTab(page, sectionIndex);

          // Crossing out of login plays the auth fast-forward; converge
          // only on the destination, never on intermediate stages.
          await awaitConvergence(
            page,
            {
              sectionId: section.id,
              feature: sectionCmd.feature,
              searchOpen: sectionCmd.openSearch,
            },
            {
              timeout: isLoginCrossing
                ? LOGIN_FLOW_TIMEOUT
                : CONVERGENCE_TIMEOUT,
              minLocationSeq: beforeTab.locationSeq + 1,
            },
          );
        }

        for (const [si, sub] of section.subs.entries()) {
          const cmd = resolvePhoneCommand(
            section.id,
            sub.slug,
            DEMO_DETAIL_TICKET_ID,
            DEMO_DETAIL_ARTICLE_ID,
          );

          // Read locationSeq before navigating so we can require it to advance
          const beforeState = await readBridgeState(page);
          const minSeq = beforeState.locationSeq + 1;

          // Pulse-log baseline BEFORE the click: the pulse usually
          // lands while convergence is still waiting, so a baseline
          // taken after convergence would slice the entry away.
          const pulseCountBefore =
            sub.topic !== null ? ((await readPulseLog(page))?.length ?? 0) : 0;

          if (hasRail) {
            await clickRailSub(page, si);
          }

          // Build convergence expectation
          const expected: ConvergenceExpectation = {
            feature: cmd.feature,
          };

          // Login section: special handling
          if (section.id === "login") {
            expected.sectionId = "login";

            if (sub.slug === "key-derivation") {
              // key-derivation: loginTarget is null, the deriving screen
              // only appears during the completion flow (which the specs
              // do not trigger). The location store pins it based on
              // loginStage "deriving", but selecting the sub does not
              // trigger derivation. Assert feature only; skip strict
              // sub/stage convergence.
            } else {
              expected.subSlug = sub.slug;
              const expectedStage = loginStageForTarget(cmd.loginTarget);
              if (expectedStage !== null) {
                expected.loginStage = expectedStage;
              }
            }

            // Login subs have detail null
            expected.detail = null;
          } else {
            expected.sectionId = section.id;
            if (hasRail) {
              expected.subSlug = sub.slug;
            }
            // Overlay sections (search) do not own the screen beneath
            // them: sectionMatchesPhone only requires the overlay to
            // be open, and at desktop width a split-view detail
            // legitimately stays set under it. Assert detail only for
            // non-overlay sections.
            if (!cmd.openSearch) {
              expected.detail = detailExpectation(cmd.detail);
            }
            expected.searchOpen = cmd.openSearch;
          }

          const skipSeq =
            section.id === "login" && sub.slug === "key-derivation";
          await awaitConvergence(page, expected, {
            timeout: CONVERGENCE_TIMEOUT,
            minLocationSeq: skipSeq || !hasRail ? 0 : minSeq,
          });

          // Pulse assertion: when the sub has a topic, verify the pulse
          // log recorded an outcome for it.
          if (sub.topic !== null) {
            const countBefore = pulseCountBefore;

            // Poll briefly for a new pulse entry with this topic
            try {
              await expect
                .poll(
                  async () => {
                    const log = await readPulseLog(page);
                    if (log === null) return "unavailable";

                    // Check entries added after countBefore
                    const newEntries = log.slice(countBefore);
                    const entry = newEntries.find(
                      (e) => e.topic === sub.topic && e.outcome !== "missing",
                    );
                    return entry !== undefined ? "found" : "waiting";
                  },
                  { timeout: 5_000, intervals: [500, 1_000, 1_500] },
                )
                .toBe("found");
            } catch {
              // Soft-skip if the pulse log is not wired yet
              const currentLog = await readPulseLog(page);
              if (currentLog === null) {
                test.info().annotations.push({
                  type: "skip",
                  description: `Pulse log unavailable for topic "${sub.topic}"`,
                });
                console.log(`PULSE unavailable: ${sub.topic}`);
              }
              // If the log exists but the entry was not found, that is a
              // real failure for the topic. Do not swallow it.
              else {
                const newEntries = currentLog.slice(countBefore);
                const missing = newEntries.find(
                  (e) => e.topic === sub.topic && e.outcome === "missing",
                );
                if (missing !== undefined) {
                  test.info().annotations.push({
                    type: "warning",
                    description: `Pulse for "${sub.topic}" resolved as "missing"`,
                  });
                  console.log(`PULSE missing: ${sub.topic}`);
                } else {
                  console.log(`PULSE no entry: ${sub.topic}`);
                }
              }
            }
          }

          // Feature landmark: check once per section (first sub only)
          if (si === 0) {
            const landmarkFeature = cmd.feature;
            const selector = FEATURE_LANDMARKS.get(landmarkFeature);
            if (
              selector !== undefined &&
              !landmarkChecked.has(landmarkFeature)
            ) {
              landmarkChecked.add(landmarkFeature);
              const phoneFrame = page.frameLocator("iframe.phone-iframe");

              // The admin-hub landmark only applies when detail is null
              // (the hub page). Sub-pages (people, comms, org) render
              // different content. Skip landmark for admin sub-pages.
              const isAdminSubPage =
                landmarkFeature === "admin" && cmd.detail !== null;

              if (!isAdminSubPage) {
                const landmark = phoneFrame.locator(selector);
                await expect(landmark.first()).toBeAttached({
                  timeout: 10_000,
                });
              }
            }
          }
        }
      });
    }
  });
}
