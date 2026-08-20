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
import { findAllowlistEntry } from "./pulse-allowlist.js";
import type { AllowlistEntry } from "./pulse-allowlist.js";
import { EFFECTS } from "./effects/index.js";
import type { EffectSpec } from "./effects/types.js";

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
// Assertion gap helper
//
// Three-way branch shared by pulse, viewport, and effect assertions:
// allowlisted topics produce a warning annotation; PULSE_AUDIT=1 logs
// the gap without failing (audit mode enumerates every gap in one run,
// never green-lights a merge); everything else is a hard failure.
// -----------------------------------------------------------------------

interface AssertionGap {
  readonly tag: "PULSE GAP" | "VIEWPORT GAP" | "EFFECT GAP";
  readonly description: string;
  readonly failMessage: string;
  readonly logSuffix: string;
}

function assertOrAnnotateGap(
  testInfo: ReturnType<typeof test.info>,
  topic: string,
  framePreset: "phone" | "desktop",
  allowed: AllowlistEntry | undefined,
  gap: AssertionGap,
): void {
  if (allowed !== undefined) {
    testInfo.annotations.push({
      type: "warning",
      description: `${gap.description} (allowlisted: ${allowed.reason})`,
    });
    console.log(
      `${gap.tag} allowlisted: ${framePreset}:${topic} (${gap.logSuffix})`,
    );
    return;
  }

  if (process.env.PULSE_AUDIT === "1") {
    console.log(`${gap.tag}: ${framePreset}:${topic} (${gap.logSuffix})`);
    testInfo.annotations.push({
      type: "warning",
      description: `${gap.tag} (audit): ${topic} ${gap.logSuffix}`,
    });
    return;
  }

  expect(false, gap.failMessage).toBe(true);
}

// -----------------------------------------------------------------------
// Suite builder
// -----------------------------------------------------------------------

export interface StoryWalkOptions {
  /** Describe title, so the two registrations report distinctly. */
  readonly title: string;
  /**
   * Frame preset name for the allowlist lookup. "phone" when default,
   * "desktop" when the desktop preset is active.
   */
  readonly framePreset?: "phone" | "desktop";
  /**
   * Runs once after the page reaches #login with the engine booted,
   * before the walk starts. The desktop suite switches the frame
   * preset here.
   */
  readonly prepare?: (page: Page) => Promise<void>;
}

export function defineStoryWalk(options: StoryWalkOptions): void {
  const framePreset = options.framePreset ?? "phone";

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
      try {
        await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT / 2);
      } catch {
        // Rare engine-boot hang: the phone renders (bridge alive,
        // login form painted) but engineReady never flips. Reload
        // once and log so occurrences stay countable; the hang is
        // tracked with the iOS Safari boot investigation.
        console.log("BOOT HANG: engine not ready in 60s, reloading once");
        await page.reload();
        await waitForPhoneBridge(page, ENGINE_BOOT_TIMEOUT);
      }
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
        // Budget per section: sub-heavy sections (ticket-detail has 15
        // subs) cannot fit the config's default 120s when a convergence
        // retry fires; give each sub room for one full retry cycle.
        test.setTimeout(30_000 + section.subs.length * 60_000);

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
          try {
            await awaitConvergence(page, expected, {
              timeout: CONVERGENCE_TIMEOUT,
              minLocationSeq: skipSeq || !hasRail ? 0 : minSeq,
            });
          } catch (err: unknown) {
            // The phone legitimately moves the location on its own
            // behind a rail click: the scripted login auto-plays when
            // the story sits at login (a rewind to "form" auto-clicks
            // Sign in), and pulse taps are real interactions the phone
            // classifies and publishes as phone-origin moves. When such
            // an echo lands after the click, the story is pinned to the
            // previous sub. A visitor would simply click again once the
            // phone settles; do the same (twice at most: the login
            // auto-play can override two clicks in a row while its
            // choreography drains). A genuinely broken navigation
            // still fails after the retries.
            if (!hasRail) throw err;

            const MAX_RETRIES = 2;
            let converged = false;
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
              // The rail is section-scoped: if the failed convergence
              // left the story on a DIFFERENT section, restore the
              // section tab first or the rail re-click would hit the
              // wrong section's subs. (Never reached for login, whose
              // failures keep the section; a login tab click would
              // reset the scripted flow.)
              const current = await readBridgeState(page);
              if (current.location.sectionId !== section.id) {
                await clickSectionTab(page, sectionIndex);
                await awaitConvergence(
                  page,
                  { feature: cmd.feature, sectionId: section.id },
                  { timeout: CONVERGENCE_TIMEOUT, minLocationSeq: 0 },
                );
              }

              const retrySeqBase =
                (await readBridgeState(page)).locationSeq + 1;
              await clickRailSub(page, si);
              try {
                await awaitConvergence(page, expected, {
                  timeout: CONVERGENCE_TIMEOUT,
                  minLocationSeq: skipSeq ? 0 : retrySeqBase,
                });
                converged = true;
                break;
              } catch (retryErr: unknown) {
                if (attempt === MAX_RETRIES - 1) throw retryErr;
              }
            }
            if (!converged) throw err;
          }

          // Pulse assertion: when the sub has a topic, verify the pulse
          // log recorded a successful outcome for it. Topics on the
          // allowlist produce a warning annotation instead of a hard
          // failure; all other "missing" outcomes fail the test.
          //
          // Desktop-only subs (e.g. split-view) are skipped on the
          // phone preset: the phone demo never shows them, so no pulse
          // log entry is recorded and asserting one would always fail.
          if (
            sub.topic !== null &&
            !(sub.desktopOnly === true && framePreset === "phone")
          ) {
            const countBefore = pulseCountBefore;
            const topic = sub.topic;
            const allowed = findAllowlistEntry(topic, framePreset);

            // Poll briefly for a new pulse entry with this topic
            let pulseFound = false;
            try {
              await expect
                .poll(
                  async () => {
                    const log = await readPulseLog(page);
                    if (log === null) return "unavailable";

                    // Check entries added after countBefore
                    const newEntries = log.slice(countBefore);
                    const entry = newEntries.find(
                      (e) => e.topic === topic && e.outcome !== "missing",
                    );
                    return entry !== undefined ? "found" : "waiting";
                  },
                  // Must outlast the pulse resolver's 12s window
                  // (POLL_TIMEOUT_LONG_MS): a pulse landing on a
                  // still-compiling route (cold dev-server chunk
                  // graph) records its outcome late, and a lapsed
                  // poll misreports a working pulse as a gap.
                  { timeout: 15_000, intervals: [500, 1_000, 2_000] },
                )
                .toBe("found");
              pulseFound = true;
            } catch {
              // Determine the failure reason from the log
              const currentLog = await readPulseLog(page);

              if (currentLog === null) {
                // Pulse log not wired: always a hard failure (the infra
                // should be present now).
                expect(
                  currentLog,
                  `Pulse log unavailable for topic "${topic}"`,
                ).not.toBeNull();
              } else {
                const newEntries = currentLog.slice(countBefore);
                const missing = newEntries.find(
                  (e) => e.topic === topic && e.outcome === "missing",
                );
                const outcome = missing !== undefined ? "missing" : "no entry";

                assertOrAnnotateGap(test.info(), topic, framePreset, allowed, {
                  tag: "PULSE GAP",
                  description: `Pulse for "${topic}" resolved as "${outcome}"`,
                  failMessage:
                    `Pulse for "${topic}" resolved as "${outcome}" and is not on the allowlist. ` +
                    `Add it to pulse-allowlist.ts with a reason if this gap is accepted.`,
                  logSuffix: outcome,
                });
              }
            }

            // When an allowlisted topic unexpectedly succeeds, annotate
            // so the allowlist can be shrunk manually. Do not fail.
            if (pulseFound && allowed !== undefined) {
              test.info().annotations.push({
                type: "info",
                description:
                  `Pulse for "${topic}" succeeded but is still allowlisted. ` +
                  `Consider removing it from pulse-allowlist.ts.`,
              });
              console.log(`PULSE allowlist-shrink candidate: ${topic}`);
            }

            // LAYER 1: viewport assertion
            //
            // When the pulse was found, verify the target element was
            // inside the phone viewport. The demo instrumentation
            // records a target snapshot for every non-missing outcome;
            // its absence or a false inViewport is a gap.
            if (pulseFound) {
              const viewportLog = await readPulseLog(page);
              if (viewportLog !== null) {
                const viewportEntries = viewportLog.slice(countBefore);
                const foundEntry = viewportEntries.find(
                  (e) => e.topic === topic && e.outcome !== "missing",
                );
                if (foundEntry?.target?.inViewport !== true) {
                  const vpDetail =
                    foundEntry?.target === undefined
                      ? "no target recorded"
                      : "target outside viewport";
                  assertOrAnnotateGap(
                    test.info(),
                    topic,
                    framePreset,
                    allowed,
                    {
                      tag: "VIEWPORT GAP",
                      description: `Pulse for "${topic}" ${vpDetail}`,
                      failMessage:
                        `Pulse for "${topic}" marked an element that is outside the phone viewport ` +
                        `(or recorded no target). The choreography should scroll the target into ` +
                        `view before marking.`,
                      logSuffix: vpDetail,
                    },
                  );
                }
              }
            }

            // LAYER 2: effect assertions (live iframe DOM inspection)
            //
            // This is the only layer that inspects the live iframe DOM
            // rather than trusting the demo's self-reported log, so it
            // runs even when the pulse failed or the topic is allowlisted.
            {
              const spec: EffectSpec | undefined = EFFECTS.get(topic);
              if (
                spec !== undefined &&
                (spec.framePreset === undefined ||
                  spec.framePreset === framePreset)
              ) {
                const phoneFrame = page.frameLocator("iframe.phone-iframe");
                const effectTimeout = spec.timeout ?? 10_000;

                for (const sel of spec.visible) {
                  try {
                    await expect(phoneFrame.locator(sel).first()).toBeVisible({
                      timeout: effectTimeout,
                    });
                  } catch {
                    assertOrAnnotateGap(
                      test.info(),
                      topic,
                      framePreset,
                      allowed,
                      {
                        tag: "EFFECT GAP",
                        description: `Effect for "${topic}": expected visible selector "${sel}" (${spec.description})`,
                        failMessage:
                          `Effect for "${topic}": selector "${sel}" was not visible after ` +
                          `${String(effectTimeout)}ms. ${spec.description}`,
                        logSuffix: `visible: ${sel}`,
                      },
                    );
                  }
                }

                if (spec.hidden !== undefined) {
                  for (const sel of spec.hidden) {
                    try {
                      await expect(
                        phoneFrame.locator(sel).first(),
                      ).not.toBeVisible({ timeout: effectTimeout });
                    } catch {
                      assertOrAnnotateGap(
                        test.info(),
                        topic,
                        framePreset,
                        allowed,
                        {
                          tag: "EFFECT GAP",
                          description: `Effect for "${topic}": expected hidden selector "${sel}" (${spec.description})`,
                          failMessage:
                            `Effect for "${topic}": selector "${sel}" was still visible after ` +
                            `${String(effectTimeout)}ms. ${spec.description}`,
                          logSuffix: `hidden: ${sel}`,
                        },
                      );
                    }
                  }
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
