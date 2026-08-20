/**
 * Effect-assertion contract for the story walk. An EffectSpec describes
 * the visible response the phone must show after a topic's pulse runs:
 * the sheet it opens, the mode toolbar it reveals, the panel it renders.
 *
 * Selectors are Playwright locator strings evaluated inside the phone
 * iframe via page.frameLocator("iframe.phone-iframe").locator(sel).
 * Prefer data-testid and stable classes taken from client source; cite
 * the source file and line in a comment next to each selector.
 *
 * Tap topics assert the visible response of the tap (the sheet it
 * opens, the mode it enables). Mark-only topics assert PRESENCE: the
 * section or feature surface the narration refers to must be visible
 * in the phone frame. Presence specs are independent verification;
 * the generic in-viewport assertion in walk-suite.ts only trusts the
 * demo's self-reported target, so a wrong-element fallback would pass
 * it. Omit a topic only when its pulse is allowlisted as missing (see
 * pulse-allowlist.ts) or no stable selector exists; say why in a
 * comment.
 */

import type { DemoTopic } from "../../packages/demo/src/lib/bridge.js";

export interface EffectSpec {
  /** One line naming the visible response being asserted. */
  readonly description: string;
  /**
   * Locator strings that must all be visible inside the phone iframe
   * after the pulse. First-match semantics: each selector is asserted
   * via locator(sel).first().
   */
  readonly visible: readonly string[];
  /**
   * Locator strings that must NOT be visible. Use sparingly, for
   * effects whose proof is a disappearance (e.g. a dismissed hint).
   */
  readonly hidden?: readonly string[];
  /** Wait budget in ms for the effect to appear. Default 10_000. */
  readonly timeout?: number;
  /**
   * Restrict the spec to one frame preset. Omit for both. The
   * split-view effect, for example, exists only at desktop width.
   */
  readonly framePreset?: "phone" | "desktop";
}

export type EffectMap = ReadonlyMap<DemoTopic, EffectSpec>;
