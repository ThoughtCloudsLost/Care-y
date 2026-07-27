/**
 * F6 tap pulse: ShowTime-style translucent circular touch marker.
 *
 * pulse(topic) finds the element owning that topic by reverse label
 * matching and renders a semi-transparent circle at its center that
 * fades out like a finger tap. If the topic's element lives on another
 * route, navigates first, waits for it to appear, then pulses.
 *
 * Under prefers-reduced-motion, renders a static marker that appears
 * and disappears without animation.
 */

import * as m from "$lib/paraglide/messages.js";
import { locales } from "$lib/paraglide/runtime.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import type { DemoTopic, DemoFeature } from "./bridge.js";
import { DEMO_DETAIL_TICKET_ID } from "./bridge.js";

// -----------------------------------------------------------------------
// Topic to feature mapping
// -----------------------------------------------------------------------

const LOGIN_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "credentials",
  "language",
  "twofa",
  "twofa-totp",
  "twofa-passkey",
  "twofa-email",
  "twofa-sms",
  "twofa-push",
  "twofa-backup",
  "key-derivation",
]);

const LIST_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "sort",
  "filters",
  "view-modes",
  "select-mode",
  "new-ticket",
]);

const DETAIL_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "thread-filters",
  "compose-actions",
  "reply",
  "notes",
  "case-fold",
  "timeline",
]);

/** Resolve the feature + detail a topic's element lives on. */
export function topicFeatureTarget(topic: DemoTopic): {
  feature: DemoFeature;
  detail: string | null;
} {
  if (LOGIN_TOPICS.has(topic)) {
    return { feature: "login", detail: null };
  }
  if (LIST_TOPICS.has(topic)) {
    return { feature: "tickets", detail: null };
  }
  if (DETAIL_TOPICS.has(topic)) {
    return { feature: "tickets", detail: DEMO_DETAIL_TICKET_ID };
  }
  return { feature: "tickets", detail: null };
}

// -----------------------------------------------------------------------
// Candidate string builder (mirrors classifier's message sets)
// -----------------------------------------------------------------------

/** Build all possible label strings for a topic across all locales. */
export function buildTopicCandidates(topic: DemoTopic): Set<string> {
  const candidates = new Set<string>();
  for (const locale of locales) {
    const opts = { locale };
    const terms = withTerms();

    switch (topic) {
      case "credentials":
        candidates.add(m.auth_sign_in({}, opts));
        candidates.add(m.auth_username({}, opts));
        candidates.add(m.auth_password({}, opts));
        break;
      case "twofa":
        candidates.add(m.twofa_totp_label({}, opts));
        candidates.add(m.twofa_passkey_use({}, opts));
        candidates.add(m.twofa_email_label({}, opts));
        candidates.add(m.twofa_sms_label({}, opts));
        candidates.add(m.twofa_push_label({}, opts));
        candidates.add(m.twofa_backup_codes_enter({}, opts));
        candidates.add(m.twofa_verify_submit({}, opts));
        break;
      case "twofa-totp":
        candidates.add(m.twofa_totp_label({}, opts));
        break;
      case "twofa-passkey":
        candidates.add(m.twofa_passkey_use({}, opts));
        break;
      case "twofa-email":
        candidates.add(m.twofa_email_label({}, opts));
        candidates.add(m.twofa_email_send_code({}, opts));
        break;
      case "twofa-sms":
        candidates.add(m.twofa_sms_label({}, opts));
        candidates.add(m.twofa_sms_send_code({}, opts));
        break;
      case "twofa-push":
        candidates.add(m.twofa_push_label({}, opts));
        candidates.add(m.twofa_push_send({}, opts));
        break;
      case "twofa-backup":
        candidates.add(m.twofa_backup_codes_enter({}, opts));
        break;
      case "key-derivation":
        candidates.add(m.auth_phase_argon2id({}, opts));
        candidates.add(m.auth_phase_oprf({}, opts));
        candidates.add(m.auth_phase_derive({}, opts));
        candidates.add(m.auth_phase_auth({}, opts));
        candidates.add(m.auth_phase_done({}, opts));
        break;
      case "language":
        candidates.add(m.language_picker_label({}, opts));
        break;
      case "sort":
        candidates.add(m.tickets_sort({}, opts));
        break;
      case "filters":
        candidates.add(m.tickets_filter(terms, opts));
        candidates.add(m.tickets_filter_status({}, opts));
        candidates.add(m.tickets_filter_queue(terms, opts));
        candidates.add(m.tickets_filter_priority({}, opts));
        candidates.add(m.tickets_filter_assignee({}, opts));
        candidates.add(m.tickets_filter_date_range({}, opts));
        candidates.add(m.tickets_create_shortcut({}, opts));
        break;
      case "view-modes":
        candidates.add(m.view_switcher_label({}, opts));
        candidates.add(m.view_switcher_table({}, opts));
        candidates.add(m.view_switcher_rows({}, opts));
        candidates.add(m.view_switcher_cards({}, opts));
        candidates.add(m.view_switcher_grid({}, opts));
        candidates.add(m.view_switcher_kanban({}, opts));
        break;
      case "select-mode":
        candidates.add(m.tickets_select_mode({}, opts));
        candidates.add(m.ticket_select_mode({}, opts));
        break;
      case "new-ticket":
        candidates.add(m.nav_new_ticket(terms, opts));
        break;
      case "thread-filters":
        candidates.add(m.tickets_filter(terms, opts));
        candidates.add(m.ticket_filter_type({}, opts));
        candidates.add(m.ticket_filter_author({}, opts));
        candidates.add(m.ticket_filter_date({}, opts));
        break;
      case "compose-actions":
        candidates.add(m.ticket_compose_actions({}, opts));
        break;
      case "reply":
        candidates.add(m.ticket_send({}, opts));
        candidates.add(m.ticket_sms_send({}, opts));
        break;
      case "notes":
        candidates.add(m.ticket_add_internal_note({}, opts));
        candidates.add(m.ticket_edit_note({}, opts));
        candidates.add(m.ticket_save_note({}, opts));
        break;
      case "case-fold":
        candidates.add(m.ticket_case_details(terms, opts));
        candidates.add(m.ticket_fold_case_details(terms, opts));
        break;
      case "timeline":
        candidates.add(m.ticket_action_timeline({}, opts));
        candidates.add(m.ticket_action_messages({}, opts));
        break;
    }
  }
  return candidates;
}

// -----------------------------------------------------------------------
// Activation (real tap) vocabulary
// -----------------------------------------------------------------------

/**
 * Topics whose activation performs a real tap on the resolved element,
 * so the phone demonstrates the feature instead of only marking it.
 * The rest stay visual-only: login stages are driven by the advance
 * chain, reply would mutate the thread, and the language picker is a
 * native select that ignores synthetic clicks.
 */
export const TAP_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "sort",
  "filters",
  "view-modes",
  "select-mode",
  "new-ticket",
  "thread-filters",
  "compose-actions",
  "notes",
  "case-fold",
  "timeline",
]);

/**
 * Candidates for the tap target. Narrower than the pulse candidates:
 * those include group labels and sibling controls that classify clicks
 * but must not receive one (tapping the "Messages" tab would classify
 * as timeline yet close the timeline).
 */
export function buildActivationCandidates(topic: DemoTopic): Set<string> {
  const candidates = new Set<string>();
  for (const locale of locales) {
    const opts = { locale };
    const terms = withTerms();

    switch (topic) {
      case "sort":
        candidates.add(m.tickets_sort({}, opts));
        break;
      case "filters":
        candidates.add(m.tickets_filter_status({}, opts));
        break;
      case "view-modes":
        candidates.add(m.view_switcher_cards({}, opts));
        break;
      case "select-mode":
        candidates.add(m.tickets_select_mode({}, opts));
        candidates.add(m.ticket_select_mode({}, opts));
        break;
      case "new-ticket":
        candidates.add(m.nav_new_ticket(terms, opts));
        break;
      case "thread-filters":
        candidates.add(m.ticket_filter_type({}, opts));
        break;
      case "compose-actions":
        candidates.add(m.ticket_compose_actions({}, opts));
        break;
      case "notes":
        candidates.add(m.ticket_add_internal_note({}, opts));
        break;
      case "case-fold":
        candidates.add(m.ticket_case_details(terms, opts));
        candidates.add(m.ticket_fold_case_details(terms, opts));
        break;
      case "timeline":
        candidates.add(m.ticket_action_timeline({}, opts));
        break;
      case "credentials":
      case "language":
      case "twofa":
      case "twofa-totp":
      case "twofa-passkey":
      case "twofa-email":
      case "twofa-sms":
      case "twofa-push":
      case "twofa-backup":
      case "key-derivation":
      case "reply":
        break;
    }
  }
  return candidates;
}

/** Resolve the element that should receive the tap: the match itself
 *  when interactive, else the nearest interactive descendant/ancestor. */
export function findClickableTarget(el: Element): HTMLElement | null {
  const interactiveSelector = 'button, [role="button"], a, .k-list-item';
  if (el instanceof HTMLElement && el.matches(interactiveSelector)) return el;
  const descendant = el.querySelector<HTMLElement>(interactiveSelector);
  if (descendant !== null) return descendant;
  return el.closest<HTMLElement>(interactiveSelector);
}

/**
 * Dismiss any open overlay (popover, sheet, action sheet) by clicking
 * its backdrop, so consecutive activations do not stack surfaces.
 * Overlays containing `except` are left open (the tap target may live
 * inside one).
 */
export function dismissOpenOverlays(except: Element | null): void {
  const backdrops = document.querySelectorAll<HTMLElement>(
    '[class*="backdrop"]',
  );
  for (const backdrop of backdrops) {
    if (!isVisible(backdrop)) continue;
    if (except !== null) {
      const overlay = except.closest(
        '[class*="popover"], [class*="sheet"], [class*="popup"], [class*="actions"]',
      );
      if (overlay !== null) continue;
    }
    backdrop.click();
  }
}

// -----------------------------------------------------------------------
// Element finder (reverse label matching)
// -----------------------------------------------------------------------

/** Find the first visible element matching a topic's candidate strings. */
export function findTopicElement(
  root: Document | Element,
  candidates: Set<string>,
): Element | null {
  // Check aria-label attributes
  const ariaLabeled = root.querySelectorAll("[aria-label]");
  for (const el of ariaLabeled) {
    if (!isVisible(el)) continue;
    const label = el.getAttribute("aria-label");
    if (label !== null && candidates.has(label)) return el;
  }

  // Check text content of interactive elements
  const interactive = root.querySelectorAll(
    'button, [role="button"], a, .k-list-item, label',
  );
  for (const el of interactive) {
    if (!isVisible(el)) continue;
    const text = el.textContent.trim().slice(0, 80);
    if (text !== "" && candidates.has(text)) return el;
  }

  // Check placeholder attributes on inputs
  const inputs = root.querySelectorAll("[placeholder]");
  for (const el of inputs) {
    if (!isVisible(el)) continue;
    const placeholder = el.getAttribute("placeholder");
    if (placeholder !== null && candidates.has(placeholder)) return el;
  }

  return null;
}

function isVisible(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// -----------------------------------------------------------------------
// Pulse marker rendering
// -----------------------------------------------------------------------

const MARKER_SIZE = 44;
const MARKER_DURATION_MS = 600;

/**
 * Render a ShowTime-style tap marker at the element's center.
 * The marker is a demo-owned overlay, never mutates product markup.
 */
export function renderPulseMarker(target: Element): void {
  const rect = target.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const marker = document.createElement("div");
  marker.setAttribute("aria-hidden", "true");

  Object.assign(marker.style, {
    position: "fixed",
    left: `${String(cx - MARKER_SIZE / 2)}px`,
    top: `${String(cy - MARKER_SIZE / 2)}px`,
    width: `${String(MARKER_SIZE)}px`,
    height: `${String(MARKER_SIZE)}px`,
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.15)",
    border: "1.5px solid rgba(0, 0, 0, 0.25)",
    pointerEvents: "none",
    zIndex: "99999",
    boxSizing: "border-box",
  });

  // Check reduced motion preference
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!reducedMotion) {
    Object.assign(marker.style, {
      opacity: "1",
      transform: "scale(1)",
      transition: `opacity ${String(MARKER_DURATION_MS)}ms ease-out, transform ${String(MARKER_DURATION_MS)}ms ease-out`,
    });
  }

  document.body.appendChild(marker);

  if (reducedMotion) {
    // Static: appear for duration, then remove
    setTimeout(() => {
      marker.remove();
    }, MARKER_DURATION_MS);
  } else {
    // Animate: trigger fade-out, then remove after transition
    requestAnimationFrame(() => {
      marker.style.opacity = "0";
      marker.style.transform = "scale(1.5)";
    });
    setTimeout(() => {
      marker.remove();
    }, MARKER_DURATION_MS + 50);
  }
}

// -----------------------------------------------------------------------
// Wait for element to appear (with timeout)
// -----------------------------------------------------------------------

const WAIT_TIMEOUT_MS = 3000;
const WAIT_POLL_MS = 100;

/** Poll until the topic element appears, or timeout. */
export async function waitForElement(
  root: Document | Element,
  candidates: Set<string>,
): Promise<Element | null> {
  return new Promise<Element | null>((resolve) => {
    const el = findTopicElement(root, candidates);
    if (el !== null) {
      resolve(el);
      return;
    }

    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += WAIT_POLL_MS;
      const found = findTopicElement(root, candidates);
      if (found !== null) {
        clearInterval(timer);
        resolve(found);
        return;
      }
      if (elapsed >= WAIT_TIMEOUT_MS) {
        clearInterval(timer);
        resolve(null);
      }
    }, WAIT_POLL_MS);
  });
}
