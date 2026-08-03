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
const DEFAULT_RECT = { x: 0, y: 56, w: 390, h: 220 };

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
  "login/credentials": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "login/language": {
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
  "dashboard/intro": {
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

  // -- tickets --
  "tickets/sort": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "tickets/filters": {
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
  "tickets/new-ticket": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- ticket-detail --
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
  "ticket-detail/timeline": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- search --
  "search/intro": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- library --
  "library/intro": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "library/vote": {
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
  "admin/intro": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin/people-queues": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin/org-config-keys": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin/communications": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin/greetings": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "admin/quarantine": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- schedule --
  "schedule/intro": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },

  // -- settings --
  "settings/intro": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "settings/profile-identity": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "settings/password-keys": {
    selector: null,
    fallbackRect: { ...DEFAULT_RECT },
  },
  "settings/two-factor-methods": {
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
