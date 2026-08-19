/**
 * Crop registry: maps subsection keys to crop strategies.
 *
 * Each subsection can specify either a named element (a CSS selector
 * resolved inside the phone iframe at capture time) or an authored
 * fallback rect (viewport-space coordinates within the 390x844 phone).
 *
 * When a named element is present, the capture script measures its
 * bounding box at runtime and uses that as the crop region. This lets
 * the crop track UI changes without manual re-authoring.
 *
 * When no named element is set (or the element is not found), the
 * authored fallback rect is used. Every entry ships with the spec's
 * default fallback (roughly 390x220 centered near the top of the
 * viewport) and can be refined per-sub in a later tuning pass.
 *
 * @module
 */

/**
 * @typedef {Object} CropEntry
 * @property {string | null} selector
 *   CSS selector to resolve inside the phone iframe. Null means "use
 *   the authored rect only."
 * @property {{ x: number, y: number, w: number, h: number }} fallbackRect
 *   Viewport-space rect within the 390x844 phone. Used when selector
 *   is null or the element cannot be found at capture time.
 * @property {boolean} [scroll]
 *   When true, the capture script scrolls one subsection's worth of
 *   travel during recording. Defaults to false.
 */

/**
 * The spec's default region crop: roughly 390x220, positioned near
 * the top of the viewport to capture the primary content area below
 * the navbar.
 */
import { DEFAULT_CROP_W, DEFAULT_CROP_H } from "./constants.mjs";

const DEFAULT_RECT = { x: 0, y: 56, w: DEFAULT_CROP_W, h: DEFAULT_CROP_H };

/**
 * Crop registry keyed by "sectionId/subSlug".
 *
 * Entries populated for all sections from scroll-sections.ts. The
 * selector field is null everywhere for now; per-sub element selectors
 * are a later tuning pass. The fallback rect uses DEFAULT_RECT as a
 * starting point and will be refined per-sub as clips are reviewed.
 *
 * @type {Readonly<Record<string, CropEntry>>}
 */
export const CROP_REGISTRY = {
  // -- login --
  "login/language": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "login/credentials": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "login/two-factor": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "login/totp": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "login/passkey": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "login/email": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "login/sms": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "login/push": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "login/backup-codes": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "login/key-derivation": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- dashboard --
  "dashboard/shift": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "dashboard/queues": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "dashboard/activity": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "dashboard/kb": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "dashboard/view-switcher": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "dashboard/getting-started": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "dashboard/needs-attention": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "dashboard/my-tickets": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "dashboard/unassigned": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "dashboard/on-hold": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "dashboard/create": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- tickets --
  "tickets/sort": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/filters": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/saved-filters": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/view-modes": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/select-mode": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/page-search": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/quick-actions": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/unread-badges": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/decryption": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/stats": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/new-ticket": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/split-view": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- ticket-detail --
  "ticket-detail/case-header": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/conversation": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/thread-anatomy": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/thread-filters": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/compose-actions": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/reply": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/notes": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/case-fold": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/case-panel": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/timeline": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/deep-search": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/message-actions": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/message-select": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/close-reopen": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "ticket-detail/exposure-hints": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- search --
  "search/overlay": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "search/how-it-works": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "search/entities": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- library --
  "library/browse": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "library/tools": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "library/detail": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "library/attachments": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "library/vote": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "library/search": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "library/categories": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "library/editor": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- admin --
  "admin/hub": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- admin-people --
  "admin-people/people": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-people/roster-tools": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-people/queues": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-people/clients": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-people/client-merge": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-people/roles": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- admin-comms --
  "admin-comms/phone-lines": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-comms/provider": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-comms/greetings": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-comms/sms-templates": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-comms/blocklist": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-comms/quarantine": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- admin-org --
  "admin-org/general": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-org/branding": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-org/terminology": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-org/note-types": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-org/keys": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin-org/retention": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- schedule --
  "schedule/intro": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- settings --
  "settings/identity": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "settings/password": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "settings/two-factor": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "settings/appearance": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "settings/security": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
};

/**
 * Look up the crop entry for a subsection.
 *
 * @param {string} sectionId
 * @param {string} subSlug
 * @returns {CropEntry | undefined}
 */
export function getCropEntry(sectionId, subSlug) {
  return CROP_REGISTRY[`${sectionId}/${subSlug}`];
}

/**
 * List all registered subsection keys.
 *
 * @returns {string[]} Array of "sectionId/subSlug" strings.
 */
export function registeredSubs() {
  return Object.keys(CROP_REGISTRY);
}
