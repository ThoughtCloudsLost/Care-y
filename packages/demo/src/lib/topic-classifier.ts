/**
 * Pure classifier: maps an aria-label string from a phone-document
 * element to a DemoTopic by matching against paraglide message
 * outputs across all available locales.
 *
 * Called at event time so a locale switch mid-session does not
 * break classification. Never bakes label strings at module init.
 */

import * as m from "$lib/paraglide/messages.js";
import { locales } from "$lib/paraglide/runtime.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import type { DemoTopic } from "./bridge.js";

export interface ClassifierContext {
  /** True when the phone is displaying a ticket detail view. */
  readonly inDetail: boolean;
}

/**
 * Classify an aria-label string to a DemoTopic. Returns null if the
 * label does not match any known topic.
 *
 * Matches are tested against all configured locales so that a stale
 * DOM label (rendered before a locale switch) still classifies.
 */
export function classifyDemoLabel(
  label: string,
  ctx: ClassifierContext,
): DemoTopic | null {
  // Build match sets for all locales at call time
  for (const locale of locales) {
    const opts = { locale };
    const terms = withTerms();

    // --- sort ---
    if (label === m.tickets_sort({}, opts)) {
      return "sort";
    }

    // --- filters vs thread-filters ---
    // The FilterPillBar toolbar label is shared between list and detail.
    // ctx.inDetail disambiguates.
    if (label === m.tickets_filter(terms, opts)) {
      return ctx.inDetail ? "thread-filters" : "filters";
    }
    // List filter pill popovers (only fires on list)
    if (
      !ctx.inDetail &&
      (label === m.tickets_filter_status({}, opts) ||
        label === m.tickets_filter_queue(terms, opts) ||
        label === m.tickets_filter_priority({}, opts) ||
        label === m.tickets_filter_assignee({}, opts) ||
        label === m.tickets_filter_date_range({}, opts) ||
        label === m.tickets_create_shortcut({}, opts))
    ) {
      return "filters";
    }
    // Detail thread filter pill labels
    if (
      ctx.inDetail &&
      (label === m.ticket_filter_type({}, opts) ||
        label === m.ticket_filter_author({}, opts) ||
        label === m.ticket_filter_date({}, opts))
    ) {
      return "thread-filters";
    }

    // --- view-modes ---
    if (
      label === m.view_switcher_label({}, opts) ||
      label === m.view_switcher_table({}, opts) ||
      label === m.view_switcher_rows({}, opts) ||
      label === m.view_switcher_cards({}, opts) ||
      label === m.view_switcher_grid({}, opts) ||
      label === m.view_switcher_kanban({}, opts)
    ) {
      return "view-modes";
    }

    // --- select-mode ---
    if (
      label === m.tickets_select_mode({}, opts) ||
      label === m.ticket_select_mode({}, opts)
    ) {
      return "select-mode";
    }

    // --- new-ticket ---
    if (label === m.nav_new_ticket(terms, opts)) {
      return "new-ticket";
    }

    // --- compose-actions ---
    if (label === m.ticket_compose_actions({}, opts)) {
      return "compose-actions";
    }

    // --- reply ---
    if (
      label === m.ticket_send({}, opts) ||
      label === m.ticket_sms_send({}, opts)
    ) {
      return "reply";
    }

    // --- notes ---
    if (
      label === m.ticket_add_internal_note({}, opts) ||
      label === m.ticket_edit_note({}, opts) ||
      label === m.ticket_save_note({}, opts)
    ) {
      return "notes";
    }

    // --- case-fold ---
    if (
      label === m.ticket_case_details(terms, opts) ||
      label === m.ticket_fold_case_details(terms, opts)
    ) {
      return "case-fold";
    }

    // --- language ---
    if (label === m.language_picker_label({}, opts)) {
      return "language";
    }
  }

  return null;
}
