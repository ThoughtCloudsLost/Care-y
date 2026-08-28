/**
 * Chrome placement is a contract, not a convention.
 *
 * Sharing layout primitives stops the two surfaces looking different and
 * does nothing to stop a control appearing in a different place on each,
 * which is exactly what happened: the language picker landed in the client
 * drawer footer while the org app, the onboarding layout, and the login
 * page all put it in the navbar, and the client navbar rendered the org
 * icon in its center title while the org app renders identity on the left.
 *
 * So every chrome slot is named here, and each shell must supply a fill or
 * an explicit omission carrying its reason. A slot added to this list fails
 * to compile in both shells until someone decides what each surface does
 * with it. Silence stops being an answer, following ADR-086's reasoning for
 * router dependency groups.
 *
 * The type enforces declaration, not rendering, so `chrome-contract.test.ts`
 * pairs it with assertions against what each shell actually renders.
 */

/** Every chrome slot the product has. */
export const CHROME_SLOTS = [
  "identity",
  "language",
  "globalSearch",
  "threadSearch",
  "quickExit",
  "toasts",
  "tabbar",
  "desktopRail",
  "callIndicator",
  "pullToRefresh",
  "sectionRail",
] as const;

export type ChromeSlotName = (typeof CHROME_SLOTS)[number];

/**
 * The test id a slot renders under, wherever it is filled. One per slot
 * rather than one per shell, so a shell cannot claim to fill a slot with
 * something else, and so the omission check has a specific thing to look
 * for rather than a vague absence.
 */
export const CHROME_SLOT_TEST_IDS = {
  identity: "shell-identity",
  language: "shell-language",
  globalSearch: "shell-global-search",
  threadSearch: "shell-thread-search",
  quickExit: "quick-exit",
  toasts: "shell-toasts",
  tabbar: "shell-tabbar",
  desktopRail: "shell-desktop-rail",
  callIndicator: "shell-call-indicator",
  pullToRefresh: "shell-ptr",
  sectionRail: "shell-section-rail",
} as const satisfies Record<ChromeSlotName, string>;

/**
 * Where a filled slot sits. Two shells that both fill a slot must name the
 * same position, which is the part of the contract that stops a control
 * drifting to a different corner of one surface.
 */
export type ChromePosition =
  | "navbar-leading"
  | "navbar-center"
  | "navbar-trailing"
  | "navbar-subrow"
  | "bottom-bar"
  | "side-rail"
  | "drawer"
  | "overlay";

export interface ChromeSlotFill {
  readonly position: ChromePosition;
  /**
   * True when the shell renders it in its own default state at the default
   * viewport. The contract test asserts presence only for these, because a
   * slot gated on a viewport, a page, or live data has nothing to assert
   * against in a bare render.
   */
  readonly rendersByDefault: boolean;
  /**
   * Required when `rendersByDefault` is false: what gates it, or which
   * component above the shell mounts it. A conditional fill with no stated
   * condition is the silence this contract exists to prevent.
   */
  readonly gatedBy?: string;
  /** Anything else worth recording about how this shell fills the slot. */
  readonly note?: string;
}

export type ChromeSlot =
  { readonly fill: ChromeSlotFill } | { readonly omitted: string };

export type ShellChromeSlots = Readonly<Record<ChromeSlotName, ChromeSlot>>;

/** Narrowing helper for the contract test and any future consumer. */
export function isFilled(
  slot: ChromeSlot,
): slot is { readonly fill: ChromeSlotFill } {
  return "fill" in slot;
}
